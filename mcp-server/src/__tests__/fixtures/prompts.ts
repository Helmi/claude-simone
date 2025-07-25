/**
 * Test fixtures for prompt templates
 */

export const simplePrompt = `
name: simple-prompt
description: A simple test prompt
version: 1.0.0
authors:
  - Test Author
messages:
  - role: system
    content: |
      This is a simple test prompt
`;

export const promptWithArguments = `
name: prompt-with-args
description: A prompt with arguments
version: 1.0.0
authors:
  - Test Author
arguments:
  - name: required_arg
    description: A required argument
    required: true
  - name: optional_arg
    description: An optional argument
    required: false
    default: "default value"
messages:
  - role: system
    content: |
      Required: {{required_arg}}
      Optional: {{optional_arg}}
`;

export const promptWithPartials = `
name: prompt-with-partials
description: A prompt that uses partials
version: 1.0.0
partials:
  - greeting
messages:
  - role: system
    content: |
      {{> greeting}}
      This prompt uses partials.
`;

export const promptWithHelpers = `
name: prompt-with-helpers
description: A prompt using Handlebars helpers
version: 1.0.0
arguments:
  - name: value
    description: A numeric value
    required: true
  - name: threshold
    description: Threshold for comparison
    required: false
    default: 10
messages:
  - role: system
    content: |
      {{#if (gt value threshold)}}
      Value {{value}} is greater than {{threshold}}
      {{else}}
      Value {{value}} is not greater than {{threshold}}
      {{/if}}
`;

export const complexPrompt = `
name: complex-prompt
description: A complex prompt with all features
version: 2.0.0
authors:
  - Primary Author
  - Secondary Author
tags:
  - complex
  - testing
  - advanced
arguments:
  - name: user_name
    description: The user's name
    required: true
  - name: task_type
    description: Type of task to perform
    required: true
  - name: priority
    description: Task priority level
    required: false
    default: "normal"
  - name: options
    description: Additional options
    required: false
partials:
  - common-instructions
  - formatting-guide
messages:
  - role: system
    content: |
      {{> common-instructions}}
      
      Hello {{user_name}}, you have requested a {{task_type}} task.
      
      {{#if (eq priority "high")}}
      ⚠️ This is a HIGH PRIORITY task!
      {{else if (eq priority "low")}}
      This is a low priority task.
      {{else}}
      This is a normal priority task.
      {{/if}}
      
      {{#if options}}
      Additional options: {{options}}
      {{/if}}
      
      {{> formatting-guide}}
  - role: user
    content: |
      Please proceed with the {{task_type}} task.
`;

export const invalidPromptYAML = `
name: invalid-yaml
description: "This has invalid YAML syntax
version: 1.0.0
  messages:
    role: system
  content: Invalid
`;

export const promptMissingName = `
description: Missing name field
version: 1.0.0
messages:
  - role: system
    content: This prompt has no name
`;

export const promptMissingMessages = `
name: no-messages
description: This prompt has no messages
version: 1.0.0
`;

export const minimalPrompt = `
name: minimal
messages:
  - role: system
    content: Minimal prompt
`;