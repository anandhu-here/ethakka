import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import Mustache from "mustache";

/**
 * FileUtils class - Handles file operations for the CLI
 */
export class FileUtils {
  /**
   * Read template file and render with context data
   */
  static renderTemplate(templatePath: string, context: any): string {
    try {
      const templateContent = fs.readFileSync(templatePath, "utf8");
      return Mustache.render(templateContent, context);
    } catch (error: any) {
      console.error(chalk.red(`Error rendering template: ${error.message}`));
      throw error;
    }
  }

  /**
   * Create a file with content
   */
  static createFile(filePath: string, content: string): void {
    try {
      // Create directory if it doesn't exist
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content);
    } catch (error: any) {
      console.error(chalk.red(`Error creating file: ${error.message}`));
      throw error;
    }
  }

  /**
   * Copy directory recursively
   */
  static copyDirectory(src: string, dest: string): void {
    try {
      fs.copySync(src, dest);
    } catch (error: any) {
      console.error(chalk.red(`Error copying directory: ${error.message}`));
      throw error;
    }
  }

  /**
   * Create directory if it doesn't exist
   */
  static createDirectory(dirPath: string): void {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch (error: any) {
      console.error(chalk.red(`Error creating directory: ${error.message}`));
      throw error;
    }
  }

  /**
   * Check if a file or directory exists
   */
  static exists(path: string): boolean {
    return fs.existsSync(path);
  }

  /**
   * Remove a file or directory
   */
  static remove(path: string): void {
    try {
      fs.removeSync(path);
    } catch (error: any) {
      console.error(chalk.red(`Error removing path: ${error.message}`));
      throw error;
    }
  }

  /**
   * Update file content
   */
  static updateFile(
    filePath: string,
    updater: (content: string) => string
  ): void {
    try {
      if (!this.exists(filePath)) {
        throw new Error(`File ${filePath} does not exist`);
      }

      const content = fs.readFileSync(filePath, "utf8");
      const updatedContent = updater(content);
      fs.writeFileSync(filePath, updatedContent);
    } catch (error: any) {
      console.error(chalk.red(`Error updating file: ${error.message}`));
      throw error;
    }
  }
}
