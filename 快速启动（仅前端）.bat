@echo off
chcp 65001 >nul
setlocal enableextensions

REM ============================================================
REM  LoL Ban/Pick Simulator - 仅前端预览
REM  只启动 Vite 开发服务器，用浏览器访问(无需 Electron)
REM  DEV mock 自动注入，主界面可在浏览器完整预览
REM  注意: 导出/导入等文件操作在浏览器中不可用
REM ============================================================

cd /d "%~dp0"

echo.
echo ============================================================
echo   LoL Ban/Pick Simulator - Frontend Preview
echo ============================================================
echo.

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

REM ---- 清理可能残留的 5273 端口(Vite 端口) ----
echo [INFO] 检查端口 5273 占用...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr "LISTENING" ^| findstr /C:":5273 " 2^>nul') do (
    echo [INFO] 终止占用进程 PID=%%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [START] 启动 Vite 开发服务器...
echo         打开浏览器访问: http://localhost:5273
echo         按 Ctrl+C 停止服务器
echo.
call pnpm dev
set "EXITCODE=%errorlevel%"

echo.
if "%EXITCODE%"=="0" (
    echo ============================================================
    echo   Vite 已停止
    echo ============================================================
) else (
    echo ============================================================
    echo   Vite 异常退出 (exit code %EXITCODE%)
    echo ============================================================
)
echo.
pause
endlocal
