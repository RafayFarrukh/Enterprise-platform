import { Controller, Post, Body, Get, Delete, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { MfaService } from '../services/mfa.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { RegisterDto, AgencyRegisterDto } from '../dto/register.dto';
import { LoginDto, RefreshTokenDto, LogoutDto } from '../dto/login.dto';
import { EnableMfaDto, VerifyMfaDto, DisableMfaDto, GenerateBackupCodesDto } from '../dto/mfa.dto';
import { ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto, VerifyEmailDto, ResendVerificationDto } from '../dto/password.dto';
import { AuthResponseDto, UserProfileDto, AgencyProfileDto, MfaSetupResponseDto } from '../dto/auth-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mfaService: MfaService,
  ) {}

  @Public()
  @Post('register/user')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async registerUser(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.registerUser(registerDto);
  }

  @Public()
  @Post('register/agency')
  @ApiOperation({ summary: 'Register a new agency' })
  @ApiResponse({ status: 201, description: 'Agency registered successfully', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'Agency already exists' })
  async registerAgency(@Body() registerDto: AgencyRegisterDto): Promise<AuthResponseDto> {
    return this.authService.registerAgency(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user or agency' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    if (loginDto.accountType === 'agency') {
      return this.authService.loginAgency(loginDto);
    }
    return this.authService.loginUser(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user or agency' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@CurrentUser() user: any, @Body() logoutDto: LogoutDto): Promise<{ message: string }> {
    const logoutType = logoutDto.logoutType || 'current';
    await this.authService.logout(user.id, user.accountType, logoutDto.refreshToken, logoutType);
    return { message: 'Logout successful' };
  }

  @Get('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active sessions' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  async getSessions(@CurrentUser() user: any): Promise<any> {
    return this.authService.getSessions(user.id, user.accountType);
  }

  @Delete('sessions/:sessionId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully' })
  async revokeSession(@CurrentUser() user: any, @Param('sessionId') sessionId: string): Promise<{ message: string }> {
    await this.authService.revokeSession(user.id, user.accountType, sessionId);
    return { message: 'Session revoked successfully' };
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully', type: UserProfileDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserProfile(@CurrentUser() user: any): Promise<UserProfileDto> {
    return this.authService.getUserProfile(user.id);
  }

  @Get('profile/agency')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get agency profile' })
  @ApiResponse({ status: 200, description: 'Agency profile retrieved successfully', type: AgencyProfileDto })
  @ApiResponse({ status: 404, description: 'Agency not found' })
  async getAgencyProfile(@CurrentUser() user: any): Promise<AgencyProfileDto> {
    return this.authService.getAgencyProfile(user.id);
  }

  // MFA Endpoints
  @Post('mfa/enable')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable MFA for user' })
  @ApiResponse({ status: 200, description: 'MFA setup initiated', type: MfaSetupResponseDto })
  async enableMfa(@CurrentUser() user: any, @Body() enableMfaDto: EnableMfaDto): Promise<MfaSetupResponseDto> {
    const { secret, qrCodeUrl } = await this.mfaService.generateSecret(user.id, user.accountType);
    const backupCodes = await this.mfaService.generateNewBackupCodes(user.id, user.accountType);
    
    return {
      qrCodeUrl,
      secret,
      backupCodes,
    };
  }

  @Post('mfa/verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify MFA setup' })
  @ApiResponse({ status: 200, description: 'MFA enabled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid MFA code' })
  async verifyMfa(@CurrentUser() user: any, @Body() verifyMfaDto: VerifyMfaDto): Promise<{ message: string }> {
    const success = await this.mfaService.enableMfa(user.id, user.accountType, user.mfaSecret, verifyMfaDto.code);
    if (!success) {
      throw new Error('Invalid MFA code');
    }
    return { message: 'MFA enabled successfully' };
  }

  @Post('mfa/disable')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable MFA for user' })
  @ApiResponse({ status: 200, description: 'MFA disabled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid password' })
  async disableMfa(@CurrentUser() user: any, @Body() disableMfaDto: DisableMfaDto): Promise<{ message: string }> {
    const success = await this.mfaService.disableMfa(user.id, user.accountType, disableMfaDto.password);
    if (!success) {
      throw new Error('Invalid password');
    }
    return { message: 'MFA disabled successfully' };
  }

  @Post('mfa/backup-codes/generate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate new backup codes' })
  @ApiResponse({ status: 200, description: 'New backup codes generated' })
  async generateBackupCodes(@CurrentUser() user: any, @Body() generateBackupCodesDto: GenerateBackupCodesDto): Promise<{ backupCodes: string[] }> {
    const backupCodes = await this.mfaService.generateNewBackupCodes(user.id, user.accountType);
    return { backupCodes };
  }

  @Get('mfa/backup-codes')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get backup codes' })
  @ApiResponse({ status: 200, description: 'Backup codes retrieved' })
  async getBackupCodes(@CurrentUser() user: any): Promise<{ backupCodes: string[] }> {
    const backupCodes = await this.mfaService.getBackupCodes(user.id, user.accountType);
    return { backupCodes };
  }

  // Password Reset Endpoints
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    // TODO: Implement password reset logic
    return { message: 'Password reset email sent' };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    // TODO: Implement password reset logic
    return { message: 'Password reset successfully' };
  }

  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(@CurrentUser() user: any, @Body() changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    return this.authService.changePassword(user.id, user.accountType, changePasswordDto);
  }

  // Email Verification Endpoints
  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    // TODO: Implement email verification logic
    return { message: 'Email verified successfully' };
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  async resendVerification(@Body() resendVerificationDto: ResendVerificationDto): Promise<{ message: string }> {
    // TODO: Implement resend verification logic
    return { message: 'Verification email sent' };
  }
}
