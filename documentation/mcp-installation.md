---
sidebar_position: 2
---

# MCP Server: Installation

**Note:** The MCP Server is currently in active development and is not yet recommended for production use. The installation process and usage patterns are subject to change.

## Installation

The MCP server is designed to be installed as a global command-line tool or used directly with `npx`.

```bash
# Global installation (recommended for frequent use)
npm install -g @helmi/simone-mcp

# Or use directly without installation
npx @helmi/simone-mcp
```

## Configuration: Connecting to Your Project

To enable the MCP server for a project, you need to add it to your project's `.mcp.json` configuration file. This file tells your AI development tool how to communicate with Simone.

Create a `.mcp.json` file in the root of your project with the following content:

```json
{
  "mcpServers": {
    "simone": {
      "command": "npx",
      "args": ["@helmi/simone-mcp"],
      "env": {
        "PROJECT_PATH": "/path/to/your/project"
      }
    }
  }
}
```

### Key Configuration Parameters:

*   **`command`**: The command to execute the server. Using `npx` here ensures the latest version is run without manual updates.
*   **`args`**: The arguments to pass to the command, typically the name of the MCP package.
*   **`env.PROJECT_PATH`**: This is a crucial environment variable. You **must** provide the absolute path to your project directory. This informs the Simone MCP server which project it is managing and provides the necessary root context.

Once configured, your AI tool will be able to discover and utilize the prompts and tools exposed by the Simone MCP server.