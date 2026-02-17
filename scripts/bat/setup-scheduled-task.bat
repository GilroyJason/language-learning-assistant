@echo off
setlocal
set ROOT_DIR=D:\german-learning-assistant

schtasks /create /tn "gPodder每日更新" /tr "%ROOT_DIR%\scripts\bat\update-podcasts.bat" /sc daily /st 02:00 /f
if %ERRORLEVEL%==0 (
    echo [OK] 计划任务已创建
    echo 运行脚本: %ROOT_DIR%\scripts\bat\update-podcasts.bat
) else (
    echo [ERROR] 创建任务失败
)

pause
endlocal
