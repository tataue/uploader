import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLogger, LogContext } from '../logger/custom-logger.service';
import { RequestContextService } from '../context/request-context.service';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: CustomLogger,
    private readonly contextService: RequestContextService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();
    const context = this.contextService.getContext();

    res.on('finish', () => {
      if (!context) {
        return;
      }

      this.contextService.run(context, () => {
        const { statusCode } = res;
        const contentLength = res.get('content-length') || '0';
        const duration = Date.now() - startTime;

        const logMessage = `${method} ${originalUrl} ${statusCode} ${contentLength}b - ${duration}ms - ${ip} - ${userAgent}`;

        if (statusCode >= 500) {
          this.logger.error(logMessage, undefined, LogContext.HTTP);
        } else if (statusCode >= 400) {
          this.logger.warn(logMessage, LogContext.HTTP);
        } else {
          this.logger.log(logMessage, LogContext.HTTP);
        }
      });
    });

    next();
  }
}
