/**
 * アーキタイプ（理想像）
 */
export interface Archetype {
  id: string;
  name: string;                    // "思想家"
  nameEn: string;                  // "THE THINKER"
  icon: string;                    // "🗿" またはドット絵パス
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  subtitle: string;                // "物事の本質を見抜く"
  description: string;             // 詳細説明

  // 文化的背景
  historicalFigures: HistoricalFigure[];

  // 関連分野
  relatedFields: string[];

  // 資質
  qualities: string[];

  // 成長パス
  growthStages: GrowthStage[];

  // 解放条件（レアアーキタイプの場合）
  unlockCondition?: UnlockCondition;
}

/**
 * 成長段階
 */
export interface GrowthStage {
  stage: number;                   // 0, 1, 2
  title: string;                   // "探求者"
  icon: string;                    // "🗿✨"
  description: string;
  milestone: string;               // "30回の投票"（表示用、実際の条件は隠す）
}

/**
 * 歴史上の人物
 */
export interface HistoricalFigure {
  name: string;                    // "ソクラテス"
  description: string;             // "「無知の知」を説き..."
}

/**
 * 解放条件（内部処理用、ユーザーには見せない）
 */
export interface UnlockCondition {
  description: string;             // 内部説明用
  check: (user: UserProgress) => boolean;
}

/**
 * ユーザーのアーキタイプ進捗
 */
export interface UserArchetype {
  userId: string;
  archetypeId: string;

  // 基本情報
  startedAt: Date;
  isPrimary: boolean;              // メインのアーキタイプか

  // 進捗（表示用）
  progress: {
    currentStage: number;          // 0-2
    daysActive: number;            // アクティブ日数
    currentStreak: number;         // 現在のストリーク
    longestStreak: number;         // 最長ストリーク
  };

  // 隠しパラメータ（表示しない）
  hidden: {
    totalVotes: number;
    qualityScore: number;          // 平均投票強度
    contemplationDepth: number;
    consistency: number;
    curiosityIndex: number;
  };
}

/**
 * ユーザー全体の進捗
 */
export interface UserProgress {
  userId: string;
  archetypes: UserArchetype[];
  unlockedArchetypes: string[];
  unlockedEnvironments: string[];

  // 統計
  stats: {
    totalDays: number;
    totalVotes: number;
    longestStreak: number;
    decksCompleted: number;
  };
}