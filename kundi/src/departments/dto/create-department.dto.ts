import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'The name of the department',
    example: 'Department 1',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
