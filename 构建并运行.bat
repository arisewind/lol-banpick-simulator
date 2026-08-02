@echo off
chcp 65001 >nul
setlocal enableextensions

REM ============================================================
REM  LoL Ban/Pick Simulator - 构建安装包并运行
REM  步骤: 清理旧产物 -> 构建前端 -> 打包 Electron -> (可选)运行
REM  产物: release\ 目录(NSIS 安装包 + win-unpacked 免安装版)
REM ============================================================

cd /d "%~dp0"

echo.
echo ============================================================
echo   LoL Ban/Pick Simulator - Build ^& Run
echo ============================================================
echo.

REM ---- 取消可能阻碍 Electron 的环境变量 ----
set "ELECTRON_RUN_AS_NODE="

REM ---- 前置检查: pnpm ----
where pnpm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] 未检测到 pnpm。请先安装 Node.js 和 pnpm。
    echo         npm install -g pnpm
    pause
    exit /b 1
)

REM ---- 前置检查: node_modules ----
if not exist "node_modules\" (
    echo [ERROR] 缺少依赖。请先运行 启动开发环境.bat 或执行 pnpm install。
    pause
    exit /b 1
)

REM ---- 步骤 1/3: 清理旧产物 ----
echo [1/3] 清理旧构建产物...
if exist "release\" (
    rmdir /s /q "release"
    if errorlevel 1 (
        echo [ERROR] 无法清理 release\ 目录，可能有文件被占用。
        pause
        exit /b 1
    )
)
if exist "build\" (
    rmdir /s /q "build"
)
echo       完成。
echo.

REM ---- 步骤 2/3: 构建(类型检查 + Vite 打包 + electron-builder) ----
echo [2/3] 构建前端资源 + 打包 Electron 安装包...
echo       (此过程耗时较长，请耐心等待)
echo.
call pnpm electron:build
if errorlevel 1 (
    echo.
    echo ============================================================
    echo   [ERROR] 构建失败！请查看上方错误信息。
    echo ============================================================
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   [OK] 构建成功！
echo ============================================================
echo.
echo   产物目录: release\
echo     - 根目录:        NSIS 安装包 (*.exe 安装程序)
echo     - win-unpacked\: 可直接运行的免安装版本
echo.

REM ---- 步骤 3/3: 询问是否运行免安装版 ----
if not exist "release\win-unpacked\" goto :done

set /p "RUN=是否立即运行免安装版本? (Y/N): "
if /i "%RUN%"=="Y" (
    echo.
    echo [3/3] 启动免安装版本...
    for %%f in ("release\win-unpacked\*.exe") do (
        start "" "%%f"
        echo       已启动: %%~nxf
        goto :done
    )
    echo [WARN] 未在 release\win-unpacked\ 找到 exe。
)

:done
echo.
echo ============================================================
echo   完成
echo ============================================================
echo.
pause
endlocal
