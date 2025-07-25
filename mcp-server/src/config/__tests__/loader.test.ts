import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigLoader } from '../loader.js';
import { ProjectConfig } from '../types.js';
import yaml from 'js-yaml';
import { existsSync } from 'fs';

// Mock dependencies
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn()
}));

vi.mock('../utils/logger.js', () => ({
  logError: vi.fn()
}));

describe('ConfigLoader', () => {
  let configLoader: ConfigLoader;
  let mockReadFile: ReturnType<typeof vi.fn>;
  const testProjectPath = '/test/project';
  const expectedConfigPath = '/test/project/.simone/project.yaml';

  beforeEach(() => {
    vi.clearAllMocks();
    mockReadFile = vi.fn();
    configLoader = new ConfigLoader(testProjectPath, mockReadFile);
  });

  describe('load', () => {
    it('should return default config when config file does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const config = configLoader.load();

      expect(config).toEqual({
        project: {
          name: 'project',
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
      });
      expect(mockReadFile).not.toHaveBeenCalled();
    });

    it('should load and validate valid configuration', () => {
      const validConfig: ProjectConfig = {
        project: {
          name: 'test-project',
          description: 'A test project',
          type: 'monorepo',
          version: '1.0.0'
        },
        contexts: [
          {
            name: 'backend',
            path: './backend',
            stack: {
              language: 'TypeScript',
              framework: {
                enabled: true,
                name: 'Express'
              }
            }
          },
          {
            name: 'frontend',
            path: './frontend',
            stack: {
              language: 'TypeScript',
              framework: {
                enabled: true,
                name: 'React'
              }
            }
          }
        ]
      };

      vi.mocked(existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(validConfig));

      const config = configLoader.load();

      expect(config).toEqual(validConfig);
      expect(mockReadFile).toHaveBeenCalledWith(expectedConfigPath, 'utf8');
    });

    it('should throw error for missing project.name', () => {
      const invalidConfig = {
        project: {
          description: 'Missing name'
        },
        contexts: []
      };

      vi.mocked(existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(invalidConfig));

      const config = configLoader.load();
      
      // Should return default config on validation error
      expect(config).toMatchObject({
        project: {
          name: 'project',
          type: 'single'
        }
      });
    });

    it('should throw error for missing contexts array', () => {
      const invalidConfig = {
        project: {
          name: 'test-project'
        }
      };

      vi.mocked(existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(invalidConfig));

      const config = configLoader.load();
      
      // Should return default config on validation error
      expect(config).toMatchObject({
        project: {
          name: 'project',
          type: 'single'
        }
      });
    });

    it('should validate context required fields', () => {
      const invalidConfig = {
        project: {
          name: 'test-project'
        },
        contexts: [
          {
            path: './src' // Missing name
          }
        ]
      };

      vi.mocked(existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(invalidConfig));

      const config = configLoader.load();
      
      // Should return default config on validation error
      expect(config).toMatchObject({
        project: {
          name: 'project',
          type: 'single'
        }
      });
    });

    it('should handle YAML parsing errors gracefully', () => {
      const invalidYaml = `
project:
  name: test
  [invalid yaml
contexts:
  - name: main
`;

      vi.mocked(existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(invalidYaml);

      const config = configLoader.load();
      
      // Should return default config on error
      expect(config).toMatchObject({
        project: {
          name: 'project',
          type: 'single'
        }
      });
    });

    it('should handle file read errors gracefully', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      mockReadFile.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const config = configLoader.load();
      
      // Should return default config on error
      expect(config).toMatchObject({
        project: {
          name: 'project',
          type: 'single'
        }
      });
    });
  });

  describe('getConfig', () => {
    it('should lazy load configuration on first access', () => {
      const validConfig: ProjectConfig = {
        project: {
          name: 'test-project'
        },
        contexts: [
          {
            name: 'main',
            path: './'
          }
        ]
      };

      vi.mocked(existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(validConfig));

      // First call should trigger load
      const config1 = configLoader.getConfig();
      expect(mockReadFile).toHaveBeenCalledTimes(1);

      // Second call should use cached value
      const config2 = configLoader.getConfig();
      expect(mockReadFile).toHaveBeenCalledTimes(1); // Still only 1 call
      expect(config1).toBe(config2);
    });
  });

  describe('getResolvedContexts', () => {
    it('should merge shared tooling with context tooling', () => {
      const config: ProjectConfig = {
        project: {
          name: 'test-project'
        },
        shared: {
          tooling: {
            lint: {
              enabled: true,
              command: 'eslint .'
            },
            format: {
              enabled: true,
              command: 'prettier --write .'
            }
          }
        },
        contexts: [
          {
            name: 'backend',
            path: './backend',
            tooling: {
              lint: {
                enabled: true,
                command: 'eslint src/', // Override
                autofix: 'eslint src/ --fix'
              },
              test: {
                enabled: true,
                command: 'jest'
              }
            }
          }
        ]
      };

      vi.mocked(existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(config));
      configLoader.load();

      const contexts = configLoader.getResolvedContexts();

      expect(contexts[0].resolvedTooling).toEqual({
        format: {
          enabled: true,
          command: 'prettier --write .'
        },
        lint: {
          enabled: true,
          command: 'eslint src/',
          autofix: 'eslint src/ --fix'
        },
        test: {
          enabled: true,
          command: 'jest'
        }
      });
    });

    it('should merge shared methodology with context methodology', () => {
      const config: ProjectConfig = {
        project: {
          name: 'test-project'
        },
        shared: {
          methodology: {
            development: 'tdd',
            workflow: 'gitflow'
          }
        },
        contexts: [
          {
            name: 'microservice',
            path: './service',
            methodology: {
              architecture: 'microservices',
              workflow: 'trunk-based' // Override
            }
          }
        ]
      };

      vi.mocked(existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(config));
      configLoader.load();

      const contexts = configLoader.getResolvedContexts();

      expect(contexts[0].resolvedMethodology).toEqual({
        development: 'tdd',
        workflow: 'trunk-based',
        architecture: 'microservices'
      });
    });

    it('should handle contexts without shared config', () => {
      const config: ProjectConfig = {
        project: {
          name: 'test-project'
        },
        contexts: [
          {
            name: 'simple',
            path: './',
            tooling: {
              lint: {
                enabled: true,
                command: 'eslint .'
              }
            }
          }
        ]
      };

      vi.mocked(existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(config));
      configLoader.load();

      const contexts = configLoader.getResolvedContexts();

      expect(contexts[0].resolvedTooling).toEqual({
        lint: {
          enabled: true,
          command: 'eslint .'
        }
      });
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return true when feature is enabled in any context', () => {
      const config: ProjectConfig = {
        project: {
          name: 'test-project'
        },
        contexts: [
          {
            name: 'context1',
            path: './c1',
            tooling: {
              lint: {
                enabled: false
              }
            }
          },
          {
            name: 'context2',
            path: './c2',
            tooling: {
              lint: {
                enabled: true
              }
            }
          }
        ]
      };

      vi.mocked(existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(config));
      configLoader.load();

      expect(configLoader.isFeatureEnabled('tooling.lint')).toBe(true);
    });

    it('should return false when feature is disabled in all contexts', () => {
      const config: ProjectConfig = {
        project: {
          name: 'test-project'
        },
        contexts: [
          {
            name: 'context1',
            path: './c1',
            tooling: {
              lint: {
                enabled: false
              }
            }
          },
          {
            name: 'context2',
            path: './c2',
            tooling: {
              lint: {
                enabled: false
              }
            }
          }
        ]
      };

      vi.mocked(existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(config));
      configLoader.load();

      expect(configLoader.isFeatureEnabled('tooling.lint')).toBe(false);
    });

    it('should handle nested feature paths', () => {
      const config: ProjectConfig = {
        project: {
          name: 'test-project'
        },
        contexts: [
          {
            name: 'main',
            path: './',
            stack: {
              framework: {
                enabled: true,
                name: 'Express'
              }
            }
          }
        ]
      };

      vi.mocked(existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(config));
      configLoader.load();

      expect(configLoader.isFeatureEnabled('stack.framework')).toBe(true);
    });

    it('should use resolved values when checking shared config', () => {
      const config: ProjectConfig = {
        project: {
          name: 'test-project'
        },
        shared: {
          tooling: {
            test: {
              enabled: true
            }
          }
        },
        contexts: [
          {
            name: 'main',
            path: './'
          }
        ]
      };

      vi.mocked(existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(config));
      configLoader.load();

      expect(configLoader.isFeatureEnabled('tooling.test')).toBe(true);
    });

    it('should return false for non-existent feature paths', () => {
      const config: ProjectConfig = {
        project: {
          name: 'test-project'
        },
        contexts: [
          {
            name: 'main',
            path: './'
          }
        ]
      };

      vi.mocked(existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(config));
      configLoader.load();

      expect(configLoader.isFeatureEnabled('nonexistent.feature')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty project path gracefully', () => {
      const loader = new ConfigLoader('', mockReadFile);
      vi.mocked(existsSync).mockReturnValue(false);

      const config = loader.load();

      expect(config).toMatchObject({
        project: {
          name: 'unnamed-project'
        }
      });
    });

    it('should support custom properties in configuration', () => {
      const config: ProjectConfig = {
        project: {
          name: 'test-project',
          customField: 'custom value'
        } as any,
        contexts: [
          {
            name: 'main',
            path: './',
            customContext: {
              nested: 'value'
            }
          }
        ]
      };

      vi.mocked(existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(config));

      const loaded = configLoader.load();

      expect(loaded).toEqual(config);
    });
  });
});