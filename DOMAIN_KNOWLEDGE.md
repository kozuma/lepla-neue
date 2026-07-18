# ドメイン知識文書（新リポジトリ移行用サルベージ文書）

作成日: 2026-07-18 / 調査対象ブランチ: **feature/design-migration (b7e61b33)**
（バックエンド・DBはmainと完全一致。フロントは「静かな美術館」デザイン移行済みだが、**ドメインロジック（vote-calculator.ts / definitions.ts / archetype-store.ts）はmainから無変更**であることをgit diffで確認済み）

**本文書の位置づけ（`docs/CLAUDE.md` 開発憲法 §7 より)**: コードに埋まっていた暗黙のビジネスルールの記録。旧バックエンドのコードは一行も新リポジトリに持ち込まないため、本文書が旧実装の挙動を参照できる唯一の手段になる。新スタック（Route Handlers / Drizzle / Supabase Auth）を前提に「引き継ぐルール」と「旧実装の癖として捨てるルール」を区別して読むこと。§5.4 の昇格しきい値などの内部パラメータは二層構造（憲法 §3-4）の対象であり、**UI・APIレスポンスに露出しない**。

本文書は仕様書に書かれていない「コードに埋まった暗黙のビジネスルール」を、根拠コード位置（file:line）付きで整理したものである。**事実**（コードで確認済み）と**【推測】**を区別し、学校向けプランの残骸と思われるものは**【学校向け残骸】**とマークする。

---

## 0. システム全体の暗黙の前提

- **ID体系**: 全エンティティのPKは `nanoid(10)`（10文字英数字）。DBも `VarChar(10)` 固定（`packages/database/prisma/schema.prisma:16` ほか全モデル）。UUIDやauto-incrementではない。移行先でもID長10を前提にしたカラム定義がある点に注意。
- **物理削除は原則しない設計だが、論理削除対象は Deck と Card のみ**。`prisma-extension-soft-delete` で `deletedAt` を使う（`apps/api/src/infrastructure/database/prisma.service.ts:36-48`）。`prisma.softDelete.card.delete(...)` のように **`softDelete` ゲッター経由で呼んだ時だけ**論理削除になる。通常の `this.prisma.deck.findUnique` は **削除済みも取得してしまう**（例: `getDeck/service.ts` は deletedAt を見ていない）。
- **FKのonDelete**: マイグレーション上ほぼ全て `ON DELETE RESTRICT`（39箇所）。唯一の例外は `groups.owner_account_id` が `ON DELETE SET NULL`（`packages/database/prisma/migrations/20251004152114_init/migration.sql:482`）。アカウント物理削除は事実上不可能な設計。
- **APIにはページネーション上限がある**: `take` は 1〜100（`apps/api/src/shared/utils/pagination/pagination.query.ts:16-19`）。サービス層デフォルトは `page=1, take=20`。
- **web-new は現状「バックエンド非接続のプロトタイプ」が混在**: アーキタイプ診断・投票は zustand persist（localStorage、キー `lepla-archetype-store`）と `useVoting`（localStorage キー `lepla_voting_records` / `lepla_voting_stats`）のみで完結し、APIに保存されない。`NEXT_PUBLIC_USE_MOCK_DATA=true` かつ development のときデッキ/カードもモック（`apps/web-new/lib/api/mock-data.ts:149`）。

---

## 1. 認証 / アカウント

### 1.1 サインアップは「2段階セッション方式」
1. `POST /auth/signup` にメールアドレスのみ送信 → `AccountSignupSession`（テーブル名は歴史的経緯で `account_invite_sessions`、`schema.prisma:165`）を `INPROGRESS` で作成し、アクティベーションメールを送る（`apps/api/src/features/auth/methods/signup/service.ts:25-42`）。
2. `POST /auth/activate/:token` でパスワードを設定 → Account + PasswordGrant + Contract(FREE) をトランザクションで作成し、セッションを `VERIFIED` に更新（`auth/methods/activate/service.ts:45-79`）。

