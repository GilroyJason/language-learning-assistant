@echo off
setlocal
set ROOT_DIR=D:\german-learning-assistant

schtasks /create /tn "GermanLearningDailyWorkflow" /tr "%ROOT_DIR%\scripts\bat\auto-daily.bat" /sc daily /st 03:00 /f
if %ERRORLEVEL%==0 (
    echo [OK] 计划任务已创建
    echo 运行脚本: %ROOT_DIR%\scripts\bat\auto-daily.bat
) else (
    echo [ERROR] 创建任务失败
)

pause
endlocal
