import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildTemplateContext } from '../context.js';

describe('buildTemplateContext', () => {
  let mockDate: Date;

  beforeEach(() => {
    // Mock Date to have consistent test results
    mockDate = new Date('2024-01-15T14:30:45.123Z');
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create base context with project information', () => {
    const projectPath = '/home/user/projects/my-app';
    const context = buildTemplateContext(projectPath);

    expect(context).toMatchObject({
      PROJECT_PATH: projectPath,
      PROJECT_NAME: 'my-app',
      TIMESTAMP: '2024-01-15T14:30:45.123Z',
      CURRENT_DATE: expect.any(String),
      CURRENT_TIME: expect.any(String)
    });
  });

  it('should handle edge cases for project name extraction', () => {
    const testCases = [
      { path: '/simple/path', expected: 'path' },
      { path: '/path/with/trailing/', expected: 'trailing' }, // basename strips trailing slash
      { path: '/', expected: '' }, // basename of root is empty
      { path: '', expected: '' }, // basename of empty string is empty
      { path: 'relative/path', expected: 'path' },
      { path: './current', expected: 'current' },
      { path: '/path/with spaces/project', expected: 'project' },
      { path: '/path/with-dashes', expected: 'with-dashes' },
      { path: '/path/with_underscores', expected: 'with_underscores' }
    ];

    testCases.forEach(({ path, expected }) => {
      const context = buildTemplateContext(path);
      expect(context.PROJECT_NAME).toBe(expected);
    });
  });

  it('should merge additional arguments into context', () => {
    const projectPath = '/test/project';
    const additionalArgs = {
      customField: 'custom value',
      numberField: 42,
      booleanField: true,
      objectField: { nested: 'value' },
      arrayField: ['item1', 'item2']
    };

    const context = buildTemplateContext(projectPath, additionalArgs);

    expect(context).toMatchObject({
      PROJECT_PATH: projectPath,
      PROJECT_NAME: 'project',
      ...additionalArgs
    });
  });

  it('should allow additional args to override base fields', () => {
    const projectPath = '/test/project';
    const additionalArgs = {
      PROJECT_PATH: '/different/path',
      PROJECT_NAME: 'different-name',
      TIMESTAMP: 'different-timestamp',
      CURRENT_DATE: 'different-date',
      CURRENT_TIME: 'different-time',
      customField: 'allowed'
    };

    const context = buildTemplateContext(projectPath, additionalArgs);

    // Additional args override base fields (due to spread operator)
    expect(context.PROJECT_PATH).toBe('/different/path');
    expect(context.PROJECT_NAME).toBe('different-name');
    expect(context.TIMESTAMP).toBe('different-timestamp');
    expect(context.CURRENT_DATE).toBe('different-date');
    expect(context.CURRENT_TIME).toBe('different-time');
    
    // Additional fields should be included
    expect(context.customField).toBe('allowed');
  });

  it('should handle null and undefined additional arguments', () => {
    const projectPath = '/test/project';

    const contextWithNull = buildTemplateContext(projectPath, null as any);
    expect(contextWithNull).toMatchObject({
      PROJECT_PATH: projectPath,
      PROJECT_NAME: 'project'
    });

    const contextWithUndefined = buildTemplateContext(projectPath, undefined);
    expect(contextWithUndefined).toMatchObject({
      PROJECT_PATH: projectPath,
      PROJECT_NAME: 'project'
    });
  });

  it('should format dates and times in locale format', () => {
    const projectPath = '/test/project';
    const context = buildTemplateContext(projectPath);

    // These will vary by locale, so just verify they're strings
    expect(typeof context.CURRENT_DATE).toBe('string');
    expect(typeof context.CURRENT_TIME).toBe('string');
    expect(context.CURRENT_DATE.length).toBeGreaterThan(0);
    expect(context.CURRENT_TIME.length).toBeGreaterThan(0);
  });

  it('should handle complex project paths', () => {
    const complexPaths = [
      { 
        path: '/Users/john.doe/Documents/Work Projects/2024/my-project',
        expected: 'my-project'
      },
      {
        // Node's basename handles Windows paths differently on Unix systems
        path: '\\\\network\\share\\projects\\app',
        expected: '\\\\network\\share\\projects\\app' // basename doesn't split on backslash on Unix
      },
      {
        path: '../../../relative/project',
        expected: 'project'
      }
    ];

    complexPaths.forEach(({ path, expected }) => {
      const context = buildTemplateContext(path);
      expect(context.PROJECT_NAME).toBe(expected);
    });
  });

  it('should preserve additional argument types', () => {
    const projectPath = '/test/project';
    const complexArgs = {
      stringValue: 'test',
      numberValue: 123.45,
      booleanValue: false,
      nullValue: null,
      undefinedValue: undefined,
      dateValue: new Date('2024-01-01'),
      regexValue: /test/gi,
      functionValue: () => 'test',
      symbolValue: Symbol('test')
    };

    const context = buildTemplateContext(projectPath, complexArgs);

    // Verify types are preserved
    expect(typeof context.stringValue).toBe('string');
    expect(typeof context.numberValue).toBe('number');
    expect(typeof context.booleanValue).toBe('boolean');
    expect(context.nullValue).toBeNull();
    expect(context.undefinedValue).toBeUndefined();
    expect(context.dateValue).toBeInstanceOf(Date);
    expect(context.regexValue).toBeInstanceOf(RegExp);
    expect(typeof context.functionValue).toBe('function');
    expect(typeof context.symbolValue).toBe('symbol');
  });

  it('should create consistent timestamps', () => {
    const projectPath = '/test/project';
    
    const context1 = buildTemplateContext(projectPath);
    const context2 = buildTemplateContext(projectPath);

    // Both should have the same timestamp since we're using fake timers
    expect(context1.TIMESTAMP).toBe(context2.TIMESTAMP);
    expect(context1.TIMESTAMP).toBe('2024-01-15T14:30:45.123Z');
  });
});