import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class IpFilterGuard implements CanActivate {
  private readonly ipWhitelist: Set<string>;
  private readonly ipBlacklist: Set<string>;

  constructor(private configService: ConfigService) {
    const whitelist = this.configService.get<string>('IP_WHITELIST', '');
    const blacklist = this.configService.get<string>('IP_BLACKLIST', '');
    
    this.ipWhitelist = new Set(
      whitelist.split(',').map(ip => ip.trim()).filter(Boolean)
    );
    this.ipBlacklist = new Set(
      blacklist.split(',').map(ip => ip.trim()).filter(Boolean)
    );
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = this.getClientIp(request);

    if (this.ipBlacklist.has(clientIp)) {
      throw new HttpException('IP被禁止访问', HttpStatus.FORBIDDEN);
    }

    if (this.ipWhitelist.size > 0 && !this.ipWhitelist.has(clientIp)) {
      throw new HttpException('IP未授权', HttpStatus.FORBIDDEN);
    }

    return true;
  }

  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return request.ip || request.socket.remoteAddress || '';
  }
}
