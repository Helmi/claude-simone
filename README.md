# Simone for Claude Code

[![Mentioned in Awesome Claude Code](https://awesome.re/mentioned-badge.svg)](https://github.com/hesreallyhim/awesome-claude-code)

## What is this?

Simone is a directory-based project management system I built to work better with Claude Code. It's basically a set of folders, markdown files, and custom commands that help break down software projects into manageable chunks that AI can handle effectively.

**⚠️ Complexity Warning**: Simone is a sophisticated system that requires time to understand properly. It's not a simple plug-and-play solution, but rather a framework that works best when you take the time to learn how it operates and adapt it to your workflow.

**📋 Latest Updates**: See [CHANGELOG.md](CHANGELOG.md) for recent changes and improvements.

## How to Get Started

### 1. Install Simone

```bash
npx hello-simone
```

This sets up the folder structure and installs/updates the command files in your project. Can also be used to update an existing installation - command files get backed up automatically.

### 2. Initialize Your Project

Open your project in Claude Code and run:

```
/project:simone:initialize
```

This guides you through the basic setup process. Works with new or existing codebases, and can help you create project documentation (PRDs, architecture docs) or work with documents you already have.

### 3. Set Up Your First Milestone

Create a milestone folder in `.simone/02_REQUIREMENTS/` named `M01_Your_Milestone_Name` (e.g., `M01_Basic_Application`). Include at least:

- `M01_PRD.md` - Product requirements document
- Other specs as needed: `M01_Database_Schema.md`, `M01_API_Specs.md`, etc.

*Note: There's no command for this yet. Use the existing chat from step 2 to guide Claude through milestone creation, ensuring proper naming with the `M##_` prefix and underscores.*

### 4. Break Down into Sprints

```
/project:simone:create_sprints_from_milestone
```

This analyzes your milestone and breaks it down into logical sprints. It looks at the entire scope and creates meaningful sprint boundaries without detailed tasks yet.

### 5. Create Your First Tasks

```
/project:simone:create_sprint_tasks
```

This analyzes your sprints, reviews documentation, researches necessary information, and identifies knowledge gaps to gain comprehensive understanding of your project. Creates detailed, actionable tasks for the current sprint.

*Important: Only create tasks for your next sprint, not all sprints upfront. After completing Sprint 1, then create tasks for Sprint 2. This ensures the system can reference your existing codebase and incorporate completed work into future task creation.*

### 6. Start Working

```
/project:simone:do_task
```

This will automatically pick a task from your general tasks or sprints. For faster execution, specify a task ID:

```
/project:simone:do_task T01_S01
```

Claude will then work through the specified task with full project context.

That's the basic workflow to get started! You can also:

- Create general tasks with `/project:simone:create_general_task`
- Use YOLO mode to run a full sprint autonomously
- Explore other commands in `.claude/commands/simone/`

**Important**: Simone is a complex system, not a simple set-and-forget tool. It works best when you understand how it operates. Take time to read through the commands and consider adapting them to your workflow.

## How it Works

Simone organizes your project into:

- **Milestones**: Major features or project phases
- **Sprints**: Groups of related tasks within a milestone
- **Tasks**: Individual work items scoped for one Claude session

Each task gets full project context so Claude knows exactly what to build and how it fits into your architecture.

## Why I built this

AI coding tools have become incredibly powerful, but they all face the same fundamental challenge: context management. The context window is limited in size, and we have little control over what stays in context and what doesn't.

The problem with long-running sessions is context decay - as you work, critical project knowledge silently falls off the end of the context window. You don't know what's been forgotten until something goes wrong.

My solution: Start fresh for each task, but provide rich surrounding context. By keeping tasks focused and well-scoped, I can dedicate more of the context window to relevant project knowledge, requirements, and architectural decisions. This way:

- Each task starts with exactly the project context it needs
- No critical knowledge gets lost in long sessions
- Claude can work confidently with full awareness of requirements
- The surrounding context guides development, not just the task description

The result is a task-based workflow where Claude always has the right context for the job at hand.

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

### .claude/commands/simone/

Custom Claude Code commands that power the Simone workflow:

- `initialize` - Set up project structure and documentation
- `create_sprints_from_milestone` - Break milestones into logical sprints
- `create_sprint_tasks` - Generate detailed tasks from sprint plans
- `do_task` - Execute individual tasks with full context
- `yolo` - Autonomous sprint execution (use with caution)
- And many more for testing, reviewing, and project management

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

## Configuration Tips

### Enabling Parallel Task Execution

While Simone commands like `create_sprint_tasks` support the `useParallelSubagents` instruction, Claude Code needs to be configured to actually execute tasks in parallel. By default, it only runs one task at a time.

To enable parallel execution:

```bash
# Set the number of parallel tasks (example: 3)
claude config set --global "parallelTasksCount" 3

# Check your current configuration
claude config list -g
```

**Important considerations:**

- Choose the number based on your system's capabilities and rate limits
- Parallel execution increases API usage significantly
- Some tasks may have conflicts when run in parallel
- Start with a small number (2-3) and adjust based on your experience

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
