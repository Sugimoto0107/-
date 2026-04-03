# スケジュール調整アプリ

Spir風のスケジュール調整ツール。企業（商談・40分）と個人（面談・30分）の予約に対応。

## 機能

- 企業向け：商談予約（40分）/ 個人向け：面談予約（30分）
- 杉本さんのGoogleカレンダーの空き枠を自動取得
- Google Meetリンクを自動発行
- 予約確定メールを自動送信
- 個人向け：電話番号（046−404−9187）通知を含むメール

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. Google Cloud プロジェクトの設定

1. [Google Cloud Console](https://console.cloud.google.com) でプロジェクトを作成
2. 以下の API を有効化：
   - **Google Calendar API**
   - **Google Meet API**（Calendar API に含まれています）
3. 「認証情報」→「OAuth 2.0 クライアント ID」を作成
   - アプリケーションの種類: **デスクトップアプリ**
4. `client_id` と `client_secret` を控えておく

### 3. リフレッシュトークンの取得

以下のスクリプトをローカルで実行してリフレッシュトークンを取得します：

```bash
node scripts/get-token.js
```

または [OAuth 2.0 Playground](https://developers.google.com/oauthplayground) を使用：
1. 右上の歯車アイコン → "Use your own OAuth credentials" にチェック
2. `client_id` と `client_secret` を入力
3. スコープに `https://www.googleapis.com/auth/calendar` を追加
4. "Authorize APIs" → "Exchange authorization code for tokens"
5. `refresh_token` を取得

### 4. Gmail アプリパスワードの設定

1. Google アカウント → セキュリティ → 2段階認証を有効化
2. アプリパスワード → 「メール」→「その他（カスタム名）」で生成
3. 生成された16文字のパスワードを控えておく

### 5. 環境変数の設定

`.env.example` を `.env.local` にコピーして設定：

```bash
cp .env.example .env.local
```

```env
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REFRESH_TOKEN=xxx
GOOGLE_CALENDAR_ID=primary   # または 杉本さんのGmailアドレス
GMAIL_USER=sugimoto@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
GMAIL_FROM_NAME=杉本
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) で確認できます。

## Vercel へのデプロイ

### GitHub にプッシュ後、Vercel で設定：

1. [Vercel](https://vercel.com) でリポジトリをインポート
2. **Environment Variables** に上記の環境変数をすべて設定
3. デプロイ完了後、`NEXT_PUBLIC_BASE_URL` を実際の URL に更新

## 技術スタック

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Calendar**: Google Calendar API (googleapis)
- **Email**: Nodemailer + Gmail SMTP
- **Language**: TypeScript
- **Deploy**: Vercel
