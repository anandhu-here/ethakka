#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { createProject } from './commands/create-project';
import { createModule } from './commands/create-module';

// Initialize the CLI
const program = new Command();

// Show banner
console.log(
  chalk.green(
    figlet.textSync('Ethakka CLI', { horizontalLayout: 'full' })
  )
);

// Set version and description
program
  .version('0.1.0')
  .description('A CLI for generating NestJS applications with best practices');

// Command to create a new project
program
  .command('project')
  .description('Create a new NestJS project')
  .option('-n, --name <name>', 'Name of the project')
  .action(async (options) => {
    await createProject(options);
  });

// Command to create a new module
program
  .command('module')
  .description('Create a new NestJS module')
  .option('-n, --name <name>', 'Name of the module')
  .option('--crud', 'Include CRUD operations')
  .action(async (options) => {
    await createModule(options);
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
