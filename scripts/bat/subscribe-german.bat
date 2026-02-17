@echo off
setlocal
set ROOT_DIR=D:\german-learning-assistant

REM Import RSS list into gPodder (German)
"D:\gpodder\gpodder.exe" --subscribe "%ROOT_DIR%\scripts\rss\rss-urls-german.txt"

endlocal
