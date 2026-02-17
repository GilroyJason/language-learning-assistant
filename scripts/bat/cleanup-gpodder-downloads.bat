@echo off
setlocal
set ROOT_DIR=D:\german-learning-assistant

REM Clean downloaded audio after successful processing
for /d %%D in ("C:\Users\ZHAO JUNJIE\Documents\gPodder\Downloads\*") do (
  del /q "%%D\*.mp3" "%%D\*.m4a" "%%D\*.aac" "%%D\*.ogg" 2>nul
)

endlocal
