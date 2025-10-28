import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { OAuthService } from '../services/oauth.service';
import { GoogleStrategy } from '../strategies/google.strategy';
import { GithubStrategy } from '../strategies/github.strategy';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('OAuth')
@Controller('auth/oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth Login' })
  @ApiResponse({ status: 302, description: 'Redirect to Google OAuth' })
  async googleAuth(@Request() req) {
    // This will be handled by the Google strategy
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth Callback' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend with tokens' })
  async googleAuthCallback(@Request() req, @Res() res: Response) {
    const result = await this.oauthService.handleOAuthCallback(req.user, 'google');
    
    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const redirectUrl = `${frontendUrl}/auth/callback?access_token=${result.accessToken}&refresh_token=${result.refreshToken}&user_type=${result.userType}`;
    
    res.redirect(redirectUrl);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'GitHub OAuth Login' })
  @ApiResponse({ status: 302, description: 'Redirect to GitHub OAuth' })
  async githubAuth(@Request() req) {
    // This will be handled by the GitHub strategy
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'GitHub OAuth Callback' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend with tokens' })
  async githubAuthCallback(@Request() req, @Res() res: Response) {
    const result = await this.oauthService.handleOAuthCallback(req.user, 'github');
    
    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const redirectUrl = `${frontendUrl}/auth/callback?access_token=${result.accessToken}&refresh_token=${result.refreshToken}&user_type=${result.userType}`;
    
    res.redirect(redirectUrl);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Facebook OAuth Login' })
  @ApiResponse({ status: 302, description: 'Redirect to Facebook OAuth' })
  async facebookAuth(@Request() req) {
    // This will be handled by the Facebook strategy
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Facebook OAuth Callback' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend with tokens' })
  async facebookAuthCallback(@Request() req, @Res() res: Response) {
    const result = await this.oauthService.handleOAuthCallback(req.user, 'facebook');
    
    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const redirectUrl = `${frontendUrl}/auth/callback?access_token=${result.accessToken}&refresh_token=${result.refreshToken}&user_type=${result.userType}`;
    
    res.redirect(redirectUrl);
  }

  @Get('linkedin')
  @UseGuards(AuthGuard('linkedin'))
  @ApiOperation({ summary: 'LinkedIn OAuth Login' })
  @ApiResponse({ status: 302, description: 'Redirect to LinkedIn OAuth' })
  async linkedinAuth(@Request() req) {
    // This will be handled by the LinkedIn strategy
  }

  @Get('linkedin/callback')
  @UseGuards(AuthGuard('linkedin'))
  @ApiOperation({ summary: 'LinkedIn OAuth Callback' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend with tokens' })
  async linkedinAuthCallback(@Request() req, @Res() res: Response) {
    const result = await this.oauthService.handleOAuthCallback(req.user, 'linkedin');
    
    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const redirectUrl = `${frontendUrl}/auth/callback?access_token=${result.accessToken}&refresh_token=${result.refreshToken}&user_type=${result.userType}`;
    
    res.redirect(redirectUrl);
  }
}
