import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

// Configuration
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import emailConfig from './config/email.config';
import oauthConfig from './config/oauth.config';
import redisConfig from './config/redis.config';
import storageConfig from './config/storage.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';

// Guards
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        jwtConfig,
        emailConfig,
        oauthConfig,
        redisConfig,
        storageConfig,
      ],
      envFilePath: ['.env.local', '.env'],
    }),
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
