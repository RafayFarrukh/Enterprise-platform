import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

// Controllers
import { AuthController } from './controllers/auth.controller';
import { OAuthController } from './controllers/oauth.controller';

// Services
import { AuthService } from './services/auth.service';
import { JwtService } from './services/jwt.service';
import { MfaService } from './services/mfa.service';
import { OAuthService } from './services/oauth.service';

// Strategies
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { GithubStrategy } from './strategies/github.strategy';

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
  controllers: [AuthController, OAuthController],
  providers: [
    // Services
    PrismaService,
    AuthService,
    JwtService,
    MfaService,
    OAuthService,
    
    // Strategies
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    GithubStrategy,
    
    // Guards
    JwtAuthGuard,
    RolesGuard,
    MfaGuard,
  ],
  exports: [
    AuthService,
    JwtService,
    MfaService,
    OAuthService,
    JwtAuthGuard,
    RolesGuard,
    MfaGuard,
  ],
})
export class AuthModule {}
