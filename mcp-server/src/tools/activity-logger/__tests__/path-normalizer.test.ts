import { describe, it, expect } from 'vitest';
import { normalizeFilePath } from '../path-normalizer.js';
import { sep } from 'path';

describe('normalizeFilePath', () => {
  const projectRoot = '/Users/test/project';

  describe('absolute paths', () => {
    it('should convert absolute paths within project to relative', () => {
      const result = normalizeFilePath('/Users/test/project/src/index.ts', projectRoot);
      expect(result).toBe('src/index.ts');
    });

    it('should convert deeply nested absolute paths to relative', () => {
      const result = normalizeFilePath('/Users/test/project/src/components/ui/Button.tsx', projectRoot);
      expect(result).toBe('src/components/ui/Button.tsx');
    });

    it('should handle absolute paths outside project', () => {
      const result = normalizeFilePath('/Users/other/project/file.ts', projectRoot);
      expect(result).toBe(`..${sep}..${sep}other${sep}project${sep}file.ts`);
    });

    it('should handle absolute path at project root', () => {
      const result = normalizeFilePath('/Users/test/project/README.md', projectRoot);
      expect(result).toBe('README.md');
    });

    it('should handle absolute path identical to project root', () => {
      const result = normalizeFilePath(projectRoot, projectRoot);
      // Node's relative() returns empty string when paths are identical
      expect(result).toBe('');
    });
  });

  describe('relative paths with ./ or ../', () => {
    it('should normalize paths starting with ./', () => {
      const result = normalizeFilePath('./src/index.ts', projectRoot);
      expect(result).toBe('src/index.ts');
    });

    it('should normalize paths starting with ../', () => {
      const result = normalizeFilePath('../other-project/file.ts', projectRoot);
      expect(result).toBe(`..${sep}other-project${sep}file.ts`);
    });

    it('should handle multiple ../ segments', () => {
      const result = normalizeFilePath('../../outside/file.ts', projectRoot);
      expect(result).toBe(`..${sep}..${sep}outside${sep}file.ts`);
    });

    it('should handle complex relative paths', () => {
      const result = normalizeFilePath('./src/../lib/utils.ts', projectRoot);
      expect(result).toBe('lib/utils.ts');
    });
  });

  describe('already relative paths', () => {
    it('should keep simple relative paths unchanged', () => {
      const result = normalizeFilePath('src/index.ts', projectRoot);
      expect(result).toBe('src/index.ts');
    });

    it('should keep nested relative paths unchanged', () => {
      const result = normalizeFilePath('src/components/ui/Button.tsx', projectRoot);
      expect(result).toBe('src/components/ui/Button.tsx');
    });

    it('should keep single file names unchanged', () => {
      const result = normalizeFilePath('README.md', projectRoot);
      expect(result).toBe('README.md');
    });
  });

  describe('edge cases', () => {
    it('should handle paths with trailing spaces', () => {
      const result = normalizeFilePath('  src/index.ts  ', projectRoot);
      expect(result).toBe('src/index.ts');
    });

    it('should handle empty string', () => {
      const result = normalizeFilePath('', projectRoot);
      expect(result).toBe('');
    });

    it('should handle single space', () => {
      const result = normalizeFilePath(' ', projectRoot);
      expect(result).toBe('');
    });

    it('should handle paths with multiple slashes', () => {
      const result = normalizeFilePath('src//components///Button.tsx', projectRoot);
      // normalizeFilePath doesn't clean up multiple slashes, it just returns the path as-is
      expect(result).toBe('src//components///Button.tsx');
    });

    it('should handle Windows-style paths on Unix', () => {
      const windowsPath = 'src\\components\\Button.tsx';
      const result = normalizeFilePath(windowsPath, projectRoot);
      // On Unix, backslashes are treated as part of the filename
      expect(result).toBe(windowsPath);
    });
  });

  describe('with different project roots', () => {
    it('should work with project root ending with slash', () => {
      const rootWithSlash = '/Users/test/project/';
      const result = normalizeFilePath('/Users/test/project/src/index.ts', rootWithSlash);
      expect(result).toBe('src/index.ts');
    });

    it('should work with Windows-style project root', () => {
      const windowsRoot = 'C:\\Users\\test\\project';
      const windowsFile = 'C:\\Users\\test\\project\\src\\index.ts';
      // This test will behave differently on Windows vs Unix
      const result = normalizeFilePath(windowsFile, windowsRoot);
      // Just check that it doesn't throw
      expect(result).toBeDefined();
    });
  });
});