```
AccountSignupSession: INPROGRESS ──(activate成功)──> VERIFIED
```

暗黙ルール:
- **トークン = SHA256(salt + email + 現在時刻文字列)**（`signup/service.ts:30-32`）。saltは `APP_TOKEN_SALT`（デフォルト `'example'`、`shared/config/app.config.ts:13`）。
- **セッションに有効期限がない**。INPROGRESSであれば何日後でもアクティベート可能。
- **同一メールで何度signupしても新セッションが毎回作られる**（重複チェックなし）。重複登録の防止はactivate時の `passwordGrant.loginId` 一意チェックのみ（`activate/service.ts:33-40`、「既に登録済です」400）。つまり **signup時点では登録済みメールでも成功してメールが飛ぶ**。
- **アカウント作成時 name は空文字**（`activate/service.ts:48`）。名前設定APIは存在しない（accountのupdate系メソッドなし）。
- パスワードは **SHA256(salt + password) の単純ハッシュ**（bcrypt等ではない。`activate/service.ts:56`, `signin/service.ts:39`）。新体制は Supabase Auth のためこのハッシュは持ち込めない。既存アカウントを引き継ぐ場合はパスワードリセット（メール再設定）前提の移行になる【推測】。
- パスワードのバリデーションは **最小8文字のみ**（`activate/controller.ts:27` `@MinLength(8)`）。

### 1.2 サインイン / トークン
- `POST /auth/signin`: loginId（=メール）+ パスワードのハッシュ一致で `AccountToken` レコードを作成。**アクセストークンJWT有効期限 1日、リフレッシュトークン 90日**（`signin/service.ts:77,86`）。
- **リフレッシュトークンを使うrefreshエンドポイントは存在しない**（auth配下は signup/signin/signout/activate のみ）。90日トークンは発行されるだけで未使用。【推測】将来実装予定の残骸。
- **設定名のミスリードに注意**: リフレッシュ用シークレットは環境変数 `API_JWT_REFRESH_TOKEN_EXPIRATION_TIME` から読む（`shared/config/jwt.config.ts:5-6`）。名前は「有効期限」だが実体はシークレット。
- **JWT検証の暗黙挙動**: `AuthTokenStrategy.validate` はペイロードの `loginId` と `accountId` で PasswordGrant を検索する（`shared/security/accessToken/guard.strategy.ts:27-33`）が、**signinが発行するJWTペイロードには `accountId` しか入っていない**（`signin/service.ts:70-73`）。`loginId: undefined` はPrismaでは条件無視となるため、実質 **accountIdのみで認証が通る**。移行先で「undefinedを条件に含める」ORMを使うと全リクエストが401になる。
- **AccountTokenテーブルはJWT検証に使われていない**（strategyはDBのトークンを照合しない）。signoutで該当 accessToken の行を削除する（`signout/service.ts:10-16`）が、**JWT自体は期限まで有効なまま**。サーバーサイド失効は実質機能していない。
- ガードはリクエストに `request.accressToken`（typo込み）を詰める（`shared/security/accessToken/guard.ts:20`）。

### 1.3 契約（Contract）
- 全アカウントは作成時に `ContractType.FREE` の契約を1つ持つ（`activate/service.ts:63-68`）。enumは `FREE | ORGANIZATION` のみ（`schema.prisma:76-79`）。
- **ORGANIZATION契約を付与するAPIは存在しない**。シーダーでのみ作成される（`packages/database/prisma/seeds/factory/accounts.ts:49-62`）。**【学校向け残骸】**

### 1.4 学習統計
- `GET /accounts/me/stats`: 総学習時間 = learnings.durationTime の合計、学習カード数 = `count(distinct card_id)` の生SQL（`account/methods/getAccountStats/service.ts:21-35`）。

---

## 2. デッキとカード

