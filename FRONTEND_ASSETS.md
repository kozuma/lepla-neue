# フロントエンド資産カタログ（新リポジトリ移行用サルベージ文書）

作成日: 2026-07-18 / 調査対象: `apps/web-new/`（**feature/design-migration ブランチ** b7e61b33、node_modules・.next 除く全ソースを実読して判定）

---

## 0. 前提・重要な注意事項

- **本文書は `docs/CLAUDE.md`（開発憲法）§7 における「持ち出し許可リスト」である。本リストに無いコンポーネントを旧リポジトリから移植してはならない。**
- 持ち出し判定は憲法の確定スタック（Next.js App Router / Payload CMS / Route Handlers / Drizzle / Zod / Supabase Auth / R2 / Vitest）を前提に評価している。特に旧API層（axios + Bearer/localStorage + openapi-typescript）は新スタックと非互換のため、mainベースの旧版から判定を引き下げた項目がある（§2.1, §2.2, §3）。
- 本文書は **feature/design-migration ブランチ基準**。mainとの差分はフロント（apps/web-new、53ファイル）と CLAUDE.md・compose.yml のみで、**API・DBは無変更**（`git diff main --stat` で確認済みの事実）。
- 本ブランチで「静かな美術館」デザインシステムへの移行（Phase 0〜3）が完了しており、**mainベースの旧調査で指摘した主要バグの大半が解消済み**（§8参照）。
- 技術スタックの実態: **React Query (TanStack Query v5) + Zustand v5 + Next.js 16 + React 19 + Tailwind v4**。CLAUDE.mdの「Recoil, SWR, Next.js 15, React 18」という記載は古い（Recoil/SWRは一切使われていない）。

---

## 1. デザインシステム「静かな美術館」（独立セクション）

### 1.1 `app/globals.css`（313行、デザイントークンの単一情報源）
- **内容**: `:root` の Raw Palette（生成り/胡粉/墨/鈍色/金茶/緋 + アーキタイプ伝統色）→ Semantic Tokens（`--bg-base`, `--text-primary`, `--accent` 等）→ `@theme inline` によるユーティリティ生成（`bg-base`/`text-primary`/`bg-accent`/`border-line` 等）→ `@theme` の型スケール・字間・角丸・影・イージング・`max-w-ceremonial`(480px) → `@utility`（`font-ceremonial`/`duration-quick` 等）。`prefers-reduced-motion` 全体対応、`:focus-visible`、3Dカードフリップ用ユーティリティ同居。
- **Tailwind v4 の `@theme` 化は完了**。旧 `tailwind.config.ts` は削除済みで、mainで最重要バグだった「トークン未読込」は解消。
- **開発憲法との整合（事実）**: Raw Palette は憲法 §5 の基調パレット（生成り#F4F1E8 / 墨#2A2833 / 金茶#8F7340）と**hex値まで完全一致**（`globals.css:21,26,31`）。`[data-theme='night']` の夜パレットも憲法の記述どおり。**このファイルが憲法パレットの正典実装**。
- **依存**: Tailwind v4。フォントは next/font（`app/layout.tsx`）が CSS変数を注入する前提。
- **学校向け依存**: なし。
- **注意**: `[data-theme='night']` のダークパレットが定義済みだが未使用（将来用と明記あり）。
- **持ち出し判定**: **そのまま流用可**。新リポジトリのデザイン基盤の核。

### 1.2 `STYLE_GUIDE.md`（web-new直下、90行）
- **内容**: 「2つのレジスタ」（儀式的 Ceremonial / 機能的 Functional）の判定ルール、色のルール（金は1画面1要素、アーキタイプ色は面で塗らない）、禁止事項チェックリスト、アーキタイプアートワーク規約（タロット5:8、顔を描かない、ローマ数字 I〜V 等）。ルートCLAUDE.mdから参照される運用ドキュメント。
- **持ち出し判定**: **そのまま流用可**。
- **注意**: `docs/STYLE_GUIDE.md` に同一内容の複製が存在（デザイナー納品物の残置）。持ち出し時は一方に統一。

