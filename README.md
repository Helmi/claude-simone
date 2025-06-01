# Simone - A Project Management System for Claude Code

## What is this?

Simone is a directory-based project management system I built to work better with Claude Code. It's basically a set of folders, markdown files, and custom commands that help break down software projects into manageable chunks that AI can handle effectively.

**⚠️ Early Stage Warning**: This is very much a work in progress. I've been using it for my own projects and found it incredibly helpful, so I'm sharing it. But it's currently tuned to how I work, and your mileage may vary.

## 🆕 What's New (Latest Updates)

- **Quick Start**: Use `npx hello-simone` to initialize Simone in any project
- **Interactive Setup**: Improved `initialize` command with adaptive, conversational setup
- **Smart Commit Filtering**: Use `commit T01_S02` to commit only files related to that task
- **YOLO Mode**: Use `commit YOLO` to skip confirmations for faster iteration
- **Autonomous Execution**: New `yolo` command for unattended task processing ⚠️ **Use with extreme caution**
- **Enhanced Task Generation**: Much better context and codebase references in generated tasks
- **ADR Documentation**: New template for tracking architectural decisions
- **Better Review Tracking**: Code reviews now log directly to your task files
- **Cleaner Templates**: Simplified date formats and better structure throughout

### ⚠️ YOLO Mode Safety Warning

The `yolo` command can run tasks autonomously without user interaction. **Only use in isolated environments like dev containers.** It can potentially modify or delete files outside your project. Never run on production systems or systems with important data.

## What it actually does

### 1. Start with your requirements

- Bring well-thought-out documents (PRDs, architecture specs, database schemas)
- Organize them into milestones in the structured folders
- Define your project vision and technical approach

### 2. Break down the work

- Use commands to split milestones into manageable sprints
- Create focused tasks within each sprint
- Each task is scoped to be completed in one Claude session

### 3. Execute with confidence

- Claude works through tasks one by one with full context
- Automatic code review after each task (zero tolerance for spec deviations!)
- Smart commits group related changes logically

### 4. Stay on track

- Run periodic project reviews for health checks
- Get timestamped snapshots of progress and technical debt
- Brutally honest assessments keep your standards high

The whole system runs purely with Claude Code - no external tools, no complex setup. Just markdown files, folders, and commands that create a repeatable workflow for AI-assisted development.

## Why I built this

AI coding tools have become incredibly powerful, but they all face the same fundamental challenge: context management. The context window is limited in size, and we have little control over what stays in context and what doesn't.

The problem with long-running sessions is context decay - as you work, critical project knowledge silently falls off the end of the context window. You don't know what's been forgotten until something goes wrong.

My solution: Start fresh for each task, but provide rich surrounding context. By keeping tasks focused and well-scoped, I can dedicate more of the context window to relevant project knowledge, requirements, and architectural decisions. This way:

- Each task starts with exactly the project context it needs
- No critical knowledge gets lost in long sessions
- Claude can work confidently with full awareness of requirements
- The surrounding context guides development, not just the task description

The result is a task-based workflow where Claude always has the right context for the job at hand.

## How I use it

1. **Start with requirements**: I write down what I want to build in PRD documents
2. **Break into tasks**: Each task should be doable in one Claude session (this is crucial!)
3. **Let Claude work**: Use `do_task` and Claude follows the task structure
4. **Review regularly**: After each task, review what was done
5. **Track progress**: Completed tasks are renamed with `TX` prefix, project reviews go in `10_STATE_OF_PROJECT/`

## Simone Commands Reference

All Simone commands are available in Claude Code with the `/project:simone:` prefix:

### Project Setup & Management
- **`/project:simone:initialize`** - Interactive setup for new projects with adaptive, conversational guidance
- **`/project:simone:plan_milestone`** - Create new milestones with proper structure and documentation
- **`/project:simone:project_review`** - Generate timestamped project health reports and assessments

### Sprint & Task Planning
- **`/project:simone:create_sprints_from_milestone`** - Break down milestones into manageable sprints
- **`/project:simone:create_sprint_tasks`** - Generate detailed tasks from sprint requirements
- **`/project:simone:create_general_task`** - Create standalone tasks not tied to specific sprints

### Task Execution & Development
- **`/project:simone:do_task [task_id]`** - Execute tasks with full context validation and structured workflow
- **`/project:simone:prime`** - Prepare Claude with current project context and focus

### Quality Assurance
- **`/project:simone:code_review [task_id]`** - Run comprehensive code review against requirements (zero tolerance for spec deviations)
- **`/project:simone:test [scope]`** - Run tests with smart scope detection
- **`/project:simone:testing_review`** - Comprehensive testing analysis and recommendations

### Git Integration
- **`/project:simone:commit [task_id] [YOLO]`** - Create logical git commits with smart filtering by task context
  - Use task IDs like `T01_S02` to commit only related files
  - Add `YOLO` to skip confirmations for faster iteration

### Advanced Workflows
- **`/project:simone:yolo`** - ⚠️ **Autonomous task execution** - Use with extreme caution, only in isolated environments
- **`/project:simone:discuss_review`** - Interactive discussion about code review results and improvements

### Command Usage Examples

```bash
# Set up a new project
/project:simone:initialize

# Create a new milestone
/project:simone:plan_milestone "API Authentication System"

# Break milestone into sprints
/project:simone:create_sprints_from_milestone M02

# Create a specific task
/project:simone:create_general_task "Implement rate limiting middleware"

# Execute a task
/project:simone:do_task T01_S02

# Review and commit task changes
/project:simone:code_review T01_S02
/project:simone:commit T01_S02

# Run project health check
/project:simone:project_review
```

