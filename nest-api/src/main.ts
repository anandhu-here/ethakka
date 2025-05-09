import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Set global prefix from environment variable or default to 'api'
  const apiPrefix = configService.get('API_PREFIX') || 'api';
  app.setGlobalPrefix(apiPrefix);
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // Setup Swagger if enabled
  if (configService.get('SWAGGER_ENABLED') === 'true') {
    const config = new DocumentBuilder()
      .setTitle(configService.get('SWAGGER_TITLE') || 'API Documentation')
      .setDescription(configService.get('SWAGGER_DESCRIPTION') || 'API Documentation')
      .setVersion(configService.get('SWAGGER_VERSION') || '1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(configService.get('SWAGGER_PATH') || 'docs', app, document);
  }
  
  // Enable CORS if enabled
  if (configService.get('CORS_ENABLED') === 'true') {
    const allowedOrigins = configService.get('ALLOWED_ORIGINS')?.split(',') || ['*'];
    app.enableCors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    });
  }
  
  // Start server on the configured port
  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
