import { Controller, Get, Post, Body, Query, UseGuards, Request, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { OAuthService } from '../services/oauth.service';
import { AuthService } from '../../auth/services/auth.service';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('OAuth 2.0 / OIDC')
@Controller('oauth')
export class OAuthController {
  constructor(
    private readonly oauthService: OAuthService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Get('authorize')
  @ApiOperation({ summary: 'OAuth 2.0 authorization endpoint' })
  @ApiQuery({ name: 'response_type', description: 'Response type (code)' })
  @ApiQuery({ name: 'client_id', description: 'Client ID' })
  @ApiQuery({ name: 'redirect_uri', description: 'Redirect URI' })
  @ApiQuery({ name: 'scope', description: 'Requested scope' })
  @ApiQuery({ name: 'state', description: 'State parameter' })
  @ApiResponse({ status: 200, description: 'Authorization page' })
  async authorize(
    @Query('response_type') responseType: string,
    @Query('client_id') clientId: string,
    @Query('redirect_uri') redirectUri: string,
    @Query('scope') scope: string,
    @Query('state') state: string,
  ) {
    // TODO: Implement OAuth 2.0 authorization endpoint
    return {
      message: 'OAuth 2.0 authorization endpoint',
      responseType,
      clientId,
      redirectUri,
      scope,
      state,
    };
  }

  @Public()
  @Post('token')
  @ApiOperation({ summary: 'OAuth 2.0 token endpoint' })
  @ApiResponse({ status: 200, description: 'Token issued' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async token(
    @Body('grant_type') grantType: string,
    @Body('code') code: string,
    @Body('redirect_uri') redirectUri: string,
    @Body('client_id') clientId: string,
    @Body('client_secret') clientSecret: string,
  ) {
    // TODO: Implement OAuth 2.0 token endpoint
    return {
      message: 'OAuth 2.0 token endpoint',
      grantType,
      code,
      redirectUri,
      clientId,
    };
  }

  @Get('userinfo')
  @ApiOperation({ summary: 'OIDC UserInfo endpoint' })
  @ApiResponse({ status: 200, description: 'User information' })
  async userinfo(@CurrentUser() user: any) {
    const profile = await this.authService.getUserProfile(user.id);
    return {
      sub: user.id,
      email: profile.email,
      email_verified: profile.emailVerified,
      name: `${profile.firstName} ${profile.lastName}`,
      given_name: profile.firstName,
      family_name: profile.lastName,
      picture: profile.profilePhoto,
    };
  }

  @Get('.well-known/openid_configuration')
  @Public()
  @ApiOperation({ summary: 'OIDC Discovery endpoint' })
  @ApiResponse({ status: 200, description: 'OpenID Connect configuration' })
  async openidConfiguration() {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001/api/v1';
    
    return {
      issuer: baseUrl,
      authorization_endpoint: `${baseUrl}/oauth/authorize`,
      token_endpoint: `${baseUrl}/oauth/token`,
      userinfo_endpoint: `${baseUrl}/oauth/userinfo`,
      jwks_uri: `${baseUrl}/oauth/jwks`,
      response_types_supported: ['code', 'id_token', 'token'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      scopes_supported: ['openid', 'profile', 'email'],
      claims_supported: ['sub', 'email', 'email_verified', 'name', 'given_name', 'family_name', 'picture'],
    };
  }

  @Get('jwks')
  @Public()
  @ApiOperation({ summary: 'JWKS endpoint' })
  @ApiResponse({ status: 200, description: 'JSON Web Key Set' })
  async jwks() {
    // TODO: Implement JWKS endpoint
    return {
      keys: [
        {
          kty: 'RSA',
          kid: '1',
          use: 'sig',
          alg: 'RS256',
          n: 'your-public-key-modulus',
          e: 'AQAB',
        },
      ],
    };
  }
}