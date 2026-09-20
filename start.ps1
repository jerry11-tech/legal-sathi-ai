
# Check if Docker is running
if (-not (docker info 2>$null)) {
    Write-Host "Error: Docker Desktop is not running. Please start it." -ForegroundColor Red
    exit 1
}

Write-Host "Starting LegalSathi AI..." -ForegroundColor Green
docker compose up -d --build

Write-Host "--------------------------------" -ForegroundColor Cyan
Write-Host "LegalSathi AI is running:" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "--------------------------------" -ForegroundColor Cyan
