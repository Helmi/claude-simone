---
sidebar_position: 2
---

# Context Engineering

Large language models have a fundamental limitation: a finite context window. Meanwhile, modern software projects are vast, complex, and spread across thousands of files. You can't simply paste an entire codebase into a prompt and expect a good result. So, how do you provide an AI with the right information to perform a meaningful engineering task?

This is the core problem that Context Engineering solves. Instead of flooding the AI with irrelevant data or providing too little information for it to be effective, Context Engineering is the discipline of designing, managing, and delivering the precise, relevant context an AI needs to perform a specific task. It is the foundational practice upon which the Simone framework is built.

## Core Principles of Context Engineering

Simone is built on several key principles of context engineering:

### 1. Structured Knowledge

Instead of treating project information as a single, monolithic block, it is organized into logical, queryable components. This includes high-level vision, architectural documentation, specific requirements, and the breakdown of work into tasks. This separation allows for the precise retrieval of information relevant to any given task.

### 2. Layered Context

The AI is provided with layers of context, moving from the general to the specific. When executing a task, it can be given access to the overarching project goals, relevant architectural patterns, and the fine-grained details of the specific work item, ensuring it has a multi-faceted understanding of its objective.

### 3. Just-in-Time Context

Information is provided precisely when needed. By tying context retrieval to specific commands or prompts, we ensure the information provided is always relevant to the job at hand. This minimizes noise and maximizes the signal of the information presented to the model.

### 4. AI-Friendly Format

All project artifacts are stored in simple, machine-readable formats (primarily Markdown and YAML). This design choice makes it effortless for the AI to parse, understand, and reason about the project's state.

## Context Engineering in Practice

Simone provides concrete mechanisms to implement these principles, ensuring that the AI always operates with the most relevant and up-to-date information.

*   **Structured Knowledge Base:** At its core, Simone maintains a structured repository of all project-related information. This includes everything from high-level architectural guides to specific task requirements, ensuring all context is organized and accessible.

*   **Intelligent Context Loading:** Commands in both the legacy system (e.g., `/simone:do_task`) and the MCP server (e.g., `/do_task`) act as powerful, context-aware triggers. When executed, they intelligently gather and load the precise information required for the specific task at hand.

*   **On-Demand Context for Fresh Sessions:** This approach enables a powerful workflow where a developer can start a fresh session with a minimal context. By executing a single command, such as one to begin work on an open issue, Simone instantly assembles and provides all the necessary background, specifications, and file context. This allows the AI to focus directly on the task, avoiding the noise of irrelevant information and preventing it from becoming overwhelmed.

By mastering context engineering, Simone transforms the AI from a simple code generator into a true engineering partner that understands the *why* behind the *what*.