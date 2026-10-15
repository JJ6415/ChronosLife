#!/bin/bash
set -e

# ==========================================
# ChronosLife: 원클릭 Cloud Run 배포 스크립트
# ==========================================

PROJECT_ID=$(gcloud config get-value project)
REGION="asia-northeast1"
SERVICE_NAME="chronoslife-app"

echo "=================================================="
echo " 🚀 Starting ChronosLife Cloud Run Deployment"
echo " Project: $PROJECT_ID | Region: $REGION"
echo "=================================================="

# 1. Google Cloud 필수 API 자동 활성화
echo "[1/4] Enabling required Google Cloud APIs..."
gcloud services enable \
    run.googleapis.com \
    dlp.googleapis.com \
    aiplatform.googleapis.com \
    artifactregistry.googleapis.com

# 2. Artifact Registry 리포지토리 준비
REPO_NAME="chronoslife-repo"
gcloud artifacts repositories describe $REPO_NAME --location=$REGION > /dev/null 2>&1 || \
gcloud artifacts repositories create $REPO_NAME --repository-format=docker --location=$REGION --description="ChronosLife Images"

# 3. Google Cloud Build를 통한 통합 컨테이너 빌드
IMAGE_URI="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_NAME:latest"
echo "[2/4] Building container image via Cloud Build: $IMAGE_URI"
gcloud builds submit --tag $IMAGE_URI .

# 4. Cloud Run 완전 관리형 서버리스 배포
echo "[3/4] Deploying to Google Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_URI \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars="USE_MOCK_FALLBACK=False,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,GOOGLE_CLOUD_REGION=$REGION" \
    --memory 2Gi \
    --cpu 2 \
    --min-instances 0 \
    --max-instances 5

# 5. 배포된 최종 라이브 URL 출력
LIVE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)')
echo "=================================================="
echo " ✅ ChronosLife Deployment Successful!"
echo " 🌐 Live Web URL: $LIVE_URL"
echo "=================================================="
