import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class MfaService {
  constructor(private readonly prisma: PrismaService) {}

  async generateSecret(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
    const secret = speakeasy.generateSecret({
      name: `Enterprise Platform (${userId})`,
      issuer: 'Enterprise Platform',
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCodeUrl,
    };
  }

  async verifyToken(secret: string, token: string): Promise<boolean> {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps (60 seconds) of tolerance
    });
  }

  async setupMfa(userId: string, secret: string, token: string): Promise<boolean> {
    const isValid = this.verifyToken(secret, token);
    
    if (!isValid) {
      return false;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecret: secret,
        mfaEnabled: true,
      },
    });

    return true;
  }

  async disableMfa(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.mfaSecret) {
      return false;
    }

    const isValid = this.verifyToken(user.mfaSecret, token);
    
    if (!isValid) {
      return false;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecret: null,
        mfaEnabled: false,
      },
    });

    return true;
  }

  async verifyMfaToken(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.mfaSecret || !user.mfaEnabled) {
      return false;
    }

    return this.verifyToken(user.mfaSecret, token);
  }
}
