# Testing Documentation for Simone MCP Server

## Overview

The Simone MCP Server uses a comprehensive testing strategy to ensure reliability and maintainability. The test suite is built with Vitest and achieves high code coverage across all modules.

## Test Structure

```
src/
├── __tests__/
│   ├── fixtures/          # Reusable test data
│   │   ├── activity-log.ts
│   │   ├── config.ts
│   │   ├── index.ts
│   │   └── prompts.ts
│   ├── utils/             # Test utilities
│   │   ├── mcp-transport-mock.ts
│   │   ├── test-database.ts
│   │   └── test-fixtures.ts
│   └── server.integration.test.ts
├── config/__tests__/
│   └── loader.test.ts
├── templates/__tests__/
│   ├── context.test.ts
│   ├── handler.test.ts
│   ├── helpers.test.ts
│   └── loader.test.ts
└── tools/
    ├── __tests__/
    │   ├── database.test.ts
    │   └── index.test.ts
    └── activity-logger/__tests__/
        ├── activity-types.test.ts
        ├── index.test.ts
        ├── path-normalizer.test.ts
        └── tool.test.ts
```

## Testing Stack

- **Test Framework**: Vitest 3.2.4
- **Coverage**: @vitest/coverage-v8
- **Database Testing**: better-sqlite3 with in-memory databases
- **Mocking**: Vitest's built-in mocking capabilities

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test src/config/__tests__/loader.test.ts
```

## Test Categories

### 1. Unit Tests

Unit tests cover individual modules in isolation:

- **Configuration Loader**: Tests for loading and merging YAML configurations
- **Template System**: Tests for Handlebars template compilation and rendering
- **Activity Logger**: Tests for activity tracking and database operations
- **Tool Handlers**: Tests for MCP tool registration and execution
- **Utilities**: Tests for path normalization, context detection, etc.

### 2. Integration Tests

Integration tests verify component interactions:

- **MCP Server**: Tests the full server lifecycle, request handling, and graceful shutdown
- **Database Integration**: Tests schema initialization and data persistence
- **Template Loading**: Tests the complete prompt loading and rendering pipeline

### 3. Test Utilities

#### Mock Transport (`mcp-transport-mock.ts`)

Simulates MCP transport for testing server communication:

```typescript
const transport = new MockTransport();
transport.simulateMessage({
  jsonrpc: '2.0',
  method: 'tools/call',
  params: { name: 'log_activity', arguments: {...} }
});
```

#### Test Database (`test-database.ts`)

Creates in-memory SQLite databases for testing:

```typescript
const db = createTestDatabase();
// Includes full schema initialization
// Supports data seeding for tests
```

#### Fixtures

Reusable test data organized by domain:

- **Prompts**: Various YAML prompt configurations
- **Config**: Configuration file samples
- **Activity Log**: Sample activity data
- **MCP Messages**: Mock request/response patterns

## Testing Patterns

### 1. Database Testing

```typescript
describe('DatabaseConnection', () => {
  let db: Database.Database;
  
  beforeEach(() => {
    db = createTestDatabase();
  });
  
  afterEach(() => {
    if (db?.open) db.close();
  });
  
  it('should handle transactions', () => {
    // Test transactional operations
  });
});
```

### 2. Async Operations

```typescript
it('should handle async template loading', async () => {
  const loader = new TemplateLoader(projectPath);
  const prompt = await loader.loadPrompt('test-prompt');
  expect(prompt).toBeDefined();
});
```

### 3. Error Handling

```typescript
it('should handle missing prompts gracefully', async () => {
  const messages = await handler.getPromptMessages('non-existent', {});
  expect(messages[0].content.text).toContain('error');
});
```

### 4. Mocking File System

```typescript
vi.mock('fs/promises', () => ({
  readFile: vi.fn().mockResolvedValue('mocked content'),
  readdir: vi.fn().mockResolvedValue(['file1.yaml', 'file2.yaml']),
  stat: vi.fn().mockResolvedValue({ mtimeMs: Date.now() })
}));
```

## Coverage Configuration

The project targets 80% code coverage with specific thresholds:

```typescript
// vitest.config.ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'html', 'lcov'],
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 70,
    statements: 80
  }
}
```

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on execution order
2. **Descriptive Names**: Use clear, descriptive test names that explain what is being tested
3. **Arrange-Act-Assert**: Follow the AAA pattern for test structure
4. **Mock External Dependencies**: Mock file system, network, and database operations when appropriate
5. **Test Edge Cases**: Include tests for error conditions, empty inputs, and boundary values
6. **Use Fixtures**: Leverage test fixtures for consistent test data
7. **Clean Up**: Always clean up resources (close databases, restore mocks) in afterEach hooks

## Common Testing Scenarios

### Testing Prompt Loading

```typescript
it('should load and render prompt with arguments', async () => {
  const handler = new PromptHandler(loader, projectPath);
  const messages = await handler.getPromptMessages('test-prompt', {
    arg1: 'value1',
    arg2: 'value2'
  });
  
  expect(messages).toHaveLength(1);
  expect(messages[0].content.text).toContain('value1');
});
```

### Testing Tool Execution

```typescript
it('should execute tool and return result', async () => {
  const result = await handleToolCall(
    'log_activity',
    { activity: 'Test', tool_name: 'test' },
    tools,
    context
  );
  
  expect(result.isError).toBeUndefined();
  expect(result.content[0].text).toContain('success');
});
```

### Testing Configuration Loading

```typescript
it('should merge context and shared configuration', () => {
  const config = loader.loadConfig();
  const context = loader.getContextConfig('backend');
  
  expect(context.tools.github.credentials.method).toBe('github-cli');
});
```

## Debugging Tests

1. **Run single test**: Use `.only` to focus on a specific test
2. **Debug output**: Use `console.log` or Vitest's debug mode
3. **Check mocks**: Verify mock calls with `expect(mockFn).toHaveBeenCalledWith(...)`
4. **Inspect database**: Query test database directly in tests

## Future Improvements

1. **E2E Tests**: Add end-to-end tests with actual MCP client
2. **Performance Tests**: Add benchmarks for critical paths
3. **Snapshot Testing**: Use for template output verification
4. **Property-Based Testing**: Add generative tests for edge cases
5. **Visual Regression**: For any UI components