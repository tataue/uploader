import { Injectable, LoggerService, LogLevel, Inject, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestContextService } from '../context/request-context.service';

export enum LogContext {
  APP = 'Application',
  HTTP = 'HTTP',
  UPLOADER = 'Uploader',
  FILE_SYSTEM = 'FileSystem',
  SECURITY = 'Security',
}

export type LogFormat = 'text' | 'json';

interface LogEntry {
  timestamp: string;
  level: string;
  context?: string;
  message: string;
  trace?: string;
  pid: number;
  env: string;
  requestId?: string;
  method?: string;
  url?: string;
}

@Injectable()
export class CustomLogger implements LoggerService {
  private logLevels: LogLevel[];
  private logFormat: LogFormat;
  private env: string;

  constructor(
    private configService: ConfigService,
    @Optional() @Inject(RequestContextService) private contextService?: RequestContextService,
  ) {
    this.env = this.configService.get<string>('NODE_ENV') || 'development';
    this.logLevels = this.env === 'production'
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'];
    
    this.logFormat = (this.configService.get<string>('LOG_FORMAT') || 'text') as LogFormat;
  }

  private formatMessage(level: string, message: string, context?: string, trace?: string): string {
    const timestamp = new Date().toISOString();
    const reqContext = this.contextService?.getContext();

    if (this.logFormat === 'json') {
      const logEntry: LogEntry = {
        timestamp,
        level: level.toUpperCase(),
        message,
        pid: process.pid,
        env: this.env,
      };

      if (context) {
        logEntry.context = context;
      }

      if (trace) {
        logEntry.trace = trace;
      }

      if (reqContext) {
        logEntry.requestId = reqContext.requestId;
        logEntry.method = reqContext.method;
        logEntry.url = reqContext.url;
      }

      return JSON.stringify(logEntry);
    }

    const ctx = context ? `[${context}]` : '';
    const reqId = reqContext?.requestId ? `[${reqContext.requestId}]` : '';
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${reqId} ${ctx} ${message}`;
    
    if (trace) {
      return `${logMessage}\n${trace}`;
    }
    
    return logMessage;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logLevels.includes(level);
  }

  private output(level: 'log' | 'error' | 'warn' | 'debug', formatted: string): void {
    if (level === 'error') {
      process.stderr.write(formatted + '\n');
    } else {
      process.stdout.write(formatted + '\n');
    }
  }

  log(message: string, context?: string): void {
    if (this.shouldLog('log')) {
      this.output('log', this.formatMessage('log', message, context));
    }
  }

  error(message: string, trace?: string, context?: string): void {
    if (this.shouldLog('error')) {
      this.output('error', this.formatMessage('error', message, context, trace));
    }
  }

  warn(message: string, context?: string): void {
    if (this.shouldLog('warn')) {
      this.output('warn', this.formatMessage('warn', message, context));
    }
  }

  debug(message: string, context?: string): void {
    if (this.shouldLog('debug')) {
      this.output('debug', this.formatMessage('debug', message, context));
    }
  }

  verbose(message: string, context?: string): void {
    if (this.shouldLog('verbose')) {
      this.output('log', this.formatMessage('verbose', message, context));
    }
  }
}
