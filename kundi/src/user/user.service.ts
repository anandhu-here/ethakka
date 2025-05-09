import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';

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
