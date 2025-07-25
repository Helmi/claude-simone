import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

export function createTestDatabase(): Database.Database {
  // Create in-memory database for testing
  const db = new Database(':memory:');
  
  // Initialize schema from the SQL file
  const schemaPath = join(__dirname, '../../tools/activity-logger/schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  
  db.exec(schema);
  
  return db;
}

export function seedTestDatabase(db: Database.Database): void {
  const insertActivity = db.prepare(`
    INSERT INTO activities (
      tool_name, activity, activity_type, tags, 
      success, error, context, files_affected, 
      issue_number, link
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Seed with sample activities
  const sampleActivities = [
    {
      tool_name: 'test-tool',
      activity: 'Created test file for authentication module',
      activity_type: 'create',
      tags: JSON.stringify(['testing', 'authentication']),
      success: 1,
      error: null,
      context: JSON.stringify({ test: true }),
      files_affected: JSON.stringify(['src/auth/auth.test.ts']),
      issue_number: 123,
      link: 'https://github.com/test/test/issues/123'
    },
    {
      tool_name: 'test-tool',
      activity: 'Fixed bug in user validation',
      activity_type: 'fix',
      tags: JSON.stringify(['bug-fix', 'validation']),
      success: 1,
      error: null,
      context: null,
      files_affected: JSON.stringify(['src/validation/user.ts']),
      issue_number: null,
      link: null
    },
    {
      tool_name: 'test-tool',
      activity: 'Failed to update configuration',
      activity_type: 'update',
      tags: JSON.stringify(['configuration']),
      success: 0,
      error: 'Permission denied',
      context: null,
      files_affected: null,
      issue_number: null,
      link: null
    }
  ];

  sampleActivities.forEach(activity => {
    insertActivity.run(
      activity.tool_name,
      activity.activity,
      activity.activity_type,
      activity.tags,
      activity.success,
      activity.error,
      activity.context,
      activity.files_affected,
      activity.issue_number,
      activity.link
    );
  });
}

export function cleanupTestDatabase(db: Database.Database): void {
  if (db && !db.closed) {
    db.close();
  }
}