# LunchMap アプリケーション処理フロー

## 全体構成

```
ブラウザ → Frontend(React) → Backend(Go/Gin) → Google Sheets
```

---

## TOPページ表示の流れ

### 1. ブラウザがアクセス（http://localhost:3000）

Dockerの`frontend`コンテナが静的ファイルを返します。

### 2. Frontend起動

**frontend/src/main.tsx** が最初に実行されます：

```tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
```

→ `App`コンポーネントをHTML内の`#root`要素に描画

### 3. Appコンポーネントの初期化

**frontend/src/App.tsx** が読み込まれ、`useEffect`で店舗データを取得：

```tsx
useEffect(() => {
  fetchShops();  // APIを呼び出し
}, []);
```

### 4. APIクライアントがBackendにリクエスト

**frontend/src/api/client.ts** の`getShops()`が実行：

```ts
fetch(`${API_URL}/api/shops`)  // → http://localhost:8080/api/shops
```

---

## Backend（Go）の処理

### 5. main.go - エントリーポイント

**backend/main.go** がサーバー起動時に実行されます：

```go
func main() {
    // ① 設定読み込み
    cfg := config.Load()

    // ② Google Sheetsサービス初期化
    sheetsService, err := services.NewSheetsService(...)

    // ③ ハンドラー作成（リクエスト処理担当）
    shopHandler := handlers.NewShopHandler(sheetsService)
    reviewHandler := handlers.NewReviewHandler(sheetsService)

    // ④ Ginルーター設定
    r := gin.Default()

    // ⑤ APIルート定義
    api := r.Group("/api")
    {
        api.GET("/shops", shopHandler.GetShops)  // ← ここにリクエストが来る
        ...
    }

    // ⑥ サーバー起動
    r.Run(":8080")
}
```

### 6. handlers/shop.go - リクエスト処理

**backend/handlers/shop.go** の`GetShops`が呼ばれます：

```go
func (h *ShopHandler) GetShops(c *gin.Context) {
    shops, err := h.sheetsService.GetShops()  // サービス呼び出し
    c.JSON(http.StatusOK, shops)              // JSON形式で返却
}
```

### 7. services/sheets.go - データ取得

**backend/services/sheets.go** がGoogle Sheetsからデータ取得：

```go
func (s *SheetsService) GetShops() ([]models.Shop, error) {
    // Google Sheets APIで「shops」シートのA2:G列を取得
    resp, err := s.service.Spreadsheets.Values.Get(s.spreadsheetID, "shops!A2:G").Do()

    // 各行をShop構造体に変換
    for _, row := range resp.Values {
        shops = append(shops, models.Shop{
            ID:        row[0],
            Name:      row[1],
            ...
        })
    }
    return shops, nil
}
```

---

## Frontendに戻る

### 8. データ受信→画面描画

App.tsxでデータを受け取り、状態を更新：

```tsx
const data = await getShops();
setShops(data);  // → 再レンダリングが発生
```

### 9. 地図表示

**frontend/src/components/Map.tsx** が`shops`を受け取り、マーカーを表示：

```tsx
{shops.map((shop) => (
  <Marker position={[shop.latitude, shop.longitude]} ... />
))}
```

---

## ファイル構成まとめ

### Backend

| ファイル | 役割 |
|---------|------|
| backend/main.go | エントリーポイント、ルーティング設定 |
| backend/handlers/shop.go | 店舗関連のHTTPリクエスト処理 |
| backend/handlers/review.go | レビュー関連のHTTPリクエスト処理 |
| backend/services/sheets.go | Google Sheetsとの通信 |
| backend/models/shop.go | 店舗データ構造の定義 |
| backend/models/review.go | レビューデータ構造の定義 |
| backend/config/config.go | 環境変数の読み込み |

### Frontend

| ファイル | 役割 |
|---------|------|
| frontend/src/main.tsx | Reactアプリのエントリーポイント |
| frontend/src/App.tsx | メインコンポーネント、状態管理 |
| frontend/src/api/client.ts | Backend API呼び出し |
| frontend/src/components/Map.tsx | 地図表示 |
| frontend/src/components/ReviewPanel.tsx | レビュー表示パネル |
| frontend/src/components/ReviewForm.tsx | レビュー投稿フォーム |
| frontend/src/components/ShopForm.tsx | 店舗追加フォーム |
| frontend/src/types/index.ts | TypeScript型定義 |

---

## APIエンドポイント一覧

| メソッド | パス | 説明 | ハンドラー |
|---------|------|------|-----------|
| GET | /api/shops | 全店舗取得 | shopHandler.GetShops |
| GET | /api/shops/:id | 店舗詳細取得 | shopHandler.GetShop |
| POST | /api/shops | 店舗追加 | shopHandler.CreateShop |
| GET | /api/shops/:id/reviews | レビュー一覧取得 | reviewHandler.GetReviews |
| POST | /api/shops/:id/reviews | レビュー投稿 | reviewHandler.CreateReview |

---

## 店舗新規登録フロー

### 1. 「+ お店を追加」ボタンをクリック

**frontend/src/App.tsx** で追加モードに切り替わります：

```tsx
const handleAddModeToggle = () => {
  setIsAddMode(!isAddMode);  // 追加モードON
  setNewShopLocation(null);
  setSelectedShop(null);
};
```

### 2. 地図をクリックして位置を選択

**frontend/src/components/Map.tsx** の`MapClickHandler`がクリック位置を取得：