### 2.1 データモデルの暗黙構造
- デッキは「カードテンプレート（HTML+変数）」と「デッキトピック構造（属性定義）」の2層メタモデルを持つ:
  - `CardTemplate.content` は **`{{variable}}` プレースホルダを含むHTML文字列（Tailwindクラス付き）**（シーダー例: `packages/database/prisma/seeds/seed.ts:57-66`）。
  - `DeckTemplateMapping` が「デッキ属性 ⇔ テンプレート変数」を1:1で対応付ける（`schema.prisma:530-554`、`(deckStructureAttributeId, cardTemplateVariableId)` 一意）。
  - カード実データは `CardTopicValue`（属性IDと文字列value）として保存。**型が何であれDBは全て文字列**（`schema.prisma:461`）。
- `Card.order` は **数値でなく VarChar(255) の文字列**（`schema.prisma:431`）でインデックス付き。【推測】辞書順ソート（fractional indexing的用途）を意図。
- `Deck.estimatedLearningHour` はカラム名が `estimated_learning_duration`（`schema.prisma:257`）。シーダーでは 60 や 30 が入っており単位が曖昧。【推測】「分」の可能性あり。

### 2.2 デッキの状態
```
DeckStatus: DRAFT ──(updateDeckで status指定)──> PUBLISHED
                    （逆方向も自由。API上は任意に行き来できる）
DeckLevel: NONE | EASY | MEDIUM | HARD（デフォルト EASY）
```
- **重要な暗黙事実: `status`(DRAFT/PUBLISHED) は一覧・取得・学習のどこでもフィルタに使われていない**。listDecks（`decks/methods/listDecks/service.ts:200-215`）にもstatus条件はなく、DRAFTのデッキも誰でも閲覧・学習できる。公開状態は現状「表示用ラベル」にすぎない。

### 2.3 デッキ作成 / 更新のトランザクション境界
- createDeck: DeckTopicStructure → 各マッピングごとに DeckStructureAttribute + DeckTemplateMapping → Deck を**単一トランザクション**で作成（`createDeck/service.ts:370-422`）。
- **S3画像操作はトランザクション外・失敗握り潰し**: `tmp/uploads/{accountId}/decks/{tempId}` から `uploads/{accountId}/decks/{deckId}/{timestamp}` へコピー→元削除。例外は `console.error` のみで処理続行（`createDeck/service.ts:359-368`）。つまり画像なしデッキが黙って作られうる。
- updateDeck: 入力に含まれない既存マッピングは **DeckTemplateMapping → DeckStructureAttribute の順に物理削除**（tx内）。ただし削除される属性に紐づく **CardTopicValue はFKがRESTRICTのため、既存カードに値があると更新自体が失敗する**はず。【推測】属性削除運用は実データがあると壊れる未検証パス。
- updateDeck の画像差し替え時は旧画像もS3から削除（同 try/catch 握り潰し）。

### 2.4 デッキ画像
- アップロードは presigned POST 方式。**MIMEは `image/jpeg` / `image/png` のみ許可**（`createDeckImageUploadPresignedUrl/service.ts:18`）。一時キーは `tmp/uploads/{accountId}/decks/{nanoid()}`。
- presigned URL 期限は環境変数 `AWS_S3_PRESIGNED_POST_EXPIRES`（`shared/config/aws.config.ts:19`、`s3.service.ts:55`）。
- listDecks はデッキごとに presigned ダウンロードURLを生成し、**S3スループット対策で並列数を p-limit(10) に制限**、失敗時は `imageUrl: null` で続行（`listDecks/service.ts:240-289`）。

### 2.5 カードのバリデーション（サービス層。DTOでは検証されない）
createCard / updateCard 共通（`createCard/service.ts:87-143`, `updateCard/service.ts` 同等）:
1. デッキの必須属性すべてに値があること（欠けると `"<属性名> are required"` 400）。
2. 未知の deckStructureAttributeId はエラー。
3. 型検証（値が非空のときのみ）:
   - NUMBER: `isNaN(Number(value))` でなければOK
   - DATE: **`YYYY-MM-DD` 厳密形式**（`dayjs(value, 'YYYY-MM-DD', true)`）
   - BOOLEAN: 文字列 `'true'` / `'false'` のみ
   - STRING: 常にOK
