/**
 * @module ActivityLoggerTool
 * @description MCP tool definition for activity logging functionality
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ActivityLogger } from './index.js';
import { logError } from '../../utils/logger.js';

/**
 * Tool schema definition for the activity logger
 */
export const activityLoggerTool: Tool = {
  name: 'log_activity',
  description: `Log your AI-assisted development activities to track progress and patterns.

Required parameters:
- activity: Describe what you did (e.g., "Created GitHub issue for authentication refactor")
- tool_name: The tool or feature used (e.g., "create-task", "github-cli", "code-analysis")

Optional parameters:
- success: Whether the operation succeeded (defaults to true)
- error: Error message if the operation failed
- tags: Up to 3 categories from: [task-management, github, feature, improvement, refactoring, bug-fix, research, documentation, testing, configuration, review, planning, analysis] - or create your own if needed
- context: Additional notes or outcomes
- files_affected: List of files created/modified/deleted
- issue_number: Related GitHub issue number
- link: Relevant URL (GitHub issue, PR, documentation, etc.)

The system will automatically:
- Add a timestamp
- Determine activity type (create, update, fix, etc.) from your description
- Store the data for analysis and reporting

IMPORTANT: Only log factual information. Do not estimate or invent data.`,
  inputSchema: {
    type: 'object',
    properties: {
      activity: {
        type: 'string',
        description: 'What was done',
      },
      tool_name: {
        type: 'string',
        description: 'Tool or feature used',
      },
      success: {
        type: 'boolean',
        description: 'Whether the operation succeeded',
        default: true,
      },
      error: {
        type: 'string',
        description: 'Error message if failed',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Categories (max 3)',
      },
      context: {
        type: 'string',
        description: 'Additional notes',
      },
      files_affected: {
        type: 'array',
        items: { type: 'string' },
        description: 'Files created/modified/deleted',
      },
      issue_number: {
        type: 'number',
        description: 'Related GitHub issue number',
      },
      link: {
        type: 'string',
        description: 'Relevant URL',
      },
    },
    required: ['activity', 'tool_name'],
  },
};

/**
 * Handler function for the activity logger tool
 */
export async function handleActivityLoggerTool(
  args: Record<string, any>,
  logger: ActivityLogger
): Promise<CallToolResult> {
  try {
    const result = logger.logActivity(args as any);
    
    if (result.success) {
      return {
        content: [
          {
            type: 'text',
            text: `📋 Activity logged successfully (ID: ${result.activityId})`,
          },
        ],
      };
    } else {
      // Log server-side for debugging
      void logError(new Error(`[ACTIVITY LOGGER ERROR] Failed to log activity: ${result.error}`));
      
      return {
        content: [
          {
            type: 'text',
            text: `⚠️ CRITICAL ERROR - PLEASE REPORT TO USER: Failed to log activity due to database error: ${result.error}\n\nThis error indicates a problem with the Simone database. The user should be made aware of this issue as it prevents activity tracking from working properly.`,
          },
        ],
        isError: true,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Log server-side for debugging
    void logError(new Error(`[ACTIVITY LOGGER ERROR] Unexpected error: ${errorMessage}`));
    
    return {
      content: [
        {
          type: 'text',
          text: `⚠️ CRITICAL ERROR - PLEASE REPORT TO USER: Unexpected error in activity logger: ${errorMessage}\n\nThis error should be reported to the user as it indicates a problem with the Simone activity tracking system.`,
        },
      ],
      isError: true,
    };
  }
}