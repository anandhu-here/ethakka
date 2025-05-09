import inquirer from "inquirer";
import path from "path";
import { BaseCommand } from "./base-command";
import { ProjectCommand } from "./project-command";
import { ModuleCommand } from "./module-command";
import { AuthCommand } from "./auth-command";
import { execSync } from "child_process";
import chalk from "chalk";
import { EnvironmentUtils } from "../../../common/utils/environment-utils";

interface AllOptions {
  name?: string;
  auth?: boolean;
  modules?: string[];
}

/**
 * AllCommand - Creates a complete project with all components
 */
export class AllCommand extends BaseCommand {
  async execute(options: AllOptions): Promise<void> {
    // Get project details
    const projectDetails = await this.promptForDetails(options);

    try {
      // Step 1: Create the project
      this.logInfo("Creating project structure...");
      const projectCommand = new ProjectCommand();
      await projectCommand.execute({ name: projectDetails.name });

      // Navigate to the project directory
      const projectDir = path.resolve(process.cwd(), projectDetails.name);
      process.chdir(projectDir);

      // Generate environment files with all necessary keys
      this.logInfo("Generating environment configuration files...");
      EnvironmentUtils.generateEnvironmentFiles(projectDir);

      // Step 2: Install dependencies
      this.logInfo("Installing dependencies...");
      this.runCommand("npm install");

      // Step 3: Add authentication if requested
      if (projectDetails.auth) {
        this.logInfo("Adding authentication...");
        const authCommand = new AuthCommand();
        await authCommand.execute({ jwt: true });

        // Install auth dependencies
        this.logInfo("Installing authentication dependencies...");
        this.runCommand("npm install");
      }

      // Step 4: Add requested modules
      if (projectDetails.modules && projectDetails.modules.length > 0) {
        for (const moduleName of projectDetails.modules) {
          this.logInfo(`Creating module: ${moduleName}...`);
          const moduleCommand = new ModuleCommand();
          await moduleCommand.execute({ name: moduleName, crud: true });
        }
      }

      this.logSuccess(`
✅ Project ${projectDetails.name} has been successfully created!

Your project includes:
${projectDetails.auth ? "- JWT Authentication" : ""}
${
  projectDetails.modules && projectDetails.modules.length
    ? "- Modules: " + projectDetails.modules.join(", ")
    : ""
}
- Swagger API Documentation
- Environment Configuration Files
- Config Module Set Up

To get started:
$ cd ${projectDetails.name}
$ npm run start:dev

Don't forget to update the environment variables in the .env file!
      `);
    } catch (error: any) {
      this.logError(`Error creating project: ${error.message}`);
    }
  }

  private async promptForDetails(
    options: AllOptions
  ): Promise<{ name: string; auth: boolean; modules: string[] }> {
    const questions = [];

    // Project name
    if (!options.name) {
      questions.push({
        type: "input",
        name: "name",
        message: "What is the name of your project?",
        default: "my-nestjs-app",
        validate: (input: string) => {
          if (/^([a-z\-\_\d])+$/.test(input)) return true;
          else
            return "Project name may only include lowercase letters, numbers, underscores and hashes.";
        },
      });
    }

    // Authentication
    if (options.auth === undefined) {
      questions.push({
        type: "confirm",
        name: "auth",
        message: "Do you want to include authentication?",
        default: true,
      });
    }

    // Modules
    questions.push({
      type: "input",
      name: "modules",
      message:
        "Enter module names (comma-separated) you want to create, or leave empty:",
      filter: (input: string) => {
        if (!input) return [];
        return input
          .split(",")
          .map((m) => m.trim())
          .filter((m) => m);
      },
    });

    const answers = await inquirer.prompt(questions);

    return {
      name: options.name || answers.name,
      auth: options.auth !== undefined ? options.auth : answers.auth,
      modules: options.modules || answers.modules,
    };
  }

  private runCommand(command: string): void {
    try {
      execSync(command, { stdio: "inherit" });
    } catch (error: any) {
      this.logError(`Command failed: ${command}`);
      throw error;
    }
  }
}
