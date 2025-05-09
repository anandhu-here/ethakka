import { ProjectOptions, ModuleOptions, AuthOptions } from '../common/interfaces/command-options';
import { DatabaseOptions } from '../common/interfaces/database-options';

/**
 * Base class for all architectures
 */
export abstract class BaseArchitecture {
  /**
   * Get the name of the architecture
   */
  abstract getName(): string;

  /**
   * Get the description of the architecture
   */
  abstract getDescription(): string;

  /**
   * Create a new project
   */
  abstract createProject(options: ProjectOptions): Promise<void>;

  /**
   * Create a new module
   */
  abstract createModule(options: ModuleOptions): Promise<void>;

  /**
   * Add authentication
   */
  abstract addAuthentication(options: AuthOptions): Promise<void>;

  /**
   * Add database integration
   */
  abstract addDatabase(options: DatabaseOptions): Promise<void>;

  /**
   * Create a complete project with all components
   */
  abstract createAll(options: any): Promise<void>;
}
