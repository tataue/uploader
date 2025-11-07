import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  requestId: string;
  method: string;
  url: string;
  ip: string;
  userAgent: string;
  startTime: number;
  userId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class RequestContextService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

  run<T>(context: RequestContext, callback: () => T): T {
    return this.asyncLocalStorage.run(context, callback);
  }

  getContext(): RequestContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  getRequestId(): string | undefined {
    return this.getContext()?.requestId;
  }

  setMetadata(key: string, value: unknown): void {
    const context = this.getContext();
    if (context) {
      if (!context.metadata) {
        context.metadata = {};
      }
      context.metadata[key] = value;
    }
  }

  getMetadata(key: string): unknown | undefined {
    return this.getContext()?.metadata?.[key];
  }
}
