@echo off
echo ====================================
echo    English RSS Subscriptions
echo ====================================
echo.
echo RSS sources:
echo 1. Easy English - https://www.easyenglish.fm/rss
echo.
echo Opening gPodder and RSS list...
echo.
start /b notepad.exe "D:\german-learning-assistant\rss-urls-english.txt"
start /d/gpodder/bin/gpodder.exe
echo.
echo Done.
