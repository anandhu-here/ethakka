import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import { FileUtils } from '../utils/file-utils';

/**
 * BaseCommand - Abstract base class for all commands
 */
export abstract class BaseCommand {
  /**
   * Execute the command
   */
  abstract execute(options: any): Promise<void>;

  /**
   * Check if we're in a NestJS project
   */
  protected isNestJSProject(): boolean {
    return FileUtils.exists(path.join(process.cwd(), 'nest-cli.json'));
  }

  /**
   * Ask for confirmation to overwrite
   */
  protected async confirmOverwrite(path: string): Promise<boolean> {
    if (!FileUtils.exists(path)) {
      return true;
    }

    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `${path} already exists. Do you want to overwrite it?`,
        default: false,
      },
    ]);

    if (overwrite) {
      FileUtils.remove(path);
      return true;
    }

    console.log(chalk.yellow('Operation cancelled.'));
    return false;
  }

  /**
   * Log a success message
   */
  protected logSuccess(message: string): void {
    console.log(chalk.green(message));
  }

  /**
   * Log an error message
   */
  protected logError(message: string): void {
    console.log(chalk.red(message));
  }

  /**
   * Log an info message
   */
  protected logInfo(message: string): void {
    console.log(chalk.cyan(message));
  }

  /**
   * Log a warning message
   */
  protected logWarning(message: string): void {
    console.log(chalk.yellow(message));
  }
}
