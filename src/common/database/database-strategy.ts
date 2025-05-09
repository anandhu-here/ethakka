/**
 * DatabaseStrategy - Interface for database integrations
 */
export interface DatabaseStrategy {
  /**
   * Get the name of the database strategy
   */
  getName(): string;
  
  /**
   * Get the package dependencies required for this strategy
   */
  getDependencies(): Record<string, string>;
  
  /**
   * Get the dev dependencies required for this strategy
   */
  getDevDependencies(): Record<string, string>;
  
  /**
   * Generate the configuration files for this database
   */
  generateConfigFiles(projectPath: string): void;
  
  /**
   * Get templates for model files
   */
  getModelTemplate(entityName: string, fields: Record<string, string>): string;
  
  /**
   * Get templates for repository implementation 
   */
  getRepositoryTemplate(entityName: string): string;
  
  /**
   * Get service implementation with this database strategy
   */
  getServiceImplementation(entityName: string): string;
  
  /**
   * Get the initialization code to be added to the module
   */
  getModuleImports(): string;
  
  /**
   * Get service provider to be added to the module
   */
  getServiceProvider(entityName: string): string;
  
  /**
   * Get configuration for the initialization of the app
   */
  getAppConfig(): string;
  
  /**
   * Get entity fields as formatted for the specific database
   */
  formatEntityFields(fields: Record<string, string>): string;
}
