@echo off
setlocal
call "%~dp0_env.bat"

"%GPODDER_CMD_EXE%" --subscribe "%ROOT_DIR%\scripts\rss\rss-urls-final.txt"

endlocal
