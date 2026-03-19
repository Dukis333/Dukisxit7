# Creditos:
# Email: marcosxxt658@gmail.com
# WhatsApp: https://wa.me/5593981160223
# Instagram: @marcos_xll77

$port = 5173
if (Get-Command python -ErrorAction SilentlyContinue) {
  python -m http.server $port
  exit 0
}
if (Get-Command py -ErrorAction SilentlyContinue) {
  py -m http.server $port
  exit 0
}
if (Get-Command php -ErrorAction SilentlyContinue) {
  php -S "localhost:$port"
  exit 0
}
if (Get-Command node -ErrorAction SilentlyContinue) {
  $env:PORT = $port
  node "C:\Users\dk\Desktop\meu portofoilio\serve.js"
  exit 0
}
Write-Host "Python, PHP ou Node nao encontrados. Instale algum ou abra o index.html diretamente."
