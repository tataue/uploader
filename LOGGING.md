# 日志系统文档

## 📝 概述

项目采用 NestJS 内置 Logger + 自定义增强的完整日志系统，包括：
- ✅ **业务日志** - NestJS Logger 用于业务逻辑
- ✅ **HTTP 访问日志** - HttpLoggerMiddleware 记录所有 HTTP 请求
- ✅ **日志级别控制** - 根据环境自动调整
- ✅ **统一格式** - 时间戳 + 级别 + 上下文 + 消息

---

## 🎯 日志级别

### 生产环境 (NODE_ENV=production)
```
error, warn, log
```

### 开发环境 (默认)
```
error, warn, log, debug, verbose
```

---

## 📦 日志组件

### 1. HTTP 访问日志中间件

**位置**: `src/common/middleware/http-logger.middleware.ts`

**功能**: 自动记录所有 HTTP 请求

**日志格式**:
```
[2025-11-05T12:34:56.789Z] [LOG] [HTTP] GET /uploader 200 1234b - 45ms - 127.0.0.1 - Mozilla/5.0...
```

**字段说明**:
- 时间戳
- 日志级别
- 上下文 [HTTP]
- 请求方法和路径
- HTTP 状态码
- 响应大小
- 响应时间
- 客户端 IP
- User-Agent

**状态码着色规则**:
- 5xx → `error` (红色)
- 4xx → `warn` (黄色)
- 2xx/3xx → `log` (绿色)

**配置**:
```typescript
// app.module.ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
```

---

### 2. 业务日志 - NestJS Logger

**使用位置**: Controller / Service

**基本用法**:
```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class UploaderService {
  private readonly logger = new Logger(UploaderService.name);

  async uploadFile(file: File) {
    this.logger.log('Processing file upload');
    this.logger.debug(`File details: ${file.name}`);
    
    try {
      // 业务逻辑
    } catch (error) {
      this.logger.error('Upload failed', error.stack);
      throw error;
    }
  }
}
```

**日志方法**:
```typescript
// 常规日志
this.logger.log('Operation completed');

// 调试信息（仅开发环境）
this.logger.debug('Variable value: ' + value);

// 警告
this.logger.warn('Resource usage high');

// 错误（带堆栈跟踪）
this.logger.error('Operation failed', error.stack);

// 详细日志（仅开发环境）
this.logger.verbose('Detailed processing info');
```

---

### 3. 自定义 Logger 服务 (可选)

**位置**: `src/common/logger/custom-logger.service.ts`

**特性**:
- 环境感知的日志级别
- 统一的时间戳格式
- 结构化日志输出
- 可扩展为文件日志

**使用方法**:
```typescript
import { CustomLogger } from './common/logger';

// 在 main.ts 中使用
const app = await NestFactory.create(AppModule, {
  logger: new CustomLogger(configService),
});
```

---

## 📊 各模块日志示例

### Controller 日志
```typescript
@Controller('uploader')
export class UploaderController {
  private readonly logger = new Logger(UploaderController.name);

  @Post()
  async uploadFile(@UploadedFiles() files: Express.Multer.File[]) {
    this.logger.log(`Received ${files.length} files`);
    this.logger.debug(`Request body: ${JSON.stringify(req.body)}`);
    // ...
  }
}
```

**输出示例**:
```
[2025-11-05T12:34:56.789Z] [LOG] [UploaderController] Received 3 files
[2025-11-05T12:34:56.790Z] [DEBUG] [UploaderController] Request body: {"targetDir":"uploads"}
```

---

### Service 日志
```typescript
@Injectable()
export class UploaderService {
  private readonly logger = new Logger(UploaderService.name);

  async processUploadedFiles(files: File[]) {
    this.logger.log(`Processing ${files.length} files`);
    
    for (let i = 0; i < files.length; i++) {
      this.logger.debug(`Processing file ${i}: ${files[i].name}`);
      // ...
    }
    
    this.logger.log('All files processed successfully');
  }
}
```

**输出示例**:
```
[2025-11-05T12:34:56.791Z] [LOG] [UploaderService] Processing 3 files
[2025-11-05T12:34:56.792Z] [DEBUG] [UploaderService] Processing file 0: document.pdf
[2025-11-05T12:34:56.850Z] [LOG] [UploaderService] All files processed successfully
```

