/**
 * @module TemplateLoader
 * @description Handles loading YAML prompt templates and Handlebars partials.
 * Supports hot-reloading with timestamp-based cache invalidation.
 */

import { readFile, stat } from 'fs/promises';
import { join, dirname } from 'path';
import yaml from 'js-yaml';
import Handlebars from 'handlebars';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import type { PromptTemplate } from '../types/index.js';
import { logError } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CachedPrompt {
  template: PromptTemplate;
  path: string;
  mtime: number;
}

interface CachedPartial {
  content: string;
  path: string;
  mtime: number;
}

export class TemplateLoader {
  private projectPath: string;
  private cache = new Map<string, CachedPrompt>();
  private partialCache = new Map<string, CachedPartial>();
  private compiledTemplates = new Map<string, HandlebarsTemplateDelegate>();
  private lastPartialCheck = 0;
  private partialCheckInterval = 1000; // Check partials at most once per second

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  clearCache(): void {
    // Clear all caches to ensure fresh data
    this.cache.clear();
    this.compiledTemplates.clear();
    // Don't clear partialCache as partials have their own change detection
  }

  private async loadPartials(): Promise<void> {
    // Rate limit partial checking to avoid excessive file system operations
    const now = Date.now();
    if (now - this.lastPartialCheck < this.partialCheckInterval) {
      return;
    }
    this.lastPartialCheck = now;
    
    let anyPartialChanged = false;
    
    // Helper to load partials from a directory
    const loadPartialsFromDir = async (dir: string, isProjectDir: boolean) => {
      try {
        const { readdir } = await import('fs/promises');
        const files = await readdir(dir);
        
        for (const file of files) {
          if (file.endsWith('.hbs') || file.endsWith('.handlebars')) {
            const partialName = file.replace(/\.(hbs|handlebars)$/, '');
            const partialPath = join(dir, file);
            const cacheKey = isProjectDir ? `project:${partialName}` : `builtin:${partialName}`;
            
            try {
              const stats = await stat(partialPath);
              const cached = this.partialCache.get(cacheKey);
              
              // Check if partial has changed
              if (cached && cached.mtime === stats.mtimeMs) {
                continue; // No change, skip
              }
              
              // Load and register the partial
              const content = await readFile(partialPath, 'utf-8');
              Handlebars.registerPartial(partialName, content);
              
              // Update cache
              this.partialCache.set(cacheKey, {
                content,
                path: partialPath,
                mtime: stats.mtimeMs
              });
              
              anyPartialChanged = true;
            } catch (error) {
              await logError(new Error(`Failed to load partial '${partialName}': ${error}`));
            }
          }
        }
      } catch {
        // Directory doesn't exist, skip
      }
    };
    
    // Load project partials first (they override built-in ones)
    const projectPartialsDir = join(this.projectPath, '.simone', 'prompts', 'partials');
    await loadPartialsFromDir(projectPartialsDir, true);
    
    // Then load built-in partials
    const builtInPartialsDir = join(__dirname, 'prompts', 'partials');
    await loadPartialsFromDir(builtInPartialsDir, false);
    
    // If any partial changed, clear all compiled templates
    // (because we don't know which templates use which partials)
    if (anyPartialChanged) {
      this.compiledTemplates.clear();
    }
  }

  async loadPrompt(name: string): Promise<PromptTemplate | null> {
    // Try project prompts first
    const projectPromptPath = join(this.projectPath, '.simone', 'prompts', `${name}.yaml`);
    
    // Check if we have a cached version and if it's still valid
    const cached = this.cache.get(name);
    if (cached) {
      try {
        const stats = await stat(cached.path);
        // If file hasn't been modified, return cached version
        if (stats.mtimeMs === cached.mtime) {
          return cached.template;
        }
        // File has been modified, clear compiled template cache too
        this.compiledTemplates.delete(cached.template.template);
      } catch {
        // File might have been deleted, continue to reload
      }
    }

    if (existsSync(projectPromptPath)) {
      try {
        const content = await readFile(projectPromptPath, 'utf-8');
        const prompt = yaml.load(content) as PromptTemplate;
        const stats = await stat(projectPromptPath);
        
        // Cache with modification time
        this.cache.set(name, {
          template: prompt,
          path: projectPromptPath,
          mtime: stats.mtimeMs
        });
        
        return prompt;
      } catch (error) {
        // Return error prompt for YAML parsing errors
        return this.createErrorPrompt(`Failed to parse prompt '${name}': ${error}`);
      }
    }

    // Fall back to built-in prompts
    // In the bundled version, prompts are at the same level as index.js
    const builtInPath = join(__dirname, 'prompts', `${name}.yaml`);
    if (existsSync(builtInPath)) {
      try {
        const content = await readFile(builtInPath, 'utf-8');
        const prompt = yaml.load(content) as PromptTemplate;
        const stats = await stat(builtInPath);
        
        // Cache with modification time
        this.cache.set(name, {
          template: prompt,
          path: builtInPath,
          mtime: stats.mtimeMs
        });
        
        return prompt;
      } catch (error) {
        return this.createErrorPrompt(`Failed to parse built-in prompt '${name}': ${error}`);
      }
    }

    return null;
  }

  async compileTemplate(template: string): Promise<HandlebarsTemplateDelegate> {
    // Ensure partials are loaded before compiling
    await this.loadPartials();
    
    const cacheKey = template;
    if (this.compiledTemplates.has(cacheKey)) {
      return this.compiledTemplates.get(cacheKey)!;
    }

    try {
      const compiled = Handlebars.compile(template);
      this.compiledTemplates.set(cacheKey, compiled);
      return compiled;
    } catch (_error) {
      // Return error template if compilation fails
      const errorTemplate = Handlebars.compile(
        'Tell the user an error happened and show these error details <error_message>Template compilation error: {{error}}</error_message>'
      );
      return errorTemplate;
    }
  }

  async loadPartial(name: string): Promise<string | null> {
    // Try project partial first
    const projectPartialPath = join(this.projectPath, '.simone', 'prompts', 'partials', `${name}.hbs`);
    
    if (existsSync(projectPartialPath)) {
      try {
        return await readFile(projectPartialPath, 'utf-8');
      } catch (error) {
        void logError(`Failed to load project partial ${name}: ${error}`);
      }
    }
    
    // Fall back to built-in partial
    const builtInPartialPath = join(__dirname, 'prompts', 'partials', `${name}.hbs`);
    
    if (existsSync(builtInPartialPath)) {
      try {
        return await readFile(builtInPartialPath, 'utf-8');
      } catch (error) {
        void logError(`Failed to load built-in partial ${name}: ${error}`);
      }
    }
    
    return null;
  }

  private createErrorPrompt(error: string): PromptTemplate {
    return {
      name: 'error',
      description: 'Error prompt',
      template: `Tell the user an error happened and show these error details <error_message>${error}</error_message>`,
    };
  }
}