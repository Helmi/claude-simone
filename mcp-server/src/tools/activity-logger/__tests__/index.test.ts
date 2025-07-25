import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ActivityLogger } from '../index.js';
import { createTestDatabase } from '../../../__tests__/utils/test-database.js';
import type { LogActivityParams } from '../types.js';
import Database from 'better-sqlite3';

// Mock the logger
vi.mock('../../../utils/logger.js', () => ({
  logError: vi.fn()
}));

describe('ActivityLogger', () => {
  let db: Database.Database;
  let activityLogger: ActivityLogger;
  const projectPath = '/test/project';

  beforeEach(() => {
    vi.clearAllMocks();
    db = createTestDatabase();
    activityLogger = new ActivityLogger(projectPath, db);
  });

  afterEach(() => {
    db.close();
  });

  describe('logActivity', () => {
    it('should log a basic activity successfully', () => {
      const params: LogActivityParams = {
        activity: 'Created test file',
        tool_name: 'test-tool',
      };

      const result = activityLogger.logActivity(params);

      expect(result.success).toBe(true);
      expect(result.activityId).toBeDefined();
      expect(typeof result.activityId).toBe('number');

      // Verify data was inserted
      const row = db.prepare('SELECT * FROM activity_log WHERE id = ?').get(result.activityId) as any;
      expect(row.activity).toBe('Created test file');
      expect(row.activity_type).toBe('create');
      expect(row.tool_name).toBe('test-tool');
      expect(row.success).toBe(1);
      expect(row.error).toBeNull();
    });

    it('should log activity with all optional parameters', () => {
      const params: LogActivityParams = {
        activity: 'Fixed authentication bug',
        tool_name: 'bug-fixer',
        success: false,
        error: 'Failed to apply patch',
        tags: ['bug-fix', 'authentication', 'critical'],
        context: 'Attempted to fix login issue',
        files_affected: ['src/auth.ts', '/test/project/src/login.ts'],
        issue_number: 123,
        link: 'https://github.com/user/repo/issues/123'
      };

      const result = activityLogger.logActivity(params);

      expect(result.success).toBe(true);
      expect(result.activityId).toBeDefined();

      // Verify main activity
      const activity = db.prepare('SELECT * FROM activity_log WHERE id = ?').get(result.activityId) as any;
      expect(activity.activity).toBe('Fixed authentication bug');
      expect(activity.activity_type).toBe('fix');
      expect(activity.tool_name).toBe('bug-fixer');
      expect(activity.success).toBe(0);
      expect(activity.error).toBe('Failed to apply patch');
      expect(activity.context).toBe('Attempted to fix login issue');
      expect(activity.issue_number).toBe(123);
      expect(activity.link).toBe('https://github.com/user/repo/issues/123');

      // Verify tags
      const tags = db.prepare(`
        SELECT t.name 
        FROM activity_tags t
        JOIN activity_log_tags alt ON t.id = alt.tag_id
        WHERE alt.activity_id = ?
        ORDER BY t.name
      `).all(result.activityId) as Array<{ name: string }>;
      expect(tags.map(t => t.name)).toEqual(['authentication', 'bug-fix', 'critical']);

      // Verify files
      const files = db.prepare(`
        SELECT file_path, operation 
        FROM activity_files 
        WHERE activity_id = ?
        ORDER BY file_path
      `).all(result.activityId) as Array<{ file_path: string; operation: string }>;
      expect(files).toHaveLength(2);
      expect(files[0]).toEqual({ file_path: 'src/auth.ts', operation: 'modified' });
      expect(files[1]).toEqual({ file_path: 'src/login.ts', operation: 'modified' });
    });

    it('should handle success parameter correctly', () => {
      // Test explicit true
      const result1 = activityLogger.logActivity({
        activity: 'Test 1',
        tool_name: 'test',
        success: true
      });
      expect(result1.success).toBe(true);
      const row1 = db.prepare('SELECT success FROM activity_log WHERE id = ?').get(result1.activityId) as any;
      expect(row1.success).toBe(1);

      // Test explicit false
      const result2 = activityLogger.logActivity({
        activity: 'Test 2',
        tool_name: 'test',
        success: false
      });
      expect(result2.success).toBe(true);
      const row2 = db.prepare('SELECT success FROM activity_log WHERE id = ?').get(result2.activityId) as any;
      expect(row2.success).toBe(0);

      // Test undefined (defaults to true)
      const result3 = activityLogger.logActivity({
        activity: 'Test 3',
        tool_name: 'test'
      });
      expect(result3.success).toBe(true);
      const row3 = db.prepare('SELECT success FROM activity_log WHERE id = ?').get(result3.activityId) as any;
      expect(row3.success).toBe(1);
    });

    it('should limit tags to 3', () => {
      const params: LogActivityParams = {
        activity: 'Test activity',
        tool_name: 'test',
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
      };

      const result = activityLogger.logActivity(params);
      expect(result.success).toBe(true);

      const tags = db.prepare(`
        SELECT COUNT(*) as count 
        FROM activity_log_tags 
        WHERE activity_id = ?
      `).get(result.activityId) as { count: number };
      expect(tags.count).toBe(3);
    });

    it('should normalize tag case to lowercase', () => {
      const params: LogActivityParams = {
        activity: 'Test activity',
        tool_name: 'test',
        tags: ['BUG-FIX', 'Authentication', 'CRITICAL']
      };

      const result = activityLogger.logActivity(params);
      expect(result.success).toBe(true);

      const tags = db.prepare(`
        SELECT t.name 
        FROM activity_tags t
        JOIN activity_log_tags alt ON t.id = alt.tag_id
        WHERE alt.activity_id = ?
      `).all(result.activityId) as Array<{ name: string }>;
      expect(tags.map(t => t.name).sort()).toEqual(['authentication', 'bug-fix', 'critical']);
    });

    it('should handle duplicate tags', () => {
      // First activity with tags
      activityLogger.logActivity({
        activity: 'First activity',
        tool_name: 'test',
        tags: ['bug-fix', 'testing']
      });

      // Second activity with overlapping tags
      const result = activityLogger.logActivity({
        activity: 'Second activity',
        tool_name: 'test',
        tags: ['bug-fix', 'testing', 'new-tag']
      });

      expect(result.success).toBe(true);
      
      // Verify tags table doesn't have duplicates
      const allTags = db.prepare('SELECT name FROM activity_tags ORDER BY name').all() as Array<{ name: string }>;
      const uniqueTags = [...new Set(allTags.map(t => t.name))];
      expect(allTags.length).toBe(uniqueTags.length);
    });

    it('should normalize file paths', () => {
      const params: LogActivityParams = {
        activity: 'Modified files',
        tool_name: 'test',
        files_affected: [
          '/test/project/src/absolute.ts',
          './src/relative.ts',
          'src/already-relative.ts',
          '  src/with-spaces.ts  '
        ]
      };

      const result = activityLogger.logActivity(params);
      expect(result.success).toBe(true);

      const files = db.prepare(`
        SELECT file_path 
        FROM activity_files 
        WHERE activity_id = ?
        ORDER BY file_path
      `).all(result.activityId) as Array<{ file_path: string }>;
      
      expect(files.map(f => f.file_path)).toEqual([
        'src/absolute.ts',
        'src/already-relative.ts',
        'src/relative.ts',
        'src/with-spaces.ts'
      ]);
    });

    it('should handle database errors gracefully', () => {
      // Close the database to cause an error
      db.close();

      const result = activityLogger.logActivity({
        activity: 'Test activity',
        tool_name: 'test'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('database connection is not open');
      expect(result.activityId).toBeUndefined();
    });

    it('should handle constraint violations', () => {
      // Mock prepare to throw a constraint error
      const originalPrepare = db.prepare.bind(db);
      db.prepare = vi.fn().mockImplementation((sql: string) => {
        if (sql.includes('INSERT INTO activity_log')) {
          return {
            run: () => { throw new Error('UNIQUE constraint failed'); }
          };
        }
        return originalPrepare(sql);
      });

      const result = activityLogger.logActivity({
        activity: 'Test activity',
        tool_name: 'test'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('UNIQUE constraint failed');
    });

    it('should rollback transaction on error', () => {
      // Use a fresh logger instance to ensure clean state
      const freshLogger = new ActivityLogger(projectPath, db);
      
      // Count activities before
      const countBefore = (db.prepare('SELECT COUNT(*) as count FROM activity_log').get() as { count: number }).count;

      // Mock the database transaction to throw an error
      const originalTransaction = db.transaction.bind(db);
      db.transaction = vi.fn().mockImplementation((fn: Function) => {
        // Create a wrapper that will throw during execution
        return () => {
          // Start the transaction
          const begin = db.prepare('BEGIN');
          begin.run();
          
          try {
            // Try to run some of the function
            throw new Error('Tag insertion failed');
          } catch (e) {
            // Rollback
            const rollback = db.prepare('ROLLBACK');
            rollback.run();
            throw e;
          }
        };
      });

      const result = freshLogger.logActivity({
        activity: 'Test activity',
        tool_name: 'test',
        tags: ['tag1', 'tag2']
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Tag insertion failed');

      // Restore original transaction
      db.transaction = originalTransaction;

      // Verify rollback - count should be unchanged
      const countAfter = (db.prepare('SELECT COUNT(*) as count FROM activity_log').get() as { count: number }).count;
      expect(countAfter).toBe(countBefore);
    });

    it('should handle null and undefined values correctly', () => {
      const params: LogActivityParams = {
        activity: 'Test activity',
        tool_name: 'test',
        error: undefined,
        context: null as any,
        issue_number: undefined,
        link: null as any
      };

      const result = activityLogger.logActivity(params);
      expect(result.success).toBe(true);

      const row = db.prepare('SELECT * FROM activity_log WHERE id = ?').get(result.activityId) as any;
      expect(row.error).toBeNull();
      expect(row.context).toBeNull();
      expect(row.issue_number).toBeNull();
      expect(row.link).toBeNull();
    });

    it('should handle empty arrays', () => {
      const params: LogActivityParams = {
        activity: 'Test activity',
        tool_name: 'test',
        tags: [],
        files_affected: []
      };

      const result = activityLogger.logActivity(params);
      expect(result.success).toBe(true);

      // Verify no tags were inserted
      const tagCount = (db.prepare(`
        SELECT COUNT(*) as count 
        FROM activity_log_tags 
        WHERE activity_id = ?
      `).get(result.activityId) as { count: number }).count;
      expect(tagCount).toBe(0);

      // Verify no files were inserted
      const fileCount = (db.prepare(`
        SELECT COUNT(*) as count 
        FROM activity_files 
        WHERE activity_id = ?
      `).get(result.activityId) as { count: number }).count;
      expect(fileCount).toBe(0);
    });

    it('should detect correct activity types', () => {
      const testCases = [
        { activity: 'Created new feature', expectedType: 'create' },
        { activity: 'Updated documentation', expectedType: 'update' },
        { activity: 'Fixed critical bug', expectedType: 'fix' },
        { activity: 'Reviewed pull request', expectedType: 'review' },
        { activity: 'Researched solutions', expectedType: 'research' }
      ];

      testCases.forEach(({ activity, expectedType }) => {
        const result = activityLogger.logActivity({
          activity,
          tool_name: 'test'
        });

        expect(result.success).toBe(true);
        
        const row = db.prepare('SELECT activity_type FROM activity_log WHERE id = ?').get(result.activityId) as any;
        expect(row.activity_type).toBe(expectedType);
      });
    });
  });
});