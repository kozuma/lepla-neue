# API契約書（新リポジトリ移行用サルベージ文書）

作成日: 2026-07-18 / 調査対象ブランチ: **feature/design-migration (b7e61b33)**
コード（`apps/api/src/features/`, `apps/web-new/lib/api/`）を直接確認して作成。Swagger（`apps/web-new/swagger.json`）と実装が食い違う箇所は実装を正とし、食い違いを明記する。

**mainとの差分について（事実）**: feature/design-migration のフロント変更はデザイン移行のみで、`lib/api/client.ts` は無変更、`lib/api/hooks.ts` は未使用型エイリアスの削除（-7行）のみ。**フロントが呼ぶエンドポイント・API側実装ともにmainと同一**。本文書の行番号は本ブランチ基準。

**本文書の位置づけ（`docs/CLAUDE.md` 開発憲法 §7 より）**: これは**要件の考古学資料であり、新APIの設計図ではない**。新スキーマはアーキタイプシステム設計書を正とし、本文書は取りこぼし照合用に使う。新APIは Route Handlers + Zod で実装され（NestJS/Swaggerは採用しない）、認証は Supabase Auth に置き換わるため、§1.4 の `/auth/*` 契約はそのまま引き継がない。

## 0. 最重要の前提（正直な現状報告）

**フロントエンド(apps/web-new)が実APIを呼ぶ経路は存在するが、現在画面から実際に発火するAPI呼び出しは「デッキ一覧・デッキ取得・カード一覧」の3つのみ。**

- 接続先: `apps/web-new/lib/api/client.ts:4` — `const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004'`（axios、`withCredentials: true`、Bearerトークンをリクエストインターセプタで付与、401時に `/login` へリダイレクト）。
- モック切替: `apps/web-new/lib/api/mock-data.ts:149` — `USE_MOCK_DATA = NODE_ENV==='development' && NEXT_PUBLIC_USE_MOCK_DATA==='true'`。モックが効くのは `useDecks` / `useDeck` / `useCards` の3フックのみ（`lib/api/hooks.ts:23,40,57`）。環境変数が未設定なら開発環境でも実APIを叩く。
- `app/` 配下で `fetch` / SWR / axios の直接呼び出しは**ゼロ**（grepで確認）。API呼び出しはすべて `lib/api/hooks.ts` → `lib/api/client.ts` 経由。
- ログイン画面は存在しない（`app/` に `/login` ページなし）。401時のリダイレクト先 `/login` は404になる。【推測】認証フローは未実装のまま画面だけ先行している。
- 認証トークン未設定のまま `GET /decks` 等（全てガード付き）を呼ぶため、**実APIに繋いでも現状は401になる**。さらに `GET /decks` は `organizationAccountId` が必須のため、トークンがあっても400になる（§1.1参照）。

## 1. フロントエンドが実際に使用しているエンドポイント

### 共通仕様（事実）

- 認証: `AccressTokenGuard`（クラス名のtypoごと現物）。`Authorization: Bearer <accessToken>`（JWT、有効期限1日。リフレッシュトークンは90日だが**リフレッシュ用エンドポイントは存在しない**）。
- バリデーション: `main.ts` でグローバル `ValidationPipe({ transform: true, enableImplicitConversion: true })`。`whitelist` は無効なので未知フィールドは素通りする。
- 一覧系レスポンスは共通で `{ results: T[], total: number }`（`shared/utils/pagination/pagination.serializer.ts`）。
- ページングクエリ共通: `page?: number(Min 1)`, `take?: number(Min 1, Max 100)`（`shared/utils/pagination/pagination.query.ts`）。

---

### 1.1 GET /decks — デッキ一覧

- 実装: `apps/api/src/features/decks/methods/listDecks/controller.ts`
- 認証: 必須（`AccressTokenGuard`）
- フロント呼び出し: `apps/web-new/lib/api/client.ts:103-110`、`lib/api/hooks.ts:15-34`、画面 `apps/web-new/app/decks/DecksListView.tsx:18-20`
- リクエスト（クエリ）:

