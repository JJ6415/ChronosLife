# ⏳ ChronosLife (クロノス・ライフ)
### Log-10 階層的時間 人生ガバナンス＆自律ライフガードOS
> **第5回 Agentic AI Hackathon with Google Cloud 出品作**  
> 「作る」から「使える」へ ―― 厳格なガバナンスとセキュリティを備えた自律型マルチエージェント

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Firebase%20App%20Hosting-0284c7?style=for-the-badge&logo=firebase)](https://chronoslife-web--chronos-life-510315.asia-east1.hosted.app/ja)
[![Backend API](https://img.shields.io/badge/Backend%20API-Google%20Cloud%20Run-4285F4?style=for-the-badge&logo=googlecloud)](https://chronoslife-backend-27246861924.asia-northeast1.run.app)
[![Sponsor MCP](https://img.shields.io/badge/Sponsor%20MCP-駅すぱあと%20(Val%20Lab)-10b981?style=for-the-badge)](https://roote.ekispert.net/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

---

## 🌟 プロジェクト概要

$10^0$日（1日）の衝動的な浪費や残業から、$10^4$日（約30年）の不変の人生憲法まで――  
**Log-10 等間隔階層時系列モデル（Log-10 HTM）**によって、現代人が直面する**因果関係の断絶（Vanishing Causality）**を数学的に解消。

個人のプライバシーを **Google Cloud DLP (Sensitive Data Protection)** で入口保護し、有限な人生リソース（資本・時間・健康）を巡る各専門AIエージェント（財務・キャリア・ウェルビーイング）の葛藤を、**最高仲裁官（Chief Governor AI）**がパレート最適解へと自律調停します。

---

## 🌐 本番稼働リンク (Live URLs)

- **フロントエンド (Web App)**: [https://chronoslife-web--chronos-life-510315.asia-east1.hosted.app/ja](https://chronoslife-web--chronos-life-510315.asia-east1.hosted.app/ja)
- **バックエンド (Cloud Run)**: [https://chronoslife-backend-27246861924.asia-northeast1.run.app](https://chronoslife-backend-27246861924.asia-northeast1.run.app)
- **事前審査用ワンクリック体験**: 会員登録やログイン不要で、ブラウザから即座に3大シナリオ＆Gemini Live対話をお試しいただけます。

---

## 🏛️ 6層自律ガバナンス・アーキテクチャ (6-Layer Architecture)

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Presentation (Next.js 15 + Firebase App Hosting)"]
        User["ユーザー / ブラウザ"]
        Studio["1. 人生憲法＆5大目標スタジオ (Gemini Live)"]
        Radar["2. リアルタイム・ライフバイタルレーダー (直近7日間推移)"]
        Dashboard["3. 自律ガバナンス審議コンソール＆コミック"]
    end

    subgraph Security_Perimeter ["Layer 0: Ingress Security & Privacy Sandbox"]
        DLP["Google Cloud DLP (Sensitive Data Protection)<br>氏名・口座番号・給与額をリアルタイム仮名化"]
    end

    subgraph Agent_Core ["Google Cloud AI Multi-Agent Core (Cloud Run)"]
        Orchestrator["Layer 1: Context Orchestrator AI<br>(Gemini 3.5 Flash)"]
        
        subgraph Council ["Layer 2: Domain Council Sub-Agents"]
            Finance["財務エージェント (30年複利資産1億円)"]
            Career["キャリアエージェント (週52h上限＆市場価値)"]
            Wellbeing["ウェルビーイングエージェント (睡眠7h＆家族夕食)"]
        end

        StateEngine["Log-10 State Dynamics Engine<br>(10^0日〜10^4日の非線形疲労・支出伝播)"]
        Governor["Layer 3: Chief Governor & 不変の人生憲法<br>(条件付きパレート調停文の生成)"]
        Comic["Layer 4: 5コマ・ウェブトゥーン生成エンジン<br>(Gemini Vision / Imagen)"]
    end

    subgraph External_Sponsor ["Layer 5: Sponsor API / MCP Integration"]
        Ekispert["駅すぱあと API (MCP サーバー)<br>(株式会社ヴァル研究所)"]
    end

    User --> Studio & Radar & Dashboard
    Studio -->|音声/テキスト| DLP
    Dashboard -->|審議リクエスト| DLP
    DLP -->|完全非識別化プロンプト| Orchestrator
    Orchestrator --> Council
    Council --> StateEngine
    StateEngine --> Governor
    Governor --> Comic
    Governor -->|過労・夜食衝動検知時に散歩ルート自律処方| Ekispert
```

---

## 🎯 審査員向け 3大実演デモシナリオ

| # | シナリオ名 | 解決する課題と技術ハイライト | 自律処方 / 調停結果 |
|---|-----------|-----------------------------|--------------------|
| **1** | **深夜の衝動支出と30年複利逆伝播** | 金曜夜、Amazonで限定版キーボード（9,800円）を衝動買い。**Cloud DLP** が口座番号と氏名を即座にマスク。$10^0$日の浪費が30年後のリタイア資産に与える複利損失を逆伝播。 | **条件付き修正**: 支出を承認する代わりに、L1（10日間）スプリント内で外食費を3日間3,260円ずつ減額吸収。 |
| **2** | **高年収スタートアップ転職の相反調停** | 年収350万円アップだが週70時間労働オファー。**財務AI（賛成）** vs **健康・家族AI（断固反対）** の価値観衝突。 | **原案却下＆パレート対案**: 週4回家族夕食と趣味4時間を死守するため、週52時間上限＋テレワーク確約での再交渉ガイドを提示。 |
| **3** | **連続残業バーンアウトと緑地散歩処方** | 3日連続22時退勤で夜食（3,000円）衝動。疲労指数の急上昇を検知し、**駅すぱあと API MCP** と連携。 | **物理世界介入**: 新宿駅で「15分リフレッシュ緑地徒歩ルート」を案内し、前頭葉の意志力回復と夜食を自律防衛。 |

---

## 🛠️ Google Cloud 技術スタックと加点対応

- **Google Cloud Run**: バックエンド（FastAPI Dockerコンテナ）を `asia-northeast1`（東京）に完全サーバレス配備。
- **Firebase App Hosting**: フロントエンド（Next.js 15）のグローバルホスティング（**スポンサー加点獲得**）。
- **駅すぱあと API MCP (Model Context Protocol)**: 株式会社ヴァル研究所の交通APIを活用したモビリティ自律処方（**スポンサー加点獲得**）。
- **Google Cloud DLP (Sensitive Data Protection)**: PII（氏名・口座・給与情報）を実時間で暗号トークン化し、外部LLMの漏洩と過剰迎合を防止（**テーマ適合**）。
- **Gemini Live (双方向音声＆テキスト)**: ユーザーのリアルタイム音声から人生憲法を対話的に引き出し、5大目標カードを直接同期。

---

## 💻 ローカル開発・検証手順

```bash
# 1. リポジトリのクローン
git clone https://github.com/JJ6415/ChronosLife.git
cd ChronosLife

# 2. バックエンドの起動 (Python 3.11+)
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8080

# 3. フロントエンドの起動 (別のターミナル)
cd ../frontend
npm install
npm run dev
# http://localhost:3000 にアクセス
```

---

## 📄 ライセンス

本プロジェクトは **MIT License** のもとで公開されています。  
*第5回 Agentic AI Hackathon with Google Cloud 提出用*
