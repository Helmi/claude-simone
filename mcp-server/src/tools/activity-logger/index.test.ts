import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ActivityLogger } from './index.js';
import { mockConsoleLog } from '../../__tests__/utils/index.js';
import Database from 'better-sqlite3';

// Mock dependencies
vi.mock('./activity-types.js', () => ({
  detectActivityType: vi.fn(),
}));

vi.mock('./path-normalizer.js', () => ({
  normalizeFilePath: vi.fn(),
}));

vi.mock('../../utils/logger.js', () => ({
  logError: vi.fn(),
}));

// Import mocked modules
import { detectActivityType } from './activity-types.js';
import { normalizeFilePath } from './path-normalizer.js';
import { logError } from '../../utils/logger.js';

describe('ActivityLogger', () => {
  mockConsoleLog();

  let logger: ActivityLogger;
  let mockDb: any;
  const mockProjectPath = '/test/project';
  
  beforeEach(() => {
    // Create mock database with all necessary methods
    mockDb = {
      prepare: vi.fn(),
      transaction: vi.fn(),
    };
    
    // Set up default mocks
    vi.mocked(detectActivityType).mockReturnValue('create');
    vi.mocked(normalizeFilePath).mockImplementation((path) => path);
    
    logger = new ActivityLogger(mockProjectPath, mockDb);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with project path and database', () => {
      expect(logger).toBeDefined();
    });
  });

  describe('logActivity()', () => {
    it('should log basic activity successfully', () => {
      const mockStmt = {
        run: vi.fn().mockReturnValue({ lastInsertRowid: 123 }),
      };
      
      mockDb.prepare.mockReturnValue(mockStmt);
      mockDb.transaction.mockImplementation((fn: Function) => {
        return () => fn();  // Return a function that calls the transaction function
      });
      
      const result = logger.logActivity({
        activity: 'Created new feature',
        tool_name: 'test-tool',
      });
      
      expect(result).toEqual({
        success: true,
        activityId: 123,
      });
      
      expect(detectActivityType).toHaveBeenCalledWith('Created new feature');
      expect(mockStmt.run).toHaveBeenCalledWith(
        'Created new feature',
        'create',
        'test-tool',
        1, // success = true
        null, // no error
        null, // no context
        null, // no issue_number
        null  // no link
      );
    });

    it('should handle all optional parameters', () => {
      const mockStmt = {
        run: vi.fn().mockReturnValue({ lastInsertRowid: 124 }),
      };
      
      mockDb.prepare.mockReturnValue(mockStmt);
      mockDb.transaction.mockImplementation((fn: Function) => {
        return () => fn();  // Return a function that calls the transaction function
      });
      
      const result = logger.logActivity({
        activity: 'Fixed bug',
        tool_name: 'debugger',
        success: false,
        error: 'Test failed',
        context: 'Additional context',
        issue_number: 42,
        link: 'https://github.com/test/repo',
      });
      
      expect(result.success).toBe(true);
      expect(mockStmt.run).toHaveBeenCalledWith(
        'Fixed bug',
        'create', // mocked
        'debugger',
        0, // success = false
        'Test failed',
        'Additional context',
        42,
        'https://github.com/test/repo'
      );
    });

    it('should handle tags (max 3)', () => {
      const mockActivityStmt = {
        run: vi.fn().mockReturnValue({ lastInsertRowid: 125 }),
      };
      
      const mockInsertTag = { 
        run: vi.fn().mockImplementation((tag) => {
          // console.log('Insert tag:', tag);
        })
      };
      const mockGetTagId = { 
        get: vi.fn()
          .mockReturnValueOnce({ id: 1 })
          .mockReturnValueOnce({ id: 2 })
          .mockReturnValueOnce({ id: 3 })
          .mockImplementation((tag) => {
            // console.log('Get tag ID for:', tag);
            return { id: 999 }; // fallback
          })
      };
      const mockLinkTag = { 
        run: vi.fn().mockImplementation((activityId, tagId) => {
          // console.log('Link tag:', activityId, tagId);
        })
      };
      
      mockDb.prepare.mockImplementation((sql: string) => {
        // console.log('prepare called with:', sql);
        if (sql.includes('INSERT INTO activity_log') && !sql.includes('activity_log_tags')) {
          return mockActivityStmt;
        }
        if (sql.includes('INSERT OR IGNORE INTO activity_tags')) {
          return mockInsertTag;
        }
        if (sql.includes('SELECT id FROM activity_tags')) {
          return mockGetTagId;
        }
        if (sql.includes('INSERT INTO activity_log_tags')) {
          return mockLinkTag;
        }
        return { run: vi.fn() };
      });
      
      // Mock transaction - better-sqlite3 transactions work by:
      // 1. db.transaction(fn) returns a wrapped function
      // 2. Calling the wrapped function executes the transaction
      mockDb.transaction = vi.fn().mockImplementation((fn: Function) => {
        // Return a new function that calls the original
        return vi.fn().mockImplementation(() => {
          return fn();
        });
      });
      
      const result = logger.logActivity({
        activity: 'Added tests',
        tool_name: 'test-writer',
        tags: ['testing', 'Feature', 'bug-fix', 'extra-tag'], // 4 tags, only 3 should be used
      });
      
      expect(result.success).toBe(true);
      expect(result.activityId).toBe(125);
      
      // Verify main activity was inserted
      expect(mockActivityStmt.run).toHaveBeenCalled();
      
      // Should insert only first 3 tags
      expect(mockInsertTag.run).toHaveBeenCalledTimes(3);
      expect(mockInsertTag.run).toHaveBeenCalledWith('testing');
      expect(mockInsertTag.run).toHaveBeenCalledWith('feature'); // lowercase
      expect(mockInsertTag.run).toHaveBeenCalledWith('bug-fix');
      
      // Should link all 3 tags
      expect(mockLinkTag.run).toHaveBeenCalledTimes(3);
      expect(mockLinkTag.run).toHaveBeenCalledWith(125, 1);
      expect(mockLinkTag.run).toHaveBeenCalledWith(125, 2);
      expect(mockLinkTag.run).toHaveBeenCalledWith(125, 3);
    });

    it('should handle affected files', () => {
      const mockActivityStmt = {
        run: vi.fn().mockReturnValue({ lastInsertRowid: 126 }),
      };
      
      const mockInsertFile = { run: vi.fn() };
      
      mockDb.prepare.mockImplementation((sql: string) => {
        if (sql.includes('INSERT INTO activity_log')) return mockActivityStmt;
        if (sql.includes('INSERT INTO activity_files')) return mockInsertFile;
        return { run: vi.fn() };
      });
      
      mockDb.transaction.mockImplementation((fn: Function) => {
        return () => fn();  // Return a function that calls the transaction function
      });
      
      vi.mocked(normalizeFilePath)
        .mockReturnValueOnce('src/file1.ts')
        .mockReturnValueOnce('src/file2.ts');
      
      const result = logger.logActivity({
        activity: 'Refactored code',
        tool_name: 'refactor-tool',
        files_affected: ['/absolute/path/file1.ts', './relative/file2.ts'],
      });
      
      expect(result.success).toBe(true);
      
      expect(normalizeFilePath).toHaveBeenCalledTimes(2);
      expect(normalizeFilePath).toHaveBeenCalledWith('/absolute/path/file1.ts', mockProjectPath);
      expect(normalizeFilePath).toHaveBeenCalledWith('./relative/file2.ts', mockProjectPath);
      
      expect(mockInsertFile.run).toHaveBeenCalledTimes(2);
      expect(mockInsertFile.run).toHaveBeenCalledWith(126, 'src/file1.ts', 'modified');
      expect(mockInsertFile.run).toHaveBeenCalledWith(126, 'src/file2.ts', 'modified');
    });

    it('should handle database errors gracefully', () => {
      mockDb.transaction.mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const result = logger.logActivity({
        activity: 'Test activity',
        tool_name: 'test-tool',
      });
      
      expect(result).toEqual({
        success: false,
        error: 'Database error',
      });
      
      expect(logError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('[ActivityLogger.logActivity] Database operation failed')
        })
      );
    });

    it('should handle non-Error exceptions', () => {
      mockDb.transaction.mockImplementation(() => {
        throw 'String error';
      });
      
      const result = logger.logActivity({
        activity: 'Test activity',
        tool_name: 'test-tool',
      });
      
      expect(result).toEqual({
        success: false,
        error: 'Unknown error',
      });
    });

    it('should handle complete workflow with all features', () => {
      const mockActivityStmt = {
        run: vi.fn().mockReturnValue({ lastInsertRowid: 127 }),
      };
      
      const mockInsertTag = { run: vi.fn() };
      const mockGetTagId = { 
        get: vi.fn()
          .mockReturnValueOnce({ id: 10 })
          .mockReturnValueOnce({ id: 11 })
      };
      const mockLinkTag = { run: vi.fn() };
      const mockInsertFile = { run: vi.fn() };
      
      mockDb.prepare.mockImplementation((sql: string) => {
        if (sql.includes('INSERT INTO activity_log') && !sql.includes('activity_log_tags')) {
          return mockActivityStmt;
        }
        if (sql.includes('INSERT OR IGNORE INTO activity_tags')) {
          return mockInsertTag;
        }
        if (sql.includes('SELECT id FROM activity_tags')) {
          return mockGetTagId;
        }
        if (sql.includes('INSERT INTO activity_log_tags')) {
          return mockLinkTag;
        }
        if (sql.includes('INSERT INTO activity_files')) {
          return mockInsertFile;
        }
        return { run: vi.fn() };
      });
      
      // Mock transaction - better-sqlite3 transactions work by:
      // 1. db.transaction(fn) returns a wrapped function
      // 2. Calling the wrapped function executes the transaction
      mockDb.transaction = vi.fn().mockImplementation((fn: Function) => {
        // Return a new function that calls the original
        return vi.fn().mockImplementation(() => {
          return fn();
        });
      });
      
      vi.mocked(detectActivityType).mockReturnValue('update');
      vi.mocked(normalizeFilePath).mockReturnValue('normalized/path.ts');
      
      const result = logger.logActivity({
        activity: 'Updated authentication system',
        tool_name: 'auth-updater',
        success: true,
        context: 'Added OAuth support',
        issue_number: 100,
        link: 'https://github.com/test/pr/123',
        tags: ['authentication', 'security'],
        files_affected: ['auth/oauth.ts'],
      });
      
      expect(result).toEqual({
        success: true,
        activityId: 127,
      });
      
      // Verify activity was logged
      expect(mockActivityStmt.run).toHaveBeenCalledWith(
        'Updated authentication system',
        'update',
        'auth-updater',
        1,
        null,
        'Added OAuth support',
        100,
        'https://github.com/test/pr/123'
      );
      
      // Verify tags were handled
      expect(mockInsertTag.run).toHaveBeenCalledTimes(2);
      expect(mockLinkTag.run).toHaveBeenCalledTimes(2);
      
      // Verify file was handled
      expect(mockInsertFile.run).toHaveBeenCalledWith(127, 'normalized/path.ts', 'modified');
    });
  });
});