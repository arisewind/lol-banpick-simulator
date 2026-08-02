@echo off
chcp 65001 >nul
setlocal enableextensions

REM ============================================================
REM  LoL Ban/Pick Simulator - 开发环境启动
REM  同时启动 Vite 开发服务器 + Electron 主窗口
REM  关闭 Electron 窗口会自动终止 Vite(concurrently --kill-others)
REM ============================================================

cd /d "%~dp0"

echo.
echo ============================================================
echo   LoL Ban/Pick Simulator - Dev Environment
echo ============================================================
echo.

REM ---- 取消可能阻碍 Electron 的环境变量(否则 electron 退化为 node 解释器) ----
set "ELECTRON_RUN_AS_NODE="

REM ---- 前置检查 1: pnpm ----
where pnpm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] 未检测到 pnpm。请先安装 Node.js 和 pnpm。
    echo         npm install -g pnpm
    pause
    exit /b 1
)

REM ---- 前置检查 2: node_modules ----
if not exist "node_modules\" (
    echo [INFO] 首次运行，正在安装依赖...
    call pnpm install
    if errorlevel 1 (
        echo [ERROR] 依赖安装失败。
        pause
        exit /b 1
    )
)

REM ---- 前置检查 3: Electron 二进制(常见故障: postinstall 未下载) ----
if not exist "node_modules\electron\dist\electron.exe" (
    echo [WARN] Electron 二进制缺失，正在补下载...
    set "ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/"
    node node_modules\electron\install.js
    if not exist "node_modules\electron\dist\electron.exe" (
        echo [ERROR] Electron 二进制下载失败。
        echo        手动执行: set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
        echo                 node node_modules\electron\install.js
        pause
        exit /b 1
    )
)

REM ---- 清理可能残留的 5273 端口(Vite 端口) ----
echo [INFO] 检查端口 5273 占用...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr "LISTENING" ^| findstr /C:":5273 " 2^>nul') do (
    echo [INFO] 终止占用进程 PID=%%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [START] 启动 Vite + Electron ...
echo         Vite:    http://localhost:5273
echo         关闭 Electron 窗口即同时停止两者
echo.
call pnpm electron:dev
set "EXITCODE=%errorlevel%"

echo.
if "%EXITCODE%"=="0" (
    echo ============================================================
    echo   应用已正常退出
    echo ============================================================
) else (
    echo ============================================================
    echo   应用已退出 (exit code %EXITCODE%)
    echo ============================================================
)
echo.
pause
endlocal