4. 任意属性は空文字許容。ただしDTO側は `value` に `@IsNotEmpty()`（`createCard/controller.ts:222`）なので、**実際にはHTTP経由で空値は送れない**（サービス層の寛容さはデッドコード気味）。

### 2.6 カード更新の差分ロジック
- updateCard: 入力に `id` を持たない topicValue は新規作成、`id` 持ちは更新、**入力に含まれない既存 CardTopicValue は物理削除**（`cardTopicValue.deleteMany where id notIn`。tx内）。「送らなかったものは消える」PUT完全置換セマンティクス。

### 2.7 削除
- deleteDeck は **配下の全カードを先に論理削除してからデッキを論理削除**するが、**この2操作はトランザクションで囲まれていない**（`deleteDeck/service.ts:845-857`）。
- deleteCard / listCards の `includeDeleted=true` で削除済みも取得可能（`listCards/service.ts:30-33`）。
- **注意**: deleteDeck のみ「システム所有デッキ（ownerAccountIdなし）は編集不可」ガードが**ない**（createCard/updateCard/deleteCard/updateDeckにはある。例: `createCard/service.ts:64-67`）。【推測】ガード漏れ。

### 2.8 システム所有リソースという概念
- `Deck.ownerAccountId` は必須だが、コード上は「オーナーがいないデッキ＝システム作成デッキで編集不可」という前提コメントが複数ある（`createCard/service.ts:64-67` ほか）。スキーマ上NOT NULLなのにnullチェックがあるのは矛盾。**【推測】旧スキーマではnullableで、システム提供公式デッキが存在した名残。**
- `CardTemplate.ownerAccountId` は実際にnullable（`schema.prisma:481`）で、**null = 全ユーザー共通テンプレート**として一覧に常に含まれる（`listCardTemplates/service.ts:41-55` の `ownerAccountId: null` OR条件）。

### 2.9 既知の集計バグ（移行時に直すべき暗黙挙動）
- listMyDecks の `total` は **全ユーザー分をカウント**（`myDecks/methods/listMyDecks/service.ts:33` `myDeck.count()` にwhereなし）。
- listCardTemplates の `total` も同様に全件カウント（`listCardTemplates/service.ts:28`）。

---

## 3. マイデッキと学習 / 復習ロジック

### 3.1 マイデッキ
- `POST /my-decks` は **upsert**（`(deckId, accountId)` 一意制約 `schema.prisma:417` に対して既存なら何もしない）（`createMyDeck/service.ts:63-71`）。二重追加は静かに成功する。
- マイデッキの削除APIは存在しない。

### 3.2 学習記録（Learning）
- Learning = 「1カードを1回見た」記録。`startAt`(default now) / `endAt`(nullable) / `durationTime`(default 0) を持つ（`schema.prisma:686-690`）。
- フロー: カード表示時に `POST /learnings` で作成 → 終了時に `PUT /learnings/:id` で endAt/durationTime を更新。**【推測】**（updateLearning が startAt/endAt/durationTime しか受けないことから）。
- `durationTime` の単位はコード上未定義。**【推測】秒**（StudyViewのセッション計測が秒基準のため）。
- updateLearning は本人の Learning しか更新できない（`updateLearning/service.ts:39-41`）。

