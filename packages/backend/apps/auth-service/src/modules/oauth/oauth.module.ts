import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';

// Import AuthModule to get SecurityService and other dependencies
import { AuthModule } from '../auth/auth.module';

// Controllers
import { OAuthController } from './controllers/oauth.controller';

// Services
import { OAuthService } from './services/oauth.service';

// Strategies removed - social login disabled

@Module({
  imports: [
    PassportModule,
    AuthModule, // Import AuthModule to get SecurityService, AuthService, etc.
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
    
    // Strategies removed - social login disabled
  ],
  exports: [
    OAuthService,
  ],
})
export class OAuthModule {}