#!/bin/bash

# 项目结构清理脚本
# 删除重组后的废弃文件

echo "🧹 开始清理项目废弃文件..."
echo ""

# 定位到脚本所在目录的项目根目录
cd "$(dirname "$0")"

# 清理 NestJS 废弃文件
echo "📦 清理 NestJS 废弃文件..."
if [ -d "packages/nestjs/src/app" ]; then
  rm -rf packages/nestjs/src/app
  echo "  ✅ 删除 packages/nestjs/src/app/"
else
  echo "  ℹ️  app/ 目录不存在或已删除"
fi

if [ -f "packages/nestjs/src/schema.gql" ]; then
  rm -f packages/nestjs/src/schema.gql
  echo "  ✅ 删除 packages/nestjs/src/schema.gql"
else
  echo "  ℹ️  schema.gql 文件不存在或已删除"
fi

echo ""

# 清理 React 废弃文件
echo "⚛️  清理 React 废弃文件..."
if [ -f "packages/react-app/src/setupProxy.js" ]; then
  rm -f packages/react-app/src/setupProxy.js
  echo "  ✅ 删除 packages/react-app/src/setupProxy.js"
else
  echo "  ℹ️  setupProxy.js 文件不存在或已删除"
fi

# 删除空目录
echo ""
echo "📂 清理空目录..."
removed=0

if [ -d "packages/react-app/src/components" ] && [ -z "$(ls -A packages/react-app/src/components 2>/dev/null)" ]; then
  rmdir packages/react-app/src/components 2>/dev/null && echo "  ✅ 删除空目录 packages/react-app/src/components/" && removed=$((removed+1))
fi

if [ -d "packages/react-app/src/hooks" ] && [ -z "$(ls -A packages/react-app/src/hooks 2>/dev/null)" ]; then
  rmdir packages/react-app/src/hooks 2>/dev/null && echo "  ✅ 删除空目录 packages/react-app/src/hooks/" && removed=$((removed+1))
fi

if [ -d "packages/react-app/src/types" ] && [ -z "$(ls -A packages/react-app/src/types 2>/dev/null)" ]; then
  rmdir packages/react-app/src/types 2>/dev/null && echo "  ✅ 删除空目录 packages/react-app/src/types/" && removed=$((removed+1))
fi

if [ $removed -eq 0 ]; then
  echo "  ℹ️  没有空目录需要删除"
fi

echo ""
echo "✨ 清理完成！"
echo ""
echo "📊 项目结构概览："
echo ""
echo "packages/nestjs/src/"
echo "  ├── app.module.ts           # 主应用模块"
echo "  ├── main.ts                 # 入口文件"
echo "  ├── common/                 # 公共模块"
echo "  │   ├── interceptors/       # 拦截器"
echo "  │   ├── middleware/         # 中间件（HTTP日志）"
echo "  │   ├── logger/             # 自定义日志服务"
echo "  │   └── interfaces/         # 接口定义"
echo "  ├── config/                 # 配置"
echo "  └── modules/                # 业务模块"
echo "      └── uploader/           # 上传模块"
echo "          ├── controllers/    # 控制器"
echo "          ├── services/       # 服务层"
echo "          └── dto/            # DTO"
echo ""
echo "packages/react-app/src/"
echo "  ├── features/               # 功能模块"
echo "  │   └── uploader/           # 上传功能"
echo "  │       ├── components/     # 组件"
echo "  │       ├── hooks/          # Hooks"
echo "  │       └── types/          # 类型定义"
echo "  └── utils/                  # 工具函数"
echo ""
echo "📚 文档："
echo "  - PROJECT_STRUCTURE.md      # 项目结构说明"
echo "  - LOGGING.md                # 日志系统文档"
echo ""
echo "🔍 验证构建："
echo "  cd packages/nestjs && pnpm run build"
echo "  cd packages/react-app && pnpm run build"
