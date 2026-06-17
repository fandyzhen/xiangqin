import type { IdealTypeSelection, MatchedGirl } from "./types";

type Rng = () => number;

const defaultRng: Rng = () => Math.random();

const NICKNAMES = ["小雨", "然然", "一一", "可可", "阿宁", "小满", "清清", "若曦"];
export const ZHANGQIU_RESIDENCES = [
  "明水街道",
  "双山街道",
  "枣园街道",
  "龙山街道",
  "埠村街道",
  "圣井街道",
  "普集街道",
  "绣惠街道",
  "相公庄街道",
  "文祖街道",
  "官庄街道",
  "曹范街道",
  "宁家埠街道",
  "高官寨街道",
  "白云湖街道",
  "刁镇街道",
  "黄河街道",
  "垛庄镇"
];
const SURPRISE_HOBBIES = ["养多肉", "手冲咖啡", "撸猫", "追剧", "逛明水古城", "做家常菜"];
const LIFESTYLE_HOBBIES: Record<string, string[]> = {
  探店美食: ["探店", "烘焙", "咖啡"],
  旅行拍照: ["旅行", "拍照", "逛明水古城"],
  宅家追剧: ["追剧", "做饭", "整理小家"],
  健身运动: ["健身", "跑步", "羽毛球"],
  音乐文艺: ["听歌", "看展", "读书"],
  宠物生活: ["撸猫", "遛狗", "宠物摄影"]
};
const LIFESTYLE_PROFESSIONS: Record<string, string[]> = {
  探店美食: ["新媒体运营", "烘焙师", "行政/运营"],
  旅行拍照: ["文旅策划", "摄影助理", "自由职业"],
  宅家追剧: ["行政/运营", "财务", "客服主管"],
  健身运动: ["体育老师", "健身教练", "护士"],
  音乐文艺: ["设计师", "音乐老师", "文案编辑"],
  宠物生活: ["宠物店主理人", "幼师", "护士"]
};

function pick<T>(items: readonly T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)] ?? items[0];
}

function bodyHeightRange(bodyType: string) {
  if (bodyType === "娇小可爱") return { min: 154, max: 160 };
  if (bodyType === "高挑纤细") return { min: 168, max: 174 };
  if (bodyType === "健康运动") return { min: 162, max: 170 };
  if (bodyType === "微胖甜感") return { min: 158, max: 165 };
  return { min: 160, max: 166 };
}

function deriveHeight(bodyType: string, rng: Rng) {
  const { min, max } = bodyHeightRange(bodyType);
  if (rng() < 0.5) {
    return min + Math.floor(rng() * (max - min + 1));
  }
  return rng() < 0.5 ? min - 1 : max + 1;
}

function deriveWeight(height: number, bodyType: string, rng: Rng) {
  const base = height - 112;
  const bodyOffset = bodyType === "娇小可爱" ? -3 : bodyType === "微胖甜感" ? 5 : bodyType === "高挑纤细" ? -1 : bodyType === "健康运动" ? 2 : 1;
  const humanOffset = [-3, -2, -1, 1, 2, 3][Math.floor(rng() * 6)] ?? 1;
  return Math.max(40, Math.round(base + bodyOffset + humanOffset));
}

function deriveProfession(lifestyle: string, rng: Rng) {
  return pick(LIFESTYLE_PROFESSIONS[lifestyle] ?? ["行政/运营", "老师/教育", "自由职业"], rng);
}

function imperfectMatchGap(selection: IdealTypeSelection, height: number, weight: number, rng: Rng) {
  const range = bodyHeightRange(selection.bodyType);
  const gapTemplates = [
    `${selection.companionStyle}和${selection.lifestyle}都挺对味，像是能自然聊下去的人。`,
    height > range.max
      ? `她比你原本想象中高一点点，站在一起反而更有画面。`
      : `她和你想象里有一点点差别，但看起来舒服，相处也不累。`,
    `身高体重不用卡得太死，舒服、顺眼、聊得来更重要。`,
    `${selection.bodyType}是你喜欢的大方向，最后那一点眼缘才最像缘分。`
  ];
  const picked = pick(gapTemplates, rng);
  return weight > height - 105 ? picked.replace("舒服", "亲近") : picked;
}

export function formatMatchCopy(matchPercent: number, matchGap: string) {
  return `不是满分才叫合适，${matchPercent}% 已经很有心动感。${matchGap}`;
}

export function generateMatchedGirl(selection: IdealTypeSelection, rng: Rng = defaultRng): MatchedGirl {
  const height = deriveHeight(selection.bodyType, rng);
  const weight = deriveWeight(height, selection.bodyType, rng);
  const uniqueHobbies = Array.from(new Set([...(LIFESTYLE_HOBBIES[selection.lifestyle] ?? [selection.lifestyle]), pick(SURPRISE_HOBBIES, rng), pick(SURPRISE_HOBBIES, rng)]));

  return {
    nickname: pick(NICKNAMES, rng),
    residence: `章丘区·${pick(ZHANGQIU_RESIDENCES, rng)}`,
    personality: selection.companionStyle,
    profession: deriveProfession(selection.lifestyle, rng),
    height,
    weight,
    hobbies: uniqueHobbies.slice(0, 4),
    matchPercent: 85 + Math.floor(rng() * 11),
    matchGap: imperfectMatchGap(selection, height, weight, rng)
  };
}

export function generateMatchedGirls(selection: IdealTypeSelection, count: number, rng: Rng = defaultRng): MatchedGirl[] {
  return Array.from({ length: Math.max(0, count) }, () => generateMatchedGirl(selection, rng));
}

export function randomMatchCount(rng: Rng = defaultRng) {
  return 3 + Math.floor(rng() * 6);
}
