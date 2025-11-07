# 日志系统使用指南

## 概述

项目已统一使用 `CustomLogger` 服务，支持文本和 JSON 格式输出到 stdout/stderr，无文件持久化。

## 环境变量

```bash
# 日志格式 (默认: text)
LOG_FORMAT=text   # 文本格式
LOG_FORMAT=json   # JSON 格式

# 环境 (影响日志级别)
NODE_ENV=development  # error, warn, log, debug, verbose
NODE_ENV=production   # error, warn, log
```

## 使用方式

### 在服务中使用

```typescript
import { Injectable } from '@nestjs/common';
import { CustomLogger, LogContext } from '../common/logger/custom-logger.service';

@Injectable()
export class YourService {
  constructor(private readonly logger: CustomLogger) {}

  yourMethod() {
    this.logger.log('Operation completed', LogContext.APP);
    this.logger.debug('Debug info', LogContext.APP);
    this.logger.warn('Warning message', LogContext.APP);
    this.logger.error('Error message', error.stack, LogContext.APP);
  }
}
```

### 日志上下文

可用的日志上下文：
- `LogContext.APP` - 应用级别
- `LogContext.HTTP` - HTTP 请求
- `LogContext.UPLOADER` - 文件上传
- `LogContext.FILE_SYSTEM` - 文件系统操作
- `LogContext.SECURITY` - 安全相关

## 输出示例

### 文本格式
```
[2025-11-06T15:30:45.123Z] [LOG] [Uploader] Processing 2 files
[2025-11-06T15:30:45.456Z] [ERROR] [HTTP] Request failed
Error: Connection timeout
    at ...stack trace...
```

### JSON 格式
```json
{"timestamp":"2025-11-06T15:30:45.123Z","level":"LOG","message":"Processing 2 files","pid":12345,"env":"development","context":"Uploader"}
{"timestamp":"2025-11-06T15:30:45.456Z","level":"ERROR","message":"Request failed","pid":12345,"env":"development","context":"HTTP","trace":"Error: Connection timeout\n    at ..."}
```

## 特性

1. **统一输出**: 所有日志通过 CustomLogger，不再使用 console
2. **环境感知**: 生产环境自动减少日志级别
3. **结构化日志**: JSON 格式便于日志分析工具处理
4. **标准流分离**: error 输出到 stderr，其他输出到 stdout
5. **上下文标记**: 每条日志都有清晰的上下文标识
