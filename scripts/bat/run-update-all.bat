@echo off
setlocal
set ROOT_DIR=D:\german-learning-assistant

if not exist "%ROOT_DIR%\scripts\bat\update-podcasts.bat" (
  echo [ERROR] Missing update script.
  exit /b 1
)

call "%ROOT_DIR%\scripts\bat\update-podcasts.bat"

endlocal
