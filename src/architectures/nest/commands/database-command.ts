import inquirer from "inquirer";
import path from "path";
import { BaseCommand } from "./base-command";
import { FileUtils } from "../../../common/utils/file-utils";
import { DatabaseOptions } from "../../../common/interfaces/database-options";
import { DatabaseStrategyFactory } from "../../../common/database/database-strategy-factory";

/**
 * DatabaseCommand - Handles adding database support to a NestJS project
 */
export class DatabaseCommand extends BaseCommand {
  async execute(options: DatabaseOptions): Promise<void> {
    // Check if we're in a NestJS project
    if (!this.isNestJSProject()) {
      this.logError(
        "Error: This command should be executed inside a NestJS project."
      );
      return;
    }

    // Get database strategy from options or prompt
    const dbType = options.type;
    let databaseStrategy;

    if (dbType) {
      try {
        databaseStrategy = DatabaseStrategyFactory.getStrategy(dbType);
      } catch (error: any) {
        this.logError(`Error: ${error.message}`);
        databaseStrategy = await DatabaseStrategyFactory.promptForStrategy();
      }
    } else {
      databaseStrategy = await DatabaseStrategyFactory.promptForStrategy();
    }

    this.logInfo(`Adding ${databaseStrategy.getName()} database support...`);

    // Get the current project directory
    const projectDir = process.cwd();

    // Generate configuration files
    databaseStrategy.generateConfigFiles(projectDir);

    // Update package.json with dependencies
    this.updatePackageJson(projectDir, databaseStrategy);

    this.logSuccess(
      `${databaseStrategy.getName()} database integration added successfully!`
    );
    this.logInfo("\nTo complete setup:");
    this.logInfo("1. Run npm install to install new dependencies");

    if (databaseStrategy.getName().toLowerCase() === "prisma") {
      this.logInfo("2. Update your .env file with the correct DATABASE_URL");
      this.logInfo("3. Run npx prisma generate to generate the Prisma client");
      this.logInfo(
        "4. Run npx prisma migrate dev to create your first migration"
      );
    }
  }

  private updatePackageJson(projectDir: string, databaseStrategy: any): void {
    const packageJsonPath = path.join(projectDir, "package.json");

    if (!FileUtils.exists(packageJsonPath)) {
      this.logWarning(
        "Warning: package.json not found. Could not update dependencies."
      );
      return;
    }

    try {
      const packageJson = require(packageJsonPath);

      // Add dependencies
      if (!packageJson.dependencies) {
        packageJson.dependencies = {};
      }

      const dependencies = databaseStrategy.getDependencies();
      for (const [name, version] of Object.entries(dependencies)) {
        packageJson.dependencies[name] = version;
      }

      // Add dev dependencies
      if (!packageJson.devDependencies) {
        packageJson.devDependencies = {};
      }

      const devDependencies = databaseStrategy.getDevDependencies();
      for (const [name, version] of Object.entries(devDependencies)) {
        packageJson.devDependencies[name] = version;
      }

      // Write back to package.json
      FileUtils.createFile(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2)
      );
    } catch (error: any) {
      this.logError(`Error updating package.json: ${error.message}`);
    }
  }
}
