export interface ProjectOptions {
  name?: string;
}

export interface ModuleOptions {
  name?: string;
  crud?: boolean;
}

export interface AuthOptions {
  jwt?: boolean;
}

export interface DatabaseOptions {
  type?: 'prisma' | 'typeorm' | 'mongoose';
}

export interface AllOptions {
  name?: string;
  auth?: boolean;
  modules?: string[];
  architecture?: string;
}
