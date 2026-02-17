@echo off
echo ====================================
echo    播客RSS订阅
echo ====================================
echo.
echo RSS源:
echo 1. Slow German - https://slowgerman.com/feed/podcast
echo 2. DW慢速新闻 - https://rss.dw.com/xml/dkpodcast_lgn_de
echo 3. Easy English - https://www.easyenglish.fm/rss
echo.
echo 正在打开gPodder和RSS列表...
echo.
start /b notepad.exe "D:\german-learning-assistant\rss-urls-final.txt"
start /d/gpodder/bin/gpodder.exe
echo.
echo ✅ 已打开
