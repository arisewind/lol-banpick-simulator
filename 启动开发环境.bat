@echo off
chcp 65001 >nul
echo ========================================
echo   LoL Ban/Pick Simulator - 开发模式
echo ========================================
echo.
echo 正在启动开发环境（Vite + Electron）...
echo.

cd /d "%~dp0"
setlocal

:: 取消可能阻碍 Electron 的环境变量（否则 electron 会退化为 node 解释器）
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

:: 启动开发环境：electron:dev 用 concurrently 同时托管 Vite 与 Electron
:: 脚本配置了 --kill-others，关闭 Electron 窗口会同时终止 Vite，不再有端口残留
echo [启动] 启动 Vite + Electron（关闭 Electron 窗口即同时停止两者）...
echo.
call pnpm electron:dev

echo.
echo ========================================
echo 应用已退出。
echo ========================================
echo.
pause
