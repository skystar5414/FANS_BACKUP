# FANS 프로젝트 요구정의서
**Fast AI News Service**

---

## 1. 프로젝트 개요

### 1.1 프로젝트 정보
- **프로젝트명**: FANS (Fast AI News Service)
- **개발 기간**: 2024.09.20 ~ 2024.11.11 (약 7주)
- **팀 구성**: 4명
- **프로젝트 유형**: AI 기반 뉴스 큐레이션 서비스

### 1.2 프로젝트 목표
- AI를 활용한 뉴스 요약 및 개인화 추천 서비스 구축
- 언론사/기자별 편향성 분석을 통한 균형잡힌 뉴스 소비 지원
- DevOps 파이프라인 구축을 통한 자동화된 배포 환경 구성
- 클라우드 네이티브 아키텍처 기반 확장 가능한 시스템 설계

### 1.3 핵심 가치
- **신속성**: 실시간 뉴스 수집 및 AI 요약
- **개인화**: 사용자 행동 기반 맞춤 추천
- **신뢰성**: 편향성 분석을 통한 객관적 정보 제공
- **확장성**: 마이크로서비스 아키텍처 채택

---

## 2. 시스템 아키텍처

### 2.1 전체 아키텍처
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Main API      │    │   AI Service    │
│   React 18      │◄──►│   Express.js    │◄──►│   FastAPI       │
│  (S3 + CDN)     │    │   Port: 3000    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
            ┌─────────────┐          ┌─────────────┐
            │  PostgreSQL │          │    Redis    │
            │  Port: 5432 │          │  Port: 6379 │
            └─────────────┘          └─────────────┘

[Frontend: 정적 호스팅 / Backend: Docker 컨테이너]
```

### 2.2 기술 스택

#### Frontend (정적 배포)
- **Framework**: React 18.2.0
- **Language**: JavaScript ES6+
- **Build Tool**: Create React App 5.0.1
- **배포**: AWS S3 + CloudFront CDN
- **주요 라이브러리**: axios, react-router-dom, @mui/material

#### Backend (Docker 컨테이너)
- **Main API**: Node.js 18.19.0 LTS + Express.js 4.18.2
- **AI Service**: Python 3.11 + FastAPI 0.104.0
- **ORM**: TypeORM 0.3.20
- **Database**: PostgreSQL 15, Redis 7.0
- **컨테이너**: Docker 24.0, Docker Compose 2.20

#### Infrastructure
- **Container Orchestration**: Kubernetes 1.28 (EKS)
- **IaC**: Terraform 1.5, Ansible 2.15
- **Cloud**: AWS (VPC, EKS, RDS, S3, CloudFront, ALB)
- **Monitoring**: Prometheus + Grafana
- **CI/CD**: GitHub Actions

---

## 3. 주요 기능

### 3.1 뉴스 수집 및 관리
- 네이버 뉴스 API를 통한 실시간 뉴스 크롤링
- 중복 제거 및 메타데이터 추출
- 카테고리별 자동 분류 (정치, 경제, 사회, IT/과학 등)
- 키워드 자동 추출 및 태깅

### 3.2 AI 기반 서비스

#### 뉴스 요약
- **모델**: T5 기반 한국어 요약 모델 (Pretrained + Fine-tuning)
- **기능**: 원문 → AI 요약 (200자 이내)
- **처리**: 배치 처리 지원 (대량 뉴스 일괄 요약)
- **참고**: 시간 및 데이터 제약으로 인해 모델 성능이 제한적일 수 있음

#### 개인화 추천
- 사용자 행동 분석 (조회, 좋아요, 북마크, 읽기 시간)
- 협업 필터링 + 콘텐츠 기반 하이브리드 추천
- 실시간 추천 점수 계산 및 캐싱

#### 편향성 분석
- **대상**: 언론사 및 기자별 논조 분석
- **방법**: 텍스트 감정 분석 + 키워드 기반 편향도 측정
- **지표**: 정치적 성향 (-10 ~ +10), 신뢰도 점수
- **한계**: 학습 데이터 부족으로 초기에는 규칙 기반 분석 위주

### 3.3 사용자 기능
- 소셜 로그인 (카카오, 네이버)
- 관심 카테고리 설정
- 북마크 및 읽기 기록 관리
- 뉴스 반응 (좋아요/싫어요)

---

## 4. 데이터베이스 설계

### 4.1 주요 테이블 구조 (13개)
```sql
-- 핵심 테이블
users                 -- 사용자 정보
sources               -- 언론사 마스터
categories            -- 카테고리 마스터
news_articles         -- 뉴스 기사
keywords              -- 키워드 마스터