---

### 错误日志
```typescript
try {
  await this.processFile(file);
} catch (error) {
  this.logger.error(
    'File processing failed',
    error instanceof Error ? error.stack : error,
  );
  throw new HttpException('处理失败', HttpStatus.INTERNAL_SERVER_ERROR);
}
```

**输出示例**:
```
[2025-11-05T12:34:56.900Z] [ERROR] [UploaderService] File processing failed
Error: Invalid file format
    at UploaderService.processFile (/app/src/uploader/uploader.service.ts:45:13)
    at async UploaderService.uploadFile (/app/src/uploader/uploader.service.ts:30:5)
```

---

## 🔍 日志查看建议

### 开发环境
```bash
# 启动服务，查看完整日志
pnpm run start:dev

# 仅查看错误日志
pnpm run start:dev 2>&1 | grep ERROR

# 仅查看 HTTP 日志
pnpm run start:dev 2>&1 | grep "\[HTTP\]"
```

### 生产环境
```bash
# 标准输出重定向到文件
NODE_ENV=production pnpm run start:prod > /var/log/uploader.log 2>&1

# 使用 PM2 管理
pm2 start dist/main.js --name uploader --log /var/log/uploader.log

# 使用 Docker 查看日志
docker logs -f uploader-container
```

---

## 📈 日志最佳实践

### ✅ 推荐做法

1. **使用语义化的日志级别**
```typescript
// ✅ 正确
this.logger.log('File uploaded successfully');      // 正常操作
this.logger.debug('File path: /tmp/upload');       // 调试信息
this.logger.warn('File size exceeds 10MB');        // 警告
this.logger.error('Upload failed', error.stack);   // 错误
```

2. **包含足够的上下文**
```typescript
// ✅ 正确
this.logger.log(`Processing ${files.length} files for user ${userId}`);

// ❌ 错误
this.logger.log('Processing files');
```

3. **错误日志包含堆栈跟踪**
```typescript
// ✅ 正确
this.logger.error('Operation failed', error.stack);

// ❌ 错误
this.logger.error('Operation failed');
```

4. **避免敏感信息**
```typescript
// ❌ 错误 - 包含密码
this.logger.log(`User login: ${username} / ${password}`);

// ✅ 正确
this.logger.log(`User login attempt: ${username}`);
```

---

### ❌ 避免做法

1. **不要使用 console.log**
```typescript
// ❌ 错误
console.log('Processing file');

// ✅ 正确
this.logger.log('Processing file');
```

2. **不要在循环中过度记录**
```typescript
// ❌ 错误 - 1000 个文件会输出 1000 条日志
for (const file of files) {
  this.logger.log(`Processing ${file.name}`);
}

// ✅ 正确
this.logger.log(`Processing ${files.length} files`);
this.logger.debug(`Files: ${files.map(f => f.name).join(', ')}`);
```

3. **不要记录大量数据**
```typescript
// ❌ 错误
this.logger.log(`Data: ${JSON.stringify(bigObject)}`);

// ✅ 正确
this.logger.log(`Data size: ${Object.keys(bigObject).length} items`);
```

---

## 🛠️ 扩展功能

### 添加文件日志输出

可以集成第三方库如 `winston` 或 `pino`:

```bash
pnpm add winston winston-daily-rotate-file
```

```typescript
// src/common/logger/winston-logger.service.ts
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const transport = new winston.transports.DailyRotateFile({
  filename: 'logs/app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
});

export const winstonLogger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [transport],
});
```

---

## 📋 总结

✅ **已实现的日志功能**:
- HTTP 访问日志（所有请求）
- 业务日志（Controller/Service）
- 日志级别控制
- 错误堆栈跟踪
- 统一格式化输出

✅ **日志覆盖范围**:
- ✅ UploaderController
- ✅ UploaderService
- ✅ FileSystemService
- ✅ HttpLoggerMiddleware
- ✅ Bootstrap (main.ts)

✅ **零 console.log**: 所有控制台输出已替换为 NestJS Logger

---

*最后更新: 2025-11-05*
