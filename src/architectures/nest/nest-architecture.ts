import { BaseArchitecture } from '../base-architecture';
import { ProjectCommand } from './commands/project-command';
import { ModuleCommand } from './commands/module-command';
import { AuthCommand } from './commands/auth-command';
import { AllCommand } from './commands/all-command';
import { ProjectOptions, ModuleOptions, AuthOptions } from '../../common/interfaces/command-options';

/**
 * NestJS Architecture implementation
 */
export class NestArchitecture extends BaseArchitecture {
  getName(): string {
    return 'NestJS';
  }

  getDescription(): string {
    return 'A progressive Node.js framework for building efficient and scalable server-side applications.';
  }

  async createProject(options: ProjectOptions): Promise<void> {
    const projectCommand = new ProjectCommand();
    await projectCommand.execute(options);
  }

  async createModule(options: ModuleOptions): Promise<void> {
    const moduleCommand = new ModuleCommand();
    await moduleCommand.execute(options);
  }

  async addAuthentication(options: AuthOptions): Promise<void> {
    const authCommand = new AuthCommand();
    await authCommand.execute(options);
  }

  async createAll(options: any): Promise<void> {
    const allCommand = new AllCommand();
    await allCommand.execute(options);
  }
}
