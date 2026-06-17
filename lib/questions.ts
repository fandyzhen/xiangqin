import type { QuizQuestion, Trait } from "./types";

type Analysis = {
  tag: string;
  copy: string;
};

export const TRAIT_PRIORITY: Trait[] = ["体贴", "主动", "闷骚", "直球"];

export const PERSONALITY_ANALYSIS: Record<Trait, Analysis> = {
  体贴: {
    tag: "体贴暖男型",
    copy: "你的细心是隐藏大招。但别只满足于当好人，记得让她知道你的在意是专属的，适时表达一点心动，好感才会升级。"
  },
  主动: {
    tag: "自信主动型",
    copy: "你的主动很加分，女生喜欢有方向感的人。注意节奏别太急，偶尔留点悬念，让她也惦记你。"
  },
  闷骚: {
    tag: "闷骚潜力型",
    copy: "你心思其实很细，只是没说出口。把想变成说，主动开一次话题，你就赢了一半。"
  },
  直球: {
    tag: "真诚直球型",
    copy: "真诚是你的底牌。多留意她的情绪，很多时候她要的不是解决方案，而是被理解。"
  }
};

export const SUGGESTIONS = [
  "聊天多问开放性问题，别像查户口。",
  "真诚又具体的夸奖，胜过万能的你好美。",
  "约会结尾留个小钩子，制造下一次。",
  "先接住她的情绪，再讲道理。",
  "主动但不黏人，给彼此留点呼吸感。",
  "把她随口提过的喜好记心上，下次用上，杀伤力极大。",
  "形象干净、准时、靠谱，这些基本盘比甜言蜜语更加分。"
];

