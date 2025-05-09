import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  name: process.env.APP_NAME,
  description: process.env.APP_DESCRIPTION,
  version: process.env.APP_VERSION,
}));

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
}));

export const authConfig = registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION || '1h',
  jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
}));

export const securityConfig = registerAs('security', () => ({
  corsEnabled: process.env.CORS_ENABLED === 'true',
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
}));

export const swaggerConfig = registerAs('swagger', () => ({
  enabled: process.env.SWAGGER_ENABLED === 'true',
  title: process.env.SWAGGER_TITLE,
  description: process.env.SWAGGER_DESCRIPTION,
  version: process.env.SWAGGER_VERSION,
  path: process.env.SWAGGER_PATH || 'docs',
}));
