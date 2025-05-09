import inquirer from 'inquirer';
import { DatabaseStrategy } from './database-strategy';
import { PrismaStrategy } from './strategies/prisma-strategy';

/**
 * Factory for creating database strategy instances
 */
export class DatabaseStrategyFactory {
  /**
   * Get database strategy based on name
   */
  static getStrategy(name: string): DatabaseStrategy {
    switch (name.toLowerCase()) {
      case 'prisma':
        return new PrismaStrategy();
      // Add more strategies here in the future
      // case 'typeorm':
      //   return new TypeormStrategy();
      // case 'mongoose':
      //   return new MongooseStrategy();
      default:
        throw new Error(`Unsupported database strategy: ${name}`);
    }
  }

  /**
   * Prompt user to select a database strategy
   */
  static async promptForStrategy(): Promise<DatabaseStrategy> {
    const { strategy } = await inquirer.prompt([
      {
        type: 'list',
        name: 'strategy',
        message: 'Select a database integration:',
        choices: [
          { name: 'Prisma - Modern TypeScript ORM', value: 'prisma' },
          // Add more strategies here in the future
          // { name: 'TypeORM - ORM for TypeScript and JavaScript', value: 'typeorm' },
          // { name: 'Mongoose - MongoDB ODM', value: 'mongoose' },
        ],
        default: 'prisma',
      },
    ]);

    return this.getStrategy(strategy);
  }
}
