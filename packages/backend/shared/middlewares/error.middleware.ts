import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ErrorMiddleware implements NestMiddleware {
  private readonly logger = new Logger('ErrorMiddleware');

  use(req: Request, res: Response, next: NextFunction) {
    // Store original error handler
    const originalSend = res.send;

    // Override send method to catch errors
    res.send = function(body) {
      try {
        return originalSend.call(this, body);
      } catch (error) {
        this.logger.error(`Error in response: ${error.message}`, error.stack);
        return originalSend.call(this, JSON.stringify({
          success: false,
          message: 'Internal server error',
          error: 'An unexpected error occurred',
          timestamp: new Date().toISOString(),
          path: req.path,
        }));
      }
    };

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      this.logger.error(`Uncaught Exception: ${error.message}`, error.stack);
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    });

    next();
  }
}