### 1.3 アーキタイプアートワーク
- `public/archetypes/archetype-{thinker,creator,scientist,explorer,sage}.svg`（5点）: タロット様式カード（viewBox 320×512）。ホーム/選択/確認/プロフィールで next/image 経由で表示。
- **注意（事実）**: SVGは5種あるが、`lib/archetypes/definitions.ts` の定義は **thinker/creator/scientist の3種のみ**。explorer/sage は定義未実装の先行アート。
- `lib/archetypes/artwork.ts`（13行）: ID→SVGパスのマップ + `getArchetypeCardImage()`。未知IDは thinker にフォールバック。
- **持ち出し判定**: いずれも**そのまま流用可**。視覚的アイデンティティの核。
- `docs/artwork/*.svg` は public/ と同一の納品原本（アーカイブ）。持ち出し不要。

### 1.4 歴史的文書・アーカイブ
- `docs/DESIGN_MIGRATION_PLAN.md`（89行）: Phase 0〜3 の移行計画書。実施済みなので歴史的文書だが、「`<img>` 経由ではSVG内テキストにWebフォントが効かない」という注意は今後も有用。参考資料として持ち出し可。
- `docs/globals.css`(202行) / `docs/tailwind.config.js`(92行): デザイナー納品原本（v3前提の旧版、実装に取り込み済み）。**デッドコード。持ち出さない**。
- `docs/design-system.md` / `docs/why-not-gamification.md`: 思想文書。**そのまま流用可**（design-system.mdの「インラインスタイル推奨」等はトークン化により古くなった部分あり）。
- `app/desing-example.jsx`（ファイル名タイポの旧デザイン案、ルーティング対象外）: **持ち出さない**。

---

## 2. lib/ — API層・ロジック

### 2.1 `lib/api/client.ts`（140行、mainから変更なし）
- **役割**: axiosベースのAPIクライアント。Bearerトークン管理（localStorage）、401時 `/login` リダイレクト、openapi-typescript生成型を使った型付きメソッド（auth/decks/cards/my-decks/accounts）。
- **依存**: axios、`@/types/api`（自動生成）。
- **学校向け依存**: **あり（軽度）**。`getDecks()` の `organizationAccountId` パラメータ【学校向け残骸】。
- **品質問題**: `params?: any, data?: any`、`signin`レスポンスの `response.token` 参照バグ（APIの実返却は `accessToken`）、リダイレクト先 `/login` ページは不在。トークンのlocalStorage保存はXSS耐性の観点で要再検討。
- **持ち出し判定**: **書き直したほうが早い**（旧版の「小修正で流用可」から**引き下げ**）。理由: 前提がすべて新スタックと非互換 — (1) 認証は Supabase Auth になるため Bearer/localStorage 管理と `/auth/*` メソッドは丸ごと不要、(2) 新APIは同一オリジンの Route Handlers なので axios ラッパの必然性がない（素の fetch で足りる）、(3) 型は openapi-typescript でなく Zod / drizzle-zod から導出する。残す価値があるのは「エンドポイントを型付きメソッドに列挙する」という設計方針のみ。

### 2.2 `lib/api/hooks.ts`（127行）
- **役割**: React Query hooks（`useDecks`/`useDeck`/`useCards`/`useMyDecks`/`useAddToMyDecks`/`useAccount`/`useSignIn`/`useSignOut`/`useSignUp`）。queryKey定数化、staleTime設定、mutation後invalidate。
- **mainからの変更**: 未使用の型エイリアス4つとimportの削除（-7行）のみ。**ロジック不変**。
- **学校向け依存**: `useDecks` パラメータ型に `organizationAccountId` が漏出【学校向け残骸】。
- **品質問題**: `USE_MOCK_DATA` フラグのモック分岐が useDecks/useDeck/useCards のqueryFn内にハードコード。
- **持ち出し判定**: **小修正で流用可（ただし骨格のみ）**。queryKey設計・staleTime・invalidate方針は流用価値があるが、queryFnの中身（client.ts呼び出し）は Route Handlers + fetch に全面差し替えになる。認証系フック（useSignIn/Out/Up）は Supabase Auth 移行で不要。実質「React Queryの構成パターンの持ち出し」であり、ファイルとしてのコピーではない。

### 2.3 `lib/api/mock-data.ts`（148行、変更なし）
- デッキ3件・カード数枚のモック。`USE_MOCK_DATA = NODE_ENV==='development' && NEXT_PUBLIC_USE_MOCK_DATA==='true'`（オプトイン、既定オフ）。
- **持ち出し判定**: **書き直したほうが早い**。生成型スキーマに強く結合しており、新APIでスキーマが変われば全て作り直し。

