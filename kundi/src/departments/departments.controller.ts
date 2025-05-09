import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DepartmentService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@ApiTags('departments')
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'The department has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, description: 'Return all departments.' })
  findAll() {
    return this.departmentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a department by id' })
  @ApiResponse({ status: 200, description: 'Return the department.' })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  findOne(@Param('id') id: string) {
    return this.departmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a department' })
  @ApiResponse({ status: 200, description: 'The department has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a department' })
  @ApiResponse({ status: 204, description: 'The department has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.departmentService.remove(id);
  }
}
