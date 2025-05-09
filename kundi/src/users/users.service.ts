import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private users = [];

  create(createUserDto: CreateUserDto) {
    const user = {
      id: Date.now().toString(),
      ...createUserDto,
    };
    
    this.users.push(user);
    return user;
  }

  findAll() {
    return this.users;
  }

  findOne(id: string) {
    const user = this.users.find(item => item.id === id);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    const userIndex = this.users.findIndex(item => item.id === id);
    
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updateUserDto,
    };
    
    return this.users[userIndex];
  }

  remove(id: string) {
    const userIndex = this.users.findIndex(item => item.id === id);
    
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    this.users.splice(userIndex, 1);
  }
}
