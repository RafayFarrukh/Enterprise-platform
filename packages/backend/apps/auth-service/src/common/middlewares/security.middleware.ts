import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SecurityService } from '../../modules/auth/services/security.service';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  constructor(private readonly securityService: SecurityService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'");

    // Log activity for authenticated requests
    if (req.user) {
      const user = req.user as any;
      this.securityService.logActivity(
        user.id,
        null,
        user.accountType || 'user',
        req.method.toLowerCase(),
        req.path.split('/').filter(Boolean)[0], // Resource
        req.params?.id || req.body?.id,
        req.ip,
        req.get('user-agent'),
        {
          method: req.method,
          path: req.path,
          query: req.query,
        },
        true,
      ).catch(() => {
        // Silent fail for logging
      });
    }

    next();
  }
}

