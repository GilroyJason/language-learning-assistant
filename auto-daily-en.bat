@echo off
setlocal
chcp 65001 >nul

set LANGUAGE_FILTER=en

echo ====================================
echo   English Learning Daily Workflow (EN)
echo ====================================
echo.

echo [Step 1/4] Update gPodder...
call D:\german-learning-assistant\update-podcasts.bat
echo.

echo [Step 2/4] Check Whisper...
python -c "import whisper" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Whisper not installed. Installing...
    pip install openai-whisper
    echo Whisper installed.
) else (
    echo Whisper already installed.
)

echo.
echo [Step 3/4] Generate subtitles and practice sets (EN)...
python D:\german-learning-assistant\generate-subtitles.py

if %ERRORLEVEL% EQU 0 (
    echo Practice set generation done.
    echo.
    echo [Cleanup] Clear gPodder download audio files...
    for /r "C:\Users\ZHAO JUNJIE\Documents\gPodder\Downloads" %%f in (*.mp3 *.m4a *.wav *.ogg *.opus *.mp4) do del /q "%%f"
) else (
    echo Practice set generation failed.
    exit /b 1
)

echo.
echo [Step 4/4] Open learning app...
start http://localhost:3000

echo.
echo ====================================
echo   All done
echo ====================================
echo.
echo Practice sets: D:\german-learning-assistant\practice-sets\
echo App: http://localhost:3000
echo.
echo Tip: Refresh the browser to see new practice sets.
