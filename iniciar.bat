@echo off
echo Iniciando Ruleta de Regalos...

:: Inicia el servidor Next.js en una ventana separada
start "Servidor Next.js" cmd /k "cd /d C:\ruleta && npm run dev"

:: Espera 5 segundos a que el servidor arranque
timeout /t 5 /nobreak > nul

:: Inicia el lector de VLC en otra ventana
::start "VLC Now Playing" cmd /k "cd /d C:\ruleta && node scripts/vlc-now-playing.js"

:: Descomenta la siguiente linea si usas Spotify en vez de VLC:
start "Spotify Now Playing" cmd /k "cd /d C:\ruleta && node scripts/spotify-now-playing.js"

:: Inicia la conexion con TikTok Live
start "TikTok Live" cmd /k "cd /d C:\ruleta && node scripts/tiktok-connect.js"

:: Abre el navegador
timeout /t 3 /nobreak > nul
start http://localhost:3000

echo Todo iniciado. Podes cerrar esta ventana.
