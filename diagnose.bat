@echo off
chcp 65001 >nul
echo ========================================
echo   诊断启动问题
echo ========================================
echo.

cd /d "%~dp0"
set ELECTRON_RUN_AS_NODE=

echo [1] 检查 pnpm...
where pnpm >nul 2>&1
if errorlevel 1 (
    echo [错误] pnpm 未安装或不在 PATH 中
    goto :end
) else (
    echo [OK] pnpm 可用
)
echo.

echo [2] 检查 electron...
if exist "node_modules\electron\dist\electron.exe" (
    echo [OK] electron.exe 存在
) else (
    echo [错误] electron.exe 不存在
)
echo.

echo [3] 检查 concurrently...
npx concurrently --help >nul 2>&1
if errorlevel 1 (
    echo [错误] concurrently 不可用
) else (
    echo [OK] concurrently 可用
)
echo.

echo [4] 检查 wait-on...
npx wait-on --help >nul 2>&1
if errorlevel 1 (
    echo [错误] wait-on 不可用
) else (
    echo [OK] wait-on 可用
)
echo.

echo [5] 检查端口 5173...
netstat -ano | findstr ":5173" >nul 2>&1
if errorlevel 1 (
    echo [OK] 端口 5173 空闲
) else (
    echo [警告] 端口 5173 被占用
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173"') do echo       进程 %%a
)
echo.

echo [6] 测试 Vite 启动...
echo       （10秒后超时）
start /B pnpm dev > vite_test.log 2>&1
timeout /t 10 /nobreak >nul
type vite_test.log
echo.

echo [7] 清理测试进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173"') do (
    taskkill /F /PID %%a >nul 2>&1
)
del vite_test.log 2>nul

echo ========================================
:end
pause