```tsx
useMapEvents({
  click: (e: LeafletMouseEvent) => {
    if (isAddMode && onMapClick) {
      onMapClick(e.latlng.lat, e.latlng.lng);  // 緯度・経度を親に渡す
    }
  },
});
```

App.tsxで位置を保存：

```tsx
const handleMapClick = (lat: number, lng: number) => {
  if (isAddMode) {
    setNewShopLocation({ lat, lng });  // → ShopFormが表示される
  }
};
```

### 3. ShopFormに情報を入力して送信

**frontend/src/components/ShopForm.tsx** でフォーム送信：

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  await onSubmit(formData);  // App.tsxのhandleShopSubmitを呼ぶ
};
```

### 4. APIクライアントがBackendにPOSTリクエスト

**frontend/src/api/client.ts** の`createShop()`が実行：

```ts
export async function createShop(shop: ShopInput): Promise<Shop> {
  const response = await fetch(`${API_URL}/api/shops`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shop),
  });
  return response.json();
}
```

### 5. Backend: handlers/shop.go - CreateShop

**backend/handlers/shop.go** がリクエストを受け取ります：

```go
func (h *ShopHandler) CreateShop(c *gin.Context) {
    var shop models.Shop
    c.ShouldBindJSON(&shop)              // JSONをShop構造体に変換
    h.sheetsService.CreateShop(&shop)    // サービスに渡す
    c.JSON(http.StatusCreated, shop)     // 作成した店舗を返却
}
```

### 6. Backend: services/sheets.go - CreateShop

**backend/services/sheets.go** がGoogle Sheetsに追記：

```go
func (s *SheetsService) CreateShop(shop *models.Shop) error {
    shop.ID = uuid.New().String()  // UUIDを生成

    values := [][]interface{}{
        {shop.ID, shop.Name, shop.Address, shop.Phone, shop.URL, shop.Latitude, shop.Longitude},
    }

    // Google Sheets APIでshopsシートに行を追加
    s.service.Spreadsheets.Values.Append(
        s.spreadsheetID,
        "shops!A:G",
        &sheets.ValueRange{Values: values},
    ).ValueInputOption("RAW").Do()

    return nil
}
```

### 7. 店舗一覧を再取得

App.tsxで画面を更新：

```tsx
const handleShopSubmit = async (shopData: ShopInput) => {
  await createShop(shopData);     // 店舗を登録
  await fetchShops();             // 一覧を再取得 → 地図に新しいマーカーが表示
  setNewShopLocation(null);
  setIsAddMode(false);
};
```

---

## レビュー投稿フロー

### 1. 地図上のマーカーをクリック

**frontend/src/components/Map.tsx** でクリックイベント発火：

```tsx
<Marker
  eventHandlers={{
    click: () => onShopSelect(shop),  // 選択した店舗を親に渡す
  }}
>
```

App.tsxで選択状態を保存：

```tsx
const handleShopSelect = (shop: Shop) => {
  setSelectedShop(shop);  // → ReviewPanelに店舗情報が表示される
};
```

### 2. ReviewPanelにレビュー一覧が表示される

**frontend/src/components/ReviewPanel.tsx** が店舗のレビューを取得（内部でAPIを呼び出し）

### 3. ReviewFormに入力して送信

**frontend/src/components/ReviewForm.tsx** でフォーム送信：

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  await createReview(shopId, formData);  // APIを呼び出し
  onReviewAdded();                        // 親に完了を通知
};
```

### 4. APIクライアントがBackendにPOSTリクエスト

**frontend/src/api/client.ts** の`createReview()`が実行：

```ts
export async function createReview(shopId: string, review: ReviewInput): Promise<Review> {
  const response = await fetch(`${API_URL}/api/shops/${shopId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  });
  return response.json();
}
```

### 5. Backend: handlers/review.go - CreateReview

**backend/handlers/review.go** がリクエストを受け取ります：

```go
func (h *ReviewHandler) CreateReview(c *gin.Context) {
    shopID := c.Param("id")              // URLからshopIDを取得

    var input models.ReviewInput
    c.ShouldBindJSON(&input)             // JSONをReviewInput構造体に変換

    review, err := h.sheetsService.CreateReview(shopID, &input)
    c.JSON(http.StatusCreated, review)
}
```

### 6. Backend: services/sheets.go - CreateReview

**backend/services/sheets.go** がGoogle Sheetsに追記：

```go
func (s *SheetsService) CreateReview(shopID string, input *models.ReviewInput) (*models.Review, error) {
    review := &models.Review{
        ID:               uuid.New().String(),
        ShopID:           shopID,
        Reviewer:         input.Reviewer,
        VisitCount:       input.VisitCount,
        PriceRating:      input.PriceRating,
        TasteRating:      input.TasteRating,
        AtmosphereRating: input.AtmosphereRating,
        Comment:          input.Comment,
        CreatedAt:        time.Now(),
    }

    values := [][]interface{}{
        {review.ID, review.ShopID, review.Reviewer, ...},
    }

    // Google Sheets APIでreviewsシートに行を追加
    s.service.Spreadsheets.Values.Append(
        s.spreadsheetID,
        "reviews!A:I",
        &sheets.ValueRange{Values: values},
    ).ValueInputOption("RAW").Do()

    return review, nil
}
```

### 7. レビュー一覧を再取得

ReviewPanel内でレビュー一覧が再取得され、新しいレビューが表示されます。
