@echo off
echo ====================================
echo   设置每日自动学习工作流
echo ====================================
echo.

REM 创建每天凌晨3点运行的任务
schtasks /create /tn "GermanLearningDailyWorkflow" /tr "D:\german-learning-assistant\auto-daily.bat" /sc daily /st 03:00 /f

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 成功创建计划任务！
    echo.
    echo 任务名称: GermanLearningDailyWorkflow
    echo 运行时间: 每天凌晨3点
    echo 运行脚本: D:\german-learning-assistant\auto-daily.bat
    echo.
    echo 你可以在"任务计划程序"中修改时间
    echo.
) else (
    echo.
    echo ❌ 创建任务失败，请以管理员身份运行此脚本
    echo.
)

pause
