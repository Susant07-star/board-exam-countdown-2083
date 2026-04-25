@echo off
color 0B
echo ==============================================
echo       Pushing Notes to Website...
echo ==============================================
echo.

:: Navigate to the directory where the batch file is located
cd /d "%~dp0"

:: Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in your PATH.
    echo Cannot push notes to the website.
    pause
    exit /b
)

:: Add all changes (including new notes)
echo [1/3] Adding new files...
git add .

:: Commit the changes
echo [2/3] Committing changes...
git commit -m "Auto-update notes and files"

:: Push to GitHub
echo [3/3] Pushing to GitHub...
git push

if %errorlevel% equ 0 (
    echo.
    echo ==============================================
    echo  SUCCESS! Your notes have been sent to GitHub.
    echo  Netlify will update your website shortly.
    echo ==============================================
) else (
    echo.
    echo ==============================================
    echo  ERROR: Failed to push to GitHub.
    echo  Please check your internet connection or git status.
    echo  (If it says "nothing to commit", it means your files are already up to date!)
    echo ==============================================
)

echo.
pause
