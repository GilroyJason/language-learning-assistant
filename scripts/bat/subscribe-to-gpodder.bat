@echo off
setlocal
set ROOT_DIR=D:\german-learning-assistant

"D:\gpodder\gpodder.exe" --subscribe "%ROOT_DIR%\scripts\rss\rss-urls-final.txt"

endlocal