### 3.3 連続学習日数（consecutiveLearningDays）— 最重要の暗黙ルール
`createLearning/service.ts:70-99`:
```
previousLearning = そのカードIDの最新のLearning（※accountId条件なし！）
diff = 今日(startOfDay) - previousLearning.startAt(startOfDay) の日数（記録なしなら0）
consecutiveLearningDays = diff < 2 ? account.consecutiveLearningDays + diff : 1
```
- diff=0（同日2回目）→ 加算なし、diff=1（翌日）→ +1、diff≥2（2日以上空いた）→ 1にリセット。
- Learning作成とアカウント更新は**同一トランザクション**（`service.ts:84-101`）。
- **バグ相当の暗黙挙動が2つ**:
  1. `previousLearning` の検索条件が `{ cardId }` のみで **accountId で絞っていない**（`service.ts:70-72`）。他人がそのカードを学習していても「前回学習」と見なされる。
  2. カード単位の前回学習で判定しているため、**別のカードを毎日学習しても連続日数が正しく伸びない**（初学カードは diff=0 扱い）。
  移行時は「アカウント単位の最終学習日」で再設計すべき。【推測を含む評価】

### 3.4 デッキ完了率・習熟率の定義（listDecksStats の生SQL）
`decks/methods/listDecksStats/service.ts:419-483`:
- **completion_rate（完了率） = 1回でもLearningがあるカード数 / デッキ総カード数**
- **proficiency_rate（習熟率） = 正解したことのある問題数(distinct card_question_id where is_correct) / デッキ総問題数**
- last_study_date = そのユーザーのLearningの `updated_at` の最大値。
- **INNER JOIN の副作用**: 試験（Exam）を一度も作っていないデッキは結果から**行ごと消える**（`ta` サブクエリがINNER JOIN）。total件数（myDeck数）と実際の行数が食い違う。

### 3.5 フロントの学習セッション（StudyView）
`apps/web-new/app/decks/[deckId]/study/StudyView.tsx`:
- カードは最大 `take: 100` で全件取得して順送り（line 29）。
- 学習開始前に儀式的メッセージ画面（`StudyIntro`、`hasBegun` state）を挟む。
- セッション完了時に「アーキタイプへの投票」を記録（§5参照）。**学習記録API（/learnings）は呼んでいない**。現行web-newの学習はサーバーに残らない。【推測】未接続のまま先行実装。
- StudyView内の投票強度計算（`StudyView.tsx:103-117`）は lib 版と**別実装**で係数が異なる: 10分以上 +0.5 / 裏返し率70%以上 +0.5 / 平均20〜60秒 +0.3、上限2。移行時はlib版（§5.3）に統一すべき。

---

## 4. 試験（Exams）

- **Examを作成するAPIエンドポイントが存在しない**（examsのmethodsは createExamQuestionAttempt / createExamQuestionResult のみ）。Examレコードはシーダー（`seeds/factory/exams.ts` 経由、`seed.ts:252`）でしか作られない。**現状、試験機能はAPIとして未完成**。
- 同様に **CardQuestion の作成APIもない**（decksのmethodsに listCardQestins（typo込み）のみ。作成はシーダー `seed.ts:230-236`）。
- 試験の記録は2種類:
  - `ExamQuestionAttempt` = 問題を提示した記録（`POST /exams/:examId/attempts`）
  - `ExamQuestionResult` = 回答結果。**`answer`（回答文字列）と `isCorrect` はクライアントが自己申告する**（`createExamQuestionResult/controller.ts:34-38`）。サーバーは `cardQuestion.contentAnswer` と照合しない。正誤判定はフロント責務という暗黙契約。
- 両APIとも「exam が指定 deckId に属すること」を検証（`createExamQuestionAttempt/service.ts:55-60`）。cardQuestionId がそのdeckに属するかは**検証しない**。
- 同一問題に複数Resultを記録可能（リトライ表現）。習熟率は distinct で数えるので重複してもインフレしない（§3.4）。

---

## 5. アーキタイプ診断・投票（web-newのアイデンティティシステム）

完全にフロントエンド（localStorage）内で完結。バックエンドに対応テーブルなし。

