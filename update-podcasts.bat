@echo off
echo ====================================
echo   gPodder 自动更新播客
echo ====================================
echo.

echo [%date% %time%] 开始更新播客...
echo.

REM 设置gPodder路径
set GPODDER=D:\gpodder\bin\gpodder.exe

REM 检查gPodder是否在运行
tasklist /FI "IMAGENAME eq gpodder.exe" 2>NUL | find /I /N "gpodder.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo gPodder正在运行，发送更新信号...
    REM 使用gpo命令行工具更新
    D:\gpodder\bin\gpo.exe update
) else (
    echo gPodder未运行，启动并更新...
    start /WAIT "" %GPODDER% --update-only
)

echo.
echo [%date% %time%] 播客更新完成
echo.
echo 已下载的音频位于：
echo C:\Users\ZHAO JUNJIE\Documents\gPodder\Downloads\
echo.

timeout /t 3
