#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  type GetPromptResult,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { watch } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { getEnvConfig } from './config/index.js';
import { initializeTemplating } from './templates/index.js';
import { initializeLogger, logError, logDebug } from './utils/logger.js';
import { ActivityLogger } from './tools/activity-logger/index.js';
import { getTools, getToolSchemas, handleToolCall, type ToolContext } from './tools/index.js';
import { DatabaseConnection } from './tools/database.js';
import type Database from 'better-sqlite3';

// Get configuration
const config = getEnvConfig();

// Initialize logger
initializeLogger(config.projectPath);

// Initialize templating system
const promptHandler = initializeTemplating(config.projectPath);

// Initialize database connection
let databaseConnection: DatabaseConnection;
let database: Database.Database;

try {
  databaseConnection = new DatabaseConnection(config.projectPath);
  database = databaseConnection.getDb();
  logDebug('Database connection initialized successfully').catch(() => {});
} catch (error) {
  const errorMessage = `CRITICAL DATABASE ERROR: Failed to initialize database connection: ${error instanceof Error ? error.message : String(error)}`;
  logError(new Error(errorMessage)).then(() => {
    console.error(errorMessage); // Also output to console for immediate visibility
    process.exit(1);
  });
  throw error; // This will never be reached but satisfies TypeScript
}

// Initialize tool context
const toolContext: ToolContext = {
  projectPath: config.projectPath,
  activityLogger: new ActivityLogger(config.projectPath, database),
  database,
};

// Get available tools
const tools = getTools(toolContext);

// Create server instance
const server = new Server(
  {
    name: 'simone-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      prompts: {
        listChanged: true,
      },
      tools: {},
    },
  },
);

// Handle prompt listing
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  const availablePrompts = await promptHandler.listAvailablePrompts();
  
  // Convert to MCP format
  const prompts = availablePrompts.map(p => ({
    name: p.name,
    description: p.description,
    arguments: p.arguments?.map(arg => ({
      name: arg.name,
      description: arg.description,
      required: arg.required || false,
    })),
  }));

  return { prompts };
});

// Handle prompt retrieval
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const messages = await promptHandler.getPromptMessages(name, args || {});
  
  return {
    messages,
  } as GetPromptResult;
});

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: getToolSchemas(tools),
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  return handleToolCall(name, args || {}, tools, toolContext);
});

// Watch for prompt changes
async function watchPrompts() {
  const projectPromptsDir = join(config.projectPath, '.simone', 'prompts');
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const builtInPromptsDir = join(__dirname, 'templates', 'prompts');
  
  const watchDir = async (dir: string) => {
    try {
      watch(dir, { recursive: true }, (_eventType, filename) => {
        if (filename && (filename.endsWith('.yaml') || filename.endsWith('.hbs'))) {
          // Log asynchronously without blocking
          logDebug(`Detected change in: ${filename}`).catch(() => {});
          
          // Clear the template cache
          promptHandler.clearCache();
          
          // Send notification that prompts have changed
          server.notification({
            method: 'notifications/prompts/list_changed',
            params: {},
          }).then(() => {
            logDebug('Sent prompts/list_changed notification').catch(() => {});
          }).catch((error) => {
            logError(`Failed to send notification: ${error}`).catch(() => {});
          });
        }
      });
      await logDebug(`Watching directory: ${dir}`);
    } catch (error) {
      await logDebug(`Could not watch directory: ${dir} (this is okay if it doesn't exist)`);
    }
  };
  
  await watchDir(projectPromptsDir);
  
  // Only watch built-in prompts in development
  if (process.env['NODE_ENV'] !== 'production') {
    await watchDir(builtInPromptsDir);
  }
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Start watching for prompt changes
  await watchPrompts();
  await logDebug('Server started with prompt hot-reload enabled');
  
  // Server started successfully
}

main().catch(async (error) => {
  await logError(error instanceof Error ? error : new Error(String(error)));
  process.exit(1);
});

// Cleanup on exit
const handleShutdown = async (signal: string) => {
  try {
    await logDebug(`Received ${signal}, shutting down server...`);
    if (databaseConnection) {
      databaseConnection.close();
      await logDebug('Database connection closed');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));