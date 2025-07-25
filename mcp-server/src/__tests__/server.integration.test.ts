import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  type ListPromptsResult,
  type GetPromptResult,
  type ListToolsResult,
  type CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';
import { createTestDatabase } from './utils/test-database.js';
import { join } from 'path';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import Database from 'better-sqlite3';

// Mock environment and modules
vi.mock('../utils/logger.js', () => ({
  initializeLogger: vi.fn(),
  logError: vi.fn().mockResolvedValue(undefined),
  logDebug: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  return {
    ...actual,
    watch: vi.fn((path, options, callback) => {
      // Return a mock watcher
      return {
        close: vi.fn(),
      };
    }),
  };
});

// We'll test the actual handlers directly instead of mocking the server
describe('MCP Server Integration Tests', () => {
  let testProjectPath: string;
  let db: Database.Database;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Clear all module cache
    vi.resetModules();
    
    // Save original env
    originalEnv = { ...process.env };
    
    // Create test project directory
    testProjectPath = join(tmpdir(), `mcp-test-${Date.now()}`);
    mkdirSync(testProjectPath, { recursive: true });
    mkdirSync(join(testProjectPath, '.simone'), { recursive: true });
    mkdirSync(join(testProjectPath, '.simone', 'prompts'), { recursive: true });
    mkdirSync(join(testProjectPath, '.simone', 'partials'), { recursive: true });
    
    // Set environment
    process.env['PROJECT_PATH'] = testProjectPath;
    process.env['NODE_ENV'] = 'test';
    
    // Create test database
    db = createTestDatabase();
    
    // Mock the DatabaseConnection to use our test database
    vi.doMock('../tools/database.js', () => ({
      DatabaseConnection: vi.fn().mockImplementation(() => ({
        getDb: () => db,
        close: () => db.close(),
      })),
    }));
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
    
    // Clean up
    if (db && db.open) {
      db.close();
    }
    
    // Remove test directory
    try {
      rmSync(testProjectPath, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
    
    // Clear all mocks
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('Configuration', () => {
    it('should handle missing PROJECT_PATH environment variable', async () => {
      delete process.env['PROJECT_PATH'];
      
      const config = await import('../config/index.js');
      
      expect(() => {
        config.getEnvConfig();
      }).toThrow('PROJECT_PATH environment variable is required');
    });

    it('should initialize with valid PROJECT_PATH', async () => {
      const config = await import('../config/index.js');
      expect(config.getEnvConfig().projectPath).toBe(testProjectPath);
    });
  });

  describe('Prompt System', () => {
    beforeEach(() => {
      // Create test prompt file
      const promptContent = `
name: test-prompt
description: A test prompt
version: 1.0.0
authors:
  - Test Author
arguments:
  - name: arg1
    description: First argument
    required: true
  - name: arg2
    description: Second argument
    required: false
    default: "default value"
tags:
  - test
  - example
template: |
  This is a test prompt with arg1: {{arg1}} and arg2: {{arg2}}
`;
      writeFileSync(
        join(testProjectPath, '.simone', 'prompts', 'test-prompt.yaml'),
        promptContent
      );
    });

    it('should list available prompts', async () => {
      const { initializeTemplating } = await import('../templates/index.js');
      const promptHandler = initializeTemplating(testProjectPath);
      
      const prompts = await promptHandler.listAvailablePrompts();
      
      const testPrompt = prompts.find(p => p.name === 'test-prompt');
      expect(testPrompt).toBeDefined();
      expect(testPrompt?.description).toBe('A test prompt');
      expect(testPrompt?.arguments).toHaveLength(2);
    });

    it('should get prompt with arguments', async () => {
      const { initializeTemplating } = await import('../templates/index.js');
      const promptHandler = initializeTemplating(testProjectPath);
      
      const messages = await promptHandler.getPromptMessages('test-prompt', {
        arg1: 'value1',
        arg2: 'custom value',
      });
      
      expect(messages).toHaveLength(1);
      expect(messages[0].role).toBe('user');
      expect(messages[0].content).toBeDefined();
      
      // Check content (could be a string or object)
      const content = typeof messages[0].content === 'string' 
        ? messages[0].content 
        : messages[0].content.text;
      
      // Content includes header with context info
      expect(content).toContain('Context Information');
      expect(content).toContain('Project Path');
      
      // And our actual prompt content
      expect(content).toContain('value1');
      expect(content).toContain('custom value');
    });

    it('should use default values for optional arguments', async () => {
      const { initializeTemplating } = await import('../templates/index.js');
      const promptHandler = initializeTemplating(testProjectPath);
      
      const messages = await promptHandler.getPromptMessages('test-prompt', {
        arg1: 'value1',
      });
      
      expect(messages).toHaveLength(1);
      
      // Check content (could be a string or object)
      const content = typeof messages[0].content === 'string' 
        ? messages[0].content 
        : messages[0].content.text;
      
      // Content includes header with context info
      expect(content).toContain('Context Information');
      
      // And our actual prompt content
      expect(content).toContain('value1');
      expect(content).toContain('default value');
    });

    it('should handle non-existent prompt', async () => {
      const { initializeTemplating } = await import('../templates/index.js');
      const promptHandler = initializeTemplating(testProjectPath);
      
      const messages = await promptHandler.getPromptMessages('non-existent', {});
      
      expect(messages).toHaveLength(1);
      expect(messages[0].role).toBe('user');
      
      const content = typeof messages[0].content === 'string' 
        ? messages[0].content 
        : messages[0].content.text;
      
      expect(content).toContain('error happened');
      expect(content).toContain("Prompt 'non-existent' not found");
    });
  });

  describe('Tool System', () => {
    it('should list available tools', async () => {
      const { ActivityLogger } = await import('../tools/activity-logger/index.js');
      const { getTools, getToolSchemas } = await import('../tools/index.js');
      
      const context = {
        projectPath: testProjectPath,
        activityLogger: new ActivityLogger(testProjectPath, db),
        database: db,
      };
      
      const tools = getTools(context);
      const schemas = getToolSchemas(tools);
      
      const logTool = schemas.find(t => t.name === 'log_activity');
      expect(logTool).toBeDefined();
      expect(logTool?.description).toContain('Log your AI-assisted development activities');
    });

    it('should call activity logger tool successfully', async () => {
      const { ActivityLogger } = await import('../tools/activity-logger/index.js');
      const { getTools, handleToolCall } = await import('../tools/index.js');
      
      const context = {
        projectPath: testProjectPath,
        activityLogger: new ActivityLogger(testProjectPath, db),
        database: db,
      };
      
      const tools = getTools(context);
      const result = await handleToolCall(
        'log_activity',
        {
          activity: 'Test activity',
          tool_name: 'test-tool',
          tags: ['test', 'integration'],
        },
        tools,
        context
      );
      
      expect(result.content[0].text).toContain('Activity logged successfully');
      expect(result.isError).toBeUndefined();
    });

    it('should handle unknown tool', async () => {
      const { ActivityLogger } = await import('../tools/activity-logger/index.js');
      const { getTools, handleToolCall } = await import('../tools/index.js');
      
      const context = {
        projectPath: testProjectPath,
        activityLogger: new ActivityLogger(testProjectPath, db),
        database: db,
      };
      
      const tools = getTools(context);
      const result = await handleToolCall(
        'unknown-tool',
        {},
        tools,
        context
      );
      
      expect(result.content[0].text).toContain('Unknown tool: unknown-tool');
      expect(result.isError).toBe(true);
    });

    it('should handle tool errors gracefully', async () => {
      // Close database to simulate error
      db.close();
      
      const { ActivityLogger } = await import('../tools/activity-logger/index.js');
      const { getTools, handleToolCall } = await import('../tools/index.js');
      
      const context = {
        projectPath: testProjectPath,
        activityLogger: new ActivityLogger(testProjectPath, db),
        database: db,
      };
      
      const tools = getTools(context);
      const result = await handleToolCall(
        'log_activity',
        {
          activity: 'Test activity',
          tool_name: 'test-tool',
        },
        tools,
        context
      );
      
      expect(result.content[0].text).toContain('CRITICAL ERROR');
      expect(result.isError).toBe(true);
    });
  });

  describe('Hot Reload', () => {
    it('should watch for prompt changes', async () => {
      const { watch } = await import('fs');
      
      // Mock process.exit to prevent actual exit
      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process would exit');
      });
      
      try {
        await import('../index.js');
      } catch (error) {
        // Expected due to mocked exit
      }
      
      // Verify watch was called for prompts directory
      expect(watch).toHaveBeenCalledWith(
        join(testProjectPath, '.simone', 'prompts'),
        expect.objectContaining({ recursive: true }),
        expect.any(Function)
      );
      
      mockExit.mockRestore();
    });

    it('should not watch built-in prompts in production', async () => {
      process.env['NODE_ENV'] = 'production';
      const { watch } = await import('fs');
      
      // Mock process.exit
      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process would exit');
      });
      
      try {
        await import('../index.js');
      } catch (error) {
        // Expected
      }
      
      // Should only be called once for project prompts
      const watchCalls = (watch as any).mock.calls;
      const projectPromptCalls = watchCalls.filter((call: any[]) => 
        call[0].includes('.simone')
      );
      
      expect(projectPromptCalls).toHaveLength(1);
      
      mockExit.mockRestore();
    });
  });

  describe('Database Integration', () => {
    it('should initialize database connection', async () => {
      const { DatabaseConnection } = await import('../tools/database.js');
      const dbConn = new DatabaseConnection(testProjectPath);
      const database = dbConn.getDb();
      
      // Verify database tables exist
      const tables = database.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      const tableNames = tables.map((t: any) => t.name);
      
      expect(tableNames).toContain('activity_log');
      dbConn.close();
    });

    it('should handle database initialization errors', async () => {
      // Reset modules to clear any cached imports
      vi.resetModules();
      
      // Mock DatabaseConnection to throw
      vi.doMock('../tools/database.js', () => ({
        DatabaseConnection: vi.fn().mockImplementation(() => {
          throw new Error('Database initialization failed');
        }),
      }));

      // Mock process.exit to prevent actual exit
      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
        // Don't throw, just return
        return undefined as never;
      });

      // Import will trigger the database error
      try {
        await import('../index.js');
        // If we get here, wait a bit for the async error handler
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        // Might throw the original database error before exit is called
      }

      expect(mockExit).toHaveBeenCalledWith(1);
      mockExit.mockRestore();
    });
  });

  describe('Graceful Shutdown', () => {
    beforeEach(() => {
      // Remove any existing listeners to avoid interference
      process.removeAllListeners('SIGTERM');
      process.removeAllListeners('SIGINT');
    });

    it('should handle SIGTERM signal', async () => {
      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
        // Don't actually exit
      });

      // Import server which sets up signal handlers
      try {
        await import('../index.js');
      } catch (error) {
        // May error due to mocking
      }

      // Emit SIGTERM
      process.emit('SIGTERM' as any);

      // Wait a bit for async handler
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockExit).toHaveBeenCalledWith(0);
      mockExit.mockRestore();
    });

    it('should handle SIGINT signal', async () => {
      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
        // Don't actually exit
      });

      // Import server
      try {
        await import('../index.js');
      } catch (error) {
        // May error due to mocking
      }

      // Emit SIGINT
      process.emit('SIGINT' as any);

      // Wait a bit for async handler
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockExit).toHaveBeenCalledWith(0);
      mockExit.mockRestore();
    });

    it('should close database on shutdown', async () => {
      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
        // Don't actually exit
      });

      let closeCalled = false;
      vi.doMock('../tools/database.js', () => ({
        DatabaseConnection: vi.fn().mockImplementation(() => ({
          getDb: () => db,
          close: () => {
            closeCalled = true;
            db.close();
          },
        })),
      }));

      // Re-import to use new mock
      vi.resetModules();
      
      try {
        await import('../index.js');
      } catch (error) {
        // May error due to mocking
      }

      // Emit signal
      process.emit('SIGTERM' as any);

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(closeCalled).toBe(true);
      mockExit.mockRestore();
    });
  });
});