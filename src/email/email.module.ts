import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { TemplateResolverService } from './template-resolver.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailProcessor } from './email.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
      },
      redis: {
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        maxRetriesPerRequest: 50,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 1000, 10000);
          return delay;
        },
        reconnectOnError: (err) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        },
      },
    }),
    PrismaModule,
  ],
  controllers: [EmailController],
  providers: [EmailService, TemplateResolverService, EmailProcessor],
})
export class EmailModule {}