### 5.1 アーキタイプ定義
`apps/web-new/lib/archetypes/definitions.ts:6-160`: 3種のみ（Phase 1 MVP）
- `thinker` 思想家 / `creator` 創作家 / `scientist` 科学者。全て rarity `common`。
- 各アーキタイプは成長ステージ 0→1→2 の3段階（例: 問いを持つ者→探求者→思想家）。

### 5.2 オンボーディングフロー
```
/ (isOnboardingCompleted=false) → /onboarding/welcome
  → /onboarding/archetype-select（1枚ずつのカード送り。選択時に selectArchetype(id)）
  → /onboarding/confirmation?archetype=<id>
  → selectArchetype(id) 再実行 + 2秒の儀式的静止（reduced-motion時0秒） + completeOnboarding() → /
```
（`app/page.tsx:24-38`, `ArchetypeSelectView.tsx:31`, `ConfirmationView.tsx:38`）。ホームは zustand persist の **hydration完了を待ってから** `isOnboardingCompleted` でリダイレクト判定する（未完了時のチラつき防止）。アーキタイプ選択で進捗が初期化される（ステージ0、投票0。`lib/stores/archetype-store.ts:44-86`）。同じIDの再選択はno-op（store:45-47）。

### 5.3 投票強度の計算式（lib版 = 正典）
`lib/archetypes/vote-calculator.ts:44-86` `calculateVoteStrength`:
```
base = 1
+0.3 if セッション時間 >= 10分
+0.2 if 学習カード数 >= 5
+0.2 if 平均カード時間 >= 30秒
+0.2 if 裏返し率(flipped/studied) >= 0.5
+0.1 if 連続日
→ min(2, base)   // 範囲は1〜2
```
アクション補正 `adjustStrengthByAction`（同:91-120）:
- daily_study ×1 / deep_engagement ×1.2 / return_after_break ×1.1 / explore_new_topic ×1.15 / review_old_material ×1 / **complete_deck・consistent_week は常に 2（最大値固定）**。いずれも上限2でクランプ。
- 型定義コメントの「strength: 1-5」（`types/vote.ts:11`）は古い。実装は1-2。

### 5.4 成長ステージ昇格条件（隠しパラメータ）
`vote-calculator.ts:126-158` `calculateGrowthProgress`:
- **Stage 0→1: 総投票数 ≥ 15 かつ 平均品質 ≥ 1.3 かつ アクティブ日数 ≥ 7**
- **Stage 1→2: 総投票数 ≥ 50 かつ 平均品質 ≥ 1.5 かつ アクティブ日数 ≥ 21**
- Stage 2 が最終。昇格判定は投票追加のたびに `updateProgress` で自動実行（`archetype-store.ts:104-183`）。1回の判定で1段しか上がらない。
- 隠しパラメータの簡易計算（store:151-156）: contemplationDepth = 平均品質×10、consistency = 現ストリーク/10、curiosityIndex = アクティブ日数×2。

### 5.5 ストリーク計算
`vote-calculator.ts:163-217`: 投票日の重複除去後、「今日」から1日ずつ遡って連続していれば currentStreak を加算（**今日投票していなければ現ストリークは0**）。longestStreak は隣接日差=1の連鎖の最大長。

### 5.6 数値の詩的表現（ゲーミフィケーション回避ポリシー）
`vote-calculator.ts:6-38` `formatPoeticNumber`: 投票数を数値で見せず「始まりの時(0)/僅かな歩み(<10)/着実な歩み(<30)/確かな歩み(<50)/深き歩み(<100)/豊かな歩み(<200)/偉大なる歩み」等に変換。ストリーク・日数にも同様の段階語彙。**「数値を直接見せない」ことがプロダクト方針**（`docs/why-not-gamification.md` の思想と一体）。

### 5.7 別系統の投票実装（未統合）
`lib/hooks/useVoting.ts:78-88` にはカード単位の投票（confidence 1-5 × 正誤 × 時間ボーナス、`base(正解1.0/不正解0.5) × confidence/5 + min(time/30,1)×0.2`）という**別の計算式**が存在し、`/demo/voting` デモで使用。archetype-store 系とは独立。**【推測】実験実装の残骸。移行時はどちらを正とするか要決定。**

