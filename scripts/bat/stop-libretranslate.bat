@echo off
setlocal
set CONTAINER=libretranslate-local

where docker >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Docker not found. Please install Docker Desktop.
  exit /b 1
)

docker stop %CONTAINER%
if errorlevel 1 exit /b 1

echo [OK] LibreTranslate stopped.
endlocal
