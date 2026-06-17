import type { IdealTypeSelection } from "./types";

export type ChoiceOption = {
  value: string;
  emoji: string;
  desc: string;
};

export type IdealStep = {
  key: keyof IdealTypeSelection;
  title: string;
  subtitle: string;
  layout?: "grid" | "stack" | "segment";
  options: ChoiceOption[];
};

export const CUSTOMIZE_STEP_HINT = "选完会跳到下一关";
export const CUSTOMIZE_FINAL_HINT = "最后一步，选完就开奖";
export const IDEAL_LOADING_TITLE = "正在安排你的理想型出场";
export const IDEAL_LOADING_SUBTITLE = "把你刚才选的感觉，整理成一张心动卡。";

export const IDEAL_STEPS: IdealStep[] = [
  {
    key: "appearanceVibe",
    title: "第一眼更吃哪种气质？",
    subtitle: "先选第一眼会让你停一下的感觉。",
    layout: "grid",
    options: [
      { value: "清甜元气", emoji: "☀️", desc: "明亮亲近，青春感强" },
      { value: "温柔知性", emoji: "🌸", desc: "耐看舒服，有分寸感" },
      { value: "清冷高级", emoji: "🧊", desc: "简约克制，很有氛围" },
      { value: "明艳姐姐", emoji: "💄", desc: "自信大方，第一眼抓人" },
      { value: "邻家自然", emoji: "🍃", desc: "真实松弛，生活感强" },
      { value: "运动阳光", emoji: "🏃", desc: "健康活力，笑容明亮" }
    ]
  },
  {
    key: "companionStyle",
    title: "相处时你最看重哪种感觉？",
    subtitle: "想象日常聊天和相处，选你最想靠近的那种。",
    layout: "stack",
    options: [
      { value: "情绪稳定", emoji: "🧘", desc: "不内耗，相处很安心" },
      { value: "活泼有梗", emoji: "🫧", desc: "聊天不冷场，日常有趣" },
      { value: "温柔会照顾人", emoji: "🫶", desc: "能接住情绪，也懂回应" },
      { value: "独立不粘人", emoji: "🪐", desc: "有自己的节奏和边界" },
      { value: "甜美黏人", emoji: "🍑", desc: "恋爱感强，喜欢分享" },
      { value: "慢热真诚", emoji: "🍵", desc: "开始安静，熟了很可靠" }
    ]
  },
  {
    key: "bodyType",
    title: "更喜欢哪种身材状态？",
    subtitle: "不用迎合别人审美，选你自己真的会心动的状态。",
    layout: "grid",
    options: [
      { value: "娇小可爱", emoji: "🍬", desc: "轻盈甜感，保护欲拉满" },
      { value: "匀称自然", emoji: "✨", desc: "自然协调，耐看不夸张" },
      { value: "高挑纤细", emoji: "🪞", desc: "清冷显气质，穿搭利落" },
      { value: "健康运动", emoji: "🏃", desc: "阳光健康，行动力强" },
      { value: "微胖甜感", emoji: "🌷", desc: "温暖亲和，生活感更强" }
    ]
  },
  {
    key: "lifestyle",
    title: "你希望你们怎么过周末？",
    subtitle: "周末怎么过，最能看出两个人合不合拍。",
    layout: "grid",
    options: [
      { value: "探店美食", emoji: "🥐", desc: "一起找好吃的，有烟火气" },
      { value: "旅行拍照", emoji: "🧳", desc: "出门打卡，照片有故事" },
      { value: "宅家追剧", emoji: "🛋️", desc: "安静陪伴，也很舒服" },
      { value: "健身运动", emoji: "🏸", desc: "一起动起来，状态在线" },
      { value: "音乐文艺", emoji: "🎧", desc: "歌单、书、展览都有话题" },
      { value: "宠物生活", emoji: "🐾", desc: "有耐心，亲密感自然" }
    ]
  },
  {
    key: "relationshipMode",
    title: "你想要哪种恋爱模式？",
    subtitle: "你想谈得甜一点、稳一点，还是各自有空间一点？",
    layout: "grid",
    options: [
      { value: "甜甜恋爱", emoji: "🍓", desc: "恋爱感强，日常很甜" },
      { value: "彼此有空间", emoji: "🪐", desc: "不黏不累，边界舒服" },
      { value: "高频分享", emoji: "💬", desc: "想把日常都说给对方听" },
      { value: "慢慢升温", emoji: "🍵", desc: "不急，越相处越稳定" },
      { value: "一起奋斗", emoji: "🔥", desc: "互相鼓励，一起往前走" },
      { value: "稳定奔结婚", emoji: "🏠", desc: "认真长期，目标明确" }
    ]
  },
  {
    key: "hairstyle",
    title: "最后选一个发型偏好",
    subtitle: "脑海里第一眼出现的发型，就选它。",
    layout: "grid",
    options: [
      { value: "长直发", emoji: "🖤", desc: "清纯耐看，温柔系" },
      { value: "长卷发", emoji: "🌊", desc: "成熟精致，氛围感强" },
      { value: "齐肩短发", emoji: "✂️", desc: "清爽干净，很有亲近感" },
      { value: "波波头", emoji: "🎨", desc: "文艺利落，有辨识度" },
      { value: "高马尾", emoji: "☀️", desc: "元气运动感，笑容明亮" },
      { value: "齐刘海长发", emoji: "🍓", desc: "甜妹感强，减龄可爱" }
    ]
  }
];
