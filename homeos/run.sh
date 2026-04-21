#!/usr/bin/env bash

set -e

echo "🚀 启动 Home OS..."

if [ -n "$HA_URL" ]; then
  echo "📡 连接到 Home Assistant: $HA_URL"
fi

if [ ! -f /data/dev.db ]; then
  echo "📦 初始化数据库..."
  mkdir -p /data
fi

echo "🔧 设置环境变量..."
export DATABASE_URL="file:/data/dev.db"
export REDIS_URL="redis://redis:6379"

echo "🎯 启动服务..."
node dist/main.js
