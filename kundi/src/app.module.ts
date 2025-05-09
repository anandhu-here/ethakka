
import { DepartmentModule } from './departments/departments.module';
import { OrganizationModule } from './organizations/organizations.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    DepartmentModule,
    OrganizationModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
