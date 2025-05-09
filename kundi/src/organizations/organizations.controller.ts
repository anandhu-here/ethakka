import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrganizationService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({ status: 201, description: 'The organization has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all organizations' })
  @ApiResponse({ status: 200, description: 'Return all organizations.' })
  findAll() {
    return this.organizationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a organization by id' })
  @ApiResponse({ status: 200, description: 'Return the organization.' })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a organization' })
  @ApiResponse({ status: 200, description: 'The organization has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a organization' })
  @ApiResponse({ status: 204, description: 'The organization has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.organizationService.remove(id);
  }
}
