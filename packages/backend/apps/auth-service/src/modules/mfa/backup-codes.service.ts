import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class BackupCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async generateBackupCodes(userId: string, accountType: string): Promise<string[]> {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(this.generateBackupCode());
    }

    // Store backup codes in database
    if (accountType === 'user') {
      await this.prisma.mfaBackupCode.createMany({
        data: codes.map(code => ({
          userId,
          code,
        })),
      });
    } else {
      await this.prisma.agencyMfaBackupCode.createMany({
        data: codes.map(code => ({
          agencyId: userId,
          code,
        })),
      });
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