## Getting Started

### Quick Start (Recommended)

```bash
npx hello-simone
```

This will:

- Install the Simone framework in your project
- Guide you through interactive setup
- Create initial documentation based on your project

### Manual Installation

1. Copy the `.simone` directory structure to your project
2. Run `/project:simone:initialize` in Claude Code - it will:
   - Detect your project type automatically
   - Guide you through creating architecture docs
   - Help set up your first milestone
   - Generate your project manifest

The new initialize command is conversational and adapts to your project's needs!

That's it. The system guides you (and Claude) through the rest.

## Key Components

### 00_PROJECT_MANIFEST.md

The central document containing the project's vision, goals, and high-level overview. It serves as the starting point for Claude to understand the project. **Important**: The manifest file must be named exactly `00_PROJECT_MANIFEST.md`, not `MANIFEST.md`.

### 01_PROJECT_DOCS/

Contains general project documentation including technical specifications, user guides, and API documentation that Claude can reference.

### 02_REQUIREMENTS/

Organized by milestones, this directory stores product requirements documents (PRDs) and their amendments, providing a clear view of what needs to be built. This helps Claude understand the project requirements. Milestone folders must follow the naming convention `M##_Milestone_Name/` (e.g., `M01_Backend_Setup/`).

### 03_SPRINTS/

Contains sprint plans and task definitions organized by milestone and sprint sequence. Each sprint folder contains individual task files with detailed information for Claude to work on.

### 04_GENERAL_TASKS/

Stores task definitions for work not tied to a specific sprint. Completed tasks use a `TX` prefix (e.g., `TX001_Completed_Task.md`), making it easy for Claude to identify what's been done.

### 05_ARCHITECTURAL_DECISIONS/

Captures significant architectural decisions as Architecture Decision Records (ADRs), documenting the context, options considered, and rationale. This provides critical context for Claude when making technical decisions. Uses a structured ADR template for consistency.

### 10_STATE_OF_PROJECT/

Contains timestamped project review snapshots created by the `project_review` command. These provide a historical record of project health, technical decisions, and progress over time.

### 99_TEMPLATES/

Contains standardized templates for different document types to ensure consistency for both humans and Claude:

- Task templates with structured objectives and acceptance criteria
- Sprint and milestone metadata templates
- ADR template for documenting architectural decisions
- All templates use simplified date formats (YYYY-MM-DD HH:MM)

## Directory Structure

```plaintext
.simone/
├── 00_PROJECT_MANIFEST.md
├── 01_PROJECT_DOCS/
├── 02_REQUIREMENTS/
│   ├── M01_Backend_Setup/
│   ├── M02_Frontend_Setup/
│   └── ...
├── 03_SPRINTS/
│   ├── S01_M01_Initial_API/
│   ├── S02_M01_Database_Schema/
│   └── ...
├── 04_GENERAL_TASKS/
│   ├── TX001_Refactor_Logging_Module.md  # Completed task
│   ├── T002_API_Rate_Limiting.md          # Open task
│   └── ...
├── 05_ARCHITECTURE_DECISIONS/
│   ├── ADR001_Database_Selection.md
│   └── ...
├── 10_STATE_OF_PROJECT/         # Project review snapshots
└── 99_TEMPLATES/
    ├── task_template.md
    ├── sprint_meta_template.md
    └── milestone_meta_template.md
```

## Task Structure

Tasks are the atomic units of work in Simone. Each task file includes:

```markdown
---
task_id: T001
status: in_progress # open | in_progress | pending_review | done | blocked
complexity: Medium # Low | Medium | High
last_updated: 2025-05-23 10:30
---

# Task: Task Title

## Description
Detailed explanation of the task...

## Goal / Objectives
- Objective 1
- Objective 2

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Subtasks
- [ ] Subtask 1
- [ ] Subtask 2

## Output Log
[2025-05-23 10:30] Started task
[2025-05-23 10:45] Completed subtask 1: Updated database schema
[2025-05-23 11:00] Modified files: models/user.js, migrations/001_add_user_table.js
```

## Key Workflow Features

### Automatic Code Review

Every task completion triggers a code review that:

- Compares implementation against requirements
- Checks for spec deviations (zero tolerance!)
- Creates actionable fix items on failure
- Logs results directly to task files for tracking
- Only marks tasks complete after passing review

### Enhanced Task Generation

Task creation commands now provide:

- Deep codebase analysis and integration point discovery
- Specific file references and implementation patterns
- Existing test patterns and error handling approaches
- Technical guidance based on actual project architecture
- Much higher quality, actionable task descriptions

### Smart Git Commits

The `commit` command:

- Groups related changes logically by task or feature
- Supports task ID filtering (e.g., `T01_S02`, `TX003`)
- Includes YOLO mode for automated commits without approval
- Proposes conventional commit messages
- Gets your approval before each commit (unless YOLO mode)
- No AI attribution in messages

### Project Health Tracking

Regular `project_review` creates timestamped reports showing:

- Architecture quality scores
- Technical debt assessment
- Progress against milestones
- John Carmack-style critique (brutally honest!)

## Contributing & Feedback

I'd love to hear from you! This is very much shaped by how I work, and I'm sure there are tons of improvements to be made.

- **GitHub Issues**: Best place for bugs and feature requests
- **Anthropic Discord**: Find me @helmi if you want to chat about it
- **Pull Requests**: Very welcome! Let's make this better together

I'm particularly interested in:

- How you're using it differently
- What's missing for your workflow
- Ideas for better Claude Code integration
- Different organizational approaches
