@echo off
echo ====================================
echo   安装 FFmpeg (Whisper需要)
echo ====================================
echo.

echo 正在下载 FFmpeg...
echo.

REM 下载FFmpeg（静态构建版本）
set FFMPEG_URL=https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
set FFMPEG_ZIP=%TEMP%\ffmpeg.zip

echo 下载中...
powershell -Command "& {Invoke-WebRequest -Uri '%FFMPEG_URL%' -OutFile '%FFMPEG_ZIP%'}"

if %ERRORLEVEL% NEQ 0 (
    echo 下载失败，请手动安装：
    echo 1. 访问: https://www.gyan.dev/ffmpeg/builds/
    echo 2. 下载 ffmpeg-release-essentials.zip
    echo 3. 解压到 C:\ffmpeg
    echo 4. 添加 C:\ffmpeg\bin 到系统PATH
    pause
    exit /b 1
)

echo 解压中...
powershell -Command "& {Expand-Archive -Path '%FFMPEG_ZIP%' -DestinationPath 'C:\' -Force}"

echo.
echo ====================================
echo   FFmpeg 已安装到 C:\ffmpeg
echo ====================================
echo.
echo 下一步：
echo 1. 将 C:\ffmpeg\bin 添加到系统PATH
echo 2. 重启命令提示符
echo 3. 运行: python generate-subtitles.py
echo.
pause
