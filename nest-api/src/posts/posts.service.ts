import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  private posts = [];

  create(createPostDto: CreatePostDto) {
    const post = {
      id: Date.now().toString(),
      ...createPostDto,
    };
    
    this.posts.push(post);
    return post;
  }

  findAll() {
    return this.posts;
  }

  findOne(id: string) {
    const post = this.posts.find(item => item.id === id);
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    
    return post;
  }

  update(id: string, updatePostDto: UpdatePostDto) {
    const postIndex = this.posts.findIndex(item => item.id === id);
    
    if (postIndex === -1) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    
    this.posts[postIndex] = {
      ...this.posts[postIndex],
      ...updatePostDto,
    };
    
    return this.posts[postIndex];
  }

  remove(id: string) {
    const postIndex = this.posts.findIndex(item => item.id === id);
    
    if (postIndex === -1) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    
    this.posts.splice(postIndex, 1);
  }
}
