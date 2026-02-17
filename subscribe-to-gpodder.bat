@echo off
echo ====================================
echo    gPodder 订阅助手
echo ====================================
echo.
echo 正在打开RSS列表文件...
echo.
echo 请按以下步骤操作：
echo.
echo 1. 打开gPodder (如果没有自动打开)
echo 2. 按 Ctrl+U 打开"添加播客"
echo 3. 复制下面的URL粘贴进去
echo.
echo -----------------------------------
echo.
start /b notepad.exe "D:\german-learning-assistant\rss-urls-final.txt"
start /d/gpodder/bin/gpodder.exe
echo.
echo ✅ 已打开gPodder和RSS列表
echo.
pause