| フィールド | 型 | 制約 |
|---|---|---|
| page | number | 任意, Min 1 |
| take | number | 任意, Min 1 / Max 100（service側デフォルト page=1, take=20） |
| organizationAccountId | string | **必須（IsNotEmpty）**【学校向け残骸】 |
| groupId | string | 任意【学校向け残骸】 |
| includeDeleted | boolean | 任意, デフォルト false |

- **契約上の食い違い（重大・事実）**: フロントは `DecksListView.tsx:18-20` で `{ page, take: 12 }` のみ渡しており、`organizationAccountId` を送っていない（`DecksListView.tsx:21` に「organizationAccountId を適切に設定する必要があります」とTODOコメントあり）。API側は必須なので**このままでは400エラー**。
- service実装（`listDecks/service.ts`）は `ownerAccountId = organizationAccountId` のデッキ + 組織メンバーが所有するデッキを検索し、`groupId` 指定時は `Group` の存在確認までする。個人向けアプリとしては検索ロジック全体が【学校向け残骸】。新リポジトリでは `organizationAccountId` / `groupId` の削除を推奨。
- レスポンス: `{ results: Deck[], total: number }`。Deck（`features/decks/components/deck.ts`、実装確認済み）:

```
id, ownerAccountId, name, description, version,
level: 'NONE'|'EASY'|'MEDIUM'|'HARD',
target, publisher, estimatedLearningHour: number,
imagePath: string|null,
imageUrl: string|null,   // S3 presigned URL（有効期限600秒）。一覧APIでは実際に生成される
status: 'DRAFT'|'PUBLISHED',
cardTemplateId: string|null,
categories: {id, name}[],
deckTopicStructure: { id, templateMappings: TemplateMapping[], createdAt, updatedAt },
deletedAt: Date|null, createdAt, updatedAt
```

### 1.2 GET /decks/{deckId} — デッキ取得

- 実装: `apps/api/src/features/decks/methods/getDeck/controller.ts`
- 認証: 必須
- フロント呼び出し: `client.ts:112-115`、`hooks.ts:36-51`、画面 `apps/web-new/app/decks/[deckId]/DeckDetailView.tsx:16`、`apps/web-new/app/decks/[deckId]/study/StudyView.tsx:28`
- リクエスト: パスパラメータ `deckId: string`（IsNotEmpty）のみ。存在しなければ404。
- レスポンス: 上記 Deck と同型。ただし**食い違い（事実）**: Swagger/型定義上は `imageUrl` を持つが、`getDeck/service.ts` にはpresigned URL生成コードが無い（`imageUrl` の設定処理は `listDecks/service.ts` のみに存在。grepで確認）。単体取得では `imageUrl` は返却されない（undefined）。実装を正とする。
- TemplateMapping の実形: `{ id, deckTopicStructureId, deckStructureAttributeId, deckStructureAttribute: { id, name, description, type: 'STRING'|'NUMBER'|'BOOLEAN'|'DATE', isRequired, createdAt, updatedAt }, cardTemplateVariableId, cardTemplateVariable, createdAt, updatedAt }`

### 1.3 GET /decks/{deckId}/cards — カード一覧

- 実装: `apps/api/src/features/decks/methods/listCards/controller.ts`
- 認証: 必須
- フロント呼び出し: `client.ts:118-121`、`hooks.ts:53-68`、画面 `apps/web-new/app/decks/[deckId]/study/StudyView.tsx:29`（`{ take: 100 }` で呼び出し）
- リクエスト: パス `deckId`、クエリ `page?`, `take?`, `includeDeleted?: boolean`（デフォルトfalse）
- レスポンス: `{ results: Card[], total: number }`。Card（`features/decks/components/card.ts`）:

```
id, deckId, label, order: string,
cardTopicValues: { id, deckStructureAttributeId, value: string, createdAt, updatedAt }[],
deletedAt: Date|null, createdAt, updatedAt
```

---

### 1.4 client.ts/hooks.tsに配線済みだが、画面から一切呼ばれていないエンドポイント

以下は `client.ts`・`hooks.ts` にメソッド/フックが定義されているが、`app/`・`components/` のどこからもimportされていない（grepで確認）。移行時は「使う予定だった」扱い。

