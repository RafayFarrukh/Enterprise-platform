import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { JwtService } from './jwt.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async handleOAuthCallback(profile: any, provider: string) {
    const { id, emails, name, photos } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      throw new Error('No email found in OAuth profile');
    }

    // Check if social account exists
    let socialAccount = await this.prisma.socialAccount.findFirst({
      where: {
        provider,
        providerId: id,
      },
      include: {
        user: true,
        agency: true,
      },
    });

    let user;
    let userType = 'user';

    if (socialAccount) {
      // Existing social account
      user = socialAccount.user || socialAccount.agency;
      userType = socialAccount.user ? 'user' : 'agency';
    } else {
      // Check if user exists with this email
      let existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        user = existingUser;
        userType = 'user';
      } else {
        // Check if agency exists with this email
        existingUser = await this.prisma.agency.findUnique({
          where: { email },
        });

        if (existingUser) {
          user = existingUser;
          userType = 'agency';
        } else {
          // Create new user
          const userId = await this.generateUserId('user');
          user = await this.prisma.user.create({
            data: {
              userId,
              email,
              firstName: name?.givenName || 'User',
              lastName: name?.familyName || 'Name',
              profilePhoto: photos?.[0]?.value,
              isEmailVerified: true,
              passwordHash: await bcrypt.hash(Math.random().toString(36), 12), // Random password
            },
          });
          userType = 'user';
        }
      }

      // Create social account
      await this.prisma.socialAccount.create({
        data: {
          userId: user.id,
          userType,
          provider,
          providerId: id,
          accessToken: profile.accessToken,
          refreshToken: profile.refreshToken,
        },
      });
    }

    // Generate tokens
    const accessToken = this.jwtService.generateAccessToken({
      sub: user.id,
      email: user.email,
      userType,
      roles: [],
    });

    const refreshToken = this.jwtService.generateRefreshToken({
      sub: user.id,
      email: user.email,
      userType,
      roles: [],
    });

    // Create session
    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        userType,
        sessionToken: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Log activity
    await this.prisma.activityLog.create({
      data: {
        userId: user.id,
        userType,
        action: 'oauth_login',
        details: { provider },
      },
    });

    return {
      accessToken,
      refreshToken,
      userType,
      user: this.sanitizeUser(user),
    };
  }

  private async generateUserId(userType: string): Promise<string> {
    const prefix = userType === 'user' ? 'U' : 'A';
    const count = await this.prisma.user.count();
    return `${prefix}${String(count + 1).padStart(6, '0')}`;
  }

  private sanitizeUser(user: any) {
    const { passwordHash, mfaSecret, ...sanitized } = user;
    return sanitized;
  }
}
