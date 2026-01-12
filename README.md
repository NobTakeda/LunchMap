# LunchMap - ランチスポット共有アプリ

職場付近のランチスポットを共有・レビューできるWebアプリケーション

## 技術スタック

- **Backend**: Go (Gin framework)
- **Frontend**: React + TypeScript + Vite
- **Map**: Leaflet + OpenStreetMap
- **Data Source**: Google Sheets API
- **Infrastructure**: Docker Compose

## クイックスタート

初めて利用する場合は、[初期設定ガイド](docs/初期設定.md) を参照してください。

> Google Cloud関係は管理者のみの設定です。基本的にDockerでコンテナを立てれば動きます。
> （別途共有する接続情報は必要）

### 起動

```bash
docker-compose up --build
```

### アクセス

- **アプリ**: http://localhost:3000
- **API**: http://localhost:8080

## 使い方

### お店を探す・レビューを見る

1. 地図上のマーカーをクリックしてお店を選択
2. 右側のパネルにお店の情報とレビューが表示される

### レビューを投稿する

1. 地図上のマーカーをクリックしてお店を選択
2. 右側パネル下部の「レビューを投稿」フォームに入力
3. 名前、来店回数、各評価（値段・味・雰囲気）、コメントを入力
4. 「レビューを投稿」ボタンをクリック

### 新しいお店を追加する

1. 画面左上の「+ お店を追加」ボタンをクリック
2. 地図上でお店の場所をクリック
3. 登録フォームが表示されるので、以下を入力：
   - 店名（必須）
   - 住所
   - 電話番号
   - HP URL
4. 「登録する」ボタンをクリック
5. 地図にマーカーが追加される

## API エンドポイント

| Method | Path | 説明 |
|--------|------|------|
| GET | /api/shops | 全店舗取得 |
| GET | /api/shops/:id | 店舗詳細取得 |
| POST | /api/shops | 店舗登録 |
| GET | /api/shops/:id/reviews | 店舗のレビュー取得 |
| POST | /api/shops/:id/reviews | レビュー投稿 |

## データについて

- データはGoogle スプレッドシートに保存されます
- 全ユーザーが同じスプレッドシートを参照・編集します
- スプレッドシートを直接編集することも可能です
