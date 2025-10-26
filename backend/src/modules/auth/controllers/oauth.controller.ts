import {
  Controller,
  Get,
  UseGuards,
  Request,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { OAuthService } from '../services/oauth.service';
import { Public } from '../decorators/public.decorator';

@ApiTags('OAuth')
@Controller('auth/oauth')
export class OAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly oauthService: OAuthService,
  ) {}

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirect to Google OAuth' })
  async googleAuth() {
    // This endpoint initiates the Google OAuth flow
    // The actual implementation is handled by the GoogleStrategy
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'OAuth login successful' })
  @ApiResponse({ status: 401, description: 'OAuth login failed' })
  async googleAuthCallback(@Request() req, @Res() res: Response) {
    try {
      const googleUser = req.user;
      
      // Find or create user from Google profile
      const user = await this.oauthService.findOrCreateUserFromGoogle(googleUser);
      
      // Generate JWT tokens
      const payload = {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        mfaEnabled: user.mfaEnabled,
      };
      
      const { accessToken, refreshToken } = await this.authService['jwtService'].generateTokenPair(payload);
      
      // Create session
      await this.authService['createSession']({
        userId: user.id,
        refreshToken,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection?.remoteAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      // Redirect to frontend with tokens
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const redirectUrl = `${frontendUrl}/auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('OAuth login failed')}`);
    }
  }

  @Public()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Initiate GitHub OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirect to GitHub OAuth' })
  async githubAuth() {
    // This endpoint initiates the GitHub OAuth flow
    // The actual implementation is handled by the GithubStrategy
  }

  @Public()
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiResponse({ status: 200, description: 'OAuth login successful' })
  @ApiResponse({ status: 401, description: 'OAuth login failed' })
  async githubAuthCallback(@Request() req, @Res() res: Response) {
    try {
      const githubUser = req.user;
      
      // Find or create user from GitHub profile
      const user = await this.oauthService.findOrCreateUserFromGoogle(githubUser); // Reusing the same method
      
      // Generate JWT tokens
      const payload = {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        mfaEnabled: user.mfaEnabled,
      };
      
      const { accessToken, refreshToken } = await this.authService['jwtService'].generateTokenPair(payload);
      
      // Create session
      await this.authService['createSession']({
        userId: user.id,
        refreshToken,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection?.remoteAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      // Redirect to frontend with tokens
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const redirectUrl = `${frontendUrl}/auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('OAuth login failed')}`);
    }
  }
}
