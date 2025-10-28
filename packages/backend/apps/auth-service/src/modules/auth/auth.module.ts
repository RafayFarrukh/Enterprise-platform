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
import { JwtService } from './services/jwt.service';
import { OtpService } from './services/otp.service';

// Strategies
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { MfaGuard } from './guards/mfa.guard';

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
    JwtService,
    OtpService,
    
    // Strategies
    LocalStrategy,
    JwtStrategy,
    
    // Guards
    JwtAuthGuard,
    RolesGuard,
    MfaGuard,
  ],
  exports: [
    AuthService,
    JwtService,
    OtpService,
    JwtAuthGuard,
    RolesGuard,
    MfaGuard,
  ],
})
export class AuthModule {}
