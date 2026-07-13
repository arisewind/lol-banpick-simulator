@echo off
chcp 65001 >nul
echo ========================================
echo   LoL Ban/Pick Simulator - 构建并运行
echo ========================================
echo.

cd /d "%~dp0"

echo [步骤 1/3] 清理旧的构建文件...
if exist "dist\" rmdir /s /q "dist"
if exist "release\" rmdir /s /q "release"

echo [步骤 2/3] 构建前端资源...
call pnpm build
if errorlevel 1 (
    echo [错误] 构建失败！
    pause
    exit /b 1
)

echo [步骤 3/3] 构建并运行 Electron 应用...
call pnpm electron:build

echo.
echo ========================================
echo [完成] 构建完成！
echo.
echo 安装包位置: release\
echo.
pause
