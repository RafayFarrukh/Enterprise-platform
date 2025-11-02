import { Injectable, ConflictException, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../database/prisma.service';
import { RegisterDto, AgencyRegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto, UserProfileDto, AgencyProfileDto } from '../dto/auth-response.dto';
import { CustomJwtService } from './jwt.service';
import { OtpService } from './otp.service';
import { MfaService } from './mfa.service';
import { SecurityService } from './security.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly customJwtService: CustomJwtService,
    private readonly otpService: OtpService,
    private readonly mfaService: MfaService,
    private readonly securityService: SecurityService,
  ) {}

  async registerUser(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, phone, password, firstName, lastName, ...profileData } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Validate password strength
    const validation = this.securityService.validatePasswordStrength(password);
    if (!validation.isValid) {
      throw new BadRequestException(validation.errors.join(', '));
    }

    // Hash password
    const passwordHash = await this.securityService.hashPassword(password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        profile: {
          create: {
            firstName,
            lastName,
            dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined,
            gender: profileData.gender as any,
            nationality: profileData.nationality,
          },
        },
        preferences: {
          create: {
            currency: registerDto.currency || 'USD',
          },
        },
      },
      include: {
        profile: true,
        preferences: true,
      },
    });

    // Generate tokens
    const tokens = await this.customJwtService.generateTokens(user.id, 'user');

    // Send verification email
    await this.otpService.sendEmailVerification(email, user.id);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get<number>('jwt.expiresIn', 900),
      userId: user.id,
      accountType: 'user',
      mfaRequired: false,
    };
  }

  async registerAgency(registerDto: AgencyRegisterDto): Promise<AuthResponseDto> {
    const { email, phone, password, firstName, lastName, agencyName, businessType, ...agencyData } = registerDto;

    // Check if agency already exists
    const existingAgency = await this.prisma.agency.findFirst({
      where: {
        OR: [
          { email },
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    if (existingAgency) {
      throw new ConflictException('Agency with this email or phone already exists');
    }

    // Check if agency name is unique
    const existingAgencyName = await this.prisma.agencyProfile.findUnique({
      where: { agencyName },
    });

    if (existingAgencyName) {
      throw new ConflictException('Agency name already exists');
    }

    // Validate password strength
    const validation = this.securityService.validatePasswordStrength(password);
    if (!validation.isValid) {
      throw new BadRequestException(validation.errors.join(', '));
    }

    // Hash password
    const passwordHash = await this.securityService.hashPassword(password);

    // Create agency
    const agency = await this.prisma.agency.create({
      data: {
        email,
        phone,
        passwordHash,
        profile: {
          create: {
            firstName,
            lastName,
            agencyName,
            businessType: businessType as any,
            dateOfBirth: agencyData.dateOfBirth ? new Date(agencyData.dateOfBirth) : undefined,
            gender: agencyData.gender as any,
            nationality: agencyData.nationality,
            grade: agencyData.grade as any,
            logo: agencyData.logo,
            description: agencyData.description,
            serviceArea: agencyData.serviceAreaCountry && agencyData.serviceAreaState ? {
              country: agencyData.serviceAreaCountry,
              state: agencyData.serviceAreaState,
            } : {},
            supportedLanguages: agencyData.supportedLanguages || [],
            employeeRange: agencyData.employeeRange as any,
            businessRegNumber: agencyData.businessRegNumber,
            taxIdNumber: agencyData.taxIdNumber,
            officeAddress: agencyData.officeAddress ? {
              address: agencyData.officeAddress,
            } : {},
          },
        },
        preferences: {
          create: {
            currency: registerDto.currency || 'USD',
          },
        },
      },
      include: {
        profile: true,
        preferences: true,
      },
    });

    // Generate tokens
    const tokens = await this.customJwtService.generateTokens(agency.id, 'agency');

    // Send verification email
    await this.otpService.sendEmailVerification(email, agency.id);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get<number>('jwt.expiresIn', 900),
      userId: agency.id,
      accountType: 'agency',
      mfaRequired: false,
    };
  }

  async loginUser(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password, mfaCode, accountType = 'user' } = loginDto;

    // Check account lockout
    await this.securityService.checkAccountLockout(email, 'user');

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        preferences: true,
      },
    });

    if (!user) {
      await this.securityService.recordFailedAttempt(email, 'user');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    if (!user.passwordHash || !(await this.securityService.verifyPassword(password, user.passwordHash))) {
      await this.securityService.recordFailedAttempt(email, 'user');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful password check
    await this.securityService.resetFailedAttempts(email, 'user');

    // Check account status
    if (user.status === 'BLOCKED') {
      throw new UnauthorizedException('Account is blocked');
    }

    if (user.status === 'DORMANT') {
      throw new UnauthorizedException('Account is dormant, recovery required');
    }

    // Check MFA
    if (user.mfaEnabled) {
      if (!mfaCode) {
        return {
          accessToken: '',
          refreshToken: '',
          tokenType: 'Bearer',
          expiresIn: 0,
          userId: user.id,
          accountType: 'user',
          mfaRequired: true,
          mfaMethod: 'totp',
        };
      }

      const isValidMfa = await this.mfaService.verifyTotp(user.mfaSecret, mfaCode);
      if (!isValidMfa) {
        throw new UnauthorizedException('Invalid MFA code');
      }
    }

    // Generate tokens
    const tokens = await this.customJwtService.generateTokens(user.id, 'user');

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get<number>('jwt.expiresIn', 900),
      userId: user.id,
      accountType: 'user',
      mfaRequired: false,
    };
  }

  async loginAgency(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password, mfaCode, accountType = 'agency' } = loginDto;

    // Check account lockout
    await this.securityService.checkAccountLockout(email, 'agency');

    // Find agency
    const agency = await this.prisma.agency.findUnique({
      where: { email },
      include: {
        profile: true,
        preferences: true,
      },
    });

    if (!agency) {
      await this.securityService.recordFailedAttempt(email, 'agency');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    if (!agency.passwordHash || !(await this.securityService.verifyPassword(password, agency.passwordHash))) {
      await this.securityService.recordFailedAttempt(email, 'agency');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful password check
    await this.securityService.resetFailedAttempts(email, 'agency');

    // Check account status
    if (agency.status === 'BLOCKED') {
      throw new UnauthorizedException('Account is blocked');
    }

    if (agency.status === 'DORMANT') {
      throw new UnauthorizedException('Account is dormant, recovery required');
    }

    // Check MFA
    if (agency.mfaEnabled) {
      if (!mfaCode) {
        return {
          accessToken: '',
          refreshToken: '',
          tokenType: 'Bearer',
          expiresIn: 0,
          userId: agency.id,
          accountType: 'agency',
          mfaRequired: true,
          mfaMethod: 'totp',
        };
      }

      const isValidMfa = await this.mfaService.verifyTotp(agency.mfaSecret, mfaCode);
      if (!isValidMfa) {
        throw new UnauthorizedException('Invalid MFA code');
      }
    }

    // Generate tokens
    const tokens = await this.customJwtService.generateTokens(agency.id, 'agency');

    // Update last login
    await this.prisma.agency.update({
      where: { id: agency.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get<number>('jwt.expiresIn', 900),
      userId: agency.id,
      accountType: 'agency',
      mfaRequired: false,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    const payload = await this.customJwtService.verifyRefreshToken(refreshToken);
    
    // Find user or agency
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { profile: true, preferences: true },
    });

    let accountType = 'user';
    let userId = payload.sub;

    if (!user) {
      const agency = await this.prisma.agency.findUnique({
        where: { id: payload.sub },
        include: { profile: true, preferences: true },
      });
      
      if (!agency) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      
      accountType = 'agency';
      userId = agency.id;
    }

    // Generate new tokens
    const tokens = await this.customJwtService.generateTokens(userId, accountType);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get<number>('jwt.expiresIn', 900),
      userId,
      accountType,
      mfaRequired: false,
    };
  }

  async logout(
    userId: string,
    accountType: string,
    refreshToken?: string,
    logoutType: string = 'current',
  ): Promise<void> {
    if (logoutType === 'all') {
      // Invalidate all sessions
      if (accountType === 'user') {
        await this.prisma.userSession.updateMany({
          where: { userId, isActive: true },
          data: { isActive: false },
        });
      } else {
        await this.prisma.agencySession.updateMany({
          where: { agencyId: userId, isActive: true },
          data: { isActive: false },
        });
      }
    } else if (refreshToken) {
      // Invalidate specific refresh token
      if (accountType === 'user') {
        await this.prisma.userSession.updateMany({
          where: { userId, refreshToken, isActive: true },
          data: { isActive: false },
        });
      } else {
        await this.prisma.agencySession.updateMany({
          where: { agencyId: userId, refreshToken, isActive: true },
          data: { isActive: false },
        });
      }
    } else {
      // Invalidate all sessions for user (fallback)
      if (accountType === 'user') {
        await this.prisma.userSession.updateMany({
          where: { userId, isActive: true },
          data: { isActive: false },
        });
      } else {
        await this.prisma.agencySession.updateMany({
          where: { agencyId: userId, isActive: true },
          data: { isActive: false },
        });
      }
    }
  }

  async getSessions(userId: string, accountType: string): Promise<any[]> {
    if (accountType === 'user') {
      const sessions = await this.prisma.userSession.findMany({
        where: { userId, isActive: true },
        select: {
          id: true,
          sessionToken: true,
          ipAddress: true,
          userAgent: true,
          device: true,
          createdAt: true,
          expiresAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return sessions;
    } else {
      const sessions = await this.prisma.agencySession.findMany({
        where: { agencyId: userId, isActive: true },
        select: {
          id: true,
          sessionToken: true,
          ipAddress: true,
          userAgent: true,
          device: true,
          createdAt: true,
          expiresAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return sessions;
    }
  }

  async revokeSession(userId: string, accountType: string, sessionId: string): Promise<void> {
    if (accountType === 'user') {
      await this.prisma.userSession.updateMany({
        where: { id: sessionId, userId, isActive: true },
        data: { isActive: false },
      });
    } else {
      await this.prisma.agencySession.updateMany({
        where: { id: sessionId, agencyId: userId, isActive: true },
        data: { isActive: false },
      });
    }
  }

  async getUserProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      profilePhoto: user.profile?.profilePhoto,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      mfaEnabled: user.mfaEnabled,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async getAgencyProfile(agencyId: string): Promise<AgencyProfileDto> {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
      include: { profile: true },
    });

    if (!agency) {
      throw new NotFoundException('Agency not found');
    }

    return {
      id: agency.id,
      email: agency.email,
      phone: agency.phone,
      firstName: agency.profile?.firstName || '',
      lastName: agency.profile?.lastName || '',
      agencyName: agency.profile?.agencyName || '',
      businessType: agency.profile?.businessType || '',
      grade: agency.profile?.grade || 'E',
      ranking: agency.profile?.ranking || 0,
      logo: agency.profile?.logo,
      status: agency.status,
      emailVerified: agency.emailVerified,
      phoneVerified: agency.phoneVerified,
      mfaEnabled: agency.mfaEnabled,
      createdAt: agency.createdAt.toISOString(),
      updatedAt: agency.updatedAt.toISOString(),
    };
  }

  async validateUser(emailOrPhone: string, password: string, userType: string = 'user'): Promise<any> {
    if (userType === 'agency') {
      return this.loginAgency({ email: emailOrPhone, password, accountType: 'agency' });
    }
    return this.loginUser({ email: emailOrPhone, password, accountType: 'user' });
  }

  async changePassword(
    userId: string,
    accountType: string,
    changePasswordDto: { currentPassword: string; newPassword: string; confirmPassword: string },
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password and confirm password do not match');
    }

    // Validate password strength
    const validation = this.securityService.validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      throw new BadRequestException(validation.errors.join(', '));
    }

    // Get user or agency
    let user;
    if (accountType === 'user') {
      user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
    } else {
      user = await this.prisma.agency.findUnique({
        where: { id: userId },
      });
    }

    if (!user || !user.passwordHash) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isValidPassword = await this.securityService.verifyPassword(
      currentPassword,
      user.passwordHash,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await this.securityService.hashPassword(newPassword);

    // Update password
    if (accountType === 'user') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });
    } else {
      await this.prisma.agency.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });
    }

    return { message: 'Password changed successfully' };
  }
}
