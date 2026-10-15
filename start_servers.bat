@echo off
chcp 65001 > nul
echo ========================================================
echo   ChronosLife 서버 기동 스크립트
echo ========================================================
echo.

echo [1/2] 백엔드 서버(FastAPI: 8080) 시작 중...
start "ChronosLife Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload"

echo [2/2] 프론트엔드 서버(Next.js: 3000) 시작 중...
start "ChronosLife Frontend (Next.js)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo   모든 서버가 새 창에서 기동되었습니다!
echo   - 프론트엔드: http://localhost:3000/ja
echo   - 백엔드 API: http://localhost:8080/docs
echo ========================================================
echo.
pause
