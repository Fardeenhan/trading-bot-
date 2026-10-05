@echo off
echo ===================================================
echo   Fardeen Trading Terminal - 1-Click Run on PC
echo ===================================================
echo Checking Flutter installation...
where flutter >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Flutter SDK not found in PATH!
    echo Please install Flutter or add Flutter bin folder to your PATH.
    pause
    exit /b 1
)

echo.
echo Launching Fardeen Trading Terminal on PC Chrome...
flutter run -d chrome --web-renderer canvaskit
pause
