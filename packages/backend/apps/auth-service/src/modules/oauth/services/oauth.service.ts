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