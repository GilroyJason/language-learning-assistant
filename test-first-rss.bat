@echo off
echo ====================================
echo    快速订阅：DW慢速新闻
echo ====================================
echo.
echo 正在打开gPodder并复制RSS地址...
echo.
echo RSS: https://rss.dw.com/xml/dkpodcast_lgn_de
echo.
echo 请在gPodder中：
echo 1. 按 Ctrl+U 打开"添加播客"
echo 2. 粘贴上面的RSS地址
echo 3. 点击"添加"
echo 4. 点击"下载"按钮
echo.
echo -----------------------------------
echo.
echo 现在会将RSS复制到剪贴板...
echo https://rss.dw.com/xml/dkpodcast_lgn_de | clip
start /d/gpodder/bin/gpodder.exe
echo.
echo ✅ 已启动gPodder
echo.
pause
