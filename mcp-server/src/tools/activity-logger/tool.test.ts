import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleActivityLoggerTool, activityLoggerTool } from './tool.js';
import { mockConsoleLog } from '../../__tests__/utils/index.js';

// Mock the logger module
vi.mock('../../utils/logger.js', () => ({
  logError: vi.fn(),
}));

import { logError } from '../../utils/logger.js';

describe('ActivityLoggerTool', () => {
  mockConsoleLog();

  let mockLogger: any;
  
  beforeEach(() => {
    mockLogger = {
      logActivity: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('activityLoggerTool definition', () => {
    it('should have correct tool properties', () => {
      expect(activityLoggerTool.name).toBe('log_activity');
      expect(activityLoggerTool.description).toContain('Log your AI-assisted development activities');
      expect(activityLoggerTool.inputSchema.required).toEqual(['activity', 'tool_name']);
    });

    it('should have all expected input properties', () => {
      const props = activityLoggerTool.inputSchema.properties;
      
      expect(props).toHaveProperty('activity');
      expect(props).toHaveProperty('tool_name');
      expect(props).toHaveProperty('success');
      expect(props).toHaveProperty('error');
      expect(props).toHaveProperty('tags');
      expect(props).toHaveProperty('context');
      expect(props).toHaveProperty('files_affected');
      expect(props).toHaveProperty('issue_number');
      expect(props).toHaveProperty('link');
      
      // Check defaults
      expect(props.success.default).toBe(true);
    });
  });

  describe('handleActivityLoggerTool()', () => {
    it('should return success message when activity is logged', async () => {
      mockLogger.logActivity.mockReturnValue({
        success: true,
        activityId: 123,
      });
      
      const result = await handleActivityLoggerTool(
        {
          activity: 'Test activity',
          tool_name: 'test-tool',
        },
        mockLogger
      );
      
      expect(mockLogger.logActivity).toHaveBeenCalledWith({
        activity: 'Test activity',
        tool_name: 'test-tool',
      });
      
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: '📋 Activity logged successfully (ID: 123)',
          },
        ],
      });
    });

    it('should handle all parameters', async () => {
      mockLogger.logActivity.mockReturnValue({
        success: true,
        activityId: 124,
      });
      
      const args = {
        activity: 'Complex activity',
        tool_name: 'complex-tool',
        success: false,
        error: 'Some error',
        tags: ['test', 'error'],
        context: 'Additional context',
        files_affected: ['file1.ts', 'file2.ts'],
        issue_number: 42,
        link: 'https://example.com',
      };
      
      await handleActivityLoggerTool(args, mockLogger);
      
      expect(mockLogger.logActivity).toHaveBeenCalledWith(args);
    });

    it('should return error message when logging fails', async () => {
      mockLogger.logActivity.mockReturnValue({
        success: false,
        error: 'Database connection failed',
      });
      
      const result = await handleActivityLoggerTool(
        {
          activity: 'Test activity',
          tool_name: 'test-tool',
        },
        mockLogger
      );
      
      expect(logError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '[ACTIVITY LOGGER ERROR] Failed to log activity: Database connection failed'
        })
      );
      
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('⚠️ CRITICAL ERROR - PLEASE REPORT TO USER'),
          },
        ],
        isError: true,
      });
      
      expect(result.content[0].text).toContain('Database connection failed');
    });

    it('should handle unexpected errors', async () => {
      mockLogger.logActivity.mockImplementation(() => {
        throw new Error('Unexpected error');
      });
      
      const result = await handleActivityLoggerTool(
        {
          activity: 'Test activity',
          tool_name: 'test-tool',
        },
        mockLogger
      );
      
      expect(logError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '[ACTIVITY LOGGER ERROR] Unexpected error: Unexpected error'
        })
      );
      
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('⚠️ CRITICAL ERROR - PLEASE REPORT TO USER'),
          },
        ],
        isError: true,
      });
      
      expect(result.content[0].text).toContain('Unexpected error');
    });

    it('should handle non-Error exceptions', async () => {
      mockLogger.logActivity.mockImplementation(() => {
        throw 'String error';
      });
      
      const result = await handleActivityLoggerTool(
        {
          activity: 'Test activity',
          tool_name: 'test-tool',
        },
        mockLogger
      );
      
      expect(logError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '[ACTIVITY LOGGER ERROR] Unexpected error: String error'
        })
      );
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('String error');
    });
  });
});