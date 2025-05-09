import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  private organizations = [];

  create(createOrganizationDto: CreateOrganizationDto) {
    const organization = {
      id: Date.now().toString(),
      ...createOrganizationDto,
    };
    
    this.organizations.push(organization);
    return organization;
  }

  findAll() {
    return this.organizations;
  }

  findOne(id: string) {
    const organization = this.organizations.find(item => item.id === id);
    
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    
    return organization;
  }

  update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    const organizationIndex = this.organizations.findIndex(item => item.id === id);
    
    if (organizationIndex === -1) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    
    this.organizations[organizationIndex] = {
      ...this.organizations[organizationIndex],
      ...updateOrganizationDto,
    };
    
    return this.organizations[organizationIndex];
  }

  remove(id: string) {
    const organizationIndex = this.organizations.findIndex(item => item.id === id);
    
    if (organizationIndex === -1) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    
    this.organizations.splice(organizationIndex, 1);
  }
}
