import type Database from 'better-sqlite3';
import type { LogActivityParams } from './types.js';
import { detectActivityType } from './activity-types.js';
import { normalizeFilePath } from './path-normalizer.js';
import { logError } from '../../utils/logger.js';

// Export the tool definition and handler
export { activityLoggerTool, handleActivityLoggerTool } from './tool.js';

export class ActivityLogger {
  private db: Database.Database;
  
  constructor(private projectPath: string, database: Database.Database) {
    this.db = database;
  }
  
  logActivity(params: LogActivityParams): { success: boolean; activityId?: number; error?: string } {
    try {
      // Detect activity type from description
      const activityType = detectActivityType(params.activity);
      
      // Begin transaction
      const transaction = this.db.transaction(() => {
        // Insert main activity
        const stmt = this.db.prepare(`
          INSERT INTO activity_log (activity, activity_type, tool_name, success, error, context, issue_number, link)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
          params.activity,
          activityType,
          params.tool_name,
          params.success !== false ? 1 : 0,
          params.error || null,
          params.context || null,
          params.issue_number || null,
          params.link || null
        );
        
        const activityId = result.lastInsertRowid as number;
        
        // Handle tags (up to 3)
        if (params.tags && params.tags.length > 0) {
          const tagsToInsert = params.tags.slice(0, 3);
          
          const insertTag = this.db.prepare('INSERT OR IGNORE INTO activity_tags (name) VALUES (?)');
          const getTagId = this.db.prepare('SELECT id FROM activity_tags WHERE name = ?');
          const linkTag = this.db.prepare('INSERT INTO activity_log_tags (activity_id, tag_id) VALUES (?, ?)');
          
          for (const tag of tagsToInsert) {
            insertTag.run(tag.toLowerCase());
            const tagRow = getTagId.get(tag.toLowerCase()) as { id: number };
            linkTag.run(activityId, tagRow.id);
          }
        }
        
        // Handle affected files
        if (params.files_affected && params.files_affected.length > 0) {
          const insertFile = this.db.prepare(`
            INSERT INTO activity_files (activity_id, file_path, operation)
            VALUES (?, ?, ?)
          `);
          
          for (const file of params.files_affected) {
            const normalizedPath = normalizeFilePath(file, this.projectPath);
            insertFile.run(activityId, normalizedPath, 'modified');
          }
        }
        
        return activityId;
      });
      
      const activityId = transaction();
      
      return { success: true, activityId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log error for debugging
      void logError(new Error(`[ActivityLogger.logActivity] Database operation failed: ${errorMessage}`));
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }
}