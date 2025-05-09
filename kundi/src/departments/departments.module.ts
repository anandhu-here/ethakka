import { Module } from '@nestjs/common';
import { DepartmentController } from './departments.controller';
import { DepartmentService } from './departments.service';

@Module({
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
