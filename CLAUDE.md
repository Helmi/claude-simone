# CLAUDE Instructions - Simone Repository

**IMPORTANT:** This is a meta-repository situation. Be aware that this repo is used to develop a system called "Claude Simone" which is an addon to Claude Code to manage Tasks and Work. At the same time this repository itself uses Simone to organize its own work (currently the mcp-server based version).

## Activity Logging

You have access to the `log_activity` tool. Use it to record your activities after every activity that is relevant for the project. This helps track development progress and understand what has been done.

## Repository Structure

1. **`/legacy`** - The stable, production-ready Simone system
   - Directory-based command system
   - Fully functional and documented
   - Use this for actual project management

2. **`/hello-simone`** - NPM installer for legacy Simone
   - Installs the legacy system
   - Run with `npx hello-simone`

3. **`/mcp-server`** - New MCP implementation (early development)
   - Model Context Protocol based
   - Not ready for use
   - Active development

⚠ None of these directories should have dependencies outside. If you spot something, report it to the user.

4. **ADDITIONALLY** the meta part: ./simone contains the Framework files for this repo.

## Important Notes

- The legacy system is fully functional - use it for actual project management
- The MCP server is in early development and used for this project (with a dev version directly linked)
