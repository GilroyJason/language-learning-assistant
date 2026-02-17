@echo off
echo ====================================
echo    German RSS Subscriptions
echo ====================================
echo.
echo RSS sources:
echo 1. Slow German - https://slowgerman.com/feed/podcast
echo 2. DW慢速新闻 - https://rss.dw.com/xml/dkpodcast_lgn_de
echo.
echo Opening gPodder and RSS list...
echo.
start /b notepad.exe "D:\german-learning-assistant\rss-urls-german.txt"
start /d/gpodder/bin/gpodder.exe
echo.
echo Done.
