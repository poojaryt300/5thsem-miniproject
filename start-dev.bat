@echo off
title Campus TechCare - Smart Campus Maintenance
echo ========================================================
echo   Campus TechCare - Development Server Launcher
echo ========================================================
echo.
echo Starting Backend API server on http://localhost:5000 (and 5001) ...
start "Campus TechCare Backend (Port 5000)" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo Starting Frontend Web App on http://localhost:3000 ...
start "Campus TechCare Frontend (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Servers successfully launched in new windows!
echo - Web App: http://localhost:3000
echo - API:     http://localhost:5000 (and 5001)


