import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';

import { config } from './config';
import { PrismaService } from './prisma.service';

const phoneRe = /^1[3-9]\d{9}$/;
export const minPasswordLength = 8;

export type AuthUser = {
  id: string;
  phone: string;
  name: string;
};

export const validPhone = (phone: unknown) => typeof phone === 'string' && phoneRe.test(phone);
export const requiredString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = (password: string, saved: string) => {
  const [salt, hash] = saved.split(':');
  if (!salt || !hash) return false;
  const actual = Buffer.from(scryptSync(password, salt, 64).toString('hex'), 'hex');
  const expected = Buffer.from(hash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

export const signToken = (user: AuthUser) => {
  return sign({ phone: user.phone, name: user.name }, config.jwtSecret(), {
    algorithm: 'HS256',
    expiresIn: '7d',
    subject: user.id,
    issuer: 'zhan-zhuang-api',
    audience: 'zhan-zhuang-app',
  });
};

export const verifyToken = (token: string): AuthUser | null => {
  try {
    const parsed = verify(token, config.jwtSecret(), {
      algorithms: ['HS256'],
      issuer: 'zhan-zhuang-api',
      audience: 'zhan-zhuang-app',
    });
    return typeof parsed === 'object' && typeof parsed.sub === 'string'
      ? { id: parsed.sub, phone: String(parsed.phone || ''), name: String(parsed.name || '') }
      : null;
  } catch {
    return null;
  }
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = String(request.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const user = verifyToken(token);
    if (!user) throw new UnauthorizedException('请先登录');

    const exists = await this.prisma.user.findUnique({ where: { id: user.id }, select: { id: true, phone: true, name: true } });
    if (!exists) throw new UnauthorizedException('请先登录');
    request.user = exists;
    return true;
  }
}
