<#
run-and-verify.ps1
Script de ayuda para Windows PowerShell que:
- Pide tu App Password de Gmail (no lo guarda en ficheros)
- Ejecuta verify (comprueba credenciales SMTP)
- Arranca el servidor con las variables de entorno en una nueva ventana
- Envía una petición de prueba al endpoint /enviar-consulta
- Muestra las últimas líneas de enviados.log

USO: desde PowerShell (en la carpeta del proyecto):
  powershell -ExecutionPolicy Bypass -File .\run-and-verify.ps1

Nota: debes ejecutar este script en la máquina local (no lo ejecutes en un entorno remoto sin entenderlo).
#>

param()

Write-Host "Este script pedirá tu App Password y realizará la verificación y prueba automática." -ForegroundColor Cyan

# Pedir App Password de forma segura
$secure = Read-Host -Prompt 'Introduce tu App Password de Gmail (se ocultará la entrada)' -AsSecureString
if (-not $secure) { Write-Error 'No se proporcionó contraseña. Abortando.'; exit 2 }

# Convertir SecureString a texto plano solo en memoria
[void][System.Reflection.Assembly]::LoadWithPartialName('System.Runtime.InteropServices')
$ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
$plainPass = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)

$emailUser = 'mercedesmfisioterapia@gmail.com'

Write-Host "Usando cuenta: $emailUser" -ForegroundColor Yellow

Write-Host "1) Verificando credenciales SMTP..." -NoNewline; Write-Host " (esto ejecuta 'npm run verify')"

# Ejecutar verify con variables de entorno en la misma invocación de cmd
$verifyCmd = "set EMAIL_USER=$emailUser && set EMAIL_PASS=$plainPass && npm run verify"
$verifyResult = & cmd /c $verifyCmd

if ($LASTEXITCODE -ne 0) {
  Write-Host "\nLa verificación falló. Salida:" -ForegroundColor Red
  Write-Host $verifyResult
  Write-Host "Comprueba que la App Password es correcta y que la cuenta tiene 2FA activado." -ForegroundColor Yellow
  exit 11
}

Write-Host "\nVerificación OK. Ahora arrancaremos el servidor en segundo plano con las mismas variables de entorno." -ForegroundColor Green

# Detener proceso que escuche en el puerto 3000 (si existe)
try {
  $conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
  if ($conn) {
    $pid = $conn.OwningProcess
    Write-Host "Encontrado proceso en puerto 3000 (PID: $pid). Intentando detenerlo..." -ForegroundColor Yellow
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
  }
} catch {
  # Get-NetTCPConnection puede no estar disponible en algunas versiones de PowerShell; ignorar si falla
}

# Iniciar servidor en nueva ventana con las variables (cmd /c permite pasar env vars solo para ese proceso)
$startCmd = "set EMAIL_USER=$emailUser && set EMAIL_PASS=$plainPass && npm start"
Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', $startCmd -WindowStyle Minimized

Write-Host "Servidor iniciado (se abrió en una ventana separada). Esperando 3 segundos para que arranque..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

Write-Host "Enviando una petición de prueba al endpoint /enviar-consulta..." -ForegroundColor Cyan

$body = @{ nombre='ScriptTest'; email='prueba@example.com'; telefono='600000000'; horario='Mañana'; mensaje='Mensaje de prueba enviado por run-and-verify.ps1' } | ConvertTo-Json
try {
  $response = Invoke-RestMethod -Uri http://localhost:3000/enviar-consulta -Method POST -Body $body -ContentType 'application/json' -TimeoutSec 10
  Write-Host "Respuesta del servidor:" -ForegroundColor Green
  $response | ConvertTo-Json | Write-Host
} catch {
  Write-Host "Error al enviar la petición de prueba:" -ForegroundColor Red
  Write-Host $_.Exception.Message
}

Start-Sleep -Seconds 1

Write-Host "\nContenido reciente de 'enviados.log':" -ForegroundColor Cyan
if (Test-Path .\enviados.log) {
  Get-Content .\enviados.log -Tail 50 | ForEach-Object { Write-Host $_ }
} else {
  Write-Host "No existe enviado.log todavía. Si el servidor no ha recibido peticiones, no se habrá creado." -ForegroundColor Yellow
}

Write-Host "\nProceso terminado. Si la verificación fue OK y el log muestra OK, el correo debería haber llegado." -ForegroundColor Green
