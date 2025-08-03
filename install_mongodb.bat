@echo off
echo ========================================
echo Lords Arena - MongoDB Installation
echo ========================================
echo.

echo Installing MongoDB Server...
winget install MongoDB.Server

echo.
echo Creating data directory...
if not exist "C:\data\db" mkdir "C:\data\db"

echo.
echo Starting MongoDB service...
net start MongoDB

echo.
echo MongoDB installation complete!
echo.
echo Next steps:
echo 1. Start the backend server: npm start
echo 2. Test the connection with your Android app
echo.
pause 