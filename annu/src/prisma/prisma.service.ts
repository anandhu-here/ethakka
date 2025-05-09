import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper method to clean up data in tests
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    
    // List all tables here in appropriate order considering foreign key constraints
    // Example: await this.user.deleteMany();
    const tablenames: any = await this.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;

    for (const record of tablenames) {
      const tablename = record.tablename;
      if (tablename !== '_prisma_migrations') {
        try {
          await this.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
        } catch (error) {
          console.error(`Error truncating ${tablename}`, error);
        }
      }
    }
  }
}
