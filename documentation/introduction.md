---
sidebar_position: 1
---

import FeatureCard from '@site/src/components/FeatureCard';
import styles from '@site/src/components/FeatureCard.module.css';

# Welcome to Simone Documentation

<div class="lead-paragraph">
Simone is a specialized framework designed to empower AI agents, particularly those like Claude Code, to operate effectively within complex software engineering projects. It offers a suite of features that enable a context-aware environment, ensuring the AI always has the precise information needed to perform its tasks.
</div>

:::tip
Looking for the project files? Find them on the [GitHub Repository](https://github.com/helmi/claude-simone).
:::

## The Core Challenge: Context Management in AI Development

Large language models are powerful tools, yet they face a significant limitation: a finite context window. In dynamic coding sessions, critical project details—architectural decisions, evolving requirements, and past implementations—can be lost as the AI's conversational memory cycles. This "context decay" leads to inconsistencies, rework, and a diminished ability for the AI to act as a truly informed partner.

## Simone's Solution: Engineered Context for Every Task

Simone addresses this challenge by shifting the paradigm from continuous, memory-reliant sessions to a structured, task-based approach. Our core philosophy is simple:

> **Every task begins with a fresh, complete, and precisely relevant context.**

Instead of expecting the AI to retain all project knowledge across long interactions, Simone systematically primes the AI with the project's authoritative "ground truth"—its meticulously organized documentation, requirements, and architectural blueprints—at the outset of each distinct task. This empowers the AI to work with the same level of awareness and confidence as a human developer who consults project specifications before writing code.

## Explore Simone

### Legacy System: Stable & Ready

<div class={styles.featureGrid}>
  <FeatureCard
    title="File-Based Context"
    description="Organizes project knowledge in a structured directory of Markdown files for transparent context management."
    icon="📁"
    to="/legacy-overview"
  />
  <FeatureCard
    title="AI-Guided Commands"
    description="Utilizes human-readable Markdown files as detailed instructions for AI agents to execute complex tasks."
    icon="🤖"
    to="/initialize"
  />
  <FeatureCard
    title="Iterative Workflow"
    description="Supports a structured development cycle from planning milestones to executing and committing individual tasks."
    icon="🔄"
    to="/legacy-workflow"
  />
</div>

### MCP Server: The Future of AI Development

<div class={styles.featureGrid}>
  <FeatureCard
    title="Protocol-Driven Interaction"
    description="Communicates with AI agents via the Model Context Protocol (MCP) for robust and standardized interactions."
    icon="⚡"
    to="/mcp-overview"
  />
  <FeatureCard
    title="Activity Logging"
    description="Features a built-in SQLite database to persistently log all AI-assisted development activities for analysis."
    icon="📊"
    to="/mcp-workflow"
  />
  <FeatureCard
    title="Dynamic Prompts"
    description="Leverages Handlebars templating to create highly configurable and context-aware prompts for AI agents."
    icon="✨"
    to="/prompt-reference"
  />
</div>

## Getting Started

Ready to enhance your AI-assisted development? Choose your path:

*   [**Legacy System Installation**](/legacy-installation) - Start with the stable, production-ready version.
*   [**MCP Server Installation**](/mcp-installation) - Explore the cutting-edge, in-development future of Simone.
