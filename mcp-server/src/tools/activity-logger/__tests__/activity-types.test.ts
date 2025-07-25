import { describe, it, expect } from 'vitest';
import { detectActivityType } from '../activity-types.js';

describe('detectActivityType', () => {
  describe('should detect create activities', () => {
    it.each([
      'Created new test file',
      'Add configuration file',
      'Generated API documentation',
      'Initialize project structure',
      'Create GitHub issue for bug fix'
    ])('detects create in: "%s"', (activity) => {
      expect(detectActivityType(activity)).toBe('create');
    });
  });

  describe('should detect update activities', () => {
    it.each([
      'Updated configuration settings',
      'Modified test suite',
      'Changed API endpoint',
      'Edit documentation'
    ])('detects update in: "%s"', (activity) => {
      expect(detectActivityType(activity)).toBe('update');
    });
  });

  describe('should detect fix activities', () => {
    it.each([
      'Fixed authentication bug',
      'Repaired broken tests',
      'Resolved merge conflict',
      'Patched security vulnerability'
    ])('detects fix in: "%s"', (activity) => {
      expect(detectActivityType(activity)).toBe('fix');
    });
  });

  describe('should detect review activities', () => {
    it.each([
      'Reviewed pull request',
      'Check code quality',
      'Examined test coverage',
      'Inspect deployment logs'
    ])('detects review in: "%s"', (activity) => {
      expect(detectActivityType(activity)).toBe('review');
    });
  });

  describe('should detect research activities', () => {
    it.each([
      'Researched authentication libraries',
      'Investigated performance issues',
      'Explored new frameworks',
      'Searched for bug solution'
    ])('detects research in: "%s"', (activity) => {
      expect(detectActivityType(activity)).toBe('research');
    });
  });

  describe('should detect document activities', () => {
    it.each([
      'Documented API endpoints',
      'Write setup guide',
      'Described architecture decisions',
      'Explained configuration options'
    ])('detects document in: "%s"', (activity) => {
      expect(detectActivityType(activity)).toBe('document');
    });
  });

  describe('should detect test activities', () => {
    it.each([
      'Tested authentication flow',
      'Verify API responses',
      'Validated form inputs'
    ])('detects test in: "%s"', (activity) => {
      expect(detectActivityType(activity)).toBe('test');
    });

    it('should detect review when check is the primary verb', () => {
      // 'check' keyword appears first in the review category
      expect(detectActivityType('Check deployment status')).toBe('review');
    });
  });

  describe('should detect deploy activities', () => {
    it.each([
      'Deployed to production',
      'Released version 2.0',
      'Published npm package'
    ])('detects deploy in: "%s"', (activity) => {
      expect(detectActivityType(activity)).toBe('deploy');
    });

    it('should detect create when launched is used with new', () => {
      // 'new' keyword triggers create detection
      expect(detectActivityType('Launched new feature')).toBe('create');
    });
  });

  describe('should detect configure activities', () => {
    it.each([
      'Configured CI/CD pipeline',
      'Setup development environment',
      'Installed dependencies',
      'Config database connection'
    ])('detects configure in: "%s"', (activity) => {
      expect(detectActivityType(activity)).toBe('configure');
    });
  });

  describe('should detect refactor activities', () => {
    it.each([
      'Refactored authentication module',
      'Reorganized file structure',
      'Restructured database schema',
      'Cleaned up old code'
    ])('detects refactor in: "%s"', (activity) => {
      expect(detectActivityType(activity)).toBe('refactor');
    });
  });

  describe('should detect delete activities', () => {
    it.each([
      'Removed deprecated API',
      'Drop obsolete tables'
    ])('detects delete in: "%s"', (activity) => {
      expect(detectActivityType(activity)).toBe('delete');
    });

    it('should detect test when deleted is used with test files', () => {
      // 'test' keyword appears before 'delete' in the keyword order
      expect(detectActivityType('Deleted old test files')).toBe('test');
    });

    it('should detect clean as refactor when it is the main verb', () => {
      expect(detectActivityType('Cleaned unused dependencies')).toBe('refactor');
    });
  });

  describe('should detect analyze activities', () => {
    it.each([
      'Analyzed performance metrics',
      'Assessed code quality',
      'Measured API response times'
    ])('detects analyze in: "%s"', (activity) => {
      expect(detectActivityType(activity)).toBe('analyze');
    });

    it('should detect test when evaluate is used with test', () => {
      expect(detectActivityType('Evaluated test coverage')).toBe('test');
    });
  });

  describe('should detect plan activities', () => {
    it.each([
      'Planned sprint tasks',
      'Architected microservices',
      'Outlined project roadmap'
    ])('detects plan in: "%s"', (activity) => {
      expect(detectActivityType(activity)).toBe('plan');
    });

    it('should detect create when design is used with new', () => {
      expect(detectActivityType('Designed new architecture')).toBe('create');
    });
  });

  describe('should detect debug activities', () => {
    it.each([
      'Debugged memory leak',
      'Diagnosed performance problem',
      'Traced error source'
    ])('detects debug in: "%s"', (activity) => {
      expect(detectActivityType(activity)).toBe('debug');
    });

    it('should detect deploy when troubleshoot is used with deployment', () => {
      expect(detectActivityType('Troubleshoot deployment issue')).toBe('deploy');
    });
  });

  describe('should handle edge cases', () => {
    it('should be case insensitive', () => {
      expect(detectActivityType('CREATE new file')).toBe('create');
      expect(detectActivityType('UPDATED config')).toBe('update');
      expect(detectActivityType('FiXeD bug')).toBe('fix');
    });

    it('should detect keyword anywhere in the activity', () => {
      expect(detectActivityType('Worked on creating new feature')).toBe('create');
      expect(detectActivityType('Spent time to fix the issue')).toBe('fix');
    });

    it('should prioritize first matching type', () => {
      // Contains both 'create' and 'test' keywords, but 'create' comes first in the order
      expect(detectActivityType('Created new test file')).toBe('create');
    });
  });

  describe('should fallback behavior', () => {
    it('should extract first verb for unmatched activities', () => {
      expect(detectActivityType('Migrated database')).toBe('migrated');
      expect(detectActivityType('Optimized performance')).toBe('optimized');
    });

    it('should detect create when implemented is used with new', () => {
      expect(detectActivityType('Implemented new feature')).toBe('create');
    });

    it('should return "other" for very short first words', () => {
      expect(detectActivityType('Is working')).toBe('other');
    });

    it('should detect keywords even in short sentences', () => {
      expect(detectActivityType('A new feature')).toBe('create'); // 'new' keyword
    });

    it('should handle "To do list" as other', () => {
      // 'To' is too short, no matching keywords
      expect(detectActivityType('To do list')).toBe('other');
    });

    it('should return first word or "other" for no match', () => {
      expect(detectActivityType('')).toBe('other');
      expect(detectActivityType(' ')).toBe('other');
      expect(detectActivityType('123')).toBe('123'); // First word, even if numeric
    });
  });
});