# Changelog

All notable changes to the Simone MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Note**: This changelog tracks the MCP server implementation only. The legacy Simone command system has its own versioning.

## [Unreleased]

### Added

- New `refine_pr` prompt template for pull request refinement workflows (#52)
- Optional GitHub Projects integration with project setup and work queue features (#59)
- New `create_idea` prompt for conversational idea capture
- GitHub project operations partial (`github_project.hbs`)
- Comprehensive test suite for MCP server (PR #64 - pending)

### Fixed

- Added missing ESLint dependencies to fix development tooling

## [0.2.0] - 2025-07-23

### Added

- PR review wait feature that automatically monitors and reports pull request status
- Configurable optional features system allowing users to enable/disable functionality
- Better error handling and retry logic for GitHub API operations

### Changed

- Enhanced work_issue prompt with automatic git synchronization and improved flexibility
- Improved template context handling for more reliable prompt rendering

### Fixed

- SQLite database lock errors by implementing proper connection sharing
- Features configuration not being passed to Handlebars templates correctly
- GitHub label fetching in create_issue prompt now retrieves actual repository labels

### Removed

- Git worktree feature due to incompatibility with Claude's session isolation model

## [0.1.0] - 2025-07-21

### Added

- Activity logging to track your development progress over time
- Smart prompt templates that adapt to your project context
- GitHub integration for managing issues and tasks directly from Claude
- Live template updates - changes take effect without restarting
- Support for multiple project contexts in one workspace

### Changed

- Completely new architecture using Claude's Model Context Protocol (MCP)
- More reliable and faster than the directory-based approach

### Notes

This is the first release of the new MCP-based Simone. It requires Claude Desktop and is available as an npm package (`simone-mcp`).