---

## 6. 権限モデル（全機能横断）

### 6.1 デッキ「閲覧・学習」系の権限チェック — ザル判定に注意
createLearning / createMyDeck / createExamQuestionAttempt / createExamQuestionResult に共通のパターン（`createLearning/service.ts:53-63` ほか）:
```
デッキのオーナー本人ならOK。
そうでなければ「何らかの組織に所属していれば」OK
  （organizationMemberRel.count({ memberAccountId: account.id }) > 0 のみ。
   デッキ所有組織との関係は見ていない！）
```
→ **どこかの組織に1つでも所属していれば、他組織のデッキでも学習・マイデッキ追加・受験できる**。組織非所属の個人は他人のデッキに一切アクセス不可。**【学校向け残骸】かつ実質バグ**。移行時は「デッキの所有者 or デッキ所有組織のメンバー」に修正すべき。
- さらに `GET /decks/:deckId`、`GET /decks/:deckId/cards`、cardQuestions・画像URLは**認証さえ通れば所有チェックなし**（`getDeck/service.ts`, `listCards/service.ts` にaccount条件なし）。

### 6.2 デッキ「編集」系の権限チェック（正しい方の実装）
createCard / updateCard / deleteCard / deleteDeck / updateDeck / cardTemplate系（`createCard/service.ts:69-85` ほか）:
```
オーナー本人 or デッキ所有アカウントを組織とする ADMIN / EDITOR ロール保持者のみ。
PLAYER は編集不可。
```
- getCardTemplate の閲覧は**ロール不問**（所属していれば良い。`getCardTemplate/service.ts:46-55`）。

### 6.3 ロール体系 【学校向け残骸】
- `OrganizationMemberRelRole = ADMIN | EDITOR | PLAYER`（`schema.prisma:146-150`）。relのデフォルトはADMIN、招待セッションのデフォルトはPLAYER（`schema.prisma:132,220`）。
- 【推測】ADMIN=教師/管理者、EDITOR=教材編集者、PLAYER=生徒。

---

## 7. 組織（学校向けプラン）【学校向け残骸】独立整理

以下は organizations フィーチャー＋関連テーブル群。現行プロダクト方針（個人向け・アーキタイプ学習）では使われていないと思われるが、**権限判定に深く食い込んでいる**（§6.1）。

### 7.1 組織の実体
- **「組織」は独立エンティティではなく、ContractType=ORGANIZATION の Account そのもの**（`organizations/security/organization/guard.ts:55-59` で contract を検証）。組織作成APIはなくシーダーのみ。

### 7.2 組織メンバー招待フロー
```
POST /organizations/:organizationAccountId/invite（要: AccessToken + OrganizationGuard + ADMINロール）
  → OrganizationMemberInviteSession(INPROGRESS, role指定, token=SHA256(salt+email+orgId+時刻))
  → 招待メール送信（件名「招待メール」）
POST /organizations/:organizationAccountId/activate/:token（要ログイン）
  → session.email === ログイン中アカウントのemail を検証（invite先本人のみ）
  → OrganizationMemberRel 作成 + セッション VERIFIED（トランザクション）
```
（`invite/service.ts:35-67`, `activate/service.ts:20-52`）
- 暗黙ルール: **同一メールにINPROGRESSセッションが既にあれば新規作成せず既存トークンを再送**（`invite/service.ts:36-58`）。このとき **role・組織IDの指定は無視される**（別組織から同じ人を招待しても最初の招待が使い回される）。実質バグ。
- 招待に有効期限なし。activate時に組織ガードは通らない（トークン一致とメール一致のみ）。
- Roles未指定のエンドポイントでは「組織のメンバーであれば誰でも」通る。組織アカウント自身は常に通る（`guard.ts:61-63`）。

