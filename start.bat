@echo off
setlocal enabledelayedexpansion

echo =========================================
echo 启动创意写作实验平台
echo =========================================

REM 获取脚本所在目录
set SCRIPT_DIR=%~dp0

REM 启动后端
echo.
echo 📦 启动后端服务器...
cd /d "%SCRIPT_DIR%server"
call npm install >nul 2>&1
start "Writing Study Backend" cmd /k npm start

REM 等待后端启动
timeout /t 3 /nobreak

REM 启动前端
echo.
echo 🎨 启动前端服务器...
cd /d "%SCRIPT_DIR%client"
call npm install >nul 2>&1
start "Writing Study Frontend" cmd /k npm run dev

REM 等待前端启动
timeout /t 5 /nobreak

echo.
echo =========================================
echo ✅ 应用已启动
echo =========================================
echo.
echo 📱 前端地址：http://localhost:5173
echo 🔧 后端地址：http://localhost:3001
echo 👨‍💼 管理员页面：http://localhost:5173/admin
echo    管理员密钥：research-admin-2025
echo.
echo 关闭此窗口停止服务
echo.

REM 打开浏览器
start http://localhost:5173

pause