### 2.4 `lib/archetypes/definitions.ts`（189行、変更なし）
- **役割**: 3アーキタイプ（thinker思想家/creator創作家/scientist科学者）の定義データ。歴史上の人物、特質、成長3段階のコンテンツ + 検索関数。外部パッケージ依存なし。
- **注意**: 絵文字 `icon` フィールドはデッキ一覧/詳細のバッジでまだ使用中（STYLE_GUIDEの「絵文字乱用禁止」はアーキタイプアイコンを例外扱い）。
- **持ち出し判定**: **そのまま流用可（ただし持ち出し先はコードでなくシードデータ）**。開発憲法 §5 ではアーキタイプ定義は **Payload CMS で管理するコンテンツ**とされているため、このファイルはTSモジュールとしてではなく、Payloadコレクションの初期シード（`pnpm db:seed` に含める）の原稿として持ち出す。コンテンツ（人物・特質・成長段階の文言）の価値は不変。explorer/sage を追加する場合はSVGは既にある（§1.3）。

### 2.5 `lib/archetypes/vote-calculator.ts`（217行、変更なし）
- **役割**: 投票ドメインロジック。`formatPoeticNumber`（数値→詩的表現。Phase 2 以降ホーム/プロフィール/完了画面で全面採用）、投票強度計算、成長段階判定、ストリーク計算。純関数群。
- **持ち出し判定**: **そのまま流用可**。最も移植価値が高いファイル。開発憲法のディレクトリ規約 `services/voting.ts`（純粋関数・DB/fetch持ち込み禁止）に**そのまま収まる設計**であり、憲法が「Vitestでテストを書く価値が最も高い」とする箇所に該当する。持ち出しと同時にVitestテストを書くこと（現状テストはゼロ）。しきい値・係数（DOMAIN_KNOWLEDGE.md §5.3-5.4）は二層構造の「内部データ」なのでAPIレスポンス・UIに露出しないこと（憲法 §3-4）。

### 2.6 `lib/stores/archetype-store.ts`（254行、変更なし）
- **役割**: Zustand + persist（localStorageキー `lepla-archetype-store`）。選択アーキタイプ、投票履歴、進捗、オンボーディング完了フラグ。投票追加時に進捗再計算。
- **品質問題**: `userId: 'current-user'` ハードコード（TODO付き）。投票履歴のlocalStorage無制限蓄積（サーバ同期なし）。
- **持ち出し判定**: **書き直したほうが早い**（旧版の「小修正で流用可」から**引き下げ**）。理由: 開発憲法 §5 は「学習セッション・投票・進捗などの動的データすべて」を Route Handlers + DB（Drizzle）の管轄と定めており、localStorageを唯一の永続層とする本設計は憲法と正面から矛盾する。進捗再計算ロジックは既に vote-calculator.ts（→ `services/`）側にあるので、store側に救出すべき固有ロジックはほぼ無い。UI状態の薄いキャッシュとして Zustand を使い直すのは可。

### 2.7 `lib/hooks/useVoting.ts`（211行、変更なし）
- localStorage直書きの**別系統**投票実装（`lepla_voting_records`/`lepla_voting_stats`）。archetype-store系と**完全に二重実装**（データモデル・ストレージキー・計算式すべて別）。使用箇所は `app/demo/voting` と `components/voting/*` のみ。
- **持ち出し判定**: **書き直したほうが早い（＝持ち出さない）**。本流と重複する試作。confidence入力UIの発想のみ参考価値。

### 2.8 `lib/utils.ts`（64行）
- **mainからの変更**: 動的クラス生成のデッド関数 `getArchetypeTheme()` が**削除された**（既知バグ解消）。残りは `cn()`（clsx+tailwind-merge）、`formatDate`、`relativeDate` 等。
- **持ち出し判定**: **そのまま流用可**。

### 2.9 `lib/utils/uuid.ts`（19行、変更なし）
- **持ち出し判定**: **そのまま流用可**。

---

## 3. types/ — 型定義（すべてmainから変更なし）

