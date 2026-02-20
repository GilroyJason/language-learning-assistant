@echo off
setlocal
set CONTAINER=libretranslate-local

where docker >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Docker not found. Please install Docker Desktop.
  exit /b 1
)

for /f "delims=" %%i in ('docker ps -a --format "{{.Names}}" ^| findstr /i "%CONTAINER%"') do set FOUND=1

if not defined FOUND (
  docker run -d --name %CONTAINER% -p 5000:5000 libretranslate/libretranslate
  if errorlevel 1 exit /b 1
) else (
  docker start %CONTAINER%
  if errorlevel 1 exit /b 1
)

echo [OK] LibreTranslate running at http://localhost:5000
endlocal
