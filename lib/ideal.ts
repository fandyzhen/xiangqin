import type { IdealPromptResult, IdealTypeSelection } from "./types";

type Rng = () => number;

const defaultRng: Rng = () => Math.random();

const PREFIX = "一位年轻的中国女生，现代社交 App 高级头像风格，半身像，亚洲面孔，五官自然精致，甜美但不幼稚，清新干净的背景，柔和光线，温暖氛围";
const SUFFIX = "高质量半写实插画，画面干净，构图居中，适合移动端恋爱匹配卡片";

export const NEGATIVE_PROMPT = "多人，多张脸，畸形，多手指，五官错位，模糊，低质量，写实照片，性感暴露，过于成熟，文字水印";

export const IDEAL_OPTIONS = {
  appearanceVibe: {
    清甜元气: "清甜元气的第一眼气质，笑容明亮，浅色休闲穿搭",
    温柔知性: "温柔知性的第一眼气质，眼神柔和，针织或衬衫穿搭",
    清冷高级: "清冷高级的第一眼气质，简约高级感通勤穿搭",
    明艳姐姐: "明艳大方的第一眼气质，精致都市感穿搭",
    邻家自然: "邻家自然的第一眼气质，舒适生活感穿搭",
    运动阳光: "运动阳光的第一眼气质，干净活力的休闲运动穿搭"
  },
  companionStyle: {
    情绪稳定: "情绪稳定，相处舒服，气场柔和不压迫",
    活泼有梗: "活泼有梗，表情灵动，有聊天氛围感",
    温柔会照顾人: "温柔会照顾人，亲和耐心，眼神有照顾感",
    独立不粘人: "独立不粘人，自信从容，有边界感",
    甜美黏人: "甜美黏人，笑容亲近，有恋爱感",
    慢热真诚: "慢热真诚，安静耐看，越看越舒服"
  },
  bodyType: {
    娇小可爱: "娇小的身形",
    匀称自然: "身材匀称自然",
    高挑纤细: "高挑修长的身形",
    健康运动: "健康有活力的身形",
    微胖甜感: "微胖甜感的身形，中等偏圆润，不是苗条身材，温暖亲和"
  },
  lifestyle: {
    探店美食: "背景点缀咖啡甜点元素，有探店生活气",
    旅行拍照: "背景点缀淡淡的旅行风景元素",
    宅家追剧: "柔软居家氛围，温暖安静背景",
    健身运动: "阳光活力的运动氛围",
    音乐文艺: "背景点缀耳机或书本，文艺安静氛围",
    宠物生活: "身边有一只可爱的宠物，生活感自然"
  },
  relationshipMode: {
    甜甜恋爱: "整体氛围甜而不腻，有亲密恋爱感",
    彼此有空间: "气质独立舒服，有适度边界感",
    高频分享: "表情有分享欲，亲近自然",
    慢慢升温: "慢热稳定，画面温柔克制",
    一起奋斗: "清爽上进，有共同成长的精神气",
    稳定奔结婚: "稳定踏实，有长期相处的可靠感"
  },
  hairstyle: {
    长直发: "乌黑顺直的长发",
    长卷发: "蓬松柔顺的长卷发",
    齐肩短发: "清爽的齐肩短发",
    波波头: "干练利落的波波头",
    高马尾: "活力的高马尾",
    齐刘海长发: "齐刘海长发，减龄可爱"
  }
} as const;

const HAIR_COLORS = ["黑色长发", "深棕色头发", "自然棕色头发"];
const SKIN_TONES = ["白皙肤色", "健康自然肤色"];
const ACCESSORIES = ["戴一副小耳环", "戴一个发卡", ""];
const BACKGROUNDS = ["浅米色背景", "淡蓝色背景", "浅粉色背景", "奶白色背景"];
const ALL_APPEARANCE_VIBES = Object.keys(IDEAL_OPTIONS.appearanceVibe);
const ALL_LIFESTYLES = Object.keys(IDEAL_OPTIONS.lifestyle);

type PortraitDefinition = {
  src: string;
  appearanceVibes: readonly string[];
  hairstyles: readonly string[];
  bodyTypes: readonly string[];
  lifestyles: readonly string[];
};

