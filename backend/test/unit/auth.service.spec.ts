import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../src/modules/auth/services/auth.service';
import { JwtService } from '../../src/modules/auth/services/jwt.service';
import { MfaService } from '../../src/modules/auth/services/mfa.service';
import { OAuthService } from '../../src/modules/auth/services/oauth.service';
import { PrismaService } from '../../src/database/prisma.service';
import { RegisterDto } from '../../src/modules/auth/dto/register.dto';
import { LoginDto } from '../../src/modules/auth/dto/login.dto';
import { OtpType } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    otpToken: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockJwtService = {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    generateTokenPair: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  const mockMfaService = {
    generateSecret: jest.fn(),
    verifyToken: jest.fn(),
    setupMfa: jest.fn(),
    disableMfa: jest.fn(),
    verifyMfaToken: jest.fn(),
  };

  const mockOAuthService = {
    findOrCreateUserFromGoogle: jest.fn(),
    findOAuthAccount: jest.fn(),
    unlinkOAuthAccount: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'BCRYPT_ROUNDS': 12,
        'jwt.secret': 'test-secret',
        'jwt.expiresIn': '15m',
        'jwt.refreshSecret': 'test-refresh-secret',
        'jwt.refreshExpiresIn': '7d',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MfaService,
          useValue: mockMfaService,
        },
        {
          provide: OAuthService,
          useValue: mockOAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
        name: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        isVerified: false,
      });
      mockPrismaService.otpToken.create.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(result).toEqual({
        message: 'User registered successfully. Please check your email for verification.',
        userId: 'user-id',
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockPrismaService.otpToken.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
        name: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user-id',
        email: 'test@example.com',
      });

      await expect(service.register(registerDto)).rejects.toThrow('User with this email already exists');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
      };

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: '$2b$12$hashedpassword',
        name: 'Test User',
        role: 'USER',
        isVerified: true,
        mfaEnabled: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.generateTokenPair.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      mockPrismaService.session.create.mockResolvedValue({});

      // Mock bcrypt.compare
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('requiresMfa');
      expect(result.requiresMfa).toBe(false);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException for unverified email', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
      };

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: '$2b$12$hashedpassword',
        name: 'Test User',
        role: 'USER',
        isVerified: false,
        mfaEnabled: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Mock bcrypt.compare
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow('Please verify your email before logging in');
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP successfully', async () => {
      const verifyOtpDto = {
        token: '123456',
        type: OtpType.SIGNUP,
      };

      const mockOtpToken = {
        id: 'otp-id',
        userId: 'user-id',
        token: '123456',
        type: OtpType.SIGNUP,
        user: {
          id: 'user-id',
          email: 'test@example.com',
        },
      };

      mockPrismaService.otpToken.findFirst.mockResolvedValue(mockOtpToken);
      mockPrismaService.otpToken.update.mockResolvedValue({});
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.verifyOtp(verifyOtpDto);

      expect(result).toEqual({ message: 'Email verified successfully' });
      expect(mockPrismaService.otpToken.update).toHaveBeenCalledWith({
        where: { id: 'otp-id' },
        data: { used: true },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { isVerified: true },
      });
    });

    it('should throw BadRequestException for invalid OTP', async () => {
      const verifyOtpDto = {
        token: '123456',
        type: OtpType.SIGNUP,
      };

      mockPrismaService.otpToken.findFirst.mockResolvedValue(null);

      await expect(service.verifyOtp(verifyOtpDto)).rejects.toThrow('Invalid or expired OTP');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockPayload = {
        sub: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        isVerified: true,
        mfaEnabled: false,
      };

      const mockSession = {
        id: 'session-id',
        userId: 'user-id',
        refreshToken: 'valid-refresh-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        user: {
          id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
          isVerified: true,
          mfaEnabled: false,
        },
      };

      mockJwtService.verifyRefreshToken.mockResolvedValue(mockPayload);
      mockPrismaService.session.findUnique.mockResolvedValue(mockSession);
      mockJwtService.generateAccessToken.mockResolvedValue('new-access-token');

      const result = await service.refreshToken(refreshToken);

      expect(result).toEqual({ accessToken: 'new-access-token' });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';

      mockJwtService.verifyRefreshToken.mockRejectedValue(new Error('Invalid token'));

      await expect(service.refreshToken(refreshToken)).rejects.toThrow('Invalid refresh token');
    });
  });
});
