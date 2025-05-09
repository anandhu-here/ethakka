import inquirer from "inquirer";
import path from "path";
import { BaseCommand } from "./base-command";
import { ModuleOptions } from "../../../common/interfaces/command-options";
import { FileUtils } from "../../../common/utils/file-utils";
import { StringUtils } from "../../../common/utils/string-utils";

/**
 * ModuleCommand - Handles the creation of a new NestJS module
 */
export class ModuleCommand extends BaseCommand {
  async execute(options: ModuleOptions): Promise<void> {
    // Check if we're in a NestJS project
    if (!this.isNestJSProject()) {
      this.logError(
        "Error: This command should be executed inside a NestJS project."
      );
      return;
    }

    // Get module name and CRUD options from options or prompt
    let moduleName = options.name;
    let withCrud = options.crud || false;

    if (!moduleName) {
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "name",
          message: "What is the name of your module?",
          validate: (input: string) => {
            if (/^([a-z\-\_\d])+$/.test(input)) return true;
            else
              return "Module name may only include lowercase letters, numbers, underscores and hashes.";
          },
        },
        {
          type: "confirm",
          name: "crud",
          message: "Do you want to include CRUD operations?",
          default: true,
        },
      ]);

      moduleName = answers.name;
      withCrud = answers.crud;
    }

    // Ensure module name is in plural form for consistency
    moduleName = StringUtils.getPlural(moduleName as any);

    // Create module directory
    const moduleDir = path.join(process.cwd(), "src", moduleName);

    // Confirm overwrite if directory exists
    if (!(await this.confirmOverwrite(moduleDir))) {
      return;
    }

    // Create module structure
    FileUtils.createDirectory(moduleDir);
    FileUtils.createDirectory(path.join(moduleDir, "dto"));
    FileUtils.createDirectory(path.join(moduleDir, "entities"));

    // Create module files
    this.createModuleFiles(moduleDir, moduleName, withCrud);

    // Update app.module.ts to include the new module
    this.updateAppModule(moduleName);

    this.logSuccess(`Module ${moduleName} created successfully!`);
  }

  private createModuleFiles(
    moduleDir: string,
    moduleName: string,
    withCrud: boolean
  ): void {
    const singularName = StringUtils.getSingular(moduleName);
    const className = StringUtils.toPascalCase(singularName);
    const propertyName = StringUtils.toCamelCase(singularName);

    // Create module.ts
    FileUtils.createFile(
      path.join(moduleDir, `${moduleName}.module.ts`),
      `import { Module } from '@nestjs/common';
import { ${className}Controller } from './${moduleName}.controller';
import { ${className}Service } from './${moduleName}.service';

@Module({
  controllers: [${className}Controller],
  providers: [${className}Service],
  exports: [${className}Service],
})
export class ${className}Module {}
`
    );

    // Create controller.ts
    let controllerContent = "";
    if (withCrud) {
      controllerContent = `import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ${className}Service } from './${moduleName}.service';
import { Create${className}Dto } from './dto/create-${singularName}.dto';
import { Update${className}Dto } from './dto/update-${singularName}.dto';

@ApiTags('${moduleName}')
@Controller('${moduleName}')
export class ${className}Controller {
  constructor(private readonly ${propertyName}Service: ${className}Service) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ${singularName}' })
  @ApiResponse({ status: 201, description: 'The ${singularName} has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() create${className}Dto: Create${className}Dto) {
    return this.${propertyName}Service.create(create${className}Dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ${moduleName}' })
  @ApiResponse({ status: 200, description: 'Return all ${moduleName}.' })
  findAll() {
    return this.${propertyName}Service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ${singularName} by id' })
  @ApiResponse({ status: 200, description: 'Return the ${singularName}.' })
  @ApiResponse({ status: 404, description: '${className} not found.' })
  findOne(@Param('id') id: string) {
    return this.${propertyName}Service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a ${singularName}' })
  @ApiResponse({ status: 200, description: 'The ${singularName} has been successfully updated.' })
  @ApiResponse({ status: 404, description: '${className} not found.' })
  update(@Param('id') id: string, @Body() update${className}Dto: Update${className}Dto) {
    return this.${propertyName}Service.update(id, update${className}Dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a ${singularName}' })
  @ApiResponse({ status: 204, description: 'The ${singularName} has been successfully deleted.' })
  @ApiResponse({ status: 404, description: '${className} not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.${propertyName}Service.remove(id);
  }
}
`;
    } else {
      controllerContent = `import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ${className}Service } from './${moduleName}.service';

@ApiTags('${moduleName}')
@Controller('${moduleName}')
export class ${className}Controller {
  constructor(private readonly ${propertyName}Service: ${className}Service) {}
}
`;
    }

    FileUtils.createFile(
      path.join(moduleDir, `${moduleName}.controller.ts`),
      controllerContent
    );

    // Create service.ts
    let serviceContent = "";
    if (withCrud) {
      serviceContent = `import { Injectable, NotFoundException } from '@nestjs/common';
import { Create${className}Dto } from './dto/create-${singularName}.dto';
import { Update${className}Dto } from './dto/update-${singularName}.dto';

@Injectable()
export class ${className}Service {
  private ${propertyName}s = [];

  create(create${className}Dto: Create${className}Dto) {
    const ${propertyName} = {
      id: Date.now().toString(),
      ...create${className}Dto,
    };
    
    this.${propertyName}s.push(${propertyName});
    return ${propertyName};
  }

  findAll() {
    return this.${propertyName}s;
  }

  findOne(id: string) {
    const ${propertyName} = this.${propertyName}s.find(item => item.id === id);
    
    if (!${propertyName}) {
      throw new NotFoundException(\`${className} with ID \${id} not found\`);
    }
    
    return ${propertyName};
  }

  update(id: string, update${className}Dto: Update${className}Dto) {
    const ${propertyName}Index = this.${propertyName}s.findIndex(item => item.id === id);
    
    if (${propertyName}Index === -1) {
      throw new NotFoundException(\`${className} with ID \${id} not found\`);
    }
    
    this.${propertyName}s[${propertyName}Index] = {
      ...this.${propertyName}s[${propertyName}Index],
      ...update${className}Dto,
    };
    
    return this.${propertyName}s[${propertyName}Index];
  }

  remove(id: string) {
    const ${propertyName}Index = this.${propertyName}s.findIndex(item => item.id === id);
    
    if (${propertyName}Index === -1) {
      throw new NotFoundException(\`${className} with ID \${id} not found\`);
    }
    
    this.${propertyName}s.splice(${propertyName}Index, 1);
  }
}
`;
    } else {
      serviceContent = `import { Injectable } from '@nestjs/common';

@Injectable()
export class ${className}Service {}
`;
    }

    FileUtils.createFile(
      path.join(moduleDir, `${moduleName}.service.ts`),
      serviceContent
    );

    // Create entity
    FileUtils.createFile(
      path.join(moduleDir, "entities", `${singularName}.entity.ts`),
      `export class ${className} {
  id: string;
${
  withCrud
    ? `  createdAt: Date;
  updatedAt: Date;
`
    : ""
}
}
`
    );

    // Create DTOs
    if (withCrud) {
      // Create DTO
      FileUtils.createFile(
        path.join(moduleDir, "dto", `create-${singularName}.dto.ts`),
        `import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class Create${className}Dto {
  @ApiProperty({
    description: 'The name of the ${singularName}',
    example: '${className} 1',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
`
      );

      // Update DTO
      FileUtils.createFile(
        path.join(moduleDir, "dto", `update-${singularName}.dto.ts`),
        `import { PartialType } from '@nestjs/swagger';
import { Create${className}Dto } from './create-${singularName}.dto';

export class Update${className}Dto extends PartialType(Create${className}Dto) {}
`
      );
    }
  }

  private updateAppModule(moduleName: string): void {
    const appModulePath = path.join(process.cwd(), "src", "app.module.ts");

    if (!FileUtils.exists(appModulePath)) {
      this.logWarning(
        "Warning: app.module.ts not found. Could not update app module."
      );
      return;
    }

    const singularName = StringUtils.getSingular(moduleName);
    const className = StringUtils.toPascalCase(singularName);
    const moduleClassName = `${className}Module`;

    try {
      FileUtils.updateFile(appModulePath, (content) => {
        // Check if the module is already imported
        if (content.includes(`${moduleClassName}`)) {
          this.logWarning(
            `${moduleClassName} is already imported in AppModule.`
          );
          return content;
        }

        let updatedContent = content;

        // Add import statement
        const importStatement = `import { ${moduleClassName} } from './${moduleName}/${moduleName}.module';`;

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
            `imports: [\n    ${moduleClassName},`
          );
        } else if (updatedContent.includes("imports: [],")) {
          updatedContent = updatedContent.replace(
            "imports: [],",
            `imports: [${moduleClassName}],`
          );
        } else {
          this.logWarning(
            "Could not find imports array in AppModule. Please add it manually."
          );
        }

        return updatedContent;
      });
    } catch (error: any) {
      this.logError(`Error updating app.module.ts: ${error.message}`);
    }
  }
}
