import { vi } from 'vitest';

export interface MockLogger {
  log: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  debug: ReturnType<typeof vi.fn>;
}

export function createMockLogger(): MockLogger {
  return {
    log: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  };
}

export function setupConsoleSpies() {
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug
  };

  const mockLogger = createMockLogger();
  
  beforeAll(() => {
    console.log = mockLogger.log;
    console.info = mockLogger.info;
    console.warn = mockLogger.warn;
    console.error = mockLogger.error;
    console.debug = mockLogger.debug;
  });

  afterAll(() => {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.debug = originalConsole.debug;
  });

  return mockLogger;
}