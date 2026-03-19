@echo off
:: Creditos:
:: Email: marcosxxt658@gmail.com
:: WhatsApp: https://wa.me/5593981160223
:: Instagram: @marcos_xll77

setlocal
set PORT=5173

where python >nul 2>nul
if %errorlevel%==0 (
  python -m http.server %PORT%
  goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server %PORT%
  goto :eof
)

where php >nul 2>nul
if %errorlevel%==0 (
  php -S localhost:%PORT%
  goto :eof
)

where node >nul 2>nul
if %errorlevel%==0 (
  set PORT=%PORT%
  node "%~dp0serve.js"
  goto :eof
)

echo Python, PHP ou Node nao encontrados. Instale algum ou abra o index.html diretamente.
pause
