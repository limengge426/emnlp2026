#!/bin/bash

echo "========================================="
echo "启动创意写作实验平台"
echo "========================================="

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 启动后端
echo ""
echo "📦 启动后端服务器..."
cd "$SCRIPT_DIR/server"
npm install --silent 2>/dev/null || true
npm start &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端
echo ""
echo "🎨 启动前端服务器..."
cd "$SCRIPT_DIR/client"
npm install --silent 2>/dev/null || true
npm run dev &
FRONTEND_PID=$!

# 等待前端启动
sleep 5

echo ""
echo "========================================="
echo "✅ 应用已启动"
echo "========================================="
echo ""
echo "📱 前端地址：http://localhost:5173"
echo "🔧 后端地址：http://localhost:3001"
echo "👨‍💼 管理员页面：http://localhost:5173/admin"
echo "   管理员密钥：research-admin-2025"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 打开浏览器
if command -v open &> /dev/null; then
  open "http://localhost:5173" 2>/dev/null || true
fi

# 等待任意信号并清理
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

wait
