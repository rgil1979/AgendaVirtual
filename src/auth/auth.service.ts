import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<{ id: string; username: string }> {
    const user = await this.prisma.usuario.findUnique({ where: { username } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) throw new UnauthorizedException('Credenciales inválidas');

    return { id: user.id, username: user.username };
  }

  login(user: { id: string; username: string }): { access_token: string } {
    return { access_token: this.jwt.sign({ sub: user.id, username: user.username }) };
  }
}
