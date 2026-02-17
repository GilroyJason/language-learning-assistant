@echo off
setlocal
set ROOT_DIR=D:\german-learning-assistant

set LANGUAGE_FILTER=en
call "%ROOT_DIR%\scripts\bat\update-podcasts.bat"
if errorlevel 1 exit /b 1

python "%ROOT_DIR%\scripts\generate-subtitles.py"
if errorlevel 1 exit /b 1

call "%ROOT_DIR%\scripts\bat\cleanup-gpodder-downloads.bat"

endlocal
