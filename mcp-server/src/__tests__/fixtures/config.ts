/**
 * Test fixtures for configuration data
 */

export const minimalConfig = `
contexts:
  - name: project
    path: .
`;

export const fullConfig = `
# Shared configuration
shared:
  tools:
    github:
      credentials:
        method: github-cli
    linear:
      credentials:
        method: env
        api_key_var: LINEAR_API_KEY
  formatting:
    code_style: prettier
    indent_size: 2

# Context-specific configurations
contexts:
  - name: backend
    path: ./backend
    description: Backend API service
    tools:
      github:
        enabled: true
        repository: owner/backend-repo
      linear:
        enabled: true
        team_id: TEAM-123
    prompts:
      - name: api-development
        enabled: true
      - name: database-migration
        enabled: true
    formatting:
      indent_size: 4  # Override shared setting

  - name: frontend
    path: ./frontend
    description: Frontend application
    tools:
      github:
        enabled: true
        repository: owner/frontend-repo
    prompts:
      - name: component-development
        enabled: true
      - name: ui-testing
        enabled: true

  - name: docs
    path: ./docs
    description: Documentation
    tools:
      github:
        enabled: false  # Disable for docs
    prompts:
      - name: documentation
        enabled: true
`;

export const configWithInvalidYAML = `
contexts:
  - name: project
    path: .
    invalid_indent: should cause error
  bad_key
`;

export const configWithoutContexts = `
shared:
  tools:
    github:
      enabled: true
`;

export const configWithEmptyContexts = `
contexts: []
`;

export const configWithDuplicateContexts = `
contexts:
  - name: duplicate
    path: ./path1
  - name: duplicate
    path: ./path2
`;

export const configWithToolOverrides = `
shared:
  tools:
    github:
      credentials:
        method: token
        token_var: GITHUB_TOKEN
      enabled: true

contexts:
  - name: project
    path: .
    tools:
      github:
        credentials:
          method: github-cli  # Override shared
        repository: test/repo
`;

export const configWithPromptSettings = `
contexts:
  - name: project
    path: .
    prompts:
      - name: test-prompt
        enabled: true
        custom_args:
          arg1: value1
          arg2: value2
      - name: disabled-prompt
        enabled: false
`;

export const nestedPathConfig = `
contexts:
  - name: root
    path: .
  - name: deep-nested
    path: ./src/components/ui/buttons
  - name: parent-path
    path: ../
`;

export const configWithCustomFields = `
contexts:
  - name: project
    path: .
    custom_field: custom_value
    nested_custom:
      field1: value1
      field2: value2
    tools:
      custom_tool:
        setting1: value1
`;

export const multiContextConfig = `
contexts:
  - name: monorepo-root
    path: .
    description: Monorepo root
  - name: package-a
    path: ./packages/a
    description: Package A
  - name: package-b
    path: ./packages/b
    description: Package B
  - name: shared-lib
    path: ./libs/shared
    description: Shared library
`;