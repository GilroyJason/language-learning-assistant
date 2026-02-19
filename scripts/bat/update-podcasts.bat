@echo off
setlocal
call "%~dp0_env.bat"

"%GPO_EXE%" update

endlocal
