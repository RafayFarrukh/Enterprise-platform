import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class MfaService {
  generateSecret(): string {
    return speakeasy.generateSecret({
      name: 'Enterprise Platform',
      issuer: 'Enterprise Platform',
      length: 32,
    }).base32;
  }

  generateQRCode(secret: string, email: string): Promise<string> {
    const otpauthUrl = speakeasy.otpauthURL({
      secret,
      label: email,
      issuer: 'Enterprise Platform',
      algorithm: 'sha1',
      digits: 6,
      period: 30,
    });

    return QRCode.toDataURL(otpauthUrl);
  }

  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps (60 seconds) of tolerance
    });
  }

  generateToken(secret: string): string {
    return speakeasy.totp({
      secret,
      encoding: 'base32',
    });
  }

  generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(this.generateRandomCode());
    }
    return codes;
  }

  private generateRandomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
