import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";

interface ModuleOptions {
  name?: string;
  crud?: boolean;
}

export async function createModule(options: ModuleOptions): Promise<void> {
  // Get current directory
  const currentDir = process.cwd();

  // Check if we're in a NestJS project by looking for nest-cli.json
  if (!fs.existsSync(path.join(currentDir, "nest-cli.json"))) {
    console.log(
      chalk.red(
        "Error: This command should be executed inside a NestJS project."
      )
    );
    return;
  }

  // If module name is not provided via options, prompt for it
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

  // Create module directory
  const moduleDir = path.join(currentDir, "src", moduleName as any);

  // Check if directory already exists
  if (fs.existsSync(moduleDir)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: "confirm",
        name: "overwrite",
        message: `Module ${moduleName} already exists. Do you want to overwrite it?`,
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log(chalk.red("Operation cancelled."));
      return;
    }

    // Remove existing directory
    fs.removeSync(moduleDir);
  }

  // Create module structure
  fs.mkdirSync(moduleDir);

  // Create DTOs directory
  fs.mkdirSync(path.join(moduleDir, "dto"));

  // Create entities directory
  fs.mkdirSync(path.join(moduleDir, "entities"));

  // Create module files
  createModuleFiles(moduleDir, moduleName as any, withCrud);

  // Update app.module.ts to include the new module
  updateAppModule(currentDir, moduleName as any);

  console.log(chalk.green(`Module ${moduleName} created successfully!`));
}

function createModuleFiles(
  moduleDir: string,
  moduleName: string,
  withCrud: boolean
): void {
  const singularName = moduleName.endsWith("s")
    ? moduleName.slice(0, -1)
    : moduleName;

  const className = toPascalCase(singularName);
  const propertyName = toCamelCase(singularName);

  // Create module.ts
  fs.writeFileSync(
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

  fs.writeFileSync(
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

  fs.writeFileSync(
    path.join(moduleDir, `${moduleName}.service.ts`),
    serviceContent
  );

  // Create entity
  fs.writeFileSync(
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
    fs.writeFileSync(
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
    fs.writeFileSync(
      path.join(moduleDir, "dto", `update-${singularName}.dto.ts`),
      `import { PartialType } from '@nestjs/swagger';
import { Create${className}Dto } from './create-${singularName}.dto';

export class Update${className}Dto extends PartialType(Create${className}Dto) {}
`
    );
  }
}

function updateAppModule(currentDir: string, moduleName: string): void {
  const appModulePath = path.join(currentDir, "src", "app.module.ts");

  if (!fs.existsSync(appModulePath)) {
    console.log(
      chalk.yellow(
        "Warning: app.module.ts not found. Could not update app module."
      )
    );
    return;
  }

  const className = toPascalCase(
    moduleName.endsWith("s") ? moduleName.slice(0, -1) : moduleName
  );
  const moduleClassName = `${className}Module`;

  try {
    let appModuleContent = fs.readFileSync(appModulePath, "utf8");

    // Check if the module is already imported
    if (appModuleContent.includes(`${moduleClassName}`)) {
      console.log(
        chalk.yellow(`${moduleClassName} is already imported in AppModule.`)
      );
      return;
    }

    // Add import statement
    const importStatement = `import { ${moduleClassName} } from './${moduleName}/${moduleName}.module';`;
    let newContent = "";

    if (appModuleContent.includes("import {")) {
      // Add after the last import statement
      const lastImportIndex = appModuleContent.lastIndexOf("import");
      const endOfImportIndex =
        appModuleContent.indexOf(";", lastImportIndex) + 1;

      newContent =
        appModuleContent.substring(0, endOfImportIndex) +
        "\n" +
        importStatement +
        appModuleContent.substring(endOfImportIndex);
    } else {
      // No imports yet, add at the beginning of the file
      newContent = importStatement + "\n" + appModuleContent;
    }

    // Add to imports array in the @Module decorator
    if (newContent.includes("imports: [")) {
      newContent = newContent.replace(
        "imports: [",
        `imports: [\n    ${moduleClassName},`
      );
    } else if (newContent.includes("imports: [],")) {
      newContent = newContent.replace(
        "imports: [],",
        `imports: [${moduleClassName}],`
      );
    } else {
      console.log(
        chalk.yellow(
          "Could not find imports array in AppModule. Please add it manually."
        )
      );
    }

    fs.writeFileSync(appModulePath, newContent);
  } catch (error: any) {
    console.log(chalk.red(`Error updating app.module.ts: ${error.message}`));
  }
}

// Utility functions
function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
