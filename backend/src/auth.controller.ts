import { BadRequestException, Body, ConflictException, Controller, Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';

import { AuthGuard, AuthUser, hashPassword, minPasswordLength, requiredString, signToken, validPhone, verifyPassword } from './auth';
import { PrismaService } from './prisma.service';

type AuthBody = {
  phone?: unknown;
  password?: unknown;
  name?: unknown;
};

const publicUser = (user: AuthUser) => ({
  id: user.id,
  phone: user.phone,
  name: user.name,
});

@Controller()
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('auth/register')
  async register(@Body() body: AuthBody) {
    const phone = requiredString(body.phone);
    const password = requiredString(body.password);
    const name = requiredString(body.name) || '修行者 默白';
    if (!validPhone(phone)) throw new BadRequestException('手机号格式不正确');
    if (password.length < minPasswordLength) throw new BadRequestException(`密码至少 ${minPasswordLength} 位`);

    const exists = await this.prisma.user.findUnique({ where: { phone }, select: { id: true } });
    if (exists) throw new ConflictException('该手机号已注册，请直接登录');

    const user = await this.prisma.user.create({
      data: { phone, name, passwordHash: hashPassword(password) },
      select: { id: true, phone: true, name: true },
    });
    return { token: signToken(user), user: publicUser(user) };
  }

  @Post('auth/login')
  async login(@Body() body: AuthBody) {
    const phone = requiredString(body.phone);
    const password = requiredString(body.password);
    if (!validPhone(phone)) throw new BadRequestException('手机号格式不正确');
    if (!password) throw new BadRequestException('请输入密码');

    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw new UnauthorizedException('该手机号尚未注册，请先创建账号');
    if (!verifyPassword(password, user.passwordHash)) throw new UnauthorizedException('手机号或密码错误');

    const authUser = { id: user.id, phone: user.phone, name: user.name };
    return { token: signToken(authUser), user: publicUser(authUser) };
  }

  @Post('auth/logout')
  logout() {
    return { ok: true };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() request: { user: AuthUser }) {
    return { user: publicUser(request.user) };
  }
}
