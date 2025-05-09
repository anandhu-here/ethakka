#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import figlet from "figlet";
import { ArchitectureFactory } from "./architectures/architecture-factory";
import { AllOptions } from "./common/interfaces/command-options";
import { DatabaseOptions } from "./common/interfaces/database-options";

// Initialize the CLI
const program = new Command();

// Show banner
console.log(
  chalk.green(figlet.textSync("Ethakka CLI", { horizontalLayout: "full" }))
);

// Set version and description
program
  .version("0.1.0")
  .description("A CLI for generating applications with best practices");

// Command to create a new project
program
  .command("project")
  .description("Create a new project")
  .option("-n, --name <name>", "Name of the project")
  .option(
    "-a, --architecture <architecture>",
    "Architecture to use (nest, express, etc.)"
  )
  .action(async (options) => {
    try {
      const architecture = options.architecture
        ? ArchitectureFactory.getArchitecture(options.architecture)
        : await ArchitectureFactory.promptForArchitecture();

      await architecture.createProject(options);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

// Command to create a new module
program
  .command("module")
  .description("Create a new module")
  .option("-n, --name <name>", "Name of the module")
  .option("--crud", "Include CRUD operations")
  .option(
    "-a, --architecture <architecture>",
    "Architecture to use (nest, express, etc.)"
  )
  .action(async (options) => {
    try {
      const architecture = options.architecture
        ? ArchitectureFactory.getArchitecture(options.architecture)
        : await ArchitectureFactory.promptForArchitecture();

      await architecture.createModule(options);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

// Command to add authentication
program
  .command("auth")
  .description("Add authentication to your application")
  .option("--jwt", "Use JWT for authentication")
  .option(
    "-a, --architecture <architecture>",
    "Architecture to use (nest, express, etc.)"
  )
  .action(async (options) => {
    try {
      const architecture = options.architecture
        ? ArchitectureFactory.getArchitecture(options.architecture)
        : await ArchitectureFactory.promptForArchitecture();

      await architecture.addAuthentication(options);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

// Command to add database integration
program
  .command("db")
  .description("Add database integration to your application")
  .option("--type <type>", "Type of database (prisma, typeorm, mongoose)")
  .option(
    "-a, --architecture <architecture>",
    "Architecture to use (nest, express, etc.)"
  )
  .action(async (options: any) => {
    try {
      const architecture = options.architecture
        ? ArchitectureFactory.getArchitecture(options.architecture)
        : await ArchitectureFactory.promptForArchitecture();

      await architecture.addDatabase(options);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

// Command to create a complete project with all components
program
  .command("all")
  .description("Create a complete project with all components")
  .option("-n, --name <name>", "Name of the project")
  .option("--auth", "Include authentication")
  .option("--db <type>", "Database integration (prisma, typeorm, mongoose)")
  .option("--modules <modules>", "Comma-separated list of modules to create")
  .option(
    "-a, --architecture <architecture>",
    "Architecture to use (nest, express, etc.)"
  )
  .action(async (options: any) => {
    try {
      // Parse modules if provided as a string
      if (options.modules && typeof options.modules === "string") {
        options.modules = options.modules.split(",").map((m: any) => m.trim());
      }

      const architecture = options.architecture
        ? ArchitectureFactory.getArchitecture(options.architecture)
        : await ArchitectureFactory.promptForArchitecture();

      await architecture.createAll(options);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
