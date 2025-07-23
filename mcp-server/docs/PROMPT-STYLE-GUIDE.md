# Simone Prompt Style Guide

This guide defines the standard format and style for all Simone MCP prompts.

**IMPORTANT** Prompts are commands towards the LLM. If you want input from the user, tell the LLM to ask the User for it.

## Core Principles

1. **INFORMATION DENSE** - Every line serves a purpose
2. **IMPERATIVE VOICE** - Direct commands, no passive language
3. **CLEAR GUIDANCE** - No room for interpretation
4. **STRUCTURED FLOW** - Consistent organization across all prompts

## Naming Convention

- Use **underscores** for all prompt names: `create_issue`, `work_project`, `code_review`
- Use **underscores** for arguments: `issue_number`, `sprint_id`
- Keep names descriptive but concise

## Standard Structure

Every prompt MUST follow this structure:

```yaml
name: prompt_name
description: Brief, clear description of what this prompt does
arguments:
  - name: optional_argument
    description: Clear description
    required: false
template: |
  # Action Verb + Object

  **IMPORTANT:** Follow from Top to Bottom - don't skip anything!

  **CREATE A TODO LIST** with exactly these N items:

  1. First high-level step
  2. Second high-level step
  3. ...
  N. Final step

  ## 1 · First detailed step

  [Detailed instructions...]

  ## 2 · Second detailed step

  [Detailed instructions...]

  ## N · Final step with output

  [Final instructions and output format...]
```

## Interview Pattern (REQUIRED)

Due to MCP argument limitations (no spaces in arguments), most prompts MUST start with an interview phase.
Only use one to two arguments if really helpful and possible as a short format and always make them optional.

```handlebars
## 1 · Gather user input

{{#if argument_name}}
Initial input provided: "{{argument_name}}"
{{else}}
Ask the user: "What is [the specific thing you need]?"
{{/if}}

Additional questions to ask:
- [Specific question 1]
- [Specific question 2]
- [Context-gathering question]
```

This pattern ensures we gather all necessary information despite argument constraints.

## Language Patterns

### Emphasis Hierarchy

- `**CRITICAL:**` - Must-follow rules that could break things
- `**IMPORTANT:**` - Key guidelines for success
- `**CONTEXT:**` - Background information
- `**VERIFICATION:**` - Validation steps
- `**PARALLEL SUBAGENTS**` - For concurrent execution

### Action Words (ALL CAPS)

- READ, ANALYZE, CREATE, VERIFY, CHECK, UPDATE, SCAN
- Use sparingly - only for primary actions

### Avoiding Prescriptive Commands

- **DON'T** include specific command examples (e.g., `grep -r "term"`) 
- **DO** describe what needs to be done and let the LLM choose appropriate tools
- **DON'T** assume which tool the LLM will use
- **DO** trust the LLM's knowledge of available tools and syntax

### Formatting Rules

- File paths in backticks: `.simone/prompts/`
- Variables: `{{variable_name}}`
- Commands: inline code blocks
- Status values: **bold**

## Conditional Logic

Use Handlebars for risk-based behavior.

Note: Risk levels reach from 1 to 10 with one being most careful while 10 being most risky. Usually we cover 3 levels: 1, 5 and 10.

```handlebars
{{#if (eq project.riskLevel 1)}}
- Ask user for confirmation before proceeding
{{else if (lte project.riskLevel 5)}}
- Show plan and proceed unless user objects
{{else}}
- Execute immediately without confirmation
{{/if}}
```

If 5 is included in the more careful variant or not depends on how important/critical the action is.

## Standard Output Format

All prompts should end with a dynamic result that reflects actual outcomes:

- Use **outcome-neutral** language that can adapt to success, partial completion, or failure
- Replace static templates with **dynamic placeholders** in brackets: `[actual outcome]`
- Let the LLM generate appropriate summaries based on what actually happened
- Avoid pre-worded success messages that assume completion

Example format:
```markdown
✅ **Result**: [Describe actual outcome of the task]

🔎 **Scope**: [What was actually analyzed/created/modified]

💬 **Summary**: [Honest summary of what was accomplished and current status]
```

## Quality Checks

Every prompt should include:

1. **Validation steps** - Verify inputs make sense
2. **Error handling** - What to do when things go wrong
3. **Completion criteria** - Clear definition of "done"

## Partials Strategy

Simone uses Handlebars partials to keep prompts DRY and maintainable. We have two main categories:

### GitHub Integration

Use the `{{> github}}` partial to inform about GitHub tool selection:

```handlebars
{{> github}}

Create an issue with title "Bug: Login fails" and appropriate labels.
```

The partial tells the LLM whether to use GitHub MCP or CLI based on project configuration. The LLM knows how to use both tools - we just tell it which one is available.

### Project Commands

Use these partials to conditionally include project-specific commands:

- `{{> lint}}` - Run linting if configured
- `{{> test}}` - Run tests if configured
- `{{> typecheck}}` - Run type checking if configured
- `{{> quality-checks}}` - Run all quality checks (combines above)

Example usage:

```handlebars
After implementing your changes:

{{> quality-checks}}

Ensure all checks pass before proceeding.
```

### Partial Guidelines

1. **Keep partials focused** - One concern per partial
2. **Don't over-instruct** - The LLM knows how to use tools
3. **Use conditionals in partials** - Not in the main prompt
4. **Reference project config** - Use `{{project.commands.xxx}}` in partials

## Common Patterns

### Research Phase

```markdown
## N · Research codebase

**CRITICAL:** Use parallel agents to:
1. Search for [specific thing]
2. Identify [related items]
3. Understand [context]
```

### File Operations

```markdown
Navigate to `.simone/directory/`
Update status to **in_progress**
Create file with format: `[PREFIX]_[NAME].md`
```

### User Interaction Points

```handlebars
If unclear:
{{#if (lt project.riskLevel 5)}}
- Ask user for clarification
{{else}}
- Make reasonable assumption and note in output
{{/if}}
```

## Writing Guidelines

1. **Be Specific** - "Create issue on GitHub" not "Make a ticket"
2. **Use Project Context** - Reference `{{project.name}}` and settings
3. **Avoid Hardcoded Examples** - Describe patterns, not exact commands
4. **Define Success Flexibly** - Criteria that work for various outcomes
5. **Plan for Failure** - What to do when blocked

## Flexibility Principles

### Open-Ended Prompts

- Let the LLM generate appropriate questions based on context
- Avoid pre-written question lists when the LLM can determine what's needed
- Provide guidance on what information to gather, not exact wording

### Redundant Inclusions

- The constitution is automatically loaded by the template handler
- Don't manually include `{{constitution}}` blocks in prompts
- Trust the system to provide necessary context

### Dynamic Summaries

- Replace static text like "Successfully implemented X" with `[Describe what was implemented]`
- Allow for partial completions: `[Explain what was done and what remains]`
- Include discovered issues: `[Note any blockers or unexpected findings]`

## Testing Your Prompt

Before finalizing:

1. Can an AI follow this without prior context?
2. Are all decision points covered?
3. Is the output format clearly defined?
4. Does it handle edge cases?
5. Is it consistent with other prompts?

## Example Analysis

Good instruction:

```markdown
## 3 · Create GitHub issue

Create issue using GitHub CLI with:
- Title: Clear, concise summary (max 72 chars)
- Body: The drafted content from step 2
- Labels: bug (if fixing), enhancement (if adding)
```

Why it's good:

- Specific tool (GitHub CLI)
- Clear constraints (72 chars)
- Exact values for labels
- References previous step

Remember: These prompts are instructions for AI agents. Make them impossible to misinterpret.