export const IDEAL_PORTRAITS: PortraitDefinition[] = [
  {
    src: "/images/ideal-curvy-straight.png",
    appearanceVibes: ALL_APPEARANCE_VIBES,
    hairstyles: ["长直发"],
    bodyTypes: ["微胖甜感"],
    lifestyles: ALL_LIFESTYLES
  },
  {
    src: "/images/ideal-curvy-wavy.png",
    appearanceVibes: ALL_APPEARANCE_VIBES,
    hairstyles: ["长卷发"],
    bodyTypes: ["微胖甜感"],
    lifestyles: ALL_LIFESTYLES
  },
  {
    src: "/images/ideal-curvy-short.png",
    appearanceVibes: ALL_APPEARANCE_VIBES,
    hairstyles: ["齐肩短发"],
    bodyTypes: ["微胖甜感"],
    lifestyles: ALL_LIFESTYLES
  },
  {
    src: "/images/ideal-curvy-bob.png",
    appearanceVibes: ALL_APPEARANCE_VIBES,
    hairstyles: ["波波头"],
    bodyTypes: ["微胖甜感"],
    lifestyles: ALL_LIFESTYLES
  },
  {
    src: "/images/ideal-curvy-ponytail.png",
    appearanceVibes: ALL_APPEARANCE_VIBES,
    hairstyles: ["高马尾"],
    bodyTypes: ["微胖甜感"],
    lifestyles: ALL_LIFESTYLES
  },
  {
    src: "/images/ideal-curvy-bangs.png",
    appearanceVibes: ALL_APPEARANCE_VIBES,
    hairstyles: ["齐刘海长发"],
    bodyTypes: ["微胖甜感"],
    lifestyles: ALL_LIFESTYLES
  },
  {
    src: "/images/ideal-teacher-long.png",
    appearanceVibes: ["温柔知性", "邻家自然"],
    hairstyles: ["长直发"],
    bodyTypes: ["匀称自然"],
    lifestyles: ["宅家追剧", "音乐文艺"]
  },
  {
    src: "/images/ideal-medical-short.png",
    appearanceVibes: ["邻家自然", "清冷高级"],
    hairstyles: ["齐肩短发"],
    bodyTypes: ["匀称自然", "高挑纤细"],
    lifestyles: ["宠物生活", "宅家追剧"]
  },
  {
    src: "/images/ideal-workplace-wavy.png",
    appearanceVibes: ["明艳姐姐", "清冷高级", "温柔知性"],
    hairstyles: ["长卷发"],
    bodyTypes: ["高挑纤细", "匀称自然"],
    lifestyles: ["探店美食", "旅行拍照"]
  },
  {
    src: "/images/ideal-creative-bob.png",
    appearanceVibes: ["清冷高级", "邻家自然"],
    hairstyles: ["波波头"],
    bodyTypes: ["匀称自然"],
    lifestyles: ["音乐文艺"]
  },
  {
    src: "/images/ideal-student-ponytail.png",
    appearanceVibes: ["清甜元气", "运动阳光"],
    hairstyles: ["高马尾"],
    bodyTypes: ["娇小可爱", "匀称自然", "健康运动"],
    lifestyles: ["健身运动", "旅行拍照"]
  },
  {
    src: "/images/ideal-sweet-bangs.png",
    appearanceVibes: ["清甜元气"],
    hairstyles: ["齐刘海长发"],
    bodyTypes: ["娇小可爱"],
    lifestyles: ["探店美食", "宠物生活"]
  }
];

const HAIRSTYLE_PORTRAITS: Record<string, string> = {
  长直发: "/images/ideal-teacher-long.png",
  长卷发: "/images/ideal-workplace-wavy.png",
  齐肩短发: "/images/ideal-medical-short.png",
  波波头: "/images/ideal-creative-bob.png",
  高马尾: "/images/ideal-student-ponytail.png",
  齐刘海长发: "/images/ideal-sweet-bangs.png"
};

function pick<T>(items: readonly T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)] ?? items[0];
}

function optionText(group: Record<string, string>, key: string) {
  return group[key] ?? Object.values(group)[0];
}

function makeSeed(rng: Rng) {
  return `zq-${Math.floor(rng() * 1_000_000).toString(36).padStart(4, "0")}`;
}

export function buildIdealPrompt(selection: IdealTypeSelection, rng: Rng = defaultRng): IdealPromptResult {
  const parts = [
    PREFIX,
    optionText(IDEAL_OPTIONS.appearanceVibe, selection.appearanceVibe),
    optionText(IDEAL_OPTIONS.companionStyle, selection.companionStyle),
    optionText(IDEAL_OPTIONS.bodyType, selection.bodyType),
    optionText(IDEAL_OPTIONS.lifestyle, selection.lifestyle),
    optionText(IDEAL_OPTIONS.relationshipMode, selection.relationshipMode),
    optionText(IDEAL_OPTIONS.hairstyle, selection.hairstyle),
    pick(HAIR_COLORS, rng),
    pick(SKIN_TONES, rng),
    pick(ACCESSORIES, rng),
    pick(BACKGROUNDS, rng),
    SUFFIX
  ].filter(Boolean);

  return {
    prompt: parts.join("，"),
    negativePrompt: NEGATIVE_PROMPT,
    seed: makeSeed(rng)
  };
}

export function createFallbackPortrait(selection: IdealTypeSelection, seed: string) {
  const seedOffset = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const hairMatched = IDEAL_PORTRAITS.filter((portrait) => portrait.hairstyles.includes(selection.hairstyle));
  const exactMatched = hairMatched.filter((portrait) => portrait.bodyTypes.includes(selection.bodyType));
  const bodySafeHairMatched = hairMatched.filter((portrait) => {
    const curvyOnly = portrait.bodyTypes.length === 1 && portrait.bodyTypes[0] === "微胖甜感";
    return selection.bodyType === "微胖甜感" || !curvyOnly;
  });
  const candidates = exactMatched.length > 0 ? exactMatched : bodySafeHairMatched.length > 0 ? bodySafeHairMatched : IDEAL_PORTRAITS;
  const ranked = candidates.map((portrait, index) => {
    const score =
      (portrait.hairstyles.includes(selection.hairstyle) ? 8 : 0) +
      (portrait.bodyTypes.includes(selection.bodyType) ? 6 : 0) +
      (portrait.appearanceVibes.includes(selection.appearanceVibe) ? 3 : 0) +
      (portrait.lifestyles.includes(selection.lifestyle) ? 1 : 0);

    return { src: portrait.src, score, tieBreaker: (seedOffset + index) % IDEAL_PORTRAITS.length };
  }).sort((a, b) => b.score - a.score || a.tieBreaker - b.tieBreaker);

  return ranked[0]?.score ? ranked[0].src : HAIRSTYLE_PORTRAITS[selection.hairstyle] ?? "/images/ideal-fallback-premium.png";
}
