import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

// Controllers
import { OAuthController } from './controllers/oauth.controller';

// Services
import { OAuthService } from './services/oauth.service';

// Strategies
import { GoogleStrategy } from '../auth/strategies/google.strategy';
import { GithubStrategy } from '../auth/strategies/github.strategy';

@Module({
  imports: [PassportModule, ConfigModule],
  controllers: [OAuthController],
  providers: [PrismaService, OAuthService, GoogleStrategy, GithubStrategy],
  exports: [OAuthService],
})
export class OAuthModule {}


