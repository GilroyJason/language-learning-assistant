@echo off
setlocal
set ROOT_DIR=D:\german-learning-assistant
set GPO_EXE=D:\gPodder\bin\gpo.exe
set GPODDER_CMD_EXE=D:\gPodder\bin\gpodder-cmd.exe

if exist "%ROOT_DIR%\scripts\gpo-path.txt" (
  set /p GPO_EXE=<"%ROOT_DIR%\scripts\gpo-path.txt"
)
if exist "%ROOT_DIR%\scripts\gpodder-cmd-path.txt" (
  set /p GPODDER_CMD_EXE=<"%ROOT_DIR%\scripts\gpodder-cmd-path.txt"
)

if not exist "%GPO_EXE%" (
  echo [ERROR] gpo.exe not found: %GPO_EXE%
  echo Create %ROOT_DIR%\scripts\gpo-path.txt with the full path to gpo.exe
  exit /b 1
)
if not exist "%GPODDER_CMD_EXE%" (
  echo [ERROR] gpodder-cmd.exe not found: %GPODDER_CMD_EXE%
  echo Create %ROOT_DIR%\scripts\gpodder-cmd-path.txt with the full path to gpodder-cmd.exe
  exit /b 1
)

endlocal & set ROOT_DIR=%ROOT_DIR% & set GPO_EXE=%GPO_EXE% & set GPODDER_CMD_EXE=%GPODDER_CMD_EXE%
