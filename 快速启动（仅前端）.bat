@echo off
chcp 65001 >nul
echo ========================================
echo   LoL Ban/Pick Simulator - 前端开发
echo ========================================
echo.
echo 正在启动 Vite 开发服务器（仅前端）...
echo 浏览器访问: http://localhost:5173
echo.
echo 提示：按 Ctrl+C 停止服务器
echo ========================================
echo.

cd /d "%~dp0"

:: 检查并清理占用端口 5173 的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173"') do (
    echo [清理] 终止占用端口的进程 %%a...
    taskkill /F /PID %%a >nul 2>&1
)

call pnpm dev
