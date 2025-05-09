import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  private departments = [];

  create(createDepartmentDto: CreateDepartmentDto) {
    const department = {
      id: Date.now().toString(),
      ...createDepartmentDto,
    };
    
    this.departments.push(department);
    return department;
  }

  findAll() {
    return this.departments;
  }

  findOne(id: string) {
    const department = this.departments.find(item => item.id === id);
    
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    
    return department;
  }

  update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const departmentIndex = this.departments.findIndex(item => item.id === id);
    
    if (departmentIndex === -1) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    
    this.departments[departmentIndex] = {
      ...this.departments[departmentIndex],
      ...updateDepartmentDto,
    };
    
    return this.departments[departmentIndex];
  }

  remove(id: string) {
    const departmentIndex = this.departments.findIndex(item => item.id === id);
    
    if (departmentIndex === -1) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    
    this.departments.splice(departmentIndex, 1);
  }
}
