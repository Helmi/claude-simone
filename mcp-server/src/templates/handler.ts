/**
 * @module PromptHandler
 * @description Main interface for handling prompt template requests in the MCP server.
 * Manages template loading, context building, and rendering with Handlebars.
 */

import type { PromptMessage } from '@modelcontextprotocol/sdk/types.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { TemplateLoader } from './loader.js';
import { buildTemplateContext } from './context.js';
import { registerHelpers } from './helpers/index.js';
import { ConfigLoader } from '../config/index.js';
import type { PromptTemplate } from '../types/index.js';

/**
 * Handles prompt template loading and rendering for the MCP server
 */
export class PromptHandler {
  private loader: TemplateLoader;
  private configLoader: ConfigLoader;
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.loader = new TemplateLoader(projectPath);
    this.configLoader = new ConfigLoader(projectPath);
    
    // Register all custom Handlebars helpers
    registerHelpers();
  }

  async getPromptMessages(name: string, args: Record<string, any> = {}): Promise<PromptMessage[]> {
    // Load the prompt template
    const prompt = await this.loader.loadPrompt(name);
    
    if (!prompt) {
      // Prompt not found
      return [{
        role: 'user',
        content: {
          type: 'text',
          text: `Tell the user an error happened and show these error details <error_message>Prompt '${name}' not found</error_message>`,
        },
      }];
    }

    // Build template context
    const context = buildTemplateContext(this.projectPath, args);
    
    // Add project configuration to context
    const projectConfig = this.configLoader.getConfig();
    if (projectConfig) {
      context['project'] = projectConfig.project;
      context['contexts'] = projectConfig.contexts;
      context['shared'] = projectConfig.shared;
      context['github'] = projectConfig.github;
      context['features'] = projectConfig.features;
    }

    // Add extended project context
    const projectContext = {
      hasReadme: existsSync(join(this.projectPath, 'README.md')),
      hasPackageJson: existsSync(join(this.projectPath, 'package.json')),
      hasGitignore: existsSync(join(this.projectPath, '.gitignore')),
      hasSrcDir: existsSync(join(this.projectPath, 'src')),
      hasTestDir: existsSync(join(this.projectPath, 'test')) || 
                  existsSync(join(this.projectPath, 'tests')),
    };
    
    context['projectContext'] = projectContext;

    // Auto-load constitution if it exists
    const constitutionPath = join(this.projectPath, '.simone', 'constitution.md');
    if (existsSync(constitutionPath)) {
      try {
        const constitutionContent = await readFile(constitutionPath, 'utf8');
        context['constitution'] = constitutionContent;
      } catch (error) {
        // Return error to LLM if we can't read the constitution
        return [{
          role: 'user',
          content: {
            type: 'text',
            text: `Tell the user an error happened and show these error details <error_message>Failed to read constitution.md: ${error}</error_message>. Tell them to check if the file exists at .simone/constitution.md and has proper read permissions.`,
          },
        }];
      }
    }

    // Apply defaults for missing arguments
    if (prompt.arguments) {
      for (const arg of prompt.arguments) {
        if (!(arg.name in context) && arg.default) {
          // Compile and evaluate default value
          const defaultTemplate = await this.loader.compileTemplate(arg.default);
          context[arg.name] = defaultTemplate(context);
        }
      }
    }

    // Compile and render the template
    try {
      // First, render the header_include partial if it exists
      let header = '';
      try {
        const headerPartial = await this.loader.loadPartial('header_include');
        if (headerPartial) {
          const compiledHeader = await this.loader.compileTemplate(headerPartial);
          header = compiledHeader(context);
        }
      } catch (headerError) {
        // Header partial is optional, so we can continue without it
      }
      
      // Then render the main template
      const compiledTemplate = await this.loader.compileTemplate(prompt.template);
      const mainContent = compiledTemplate(context);
      
      // Combine header and main content
      const renderedText = header ? `${header}\n${mainContent}` : mainContent;

      return [{
        role: 'user',
        content: {
          type: 'text',
          text: renderedText,
        },
      }];
    } catch (error) {
      return [{
        role: 'user',
        content: {
          type: 'text',
          text: `Tell the user an error happened and show these error details <error_message>Template rendering error: ${error}</error_message>`,
        },
      }];
    }
  }

  clearCache(): void {
    this.loader.clearCache();
  }

  async listAvailablePrompts(): Promise<PromptTemplate[]> {
    const prompts: PromptTemplate[] = [];
    const seen = new Set<string>();

    // Helper to scan a directory for YAML files
    const scanDirectory = async (dir: string) => {
      const { readdir } = await import('fs/promises');
      try {
        const files = await readdir(dir);
        for (const file of files) {
          if (file.endsWith('.yaml') || file.endsWith('.yml')) {
            const name = file.replace(/\.(yaml|yml)$/, '');
            if (!seen.has(name)) {
              seen.add(name);
              const prompt = await this.loader.loadPrompt(name);
              if (prompt && prompt.name !== 'error') {
                prompts.push(prompt);
              }
            }
          }
        }
      } catch (error) {
        // Directory doesn't exist or can't be read
      }
    };

    // Scan project prompts first (they take precedence)
    const projectPromptsDir = join(this.projectPath, '.simone', 'prompts');
    await scanDirectory(projectPromptsDir);

    // Then scan built-in prompts
    // In the bundled version, everything is in dist/index.js, so prompts are at dist/prompts
    const builtInDir = join(dirname(fileURLToPath(import.meta.url)), 'prompts');
    await scanDirectory(builtInDir);

    return prompts;
  }
}