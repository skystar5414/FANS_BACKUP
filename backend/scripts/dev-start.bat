@echo off
echo 🚀 FANS 백엔드 개발환경 시작...

REM Docker가 실행 중인지 확인
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker가 실행되지 않았습니다. Docker Desktop을 실행해주세요.
    pause
    exit /b 1
)

REM 개발환경 컨테이너 시작 (PostgreSQL + API Dev)
echo 📦 개발환경 컨테이너 시작 중...
docker-compose --profile dev up -d postgres
echo ⏳ PostgreSQL 컨테이너가 준비될 때까지 대기 중...
timeout /t 10 /nobreak >nul
docker-compose --profile dev up -d api-dev

echo.
echo ✅ 개발환경이 시작되었습니다!
echo 📊 API 서버: http://localhost:3000
echo 🗄️  PostgreSQL: localhost:5432
echo.
echo 🔧 유용한 명령어:
echo   로그 확인: docker-compose logs -f api-dev
echo   컨테이너 중지: dev-stop.bat
echo   데이터베이스 초기화: docker-compose down -v ^&^& docker-compose --profile dev up -d
echo.
pause