@echo off
setlocal

echo ====================================
echo   Language Learning Assistant - Start
echo ====================================
echo.

echo [1/3] Start backend (http://localhost:3001) ...
start "" /MIN cmd /k "cd /d D:\german-learning-assistant && npm run server"

echo [2/3] Start frontend (http://localhost:3000) ...
start "" /MIN cmd /k "cd /d D:\german-learning-assistant && npm run dev"

echo [3/3] Open browser ...
start "" http://localhost:3000

echo.
echo Done.
