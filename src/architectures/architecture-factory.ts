import inquirer from 'inquirer';
import { BaseArchitecture } from './base-architecture';
import { NestArchitecture } from './nest/nest-architecture';

/**
 * Factory for creating architecture instances
 */
export class ArchitectureFactory {
  /**
   * Get architecture instance based on name
   */
  static getArchitecture(name: string): BaseArchitecture {
    switch (name.toLowerCase()) {
      case 'nest':
      case 'nestjs':
        return new NestArchitecture();
      // Add more architectures here in the future
      // case 'express':
      //   return new ExpressArchitecture();
      default:
        throw new Error(`Unsupported architecture: ${name}`);
    }
  }

  /**
   * Prompt user to select an architecture
   */
  static async promptForArchitecture(): Promise<BaseArchitecture> {
    const { architecture } = await inquirer.prompt([
      {
        type: 'list',
        name: 'architecture',
        message: 'Select the architecture for your project:',
        choices: [
          { name: 'NestJS - A progressive Node.js framework', value: 'nest' },
          // Add more architectures here in the future
          // { name: 'Express - Fast, unopinionated, minimalist web framework', value: 'express' },
        ],
        default: 'nest',
      },
    ]);

    return this.getArchitecture(architecture);
  }
}
