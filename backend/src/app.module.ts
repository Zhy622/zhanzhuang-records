import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { PrismaService } from './prisma.service';
import { RecordsController } from './records.controller';

@Module({
  controllers: [AuthController, RecordsController],
  providers: [PrismaService],
})
export class AppModule {}
