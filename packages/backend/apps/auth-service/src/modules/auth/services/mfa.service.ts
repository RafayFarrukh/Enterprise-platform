import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';
import { SecurityService } from './security.service';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class MfaService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly securityService: SecurityService,
  ) {}

  async generateSecret(userId: string, accountType: string): Promise<{ secret: string; qrCodeUrl: string }> {
    const secret = speakeasy.generateSecret({
      name: `${this.configService.get<string>('mfa.issuer')}:${userId}`,
      issuer: this.configService.get<string>('mfa.issuer'),
      length: 32,
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCodeUrl,
    };
  }

  async verifyTotp(secret: string, token: string): Promise<boolean> {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps (60 seconds) of tolerance
      algorithm: this.configService.get<string>('mfa.algorithm') as any,
      digits: this.configService.get<number>('mfa.digits'),
      step: this.configService.get<number>('mfa.period'),
    });
  }

  async enableMfa(userId: string, accountType: string, secret: string, token: string): Promise<boolean> {
    // Verify the token first
    const isValid = await this.verifyTotp(secret, token);
    if (!isValid) {
      return false;
    }

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Update user/agency with MFA secret
    if (accountType === 'user') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { mfaEnabled: true, mfaSecret: secret },
      });

      // Store backup codes
      await this.prisma.mfaBackupCode.createMany({
        data: backupCodes.map(code => ({
          userId,
          code,
        })),
      });
    } else {
      await this.prisma.agency.update({
        where: { id: userId },
        data: { mfaEnabled: true, mfaSecret: secret },
      });

      // Store backup codes
      await this.prisma.agencyMfaBackupCode.createMany({
        data: backupCodes.map(code => ({
          agencyId: userId,
          code,
        })),
      });
    }

    return true;
  }

  async disableMfa(userId: string, accountType: string, password: string): Promise<boolean> {
    // Verify password first
    let user;
    if (accountType === 'user') {
      user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
    } else {
      user = await this.prisma.agency.findUnique({
        where: { id: userId },
      });
    }

    if (!user || !user.passwordHash) {
      return false;
    }

    // Verify password
    const isValidPassword = await this.securityService.verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return false;
    }

    // Disable MFA
    if (accountType === 'user') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { mfaEnabled: false, mfaSecret: null },
      });

      // Delete backup codes
      await this.prisma.mfaBackupCode.deleteMany({
        where: { userId },
      });
    } else {
      await this.prisma.agency.update({
        where: { id: userId },
        data: { mfaEnabled: false, mfaSecret: null },
      });

      // Delete backup codes
      await this.prisma.agencyMfaBackupCode.deleteMany({
        where: { agencyId: userId },
      });
    }

    return true;
  }

  async verifyBackupCode(userId: string, accountType: string, code: string): Promise<boolean> {
    let backupCode;
    if (accountType === 'user') {
      backupCode = await this.prisma.mfaBackupCode.findFirst({
        where: { userId, code, isUsed: false },
      });
    } else {
      backupCode = await this.prisma.agencyMfaBackupCode.findFirst({
        where: { agencyId: userId, code, isUsed: false },
      });
    }

    if (!backupCode) {
      return false;
    }

    // Mark backup code as used
    if (accountType === 'user') {
      await this.prisma.mfaBackupCode.update({
        where: { id: backupCode.id },
        data: { isUsed: true, usedAt: new Date() },
      });
    } else {
      await this.prisma.agencyMfaBackupCode.update({
        where: { id: backupCode.id },
        data: { isUsed: true, usedAt: new Date() },
      });
    }

    return true;
  }

  async generateNewBackupCodes(userId: string, accountType: string): Promise<string[]> {
    const backupCodes = this.generateBackupCodes();

    // Delete old backup codes
    if (accountType === 'user') {
      await this.prisma.mfaBackupCode.deleteMany({
        where: { userId },
      });

      // Store new backup codes
      await this.prisma.mfaBackupCode.createMany({
        data: backupCodes.map(code => ({
          userId,
          code,
        })),
      });
    } else {
      await this.prisma.agencyMfaBackupCode.deleteMany({
        where: { agencyId: userId },
      });

      // Store new backup codes
      await this.prisma.agencyMfaBackupCode.createMany({
        data: backupCodes.map(code => ({
          agencyId: userId,
          code,
        })),
      });
    }

    return backupCodes;
  }

  async getBackupCodes(userId: string, accountType: string): Promise<string[]> {
    let backupCodes;
    if (accountType === 'user') {
      backupCodes = await this.prisma.mfaBackupCode.findMany({
        where: { userId, isUsed: false },
        select: { code: true },
      });
    } else {
      backupCodes = await this.prisma.agencyMfaBackupCode.findMany({
        where: { agencyId: userId, isUsed: false },
        select: { code: true },
      });
    }

    return backupCodes.map(bc => bc.code);
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(this.generateBackupCode());
    }
    return codes;
  }

  private generateBackupCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
