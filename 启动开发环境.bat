@echo off
chcp 65001 >nul
echo ========================================
echo   LoL Ban/Pick Simulator - 开发模式
echo ========================================
echo.
echo 正在启动开发环境...
echo.

cd /d "%~dp0"
setlocal enabledelayedexpansion

:: 取消可能阻碍 Electron 的环境变量
set ELECTRON_RUN_AS_NODE=

:: 检查并清理占用端口 5173 的进程
echo [检查] 检测端口 5173 是否被占用...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" 2^>nul') do (
    echo [发现] 端口 5173 被进程 %%a 占用，正在终止...
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo [警告] 无法终止进程 %%a，可能需要手动处理
    ) else (
        echo [完成] 进程 %%a 已终止
    )
)
echo [完成] 端口检查完成
echo.

:: 检查 node_modules 是否存在
if not exist "node_modules\" (
    echo [信息] 首次运行，正在安装依赖...
    call pnpm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败！
        pause
        exit /b 1
    )
    echo [完成] 依赖安装成功！
    echo.
)

:: 启动开发环境 - 分步启动更可靠
echo [启动] 正在启动 Vite 开发服务器...
start /B cmd /c "pnpm dev" >nul 2>&1

:: 等待 Vite 启动（最多等待 30 秒）
echo [等待] 等待 Vite 服务器启动...
echo.

set MAX_WAIT=30
set WAIT_COUNT=0

:wait_loop
set /a WAIT_COUNT+=1
set /a PERCENT=WAIT_COUNT*100/MAX_WAIT

:: 检测 HTTP 响应
curl -s http://localhost:5173 >nul 2>&1
if errorlevel 1 (
    if !WAIT_COUNT! lss %MAX_WAIT% (
        <nul set /p "=正在启动... !PERCENT!%% (!WAIT_COUNT!/%MAX_WAIT% 秒)^r"
        timeout /t 1 /nobreak >nul
        goto wait_loop
    ) else (
        echo.
        echo [错误] Vite 启动超时！
        pause
        exit /b 1
    )
)

echo.
echo [完成] Vite 服务器已就绪！
echo.
echo [启动] 正在启动 Electron 窗口...
echo.

:: 启动 Electron
call npx electron .

echo.
echo 提示：关闭此窗口或按 Ctrl+C 可停止应用
echo ========================================
echo.
pause
