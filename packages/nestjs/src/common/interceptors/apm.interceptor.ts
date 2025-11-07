import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { RequestContextService } from '../context/request-context.service';
import { CustomLogger, LogContext } from '../logger/custom-logger.service';

export interface PerformanceMetrics {
  requestId: string;
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  responseSize: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  timestamp: string;
}

@Injectable()
export class ApmInterceptor implements NestInterceptor {
  constructor(
    private readonly contextService: RequestContextService,
    private readonly logger: CustomLogger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();
    
    const startMemory = process.memoryUsage();
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logMetrics(request, response, startTime, startMemory);
        },
        error: () => {
          this.logMetrics(request, response, startTime, startMemory);
        },
      }),
    );
  }

  private logMetrics(
    request: Request,
    response: Response,
    startTime: number,
    startMemory: NodeJS.MemoryUsage,
  ): void {
    const duration = Date.now() - startTime;
    const currentMemory = process.memoryUsage();
    const requestId = this.contextService.getRequestId() || 'unknown';
    const responseSize = parseInt(response.get('content-length') || '0', 10);

    const metrics: PerformanceMetrics = {
      requestId,
      method: request.method,
      url: request.originalUrl,
      statusCode: response.statusCode,
      duration,
      responseSize,
      memoryUsage: {
        heapUsed: currentMemory.heapUsed - startMemory.heapUsed,
        heapTotal: currentMemory.heapTotal,
        external: currentMemory.external,
        rss: currentMemory.rss,
      },
      timestamp: new Date().toISOString(),
    };

    this.contextService.setMetadata('apm', metrics);

    if (duration > 1000) {
      this.logger.warn(
        `Slow request detected: ${metrics.method} ${metrics.url} took ${duration}ms`,
        LogContext.HTTP,
      );
    }

    if (this.shouldLogMetrics(metrics)) {
      this.logger.debug(
        `APM: ${JSON.stringify(metrics)}`,
        LogContext.HTTP,
      );
    }
  }

  private shouldLogMetrics(metrics: PerformanceMetrics): boolean {
    return (
      metrics.duration > 100 ||
      metrics.statusCode >= 400 ||
      metrics.memoryUsage.heapUsed > 10 * 1024 * 1024
    );
  }
}
