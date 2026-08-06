@echo off
echo Starting LegalSathi AI Backend on http://localhost:8000 ...
cd /d "%~dp0backend"
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
