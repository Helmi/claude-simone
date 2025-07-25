import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TemplateLoader } from '../loader.js';
import { TestFixtures } from '../../__tests__/utils/fixtures.js';
import { PromptTemplate } from '../types.js';
import { readFileSync, statSync, readdirSync, existsSync } from 'fs';
import { readFile, stat, readdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Mock dependencies
vi.mock('fs');
vi.mock('fs/promises');
vi.mock('../utils/logger.js', () => ({
  logError: vi.fn()
}));

describe('TemplateLoader', () => {
  let templateLoader: TemplateLoader;
  const projectPath = '/test/project';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    templateLoader = new TemplateLoader(projectPath);
  });

  describe('loadPrompt', () => {
    const mockStat = (mtime: Date) => ({
      mtimeMs: mtime.getTime(),
      mtime,
      isFile: () => true,
      isDirectory: () => false,
    } as any);

    it('should load prompt from project directory first', async () => {
      const testPrompt = `---
name: test_prompt
description: Test prompt from project
arguments:
  - name: testArg
    description: Test argument
    required: true
template: |
  This is a test prompt with {{testArg}}`;

      const projectPromptPath = join(projectPath, '.simone/prompts/test_prompt.yaml');
      
      vi.mocked(existsSync)
        .mockReturnValueOnce(true)  // project prompt exists
        .mockReturnValueOnce(false); // built-in prompt doesn't exist
        
      vi.mocked(readFile).mockResolvedValue(testPrompt);
      vi.mocked(stat).mockResolvedValue(mockStat(new Date()));

      const result = await templateLoader.loadPrompt('test_prompt');

      expect(result).toMatchObject({
        name: 'test_prompt',
        description: 'Test prompt from project',
        arguments: [{
          name: 'testArg',
          description: 'Test argument',
          required: true
        }],
        template: 'This is a test prompt with {{testArg}}\n'
      });
      expect(existsSync).toHaveBeenCalledWith(projectPromptPath);
      expect(readFile).toHaveBeenCalledWith(projectPromptPath, 'utf-8');
    });

    it('should fallback to built-in prompt when project prompt not found', async () => {
      const builtInPrompt = `---
name: built_in
description: Built-in prompt
template: |
  Built-in template content`;

      // Reset mock and track calls
      vi.mocked(existsSync).mockReset();
      const existsSyncCalls: string[] = [];
      vi.mocked(existsSync).mockImplementation((path) => {
        const pathStr = path as string;
        existsSyncCalls.push(pathStr);
        // First call checks project path - return false
        // Second call checks built-in path - return true
        if (pathStr.includes('.simone/prompts')) {
          return false; // project prompt doesn't exist
        } else if (pathStr.includes('/templates/prompts')) {
          return true;  // built-in prompt exists
        }
        return false;
      });
        
      vi.mocked(readFile).mockResolvedValue(builtInPrompt);
      vi.mocked(stat).mockResolvedValue(mockStat(new Date()));

      const result = await templateLoader.loadPrompt('built_in');

      expect(result).toMatchObject({
        name: 'built_in',
        description: 'Built-in prompt',
        template: 'Built-in template content\n'
      });
      expect(existsSync).toHaveBeenCalledTimes(2);
    });

    it('should use cached prompt on subsequent calls', async () => {
      const testPrompt = `---
name: cached_prompt
description: Cached prompt
template: Test`;

      const mtime = new Date();
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(testPrompt);
      vi.mocked(stat).mockResolvedValue(mockStat(mtime));

      // First call - will read file and cache it
      const result1 = await templateLoader.loadPrompt('cached_prompt');
      expect(readFile).toHaveBeenCalledTimes(1);
      expect(stat).toHaveBeenCalledTimes(1);

      // Second call - should use cache (still checks mtime)
      const result2 = await templateLoader.loadPrompt('cached_prompt');
      expect(readFile).toHaveBeenCalledTimes(1); // Should not read file again
      expect(stat).toHaveBeenCalledTimes(2); // But should check mtime
      expect(result1).toBe(result2);
    });

    it('should invalidate cache when file is modified', async () => {
      const originalPrompt = `---
name: changing_prompt
description: Original
template: Original content`;

      const updatedPrompt = `---
name: changing_prompt
description: Updated
template: Updated content`;

      const originalTime = new Date('2024-01-01');
      const updatedTime = new Date('2024-01-02');

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile)
        .mockResolvedValueOnce(originalPrompt)
        .mockResolvedValueOnce(updatedPrompt);
      vi.mocked(stat)
        .mockResolvedValueOnce(mockStat(originalTime))
        .mockResolvedValueOnce(mockStat(updatedTime))
        .mockResolvedValueOnce(mockStat(updatedTime));

      // First call
      const result1 = await templateLoader.loadPrompt('changing_prompt');
      expect(result1.description).toBe('Original');

      // Second call with newer mtime
      const result2 = await templateLoader.loadPrompt('changing_prompt');
      expect(result2.description).toBe('Updated');
      expect(readFile).toHaveBeenCalledTimes(2);
    });

    it('should handle YAML parsing errors gracefully', async () => {
      const invalidYaml = `---
name: invalid
description: [unclosed array
template: test`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(invalidYaml);
      vi.mocked(stat).mockResolvedValue(mockStat(new Date()));

      const result = await templateLoader.loadPrompt('invalid');

      expect(result.name).toBe('error');
      expect(result.template).toContain('Failed to parse prompt');
      expect(result.template).toContain('invalid');
    });

    it('should handle missing template gracefully', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const result = await templateLoader.loadPrompt('nonexistent');

      expect(result).toBeNull();
    });

    it('should preserve template whitespace and formatting', async () => {
      const complexTemplate = `---
name: complex
description: Complex template
template: |
  Line 1 with spaces    
  Line 2 with tabs		
  
  Line 4 after blank line
    Indented line`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(complexTemplate);
      vi.mocked(stat).mockResolvedValue(mockStat(new Date()));

      const result = await templateLoader.loadPrompt('complex');

      expect(result.template).toBe(
        'Line 1 with spaces    \n' +
        'Line 2 with tabs\t\t\n' +
        '\n' +
        'Line 4 after blank line\n' +
        '  Indented line\n'
      );
    });
  });

  describe('loadPartial', () => {
    it('should load a specific partial file', async () => {
      const headerContent = '<header>{{title}}</header>';

      vi.mocked(existsSync)
        .mockReturnValueOnce(true);  // project partial exists
      vi.mocked(readFile).mockResolvedValue(headerContent);

      const partial = await templateLoader.loadPartial('header');

      expect(partial).toBe(headerContent);
      expect(readFile).toHaveBeenCalledWith(
        join(projectPath, '.simone/prompts/partials/header.hbs'),
        'utf-8'
      );
    });

    it('should handle missing partial file', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const partial = await templateLoader.loadPartial('nonexistent');

      expect(partial).toBeNull();
    });
  });

  describe('compileTemplate', () => {
    beforeEach(() => {
      // Mock readdir to return empty array (no partials)
      vi.mocked(readdir).mockResolvedValue([]);
    });

    it('should compile valid Handlebars template', async () => {
      const template = 'Hello {{name}}!';
      const compiled = await templateLoader.compileTemplate(template);

      expect(compiled({ name: 'World' })).toBe('Hello World!');
    });

    it('should cache compiled templates', async () => {
      const template = 'Cached {{value}}';
      
      const compiled1 = await templateLoader.compileTemplate(template);
      const compiled2 = await templateLoader.compileTemplate(template);

      expect(compiled1).toBe(compiled2);
    });

    it('should handle runtime template errors gracefully', async () => {
      // This template is valid during compilation but will error during execution
      const validTemplate = '{{#if}}missing condition{{/if}}';
      
      const compiled = await templateLoader.compileTemplate(validTemplate);
      
      // The compilation should succeed
      expect(compiled).toBeDefined();
      expect(typeof compiled).toBe('function');
      
      // But execution will throw an error - let's catch it
      expect(() => {
        compiled({ error: 'test' });
      }).toThrow('#if requires exactly one argument');
    });

    it('should compile templates with partials', async () => {
      // Mock readdir to return a partial file
      vi.mocked(readdir).mockResolvedValue(['testPartial.hbs'] as any);
      vi.mocked(stat).mockResolvedValue({
        mtimeMs: Date.now(),
        isFile: () => true,
        isDirectory: () => false
      } as any);
      vi.mocked(readFile).mockResolvedValue('Partial content: {{data}}');

      const template = '{{> testPartial}}';
      
      const compiled = await templateLoader.compileTemplate(template);
      const result = compiled({ data: 'test data' });

      expect(result).toBe('Partial content: test data');
    });
  });

  describe('clearCache', () => {
    it('should clear the prompt cache', async () => {
      const prompt = `---
name: test
template: Test {{var}}`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(prompt);
      vi.mocked(stat).mockResolvedValue({
        mtimeMs: Date.now(),
        mtime: new Date(),
        isFile: () => true,
        isDirectory: () => false
      } as any);

      // Populate cache
      await templateLoader.loadPrompt('test');
      expect(readFile).toHaveBeenCalledTimes(1);
      
      // Clear cache
      templateLoader.clearCache();

      // Verify cache is empty by checking if files are read again
      await templateLoader.loadPrompt('test');
      expect(readFile).toHaveBeenCalledTimes(2);
    });
  });
});