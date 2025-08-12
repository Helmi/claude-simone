import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockConsoleLog } from '../__tests__/utils/index.js';
import { fixtures } from '../__tests__/fixtures/index.js';
import * as yaml from 'js-yaml';
import Handlebars from 'handlebars';

// Mock dependencies before importing the module under test
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  stat: vi.fn(),
  readdir: vi.fn(),
}));

vi.mock('fs', () => ({
  existsSync: vi.fn(),
}));

vi.mock('../utils/logger.js', () => ({
  logError: vi.fn(),
}));

// Import the module under test after setting up mocks
import { TemplateLoader } from './loader.js';
import * as fsPromises from 'fs/promises';
import * as fs from 'fs';

describe('TemplateLoader', () => {
  mockConsoleLog();

  let loader: TemplateLoader;
  const mockProjectPath = '/test/project';
  const projectPromptPath = '/test/project/.simone/prompts/test-prompt.yaml';
  const builtInPromptPath = expect.stringContaining('prompts/test-prompt.yaml');
  
  beforeEach(() => {
    vi.clearAllMocks();
    loader = new TemplateLoader(mockProjectPath);
    // Clear Handlebars partials registry
    Handlebars.partials = {};
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with project path', () => {
      expect(loader).toBeDefined();
    });
  });

  describe('clearCache()', () => {
    it('should clear all caches', async () => {
      // Setup: load a prompt to populate cache
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fsPromises.readFile).mockResolvedValue(fixtures.prompt.yaml);
      vi.mocked(fsPromises.stat).mockResolvedValue({
        mtimeMs: 1000,
        mtime: new Date(1000),
      } as any);

      await loader.loadPrompt('test-prompt');
      expect(fsPromises.readFile).toHaveBeenCalledTimes(1);
      
      // Clear cache
      loader.clearCache();
      
      // Load again - should read file again since cache was cleared
      await loader.loadPrompt('test-prompt');
      expect(fsPromises.readFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('loadPrompt()', () => {
    it('should load project prompt when it exists', async () => {
      vi.mocked(fs.existsSync).mockImplementation((path) => 
        path === projectPromptPath
      );
      vi.mocked(fsPromises.readFile).mockResolvedValue(fixtures.prompt.yaml);
      vi.mocked(fsPromises.stat).mockResolvedValue({
        mtimeMs: 1000,
        mtime: new Date(1000),
      } as any);

      const prompt = await loader.loadPrompt('test-prompt');
      
      expect(prompt).toBeDefined();
      expect(prompt?.name).toBe('test_prompt');
      expect(fsPromises.readFile).toHaveBeenCalledWith(projectPromptPath, 'utf-8');
    });

    it('should fall back to built-in prompt when project prompt does not exist', async () => {
      vi.mocked(fs.existsSync).mockImplementation((path) => 
        typeof path === 'string' && path.includes('templates/prompts/test-prompt.yaml')
      );
      vi.mocked(fsPromises.readFile).mockResolvedValue(fixtures.prompt.yaml);
      vi.mocked(fsPromises.stat).mockResolvedValue({
        mtimeMs: 1000,
        mtime: new Date(1000),
      } as any);

      const prompt = await loader.loadPrompt('test-prompt');
      
      expect(prompt).toBeDefined();
      expect(prompt?.name).toBe('test_prompt');
    });

    it('should return cached prompt when file has not changed', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fsPromises.readFile).mockResolvedValue(fixtures.prompt.yaml);
      vi.mocked(fsPromises.stat).mockResolvedValue({
        mtimeMs: 1000,
        mtime: new Date(1000),
      } as any);

      // First load
      const prompt1 = await loader.loadPrompt('test-prompt');
      expect(fsPromises.readFile).toHaveBeenCalledTimes(1);
      
      // Second load - should use cache
      const prompt2 = await loader.loadPrompt('test-prompt');
      
      expect(prompt2).toBe(prompt1); // Same reference
      expect(fsPromises.readFile).toHaveBeenCalledTimes(1); // Still only read once
    });

    it('should reload prompt when file has been modified', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fsPromises.readFile).mockResolvedValue(fixtures.prompt.yaml);
      
      // First load with mtime 1000
      vi.mocked(fsPromises.stat).mockResolvedValue({
        mtimeMs: 1000,
        mtime: new Date(1000),
      } as any);
      await loader.loadPrompt('test-prompt');
      
      // Second load with updated mtime
      vi.mocked(fsPromises.stat).mockResolvedValue({
        mtimeMs: 2000,
        mtime: new Date(2000),
      } as any);
      
      const updatedPrompt = yaml.dump({
        name: 'updated_prompt',
        description: 'Updated test prompt',
        template: 'Updated: {{testArg}}',
      });
      vi.mocked(fsPromises.readFile).mockResolvedValue(updatedPrompt);
      
      const prompt2 = await loader.loadPrompt('test-prompt');
      
      expect(prompt2?.name).toBe('updated_prompt');
      expect(fsPromises.readFile).toHaveBeenCalledTimes(2); // Read twice
    });

    it('should return error prompt for invalid YAML', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fsPromises.readFile).mockResolvedValue('invalid: yaml: content:');
      vi.mocked(fsPromises.stat).mockResolvedValue({
        mtimeMs: 1000,
        mtime: new Date(1000),
      } as any);

      const prompt = await loader.loadPrompt('test-prompt');
      
      expect(prompt?.name).toBe('error');
      expect(prompt?.template).toContain('Failed to parse prompt');
    });

    it('should return null when prompt does not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      
      const prompt = await loader.loadPrompt('non-existent');
      
      expect(prompt).toBeNull();
    });
  });

  describe('compileTemplate()', () => {
    beforeEach(() => {
      // Mock loadPartials to not actually load partials
      vi.mocked(fsPromises.readdir).mockResolvedValue([]);
    });

    it('should compile and cache template', async () => {
      const template = 'Hello {{name}}!';
      const compiled = await loader.compileTemplate(template);
      
      expect(compiled).toBeDefined();
      expect(compiled({ name: 'World' })).toBe('Hello World!');
      
      // Second compile should use cache
      const compiled2 = await loader.compileTemplate(template);
      expect(compiled2).toBe(compiled); // Same reference
    });

    it('should handle template with partials', async () => {
      // Register a partial manually
      Handlebars.registerPartial('test-partial', 'Partial: {{value}}');
      
      const template = 'Main: {{> test-partial value="hello"}}';
      const compiled = await loader.compileTemplate(template);
      
      expect(compiled({})).toBe('Main: Partial: hello');
    });
  });

  describe('loadPartials()', () => {
    it('should load and register partials from project directory', async () => {
      const mockPartialContent = 'Partial content: {{value}}';
      
      vi.mocked(fsPromises.readdir).mockImplementation(async (dir) => {
        if (typeof dir === 'string' && dir.includes('.simone/prompts/partials')) {
          return ['test-partial.hbs'] as any;
        }
        return [] as any;
      });
      
      vi.mocked(fsPromises.stat).mockResolvedValue({
        mtimeMs: 1000,
        mtime: new Date(1000),
      } as any);
      
      vi.mocked(fsPromises.readFile).mockResolvedValue(mockPartialContent);
      
      // Compile template that uses partial
      const template = 'Main: {{> test-partial value="hello"}}';
      const compiled = await loader.compileTemplate(template);
      
      expect(compiled({})).toBe('Main: Partial content: hello');
    });

    it('should rate limit partial checking', async () => {
      vi.mocked(fsPromises.readdir).mockResolvedValue([] as any);
      // Mock existsSync to return true for the first built-in path
      vi.mocked(fs.existsSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('prompts/partials')) {
          return true;
        }
        return false;
      });
      
      // First compile - should check partials
      await loader.compileTemplate('Test 1');
      expect(fsPromises.readdir).toHaveBeenCalledTimes(2); // project + built-in
      
      // Immediate second compile - should not check partials again
      vi.clearAllMocks();
      await loader.compileTemplate('Test 2');
      expect(fsPromises.readdir).not.toHaveBeenCalled();
    });

    it('should detect partial changes and clear compiled templates', async () => {
      // Setup initial partial
      vi.mocked(fsPromises.readdir).mockImplementation(async (dir) => {
        if (typeof dir === 'string' && dir.includes('prompts/partials')) {
          return ['test-partial.hbs'] as any;
        }
        return [] as any;
      });
      
      vi.mocked(fsPromises.stat).mockResolvedValue({
        mtimeMs: 1000,
        mtime: new Date(1000),
      } as any);
      
      vi.mocked(fsPromises.readFile).mockResolvedValue('Initial partial');
      
      // First compile
      const template = '{{> test-partial}}';
      await loader.compileTemplate(template);
      
      // Wait for rate limit interval
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Update partial mtime
      vi.mocked(fsPromises.stat).mockResolvedValue({
        mtimeMs: 2000,
        mtime: new Date(2000),
      } as any);
      
      vi.mocked(fsPromises.readFile).mockResolvedValue('Updated partial');
      
      // Compile again - should detect change
      const compiled = await loader.compileTemplate(template);
      expect(compiled({})).toBe('Updated partial');
    });
  });

  describe('loadPartial()', () => {
    it('should load project partial when it exists', async () => {
      const projectPartialPath = '/test/project/.simone/prompts/partials/test.hbs';
      vi.mocked(fs.existsSync).mockImplementation((path) => 
        path === projectPartialPath
      );
      vi.mocked(fsPromises.readFile).mockResolvedValue('Project partial content');

      const content = await loader.loadPartial('test');
      
      expect(content).toBe('Project partial content');
      expect(fsPromises.readFile).toHaveBeenCalledWith(projectPartialPath, 'utf-8');
    });

    it('should fall back to built-in partial', async () => {
      vi.mocked(fs.existsSync).mockImplementation((path) => 
        typeof path === 'string' && path.includes('templates/prompts/partials/test.hbs')
      );
      vi.mocked(fsPromises.readFile).mockResolvedValue('Built-in partial content');

      const content = await loader.loadPartial('test');
      
      expect(content).toBe('Built-in partial content');
    });

    it('should return null when partial does not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      
      const content = await loader.loadPartial('non-existent');
      
      expect(content).toBeNull();
    });

    it('should handle read errors gracefully', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fsPromises.readFile).mockRejectedValue(new Error('Read failed'));

      const content = await loader.loadPartial('test');
      
      expect(content).toBeNull();
    });
  });
});