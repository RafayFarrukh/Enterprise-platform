import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';
import { CreateOAuthAccountDto } from '../entities/oauth-client.entity';

@Injectable()
export class OAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async findOrCreateUserFromGoogle(profile: any): Promise<any> {
    const { id, emails, name, photos } = profile;
    const email = emails[0]?.value;

    if (!email) {
      throw new Error('No email found in Google profile');
    }

    // Check if user already exists
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          email,
          name: name?.givenName && name?.familyName 
            ? `${name.givenName} ${name.familyName}`
            : name?.displayName || 'Google User',
          isVerified: true, // Google emails are pre-verified
        },
      });
    }

    // Create or update OAuth account
    await this.prisma.oAuthAccount.upsert({
      where: {
        provider_providerId: {
          provider: 'google',
          providerId: id,
        },
      },
      update: {
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
        expiresAt: profile.expiresAt,
      },
      create: {
        userId: user.id,
        provider: 'google',
        providerId: id,
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
        expiresAt: profile.expiresAt,
      },
    });

    return user;
  }

  async findOAuthAccount(userId: string, provider: string): Promise<any> {
    return this.prisma.oAuthAccount.findFirst({
      where: {
        userId,
        provider,
      },
    });
  }

  async unlinkOAuthAccount(userId: string, provider: string): Promise<void> {
    await this.prisma.oAuthAccount.deleteMany({
      where: {
        userId,
        provider,
      },
    });
  }
}
