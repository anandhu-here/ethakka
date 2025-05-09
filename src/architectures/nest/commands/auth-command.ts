import inquirer from "inquirer";
import path from "path";
import { BaseCommand } from "./base-command";
import { AuthOptions } from "../../../common/interfaces/command-options";
import { FileUtils } from "../../../common/utils/file-utils";
import { StringUtils } from "../../../common/utils/string-utils";

/**
 * AuthCommand - Handles the creation of the authentication module
 */
export class AuthCommand extends BaseCommand {
  async execute(options: AuthOptions): Promise<void> {
    // Check if we're in a NestJS project
    if (!this.isNestJSProject()) {
      this.logError(
        "Error: This command should be executed inside a NestJS project."
      );
      return;
    }

    // Get authentication options from options or prompt
    let useJwt = options.jwt || false;

    if (options.jwt === undefined) {
      const answers = await inquirer.prompt([
        {
          type: "confirm",
          name: "jwt",
          message: "Do you want to use JWT authentication?",
          default: true,
        },
      ]);

      useJwt = answers.jwt;
    }

    // Create auth directory
    const authDir = path.join(process.cwd(), "src", "auth");

    // Confirm overwrite if directory exists
    if (!(await this.confirmOverwrite(authDir))) {
      return;
    }

    // Create module structure
    FileUtils.createDirectory(authDir);
    FileUtils.createDirectory(path.join(authDir, "dto"));
    FileUtils.createDirectory(path.join(authDir, "strategies"));
    FileUtils.createDirectory(path.join(authDir, "guards"));

    // Create basic files
    this.createAuthFiles(authDir, useJwt);

    // Update app.module.ts to include the auth module
    this.updateAppModule(useJwt);

    // Create user module if it doesn't exist

    // Add necessary dependencies to package.json
    this.updatePackageJson(useJwt);

    this.logSuccess("Authentication module created successfully!");
    this.logInfo(
      "\nTo complete setup:\n1. Run npm install to install new dependencies\n2. Add your JWT_SECRET to your .env file"
    );
  }

  private createAuthFiles(authDir: string, useJwt: boolean): void {
    // Create auth.module.ts
    this.createAuthModule(authDir, useJwt);

    // Create auth.controller.ts
    this.createAuthController(authDir, useJwt);

    // Create auth.service.ts
    this.createAuthService(authDir, useJwt);

    // Create DTOs
    this.createAuthDtos(authDir);

    if (useJwt) {
      // Create JWT strategy
      this.createJwtStrategy(authDir);

      // Create JWT guard
      this.createJwtGuard(authDir);
    }
  }

  private createAuthModule(authDir: string, useJwt: boolean): void {
    const jwtImports = useJwt
      ? `
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';`
      : "";

    const jwtProviders = useJwt
      ? `
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),`
      : "";

    const strategyProvider = useJwt
      ? `
    JwtStrategy,`
      : "";

    const strategyImport = useJwt
      ? `
import { JwtStrategy } from './strategies/jwt.strategy';`
      : "";

    FileUtils.createFile(
      path.join(authDir, "auth.module.ts"),
      `import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';${jwtImports}
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserModule } from '../user/user.module';${strategyImport}

@Module({
  imports: [
    UserModule,
    PassportModule,${jwtProviders}
  ],
  controllers: [AuthController],
  providers: [
    AuthService,${strategyProvider}
  ],
  exports: [AuthService],
})
export class AuthModule {}
`
    );
  }

