import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'fs';
import { randomBytes } from 'crypto';

export class TestFixtures {
  private fixtureRoot: string;
  private createdPaths: string[] = [];

  constructor(testName: string) {
    this.fixtureRoot = join(__dirname, '../fixtures', testName, randomBytes(8).toString('hex'));
  }

  getRoot(): string {
    if (!existsSync(this.fixtureRoot)) {
      mkdirSync(this.fixtureRoot, { recursive: true });
      this.createdPaths.push(this.fixtureRoot);
    }
    return this.fixtureRoot;
  }

  createFile(relativePath: string, content: string): string {
    const fullPath = join(this.getRoot(), relativePath);
    const dir = join(fullPath, '..');
    
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    writeFileSync(fullPath, content);
    this.createdPaths.push(fullPath);
    
    return fullPath;
  }

  createDirectory(relativePath: string): string {
    const fullPath = join(this.getRoot(), relativePath);
    
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
      this.createdPaths.push(fullPath);
    }
    
    return fullPath;
  }

  readFile(relativePath: string): string {
    const fullPath = join(this.getRoot(), relativePath);
    return readFileSync(fullPath, 'utf-8');
  }

  cleanup(): void {
    if (existsSync(this.fixtureRoot)) {
      rmSync(this.fixtureRoot, { recursive: true, force: true });
    }
  }
}

// Common test fixtures
export const TEST_TEMPLATES = {
  simplePrompt: `---
id: test-prompt
name: Test Prompt
description: A simple test prompt
metadata:
  version: "1.0"
  category: test
variables:
  - name: testVar
    description: Test variable
    required: true
---

This is a test prompt with {{testVar}}.`,

  promptWithPartial: `---
id: test-with-partial
name: Test With Partial
description: A prompt using partials
metadata:
  version: "1.0"
  category: test
---

{{> header}}
Main content here.
{{> footer}}`,

  invalidYaml: `---
id: invalid
name: Invalid YAML
description: [unclosed array
---

Content here.`,

  emptyPrompt: `---
id: empty
name: Empty Prompt
---

`,

  complexPrompt: `---
id: complex
name: Complex Prompt
description: A complex prompt with multiple features
metadata:
  version: "2.0"
  category: advanced
  tags:
    - test
    - complex
variables:
  - name: userName
    description: User's name
    required: true
  - name: projectName
    description: Project name
    required: false
    default: "Untitled"
helpers:
  - uppercase
  - formatDate
---

Hello {{uppercase userName}}!

Working on project: {{projectName}}

{{#if complexCondition}}
Complex logic here
{{else}}
Simple fallback
{{/if}}

Generated on: {{formatDate timestamp}}`
};

export const TEST_CONFIGS = {
  minimal: {
    projectPath: '/test/project',
    projectName: 'Test Project'
  },
  
  full: {
    projectPath: '/test/project',
    projectName: 'Test Project',
    description: 'A test project for unit tests',
    techStack: {
      language: 'TypeScript',
      framework: 'Node.js',
      packageManager: 'pnpm'
    },
    structure: {
      src: 'Source files',
      tests: 'Test files',
      docs: 'Documentation'
    }
  }
};