| エンドポイント | client.ts | 備考 |
|---|---|---|
| POST /auth/signup | client.ts:82-87 | body `{ email }`（IsEmail必須）。レスポンスは**ボディなし**（201）。実装はサインアップセッション作成+メール送信のみ |
| POST /auth/signin | client.ts:89-95 | body `{ loginId, password }`（両方IsNotEmpty）。**重大な食い違い（事実）**: APIは `AccountToken { id, accountId, accessToken, refreshToken, createdAt, updatedAt }` を返すが、client.tsは `response.token` を参照している。実装どおりなら `token` は常にundefinedで**トークンが保存されない**。正は `accessToken` |
| POST /auth/signout | client.ts:97-100 | 認証必須。レスポンスボディなし |
| GET /my-decks | client.ts:124-127 | 認証必須。`{ results: MyDeck[], total }`。MyDeck = `{ id, deckId, deck: {id, name, description, target, createdAt, updatedAt}, accountId, createdAt, updatedAt }`（deckは縮小版） |
| POST /my-decks | client.ts:129-132 | body `{ deckId }`。レスポンスは MyDeck（SwaggerのApiOkResponseは `type: Deck` と誤記。実装は `CreateMyDeckResponse extends MyDeck` を返す。実装優先） |
| GET /accounts/me | client.ts:135-138 | 認証必須。`Account { id, name, email, createdAt, updatedAt }` |

## 2. 凍結済み（学校向け機能）

新リポジトリでは移行対象外として分離すべきもの。

### 2.1 organizations 機能（フロントから呼び出しゼロ）

- **POST /organizations/{organizationAccountId}/invite** — `features/organizations/methods/invite/controller.ts`。認証 + `OrganizationGuard`（`@Roles(ADMIN)`、組織メンバーのロール検査）。body `{ email: IsEmail必須, role: 'ADMIN'|'EDITOR'|'PLAYER' }`。レスポンスボディなし。招待メール送信。
- **POST /organizations/{organizationAccountId}/activate/{token}** — `features/organizations/methods/activate/controller.ts`。認証必須。招待トークンで組織メンバー化。レスポンスボディなし。

### 2.2 一般APIに混入している学校向けパラメータ【学校向け残骸】

- `GET /decks` の `organizationAccountId`（**必須**）と `groupId` — 個人利用でも組織IDを要求する設計。listDecks serviceの検索ロジック（組織メンバー所有デッキの合算、Group存在チェック）ごと残骸。
- `POST /card-templates` の `ownerAccountId?`（「省略時は自身のアカウントがオーナー」）— 【推測】教師が組織名義でテンプレートを作る用途の残骸。
- Prismaスキーマ（`packages/database/prisma/schema.prisma`）: `OrganizationMemberRel`（role: ADMIN/EDITOR/PLAYER）、`Group`、`GroupDeckRel` 等のモデル群。
- `OrganizationMemberRelRole` のデフォルト値が2箇所で異なる（schema.prisma:132は ADMIN、216（招待セッション）は PLAYER）— 招待系の残骸。

## 3. 未使用エンドポイント（APIに存在するがフロントから未呼び出し）

すべて認証必須（`AccressTokenGuard`）。ソースは `apps/api/src/features/` 配下の各 `controller.ts`。

