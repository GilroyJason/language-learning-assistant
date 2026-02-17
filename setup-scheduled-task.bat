@echo off
echo ====================================
echo   设置gPodder自动更新任务
echo ====================================
echo.

REM 创建每天凌晨2点运行的任务
schtasks /create /tn "gPodder每日更新" /tr "D:\german-learning-assistant\update-podcasts.bat" /sc daily /st 02:00 /f

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 成功创建计划任务！
    echo.
    echo 任务名称: gPodder每日更新
    echo 运行时间: 每天凌晨2点
    echo 运行脚本: D:\german-learning-assistant\update-podcasts.bat
    echo.
    echo 你可以在"任务计划程序"中修改时间
    echo.
) else (
    echo.
    echo ❌ 创建任务失败，请以管理员身份运行此脚本
    echo.
)

pause
