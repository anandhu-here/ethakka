import { Module } from '@nestjs/common';
import { PostController } from './controllers/posts.controller';
import { PostService } from './services/posts.service';

@Module({
  imports: [],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
