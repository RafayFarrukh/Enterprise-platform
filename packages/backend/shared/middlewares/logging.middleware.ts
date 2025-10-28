import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || '';
    const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
    
    // Add correlation ID to request
    req['correlationId'] = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);

    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const duration = Date.now() - start;

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength || 0} - ${duration}ms - ${ip} - ${userAgent} - ${correlationId}`
      );
    });

    next();
  }
}
