@echo off
chcp 65001 >nul
echo ========================================
echo   LoL Ban/Pick Simulator - 构建安装包
echo ========================================
echo.

cd /d "%~dp0"

echo [步骤 1/2] 清理旧的构建文件...
if exist "dist\" rmdir /s /q "dist"
if exist "release\" rmdir /s /q "release"

echo [步骤 2/2] 构建前端资源 + 打包 Electron 安装包...
echo.
call pnpm electron:build
if errorlevel 1 (
    echo.
    echo [错误] 构建失败！请查看上方错误信息。
    pause
    exit /b 1
)

echo.
echo ========================================
echo [完成] 构建成功！
echo ========================================
echo.
echo 构建产物目录: release\
echo   - 根目录:        NSIS 安装包 (*.exe 安装程序)
echo   - win-unpacked\: 可直接运行的免安装版本
echo.
echo 提示: 本脚本仅负责打包，不会自动运行。请手动安装或运行上述 exe。
echo.
pause
