@echo off
echo ====================================
echo   德语学习系统 - 快速启动
echo ====================================
echo.

echo [1/4] 检查后端服务...
curl -s http://localhost:3000/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ 后端运行中
) else (
    echo ❌ 后端未运行，正在启动...
    start /B cmd /c "cd /d D:\german-learning-assistant && npm run server"
    timeout /t 5 >nul
)

echo.
echo [2/4] 检查前端服务...
curl -s http://localhost:3003 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ 前端运行中
) else (
    echo ⚠️  前端未运行
    echo    请在另一个终端运行: npm run dev
)

echo.
echo [3/4] 更新播客和字幕...
echo 是否现在更新？ (Y/N)
set /p choice=
if /i "%choice%"=="Y" (
    call D:\german-learning-assistant\run-update-all.bat
)

echo.
echo [4/4] 打开浏览器...
start http://localhost:3003

echo.
echo ✅ 完成！
echo.
echo 📖 使用说明:
echo    - 浏览器: http://localhost:3003
echo    - 音频目录: C:\Users\ZHAO JUNJIE\Documents\gPodder\Downloads
echo    - 运行更新: D:\german-learning-assistant\run-update-all.bat
echo.
pause
