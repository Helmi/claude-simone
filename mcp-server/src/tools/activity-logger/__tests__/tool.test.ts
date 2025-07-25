import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { activityLoggerTool, handleActivityLoggerTool } from '../tool.js';
import { ActivityLogger } from '../index.js';
import { createTestDatabase } from '../../../__tests__/utils/test-database.js';
import Database from 'better-sqlite3';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

// Store original console.error
const originalConsoleError = console.error;

describe('activityLoggerTool', () => {
  it('should have correct tool definition', () => {
    expect(activityLoggerTool.name).toBe('log_activity');
    expect(activityLoggerTool.description).toContain('Log your AI-assisted development activities');
    expect(activityLoggerTool.inputSchema.type).toBe('object');
    expect(activityLoggerTool.inputSchema.required).toEqual(['activity', 'tool_name']);
  });

  it('should have all expected properties in schema', () => {
    const properties = activityLoggerTool.inputSchema.properties;
    expect(properties).toHaveProperty('activity');
    expect(properties).toHaveProperty('tool_name');
    expect(properties).toHaveProperty('success');
    expect(properties).toHaveProperty('error');
    expect(properties).toHaveProperty('tags');
    expect(properties).toHaveProperty('context');
    expect(properties).toHaveProperty('files_affected');
    expect(properties).toHaveProperty('issue_number');
    expect(properties).toHaveProperty('link');
  });

  it('should have correct property types', () => {
    const properties = activityLoggerTool.inputSchema.properties;
    expect(properties.activity.type).toBe('string');
    expect(properties.tool_name.type).toBe('string');
    expect(properties.success.type).toBe('boolean');
    expect(properties.success.default).toBe(true);
    expect(properties.error.type).toBe('string');
    expect(properties.tags.type).toBe('array');
    expect(properties.tags.items.type).toBe('string');
    expect(properties.context.type).toBe('string');
    expect(properties.files_affected.type).toBe('array');
    expect(properties.files_affected.items.type).toBe('string');
    expect(properties.issue_number.type).toBe('number');
    expect(properties.link.type).toBe('string');
  });
});

