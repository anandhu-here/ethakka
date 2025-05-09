import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

interface ProjectOptions {
  name?: string;
}

export async function createProject(options: ProjectOptions): Promise<void> {
  // If name is not provided via options, prompt for it
  let projectName = options.name;
  
  if (!projectName) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of your project?',
        default: 'my-nestjs-app',
        validate: (input: string) => {
          if (/^([a-z\-\_\d])+$/.test(input)) return true;
          else return 'Project name may only include lowercase letters, numbers, underscores and hashes.';
        }
      }
    ]);
    
    projectName = answers.name;
  }

  // Create project directory
  const targetDir = path.resolve(process.cwd(), projectName!);
  
  // Check if directory already exists
  if (fs.existsSync(targetDir)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Directory ${projectName} already exists. Do you want to overwrite it?`,
        default: false
      }
    ]);
    
    if (!overwrite) {
      console.log(chalk.red('Operation cancelled.'));
      return;
    }
    
    // Remove existing directory
    fs.removeSync(targetDir);
  }
  
  // Create project structure
  fs.mkdirSync(targetDir);
  
  // Create basic NestJS structure
  createProjectStructure(targetDir);

  console.log(chalk.green(`Project ${projectName} created successfully!`));
  console.log(chalk.cyan(`\nTo get started:\n$ cd ${projectName}\n$ npm install\n$ npm run start:dev\n`));
}

function createProjectStructure(targetDir: string): void {
  // Create src directory
  fs.mkdirSync(path.join(targetDir, 'src'));
  
  // Create basic app files
  createAppFiles(targetDir);
  
  // Create package.json
  createPackageJson(targetDir);
  
  // Create tsconfig.json
  createTsConfig(targetDir);
  
  // Create nest-cli.json
  createNestCliJson(targetDir);
  
  // Create .gitignore
  createGitignore(targetDir);
  
  // Create README.md
  createReadme(targetDir);
}

function createAppFiles(targetDir: string): void {
  const srcDir = path.join(targetDir, 'src');
  
  // main.ts
  fs.writeFileSync(
    path.join(srcDir, 'main.ts'),
    `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global prefix
  app.setGlobalPrefix('api');
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  
  await app.listen(3000);
  console.log(\`Application is running on: \${await app.getUrl()}\`);
}

bootstrap();
`
  );
  
  // app.module.ts
  fs.writeFileSync(
    path.join(srcDir, 'app.module.ts'),
    `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
`
  );
  
  // Create common directory structure
  const commonDir = path.join(srcDir, 'common');
  fs.mkdirSync(commonDir);
  fs.mkdirSync(path.join(commonDir, 'decorators'));
  fs.mkdirSync(path.join(commonDir, 'filters'));
  fs.mkdirSync(path.join(commonDir, 'guards'));
  fs.mkdirSync(path.join(commonDir, 'interceptors'));
  fs.mkdirSync(path.join(commonDir, 'pipes'));
  
  // Create config directory
  const configDir = path.join(srcDir, 'config');
  fs.mkdirSync(configDir);
  
  // env.config.ts
  fs.writeFileSync(
    path.join(configDir, 'env.config.ts'),
    `export const envConfig = () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
});
`
  );
}

function createPackageJson(targetDir: string): void {
  fs.writeFileSync(
    path.join(targetDir, 'package.json'),
    `{
  "name": "${path.basename(targetDir)}",
  "version": "0.0.1",
  "description": "",
  "author": "",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \\"src/**/*.ts\\" \\"test/**/*.ts\\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \\"{src,apps,libs,test}/**/*.ts\\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.2",
    "@types/node": "^20.3.1",
    "@types/supertest": "^2.0.12",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.42.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "jest": "^29.5.0",
    "prettier": "^3.0.0",
    "source-map-support": "^0.5.21",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.4.3",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.1.3"
  },
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".*\\\\.spec\\\\.ts$",
    "transform": {
      "^.+\\\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
`
  );
}

function createTsConfig(targetDir: string): void {
  fs.writeFileSync(
    path.join(targetDir, 'tsconfig.json'),
    `{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
`
  );
  
  fs.writeFileSync(
    path.join(targetDir, 'tsconfig.build.json'),
    `{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
`
  );
}

function createNestCliJson(targetDir: string): void {
  fs.writeFileSync(
    path.join(targetDir, 'nest-cli.json'),
    `{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
`
  );
}

function createGitignore(targetDir: string): void {
  fs.writeFileSync(
    path.join(targetDir, '.gitignore'),
    `# compiled output
/dist
/node_modules

# Logs
logs
*.log
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS
.DS_Store

# Tests
/coverage
/.nyc_output

# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# IDE - VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# Env files
.env
.env.*
!.env.example
`
  );
  
  // Create .env.example
  fs.writeFileSync(
    path.join(targetDir, '.env.example'),
    `NODE_ENV=development
PORT=3000
`
  );
}

function createReadme(targetDir: string): void {
  const projectName = path.basename(targetDir);
  
  fs.writeFileSync(
    path.join(targetDir, 'README.md'),
    `# ${projectName}

## Description

[NestJS](https://github.com/nestjs/nest) application scaffolded with Ethakka CLI.

## Installation

\`\`\`bash
$ npm install
\`\`\`

## Running the app

\`\`\`bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
\`\`\`

## Test

\`\`\`bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
\`\`\`

## API Documentation

Once the application is running, you can access the Swagger API documentation at:

\`http://localhost:3000/docs\`
`
  );
}
