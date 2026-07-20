import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Req, UseGuards } from '@nestjs/common';

import { AuthGuard, AuthUser, requiredString } from './auth';
import { PrismaService } from './prisma.service';

type RecordBody = {
  date?: unknown;
  startTime?: unknown;
  endTime?: unknown;
  duration?: unknown;
  posture?: unknown;
  mood?: unknown;
  sensations?: unknown;
  note?: unknown;
  tags?: unknown;
};

const parseDate = (value: unknown, field: string) => {
  const date = new Date(requiredString(value));
  if (Number.isNaN(date.getTime())) throw new BadRequestException(`${field} 不正确`);
  return date;
};

const parseStringArray = (value: unknown, field: string) => {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) throw new BadRequestException(`${field} 不正确`);
  return value;
};

const toRecordResponse = (record: {
  id: string;
  date: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  posture: string;
  mood: string;
  sensations: string[];
  note: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}) => ({
  ...record,
  startTime: record.startTime.toISOString(),
  endTime: record.endTime.toISOString(),
  createdAt: record.createdAt.toISOString(),
  updatedAt: record.updatedAt.toISOString(),
});

@Controller('records')
@UseGuards(AuthGuard)
export class RecordsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Req() request: { user: AuthUser }) {
    const records = await this.prisma.record.findMany({
      where: { userId: request.user.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return { records: records.map(toRecordResponse) };
  }

  @Post()
  async create(@Req() request: { user: AuthUser }, @Body() body: RecordBody) {
    const duration = Number(body.duration);
    const posture = requiredString(body.posture);
    const mood = requiredString(body.mood);
    if (!Number.isInteger(duration) || duration <= 0) throw new BadRequestException('duration 不正确');
    if (!posture) throw new BadRequestException('posture 不能为空');
    if (!mood) throw new BadRequestException('mood 不能为空');

    const record = await this.prisma.record.create({
      data: {
        userId: request.user.id,
        date: requiredString(body.date),
        startTime: parseDate(body.startTime, 'startTime'),
        endTime: parseDate(body.endTime, 'endTime'),
        duration,
        posture,
        mood,
        sensations: parseStringArray(body.sensations, 'sensations'),
        note: requiredString(body.note),
        tags: parseStringArray(body.tags, 'tags'),
      },
    });
    return { record: toRecordResponse(record) };
  }

  @Put(':id')
  async update(@Req() request: { user: AuthUser }, @Param('id') id: string, @Body() body: RecordBody) {
    const existing = await this.prisma.record.findFirst({ where: { id, userId: request.user.id, deletedAt: null } });
    if (!existing) throw new NotFoundException('记录不存在');

    const duration = Number(body.duration);
    const posture = requiredString(body.posture);
    const mood = requiredString(body.mood);
    if (!Number.isInteger(duration) || duration <= 0) throw new BadRequestException('duration 不正确');
    if (!posture) throw new BadRequestException('posture 不能为空');
    if (!mood) throw new BadRequestException('mood 不能为空');

    const record = await this.prisma.record.update({
      where: { id },
      data: {
        date: requiredString(body.date),
        startTime: parseDate(body.startTime, 'startTime'),
        endTime: parseDate(body.endTime, 'endTime'),
        duration,
        posture,
        mood,
        sensations: parseStringArray(body.sensations, 'sensations'),
        note: requiredString(body.note),
        tags: parseStringArray(body.tags, 'tags'),
      },
    });
    return { record: toRecordResponse(record) };
  }

  @Delete(':id')
  async remove(@Req() request: { user: AuthUser }, @Param('id') id: string) {
    const existing = await this.prisma.record.findFirst({ where: { id, userId: request.user.id, deletedAt: null }, select: { id: true } });
    if (!existing) throw new NotFoundException('记录不存在');
    await this.prisma.record.update({ where: { id }, data: { deletedAt: new Date() } });
    return { ok: true };
  }
}
