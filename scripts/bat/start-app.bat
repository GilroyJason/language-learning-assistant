@echo off
setlocal
set ROOT_DIR=D:\german-learning-assistant

start "LLA Backend" /min cmd /c "cd /d %ROOT_DIR% && npm run server"
start "LLA Frontend" /min cmd /c "cd /d %ROOT_DIR% && npm run dev"

start "LLA App" http://localhost:3000

endlocal
