import inquirer from "inquirer";
import path from "path";
import { BaseCommand } from "./base-command";
import { ProjectCommand } from "./project-command";
import { ModuleCommand } from "./module-command";
import { AuthCommand } from "./auth-command";
import { DatabaseCommand } from "./database-command";
import { execSync } from "child_process";
import chalk from "chalk";
import { EnvironmentUtils } from "../../../common/utils/environment-utils";
import { StringUtils } from "../../../common/utils/string-utils";
import { FileUtils } from "../../../common/utils/file-utils";

interface AllOptions {
  name?: string;
  auth?: boolean;
  db?: string;
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

      // Step 3: Add database if requested
      if (projectDetails.database) {
        this.logInfo(
          `Adding ${projectDetails.database} database integration...`
        );
        const databaseCommand = new DatabaseCommand();
        await databaseCommand.execute({ type: projectDetails.database });

        // Install database dependencies
        this.logInfo("Installing database dependencies...");
        this.runCommand("npm install");
      }

      // Step 4: Add authentication if requested
      if (projectDetails.auth) {
        this.logInfo("Adding authentication...");
        const authCommand = new AuthCommand();
        await authCommand.execute({ jwt: true });

        // Install auth dependencies
        this.logInfo("Installing authentication dependencies...");
        this.runCommand("npm install");
      }

      // Step 5: Add requested modules
      if (projectDetails.modules && projectDetails.modules.length > 0) {
        // Filter out user/users modules if auth is enabled
        let modulesToCreate = projectDetails.modules;
        if (projectDetails.auth) {
          if (
            modulesToCreate.includes("user") ||
            modulesToCreate.includes("users")
          ) {
            this.logWarning(
              `Skipping 'user' module since it's already created by the authentication module.`
            );

            modulesToCreate
              .filter((module) => module !== "user" && module !== "users")
              .unshift("user");
          } else {
            modulesToCreate.unshift("user");
          }
        }

        for (const moduleName of modulesToCreate) {
          this.logInfo(`Creating module: ${moduleName}...`);
          const moduleCommand = new ModuleCommand();

          // Ensure we use the plural form of module names consistently
          const pluralModuleName = StringUtils.getPlural(moduleName);
          await moduleCommand.execute({ name: pluralModuleName, crud: true });
        }
      }

      // Step 6: Now that we have modules and models defined, generate the Prisma client
      if (projectDetails.database === "prisma") {
        this.logInfo("Generating Prisma client...");
        this.runCommand("npx prisma generate");
      }

      // Step 7: Generate REST client files for all modules
      if (projectDetails.modules && projectDetails.modules.length > 0) {
        this.logInfo("Generating VS Code REST client files...");
        const restClientDir = path.join(projectDir, ".vscode", "rest-client");
        FileUtils.createDirectory(path.join(projectDir, ".vscode"));
        FileUtils.createDirectory(restClientDir);

        // Generate auth REST client file
        // RestClientUtils.createAuthRestClient(restClientDir);

        // Generate module-specific REST client files
        // for (const moduleName of projectDetails.modules) {
        //   const pluralModuleName = StringUtils.getPlural(moduleName);
        //   RestClientUtils.createModuleRestClient(
        //     restClientDir,
        //     pluralModuleName
        //   );
        // }
      }

      this.logSuccess(`
✅ Project ${projectDetails.name} has been successfully created!

Your project includes:
${projectDetails.auth ? "- JWT Authentication" : ""}
${
  projectDetails.database
    ? `- ${projectDetails.database} Database Integration`
    : ""
}
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

${
  projectDetails.database === "prisma"
    ? "For Prisma database:\n1. Update your .env file with the DATABASE_URL\n2. Run npx prisma migrate dev to create your first migration\n3. Run npx prisma studio to explore your database\n"
    : ""
}
Don't forget to update the environment variables in the .env file!
      `);
    } catch (error: any) {
      this.logError(`Error creating project: ${error.message}`);
    }
  }

  private async promptForDetails(options: AllOptions): Promise<{
    name: string;
    auth: boolean;
    database: string;
    modules: string[];
  }> {
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

    // Database
    if (!options.db) {
      questions.push({
        type: "list",
        name: "database",
        message: "Select a database integration:",
        choices: [
          { name: "Prisma - Modern TypeScript ORM", value: "prisma" },
          { name: "None - Skip database integration", value: null },
        ],
        default: "prisma",
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

    // Determine if auth will be enabled to show the appropriate message
    let willAuthBeEnabled = options.auth;
    if (willAuthBeEnabled === undefined) {
      // Use default value of true if not specified in options
      willAuthBeEnabled = true;
    }

    // Modules
    questions.push({
      type: "input",
      name: "modules",
      message: `Enter module names (comma-separated) you want to create, or leave empty:${
        willAuthBeEnabled
          ? " (Note: user/users module will be skipped as auth creates it)"
          : ""
      }`,
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
      database: options.db || answers.database,
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