| ファイル | 内容 | 判定 |
|---|---|---|
| `types/archetype.ts` | Archetype/GrowthStage/UserArchetype/UserProgress。ドメインの中核型 | **そのまま流用可** |
| `types/vote.ts` | IdentityVote/VoteAction/VoteStrengthParams | **そのまま流用可**（`strength: 1-5` コメントは古い。実装は1-2） |
| `types/deck.ts` | 手書きDeck/Card/StudySession型。生成型と同名二重定義・未使用 | **書き直したほうが早い**（StudySession型のみ将来価値） |
| `types/index.ts` | 未使用のUser/ApiResponse/フォーム型 | **書き直したほうが早い** |
| `types/card.ts`, `types/user.ts` | 0行の空ファイル | 持ち出さない |
| `types/api.ts`（1594行） | openapi-typescript自動生成。organizations招待/activate・`organizationAccountId`/`groupId` を含む【学校向け残骸】 | **持ち出さない**。新スタックにSwaggerは存在しない（Route Handlers + Zod）。型は Zod / drizzle-zod から導出するため、`swagger:*` スクリプトの仕組みごと不要（旧版の「仕組みは流用可」を撤回） |

---

## 4. components/

### 4.1 ui/ — 全面トークン化済み。学校向け依存なし
| コンポーネント | 役割 | 判定 |
|---|---|---|
| `ui/Button.tsx` | variant `primary/secondary/ghost`（mainにあった `mystical` 等は整理済み）、forwardRef、focus-visible | **そのまま流用可** |
| `ui/Card.tsx` | variant `default/archetype/mystical` の複合コンポーネント | **そのまま流用可**。ただし `archetype` variantは宣言のみでスタイル未定義（軽微なデッドvariant） |
| `ui/Modal.tsx` | createPortal + ESC/backdrop close + scroll lock | **そのまま流用可**。フォーカストラップ無し（a11y改善余地） |
| `ui/Spinner.tsx` | Spinner/Loading/Skeleton/LoadingCard | **そのまま流用可** |
| `ui/LoadingGrid.tsx` | デッキ一覧スケルトン | **そのまま流用可** |

### 4.2 layout/
| コンポーネント | 役割 | 判定 |
|---|---|---|
| `layout/Header.tsx` | 全面書き換え。ナビは `/` `/decks` `/profile` の3件（**すべて実在ルート**）。モバイルメニュー内蔵 | **そのまま流用可** |
| `layout/Footer.tsx` | 簡素化。ただし `/about` `/privacy` `/terms` への**未実装ルートリンクが残存** | **小修正で流用可**（リンク先の実装 or 削除） |
| `layout/Navigation.tsx` | — | **削除済み**（mainで指摘した型バグの温床。解消） |

### 4.3 study/（学習フロー — 移植価値の中心。トークン準拠済み）
| コンポーネント | 役割 | 判定 |
|---|---|---|
| `study/StudyIntro.tsx`（41行、**新規**） | 学習開始のフルスクリーン儀式的メッセージ。framer-motionフェードイン | **そのまま流用可** |
| `study/CardViewer.tsx` | フリップ/前後移動/キーボードショートカット統括 | **そのまま流用可** |
| `study/CardFace.tsx` | CSS 3Dフリップの表裏カード（globals.cssの3Dユーティリティとセット） | **そのまま流用可** |
| `study/CardRenderer.tsx` | `cardTopicValues[0]`=表、残り=裏の**仮実装**（コメントで明言、mainから継続） | **小修正で流用可**。新APIのカード構造に合わせた本実装が必須 |
| `study/CardNavigation.tsx` | 前後ボタン | **そのまま流用可** |
| `study/StudyHeader.tsx` | デッキ名/進捗 + 退出確認モーダル | **そのまま流用可** |
| `study/StudyCompletion.tsx` | 全面書き換え。数値でなく `formatPoeticNumber` の言葉で歩みを表示 | **そのまま流用可**。COMPLETION_MESSAGESは3アーキタイプ分のみ（explorer/sage追加時はフォールバック文言になる） |
| `study/StudyProgress.tsx` | — | **削除済み**（%プログレスバー。「数値を生で出さない」原則により廃止） |

### 4.4 deck/
- `deck/DeckCard.tsx`: トークン化済み。動的クラス問題は解消。アーキタイプ相性はカテゴリ名の文字列マッチによる**仮実装**（TODO明記）。
- **判定**: **小修正で流用可**（相性ロジックは仮実装と認識した上で）。

