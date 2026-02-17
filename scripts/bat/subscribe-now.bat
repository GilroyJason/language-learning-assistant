@echo off
setlocal
set ROOT_DIR=D:\german-learning-assistant

REM Import RSS list into gPodder (all)
"D:\gpodder\gpodder.exe" --subscribe "%ROOT_DIR%\scripts\rss\rss-urls-final.txt"

endlocal
