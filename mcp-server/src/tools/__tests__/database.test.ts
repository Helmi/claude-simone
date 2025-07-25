import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseConnection } from '../database.js';
import { join } from 'path';
import { mkdirSync, rmSync, existsSync } from 'fs';
import { tmpdir } from 'os';

// Mock the logger
vi.mock('../../utils/logger.js', () => ({
  logError: vi.fn().mockResolvedValue(undefined),
  logDebug: vi.fn().mockResolvedValue(undefined),
}));

describe('DatabaseConnection', () => {
  let testProjectPath: string;
  let dbConnection: DatabaseConnection;

  beforeEach(() => {
    // Create temporary test directory
    testProjectPath = join(tmpdir(), `db-test-${Date.now()}`);
    mkdirSync(testProjectPath, { recursive: true });
  });

  afterEach(() => {
    // Close connection if exists
    if (dbConnection) {
      try {
        dbConnection.close();
      } catch (error) {
        // Ignore close errors
      }
    }

    // Clean up test directory
    try {
      rmSync(testProjectPath, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('constructor', () => {
    it('should create database in .simone directory', () => {
      dbConnection = new DatabaseConnection(testProjectPath);
      
      const dbPath = join(testProjectPath, '.simone', 'simone.db');
      expect(existsSync(dbPath)).toBe(true);
    });

    it('should create .simone directory if it does not exist', () => {
      const simoneDir = join(testProjectPath, '.simone');
      expect(existsSync(simoneDir)).toBe(false);
      
      dbConnection = new DatabaseConnection(testProjectPath);
      
      expect(existsSync(simoneDir)).toBe(true);
    });

    it('should handle existing .simone directory', () => {
      const simoneDir = join(testProjectPath, '.simone');
      mkdirSync(simoneDir, { recursive: true });
      
      expect(() => {
        dbConnection = new DatabaseConnection(testProjectPath);
      }).not.toThrow();
    });

    it('should set correct database pragmas', () => {
      dbConnection = new DatabaseConnection(testProjectPath);
      const db = dbConnection.getDb();
      
      // Check foreign keys (returns array with object)
      const foreignKeys = db.pragma('foreign_keys');
      expect(foreignKeys[0].foreign_keys).toBe(1);
      
      // Check journal mode (returns array with object)
      const journalMode = db.pragma('journal_mode');
      expect(journalMode[0].journal_mode).toBe('wal');
      
      // Check busy timeout (returns array with object)
      const busyTimeout = db.pragma('busy_timeout');
      expect(busyTimeout[0].timeout).toBe(10000);
    });

    it('should initialize schema on first run', () => {
      dbConnection = new DatabaseConnection(testProjectPath);
      const db = dbConnection.getDb();
      
      // Check tables exist
      const tables = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
      ).all() as Array<{ name: string }>;
      
      const tableNames = tables.map(t => t.name);
      expect(tableNames).toContain('activity_log');
      expect(tableNames).toContain('activity_tags');
      expect(tableNames).toContain('activity_log_tags');
      expect(tableNames).toContain('activity_files');
    });

    it('should not reinitialize schema on subsequent runs', () => {
      // First connection
      dbConnection = new DatabaseConnection(testProjectPath);
      const db1 = dbConnection.getDb();
      
      // Insert test data
      db1.prepare('INSERT INTO activity_tags (name) VALUES (?)').run('test-tag');
      
      dbConnection.close();
      
      // Second connection
      dbConnection = new DatabaseConnection(testProjectPath);
      const db2 = dbConnection.getDb();
      
      // Check test data still exists
      const tag = db2.prepare('SELECT * FROM activity_tags WHERE name = ?').get('test-tag') as any;
      expect(tag).toBeDefined();
      expect(tag.name).toBe('test-tag');
    });

    it('should handle permission errors', () => {
      // Create read-only directory
      const readOnlyDir = join(testProjectPath, '.simone');
      mkdirSync(readOnlyDir, { recursive: true, mode: 0o444 });
      
      // This might not work on all systems, so we'll just check it doesn't crash
      try {
        dbConnection = new DatabaseConnection(testProjectPath);
        // If it succeeds, that's fine (some systems ignore mode)
        expect(dbConnection).toBeDefined();
      } catch (error) {
        // If it fails, check for appropriate error
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Database initialization failed');
      }
    });
  });

  describe('getDb', () => {
    it('should return Database instance', () => {
      dbConnection = new DatabaseConnection(testProjectPath);
      const db = dbConnection.getDb();
      
      expect(db).toBeDefined();
      expect(db.constructor.name).toBe('Database');
    });

    it('should return same instance on multiple calls', () => {
      dbConnection = new DatabaseConnection(testProjectPath);
      const db1 = dbConnection.getDb();
      const db2 = dbConnection.getDb();
      
      expect(db1).toBe(db2);
    });
  });

  describe('close', () => {
    it('should close database connection', () => {
      dbConnection = new DatabaseConnection(testProjectPath);
      const db = dbConnection.getDb();
      
      expect(db.open).toBe(true);
      
      dbConnection.close();
      
      expect(db.open).toBe(false);
    });

    it('should handle multiple close calls', () => {
      dbConnection = new DatabaseConnection(testProjectPath);
      
      expect(() => {
        dbConnection.close();
        dbConnection.close();
      }).not.toThrow();
    });
  });

  describe('schema validation', () => {
    beforeEach(() => {
      dbConnection = new DatabaseConnection(testProjectPath);
    });

    it('should create activity_log table with correct schema', () => {
      const db = dbConnection.getDb();
      const columns = db.pragma('table_info(activity_log)') as Array<{
        name: string;
        type: string;
        notnull: number;
        dflt_value: any;
        pk: number;
      }>;
      
      const columnMap = new Map(columns.map(c => [c.name, c]));
      
      expect(columnMap.has('id')).toBe(true);
      expect(columnMap.get('id')?.pk).toBe(1);
      
      expect(columnMap.has('timestamp')).toBe(true);
      expect(columnMap.has('activity')).toBe(true);
      expect(columnMap.get('activity')?.notnull).toBe(1);
      
      expect(columnMap.has('activity_type')).toBe(true);
      expect(columnMap.get('activity_type')?.notnull).toBe(1);
      
      expect(columnMap.has('tool_name')).toBe(true);
      expect(columnMap.get('tool_name')?.notnull).toBe(1);
      
      expect(columnMap.has('success')).toBe(true);
      expect(columnMap.has('error')).toBe(true);
      expect(columnMap.has('context')).toBe(true);
      expect(columnMap.has('issue_number')).toBe(true);
      expect(columnMap.has('link')).toBe(true);
    });

    it('should create proper indexes', () => {
      const db = dbConnection.getDb();
      const indexes = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'"
      ).all() as Array<{ name: string }>;
      
      const indexNames = indexes.map(i => i.name);
      
      expect(indexNames).toContain('idx_activity_log_timestamp');
      expect(indexNames).toContain('idx_activity_log_tool_name');
      expect(indexNames).toContain('idx_activity_log_activity_type');
      expect(indexNames).toContain('idx_activity_log_success');
      expect(indexNames).toContain('idx_activity_tags_name');
    });

    it('should enforce foreign key constraints', () => {
      const db = dbConnection.getDb();
      
      // Try to insert invalid activity_log_tags entry
      expect(() => {
        db.prepare(
          'INSERT INTO activity_log_tags (activity_id, tag_id) VALUES (?, ?)'
        ).run(999, 999);
      }).toThrow();
    });

    it('should handle activity logging workflow', () => {
      const db = dbConnection.getDb();
      
      // Insert activity
      const activityResult = db.prepare(`
        INSERT INTO activity_log (activity, activity_type, tool_name, success)
        VALUES (?, ?, ?, ?)
      `).run('Test activity', 'test', 'test-tool', 1);
      
      const activityId = activityResult.lastInsertRowid;
      
      // Insert tag
      const tagResult = db.prepare('INSERT INTO activity_tags (name) VALUES (?)').run('test-tag');
      const tagId = tagResult.lastInsertRowid;
      
      // Link activity to tag
      db.prepare('INSERT INTO activity_log_tags (activity_id, tag_id) VALUES (?, ?)').run(activityId, tagId);
      
      // Insert affected file
      db.prepare(`
        INSERT INTO activity_files (activity_id, file_path, operation)
        VALUES (?, ?, ?)
      `).run(activityId, '/test/file.ts', 'create');
      
      // Verify data integrity
      const activity = db.prepare('SELECT * FROM activity_log WHERE id = ?').get(activityId) as any;
      expect(activity.activity).toBe('Test activity');
      
      const tags = db.prepare(`
        SELECT t.name FROM activity_tags t
        JOIN activity_log_tags alt ON t.id = alt.tag_id
        WHERE alt.activity_id = ?
      `).all(activityId) as Array<{ name: string }>;
      expect(tags[0].name).toBe('test-tag');
      
      const files = db.prepare('SELECT * FROM activity_files WHERE activity_id = ?').all(activityId) as any[];
      expect(files[0].file_path).toBe('/test/file.ts');
    });
  });

  describe('error handling', () => {
    it('should handle invalid project path', () => {
      // Try to create database in a path that can't exist
      const invalidPath = '/\0invalid\0path';
      
      expect(() => {
        new DatabaseConnection(invalidPath);
      }).toThrow('Database initialization failed');
    });
  });
});