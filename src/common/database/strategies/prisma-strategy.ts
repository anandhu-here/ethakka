import path from "path";
import { DatabaseStrategy } from "../database-strategy";
import { FileUtils } from "../../utils/file-utils";
import { StringUtils } from "../../utils/string-utils";

/**
 * PrismaStrategy - Prisma ORM implementation
 */
export class PrismaStrategy implements DatabaseStrategy {
  getRepositoryTemplate(entityName: string): string {
    throw new Error("Method not implemented.");
  }
  getName(): string {
    return "Prisma";
  }

  getDependencies(): Record<string, string> {
    return {
      "@prisma/client": "^5.0.0",
    };
  }

  getDevDependencies(): Record<string, string> {
    return {
      prisma: "^5.0.0",
    };
  }

  generateConfigFiles(projectPath: string): void {
    // Create prisma directory
    const prismaDir = path.join(projectPath, "prisma");
    FileUtils.createDirectory(prismaDir);

    // Create schema.prisma
    FileUtils.createFile(
      path.join(prismaDir, "schema.prisma"),
      `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Add your models here
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  password  String
  roles     String[] @default(["user"])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`
    );

    // Create prisma service
    const prismaServiceDir = path.join(projectPath, "src", "prisma");
    FileUtils.createDirectory(prismaServiceDir);

    FileUtils.createFile(
      path.join(prismaServiceDir, "prisma.service.ts"),
      `import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper method to clean up data in tests
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    
    // List all tables here in appropriate order considering foreign key constraints
    // Example: await this.user.deleteMany();
    const tablenames: any = await this.$queryRaw\`SELECT tablename FROM pg_tables WHERE schemaname = 'public'\`;

    for (const record of tablenames) {
      const tablename = record.tablename;
      if (tablename !== '_prisma_migrations') {
        try {
          await this.$executeRawUnsafe(\`TRUNCATE TABLE "public"."$\{tablename\}" CASCADE;\`);
        } catch (error) {
          console.error(\`Error truncating $\{tablename\}\`, error);
        }
      }
    }
  }
}
`
    );

    // Create prisma module
    FileUtils.createFile(
      path.join(prismaServiceDir, "prisma.module.ts"),
      `import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
`
    );

    // Add prisma seed script
    const packageJsonPath = path.join(projectPath, "package.json");

    if (FileUtils.exists(packageJsonPath)) {
      try {
        const packageJson = require(packageJsonPath);

        // Add Prisma scripts
        if (!packageJson.scripts) {
          packageJson.scripts = {};
        }

        packageJson.scripts["prisma:studio"] = "prisma studio";
        packageJson.scripts["prisma:generate"] = "prisma generate";
        packageJson.scripts["prisma:migrate"] = "prisma migrate dev --name";
        packageJson.scripts["db:seed"] = "ts-node prisma/seed.ts";
        packageJson.scripts["db:reset"] = "prisma migrate reset --force";

        // Add Prisma seed configuration
        packageJson.prisma = {
          seed: {
            executor: "ts-node",
            options: {
              transpileOnly: true,
            },
          },
        };

        // Write back to package.json
        FileUtils.createFile(
          packageJsonPath,
          JSON.stringify(packageJson, null, 2)
        );
      } catch (error: any) {
        console.error(`Error updating package.json: ${error.message}`);
      }
    }

    // Create seed file
    FileUtils.createFile(
      path.join(prismaDir, "seed.ts"),
      `import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: adminPassword,
      roles: ['admin', 'user'],
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`
    );

    // Update the app module to include Prisma
    const appModulePath = path.join(projectPath, "src", "app.module.ts");

    if (FileUtils.exists(appModulePath)) {
      FileUtils.updateFile(appModulePath, (content) => {
        // Check if PrismaModule is already imported
        if (content.includes("PrismaModule")) {
          console.log("PrismaModule is already imported in AppModule.");
          return content;
        }

        let updatedContent = content;

        // Add import statement
        const importStatement = `import { PrismaModule } from './prisma/prisma.module';`;

        if (updatedContent.includes("import {")) {
          // Add after the last import statement
          const lastImportIndex = updatedContent.lastIndexOf("import");
          const endOfImportIndex =
            updatedContent.indexOf(";", lastImportIndex) + 1;

          updatedContent =
            updatedContent.substring(0, endOfImportIndex) +
            "\n" +
            importStatement +
            updatedContent.substring(endOfImportIndex);
        } else {
          // No imports yet, add at the beginning of the file
          updatedContent = importStatement + "\n" + updatedContent;
        }

        // Add to imports array in the @Module decorator
        if (updatedContent.includes("imports: [")) {
          updatedContent = updatedContent.replace(
            "imports: [",
            `imports: [\n    PrismaModule,`
          );
        } else if (updatedContent.includes("imports: [],")) {
          updatedContent = updatedContent.replace(
            "imports: [],",
            `imports: [PrismaModule],`
          );
        }

        return updatedContent;
      });
    }
  }

  getModelTemplate(entityName: string, fields: Record<string, string>): string {
    const className = StringUtils.toPascalCase(entityName);

    return `model ${className} {
  id        String   @id @default(uuid())
  
  // Add your fields here
  // Example:
  // name      String
  // email     String?
  // isActive  Boolean @default(true)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`;
  }
  getServiceImplementation(entityName: string): string {
    const className = StringUtils.toPascalCase(entityName);
    const propertyName = StringUtils.toCamelCase(entityName);

    return `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Create${className}Dto } from '../dto/create-${entityName}.dto';
import { Update${className}Dto } from '../dto/update-${entityName}.dto';

@Injectable()
export class ${className}Service {
  constructor(private readonly prisma: PrismaService) {}

  async create(create${className}Dto: Create${className}Dto) {
    // Implement your create logic here
    // Example:
    return this.prisma.${propertyName}.create({
      data: create${className}Dto,
    });
  }

  async findAll() {
    // Implement your findAll logic here
    // Example:
    return this.prisma.${propertyName}.findMany();
  }

  async findOne(id: string) {
    // Implement your findOne logic here
    // Example:
    const ${propertyName} = await this.prisma.${propertyName}.findUnique({
      where: { id },
    });
    
    if (!${propertyName}) {
      throw new NotFoundException(\`${className} with ID \${id} not found\`);
    }
    
    return ${propertyName};
  }

  async update(id: string, update${className}Dto: Update${className}Dto) {
    // Implement your update logic here
    // Example:
    try {
      return await this.prisma.${propertyName}.update({
        where: { id },
        data: update${className}Dto,
      });
    } catch (error) {
      throw new NotFoundException(\`${className} with ID \${id} not found\`);
    }
  }

  async remove(id: string) {
    // Implement your remove logic here
    // Example:
    try {
      return await this.prisma.${propertyName}.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(\`${className} with ID \${id} not found\`);
    }
  }
}`;
  }

  getModuleImports(): string {
    return "";
  }

  getServiceProvider(entityName: string): string {
    return "";
  }

  getAppConfig(): string {
    return "";
  }

  formatEntityFields(fields: Record<string, string>): string {
    // Create empty field template with comments for guidance
    return `  // Define your fields here
  // Examples:
  // name      String
  // email     String?
  // age       Int
  // isActive  Boolean @default(true)
`;
  }
}
