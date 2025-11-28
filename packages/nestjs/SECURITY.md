# DDoS防护配置说明

## 环境变量配置

创建 `.env` 文件并配置以下参数:

```env
# 服务器端口
PORT=3001

# 速率限制配置
THROTTLE_TTL=60000          # 时间窗口(毫秒) - 默认60秒
THROTTLE_LIMIT=100          # 普通请求限制 - 默认60秒内100次
THROTTLE_UPLOAD_LIMIT=10    # 上传请求限制 - 默认60秒内10次

# 文件上传配置
MAX_FILE_SIZE=104857600     # 最大文件大小(字节) - 默认100MB
MAX_FILES=10                # 最大文件数量 - 默认10个

# IP访问控制
IP_WHITELIST=              # IP白名单,逗号分隔,例如: 192.168.1.1,10.0.0.1
IP_BLACKLIST=              # IP黑名单,逗号分隔,例如: 1.2.3.4,5.6.7.8

# CORS配置
CORS_ORIGIN=http://localhost:3000  # 允许的跨域来源
```

## DDoS防护措施说明

### 1. 全局速率限制
- 使用 `@nestjs/throttler` 实现
- 默认: 60秒内最多100次请求
- 超出限制返回 429 状态码

### 2. 上传接口额外限制
- 上传接口独立限制: 60秒内最多10次
- 防止上传接口被滥用

### 3. IP黑白名单
- IP白名单: 如果配置,只允许白名单IP访问
- IP黑名单: 拒绝黑名单IP访问
- 支持 X-Forwarded-For 头识别真实IP

### 4. 文件上传限制
- 文件大小限制: 默认100MB
- 文件数量限制: 默认单次10个
- 防止资源耗尽攻击

### 5. HTTP安全头
- 使用 Helmet 添加安全HTTP头
- 防止常见Web攻击(XSS, 点击劫持等)

### 6. CORS保护
- 配置允许的跨域来源
- 防止未授权的跨域访问

## 使用建议

### 生产环境配置
```env
THROTTLE_TTL=60000
THROTTLE_LIMIT=60
THROTTLE_UPLOAD_LIMIT=5
MAX_FILE_SIZE=52428800      # 50MB
IP_BLACKLIST=              # 根据实际情况配置
```

### 高负载环境配置
```env
THROTTLE_TTL=60000
THROTTLE_LIMIT=30
THROTTLE_UPLOAD_LIMIT=3
```

## 监控建议

1. 监控 429 错误日志,识别可能的攻击
2. 定期检查访问日志,发现异常IP
3. 使用反向代理(Nginx/CloudFlare)提供额外保护层
