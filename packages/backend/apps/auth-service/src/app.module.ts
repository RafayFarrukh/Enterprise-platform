import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

// Configuration
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import environmentConfig from './config/environment.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { OAuthModule } from './modules/oauth/oauth.module';

// Guards
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

// Middlewares
import { SecurityMiddleware } from './common/middlewares/security.middleware';
import { SanitizeMiddleware } from './common/middlewares/sanitize.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        jwtConfig,
        redisConfig,
        environmentConfig,
      ],
      envFilePath: ['.env.local', '.env'],
    }),
    AuthModule,
    OAuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SanitizeMiddleware, SecurityMiddleware)
      .forRoutes('*');
  }
}
