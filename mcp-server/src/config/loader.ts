/**
 * @module ConfigLoader
 * @description Loads and manages project configuration from .simone/project.yaml files.
 * Provides configuration validation and context resolution.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import type { ProjectConfig, ResolvedContext } from './types.js';
import { logError } from '../utils/logger.js';

type FileReader = (path: string, encoding: 'utf8') => string;

export class ConfigLoader {
  private config: ProjectConfig | null = null;
  private projectPath: string;
  private configPath: string;
  private readFile: FileReader;

  constructor(projectPath: string, readFile: FileReader = readFileSync) {
    this.projectPath = projectPath;
    this.configPath = join(projectPath, '.simone', 'project.yaml');
    this.readFile = readFile;
  }

  /**
   * Load project configuration from .simone/project.yaml
   */
  load(): ProjectConfig | null {
    if (!existsSync(this.configPath)) {
      // No configuration is not an error - just use defaults
      return this.getDefaultConfig();
    }

    try {
      const content = this.readFile(this.configPath, 'utf8');
      const rawConfig = yaml.load(content) as any;
      
      // Validate and normalize config
      this.config = this.validateConfig(rawConfig);
      return this.config;
    } catch (error) {
      void logError(new Error(`Failed to load configuration from ${this.configPath}: ${error}`));
      return this.getDefaultConfig();
    }
  }

  /**
   * Get the current configuration
   */
  getConfig(): ProjectConfig | null {
    if (!this.config) {
      this.load();
    }
    return this.config;
  }

  /**
   * Get contexts with resolved configuration (merged with shared)
   */
  getResolvedContexts(): ResolvedContext[] {
    const config = this.getConfig();
    if (!config) return [];

    return config.contexts.map(context => {
      const resolved: ResolvedContext = { ...context };
      
      // Merge shared tooling with context tooling
      if (config.shared?.tooling || context.tooling) {
        resolved.resolvedTooling = {
          ...config.shared?.tooling,
          ...context.tooling
        };
      }
      
      // Merge shared methodology with context methodology
      if (config.shared?.methodology || context.methodology) {
        resolved.resolvedMethodology = {
          ...config.shared?.methodology,
          ...context.methodology
        };
      }

      return resolved;
    });
  }

  /**
   * Validate configuration structure
   */
  private validateConfig(raw: any): ProjectConfig {
    // Ensure required fields
    if (!raw.project?.name) {
      throw new Error('Configuration missing required field: project.name');
    }

    // Ensure contexts is an array
    if (!Array.isArray(raw.contexts)) {
      throw new Error('Configuration missing required field: contexts (must be an array)');
    }

    // Validate each context
    raw.contexts.forEach((context: any, index: number) => {
      if (!context.name) {
        throw new Error(`Context at index ${index} missing required field: name`);
      }
      if (!context.path) {
        throw new Error(`Context '${context.name}' missing required field: path`);
      }
    });

    return raw as ProjectConfig;
  }

  /**
   * Get default configuration for projects without config
   */
  private getDefaultConfig(): ProjectConfig {
    const projectName = this.projectPath.split('/').pop() || 'unnamed-project';
    
    return {
      project: {
        name: projectName,
        type: 'single'
      },
      contexts: [
        {
          name: 'main',
          path: './',
          stack: {
            language: 'unknown'
          },
          tooling: {}
        }
      ]
    };
  }

  /**
   * Check if a feature is enabled in any context
   */
  isFeatureEnabled(featurePath: string): boolean {
    const contexts = this.getResolvedContexts();
    
    for (const context of contexts) {
      const value = this.getFeatureValue(context, featurePath);
      if (value?.enabled === true) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get feature configuration from a context
   */
  private getFeatureValue(context: ResolvedContext, path: string): any {
    const parts = path.split('.');
    let current: any = context;
    
    // Use resolved values if available
    if (parts[0] === 'tooling' && context.resolvedTooling) {
      current = { tooling: context.resolvedTooling };
    } else if (parts[0] === 'methodology' && context.resolvedMethodology) {
      current = { methodology: context.resolvedMethodology };
    }
    
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return null;
      }
    }
    
    return current;
  }
}