import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';
import { CustomJwtService } from '../../auth/services/jwt.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: CustomJwtService,
  ) {}

  async validateGoogleUser(profile: any): Promise<any> {
    const { id, emails, name, photos } = profile;
    const email = emails[0].value;
    const firstName = name.givenName;
    const lastName = name.familyName;
    const profilePhoto = photos[0]?.value;

    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true, socialAccounts: true },
    });

    if (user) {
      // Check if Google account is linked
      const googleAccount = user.socialAccounts.find(account => 
        account.provider === 'GOOGLE' && account.providerId === id
      );

      if (!googleAccount) {
        // Link Google account
        await this.prisma.socialAccount.create({
          data: {
            userId: user.id,
            provider: 'GOOGLE',
            providerId: id,
          },
        });
      }

      return {
        id: user.id,
        email: user.email,
        accountType: 'user',
        profile: user.profile,
      };
    }

    // Create new user
    user = await this.prisma.user.create({
      data: {
        email,
        emailVerified: true,
        profile: {
          create: {
            firstName,
            lastName,
            profilePhoto,
          },
        },
        preferences: {
          create: {
            currency: 'USD',
          },
        },
        socialAccounts: {
          create: {
            provider: 'GOOGLE',
            providerId: id,
          },
        },
      },
      include: { profile: true, socialAccounts: true },
    });

    return {
      id: user.id,
      email: user.email,
      accountType: 'user',
      profile: user.profile,
    };
  }

  async validateGitHubUser(profile: any): Promise<any> {
    const { id, username, emails, displayName, photos } = profile;
    const email = emails[0]?.value;
    const firstName = displayName || username;
    const lastName = '';
    const profilePhoto = photos[0]?.value;

    if (!email) {
      throw new UnauthorizedException('GitHub account must have a public email');
    }

    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true, socialAccounts: true },
    });

    if (user) {
      // Check if GitHub account is linked
      const githubAccount = user.socialAccounts.find(account => 
        account.provider === 'GITHUB' && account.providerId === id.toString()
      );

      if (!githubAccount) {
        // Link GitHub account
        await this.prisma.socialAccount.create({
          data: {
            userId: user.id,
            provider: 'GITHUB',
            providerId: id.toString(),
          },
        });
      }

      return {
        id: user.id,
        email: user.email,
        accountType: 'user',
        profile: user.profile,
      };
    }

    // Create new user
    user = await this.prisma.user.create({
      data: {
        email,
        emailVerified: true,
        profile: {
          create: {
            firstName,
            lastName,
            profilePhoto,
          },
        },
        preferences: {
          create: {
            currency: 'USD',
          },
        },
        socialAccounts: {
          create: {
            provider: 'GITHUB',
            providerId: id.toString(),
          },
        },
      },
      include: { profile: true, socialAccounts: true },
    });

    return {
      id: user.id,
      email: user.email,
      accountType: 'user',
      profile: user.profile,
    };
  }

  async generateTokens(userId: string, accountType: string): Promise<any> {
    return this.jwtService.generateTokens(userId, accountType);
  }

  async createOAuthClient(name: string, description: string, redirectUris: string[], userId?: string, agencyId?: string): Promise<any> {
    const clientId = this.generateClientId();
    const clientSecret = this.generateClientSecret();

    return this.prisma.oAuthClient.create({
      data: {
        clientId,
        clientSecret,
        name,
        description,
        redirectUris: redirectUris,
        grants: ['authorization_code', 'refresh_token'],
        scope: 'read write',
        userId,
        agencyId,
      },
    });
  }

  async validateOAuthClient(clientId: string, clientSecret: string): Promise<any> {
    const client = await this.prisma.oAuthClient.findUnique({
      where: { clientId },
    });

    if (!client || !client.isActive) {
      throw new UnauthorizedException('Invalid client');
    }

    if (client.clientSecret !== clientSecret) {
      throw new UnauthorizedException('Invalid client secret');
    }

    return client;
  }

  async createAuthorizationCode(clientId: string, userId: string, redirectUri: string, scope: string): Promise<string> {
    const code = this.generateAuthorizationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store authorization code (you might want to use Redis for this)
    // For now, we'll just return the code
    console.log(`Authorization code for client ${clientId}: ${code}`);
    console.log(`Expires at: ${expiresAt}`);

    return code;
  }

  async exchangeCodeForTokens(code: string, clientId: string, redirectUri: string): Promise<any> {
    // TODO: Implement authorization code exchange
    // For now, we'll just generate tokens
    console.log(`Exchanging code ${code} for client ${clientId}`);
    
    // This should validate the code and return tokens
    throw new Error('Authorization code exchange not implemented');
  }

  private generateClientId(): string {
    return 'client_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private generateClientSecret(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private generateAuthorizationCode(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}