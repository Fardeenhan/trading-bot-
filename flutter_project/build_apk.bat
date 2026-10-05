@echo off
echo ===================================================
echo   Fardeen Trading Terminal - 1-Click Build APK
echo ===================================================
echo Building Signed Release APK...
flutter build apk --release
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================================
    echo   BUILD SUCCESSFUL!
    echo   APK Location: build\app\outputs\flutter-apk\app-release.apk
    echo ===================================================
) else (
    echo.
    echo [ERROR] Build failed. Please verify Android SDK is configured.
)
pause
