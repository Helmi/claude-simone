# Knowledge Collection about Claude Code Sub-Agents

Resources:

- <https://www.anthropic.com/engineering/claude-code-best-practices>
- <https://cuong.io/blog/2025/06/24-claude-code-subagent-deep-dive>
- <https://www.perplexity.ai/search/5fa5926d-e479-4028-a97e-43c5e09b34af>

## Research Findings: Sub-agents for Simone

### Executive Summary

Sub-agents offer powerful parallelization and specialization capabilities but come with significant token usage implications. They can reduce task completion time by up to 80% for complex tasks but multiply token consumption by 3-4x. They are most valuable for research, testing, debugging, and large-scale migrations.

### Token Usage Patterns

- **Multiplier Effect**: Sub-agents typically use 3-4x more tokens than sequential processing
- **Context Windows**: Each sub-agent maintains an independent ~200k token context
- **Multi-agent Runs**: Can consume significantly more tokens than standard chats
- **Parallel Execution**: Token usage scales with the number of concurrent agents

### Valuable vs Problematic Sub-agents

#### High-Value Sub-agents (Recommended)

1. **code-reviewer**
   - Focus: Security vulnerabilities, performance bottlenecks, code quality
   - Use Case: Automated code review with actionable feedback

2. **test-writer**
   - Focus: Generate comprehensive test suites
   - Use Case: Parallel test generation while main agent continues development

3. **codebase-mapper**
   - Focus: Architecture analysis and dependency mapping
   - Use Case: Understanding complex codebases quickly

4. **task-researcher**
   - Focus: Deep research on specific technical issues
   - Use Case: Reduces research time significantly

5. **code-migrator**
   - Focus: Large-scale refactoring and migrations
   - Use Case: Systematic code transformation across multiple files

#### Problematic Sub-agents (Avoid)

1. **full-stack-developer**
   - Problem: Too broad, trying to handle everything
   - Issue: Massive token consumption with unclear boundaries

2. **general-purpose**
   - Problem: Jack-of-all-trades approach
   - Issue: Inefficient compared to specialized agents

3. **documentation-writer** (when overly broad)
   - Problem: Often duplicates main agent capabilities
   - Issue: Better handled by custom prompts

### Sub-agents vs Custom Commands/Prompts

Both sub-agents and custom commands share a fundamental similarity: they are predefined prompts that provide specific expertise and instructions to the LLM. The key difference lies in their execution model and use cases.

#### When to Use Sub-agents

- Complex tasks requiring parallel processing with independent work streams
- Research-heavy operations where findings won't affect concurrent tasks
- Large-scale migrations where files can be processed independently
- Comprehensive testing where test generation doesn't depend on other tests
- Tasks with clear subtask boundaries and no interdependencies

**Critical**: Parallel sub-agents must only handle work that can truly be done in parallel without creating conflicts or dependencies in the codebase.

#### When to Use Custom Commands/Prompts

- Tasks requiring sequential processing due to dependencies
- Operations where the output of one step affects the next
- Expert knowledge injection for specific domains
- Standardized workflows that benefit from consistent prompting
- Tasks where maintaining a single context is crucial

### Best Practices for Sub-agent Design

#### Sub-agent Structure Components

1. **Name**
   - Use kebab-case (e.g., `code-reviewer`, `test-writer`)
   - Keep it short and descriptive (2-3 words max)
   - Should clearly indicate the agent's primary function
   - Avoid generic names like `helper` or `assistant`

2. **Description** 
   - One-line summary of what the agent does
   - Should be scannable and immediately clear
   - Format: "[Action] for [specific purpose]"
   - Examples:
     - "Generate unit tests for new code with edge case coverage"
     - "Analyze codebase architecture and dependency relationships"
     - "Review code for security vulnerabilities and performance issues"

