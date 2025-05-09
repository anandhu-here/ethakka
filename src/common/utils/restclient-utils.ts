import path from "path";
import { FileUtils } from "./file-utils";
import { StringUtils } from "./string-utils";

/**
 * RestClientUtils - Utilities for generating VS Code REST Client files
 */
export class RestClientUtils {
  /**
   * Generate REST client files for a project with modules
   */
  static generateRestClientFiles(projectPath: string, modules: string[]): void {
    // Create .vscode/rest-client directory
    const restClientDir = path.join(projectPath, ".vscode", "rest-client");
    FileUtils.createDirectory(path.join(projectPath, ".vscode"));
    FileUtils.createDirectory(restClientDir);

    // Create auth.http file (for login/register)
    this.createAuthRestClient(restClientDir);

    // Create module-specific REST client files
    for (const moduleName of modules) {
      this.createModuleRestClient(restClientDir, moduleName);
    }

    // Add a reminder to README.md
    this.addRestClientExtensionReminder(projectPath);
  }

  /**
   * Create auth.http file for authentication endpoints
   */
  static createAuthRestClient(restClientDir: string): void {
    const authFilePath = path.join(restClientDir, "auth.http");

    FileUtils.createFile(
      authFilePath,
      `@baseUrl = http://localhost:3000/api
@contentType = application/json

### Variables
@authToken = {{login.response.body.accessToken}}

### Register a new user
# @name register
POST {{baseUrl}}/auth/register
Content-Type: {{contentType}}

{
  "name": "Test User",
  "email": "user@example.com",
  "password": "password123"
}

### Login to get access token
# @name login
POST {{baseUrl}}/auth/login
Content-Type: {{contentType}}

{
  "email": "user@example.com",
  "password": "password123"
}

### Get current user profile
GET {{baseUrl}}/auth/me
Authorization: Bearer {{authToken}}

### Refresh token
POST {{baseUrl}}/auth/refresh
Content-Type: {{contentType}}

{
  "refreshToken": "your_refresh_token_here"
}
`
    );
  }

  /**
   * Create module-specific REST client file
   */
  static createModuleRestClient(
    restClientDir: string,
    moduleName: string
  ): void {
    const singularName = StringUtils.getSingular(moduleName);
    const className = StringUtils.toPascalCase(singularName);
    const filePath = path.join(restClientDir, `${moduleName}.http`);

    FileUtils.createFile(
      filePath,
      `@baseUrl = http://localhost:3000/api
@contentType = application/json

### Import token from auth requests
@authToken = {{login.response.body.accessToken}}

### Login to refresh token if needed
# @name login
POST {{baseUrl}}/auth/login
Content-Type: {{contentType}}

{
  "email": "user@example.com",
  "password": "password123"
}

### Get all ${moduleName}
GET {{baseUrl}}/${moduleName}
Authorization: Bearer {{authToken}}

### Get a single ${singularName} by ID
GET {{baseUrl}}/${moduleName}/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer {{authToken}}

### Create a new ${singularName}
POST {{baseUrl}}/${moduleName}
Content-Type: {{contentType}}
Authorization: Bearer {{authToken}}

{
  "name": "New ${className}",
  "description": "Description of the new ${singularName}"
  // Add other properties as needed
}

### Update a ${singularName}
PATCH {{baseUrl}}/${moduleName}/123e4567-e89b-12d3-a456-426614174000
Content-Type: {{contentType}}
Authorization: Bearer {{authToken}}

{
  "name": "Updated ${className}",
  "description": "Updated description"
  // Add other properties as needed
}

### Delete a ${singularName}
DELETE {{baseUrl}}/${moduleName}/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer {{authToken}}
`
    );
  }

  /**
   * Add a reminder for the REST Client extension
   */
  static addRestClientExtensionReminder(projectPath: string): void {
    // Add a reminder in README.md about the REST Client extension
    const readmePath = path.join(projectPath, "README.md");

    if (FileUtils.exists(readmePath)) {
      FileUtils.updateFile(readmePath, (content) => {
        if (content.includes("REST Client")) {
          return content;
        }

        return (
          content +
          `

## VS Code REST Client

This project includes REST client files in the \`.vscode/rest-client\` folder that can be used with the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension for VS Code.

- \`auth.http\` - Authentication endpoints (register, login, profile)
- Other files correspond to specific modules with their CRUD endpoints

To use these files:
1. Install the REST Client extension in VS Code
2. Open any of the \`.http\` files
3. Click on "Send Request" above each request

The auth token is automatically stored in a variable and reused across requests.
`
        );
      });
    }
  }
}
