# annu

## Description

[NestJS](https://github.com/nestjs/nest) application scaffolded with Ethakka CLI.

## Installation

```bash
$ npm install
```

## Environment Configuration

The application uses environment variables for configuration. Check the following files:

- `.env` - Default environment variables
- `.env.development` - Development environment variables
- `.env.production` - Production environment variables
- `.env.test` - Test environment variables
- `.env.example` - Example environment variables (for reference only)

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Documentation

Once the application is running, you can access the Swagger API documentation at:

`http://localhost:3000/docs`
