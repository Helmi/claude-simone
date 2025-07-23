import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export class DatabaseConnection {
  private db: Database.Database;
  
  constructor(projectPath: string) {
    const dbDir = join(projectPath, '.simone');
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true, mode: 0o755 });
    }
    
    const dbPath = join(dbDir, 'simone.db');
    this.db = new Database(dbPath, {
      readonly: false,
      fileMustExist: false,
      timeout: 5000
    });
    
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');
    
    // Enable WAL mode for better concurrent access
    this.db.pragma('journal_mode = WAL');
    
    // Set busy timeout to handle temporary locks
    this.db.pragma('busy_timeout = 10000');
    
    // Initialize schema if needed
    this.initializeSchema();
  }
  
  private initializeSchema() {
    // Check if tables exist
    const tableExists = this.db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='activity_log'"
    ).get();
    
    if (!tableExists) {
      // Execute schema
      const schemaSQL = `
-- Activity logging schema for Simone

-- Core activity log table
CREATE TABLE activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    activity TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    tool_name TEXT NOT NULL,
    success BOOLEAN DEFAULT 1,
    error TEXT,
    context TEXT,
    issue_number INTEGER,
    link TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Activity-specific tags table
CREATE TABLE activity_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

-- Many-to-many relationship for activity log tags
CREATE TABLE activity_log_tags (
    activity_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (activity_id, tag_id),
    FOREIGN KEY (activity_id) REFERENCES activity_log(id),
    FOREIGN KEY (tag_id) REFERENCES activity_tags(id)
);

-- Files affected by activities
CREATE TABLE activity_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id INTEGER,
    file_path TEXT NOT NULL,
    operation TEXT,
    FOREIGN KEY (activity_id) REFERENCES activity_log(id)
);

-- Indexes for performance
CREATE INDEX idx_activity_log_timestamp ON activity_log(timestamp);
CREATE INDEX idx_activity_log_tool_name ON activity_log(tool_name);
CREATE INDEX idx_activity_log_activity_type ON activity_log(activity_type);
CREATE INDEX idx_activity_log_success ON activity_log(success);
CREATE INDEX idx_activity_tags_name ON activity_tags(name);
      `;
      this.db.exec(schemaSQL);
    }
  }
  
  getDb(): Database.Database {
    return this.db;
  }
  
  close() {
    this.db.close();
  }
}