export const QUESTION_BANK: Record<QuizQuestion["kind"], QuizQuestion[]> = {
  single: [
    {
      id: "S1",
      kind: "single",
      text: "进入章丘男生脱单副本前，先验一下身份：你现在是？",
      options: [
        { id: "S1-A", label: "单身玩家，正在排队匹配", eligibleSingle: true },
        { id: "S1-B", label: "刚重回单排，准备开新局", eligibleSingle: true },
        { id: "S1-C", label: "已有队友，纯来围观", eligibleSingle: false },
        { id: "S1-D", label: "已通关人生副本，不抢名额", eligibleSingle: false }
      ]
    },
    {
      id: "S2",
      kind: "single",
      text: "脱单资格赛只给单身男生发入场券，你的状态是？",
      options: [
        { id: "S2-A", label: "正经单身，想找恋爱搭子", eligibleSingle: true },
        { id: "S2-B", label: "单身，但心里有个未解锁的人", eligibleSingle: true },
        { id: "S2-C", label: "已经有人一起点奶茶了", eligibleSingle: false },
        { id: "S2-D", label: "已婚啦，来给兄弟探路", eligibleSingle: false }
      ]
    },
    {
      id: "S3",
      kind: "single",
      text: "第一关先确认状态：现在是一个人吗？",
      options: [
        { id: "S3-A", label: "是，一个人挺久了", eligibleSingle: true },
        { id: "S3-B", label: "刚单身，准备重新开始", eligibleSingle: true },
        { id: "S3-C", label: "不是，有对象了", eligibleSingle: false },
        { id: "S3-D", label: "已经结婚了", eligibleSingle: false }
      ]
    }
  ],
  local: [
    {
      id: "LV1",
      kind: "local",
      text: "第一次线下见面，你更想带她打卡哪个章丘地图？",
      options: [
        { id: "LV1-A", label: "明水古城逛吃逛吃", eligibleLocal: true },
        { id: "LV1-B", label: "绣源河边压马路", eligibleLocal: true },
        { id: "LV1-C", label: "章丘万达看电影", eligibleLocal: true },
        { id: "LV1-D", label: "不在章丘，我在外地", eligibleLocal: false }
      ]
    },
    {
      id: "LV2",
      kind: "local",
      text: "为了判断见面半径，你平时主要在哪个范围活动？",
      options: [
        { id: "LV2-A", label: "章丘城区（明水一带）", eligibleLocal: true },
        { id: "LV2-B", label: "章丘，住得稍远点", eligibleLocal: true },
        { id: "LV2-C", label: "在章丘上班，租房在这边", eligibleLocal: true },
        { id: "LV2-D", label: "不在章丘", eligibleLocal: false }
      ]
    },
    {
      id: "LV3",
      kind: "local",
      text: "如果要证明你是章丘本地玩家，你会亮出哪张名片？",
      options: [
        { id: "LV3-A", label: "章丘大葱，辨识度拉满", eligibleLocal: true },
        { id: "LV3-B", label: "龙山小米 / 明水香稻，很本地", eligibleLocal: true },
        { id: "LV3-C", label: "章丘铁锅，硬核生活流", eligibleLocal: true },
        { id: "LV3-D", label: "我不在章丘，不太清楚", eligibleLocal: false }
      ]
    }
  ],
  personality: [
    {
      id: "P1",
      kind: "personality",
      text: "约会时她说“都行”，你怎么把选择题做成加分题？",
      options: [
        { id: "P1-A", label: "直接给出 A/B 方案，顺手订好位", score: 3.5, trait: "主动" },
        { id: "P1-B", label: "先问忌口，再给三个不踩雷选项", score: 3.5, trait: "体贴" },
        { id: "P1-C", label: "那就随便咯，然后真随便到冷场", score: 1.5, trait: "直球" },
        { id: "P1-D", label: "你随便我也随便，主打互相放空", score: 0, trait: "直球" }
      ]
    },
    {
      id: "P2",
      kind: "personality",
      text: "她说今天状态不太好，你第一反应是？",
      options: [
        { id: "P2-A", label: "先问需不需要药和饭，再决定要不要过去", score: 3.5, trait: "主动" },
        { id: "P2-B", label: "发语音安抚，提醒她别硬扛", score: 2.5, trait: "体贴" },
        { id: "P2-C", label: "复制一篇养生长文给她", score: 1.5, trait: "直球" },
        { id: "P2-D", label: "多喝热水，经典但危险", score: 0, trait: "直球" }
      ]
    },
    {
      id: "P3",
      kind: "personality",
      text: "第一次去她家见家长，你会？",
      options: [
        { id: "P3-A", label: "提前打听她爸妈喜好，备好礼物", score: 3.5, trait: "体贴" },
        { id: "P3-B", label: "大大方方，该聊聊该夸夸", score: 3, trait: "主动" },
        { id: "P3-C", label: "紧张到只会点头微笑", score: 1.5, trait: "闷骚" },
        { id: "P3-D", label: "全程让她帮我接话", score: 0, trait: "闷骚" }
      ]
    },
    {
      id: "P4",
      kind: "personality",
      text: "她朋友圈发了张自拍，你？",
      options: [
        { id: "P4-A", label: "秒赞 + 真诚夸到具体细节", score: 3.5, trait: "主动" },
        { id: "P4-B", label: "私聊夸她好看", score: 3.5, trait: "体贴" },
        { id: "P4-C", label: "默默点个赞", score: 2, trait: "闷骚" },
        { id: "P4-D", label: "截图存下来，但啥也不说", score: 1, trait: "闷骚" }
      ]
    },
    {
      id: "P5",
      kind: "personality",
      text: "聊天突然有点别扭，你会怎么把气氛拉回来？",
      options: [
        { id: "P5-A", label: "先接住情绪，再把误会说开", score: 3.5, trait: "体贴" },
        { id: "P5-B", label: "发个轻松梗图，再认真补一句", score: 3, trait: "主动" },
        { id: "P5-C", label: "谁错谁道歉，逻辑很直", score: 2, trait: "直球" },
        { id: "P5-D", label: "先消失一会儿，等她主动破冰", score: 0.5, trait: "直球" }
      ]
    },
    {
      id: "P6",
      kind: "personality",
      text: "她说“你都不懂我”，你怎么补情绪价值？",
      options: [
        { id: "P6-A", label: "停下来，先问她真正委屈的点", score: 3.5, trait: "体贴" },
        { id: "P6-B", label: "复盘自己哪里没接住她的情绪", score: 3, trait: "体贴" },
        { id: "P6-C", label: "我哪里不懂了，开始辩论", score: 0.5, trait: "直球" },
        { id: "P6-D", label: "沉默，不知道说啥", score: 1, trait: "闷骚" }
      ]
    },
    {
      id: "P7",
      kind: "personality",
      text: "暗恋一个人，你的进度通常是？",
      options: [
        { id: "P7-A", label: "创造机会多接触，慢慢推进", score: 3.5, trait: "主动" },
        { id: "P7-B", label: "直接表白，赌一把", score: 3, trait: "主动" },
        { id: "P7-C", label: "等对方先有点表示", score: 1.5, trait: "闷骚" },
        { id: "P7-D", label: "暗恋好久，对方还不知道", score: 0.5, trait: "闷骚" }
      ]
    },
    {
      id: "P8",
      kind: "personality",
      text: "约会冷场 10 秒，你怎么救场不尴尬？",
      options: [
        { id: "P8-A", label: "提前备好话题和小游戏", score: 3.5, trait: "体贴" },
        { id: "P8-B", label: "就近找点事打趣聊起来", score: 3, trait: "主动" },
        { id: "P8-C", label: "掏出手机给她看搞笑视频", score: 1.5, trait: "直球" },
        { id: "P8-D", label: "尴尬地笑笑，等她开口", score: 0.5, trait: "闷骚" }
      ]
    }
  ],
  love: [
    {
      id: "L1",
      kind: "love",
      text: "你理想中的恋爱节奏，更像哪种进度条？",
      options: [
        { id: "L1-A", label: "细水长流，慢慢了解", score: 3 },
        { id: "L1-B", label: "一上头就大胆推进", score: 3 },
        { id: "L1-C", label: "先做朋友再升级", score: 2.5 },
        { id: "L1-D", label: "顺其自然，不强求", score: 2 }
      ]
    },
    {
      id: "L2",
      kind: "love",
      text: "在一起后，你愿意为对方改变多少？",
      options: [
        { id: "L2-A", label: "该改的坏习惯都能改", score: 3.5 },
        { id: "L2-B", label: "互相迁就，各退一步", score: 3.5 },
        { id: "L2-C", label: "改可以，但别丢了自己", score: 2.5 },
        { id: "L2-D", label: "江山易改，我尽量", score: 1 }
      ]
    },
    {
      id: "L3",
      kind: "love",
      text: "一段让你愿意公开的关系，最重要的是？",
      options: [
        { id: "L3-A", label: "三观合，聊得来", score: 3.5 },
        { id: "L3-B", label: "互相信任，也有边界感", score: 3.5 },
        { id: "L3-C", label: "心动的感觉", score: 2.5 },
        { id: "L3-D", label: "稳定和安全感", score: 3 }
      ]
    },
    {
      id: "L4",
      kind: "love",
      text: "纪念日和惊喜，你怎么看？",
      options: [
        { id: "L4-A", label: "重要日子必须有仪式感", score: 3.5 },
        { id: "L4-B", label: "平时的细节比仪式更重要", score: 3.5 },
        { id: "L4-C", label: "看心情，想到了就准备", score: 2 },
        { id: "L4-D", label: "形式主义，心意到了就行", score: 1 }
      ]
    },
    {
      id: "L5",
      kind: "love",
      text: "异地恋你能接受吗？",
      options: [
        { id: "L5-A", label: "能，有未来规划就值得", score: 3 },
        { id: "L5-B", label: "短期可以，得有奔头", score: 3 },
        { id: "L5-C", label: "尽量不异地", score: 2.5 },
        { id: "L5-D", label: "不行，我需要陪伴", score: 2 }
      ]
    },
    {
      id: "L6",
      kind: "love",
      text: "她和异性朋友互动多，你怎么处理边界感？",
      options: [
        { id: "L6-A", label: "信任她，但会真诚说出我的感受", score: 3.5 },
        { id: "L6-B", label: "完全信任，不干涉", score: 2.5 },
        { id: "L6-C", label: "有点吃醋，但忍着", score: 1.5 },
        { id: "L6-D", label: "直接表明我介意", score: 1.5 }
      ]
    },
    {
      id: "L7",
      kind: "love",
      text: "你觉得自己卡在脱单副本的哪一关？",
      options: [
        { id: "L7-A", label: "圈子小，遇不到合适的", score: 3 },
        { id: "L7-B", label: "太忙，没时间谈", score: 2.5 },
        { id: "L7-C", label: "不太会主动", score: 2 },
        { id: "L7-D", label: "要求有点高", score: 1.5 }
      ]
    },
    {
      id: "L8",
      kind: "love",
      text: "找长期恋爱搭子，你最看重？",
      options: [
        { id: "L8-A", label: "性格合得来", score: 3.5 },
        { id: "L8-B", label: "有共同话题", score: 3 },
        { id: "L8-C", label: "顾家踏实", score: 3 },
        { id: "L8-D", label: "长得顺眼", score: 2.5 }
      ]
    }
  ],
  fun: [
    {
      id: "F1",
      kind: "fun",
      text: "给你的脱单难度贴个弹幕，最像哪条？",
      options: [
        { id: "F1-A", label: "缺个机会，不缺实力", score: 3 },
        { id: "F1-B", label: "solo 二十几年，老技术了", score: 2 },
        { id: "F1-C", label: "主要太忙，没空谈", score: 2 },
        { id: "F1-D", label: "长得帅是种负担", score: 3 }
      ]
    },
    {
      id: "F2",
      kind: "fun",
      text: "你的微信头像大概是？",
      options: [
        { id: "F2-A", label: "本人正脸照，自信", score: 3 },
        { id: "F2-B", label: "风景 / 宠物，文艺", score: 2.5 },
        { id: "F2-C", label: "动漫 / 表情包，有趣", score: 2.5 },
        { id: "F2-D", label: "默认灰人，神秘", score: 1 }
      ]
    },
    {
      id: "F3",
      kind: "fun",
      text: "相亲对象问“你有房吗”，你会？",
      options: [
        { id: "F3-A", label: "实话实说，坦荡", score: 3 },
        { id: "F3-B", label: "幽默化解：有，游戏仓库里好几套", score: 3 },
        { id: "F3-C", label: "反问她想要什么样的", score: 2 },
        { id: "F3-D", label: "心里咯噔一下", score: 1.5 }
      ]
    },
    {
      id: "F4",
      kind: "fun",
      text: "如果脱单要打排位，你最怕哪一科掉分？",
      options: [
        { id: "F4-A", label: "主动出击（口语）", score: 2 },
        { id: "F4-B", label: "持续聊天（阅读理解）", score: 2 },
        { id: "F4-C", label: "制造浪漫（美术）", score: 2 },
        { id: "F4-D", label: "全科待补考", score: 2 }
      ]
    },
    {
      id: "F5",
      kind: "fun",
      text: "空闲时你最爱看？",
      options: [
        { id: "F5-A", label: "恋综，顺便学恋爱", score: 3 },
        { id: "F5-B", label: "搞笑视频，图一乐", score: 2.5 },
        { id: "F5-C", label: "游戏 / 体育", score: 2 },
        { id: "F5-D", label: "不咋刷，我去健身", score: 2.5 }
      ]
    },
    {
      id: "F6",
      kind: "fun",
      text: "朋友要给你介绍对象，你的第一反应是？",
      options: [
        { id: "F6-A", label: "来者不拒，多认识", score: 3 },
        { id: "F6-B", label: "先看照片再说", score: 2 },
        { id: "F6-C", label: "害羞，但会去", score: 2.5 },
        { id: "F6-D", label: "嘴上算了吧，身体很诚实", score: 2 }
      ]
    },
    {
      id: "F7",
      kind: "fun",
      text: "你觉得自己更像哪种恋爱番角色？",
      options: [
        { id: "F7-A", label: "主角，迟早有人爱", score: 3 },
        { id: "F7-B", label: "默默守护的男二", score: 2 },
        { id: "F7-C", label: "搞笑担当，先混成朋友", score: 2.5 },
        { id: "F7-D", label: "还没出场的隐藏角色", score: 1.5 }
      ]
    },
    {
      id: "F8",
      kind: "fun",
      text: "章丘相亲，你最想约她去？",
      options: [
        { id: "F8-A", label: "明水古城拍照逛吃", score: 3 },
        { id: "F8-B", label: "绣源河边散步", score: 3 },
        { id: "F8-C", label: "百脉泉公园", score: 2.5 },
        { id: "F8-D", label: "家附近的烧烤摊，实在", score: 2.5 }
      ]
    }
  ]
};
