import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../database/prisma.service';

export interface TokenPayload {
  sub: string;
  accountType: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class CustomJwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async generateTokens(userId: string, accountType: string): Promise<TokenPair> {
    const payload: TokenPayload = {
      sub: userId,
      accountType,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    // Store refresh token in database
    await this.storeRefreshToken(userId, accountType, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const payload = this.jwtService.verify(token) as TokenPayload;
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      }) as TokenPayload;

      // Verify token exists in database
      const session = await this.findSessionByRefreshToken(token);
      if (!session) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.userSession.deleteMany({
      where: { refreshToken: token },
    });
    await this.prisma.agencySession.deleteMany({
      where: { refreshToken: token },
    });
  }

  async revokeAllUserTokens(userId: string, accountType: string): Promise<void> {
    if (accountType === 'user') {
      await this.prisma.userSession.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      });
    } else {
      await this.prisma.agencySession.updateMany({
        where: { agencyId: userId, isActive: true },
        data: { isActive: false },
      });
    }
  }

  private async storeRefreshToken(userId: string, accountType: string, refreshToken: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    if (accountType === 'user') {
      await this.prisma.userSession.create({
        data: {
          userId,
          sessionToken: this.generateSessionToken(),
          refreshToken,
          expiresAt,
        },
      });
    } else {
      await this.prisma.agencySession.create({
        data: {
          agencyId: userId,
          sessionToken: this.generateSessionToken(),
          refreshToken,
          expiresAt,
        },
      });
    }
  }

  private async findSessionByRefreshToken(refreshToken: string): Promise<any> {
    const userSession = await this.prisma.userSession.findFirst({
      where: { refreshToken, isActive: true },
    });

    if (userSession) {
      return userSession;
    }

    const agencySession = await this.prisma.agencySession.findFirst({
      where: { refreshToken, isActive: true },
    });

    return agencySession;
  }

  private generateSessionToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
