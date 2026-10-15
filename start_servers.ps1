Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  ChronosLife 서버 기동 스크립트" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] 백엔드 서버(FastAPI: 8080) 시작 중..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\backend'; python -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload"

Write-Host "[2/2] 프론트엔드 서버(Next.js: 3000) 시작 중..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\frontend'; npm run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  모든 서버가 새 창에서 기동되었습니다!" -ForegroundColor Green
Write-Host "  - 프론트엔드: http://localhost:3000/ja" -ForegroundColor White
Write-Host "  - 백엔드 API: http://localhost:8080/docs" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green
