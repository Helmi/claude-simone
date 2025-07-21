# Simone - AI-Powered Project Management

Simone is a comprehensive project and task management system designed specifically for AI-assisted development workflows. It provides structured prompts and tools to help AI assistants understand and work with your projects effectively.

[![Mentioned in Awesome Claude Code](https://awesome.re/mentioned-badge.svg)](https://github.com/hesreallyhim/awesome-claude-code)

## Choose Your Version

This repository contains two implementations of Simone:

### 🏗️ Legacy System (Original)

The initial implementation of Simone. A directory-based task management system that provides a more complete feature set and has been used in real projects.

**[→ Get started with Legacy Simone](/legacy/README.md)**

### 🚀 MCP Server (Early Access)

A new implementation using the Model Context Protocol (MCP). This version offers structured prompts, activity tracking, and deeper Claude Code integration.

⚠️ **Early Access**: The MCP version is in active development and best suited for early adopters.

**[→ Get started with MCP Simone](/mcp-server/README.md)**

## Which Version Should I Use?

- **Use Legacy Simone** if you want the more complete feature set with directory-based organization
- **Try MCP Simone** if you want to experiment with the new Model Context Protocol integration

Both versions can be installed using the `hello-simone` installer:

```bash
npx hello-simone          # Install legacy version
npx hello-simone --mcp    # Install MCP version (early access)
```

## Repository Structure

- [`/legacy`](/legacy) - The original directory-based Simone system
- [`/mcp-server`](/mcp-server) - The new MCP implementation (early access)
- [`/hello-simone`](/hello-simone) - Universal installer for both versions

## Contributing

As we're in a transition period, please open an issue before contributing to discuss whether changes should target the legacy system or the new MCP implementation.

## License

MIT License - see LICENSE file for details.