  private createAuthController(authDir: string, useJwt: boolean): void {
    FileUtils.createDirectory(path.join(authDir, "controllers"));
    FileUtils.createDirectory(path.join(authDir, "services"));
    FileUtils.createFile(
      path.join(authDir, "controllers", "auth.controller.ts"),
      `import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
${
  useJwt
    ? "import { JwtAuthGuard } from '../guards/jwt-auth.guard';\nimport { CurrentUser } from '../../common/decorators/current-user.decorator';"
    : ""
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
${
  useJwt
    ? `
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@CurrentUser() user) {
    return user;
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }`
    : ""
}
}
`
    );
  }

  private createAuthService(authDir: string, useJwt: boolean): void {
    FileUtils.createFile(
      path.join(authDir, "services", "auth.service.ts"),
      `import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserService } from '../../user/services/users.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import * as bcrypt from 'bcrypt';
${useJwt ? "import { JwtService } from '@nestjs/jwt';" : ""}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    ${useJwt ? "private readonly jwtService: JwtService," : ""}
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.userService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Remove password from response
    const { password, ...result } = user;

    ${useJwt ? "return this.generateTokens(user);" : "return result;"}
  }

  async login(loginDto: LoginDto) {
    // Find user
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    ${
      useJwt
        ? "return this.generateTokens(user);"
        : `
    // Remove password from response
    const { password, ...result } = user;
    return result;`
    }
  }
${
  useJwt
    ? `
  async validateUser(payload: any) {
    return this.userService.findById(payload.sub);
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      });

      // Get user
      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Generate new tokens
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id };
    
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        expiresIn: '7d',
      }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }`
    : ""
}
}
`
    );
  }

  private createAuthDtos(authDir: string): void {
    // Register DTO
    FileUtils.createFile(
      path.join(authDir, "dto", "register.dto.ts"),
      `import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'User email',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
`
    );

    // Login DTO
    FileUtils.createFile(
      path.join(authDir, "dto", "login.dto.ts"),
      `import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
`
    );
  }

  private createJwtStrategy(authDir: string): void {
    // Create strategies directory if not exists
    FileUtils.createDirectory(path.join(authDir, "strategies"));

    // Create JWT Strategy
    FileUtils.createFile(
      path.join(authDir, "strategies", "jwt.strategy.ts"),
      `import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUser(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    
    // Remove password from user object
    const { password, ...result } = user;
    return result;
  }
}
`
    );
  }

  private createJwtGuard(authDir: string): void {
    // Create guards directory if not exists
    FileUtils.createDirectory(path.join(authDir, "guards"));

    // Create JWT Guard
    FileUtils.createFile(
      path.join(authDir, "guards", "jwt-auth.guard.ts"),
      `import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
`
    );

    // Create current-user decorator
    const decoratorsDir = path.join(
      process.cwd(),
      "src",
      "common",
      "decorators"
    );
    FileUtils.createDirectory(decoratorsDir);

    FileUtils.createFile(
      path.join(decoratorsDir, "current-user.decorator.ts"),
      `import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
`
    );
  }
  private updateAppModule(useJwt: boolean): void {
    const appModulePath = path.join(process.cwd(), "src", "app.module.ts");

    if (!FileUtils.exists(appModulePath)) {
      this.logWarning(
        "Warning: app.module.ts not found. Could not update app module."
      );
      return;
    }

    try {
      FileUtils.updateFile(appModulePath, (content) => {
        // Check if the module is already imported
        if (content.includes("AuthModule")) {
          this.logWarning("AuthModule is already imported in AppModule.");
          return content;
        }

        let updatedContent = content;

        // Add import statement
        const importStatement = `import { AuthModule } from './auth/auth.module';`;

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
            `imports: [\n    AuthModule,`
          );
        } else if (updatedContent.includes("imports: [],")) {
          updatedContent = updatedContent.replace(
            "imports: [],",
            `imports: [AuthModule],`
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

  private updatePackageJson(useJwt: boolean): void {
    const packageJsonPath = path.join(process.cwd(), "package.json");

    if (!FileUtils.exists(packageJsonPath)) {
      this.logWarning(
        "Warning: package.json not found. Could not update dependencies."
      );
      return;
    }

    try {
      const packageJson = require(packageJsonPath);

      // Add dependencies
      if (!packageJson.dependencies) {
        packageJson.dependencies = {};
      }

      packageJson.dependencies["@nestjs/passport"] = "^10.0.0";
      packageJson.dependencies["passport"] = "^0.6.0";
      packageJson.dependencies["bcrypt"] = "^5.1.0";

      if (useJwt) {
        packageJson.dependencies["@nestjs/jwt"] = "^10.0.0";
        packageJson.dependencies["passport-jwt"] = "^4.0.1";
      }

      // Add dev dependencies
      if (!packageJson.devDependencies) {
        packageJson.devDependencies = {};
      }

      packageJson.devDependencies["@types/passport-jwt"] = "^3.0.8";
      packageJson.devDependencies["@types/bcrypt"] = "^5.0.0";

      // Write back to package.json
      FileUtils.createFile(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2)
      );
    } catch (error: any) {
      this.logError(`Error updating package.json: ${error.message}`);
    }
  }

  private createUserModule(): void {
    // Create User module (required for auth) - using singular naming
    const userDir = path.join(process.cwd(), "src", "user");
    const usersDir = path.join(process.cwd(), "src", "users");

    if (FileUtils.exists(userDir) || FileUtils.exists(usersDir)) {
      this.logWarning("User module already exists. Skipping creation.");
      return;
    }

    FileUtils.createDirectory(userDir);
    FileUtils.createDirectory(path.join(userDir, "entities"));
    FileUtils.createDirectory(path.join(userDir, "controllers"));
    FileUtils.createDirectory(path.join(userDir, "services"));

    // Create user entity
    FileUtils.createFile(
      path.join(userDir, "entities", "user.entity.ts"),
      `export class User {
  id: string;
  email: string;
  name: string;
  password: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}
`
    );

    // Create user.module.ts
    FileUtils.createFile(
      path.join(userDir, "user.module.ts"),
      `import { Module } from '@nestjs/common';
import { UserService } from './services/users.service';

@Module({
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
`
    );

    // Create user.service.ts
    FileUtils.createFile(
      path.join(userDir, "services", "user.service.ts"),
      `import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  private readonly users: User[] = [];

  async create(userData: any): Promise<User> {
    const user: User = {
      id: Date.now().toString(),
      email: userData.email,
      name: userData.name,
      password: userData.password,
      roles: ['user'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.users.push(user);
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }
}
`
    );

    // Update app.module.ts to include the user module
    const appModulePath = path.join(process.cwd(), "src", "app.module.ts");

    if (!FileUtils.exists(appModulePath)) {
      this.logWarning(
        "Warning: app.module.ts not found. Could not update app module for UserModule."
      );
      return;
    }

    try {
      FileUtils.updateFile(appModulePath, (content) => {
        // Check if the module is already imported
        if (content.includes("UserModule")) {
          this.logWarning("UserModule is already imported in AppModule.");
          return content;
        }

        let updatedContent = content;

        // Add import statement
        const importStatement = `import { UserModule } from './user/user.module';`;

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
            `imports: [\n    UserModule,`
          );
        } else if (updatedContent.includes("imports: [],")) {
          updatedContent = updatedContent.replace(
            "imports: [],",
            `imports: [UserModule],`
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
