#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import figlet from "figlet";
import { ProjectCommand } from "./commands/project-command";
import { ModuleCommand } from "./commands/module-command";
import { AuthCommand } from "./commands/auth-command";
import { AllCommand } from "./commands/all-command";

// Initialize the CLI
const program = new Command();

// Show banner
console.log(
  chalk.green(figlet.textSync("Ethakka CLI", { horizontalLayout: "full" }))
);

// Set version and description
program
  .version("0.1.0")
  .description("A CLI for generating NestJS applications with best practices");

// Command to create a new project
program
  .command("project")
  .description("Create a new NestJS project")
  .option("-n, --name <name>", "Name of the project")
  .action(async (options) => {
    const projectCommand = new ProjectCommand();
    await projectCommand.execute(options);
  });

// Command to create a new module
program
  .command("module")
  .description("Create a new NestJS module")
  .option("-n, --name <name>", "Name of the module")
  .option("--crud", "Include CRUD operations")
  .action(async (options) => {
    const moduleCommand = new ModuleCommand();
    await moduleCommand.execute(options);
  });

// Command to add authentication
program
  .command("auth")
  .description("Add authentication to your NestJS application")
  .option("--jwt", "Use JWT for authentication")
  .action(async (options) => {
    const authCommand = new AuthCommand();
    await authCommand.execute(options);
  });

// Command to create a complete project with all components
program
  .command("all")
  .description("Create a complete project with all components")
  .option("-n, --name <name>", "Name of the project")
  .option("--auth", "Include authentication")
  .option("--modules <modules>", "Comma-separated list of modules to create")
  .action(async (options) => {
    const allCommand = new AllCommand();
    // Parse modules if provided as a string
    if (options.modules && typeof options.modules === "string") {
      options.modules = options.modules.split(",").map((m: any) => m.trim());
    }
    await allCommand.execute(options);
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
