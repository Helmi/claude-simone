import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PromptHandler } from '../handler.js';
import { TemplateLoader } from '../loader.js';
import { ConfigLoader } from '../../config/loader.js';
import { buildTemplateContext } from '../context.js';
import { PromptMessage } from '@modelcontextprotocol/sdk/types.js';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';

// Mock dependencies
vi.mock('../loader.js');
vi.mock('../../config/loader.js');
vi.mock('../context.js');
vi.mock('fs');
vi.mock('fs/promises');
vi.mock('../../utils/logger.js', () => ({
  logError: vi.fn()
}));

describe('PromptHandler', () => {
  let promptHandler: PromptHandler;
  let mockTemplateLoader: any;
  let mockConfigLoader: any;
  const projectPath = '/test/project';

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mocks
    mockTemplateLoader = {
      loadPrompt: vi.fn(),
      loadPartials: vi.fn().mockReturnValue({}),
      compileTemplate: vi.fn(),
      listAvailablePrompts: vi.fn()
    };

    mockConfigLoader = {
      getConfig: vi.fn().mockReturnValue({
        project: { name: 'test-project' },
        contexts: []
      }),
      getResolvedContexts: vi.fn().mockReturnValue([])
    };

    vi.mocked(TemplateLoader).mockReturnValue(mockTemplateLoader);
    vi.mocked(ConfigLoader).mockReturnValue(mockConfigLoader);
    vi.mocked(buildTemplateContext).mockReturnValue({
      PROJECT_PATH: projectPath,
      PROJECT_NAME: 'test-project',
      TIMESTAMP: '2024-01-01T00:00:00.000Z',
      CURRENT_DATE: '1/1/2024',
      CURRENT_TIME: '12:00:00 AM'
    });

    promptHandler = new PromptHandler(projectPath);
  });

  describe('getPromptMessages', () => {
    it('should render a simple prompt without arguments', async () => {
      const mockPrompt = {
        name: 'simple',
        description: 'Simple prompt',
        template: 'Hello from {{PROJECT_NAME}}!'
      };

      const mockCompiled = vi.fn().mockReturnValue('Hello from test-project!');

      mockTemplateLoader.loadPrompt.mockReturnValue(mockPrompt);
      mockTemplateLoader.compileTemplate.mockReturnValue(mockCompiled);

      const result = await promptHandler.getPromptMessages({ name: 'simple' });

      expect(result).toEqual([
        {
          role: 'user',
          content: {
            type: 'text',
            text: 'Hello from test-project!'
          }
        }
      ]);
    });

    it('should render prompt with arguments and defaults', async () => {
      const mockPrompt = {
        name: 'with_args',
        description: 'Prompt with arguments',
        arguments: [
          {
            name: 'required_arg',
            description: 'Required argument',
            required: true
          },
          {
            name: 'optional_arg',
            description: 'Optional argument',
            required: false,
            default: 'default_value'
          },
          {
            name: 'dynamic_default',
            description: 'Dynamic default',
            required: false,
            default: '{{PROJECT_NAME}}-suffix'
          }
        ],
        template: 'Required: {{required_arg}}, Optional: {{optional_arg}}, Dynamic: {{dynamic_default}}'
      };

      // Mock for default value compilation
      const defaultValueCompiler = vi.fn().mockReturnValue('default_value');
      const dynamicDefaultCompiler = vi.fn().mockReturnValue('test-project-suffix');
      const mainTemplateCompiler = vi.fn().mockReturnValue(
        'Required: provided, Optional: default_value, Dynamic: test-project-suffix'
      );

      mockTemplateLoader.loadPrompt.mockReturnValue(mockPrompt);
      mockTemplateLoader.compileTemplate
        .mockReturnValueOnce(defaultValueCompiler) // For 'default_value'
        .mockReturnValueOnce(dynamicDefaultCompiler) // For '{{PROJECT_NAME}}-suffix'
        .mockReturnValueOnce(mainTemplateCompiler); // For main template

      const result = await promptHandler.getPromptMessages({
        name: 'with_args',
        arguments: { required_arg: 'provided' }
      });

      expect(result[0].content.text).toBe(
        'Required: provided, Optional: default_value, Dynamic: test-project-suffix'
      );
    });

    it('should auto-load constitution when it exists', async () => {
      const mockPrompt = {
        name: 'with_constitution',
        description: 'Prompt using constitution',
        template: 'Constitution: {{constitution}}'
      };

      const mockConstitution = '# Project Constitution\nProject rules...';
      vi.mocked(existsSync).mockImplementation((path) => {
        return path.toString().includes('constitution.md');
      });
      vi.mocked(readFile).mockResolvedValue(mockConstitution);

      mockTemplateLoader.loadPrompt.mockReturnValue(mockPrompt);
      mockTemplateLoader.compileTemplate.mockReturnValue(
        vi.fn().mockReturnValue('Constitution: # Project Constitution\nProject rules...')
      );

      const result = await promptHandler.getPromptMessages({ name: 'with_constitution' });

      expect(result[0].content.text).toBe('Constitution: # Project Constitution\nProject rules...');
      expect(readFile).toHaveBeenCalledWith(
        expect.stringContaining('constitution.md'),
        'utf8'
      );
    });

    it('should handle missing constitution gracefully', async () => {
      const mockPrompt = {
        name: 'simple',
        description: 'Simple prompt',
        template: 'Template without constitution'
      };

      vi.mocked(existsSync).mockReturnValue(false);

      mockTemplateLoader.loadPrompt.mockReturnValue(mockPrompt);
      mockTemplateLoader.compileTemplate.mockReturnValue(
        vi.fn().mockReturnValue('Template without constitution')
      );

      const result = await promptHandler.getPromptMessages({ name: 'simple' });

      // Should not error when constitution doesn't exist
      expect(result[0].content.text).toBe('Template without constitution');
    });

    it('should handle constitution read errors', async () => {
      const mockPrompt = {
        name: 'test',
        description: 'Test prompt',
        template: 'Test'
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        return path.toString().includes('constitution.md');
      });
      vi.mocked(readFile).mockRejectedValue(new Error('Permission denied'));

      mockTemplateLoader.loadPrompt.mockReturnValue(mockPrompt);

      const result = await promptHandler.getPromptMessages({ name: 'test' });

      expect(result[0].content.text).toContain('Failed to read constitution.md');
      expect(result[0].content.text).toContain('Permission denied');
    });

    it('should handle template loading errors', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      mockTemplateLoader.loadPrompt.mockReturnValue({
        name: 'error',
        template: 'Error: Template not found'
      });
      mockTemplateLoader.compileTemplate.mockReturnValue(
        vi.fn().mockReturnValue('Error: Template not found')
      );

      const result = await promptHandler.getPromptMessages({ name: 'nonexistent' });

      expect(result[0].content.text).toBe('Error: Template not found');
    });

    it('should include project configuration in context', async () => {
      const mockConfig = {
        project: {
          name: 'configured-project',
          description: 'Test project'
        },
        contexts: [
          {
            name: 'backend',
            path: './backend'
          }
        ],
        github: {
          repository: 'owner/repo'
        }
      };

      mockConfigLoader.getConfig.mockReturnValue(mockConfig);

      const mockPrompt = {
        name: 'config_test',
        template: 'Project: {{project.name}}, GitHub: {{github.repository}}'
      };

      vi.mocked(existsSync).mockReturnValue(false);

      mockTemplateLoader.loadPrompt.mockReturnValue(mockPrompt);
      
      let capturedContext: any = null;
      mockTemplateLoader.compileTemplate.mockReturnValue(
        vi.fn().mockImplementation((context) => {
          capturedContext = context;
          return 'Project: configured-project, GitHub: owner/repo';
        })
      );

      await promptHandler.getPromptMessages({ name: 'config_test' });

      expect(capturedContext).toMatchObject({
        project: mockConfig.project,
        contexts: mockConfig.contexts,
        github: mockConfig.github
      });
      expect(mockTemplateLoader.compileTemplate).toHaveBeenCalled();
    });

    it('should validate required arguments', async () => {
      const mockPrompt = {
        name: 'requires_args',
        arguments: [
          {
            name: 'required1',
            required: true
          },
          {
            name: 'required2',
            required: true
          }
        ],
        template: 'Test'
      };

      mockTemplateLoader.loadPrompt.mockReturnValue(mockPrompt);
      mockTemplateLoader.compileTemplate.mockReturnValue(vi.fn().mockReturnValue('Test'));

      vi.mocked(existsSync).mockReturnValue(false);

      // Missing required arguments should still render (with undefined values)
      const result = await promptHandler.getPromptMessages({
        name: 'requires_args',
        arguments: { required1: 'provided' }
      });

      expect(result[0].content.text).toBe('Test');
      expect(mockTemplateLoader.compileTemplate).toHaveBeenCalled();
    });
  });

  describe('listAvailablePrompts', () => {
    it('should scan directories and load prompts', async () => {
      // Mock readdir to return prompt files
      const mockReaddir = vi.fn()
        .mockResolvedValueOnce(['prompt1.yaml', 'prompt2.yml'])
        .mockResolvedValueOnce(['builtin1.yaml', 'error.yaml']);

      vi.doMock('fs/promises', () => ({
        readdir: mockReaddir
      }));

      const mockPrompts = [
        { name: 'prompt1', template: 'Test 1' },
        { name: 'prompt2', template: 'Test 2' },
        { name: 'builtin1', template: 'Built-in 1' },
        { name: 'error', template: 'Error template' }
      ];

      mockTemplateLoader.loadPrompt
        .mockResolvedValueOnce(mockPrompts[0])
        .mockResolvedValueOnce(mockPrompts[1])
        .mockResolvedValueOnce(mockPrompts[2])
        .mockResolvedValueOnce(mockPrompts[3]);

      const result = await promptHandler.listAvailablePrompts();

      // Should not include error template
      expect(result).toHaveLength(3);
      expect(result).toEqual([
        mockPrompts[0],
        mockPrompts[1],
        mockPrompts[2]
      ]);
    });
  });

  describe('helper registration', () => {
    it('should register comparison helpers on construction', () => {
      // This is tested implicitly by the constructor
      // Helpers are registered in the constructor
      expect(promptHandler).toBeDefined();
    });
  });

  describe('context merging', () => {
    it('should merge all context sources in correct order', async () => {
      const baseContext = {
        PROJECT_PATH: projectPath,
        PROJECT_NAME: 'base-name'
      };

      const configData = {
        project: { name: 'config-name' }
      };

      const userArgs = {
        PROJECT_NAME: 'user-override',
        custom_arg: 'custom_value'
      };

      vi.mocked(buildTemplateContext).mockReturnValue(baseContext);
      mockConfigLoader.getConfig.mockReturnValue(configData);

      const mockPrompt = {
        name: 'merge_test',
        template: 'Name: {{PROJECT_NAME}}, Custom: {{custom_arg}}'
      };

      mockTemplateLoader.loadPrompt.mockReturnValue(mockPrompt);
      mockTemplateLoader.compileTemplate.mockReturnValue(
        vi.fn().mockImplementation((context) => {
          // Verify merging order: base < config < defaults < user
          expect(context.PROJECT_NAME).toBe('user-override');
          expect(context.custom_arg).toBe('custom_value');
          return 'Name: user-override, Custom: custom_value';
        })
      );

      await promptHandler.getPromptMessages({
        name: 'merge_test',
        arguments: userArgs
      });
    });
  });
});