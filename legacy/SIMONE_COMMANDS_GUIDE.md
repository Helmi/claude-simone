# Simone Commands Guide

This guide explains all available Simone commands and how to use them effectively in your project.

## Command Overview

Simone commands follow the pattern: `/simone:<command_name> [arguments]`

## Setup & Context Commands

### 🚀 `/simone:initialize`
**Purpose**: Initialize Simone for a new or existing project

**Usage**:

```
/simone:initialize
```

**What it does**:

1. Scans and analyzes your project
2. Asks for confirmation about project type
3. Checks for existing Simone documents
4. Guides you through document creation (imports existing docs or creates new ones)
5. Creates your first milestone
6. Generates project manifest

**When to use**: First time setting up Simone in a project

---

### 🧠 `/simone:prime`
**Purpose**: Load project context at the start of a coding session

**Usage**:

```
/simone:prime
```

**What it does**:

- Reads project manifest
- Loads current milestone and sprint info
- Identifies active tasks
- Provides quick status overview

**When to use**: Start of each coding session to get oriented

## Planning Commands

### 📅 `/simone:create_sprints_from_milestone`
**Purpose**: Break down a milestone into manageable sprints

**Usage**:

```
/simone:create_sprints_from_milestone 001_MVP_FOUNDATION
```

**What it does**:

1. Analyzes milestone requirements
2. Groups related requirements into ~1 week sprints
3. Creates sprint folders and META files
4. Updates manifest with sprint information

**When to use**: After creating a new milestone

---

### 📋 `/simone:create_sprint_tasks`
**Purpose**: Create detailed task breakdowns for a sprint

**Usage**:

```
/simone:create_sprint_tasks S01
# or for specific sprint:
/simone:create_sprint_tasks S02_001_MVP_FOUNDATION
```

**What it does**:

1. Analyzes sprint requirements
2. Breaks them into specific, actionable tasks
3. Creates task files with clear objectives
4. Handles dependencies between tasks

**When to use**: Beginning of each sprint

---

### ✏️ `/simone:create_general_task`
**Purpose**: Create standalone tasks not tied to sprints

**Usage**:

```
/simone:create_general_task
# Then describe your task when prompted
```

**Example tasks**:

- "Fix memory leak in physics engine"
- "Update documentation for API changes"
- "Refactor database connection pooling"

**When to use**: For maintenance, bugs, or tasks outside sprint scope

## Development Commands

### 💻 `/simone:do_task`
**Purpose**: Execute a specific task

**Usage**:

```
/simone:do_task
# Lists available tasks and prompts for selection

# Or specify task directly:
/simone:do_task T001_S01_setup_tauri
```

**What it does**:

1. Reads task requirements
2. Implements the solution
3. Runs tests if applicable
4. Updates task status
5. Creates necessary files/changes

**When to use**: Ready to work on a specific task

---

### 📝 `/simone:commit`
**Purpose**: Create well-structured git commits

**Usage**:

```
/simone:commit
# Reviews changes and creates commit

# Or for specific task:
/simone:commit T001_S01_setup_tauri

# With YOLO mode (skip confirmations):
/simone:commit YOLO
```

**What it does**:

1. Analyzes changes made
2. Groups related changes
3. Creates meaningful commit messages
4. Links commits to tasks/requirements
5. Optionally runs code review first

**When to use**: After completing work you want to save

---

### 🧪 `/simone:test`
**Purpose**: Run tests and fix common issues

**Usage**:

```
/simone:test
# Runs all tests

/simone:test unit
# Runs specific test suite
```

**What it does**:

1. Identifies test commands from package.json
2. Runs appropriate tests
3. Fixes common issues (missing deps, configs)
4. Reports results clearly

**When to use**: Before committing or when tests fail

## Review Commands

### 🔍 `/simone:code_review`
**Purpose**: Review code against specifications

**Usage**:

```
/simone:code_review
# Reviews uncommitted changes

/simone:code_review src/app/components/GameCanvas.tsx
# Reviews specific file
```

**What it does**:

1. Checks code against requirements
2. Verifies patterns and conventions
3. Identifies bugs and issues
4. Suggests improvements
5. Ensures spec compliance

**When to use**: Before committing important changes

---

### 📊 `/simone:project_review`
**Purpose**: Comprehensive project health check

**Usage**:

```
/simone:project_review
```

**What it does**:

1. Reviews overall architecture
2. Checks technical debt
3. Analyzes progress vs. timeline
4. Identifies risks and blockers
5. Suggests improvements

**When to use**: Weekly or at sprint boundaries

---

### 🧪 `/simone:testing_review`
**Purpose**: Analyze test coverage and quality

**Usage**:

```
/simone:testing_review
```

**What it does**:

1. Reviews test coverage
2. Identifies missing test cases
3. Checks test quality
4. Suggests improvements

**When to use**: After implementing features

---

### 💬 `/simone:discuss_review`
**Purpose**: Technical discussion about review findings

**Usage**:

```
/simone:discuss_review
# After running another review command
```

**What it does**:

- Provides detailed explanations
- Discusses trade-offs
- Suggests solutions
- Answers questions

**When to use**: To understand review feedback better

---

### 📊 `/simone:mermaid`
**Purpose**: Create and maintain architecture diagrams

**Usage**:

```
/simone:mermaid CREATE
# Generate new architecture diagrams

/simone:mermaid UPDATE
# Update existing diagrams based on code changes

/simone:mermaid MAINTAIN
# Review and refresh diagrams for accuracy

/simone:mermaid UPDATE authentication
# Update diagrams for specific component
```

**What it does**:

1. Analyzes project structure
2. Creates/updates mermaid diagrams
3. Generates architecture documentation in `/docs/architecture/`
4. Validates diagram syntax
5. Maintains consistency across diagrams

**When to use**: Document architecture visually

## Automation Commands

### 🚀 `/simone:yolo`
**Purpose**: Autonomous task execution

**Usage**:

```
/simone:yolo
# Works through all open tasks

/simone:yolo S02
# Works through specific sprint
```

**What it does**:

1. Identifies open tasks
2. Executes them in order
3. Handles dependencies
4. Commits completed work
5. Updates progress

**Safety features**:

- Won't modify schemas without confirmation
- Skips dangerous operations
- Maintains code quality
- Creates logical commits

**When to use**: When you want autonomous progress

## Best Practices

### Daily Workflow

```bash
# Start of day
/simone:prime

# Work on tasks
/simone:do_task
/simone:test
/simone:commit

# End of day
/simone:project_review
```

### Sprint Workflow

```bash
# Sprint planning
/simone:create_sprint_tasks S02

# Sprint execution
/simone:do_task T001_S02_first_task
/simone:do_task T002_S02_second_task
/simone:commit --review

# Sprint review
/simone:project_review
```

### Quick Fixes

```bash
# Bug fix workflow
/simone:create_general_task
# Describe: "Fix memory leak in /src/foo.bar"
/simone:do_task T003
/simone:test
/simone:commit T003
```

## Tips & Tricks

1. **Use YOLO for routine tasks**: Great for implementing straightforward features
2. **Always prime first**: Ensures commands have proper context
3. **Review before major commits**: Catch issues early
4. **Create general tasks for bugs**: Keeps them trackable
5. **Use task-specific commits**: Better traceability

## Command Safety

Simone commands include safety features:

- Won't delete critical files
- Asks before schema changes
- Validates changes against specs
- Maintains code quality standards
- Creates incremental commits

## Getting Help

If you need help with a command:

1. Run the command without arguments for usage info
2. Check this guide
3. Look at task examples in `.simone/`
4. Review the command source in `.claude/commands/simone/`