-- 관계 테이블
news_keywords         -- 뉴스-키워드 관계
user_actions          -- 사용자 행동 통합 로그
bookmarks             -- 북마크

-- 분석/통계 테이블
article_stats         -- 기사 통계 (조회수, 좋아요 등)
ai_recommendations    -- AI 추천 결과
bias_analysis         -- 편향성 분석 결과
user_preferences      -- 사용자 선호도 학습
```

### 4.2 성능 최적화
- `article_stats` 테이블 분리로 카운트 업데이트 성능 향상
- PostgreSQL `tsvector`를 활용한 전문 검색
- 트리거 기반 자동 집계
- 인덱스 전략 (20개 인덱스)

---

## 5. 디렉토리 구조

### 5.1 전체 구조
```
FANS/
├── frontend/                    # 🎨 React 프론트엔드 (정적 빌드)
├── backend/                     # 🔧 백엔드 서비스 (Docker)
│   ├── api/                    # Express.js REST API
│   ├── ai-service/             # Python FastAPI AI 서비스
│   └── database/               # DB 스키마 및 마이그레이션
├── infrastructure/              # 🏗️ 인프라 코드
│   ├── terraform/              # AWS 리소스 프로비저닝
│   ├── kubernetes/             # K8s 매니페스트
│   └── ansible/                # 모니터링 설치 자동화
├── .github/workflows/           # CI/CD 파이프라인
├── docker-compose.yml          # 로컬 개발 환경
└── README.md
```

### 5.2 주요 디렉토리 설명

#### Frontend (정적 파일)
```
frontend/
├── public/                     # 정적 리소스
├── src/
│   ├── components/            # 재사용 UI 컴포넌트
│   ├── pages/                 # 페이지 컴포넌트
│   ├── services/              # API 연동
│   └── hooks/                 # 커스텀 훅
└── package.json
```

#### Backend Services (Docker 컨테이너)
```
backend/
├── api/                       # Main API 서비스
│   └── src/
│       ├── entities/         # TypeORM 엔티티
│       ├── routes/           # API 엔드포인트
│       └── services/         # 비즈니스 로직
├── ai-service/               # AI 처리 서비스
│   └── app/
│       ├── models/          # AI 모델 (T5 요약기)
│       └── api/             # FastAPI 엔드포인트
└── database/                 # DB 관리
    ├── init.sql             # 테이블 생성
    └── seed.sql             # 초기 데이터
```

#### Infrastructure (IaC)
```
infrastructure/
├── terraform/
│   ├── modules/             # 재사용 가능 모듈
│   │   ├── vpc/            # 네트워크 구성
│   │   ├── eks/            # K8s 클러스터
│   │   └── rds/            # PostgreSQL
│   └── environments/        # 환경별 설정
├── kubernetes/
│   ├── deployments/         # 서비스 배포 정의
│   └── services/            # 서비스 노출 설정
└── ansible/
    └── playbooks/           # 모니터링 설치
```

---

## 6. API 명세

### 6.1 Main API (Port: 3000)

#### 뉴스 관련
- `GET /api/news` - 뉴스 목록 조회
- `GET /api/news/:id` - 뉴스 상세 조회
- `GET /api/news/trending` - 인기 뉴스
- `GET /api/search` - 뉴스 검색

#### 사용자 관련
- `POST /api/users/register` - 회원가입
- `POST /api/users/login` - 로그인
- `GET /api/users/profile` - 프로필 조회
- `POST /api/users/bookmarks` - 북마크 추가

### 6.2 AI Service (Port: 8000)

#### AI 처리
- `POST /ai/summarize` - 단일 뉴스 요약
- `POST /ai/summarize/batch` - 배치 요약
- `POST /ai/bias-analysis` - 편향성 분석
- `GET /health` - 헬스체크

---

## 7. 배포 전략

### 7.1 환경 구성
- **Development**: 로컬 Docker Compose
- **Staging**: AWS EKS 클러스터 (t3.medium)
- **Production**: AWS EKS 클러스터 (t3.large)

### 7.2 배포 프로세스
1. **Frontend**: 
   - `npm run build` → S3 업로드 → CloudFront 캐시 무효화
   - 정적 파일 서빙으로 빠른 로딩 속도

2. **Backend Services**:
   - Docker 이미지 빌드 → ECR 푸시 → K8s 롤링 업데이트
   - 무중단 배포 (Rolling Update)

### 7.3 인프라 구성
```yaml
AWS 리소스:
  - VPC: 10.0.0.0/16 (Public/Private Subnets)
  - EKS: 1.28 버전, 2-5 노드 오토스케일링
  - RDS: PostgreSQL 15, db.t3.medium
  - ElastiCache: Redis 7.0, cache.t3.micro
  - S3: 정적 파일 호스팅 (프론트엔드)
  - CloudFront: CDN 배포
  - ALB: 백엔드 서비스 로드밸런싱
