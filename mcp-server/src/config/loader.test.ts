import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as yaml from 'js-yaml';
import { mockConsoleLog } from '../__tests__/utils/index.js';

// Mock fs before importing ConfigLoader
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

// Import after mocking
import { ConfigLoader } from './loader.js';
import * as fs from 'fs';

// Mock logger
vi.mock('../utils/logger.js', () => ({
  logError: vi.fn(),
}));

describe('ConfigLoader', () => {
  mockConsoleLog();

  const mockProjectPath = '/test/project';
  const mockConfigPath = '/test/project/.simone/project.yaml';
  const mockReadFile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with project path', () => {
      const loader = new ConfigLoader(mockProjectPath, mockReadFile);
      expect(loader).toBeDefined();
    });
  });

  describe('load()', () => {
    it('should return default config when file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      
      const loader = new ConfigLoader(mockProjectPath, mockReadFile);
      const config = loader.load();
      
      expect(config).toBeDefined();
      expect(config?.project.name).toBe('project');
      expect(config?.contexts).toHaveLength(1);
      expect(config?.contexts[0].name).toBe('main');
      expect(config?.features?.workflow?.autoCommit).toBe(true);
    });

    it('should load valid YAML configuration', () => {
      const mockConfig = {
        project: {
          name: 'test-project',
          type: 'monorepo'
        },
        contexts: [
          {
            name: 'backend',
            path: './backend',
            stack: { language: 'typescript' }
          }
        ]
      };
      
      vi.mocked(fs.existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(mockConfig));
      
      const loader = new ConfigLoader(mockProjectPath, mockReadFile);
      const config = loader.load();
      
      expect(fs.existsSync).toHaveBeenCalledWith(mockConfigPath);
      expect(mockReadFile).toHaveBeenCalledWith(mockConfigPath, 'utf8');
      expect(config).toEqual({
        ...mockConfig,
        features: {
          workflow: {
            autoCommit: true
          }
        }
      });
    });

    it('should allow overriding autoCommit default', () => {
      const mockConfig = {
        project: { name: 'test-project', type: 'monorepo' },
        contexts: [
          {
            name: 'main',
            path: './',
            stack: { language: 'typescript' }
          }
        ],
        features: {
          workflow: {
            autoCommit: false
          }
        }
      };
      
      vi.mocked(fs.existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(mockConfig));
      
      const loader = new ConfigLoader(mockProjectPath, mockReadFile);
      const config = loader.load();
      
      expect(config).toEqual(mockConfig);
      expect(config?.features?.workflow?.autoCommit).toBe(false);
    });

    it('should handle invalid YAML gracefully', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue('invalid: yaml: content:');
      
      const loader = new ConfigLoader(mockProjectPath, mockReadFile);
      const config = loader.load();
      
      expect(config).toBeDefined();
      expect(config?.project.name).toBe('project'); // default config
    });

    it('should validate required fields', () => {
      const invalidConfig = {
        contexts: [
          { name: 'test', path: './test' }
        ]
        // missing project.name
      };
      
      vi.mocked(fs.existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(invalidConfig));
      
      const loader = new ConfigLoader(mockProjectPath, mockReadFile);
      const config = loader.load();
      
      expect(config?.project.name).toBe('project'); // default config
    });

    it('should validate contexts array', () => {
      const invalidConfig = {
        project: { name: 'test' },
        contexts: 'not-an-array'
      };
      
      vi.mocked(fs.existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(invalidConfig));
      
      const loader = new ConfigLoader(mockProjectPath, mockReadFile);
      const config = loader.load();
      
      expect(config?.contexts).toBeInstanceOf(Array);
    });

    it('should validate context required fields', () => {
      const invalidConfig = {
        project: { name: 'test' },
        contexts: [
          { name: 'test' } // missing path
        ]
      };
      
      vi.mocked(fs.existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(invalidConfig));
      
      const loader = new ConfigLoader(mockProjectPath, mockReadFile);
      const config = loader.load();
      
      expect(config?.contexts[0].path).toBeDefined();
    });
  });

  describe('getConfig()', () => {
    it('should lazy load configuration and cache it', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      
      const loader = new ConfigLoader(mockProjectPath, mockReadFile);
      
      // First call should trigger load
      const config1 = loader.getConfig();
      expect(config1).toBeDefined();
      
      // Second call should return same cached config
      const config2 = loader.getConfig();
      expect(config2).toBe(config1); // Same reference means it's cached
    });
  });

  describe('getResolvedContexts()', () => {
    it('should merge shared tooling with context tooling', () => {
      const mockConfig = {
        project: { name: 'test' },
        shared: {
          tooling: {
            linter: { enabled: true, command: 'eslint' },
            formatter: { enabled: true }
          }
        },
        contexts: [
          {
            name: 'backend',
            path: './backend',
            tooling: {
              linter: { command: 'custom-lint' }, // override
              test: { enabled: true }
            }
          }
        ]
      };
      
      vi.mocked(fs.existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(mockConfig));
      
      const loader = new ConfigLoader(mockProjectPath, mockReadFile);
      loader.load(); // Need to load first
      const contexts = loader.getResolvedContexts();
      
      expect(contexts).toHaveLength(1);
      expect(contexts[0].resolvedTooling).toEqual({
        linter: { command: 'custom-lint' }, // context overrides shared
        formatter: { enabled: true }, // from shared
        test: { enabled: true } // from context
      });
    });

    it('should merge shared methodology with context methodology', () => {
      const mockConfig = {
        project: { name: 'test' },
        shared: {
          methodology: {
            testing: { strategy: 'tdd' },
            documentation: { style: 'jsdoc' }
          }
        },
        contexts: [
          {
            name: 'backend',
            path: './backend',
            methodology: {
              testing: { strategy: 'bdd' }, // override
              deployment: { strategy: 'continuous' }
            }
          }
        ]
      };
      
      vi.mocked(fs.existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(mockConfig));
      
      const loader = new ConfigLoader(mockProjectPath, mockReadFile);
      loader.load(); // Need to load first
      const contexts = loader.getResolvedContexts();
      
      expect(contexts[0].resolvedMethodology).toEqual({
        testing: { strategy: 'bdd' }, // context overrides shared
        documentation: { style: 'jsdoc' }, // from shared
        deployment: { strategy: 'continuous' } // from context
      });
    });

    it('should handle contexts without shared config', () => {
      const mockConfig = {
        project: { name: 'test' },
        contexts: [
          {
            name: 'backend',
            path: './backend'
          }
        ]
      };
      
      vi.mocked(fs.existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(mockConfig));
      
      const loader = new ConfigLoader(mockProjectPath, mockReadFile);
      loader.load(); // Need to load first
      const contexts = loader.getResolvedContexts();
      
      expect(contexts).toHaveLength(1);
      expect(contexts[0].resolvedTooling).toBeUndefined();
      expect(contexts[0].resolvedMethodology).toBeUndefined();
    });
  });

  describe('isFeatureEnabled()', () => {
    it('should check if feature is enabled in any context', () => {
      const mockConfig = {
        project: { name: 'test' },
        contexts: [
          {
            name: 'backend',
            path: './backend',
            tooling: {
              linter: { enabled: false }
            }
          },
          {
            name: 'frontend',
            path: './frontend',
            tooling: {
              linter: { enabled: true }
            }
          }
        ]
      };
      
      vi.mocked(fs.existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(mockConfig));
      
      const loader = new ConfigLoader(mockProjectPath, mockReadFile);
      loader.load(); // Need to load first
      
      expect(loader.isFeatureEnabled('tooling.linter')).toBe(true);
      expect(loader.isFeatureEnabled('tooling.formatter')).toBe(false);
    });

    it('should use resolved tooling when checking features', () => {
      const mockConfig = {
        project: { name: 'test' },
        shared: {
          tooling: {
            linter: { enabled: true }
          }
        },
        contexts: [
          {
            name: 'backend',
            path: './backend'
          }
        ]
      };
      
      vi.mocked(fs.existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(mockConfig));
      
      const loader = new ConfigLoader(mockProjectPath, mockReadFile);
      loader.load(); // Need to load first
      
      expect(loader.isFeatureEnabled('tooling.linter')).toBe(true);
    });

    it('should handle nested feature paths', () => {
      const mockConfig = {
        project: { name: 'test' },
        contexts: [
          {
            name: 'backend',
            path: './backend',
            methodology: {
              testing: {
                coverage: {
                  enabled: true,
                  threshold: 80
                }
              }
            }
          }
        ]
      };
      
      vi.mocked(fs.existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(mockConfig));
      
      const loader = new ConfigLoader(mockProjectPath, mockReadFile);
      loader.load(); // Need to load first
      
      expect(loader.isFeatureEnabled('methodology.testing.coverage')).toBe(true);
    });

    it('should return false for non-existent features', () => {
      const mockConfig = {
        project: { name: 'test' },
        contexts: [
          {
            name: 'backend',
            path: './backend'
          }
        ]
      };
      
      vi.mocked(fs.existsSync).mockReturnValue(true);
      mockReadFile.mockReturnValue(yaml.dump(mockConfig));
      
      const loader = new ConfigLoader(mockProjectPath, mockReadFile);
      loader.load(); // Need to load first
      
      expect(loader.isFeatureEnabled('tooling.nonexistent.feature')).toBe(false);
    });
  });
});