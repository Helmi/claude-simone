# Simone MCP

This is not just an additional MCP-Server for the Simone project, it's more like a new approach to Simone overall.

## IMPORTANT: Work in Progress

Consider this a very early version and approach to the Simone MCP-Server and a new approach to Simone.

**Help shape the future of Simone** If you're interested in shaping the future of Simone, get in touch. I'm happy to invite you to a private Discord where we discuss the future Development of the project.

**Here is where it differs**

- MCP-Server Prompts instead of Custom Slashcommands
- Handlebards based Prompts and Partials - fully customizable and with optional dynamic parts
- Github for Issue/Sprint/Milestone management (very early implementation, Text based Tasks to follow later)
- Integrated Activity Logging

## Installation

As always - through hello-simone. Run this from your projects root

```bash
npx hello-simone --mcp
```

Afterwards open Claude Code, allow simone mcp to start and run the /init_simone prompt and follow the instructions.

## Configuration

hello-simone should automatically configure the mcp server for your project. You need to allow it to activate though, ideally don't run Claude Code with --dangerously-skip-permisssions on the first run, it might skip the mcp-config then.

To manually configure, add this to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "simone": {
      "command": "npx",
      "args": ["--yes", "simone-mcp@latest"],
      "env": {
        "PROJECT_PATH": "/path/to/your/project"
      }
    }
  }
}
```

## Command/Prompt Customization

For now check out .src/templates/prompts and .src/templates/prompts/partials in this repo to be aware of the available commands. You can just copy any of these files to your projects .simone/prompts and .simone/prompts/partials folder or create any new files there following the same format. They will automatically get picked up on the next mcp server restart (Restarting Claude Code should be enough).

More information will follow. A documentation is in the works.

## License

MIT
