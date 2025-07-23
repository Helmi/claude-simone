import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import { promises as fs } from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import os from "os";
import { getPlatformProjectPath } from "./utils.js";

const execAsync = promisify(exec);

export async function installMCP(dryRun = false) {
  // Check requirements
  const spinner = ora();
  
  // Check Node.js version
  spinner.start("Checking Node.js version...");
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  if (majorVersion < 18) {
    spinner.fail(`Node.js version ${nodeVersion} detected. Simone requires Node.js >= 18.0.0`);
    console.log(chalk.yellow("\nPlease upgrade Node.js and try again."));
    process.exit(1);
  }
  spinner.succeed(`Node.js ${nodeVersion} ✓`);
  
  // Check git installation
  spinner.start("Checking git installation...");
  try {
    await execAsync("git --version");
    spinner.succeed("Git is installed ✓");
  } catch (error) {
    spinner.fail("Git is not installed");
    console.log(chalk.yellow("\nSimone requires git. Please install git and try again."));
    console.log(chalk.cyan("See: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git"));
    process.exit(1);
  }
  
  console.log();
  
  // Display early preview notice
  console.log(chalk.yellow.bold("⚠️  EARLY PREVIEW NOTICE ⚠️\n"));
  console.log(
    chalk.white(
      "This is an early preview of the MCP version of Simone.\n" +
        "Important notes:\n"
    )
  );
  console.log(
    chalk.white("  • No import process from legacy Simone available yet")
  );
  console.log(chalk.white("  • Best tested on non-critical projects"));
  console.log(chalk.white("  • We appreciate feedback!"));
  console.log(
    chalk.cyan(
      "    - GitHub Issues: https://github.com/Helmi/claude-simone/issues"
    )
  );
  console.log(chalk.cyan("    - Discord: @helmi\n"));

  // Confirm project directory
  const currentDir = process.cwd();
  console.log(chalk.white(`Current directory: ${chalk.green(currentDir)}\n`));

  let confirmDirectory = true;

  if (!dryRun) {
    const response = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmDirectory",
        message:
          "Is this the project folder where you want to activate Simone MCP?",
        default: true,
      },
    ]);
    confirmDirectory = response.confirmDirectory;
  } else {
    console.log(chalk.gray("(Dry run: auto-confirming directory)"));
  }

  if (!confirmDirectory) {
    console.log(
      chalk.yellow(
        "\nPlease navigate to your project directory and run this command again."
      )
    );
    process.exit(0);
  }

  if (dryRun) {
    console.log(chalk.blue("\n🔍 DRY RUN MODE - No changes will be made\n"));
  }

  try {
    // Step 1: Configure .mcp.json
    spinner.start("Configuring .mcp.json...");

    const mcpConfigPath = path.join(currentDir, ".mcp.json");
    let mcpConfig = { mcpServers: {} };

    // Check if .mcp.json exists
    try {
      const existingConfig = await fs.readFile(mcpConfigPath, "utf8");
      mcpConfig = JSON.parse(existingConfig);

      // Ensure mcpServers exists
      if (!mcpConfig.mcpServers) {
        mcpConfig.mcpServers = {};
      }

      // Check if simone is already configured
      if (mcpConfig.mcpServers.simone) {
        spinner.info(".mcp.json already has simone configured");
      }
    } catch (error) {
      // File doesn't exist or is invalid
      spinner.info(".mcp.json not found, will create new one");
    }

    // Add simone configuration
    mcpConfig.mcpServers.simone = {
      command: "npx",
      args: ["--yes", "simone-mcp@latest"],
      env: {
        PROJECT_PATH: getPlatformProjectPath(),
      },
    };

    if (!dryRun) {
      try {
        await fs.writeFile(
          mcpConfigPath,
          JSON.stringify(mcpConfig, null, 2) + "\n",
          "utf8"
        );
        spinner.succeed("Updated .mcp.json configuration");
      } catch (error) {
        spinner.fail("Failed to write .mcp.json");
        console.error(chalk.red("\nError details:"), error.message);
        process.exit(1);
      }
    } else {
      spinner.info("Would update .mcp.json with simone configuration");
      console.log(chalk.gray("\nConfiguration to add:"));
      console.log(
        chalk.gray(
          JSON.stringify({ simone: mcpConfig.mcpServers.simone }, null, 2)
        )
      );
    }


    // Step 2: Create .simone directory with templates
    spinner.start("Setting up .simone directory...");

    const simoneDir = path.join(currentDir, ".simone");

    if (!dryRun) {
      try {
        // Create .simone directory if it doesn't exist
        await fs.mkdir(simoneDir, { recursive: true });

        // List of templates to download
        const templates = [
          { name: 'project.yaml.template', target: 'project.yaml.template' },
          { name: 'constitution.md.template', target: 'constitution.md.template' },
          { name: 'architecture.md.template', target: 'architecture.md.template' },
          { name: 'CLAUDE.md.template', target: 'CLAUDE.md.template' }
        ];

        let downloadedCount = 0;
        let skippedCount = 0;
        let failedCount = 0;

        for (const template of templates) {
          const targetPath = path.join(simoneDir, template.target);
          
          // Check if file already exists
          try {
            await fs.access(targetPath);
            skippedCount++;
            continue; // Skip if exists
          } catch {
            // File doesn't exist, download it
          }

          // Download template from GitHub
          const templateUrl = `https://raw.githubusercontent.com/Helmi/claude-simone/main/mcp-server/templates/${template.name}`;
          
          try {
            const { stdout } = await execAsync(`curl -s -f "${templateUrl}"`);
            
            if (!stdout || stdout.trim() === '') {
              throw new Error("Empty response from GitHub");
            }
            
            await fs.writeFile(targetPath, stdout, "utf8");
            downloadedCount++;
          } catch (downloadError) {
            console.log(chalk.yellow(`\nWarning: Could not download ${template.name}`));
            failedCount++;
          }
        }

        // Report results
        if (downloadedCount > 0) {
          spinner.succeed(`Downloaded ${downloadedCount} template(s)`);
        }
        if (skippedCount > 0) {
          spinner.info(`Skipped ${skippedCount} existing template(s)`);
        }
        if (failedCount > 0) {
          spinner.warn(`Failed to download ${failedCount} template(s)`);
          console.log(chalk.yellow("\nSome templates could not be downloaded."));
          console.log(chalk.yellow("You can download them manually from:"));
          console.log(chalk.cyan("https://github.com/Helmi/claude-simone/tree/main/mcp-server/templates"));
          
          // Don't exit if some templates fail - user can continue with what downloaded
        }
      } catch (error) {
        spinner.fail("Failed to setup .simone directory");
        console.error(chalk.red("\nError details:"), error.message);
        if (!dryRun) {
          process.exit(1);
        }
      }
    } else {
      spinner.info("Would create .simone directory and download templates");
    }

    // Success message
    console.log(chalk.green.bold("\n✅ Simone MCP installation complete!\n"));

    // Next steps
    console.log(chalk.cyan.bold("Next steps:\n"));
    console.log(chalk.white("1. Restart Claude Code"));
    console.log(chalk.white("2. Run /init_simone to configure Simone for your project\n"));
  } catch (error) {
    spinner.fail("Installation failed");
    throw error;
  }
}
