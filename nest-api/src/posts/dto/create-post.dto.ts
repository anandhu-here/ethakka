import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'The name of the post',
    example: 'Post 1',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
