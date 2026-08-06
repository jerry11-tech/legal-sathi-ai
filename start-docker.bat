@echo off
echo Starting LegalSathi AI with Docker Compose...
docker compose up --build 2>nul || docker-compose up --build
pause
