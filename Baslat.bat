@echo off
chcp 65001 >nul
title Mimari Proje ve Ofis Arşivi Sunucusu
color 0B

echo.
echo ===================================================================
echo     MİMARİ PROJE VE OFİS GÖREV ARŞİVİ - AĞ SUNUCUSU
echo ===================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [HATA] Node.js bu bilgisayarda kurulu bulunamadı!
    echo Lütfen https://nodejs.org adresinden Node.js indirip kurun.
    echo.
    pause
    exit /b
)

if not exist "node_modules\" (
    echo [BILGI] Gerekli paketler kuruluyor, lütfen birkaç saniye bekleyin...
    call npm install
    echo.
)

echo [BILGI] Sunucu başlatılıyor...
echo [BILGI] Tarayıcı otomatik açılıyor...
start http://localhost:3000

echo.
node server.js
pause
