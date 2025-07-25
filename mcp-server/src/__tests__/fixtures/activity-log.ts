/**
 * Test fixtures for activity logging
 */

export const sampleActivities = [
  {
    activity: 'Created user authentication module',
    activity_type: 'create',
    tool_name: 'code-generator',
    success: true,
    tags: ['authentication', 'feature', 'backend'],
    context: 'Implementing JWT-based authentication for the API',
    files_affected: ['src/auth/jwt.ts', 'src/auth/middleware.ts'],
    issue_number: 123,
    link: 'https://github.com/owner/repo/pull/456'
  },
  {
    activity: 'Fixed memory leak in event handler',
    activity_type: 'fix',
    tool_name: 'debugger',
    success: true,
    tags: ['bug-fix', 'performance', 'critical'],
    context: 'Event listeners were not being properly removed',
    files_affected: ['src/events/handler.ts'],
    issue_number: 789,
    link: 'https://github.com/owner/repo/issues/789'
  },
  {
    activity: 'Updated API documentation',
    activity_type: 'update',
    tool_name: 'doc-generator',
    success: true,
    tags: ['documentation', 'api'],
    context: 'Added examples for new endpoints',
    files_affected: ['docs/api/endpoints.md', 'docs/api/examples.md']
  },
  {
    activity: 'Deployed to production',
    activity_type: 'deploy',
    tool_name: 'ci-cd',
    success: false,
    error: 'Health check failed after deployment',
    tags: ['deployment', 'production'],
    context: 'Version 2.1.0 deployment attempt'
  },
  {
    activity: 'Researched caching strategies',
    activity_type: 'research',
    tool_name: 'browser',
    success: true,
    tags: ['research', 'performance', 'caching'],
    context: 'Evaluating Redis vs Memcached for session storage'
  }
];

export const activityWithAllFields = {
  activity: 'Comprehensive test activity',
  activity_type: 'test',
  tool_name: 'test-runner',
  success: true,
  error: null,
  tags: ['test', 'comprehensive', 'fixture'],
  context: 'This activity has all possible fields filled',
  files_affected: ['test/file1.ts', 'test/file2.ts', 'test/file3.ts'],
  issue_number: 999,
  link: 'https://example.com/test'
};

export const activityWithMinimalFields = {
  activity: 'Minimal activity',
  tool_name: 'minimal-tool'
};

export const failedActivity = {
  activity: 'Failed database migration',
  activity_type: 'update',
  tool_name: 'migration-tool',
  success: false,
  error: 'Column "user_id" already exists',
  tags: ['database', 'migration', 'error'],
  context: 'Attempting to add user_id column to posts table'
};

export const activitiesForFiltering = [
  {
    activity: 'Task 1',
    activity_type: 'create',
    tool_name: 'tool-a',
    success: true,
    tags: ['frontend', 'react'],
    timestamp: '2024-01-01T10:00:00Z'
  },
  {
    activity: 'Task 2',
    activity_type: 'update',
    tool_name: 'tool-b',
    success: true,
    tags: ['backend', 'api'],
    timestamp: '2024-01-01T11:00:00Z'
  },
  {
    activity: 'Task 3',
    activity_type: 'fix',
    tool_name: 'tool-a',
    success: false,
    error: 'Test error',
    tags: ['frontend', 'bug'],
    timestamp: '2024-01-01T12:00:00Z'
  },
  {
    activity: 'Task 4',
    activity_type: 'create',
    tool_name: 'tool-c',
    success: true,
    tags: ['backend', 'database'],
    timestamp: '2024-01-02T10:00:00Z'
  }
];

export const longActivity = {
  activity: 'A'.repeat(1000), // Very long activity description
  tool_name: 'stress-test',
  context: 'B'.repeat(500), // Long context
  files_affected: Array.from({ length: 100 }, (_, i) => `file${i}.ts`) // Many files
};

export const specialCharacterActivity = {
  activity: "Activity with 'quotes' and \"double quotes\"",
  tool_name: "tool's name",
  context: `Multi-line
context with
special chars: \t\n\r`,
  tags: ['tag-with-dash', 'tag_with_underscore', 'tag.with.dot'],
  link: 'https://example.com?query=value&other=123#fragment'
};

export const activityTypes = [
  'create',
  'update',
  'fix',
  'review',
  'research',
  'document',
  'test',
  'deploy',
  'configure',
  'refactor',
  'delete',
  'analyze',
  'plan',
  'debug'
];

export const commonTags = [
  'bug-fix',
  'feature',
  'enhancement',
  'documentation',
  'testing',
  'refactoring',
  'performance',
  'security',
  'ui-ux',
  'api',
  'database',
  'infrastructure',
  'ci-cd',
  'dependency-update',
  'breaking-change'
];