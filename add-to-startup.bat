@echo off
:: ──────────────────────────────────────────────────────────────────────────────
:: Board Exam 2083 Widget – Windows Startup Installer
:: Run this script ONCE. It adds the widget to Windows startup so it launches
:: automatically every time you log in.
:: ──────────────────────────────────────────────────────────────────────────────

setlocal EnableDelayedExpansion

:: Get the directory where this .bat file lives (the project root)
set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

:: The startup folder for the current user
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

:: Path to the target shortcut
set "SHORTCUT=%STARTUP%\BoardExam2083Widget.lnk"

:: Create a VBScript to make the shortcut (PowerShell alternative below)
set "VBS=%TEMP%\make_shortcut.vbs"

echo Set oWS = WScript.CreateObject("WScript.Shell") > "%VBS%"
echo sLinkFile = "%SHORTCUT%" >> "%VBS%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%VBS%"
echo oLink.TargetPath = "cmd.exe" >> "%VBS%"
echo oLink.Arguments = "/c cd /d ""%PROJECT_DIR%"" && npx electron . --no-sandbox" >> "%VBS%"
echo oLink.WorkingDirectory = "%PROJECT_DIR%" >> "%VBS%"
echo oLink.WindowStyle = 7 >> "%VBS%"
echo oLink.Description = "Board Exam 2083 Countdown Widget" >> "%VBS%"
echo oLink.Save >> "%VBS%"

cscript //nologo "%VBS%"
del "%VBS%"

echo.
echo ✅ Startup shortcut created successfully!
echo    Location: %SHORTCUT%
echo.
echo    The widget will now launch automatically every time you log in to Windows.
echo    To remove it from startup, just delete:
echo    %SHORTCUT%
echo.
pause
