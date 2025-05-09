import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto) {
    // Implement your create logic here
    // Example:
    return this.prisma.post.create({
      data: createPostDto,
    });
  }

  async findAll() {
    // Implement your findAll logic here
    // Example:
    return this.prisma.post.findMany();
  }

  async findOne(id: string) {
    // Implement your findOne logic here
    // Example:
    const post = await this.prisma.post.findUnique({
      where: { id },
    });
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    // Implement your update logic here
    // Example:
    try {
      return await this.prisma.post.update({
        where: { id },
        data: updatePostDto,
      });
    } catch (error) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    // Implement your remove logic here
    // Example:
    try {
      return await this.prisma.post.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }
}