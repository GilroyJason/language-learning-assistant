@echo off
echo ====================================
echo   播客更新 + 字幕下载
echo ====================================
echo.

echo [步骤 1/2] 更新gPodder播客...
call D:\german-learning-assistant\update-podcasts.bat
echo.

echo [步骤 2/2] 下载字幕文件...
python D:\german-learning-assistant\download-dw-transcripts.py
echo.

echo ✅ 全部完成！
echo.
pause