3. **Tools**
   - Only include tools the agent actually needs
   - Order tools by frequency of use
   - Common patterns:
     - Analysis agents: `Read`, `Grep`, `Glob`
     - Writing agents: `Read`, `Write`, `MultiEdit`
     - Research agents: `WebSearch`, `WebFetch`, `Read`
   - Avoid giving write access to analysis-only agents

4. **Color**
   - Available colors: `Red`, `Blue`, `Green`, `Yellow`, `Purple`, `Orange`, `Pink`, `Cyan`
   - Use colors to visually distinguish agent types
   - Suggested conventions:
     - Red: Critical tasks (security, breaking changes, high-risk operations)
     - Blue: Analysis and research tasks
     - Green: Creation and generation tasks
     - Yellow: Warnings, reviews, and validation
     - Purple: Complex orchestration or planning
     - Orange: Migration and refactoring tasks
     - Pink: Documentation and communication
     - Cyan: Testing and quality assurance
   - Colors enhance visual scanning but should not be the only distinguisher

#### System Prompt Best Practices

1. **Role Definition**: Clearly establish the agent's expertise

   ```
   You are a senior security engineer specializing in OWASP vulnerabilities.
   Your primary focus is identifying and documenting security issues.
   ```

2. **Output Format**: Specify expected output structure

   ```
   Provide findings in this format:
   - Issue: [Brief description]
   - Severity: [Critical/High/Medium/Low]
   - Location: [file:line_number]
   - Fix: [Specific remediation steps]
   ```

3. **Tool Constraints**: Limit tools to necessary ones only

   ```
   Use only Read and Grep tools for analysis.
   Do not modify any files.
   ```

4. **Context Awareness**: Remind agents of their parallel execution

   ```
   You are working in parallel with other agents.
   Focus only on your assigned files/tasks.
   Do not make assumptions about work being done elsewhere.
   ```

### Key Insights

1. **Efficiency Paradox**: While sub-agents increase token usage, they can dramatically reduce human time investment
2. **Isolation Benefits**: Independent context windows prevent cross-contamination between tasks
3. **Dependency Management**: Careful orchestration needed to ensure parallel work doesn't create conflicts
4. **Task Specificity**: The more focused and specific the sub-agent, the better the efficiency
5. **Shared Expertise**: Sub-agents and custom commands both encapsulate domain expertise through prompts

### Dangers and Considerations

1. **Work Dependencies**: Parallel agents modifying interdependent code can create conflicts
2. **Context Pollution**: Poorly designed sub-agents can create confusing outputs
3. **Overhead Costs**: Small tasks become expensive when delegated to sub-agents
4. **Debugging Complexity**: Multiple parallel agents can make error tracking difficult
5. **Race Conditions**: Concurrent file modifications require careful orchestration

## Understanding Sub-agents

Sub-agents are reusable specialists that operate in clean contexts. They are:
- **Not task-specific**: They handle a domain, not a single task
- **Tool-like**: Their description announces capabilities, not commands
- **Context-fresh**: Each invocation starts with a clean slate
- **Generic enough**: Usable across different scenarios within their expertise

**CRITICAL**: Sub-agents start with ZERO project context:
- No access to CLAUDE.md or project instructions
- No knowledge of project conventions, standards, or rules  
- No awareness of project structure or history
- Main LLM must pass ALL needed context explicitly

