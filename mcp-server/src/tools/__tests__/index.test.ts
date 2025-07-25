import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getTools, getToolSchemas, handleToolCall } from '../index.js';
import type { ToolContext, ToolDefinition } from '../index.js';
import { createTestDatabase } from '../../__tests__/utils/test-database.js';
import { ActivityLogger } from '../activity-logger/index.js';
import Database from 'better-sqlite3';

describe('Tool Registry', () => {
  let context: ToolContext;
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDatabase();
    context = {
      projectPath: '/test/project',
      activityLogger: new ActivityLogger('/test/project', db),
      database: db,
    };
  });

  afterEach(() => {
    if (db && db.open) {
      db.close();
    }
  });

  describe('getTools', () => {
    it('should return a Map of tool definitions', () => {
      const tools = getTools(context);
      
      expect(tools).toBeInstanceOf(Map);
      expect(tools.size).toBeGreaterThan(0);
    });

    it('should register log_activity tool', () => {
      const tools = getTools(context);
      
      expect(tools.has('log_activity')).toBe(true);
      
      const logActivityTool = tools.get('log_activity');
      expect(logActivityTool).toBeDefined();
      expect(logActivityTool?.tool.name).toBe('log_activity');
      expect(logActivityTool?.handler).toBeInstanceOf(Function);
    });

    it('should return new Map instance each time', () => {
      const tools1 = getTools(context);
      const tools2 = getTools(context);
      
      expect(tools1).not.toBe(tools2);
      expect(tools1.size).toBe(tools2.size);
    });

    it('should pass context to tool handlers', async () => {
      const tools = getTools(context);
      const logActivityTool = tools.get('log_activity');
      
      const args = {
        activity: 'Test activity',
        tool_name: 'test',
      };
      
      const result = await logActivityTool!.handler(args, context);
      
      expect(result.content[0].text).toContain('Activity logged successfully');
    });
  });

  describe('getToolSchemas', () => {
    it('should return array of tool schemas', () => {
      const tools = getTools(context);
      const schemas = getToolSchemas(tools);
      
      expect(Array.isArray(schemas)).toBe(true);
      expect(schemas.length).toBe(tools.size);
    });

    it('should return tool objects without handlers', () => {
      const tools = getTools(context);
      const schemas = getToolSchemas(tools);
      
      schemas.forEach(schema => {
        expect(schema).toHaveProperty('name');
        expect(schema).toHaveProperty('description');
        expect(schema).toHaveProperty('inputSchema');
        expect(schema).not.toHaveProperty('handler');
      });
    });

    it('should include log_activity tool schema', () => {
      const tools = getTools(context);
      const schemas = getToolSchemas(tools);
      
      const logActivitySchema = schemas.find(s => s.name === 'log_activity');
      expect(logActivitySchema).toBeDefined();
      expect(logActivitySchema?.description).toContain('Log your AI-assisted development activities');
    });
  });

  describe('handleToolCall', () => {
    let tools: Map<string, ToolDefinition>;

    beforeEach(() => {
      tools = getTools(context);
    });

    it('should handle valid tool call', async () => {
      const result = await handleToolCall(
        'log_activity',
        {
          activity: 'Test activity',
          tool_name: 'test',
        },
        tools,
        context
      );

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('Activity logged successfully');
      expect(result.isError).toBeUndefined();
    });

    it('should handle unknown tool', async () => {
      const result = await handleToolCall(
        'unknown_tool',
        {},
        tools,
        context
      );

      expect(result.content[0].text).toBe('Unknown tool: unknown_tool');
      expect(result.isError).toBe(true);
    });

    it('should pass arguments to tool handler', async () => {
      const testArgs = {
        activity: 'Complex activity',
        tool_name: 'complex-tool',
        tags: ['tag1', 'tag2'],
        context: 'Additional context',
      };

      const result = await handleToolCall(
        'log_activity',
        testArgs,
        tools,
        context
      );

      expect(result.content[0].text).toContain('Activity logged successfully');
      
      // Verify in database
      const activity = db.prepare('SELECT * FROM activity_log WHERE activity = ?').get('Complex activity') as any;
      expect(activity).toBeDefined();
      expect(activity.tool_name).toBe('complex-tool');
      expect(activity.context).toBe('Additional context');
    });

    it('should handle tool errors gracefully', async () => {
      // Close database to cause error
      db.close();

      const result = await handleToolCall(
        'log_activity',
        {
          activity: 'Test',
          tool_name: 'test',
        },
        tools,
        context
      );

      expect(result.content[0].text).toContain('CRITICAL ERROR');
      expect(result.isError).toBe(true);
    });

    it('should handle empty arguments', async () => {
      const result = await handleToolCall(
        'log_activity',
        {},
        tools,
        context
      );

      // Should fail due to missing required arguments
      expect(result.isError).toBe(true);
    });

    it('should handle custom tool registration', async () => {
      // Create custom tool
      const customTool: ToolDefinition = {
        tool: {
          name: 'custom_tool',
          description: 'A custom test tool',
          inputSchema: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
            required: ['message'],
          },
        },
        handler: async (args) => ({
          content: [
            {
              type: 'text',
              text: `Custom tool received: ${args.message}`,
            },
          ],
        }),
      };

      // Add custom tool to registry
      tools.set('custom_tool', customTool);

      // Call custom tool
      const result = await handleToolCall(
        'custom_tool',
        { message: 'Hello from test' },
        tools,
        context
      );

      expect(result.content[0].text).toBe('Custom tool received: Hello from test');
      expect(result.isError).toBeUndefined();
    });
  });

  describe('Tool Context', () => {
    it('should provide access to project path', async () => {
      const tools = getTools(context);
      const customContext = {
        ...context,
        projectPath: '/custom/path',
      };

      // Create custom tool that uses project path
      const pathTool: ToolDefinition = {
        tool: {
          name: 'path_tool',
          description: 'Test tool that uses project path',
          inputSchema: { type: 'object', properties: {} },
        },
        handler: async (_, ctx) => ({
          content: [
            {
              type: 'text',
              text: `Project path: ${ctx.projectPath}`,
            },
          ],
        }),
      };

      tools.set('path_tool', pathTool);

      const result = await handleToolCall(
        'path_tool',
        {},
        tools,
        customContext
      );

      expect(result.content[0].text).toBe('Project path: /custom/path');
    });

    it('should provide access to shared services', () => {
      const tools = getTools(context);
      
      expect(context.activityLogger).toBeInstanceOf(ActivityLogger);
      expect(context.database).toBeDefined();
      expect(context.projectPath).toBe('/test/project');
    });
  });
});