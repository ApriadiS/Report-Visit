@echo off
:menu
cls
echo =========================================
echo       REPORT VISIT AUTOMATION TOOL
echo =========================================
echo.
echo Pilih aksi yang ingin dijalankan:
echo [1] Buka Chrome (Remote Debugging Port 9222)
echo [2] Generate CSV dari Foto (Python)
echo [3] Jalankan Automasi Google Form (Node.js)
echo [4] Keluar
echo.

choice /C 1234 /N /M "Masukkan angka (1/2/3/4): "
set pilihan=%errorlevel%

if "%pilihan%"=="1" (
    echo Membuka Chrome di latar belakang...
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="%~dp0data\profile"
    timeout /t 2 >nul
    goto menu
) else if "%pilihan%"=="2" (
    echo Menjalankan script Python...
    "C:\Users\MSI A12VE\.conda\envs\Report-Visit\python.exe" "%~dp0src\python\generate_csv.py"
    echo.
    pause
    goto menu
)else if "%pilihan%"=="3" (
    echo Menjalankan script Node.js...
    node "%~dp0src\js\main.js"
    echo.
    pause
    goto menu
) else if "%pilihan%"=="4" (
    exit
) else (
    echo Pilihan tidak valid.
    pause
    goto menu
)