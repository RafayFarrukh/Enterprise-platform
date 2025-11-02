import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';

// Controllers
import { OAuthController } from './controllers/oauth.controller';

// Services
import { OAuthService } from './services/oauth.service';
import { CustomJwtService } from '../auth/services/jwt.service';
import { AuthService } from '../auth/services/auth.service';
import { OtpService } from '../auth/services/otp.service';
import { MfaService } from '../auth/services/mfa.service';

// Strategies removed - social login disabled

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
  controllers: [OAuthController],
  providers: [
    // Services
    PrismaService,
    OAuthService,
    CustomJwtService,
    AuthService,
    OtpService,
    MfaService,
    
    // Strategies removed - social login disabled
  ],
  exports: [
    OAuthService,
  ],
})
export class OAuthModule {}