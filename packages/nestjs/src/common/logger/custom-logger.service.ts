import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export enum LogContext {
  APP = 'Application',
  HTTP = 'HTTP',
  UPLOADER = 'Uploader',
  FILE_SYSTEM = 'FileSystem',
  SECURITY = 'Security',
}

@Injectable()
export class CustomLogger implements LoggerService {
  private logLevels: LogLevel[];

  constructor(private configService: ConfigService) {
    const env = this.configService.get<string>('NODE_ENV') || 'development';
    this.logLevels = env === 'production'
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'];
  }

  private formatMessage(level: string, message: string, context?: string, trace?: string): string {
    const timestamp = new Date().toISOString();
    const ctx = context ? `[${context}]` : '';
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${ctx} ${message}`;
    
    if (trace) {
      return `${logMessage}\n${trace}`;
    }
    
    return logMessage;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logLevels.includes(level);
  }

  log(message: string, context?: string): void {
    if (this.shouldLog('log')) {
      console.log(this.formatMessage('log', message, context));
    }
  }

  error(message: string, trace?: string, context?: string): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, context, trace));
    }
  }

  warn(message: string, context?: string): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  debug(message: string, context?: string): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  verbose(message: string, context?: string): void {
    if (this.shouldLog('verbose')) {
      console.log(this.formatMessage('verbose', message, context));
    }
  }
}