### 4.5 voting/（mainから変更なし）
- `voting/VoteCounter.tsx` / `VoteCounterOptimized.tsx`: 旧stone/amberダークテーマ + 絵文字 + ゲーム語彙のままで**新スタイルガイドに全面違反**。「レベル」「経験値」等の生数値露出は開発憲法の不可侵事項（§3-2 静かな美術館、§3-4 二層構造）にも抵触。使用はdemoのみ。依存先useVotingも破棄対象。
- **判定**: **持ち出さない（憲法違反のため持ち出し禁止）**。

---

## 5. app/ 配下のView

| View | 状態 | 判定 |
|---|---|---|
| `app/page.tsx`（ホーム） | 全面書き換え。zustand persistの**hydration完了待ち**→未オンボーディングなら `/onboarding/welcome` へredirect（mainの即時判定チラつきを解消）。上部=儀式的（カードSVG+詩的表現）、下部=機能的（今日の一歩/書庫）。二層構造の見本実装。mainにあったハードコード推奨デッキ（/decks/sample-*）は消滅 | **そのまま流用可** |
| `app/onboarding/welcome/WelcomeView.tsx` | タイマー送りの5連メッセージ+スキップ。トークン準拠 | **そのまま流用可** |
| `app/onboarding/archetype-select/ArchetypeSelectView.tsx` | Phase 1の基準実装として全面再実装。1枚ずつのカード送り（スワイプ/矢印）、金はCTA1つのみ。`selectArchetype(id)` は文字列渡しに修正済み（main既知バグ解消）。旧 `ArchetypeSelectExample.jsx` は削除済み | **そのまま流用可** |
| `app/onboarding/confirmation/ConfirmationView.tsx` | 295→108行に縮小。useSearchParams（page.tsxでSuspenseラップ済み）。確定時 `shadow-glow-gold` 演出+2秒静止（reduced-motion時0秒）→`completeOnboarding()`→`/` | **そのまま流用可** |
| `app/decks/DecksListView.tsx` | 機能的レジスタに移行。`useDecks({page, take:12})`。`organizationAccountId` 未指定のままTODOコメント残存【学校向け残骸】 | **小修正で流用可**（API接続の要） |
| `app/decks/[deckId]/DeckDetailView.tsx` | トークン化。`variant="elevated"` バグ解消。相性仮実装+言葉で示すaffinityLabel。スケルトン内蔵 | **小修正で流用可** |
| `app/decks/[deckId]/study/StudyView.tsx` | StudyIntro導入（`hasBegun` state）以外ロジック不変。投票強度のローカル計算がvote-calculator.tsと**別実装のまま残存**（係数: 600秒以上+0.5 / flipRate≥0.7 +0.5 / 平均20〜60秒+0.3、上限2）。`userId: 'current-user'` ハードコード。1秒間隔setIntervalで毎秒再レンダー | **小修正で流用可**。学習フローの核。強度計算はlib版に統一すべき |
| `app/profile/page.tsx` | 402→126行に全面書き換え。**モックデータ依存が消え、archetype-storeの実データ表示に**。mainで「書き直したほうが早い」とした問題（warrior/sage/explorerハードコード、ダミー統計、ゲーミフィケーション表現、ダークテーマ）はすべて解消 | **そのまま流用可** |
| `app/demo/voting/page.tsx` | ほぼ変更なし。旧ダークテーマのデモ | **持ち出さない** |
| `app/layout.tsx` | next/fontでフォント読込（CSS変数注入）+ Providers + Header/Footer。mainのフォント二重管理は解消 | **そのまま流用可** |
| `app/providers.tsx` | QueryClientProvider + devtools | **そのまま流用可** |

---

## 6. 学校向け機能への依存 まとめ

web-newには学校向けの**画面・コンポーネントは存在しない**。依存は以下3点のみで、除去は数分レベル:
1. `types/api.ts` — organizations招待/activateのエンドポイント型（自動生成物。新APIで再生成すれば消える）【学校向け残骸】
2. `lib/api/client.ts` / `lib/api/hooks.ts` — `getDecks`/`useDecks` の `organizationAccountId` パラメータ【学校向け残骸】
3. `app/decks/DecksListView.tsx:21` — 「organizationAccountId を適切に設定する必要」のTODOコメント【学校向け残骸】

---

## 7. 持ち出し優先度サマリ（開発憲法対応版）

