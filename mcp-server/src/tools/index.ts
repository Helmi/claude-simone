/**
 * @module ToolRegistry
 * @description Central registry for all MCP tools
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type Database from 'better-sqlite3';
import type { ActivityLogger} from './activity-logger/index.js';
import { activityLoggerTool, handleActivityLoggerTool } from './activity-logger/index.js';

/**
 * Tool definition that includes both schema and handler
 */
export interface ToolDefinition {
  tool: Tool;
  handler: (args: Record<string, any>, context: ToolContext) => Promise<CallToolResult>;
}

/**
 * Context passed to tool handlers
 */
export interface ToolContext {
  projectPath: string;
  activityLogger: ActivityLogger;
  database: Database.Database;
  // Add more shared services as needed
}

/**
 * Get all available tools
 */
export function getTools(context: ToolContext): Map<string, ToolDefinition> {
  const tools = new Map<string, ToolDefinition>();

  // Register activity logger tool
  tools.set('log_activity', {
    tool: activityLoggerTool,
    handler: async (args) => handleActivityLoggerTool(args, context.activityLogger),
  });

  // Future tools can be added here:
  // tools.set('create_task', { tool: createTaskTool, handler: handleCreateTask });
  // tools.set('analyze_code', { tool: analyzeCodeTool, handler: handleAnalyzeCode });

  return tools;
}

/**
 * Get tool schemas for listing
 */
export function getToolSchemas(tools: Map<string, ToolDefinition>): Tool[] {
  return Array.from(tools.values()).map(td => td.tool);
}

/**
 * Handle a tool call
 */
export async function handleToolCall(
  name: string,
  args: Record<string, any>,
  tools: Map<string, ToolDefinition>,
  context: ToolContext
): Promise<CallToolResult> {
  const toolDef = tools.get(name);
  
  if (!toolDef) {
    return {
      content: [
        {
          type: 'text',
          text: `Unknown tool: ${name}`,
        },
      ],
      isError: true,
    };
  }

  return toolDef.handler(args, context);
}