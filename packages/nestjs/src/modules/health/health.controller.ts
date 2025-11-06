import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  HealthCheckResult,
  DiskHealthIndicator,
  MemoryHealthIndicator,
  HealthIndicatorFunction,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
    private configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    const uploadDir = this.configService.get<string>('UPLOAD_DIR', '');
    const healthChecks: HealthIndicatorFunction[] = [];

    if (uploadDir && existsSync(uploadDir)) {
      healthChecks.push(() =>
        this.disk.checkStorage('storage', { path: uploadDir, thresholdPercent: 0.9 }),
      );
    }

    healthChecks.push(
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
    );

    return this.health.check(healthChecks);
  }
}
