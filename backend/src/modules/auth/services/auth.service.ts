import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../database/prisma.service';
import { JwtService } from './jwt.service';
import { MfaService } from './mfa.service';
import { OAuthService } from './oauth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { VerifyOtpDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/verify-otp.dto';
import { UserPayload } from '../entities/user.entity';
import { CreateSessionDto } from '../entities/session.entity';
import { OtpType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mfaService: MfaService,
    private readonly oauthService: OAuthService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string; userId: string }> {
    const { email, password, name } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      this.configService.get<number>('BCRYPT_ROUNDS', 12),
    );

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Generate and send OTP for email verification
    await this.generateAndSendOtp(user.id, OtpType.SIGNUP);

    return {
      message: 'User registered successfully. Please check your email for verification.',
      userId: user.id,
    };
  }

  async login(loginDto: LoginDto, userAgent?: string, ipAddress?: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: any;
    requiresMfa: boolean;
  }> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    // Generate tokens
    const payload: UserPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      mfaEnabled: user.mfaEnabled,
    };

    const { accessToken, refreshToken } = await this.jwtService.generateTokenPair(payload);

    // Create session
    await this.createSession({
      userId: user.id,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        mfaEnabled: user.mfaEnabled,
      },
      requiresMfa: user.mfaEnabled,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ message: string }> {
    const { token, type } = verifyOtpDto;

    // Find valid OTP
    const otpToken = await this.prisma.otpToken.findFirst({
      where: {
        token,
        type,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!otpToken) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Mark OTP as used
    await this.prisma.otpToken.update({
      where: { id: otpToken.id },
      data: { used: true },
    });

    // Handle different OTP types
    switch (type) {
      case OtpType.SIGNUP:
        await this.prisma.user.update({
          where: { id: otpToken.userId },
          data: { isVerified: true },
        });
        return { message: 'Email verified successfully' };

      case OtpType.PASSWORD_RESET:
        return { message: 'OTP verified. You can now reset your password.' };

      default:
        return { message: 'OTP verified successfully' };
    }
  }

  async resendOtp(email: string, type: OtpType): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.generateAndSendOtp(user.id, type);

    return { message: 'OTP sent successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return { message: 'If the email exists, a password reset link has been sent.' };
    }

    await this.generateAndSendOtp(user.id, OtpType.PASSWORD_RESET);

    return { message: 'If the email exists, a password reset link has been sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    // Find valid OTP
    const otpToken = await this.prisma.otpToken.findFirst({
      where: {
        token,
        type: OtpType.PASSWORD_RESET,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!otpToken) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      this.configService.get<number>('BCRYPT_ROUNDS', 12),
    );

    // Update password and mark OTP as used
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: otpToken.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.otpToken.update({
        where: { id: otpToken.id },
        data: { used: true },
      }),
    ]);

    return { message: 'Password reset successfully' };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    // Verify refresh token
    const payload = await this.jwtService.verifyRefreshToken(refreshToken);

    // Check if session exists and is valid
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new access token
    const newPayload: UserPayload = {
      sub: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      isVerified: session.user.isVerified,
      mfaEnabled: session.user.mfaEnabled,
    };

    const accessToken = await this.jwtService.generateAccessToken(newPayload);

    return { accessToken };
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    await this.prisma.session.deleteMany({
      where: { refreshToken },
    });

    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.prisma.session.deleteMany({
      where: { userId },
    });

    return { message: 'Logged out from all devices successfully' };
  }

  private async generateAndSendOtp(userId: string, type: OtpType): Promise<void> {
    // Generate 6-digit OTP
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration time (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP to database
    await this.prisma.otpToken.create({
      data: {
        userId,
        token,
        type,
        expiresAt,
      },
    });

    // TODO: Send email with OTP
    // This would integrate with your email service
    console.log(`OTP for user ${userId}: ${token} (expires in 5 minutes)`);
  }

  private async createSession(sessionData: CreateSessionDto): Promise<void> {
    await this.prisma.session.create({
      data: sessionData,
    });
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && user.password && await bcrypt.compare(password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async findUserById(id: string): Promise<any> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        mfaEnabled: true,
        avatar: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