This makes sub-agents best suited for:
- External research/analysis (doesn't need project context)
- Isolated code generation from clear specs
- Analysis tasks that benefit from fresh perspective
- Tasks where project rules can be easily summarized

Poor fit for:
- Tasks requiring deep project knowledge
- Operations needing to follow project-specific conventions
- Work requiring understanding of project history or context

## Sub-agents for Simone Development

Based on Simone's architecture and needs, these sub-agents would be valuable:

1. **prompt-template-expert** (already exists)
   - Handles all aspects of Simone prompt creation and improvement
   - Understands Handlebars, YAML structure, and Simone's style guide

2. **simone-migration-specialist**
   - Name: `simone-migration-specialist`
   - Description: "Expert in migrating between Simone's legacy and MCP implementations. Use when working on feature parity, command migrations, or cross-version compatibility."
   - Tools: `Read`, `Grep`, `Write`, `MultiEdit`
   - Color: `Orange`
   - Expertise: Both legacy and MCP architectures, migration patterns

3. **release-engineer**
   - Name: `release-engineer`
   - Description: "Specialist in Simone's multi-package release process. Use when preparing releases, managing versions across packages, or updating changelogs."
   - Tools: `Read`, `MultiEdit`, `Bash`, `Grep`
   - Color: `Purple`
   - Expertise: SemVer, changelog formats, npm publishing, monorepo coordination

### Why These Work as Sub-agents

- **Reusable expertise**: Migration and release work happens repeatedly
- **Clean context benefit**: Fresh start prevents confusion between versions
- **Domain specialization**: Deep knowledge in specific areas
- **Multiple scenarios**: Can handle various tasks within their domain

## Sub-agents to Distribute with Simone

### Reconsidering User-Facing Sub-agents

Given the zero-context limitation, many initially promising sub-agents become problematic:

- **GitHub specialist**: Would need repo name, commit conventions, PR templates, team workflows - too much context
- **Test specialist**: Needs framework, patterns, naming conventions - project-specific
- **Dependency manager**: Needs to understand project's dependency strategy, version policies

### Actually Viable Sub-agents

These work because they need minimal project context:

1. **technical-researcher** (already exists)
   - Researches external information
   - Only needs the question/topic
   - No project context required

2. **algorithm-implementer**
   - Name: `algorithm-implementer`
   - Description: "Implements specific algorithms or data structures from clear specifications. Use when you need a clean implementation of a well-defined algorithm."
   - Tools: `Write`, `Read`
   - Color: `Blue`
   - Why it works: Algorithm specs are self-contained

3. **api-contract-designer**
   - Name: `api-contract-designer`
   - Description: "Designs REST API contracts, schemas, and OpenAPI specifications from requirements. Use when designing new APIs from scratch."
   - Tools: `Write`, `WebSearch`
   - Color: `Purple`
   - Why it works: Can work from requirements without project history

### Sub-agent Advantages

Sub-agents are valuable when:
1. **Context generation**: Task will generate lots of new context (reading many files, creating many outputs)
2. **High repeatability**: Task is performed frequently across projects
3. **Focused scope**: Task can work with specific instruction files

### Context Passing Strategy

Effective ways to provide project context:
1. **System prompt references**: "Read `.claude/testing-conventions.md` for test patterns"
2. **Focused context files**: Create specific files for sub-agent consumption
3. **Main LLM summary**: Pass key conventions in invocation (< 500 tokens)
4. **Constitution pattern**: Like Simone's constitution - core rules in one file

### Reconsidering Valuable Sub-agents

With proper context strategy, these become viable:

1. **test-writer** (already exists)
   - High context generation: Reads many files, writes many tests
   - Frequent use: Every feature needs tests
   - Context strategy: Read test conventions file + framework from package.json

2. **migration-specialist**
   - Name: `migration-specialist`
   - Description: "Handles large-scale code migrations and refactoring. Use when migrating between frameworks, updating deprecated APIs, or restructuring codebases."
   - Tools: `Read`, `MultiEdit`, `Grep`, `Glob`
   - Color: `Orange`
   - Why valuable: Generates massive context, prevents main context overflow
   - Context strategy: Migration rules file + source/target patterns

3. **documentation-generator**
   - Name: `documentation-generator`
   - Description: "Creates comprehensive documentation from code. Use when documenting APIs, creating user guides, or generating reference docs."
   - Tools: `Read`, `Write`, `Grep`, `Glob`
   - Color: `Pink`
   - Why valuable: Reads entire codebase, high repeatability
   - Context strategy: Doc standards file + output format specs