describe('handleActivityLoggerTool', () => {
  let db: Database.Database;
  let logger: ActivityLogger;
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    db = createTestDatabase();
    logger = new ActivityLogger('/test/project', db);
    // Mock console.error
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    db.close();
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('should handle successful activity logging', async () => {
    const args = {
      activity: 'Created test file',
      tool_name: 'test-tool',
      tags: ['testing', 'setup'],
      context: 'Setting up test environment'
    };

    const result = await handleActivityLoggerTool(args, logger);

    expect(result).toBeDefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0]).toMatchObject({
      type: 'text',
      text: expect.stringContaining('📋 Activity logged successfully')
    });
    expect(result.content[0].text).toMatch(/ID: \d+/);
    expect(result.isError).toBeUndefined();
  });

  it('should handle activity with all parameters', async () => {
    const args = {
      activity: 'Fixed critical bug',
      tool_name: 'bug-fixer',
      success: false,
      error: 'Partial fix applied',
      tags: ['bug-fix', 'critical', 'authentication'],
      context: 'Fixed login issue but needs more work',
      files_affected: ['src/auth.ts', 'src/login.ts'],
      issue_number: 42,
      link: 'https://github.com/user/repo/issues/42'
    };

    const result = await handleActivityLoggerTool(args, logger);

    expect(result.content[0].text).toContain('📋 Activity logged successfully');
    
    // Verify data was stored correctly
    const activities = db.prepare('SELECT * FROM activity_log ORDER BY id DESC LIMIT 1').all() as any[];
    expect(activities[0].activity).toBe('Fixed critical bug');
    expect(activities[0].success).toBe(0);
    expect(activities[0].error).toBe('Partial fix applied');
  });

  it('should handle database errors', async () => {
    // Close database to simulate error
    db.close();

    const args = {
      activity: 'Test activity',
      tool_name: 'test'
    };

    const result = await handleActivityLoggerTool(args, logger);

    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toContain('⚠️ CRITICAL ERROR');
    expect(result.content[0].text).toContain('Failed to log activity');
    expect(result.content[0].text).toContain('database connection is not open');
    expect(result.isError).toBe(true);
    
    // Verify console.error was called (ActivityLogger logs the error and the tool handler logs it again)
    expect(console.error).toHaveBeenCalled();
    // Check that at least one call contains the error message
    const errorCalls = consoleErrorSpy.mock.calls;
    const hasExpectedError = errorCalls.some(call => 
      call.some(arg => 
        typeof arg === 'string' && arg.includes('database connection is not open')
      )
    );
    expect(hasExpectedError).toBe(true);
  });

  it('should handle unexpected errors', async () => {
    // Create a logger that will throw an unexpected error
    const errorLogger = {
      logActivity: () => {
        throw new TypeError('Cannot read property of undefined');
      }
    } as any;

    const args = {
      activity: 'Test activity',
      tool_name: 'test'
    };

    const result = await handleActivityLoggerTool(args, errorLogger);

    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toContain('⚠️ CRITICAL ERROR');
    expect(result.content[0].text).toContain('Unexpected error');
    expect(result.content[0].text).toContain('Cannot read property of undefined');
    expect(result.isError).toBe(true);
  });

  it('should handle missing required parameters gracefully', async () => {
    // Although schema validation should catch this, test defensive coding
    const args = {
      activity: 'Test activity'
      // missing tool_name
    } as any;

    const result = await handleActivityLoggerTool(args, logger);

    // Should still attempt to log, database will handle the constraint
    expect(result.content[0].text).toContain('CRITICAL ERROR');
    expect(result.isError).toBe(true);
  });

  it('should handle various success parameter values', async () => {
    const testCases = [
      { input: { success: true }, expected: 1 },
      { input: { success: false }, expected: 0 },
      { input: { success: undefined }, expected: 1 }, // defaults to true
      { input: {}, expected: 1 } // defaults to true when not provided
    ];

    for (const testCase of testCases) {
      const args = {
        activity: `Test with success: ${JSON.stringify(testCase.input.success)}`,
        tool_name: 'test',
        ...testCase.input
      };

      const result = await handleActivityLoggerTool(args, logger);
      expect(result.content[0].text).toContain('📋 Activity logged successfully');
      
      // Verify in database
      const row = db.prepare('SELECT success FROM activity_log WHERE activity = ?').get(args.activity) as any;
      expect(row.success).toBe(testCase.expected);
    }
  });

  it('should return correct result structure', async () => {
    const args = {
      activity: 'Test activity',
      tool_name: 'test'
    };

    const result = await handleActivityLoggerTool(args, logger);

    // Check CallToolResult structure
    expect(result).toHaveProperty('content');
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty('type');
    expect(result.content[0]).toHaveProperty('text');
    expect(result.content[0].type).toBe('text');
  });

  it('should handle very long activity descriptions', async () => {
    const longActivity = 'A'.repeat(1000);
    const args = {
      activity: longActivity,
      tool_name: 'test'
    };

    const result = await handleActivityLoggerTool(args, logger);

    expect(result.content[0].text).toContain('📋 Activity logged successfully');
    
    // Verify it was stored
    const row = db.prepare('SELECT activity FROM activity_log ORDER BY id DESC LIMIT 1').get() as any;
    expect(row.activity).toBe(longActivity);
  });

  it('should handle special characters in strings', async () => {
    const args = {
      activity: "Created file with 'quotes' and \"double quotes\"",
      tool_name: "test's tool",
      context: 'Context with\nnewlines\tand\ttabs',
      link: 'https://example.com?param=value&other=123'
    };

    const result = await handleActivityLoggerTool(args, logger);

    expect(result.content[0].text).toContain('📋 Activity logged successfully');
    
    // Verify special characters were preserved
    const row = db.prepare('SELECT * FROM activity_log ORDER BY id DESC LIMIT 1').get() as any;
    expect(row.activity).toBe(args.activity);
    expect(row.tool_name).toBe(args.tool_name);
    expect(row.context).toBe(args.context);
    expect(row.link).toBe(args.link);
  });
});