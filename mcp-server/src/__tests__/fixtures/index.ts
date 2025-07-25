/**
 * Central export for all test fixtures
 */

export * from './prompts.js';
export * from './config.js';
export * from './activity-log.js';

/**
 * Common test constants
 */
export const TEST_PROJECT_PATH = '/test/project';
export const TEST_TIMEOUT = 5000;

/**
 * Mock file system structure
 */
export const mockFileSystem = {
  '/test/project': {
    '.simone': {
      'prompts': {
        'test-prompt.yaml': 'prompt content',
        'another-prompt.yaml': 'another content'
      },
      'partials': {
        'common.hbs': '{{> header}}\n{{> footer}}',
        'header.hbs': '<header>{{title}}</header>',
        'footer.hbs': '<footer>Copyright {{year}}</footer>'
      },
      'config.yaml': 'config content',
      'simone.db': 'database file'
    },
    'src': {
      'index.ts': 'export default function() {}',
      'utils.ts': 'export const helper = () => {}'
    },
    'package.json': JSON.stringify({
      name: 'test-project',
      version: '1.0.0',
      dependencies: {}
    }),
    'README.md': '# Test Project',
    'CLAUDE.md': '# Claude Instructions\n\nTest instructions'
  }
};

/**
 * Mock MCP message samples
 */
export const mockMcpMessages = {
  listPromptsRequest: {
    jsonrpc: '2.0',
    id: 1,
    method: 'prompts/list',
    params: {}
  },
  getPromptRequest: {
    jsonrpc: '2.0',
    id: 2,
    method: 'prompts/get',
    params: {
      name: 'test-prompt',
      arguments: {
        arg1: 'value1'
      }
    }
  },
  listToolsRequest: {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/list',
    params: {}
  },
  callToolRequest: {
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'log_activity',
      arguments: {
        activity: 'Test activity',
        tool_name: 'test'
      }
    }
  }
};

/**
 * Error scenarios for testing
 */
export const errorScenarios = {
  databaseErrors: [
    { 
      error: new Error('SQLITE_BUSY: database is locked'),
      type: 'busy'
    },
    {
      error: new Error('SQLITE_FULL: database or disk is full'),
      type: 'full'
    },
    {
      error: new Error('SQLITE_CONSTRAINT: UNIQUE constraint failed'),
      type: 'constraint'
    }
  ],
  fileSystemErrors: [
    {
      error: new Error('ENOENT: no such file or directory'),
      type: 'notFound'
    },
    {
      error: new Error('EACCES: permission denied'),
      type: 'permission'
    },
    {
      error: new Error('EISDIR: illegal operation on a directory'),
      type: 'isDirectory'
    }
  ],
  networkErrors: [
    {
      error: new Error('ECONNREFUSED: Connection refused'),
      type: 'connectionRefused'
    },
    {
      error: new Error('ETIMEDOUT: Request timeout'),
      type: 'timeout'
    }
  ]
};