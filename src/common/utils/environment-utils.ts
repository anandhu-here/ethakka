import { FileUtils } from "./file-utils";
import path from "path";
import chalk from "chalk";

/**
 * EnvironmentUtils class - Utilities for environment configuration
 */
export class EnvironmentUtils {
  /**
   * Generate environment files for a project
   */
  static generateEnvironmentFiles(
    projectPath: string,
    options: any = {}
  ): void {
    try {
      // Create .env file
      this.createEnvFile(projectPath);

      // Create .env.example file
      this.createEnvExampleFile(projectPath);

      // Create .env.development file
      this.createEnvDevelopmentFile(projectPath);

      // Create .env.production file
      this.createEnvProductionFile(projectPath);

      // Create .env.test file
      this.createEnvTestFile(projectPath);

      console.log(chalk.green("Environment files generated successfully!"));
    } catch (error: any) {
      console.error(
        chalk.red(`Error generating environment files: ${error.message}`)
      );
    }
  }

  /**
   * Create .env file
   */
  private static createEnvFile(projectPath: string): void {
    const envPath = path.join(projectPath, ".env");

    // Don't overwrite existing .env file as it might contain sensitive data
    if (FileUtils.exists(envPath)) {
      console.log(chalk.yellow(".env file already exists. Skipping..."));
      return;
    }

    FileUtils.createFile(
      envPath,
      `# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api
APP_NAME=${path.basename(projectPath)}
APP_DESCRIPTION=${path.basename(projectPath)} API
APP_VERSION=1.0.0

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/${path.basename(
        projectPath
      )}

# Authentication
JWT_SECRET=changeme
JWT_REFRESH_SECRET=changeme_refresh
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Logging
LOG_LEVEL=debug

# Security
CORS_ENABLED=true
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4200

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

# Swagger
SWAGGER_ENABLED=true
SWAGGER_TITLE=${path.basename(projectPath)} API
SWAGGER_DESCRIPTION=${path.basename(projectPath)} API Documentation
SWAGGER_VERSION=1.0.0
SWAGGER_PATH=docs

# Cache
CACHE_TTL=60000

# File Storage
UPLOAD_DESTINATION=uploads
MAX_FILE_SIZE=10485760 # 10MB
`
    );
  }

  /**
   * Create .env.example file
   */
  private static createEnvExampleFile(projectPath: string): void {
    const envExamplePath = path.join(projectPath, ".env.example");

    FileUtils.createFile(
      envExamplePath,
      `# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api
APP_NAME=app
APP_DESCRIPTION=API
APP_VERSION=1.0.0

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dbname

# Authentication
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Logging
LOG_LEVEL=debug

# Security
CORS_ENABLED=true
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4200

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

# Swagger
SWAGGER_ENABLED=true
SWAGGER_TITLE=API
SWAGGER_DESCRIPTION=API Documentation
SWAGGER_VERSION=1.0.0
SWAGGER_PATH=docs

# Cache
CACHE_TTL=60000

# File Storage
UPLOAD_DESTINATION=uploads
MAX_FILE_SIZE=10485760 # 10MB
`
    );
  }

  /**
   * Create .env.development file
   */
  private static createEnvDevelopmentFile(projectPath: string): void {
    const envDevPath = path.join(projectPath, ".env.development");

    FileUtils.createFile(
      envDevPath,
      `# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/${path.basename(
        projectPath
      )}_dev

# Logging
LOG_LEVEL=debug

# Swagger
SWAGGER_ENABLED=true
`
    );
  }

  /**
   * Create .env.production file
   */
  private static createEnvProductionFile(projectPath: string): void {
    const envProdPath = path.join(projectPath, ".env.production");

    FileUtils.createFile(
      envProdPath,
      `# Application
NODE_ENV=production
PORT=3000
API_PREFIX=api

# Database
# Use production database connection

# Logging
LOG_LEVEL=info

# Security
CORS_ENABLED=true
ALLOWED_ORIGINS=https://yourdomain.com

# Swagger
SWAGGER_ENABLED=false

# Cache
CACHE_TTL=300000 # 5 minutes
`
    );
  }

  /**
   * Create .env.test file
   */
  private static createEnvTestFile(projectPath: string): void {
    const envTestPath = path.join(projectPath, ".env.test");

    FileUtils.createFile(
      envTestPath,
      `# Application
NODE_ENV=test
PORT=3000
API_PREFIX=api

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/${path.basename(
        projectPath
      )}_test

# Logging
LOG_LEVEL=error

# Swagger
SWAGGER_ENABLED=false
`
    );
  }
}
