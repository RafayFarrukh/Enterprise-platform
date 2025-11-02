import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

// Controllers
import { AuthController } from './controllers/auth.controller';
// OAuth is now a separate module

// Services
import { AuthService } from './services/auth.service';
import { CustomJwtService } from './services/jwt.service';
import { OtpService } from './services/otp.service';
import { MfaService } from './services/mfa.service';
import { RbacService } from './services/rbac.service';
import { SecurityService } from './services/security.service';

// Strategies
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { MfaGuard } from './guards/mfa.guard';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Services
    PrismaService,
    AuthService,
    CustomJwtService,
    OtpService,
    MfaService,
    RbacService,
    SecurityService,
    
    // Strategies
    LocalStrategy,
    JwtStrategy,
    
    // Guards
    JwtAuthGuard,
    RolesGuard,
    MfaGuard,
    PermissionsGuard,
  ],
  exports: [
    AuthService,
    CustomJwtService,
    OtpService,
    MfaService,
    RbacService,
    SecurityService,
    JwtAuthGuard,
    RolesGuard,
    MfaGuard,
    PermissionsGuard,
  ],
})
export class AuthModule {}
