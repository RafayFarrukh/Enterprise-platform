import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger('AuthMiddleware');

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Skip authentication for public routes
    if (this.isPublicRoute(req.path)) {
      return next();
    }

    const token = this.extractTokenFromHeader(req);
    
    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      // Add user info to request
      req['user'] = {
        id: payload.sub,
        email: payload.email,
        userType: payload.userType,
        iat: payload.iat,
        exp: payload.exp,
      };

      this.logger.debug(`User ${payload.sub} authenticated successfully`);
      next();
    } catch (error) {
      this.logger.warn(`Authentication failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private isPublicRoute(path: string): boolean {
    const publicRoutes = [
      '/api/v1/auth/login',
      '/api/v1/auth/register',
      '/api/v1/auth/forgot-password',
      '/api/v1/auth/reset-password',
      '/api/v1/auth/verify-email',
      '/api/v1/auth/verify-phone',
      '/api/v1/oauth/google',
      '/api/v1/oauth/github',
      '/api/v1/oauth/facebook',
      '/api/v1/oauth/linkedin',
      '/api/v1/health',
      '/api/v1/docs',
    ];

    return publicRoutes.some(route => path.startsWith(route));
  }
}
