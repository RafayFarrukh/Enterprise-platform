import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SecurityService {
  private readonly maxFailedAttempts = 5;
  private readonly lockoutDurationMinutes = 30;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Check and handle account lockout
   */
  async checkAccountLockout(email: string, accountType: 'user' | 'agency'): Promise<void> {
    const lockout = await this.prisma.accountLockout.findUnique({
      where: {
        email_accountType: {
          email,
          accountType,
        },
      },
    });

    if (lockout && lockout.lockedUntil && lockout.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (lockout.lockedUntil.getTime() - Date.now()) / 1000 / 60,
      );
      throw new UnauthorizedException(
        `Account is locked due to too many failed login attempts. Please try again in ${minutesLeft} minutes.`,
      );
    }
  }

  /**
   * Record a failed login attempt
   */
  async recordFailedAttempt(email: string, accountType: 'user' | 'agency'): Promise<void> {
    const lockout = await this.prisma.accountLockout.upsert({
      where: {
        email_accountType: {
          email,
          accountType,
        },
      },
      update: {
        failedAttempts: {
          increment: 1,
        },
        lastAttemptAt: new Date(),
      },
      create: {
        email,
        accountType,
        failedAttempts: 1,
        lastAttemptAt: new Date(),
      },
    });

    if (lockout.failedAttempts >= this.maxFailedAttempts) {
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + this.lockoutDurationMinutes);

      await this.prisma.accountLockout.update({
        where: {
          email_accountType: {
            email,
            accountType,
          },
        },
        data: {
          lockedUntil,
        },
      });
    }
  }

  /**
   * Reset failed login attempts on successful login
   */
  async resetFailedAttempts(email: string, accountType: 'user' | 'agency'): Promise<void> {
    await this.prisma.accountLockout.updateMany({
      where: {
        email,
        accountType,
      },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastAttemptAt: new Date(),
      },
    });
  }

  /**
   * Log activity
   */
  async logActivity(
    userId: string | null,
    agencyId: string | null,
    accountType: string,
    action: string,
    resource?: string,
    resourceId?: string,
    ipAddress?: string,
    userAgent?: string,
    details?: any,
    success: boolean = true,
    errorMessage?: string,
  ): Promise<void> {
    await this.prisma.activityLog.create({
      data: {
        userId,
        agencyId,
        accountType,
        action,
        resource,
        resourceId,
        ipAddress,
        userAgent,
        details: details || {},
        success,
        errorMessage,
      },
    });
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  /**
   * Verify password
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