**そのまま流用可（コア資産）**
- デザインシステム一式: `app/globals.css`（@theme化済みトークン。**憲法 §5 パレットの正典実装**）、`STYLE_GUIDE.md`、`public/archetypes/*.svg`（5点）、`lib/archetypes/artwork.ts`
- `lib/archetypes/vote-calculator.ts` → 新構成の `services/voting.ts` へ。**持ち出しと同時にVitestテストを書く**（憲法がテスト最優先と定める箇所）
- `lib/archetypes/definitions.ts` → コンテンツは**Payloadコレクションのシードデータ**として持ち出し
- `types/archetype.ts`, `types/vote.ts`、`lib/utils.ts`、`lib/utils/uuid.ts`、`app/providers.tsx`
- `components/ui/*` 全部、`components/study/*` 全部、`components/layout/Header.tsx`
- Views: ホーム、onboarding 3画面、profile、`app/layout.tsx`
- 思想文書: `docs/why-not-gamification.md`、`docs/design-system.md`（一部古い）

**小修正で流用可**
- `lib/api/hooks.ts`（**骨格のみ**: queryKey設計・invalidate方針。queryFnはRoute Handlers + fetchに差し替え、認証系フックはSupabase Auth移行で廃止）
- `components/deck/DeckCard.tsx`（相性ロジック本実装）、`components/layout/Footer.tsx`（未実装リンク）
- Views: DecksListView（API接続）、DeckDetailView、StudyView（強度計算の `services/voting.ts` 統一）

**書き直したほうが早い / 持ち出さない**
- `lib/api/client.ts`（**憲法対応で引き下げ**: Supabase Auth・同一オリジンRoute Handlersの前提でaxios+Bearer/localStorage構成が丸ごと不要）
- `lib/stores/archetype-store.ts`（**憲法対応で引き下げ**: 投票・進捗はRoute Handlers + DBの管轄。localStorage唯一永続は憲法 §5 と矛盾。固有ロジックはvote-calculator側に既にある）
- `lib/hooks/useVoting.ts` + `components/voting/*` + `app/demo/voting/`（本流と二重の試作系統。**生数値露出は憲法 §3 不可侵事項に抵触するため持ち出し禁止**）
- `types/deck.ts` / `types/index.ts`（二重定義・未使用）、`types/card.ts` / `types/user.ts`（空）
- `types/api.ts` + `swagger:*` スクリプト（新スタックはZod/drizzle-zodから型導出。Swagger自体が存在しない）、`lib/api/mock-data.ts`
- `docs/globals.css` / `docs/tailwind.config.js` / `docs/artwork/`（納品原本アーカイブ）、`app/desing-example.jsx`

---

## 8. 既知バグ一覧の更新（main版調査との照合）

| main版で指摘した問題 | feature/design-migrationでの状態 |
|---|---|
| Tailwind v4でカスタムトークン未読込（最重要） | **解消**。tailwind.config.ts削除、`@theme` 完全移行 |
| `bg-${...}` 動的クラス生成 | **解消**（grepヒット0。`getArchetypeTheme` 削除） |
| `selectArchetype(オブジェクト)` 型不一致 | **解消**（全呼び出しが文字列ID） |
| DeckDetailViewの `variant="elevated"` | **解消** |
| Navigation.tsxの型バグ | **解消**（ファイルごと削除） |
| 未実装ルートへのリンク | **一部残存**: Footerの `/about` `/privacy` `/terms`、client.tsの401→`/login`。Headerと `/decks/sample-*` は解消 |
| フォント二重管理 | **解消**（next/fontに一本化） |
| テストが1本も存在しない | **継続** |

**現ブランチで残る品質問題（移行時に対処）**
1. `userId: 'current-user'` ハードコード（archetype-store / StudyView）
2. StudyViewの投票強度ローカル計算がvote-calculator.tsと不整合（係数が別）
3. signinレスポンスの `response.token` 参照バグ（client.ts。APIは `accessToken` を返す）
4. Card の `archetype` variant がスタイル未定義
5. StudyCompletionのメッセージ辞書にexplorer/sageが無い（現状定義も3種なので実害なし）
6. StudyViewの1秒setIntervalによる毎秒再レンダー
7. `docs/` 配下のSTYLE_GUIDE.md複製・納品原本の残置
