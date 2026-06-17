import { APP_NAME } from "./brand";

type AchievementInput = {
  score: number;
  personalityTag: string;
  qualified: boolean;
};

export type ShareAchievement = {
  rank: "S+" | "S" | "A" | "B";
  title: string;
  rarity: string;
  percentile: number;
  badge: string;
  shareText: string;
};

export function buildShareAchievement({ score, personalityTag, qualified }: AchievementInput): ShareAchievement {
  if (!qualified) {
    return {
      rank: "B",
      title: "章丘恋爱副本观战席",
      rarity: "待解锁",
      percentile: Math.max(52, Math.min(76, score)),
      badge: "补给中",
      shareText: `我在${APP_NAME}拿到 ${score} 分，暂时进入观战席，等一个复活赛名额。`
    };
  }

  if (score >= 95) {
    return {
      rank: "S+",
      title: "章丘心动天选玩家",
      rarity: "限定高能战绩",
      percentile: 96,
      badge: "全服发光",
      shareText: `我在${APP_NAME}拿到 ${score} 分，解锁 ${personalityTag}，击败 96% 章丘男生。`
    };
  }

  if (score >= 90) {
    return {
      rank: "S",
      title: "章丘恋爱主线玩家",
      rarity: "稀有上分战绩",
      percentile: 91,
      badge: "心动上分",
      shareText: `我在${APP_NAME}拿到 ${score} 分，解锁 ${personalityTag}，进入章丘恋爱主线。`
    };
  }

  if (score >= 84) {
    return {
      rank: "A",
      title: "章丘脱单潜力股",
      rarity: "高能潜力战绩",
      percentile: 84,
      badge: "稳定发挥",
      shareText: `我在${APP_NAME}拿到 ${score} 分，解锁 ${personalityTag}，红娘说还有上升空间。`
    };
  }

  return {
    rank: "B",
    title: "章丘恋爱新手村勇者",
    rarity: "限定成长战绩",
    percentile: 78,
    badge: "待升级",
    shareText: `我在${APP_NAME}拿到 ${score} 分，解锁 ${personalityTag}，准备从新手村开练。`
  };
}