### 7.3 グループ 【学校向け残骸】
- Group（【推測】クラス/学級に相当）は組織アカウントに属し、`OrganizationMemberGroupRel` でメンバーを、`GroupDeckRel` でデッキを紐付ける（`schema.prisma:81-119, 382-400`）。
- **グループのCRUD APIは存在しない**（シーダーのみ）。唯一の利用箇所は `GET /decks?groupId=` によるデッキ一覧の絞り込み（`listDecks/service.ts:187-213`）。
- listDecks は `organizationAccountId` が**必須クエリ**（`listDecks/controller.ts:318-322`）で、「その組織が所有するデッキ + その組織のメンバーが所有するデッキ」を返す。個人利用でも自分のIDを organizationAccountId として渡す設計。**【学校向け残骸】**（web-newのclientもこのパラメータを持つ: `lib/api/client.ts:103-110`）。

### 7.4 その他の残骸マーク
- listDecksStats の completion/proficiency 集計は【推測】学校向けダッシュボード（教師が生徒の進捗を見る）想定だった。
- MyDeck を介した「配布デッキを生徒が自分の棚に追加する」動線（createMyDeck のザル権限 §6.1）。
- シーダーの登場人物（山田太郎=組織管理者 admin@example.com、田中一郎=EDITORメンバー、田中二郎=別組織。全員パスワード `adminpass`、ハッシュsaltは `'example'` 固定。`seeds/factory/accounts.ts:7,42`）。

---

## 8. シーダーが前提とするマスタデータ

`packages/database/prisma/seeds/seed.ts`（冪等: name/email等で既存検索してあれば再利用）:
- **カードテンプレート3種（事実上のマスタ）**: 「英単語」（title/phonetic/meaning/example_en/example_ja、全て必須STRING）、「四字熟語」（title/rubi/meaning/example）、「ことわざ・故事成語」（title/rubi/description）（seed.ts:55-186）。テンプレのcontentはTailwindクラス入りHTML。
- **注意**: 四字熟語テンプレは変数定義が `meaning` なのにcontent側は `{{description}}` を参照しており不整合（seed.ts:110-117 vs 124-129）。移行時の要修正点。
- カテゴリ: 「歴史」「日本史」「英語」（seed.ts:240-243）。カテゴリ作成APIは存在せず、シーダーのみ。
- デッキ3種（大学受験英単語2000等）、カード2枚、問題1問、試験1回分の結果（誤答→正答）。

---

## 9. 移行時に特に注意すべき「暗黙仕様」トップ10（要約）

1. パスワードは SHA256(salt+password)。salt既定値 'example'。Supabase Auth には移せないため、既存アカウント引き継ぎはパスワードリセット前提【推測】（§1.1）。
2. JWT検証は実質 accountId のみ（loginId は undefined で条件無視）。Supabase Auth 移行で消滅する癖だが、旧DBのトークンデータを読む際の前提知識（§1.2）。
3. DeckStatus はどこでも強制されていない。「公開/下書き」は飾り（§2.2）。
4. 連続学習日数はカード単位の前回学習・他人の学習も混入するロジック（§3.3）。
5. デッキ閲覧系権限は「どこかの組織に所属していれば全デッキOK」のザル判定（§6.1）【学校向け残骸】。
6. 試験の正誤はクライアント自己申告。Exam/CardQuestion 作成APIは未実装（§4）。
7. アーキタイプ進捗・投票は localStorage のみ。サーバー移行するならデータモデルから新設（§5）。
8. 昇格しきい値: 15票/品質1.3/7日 → 50票/品質1.5/21日。投票強度は1〜2（§5.3-5.4）。
9. 論理削除は softDelete ゲッター経由のみ有効。素のクエリは削除済みを返す（§0）。
10. listMyDecks / listCardTemplates の total は全ユーザー分を数えるバグ挙動（§2.9）。

---

*本文書はコード読解に基づく草稿であり、【推測】箇所は元開発者への確認を推奨する。*