```

---

## 8. 모니터링 및 로깅

### 8.1 모니터링 스택
- **Prometheus**: 메트릭 수집
- **Grafana**: 대시보드 시각화
- **AlertManager**: 알림 관리

### 8.2 주요 메트릭
- 시스템: CPU, Memory, Disk, Network
- 애플리케이션: API 응답시간, 에러율, 처리량
- 비즈니스: 활성 사용자, 뉴스 조회수, AI 처리 건수


---

## 9. 참고 자료

### 9.1 상세 파일 구조 - Frontend
```
frontend/
├── public/
│   ├── index.html                    # 루트 HTML
│   └── favicon.ico                   # 파비콘
├── src/
│   ├── index.js                      # React 진입점
│   ├── App.js                        # 라우팅 설정
│   ├── components/
│   │   ├── Header.js                 # 네비게이션 바
│   │   ├── NewsCard.js               # 뉴스 카드 컴포넌트
│   │   ├── LoadingSpinner.js         # 로딩 표시
│   │   └── SocialLogin.js            # 소셜 로그인 버튼
│   ├── pages/
│   │   ├── Home.js                   # 메인 페이지
│   │   ├── NewsDetail.js             # 뉴스 상세
│   │   ├── Search.js                 # 검색 결과
│   │   ├── Bookmarks.js              # 북마크 목록
│   │   └── Profile.js                # 사용자 프로필
│   ├── services/
│   │   ├── api.js                    # axios 인스턴스
│   │   ├── newsService.js            # 뉴스 API 호출
│   │   └── userService.js            # 사용자 API 호출
│   └── hooks/
│       ├── useFetch.js               # 데이터 페칭 훅
│       └── useInfiniteScroll.js      # 무한 스크롤
├── package.json
└── .env.example
```

### 9.2 상세 파일 구조 - Backend API
```
backend/api/
├── src/
│   ├── server.ts                     # 서버 엔트리포인트
│   ├── app.ts                        # Express 앱 설정
│   ├── config/
│   │   ├── env.ts                    # 환경변수 검증
│   │   ├── database.ts               # TypeORM 설정
│   │   └── logger.ts                 # 로깅 설정
│   ├── entities/
│   │   ├── User.ts                   # 사용자 엔티티
│   │   ├── NewsArticle.ts            # 뉴스 엔티티
│   │   ├── Source.ts                 # 언론사 엔티티
│   │   ├── Category.ts               # 카테고리 엔티티
│   │   ├── Keyword.ts                # 키워드 엔티티
│   │   ├── UserAction.ts             # 사용자 행동 엔티티
│   │   ├── Bookmark.ts               # 북마크 엔티티
│   │   ├── ArticleStat.ts            # 기사 통계 엔티티
│   │   ├── AIRecommendation.ts       # AI 추천 엔티티
│   │   ├── BiasAnalysis.ts           # 편향성 분석 엔티티
│   │   └── UserPreference.ts         # 사용자 선호도 엔티티
│   ├── routes/
│   │   ├── news.ts                   # /api/news/*
│   │   ├── users.ts                  # /api/users/*
│   │   ├── search.ts                 # /api/search
│   │   ├── bookmarks.ts              # /api/bookmarks
│   │   └── ai.ts                     # /api/ai/*
│   ├── controllers/
│   │   ├── NewsController.ts         # 뉴스 비즈니스 로직
│   │   ├── UserController.ts         # 사용자 비즈니스 로직
│   │   └── AIController.ts           # AI 서비스 연동
│   ├── services/
│   │   ├── NewsService.ts            # 뉴스 DB 작업
│   │   ├── UserService.ts            # 사용자 DB 작업
│   │   └── AIService.ts              # AI 서비스 HTTP 클라이언트
│   ├── middlewares/
│   │   ├── auth.ts                   # JWT 인증
│   │   ├── errorHandler.ts           # 에러 처리
│   │   └── rateLimit.ts              # Rate Limiting
│   └── tests/
│       ├── news.test.ts              # 뉴스 API 테스트
│       └── users.test.ts             # 사용자 API 테스트
├── package.json
├── tsconfig.json
├── Dockerfile
└── .env.example
```

### 9.3 상세 파일 구조 - AI Service
```
backend/ai-service/
├── app/
│   ├── main.py                       # FastAPI 앱 엔트리포인트
│   ├── api/
│   │   └── v1/
│   │       ├── summarize.py          # POST /ai/summarize
│   │       ├── bias.py                # POST /ai/bias-analysis
│   │       └── health.py              # GET /health
│   ├── core/
│   │   ├── config.py                 # 환경 설정
│   │   └── logging.py                # 로깅 설정
│   ├── models/
│   │   ├── t5_summarizer.py          # T5 요약 모델 래퍼
│   │   ├── bias_model.py             # 편향성 분석 모델
│   │   └── keyword_extractor.py      # 키워드 추출기
│   ├── services/
│   │   ├── summarize_service.py      # 요약 서비스 로직
│   │   └── bias_service.py           # 편향성 분석 로직
│   └── tests/
│       └── test_summarize.py         # 요약 기능 테스트
├── requirements.txt
├── Dockerfile
└── .env.example
```

### 9.4 상세 파일 구조 - Infrastructure
```
infrastructure/
├── terraform/
│   ├── main.tf                       # 메인 Terraform 구성
│   ├── variables.tf                  # 변수 정의
│   ├── outputs.tf                    # 출력 값
│   ├── modules/
│   │   ├── vpc/
│   │   │   ├── main.tf              # VPC, Subnet, IGW, NAT
│   │   │   └── variables.tf
│   │   ├── eks/
│   │   │   ├── main.tf              # EKS 클러스터
│   │   │   ├── node_groups.tf       # 워커 노드
│   │   │   └── addons.tf            # EKS 애드온
│   │   ├── rds/
│   │   │   ├── main.tf              # PostgreSQL RDS
│   │   │   └── parameter_group.tf   # DB 파라미터
│   │   ├── s3/
│   │   │   └── main.tf              # S3 버킷 (프론트엔드)
│   │   └── cloudfront/
│   │       └── main.tf              # CDN 배포
│   └── environments/
│       ├── dev.tfvars               # 개발 환경 변수
│       └── prod.tfvars              # 운영 환경 변수
│
├── kubernetes/
│   ├── deployments/
│   │   ├── api-deployment.yaml      # Main API 배포
│   │   └── ai-deployment.yaml       # AI Service 배포
│   ├── services/
│   │   ├── api-service.yaml         # API 서비스
│   │   └── ai-service.yaml          # AI 서비스
│   ├── ingress/
│   │   └── main-ingress.yaml        # Ingress 규칙
│   └── configmaps/
│       └── api-config.yaml          # 설정 맵
│
└── ansible/
    ├── playbooks/
    │   ├── monitoring.yml            # Prometheus/Grafana 설치
    │   └── logging.yml               # ELK 스택 설치
    ├── inventories/
    │   └── hosts.yml                # 서버 인벤토리
    └── roles/
        ├── prometheus/               # Prometheus 역할
        └── grafana/                  # Grafana 역할
```

---

## 10. 결론

FANS 프로젝트는 AI 기반 뉴스 서비스와 DevOps 인프라 구축을 균형있게 구현하는 것을 목표로 합니다. 프론트엔드는 정적 파일로 배포하여 성능을 최적화하고, 백엔드 서비스는 Docker 컨테이너로 구성하여 확장성을 확보합니다. 

제한된 시간과 리소스를 고려하여 MVP 중심으로 개발하되, 확장 가능한 아키텍처를 기반으로 단계적 고도화가 가능하도록 설계하였습니다.

---

*작성일: 2024년 9월 20일*  
*버전: 1.0*