| メソッド/パス | 概要 | 補足 |
|---|---|---|
| POST /auth/activate/{token} | サインアップ後のアクティベート | body `{ password: MinLength(8) }`。ボディなしレスポンス。認証不要 |
| GET /accounts/me/stats | 学習統計 | `{ totalLearningTime, totalLearningCardCount }` |
| GET /card-templates | テンプレート一覧 | `{ results: CardTemplate[], total }` |
| GET /card-templates/{id} | テンプレート取得 | |
| POST /card-templates | テンプレート作成 | body: name(必須), description, content(必須), cardTemplateVariables[]（name/type enum/description/isRequired/placeholder）, ownerAccountId?【学校向け残骸の疑い】 |
| PUT /card-templates/{id} | テンプレート更新 | 同上 + 変数に `id?` |
| POST /decks | デッキ作成 | body: name, status enum, version, description, level enum, target, publisher, estimatedLearningHour, cardTemplateId, deckTemplateMappings[], imagePath? |
| PUT /decks/{deckId} | デッキ更新 | 同上 + mappingに `deckStructureAttributeId?` |
| DELETE /decks/{deckId} | デッキ論理削除 | 204 |
| POST /decks/{deckId}/cards | カード作成 | body: label, order(MaxLength 255の**string**), cardTopicValues[] |
| PUT /decks/{deckId}/cards/{cardId} | カード更新 | 同上 + topicValueに `id?` |
| DELETE /decks/{deckId}/cards/{cardId} | カード論理削除 | 204 |
| GET /decks/{deckId}/cardQuestions | 問題一覧 | `CardQuestion { id, deckId, cardId, content, contentAnswer, ... }` |
| POST /decks/presigned-url | 画像アップロードURL発行 | body `{ contentType }` |
| GET /decks/{deckId}/presigned-url | 画像ダウンロードURL取得 | `{ url: string }` |
| GET /decks-stats | デッキ統計一覧 | `{ results: DeckStats[], total }` |
| POST /exams/{examId}/attempts | 出題記録 | body `{ deckId, cardQuestionId }`。ExamQuestionAttempt を返す。examIdの実体管理APIは存在しない（Examの作成/取得エンドポイントなし） |
| POST /exams/{examId}/results | 解答結果記録 | body `{ deckId, cardQuestionId, answer, isCorrect }` |
| POST /learnings | 学習記録作成 | body `{ deckId, cardId, startAt?, endAt?, durationTime?(Min 0) }`。Learning を返す |
| PUT /learnings/{learningId} | 学習記録更新 | body `{ startAt?, endAt?, durationTime? }` |
| GET /healthcheck, GET /authcheck | 死活監視 | `app.controller.ts`（features外）。authcheckのみガード付き |

【推測】StudyView は学習セッション時間をローカルstateで計測しており（`StudyView.tsx:22-26`）、本来は `/learnings` に送る設計だったが未接続。

## 4. Swaggerと実装の食い違いまとめ

`apps/web-new/swagger.json`（フロントの型 `@/types/api` の生成元）と実装の差分。**すべて実装を優先すること。**

1. **POST /auth/signin**: swagger.jsonはレスポンススキーマ未定義（`200: description: ""`）。実装は `AccountToken`（`accessToken`/`refreshToken`）を返す。client.tsが参照する `token` フィールドは存在しない。
2. **POST /my-decks**: Swaggerデコレータは `type: Deck` だが実装は `MyDeck` を返す。
3. **GET /decks/{deckId}**: スキーマ上 `imageUrl` があるが、getDeckサービスは生成しない（一覧APIのみ生成、有効期限600秒）。
4. **POST /exams/**・**POST /learnings** 系: bodyの `deckId` / `answer` / `isCorrect` 等に `@ApiProperty` が無く、Swagger上はbodyフィールドが欠落しているが実装では必須（IsNotEmpty）。
5. ステータスコード: NestJSデフォルトによりPOST系は実際には201を返すが、多くのコントローラは `@ApiOkResponse`(200)を宣言。

## 5. 移行時の照合メモ【推測を含む。開発憲法 §7 に従い「設計図」ではない】

- 旧契約のうち機能要件として意味を持つのは §1.1〜1.3 の3エンドポイント + §1.4 のマイデッキ/アカウント系。**§1.4 の `/auth/*` 3本は Supabase Auth 採用により契約ごと消滅**（signinの `token` 参照バグ、refreshエンドポイント不在問題も同時に消える）。
- `GET /decks` の `organizationAccountId` / `groupId` は憲法 §7「学校向け機能は実装しない・スキーマに含めない」により新APIに持ち込まない（現状フロントは送っておらず、送らないと400になるため、どのみち旧契約のままでは動かない）。
- デッキ/カードのレスポンス形（§1.1〜1.3）は「フロントが期待するデータ項目の一覧」として照合に使えるが、新スキーマは Drizzle + アーキタイプシステム設計書を正とすること。
- 二層構造（憲法 §3-4）の観点: 旧APIの `/decks-stats`（completion_rate等の生集計値）や `/accounts/me/stats` をそのままの形で新APIに再現しないこと。詳細メトリクスは内部記録に留め、露出には物語上の必然性が要る。
