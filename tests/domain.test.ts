import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildShareAchievement } from "@/lib/achievement";
import { APP_NAME, APP_SHARE_DESCRIPTION, APP_SHARE_IMAGE, APP_SHARE_TITLE } from "@/lib/brand";
import { COVER_CTA_LABEL, COVER_GALLERY_IMAGES, COVER_META_BADGES, COVER_QUALIFY_LABEL } from "@/lib/cover";
import { CUSTOMIZE_FINAL_HINT, CUSTOMIZE_STEP_HINT, IDEAL_LOADING_SUBTITLE, IDEAL_LOADING_TITLE, IDEAL_STEPS } from "@/lib/ideal-steps";
import { IDEAL_OPTIONS, buildIdealPrompt, createFallbackPortrait } from "@/lib/ideal";
import { formatMatchCopy, generateMatchedGirl, generateMatchedGirls } from "@/lib/match";
import { INITIAL_PARTICIPANT_COUNT, nextParticipantCount } from "@/lib/participants";
import { PERSONALITY_ARCHETYPE_COUNT, buildQuiz, scoreQuiz } from "@/lib/quiz";
import { QUESTION_BANK } from "@/lib/questions";
import { getDataPaths } from "@/lib/storage";
import { validateLeadContact } from "@/lib/submission";
import { HONGNIANG_DEFAULT_PASSWORD, buildHongniangLeadList, getHongniangPassword, verifyHongniangPassword } from "@/lib/hongniang";
import {
  PHONE_DUPLICATE_WINDOW_MS,
  SUBMISSION_IP_FREQUENCY_LIMIT,
  detectSubmissionRisk
} from "@/lib/experience-limit";
import {
  CARD_SAVE_SHARE_LABEL,
  COVER_CLUB_LABEL,
  LEAD_KICKER_LABEL,
  LEAD_TRUST_BADGES,
  LEAD_AVATAR_SRC,
  LOCAL_IDEAL_CTA_LABEL,
  MATCH_EMPTY_CTA_LABEL,
  MATCH_EMPTY_COPY,
  MATCH_EMPTY_STICKER_SRC,
  MATCH_EMPTY_TITLE,
  MATCH_FOUND_CTA_LABEL,
  MATCHING_ARCHIVE_TITLE,
  SAVE_IMAGE_HINT,
  SUCCESS_CONTACT_COPY,
  buildIdealCardDisplay,
  getLeadPageContent
} from "@/lib/ui-flow";
import type { IdealTypeSelection, SubmissionPayload } from "@/lib/types";

const rng = () => 0.12;

function chooseFirstScoringAnswers(quiz: ReturnType<typeof buildQuiz>) {
  return Object.fromEntries(
    quiz.map((question) => [question.id, question.options[0].id])
  );
}

function createSubmission(overrides: Partial<SubmissionPayload> = {}): SubmissionPayload {
  return {
    id: "lead-base",
    createdAt: "2026-06-14T10:00:00.000Z",
    quizScore: 91,
    qualified: true,
    personalityTag: "主线直球冲锋手型",
    leadIntent: "more",
    idealType: {
      appearanceVibe: "清冷高级",
      companionStyle: "情绪稳定",
      bodyType: "匀称自然",
      lifestyle: "宅家追剧",
      relationshipMode: "慢慢升温",
      hairstyle: "齐肩短发"
    },
    idealImageUrl: "/images/ideal-test.png",
    idealImageSeed: "zq-test",
    matchedGirl: generateMatchedGirl({ appearanceVibe: "清冷高级", companionStyle: "情绪稳定", bodyType: "匀称自然", lifestyle: "宅家追剧", relationshipMode: "慢慢升温", hairstyle: "齐肩短发" }, rng),
    contact: { name: "小王", phone: "13800000000", consent: true },
    ...overrides
  };
}

describe("章丘男生脱单资格赛领域逻辑", () => {
  it("项目品牌名统一为章丘男生脱单资格赛", () => {
    expect(APP_NAME).toBe("章丘男生脱单资格赛");
  });

  it("网页提供微信分享可读取的标题、描述和图片元信息", () => {
    const layoutSource = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");

    expect(APP_SHARE_TITLE).toBe(APP_NAME);
    expect(APP_SHARE_DESCRIPTION).toContain("闯关");
    expect(APP_SHARE_IMAGE).toBe("/images/cover-person-a-0.jpg");
    expect(layoutSource).toContain("openGraph");
    expect(layoutSource).toContain("twitter");
    expect(layoutSource).toContain("APP_SHARE_TITLE");
    expect(layoutSource).toContain("APP_SHARE_DESCRIPTION");
    expect(layoutSource).toContain("APP_SHARE_IMAGE");
  });

  it("按固定骨架抽 8 题", () => {
    const quiz = buildQuiz(rng);

    expect(quiz).toHaveLength(8);
    expect(quiz.filter((q) => q.kind === "single").length).toBe(1);
    expect(quiz.filter((q) => q.kind === "local").length).toBe(1);
    expect(quiz.filter((q) => q.kind === "personality").length).toBe(2);
    expect(quiz.filter((q) => q.kind === "love").length).toBe(2);
    expect(quiz.filter((q) => q.kind === "fun").length).toBe(2);
  });

  it("非单身或非本地用户不合格", () => {
    const quiz = buildQuiz(rng);
    const answers = chooseFirstScoringAnswers(quiz);
    const singleQuestion = quiz.find((q) => q.kind === "single");
    const localQuestion = quiz.find((q) => q.kind === "local");

    if (!singleQuestion || !localQuestion) {
      throw new Error("筛选题缺失");
    }

    answers[singleQuestion.id] = singleQuestion.options.find((option) => option.eligibleSingle === false)!.id;
    expect(scoreQuiz(quiz, answers).qualified).toBe(false);

    answers[singleQuestion.id] = singleQuestion.options.find((option) => option.eligibleSingle === true)!.id;
    answers[localQuestion.id] = localQuestion.options.find((option) => option.eligibleLocal === false)!.id;
    expect(scoreQuiz(quiz, answers).qualified).toBe(false);
  });

  it("合格用户分数稳定落在 78 到 99，并给出性格分析", () => {
    const quiz = buildQuiz(rng);
    const answers = chooseFirstScoringAnswers(quiz);
    const result = scoreQuiz(quiz, answers);

    expect(result.qualified).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(78);
    expect(result.score).toBeLessThanOrEqual(99);
    expect(result.personalityTag).toMatch(/型$/);
    expect(result.suggestions).toHaveLength(3);
  });

  it("战绩荣誉给出段位、稀有度和适合分享的文案", () => {
    const achievement = buildShareAchievement({
      score: 96,
      personalityTag: "自信主动型",
      qualified: true
    });

    expect(achievement.rank).toBe("S+");
    expect(achievement.title).toContain("章丘");
    expect(achievement.rarity).toMatch(/限定|稀有|高能/);
    expect(achievement.percentile).toBeGreaterThanOrEqual(90);
    expect(achievement.shareText).toContain(APP_NAME);
    expect(achievement.shareText).toContain("96");
    expect(achievement.shareText).toContain("自信主动型");
  });

  it("战绩卡分享文案使用高对比样式，保存成图片后也能看清", () => {
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
    const shareHookBlock = css.match(/\.share-hook\s*\{(?<rules>[^}]+)\}/)?.groups?.rules ?? "";

    expect(shareHookBlock).toContain("background: #efe1ff;");
    expect(shareHookBlock).toContain("color: #160a27;");
    expect(shareHookBlock).toContain("font-size: 13px;");
  });

  it("成功页里的战绩卡分享文案不会被成功页浅色段落样式覆盖", () => {
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
    const successShareHookBlock = css.match(/\.success-screen\s+\.share-hook\s*\{(?<rules>[^}]+)\}/)?.groups?.rules ?? "";

    expect(successShareHookBlock).toContain("color: #160a27;");
    expect(successShareHookBlock).toContain("font-size: 13px;");
    expect(css.indexOf(".success-screen .share-hook")).toBeGreaterThan(css.indexOf(".success-screen p"));
  });

  it("参赛人数从 12389 起并且每次刷新加 1", () => {
    expect(INITIAL_PARTICIPANT_COUNT).toBe(12389);
    expect(nextParticipantCount(null)).toBe(12390);
    expect(nextParticipantCount("12390")).toBe(12391);
    expect(nextParticipantCount("not-a-number")).toBe(12390);
  });

  it("首页入口精简为单一挑战按钮，并提供多图动态预览素材", () => {
    expect(COVER_CTA_LABEL).toBe("开始挑战");
    expect(COVER_QUALIFY_LABEL).toBe("通过率");
    expect(COVER_CLUB_LABEL).toBe("章友恋爱社");
    expect(COVER_META_BADGES).toEqual([]);
    expect(COVER_GALLERY_IMAGES.length).toBeGreaterThanOrEqual(9);
    expect(new Set(COVER_GALLERY_IMAGES.map((item) => item.src)).size).toBe(COVER_GALLERY_IMAGES.length);
  });

  it("题目文案更贴近年轻语境但保留筛选目的", () => {
    const allQuestions = Object.values(QUESTION_BANK).flat();
    const questionCopy = allQuestions
      .flatMap((question) => [question.text, ...question.options.map((option) => option.label)])
      .join(" ");

    for (const phrase of ["搭子", "上头", "边界感", "情绪价值", "朋友圈"]) {
      expect(questionCopy).toContain(phrase);
    }

    expect(QUESTION_BANK.single.flatMap((question) => question.options).some((option) => option.eligibleSingle === false)).toBe(true);
    expect(QUESTION_BANK.local.flatMap((question) => question.options).some((option) => option.eligibleLocal === false)).toBe(true);
  });

  it("单身核验题不再使用红娘问候口吻", () => {
    const question = QUESTION_BANK.single.find((item) => item.id === "S3");

    expect(question?.text).toBe("第一关先确认状态：现在是一个人吗？");
    expect(question?.text).not.toContain("红娘");
  });

  it("问答阶段题干不出现红娘字样", () => {
    const allQuestions = Object.values(QUESTION_BANK).flat();

    for (const question of allQuestions) {
      expect(question.text).not.toContain("红娘");
    }
  });

  it("性格分析结论给出来自答题的依据", () => {
    const singleQuestion = QUESTION_BANK.single[0];
    const localQuestion = QUESTION_BANK.local[0];
    const personalityA = QUESTION_BANK.personality.find((question) => question.id === "P5")!;
    const personalityB = QUESTION_BANK.personality.find((question) => question.id === "P7")!;
    const quiz = [
      singleQuestion,
      localQuestion,
      personalityA,
      personalityB,
      QUESTION_BANK.love[0],
      QUESTION_BANK.love[1],
      QUESTION_BANK.fun[0],
      QUESTION_BANK.fun[1]
    ];
    const answers = {
      [singleQuestion.id]: singleQuestion.options.find((option) => option.eligibleSingle)!.id,
      [localQuestion.id]: localQuestion.options.find((option) => option.eligibleLocal)!.id,
      [personalityA.id]: "P5-A",
      [personalityB.id]: "P7-A",
      [QUESTION_BANK.love[0].id]: QUESTION_BANK.love[0].options[0].id,
      [QUESTION_BANK.love[1].id]: QUESTION_BANK.love[1].options[0].id,
      [QUESTION_BANK.fun[0].id]: QUESTION_BANK.fun[0].options[0].id,
      [QUESTION_BANK.fun[1].id]: QUESTION_BANK.fun[1].options[0].id
    };

    const result = scoreQuiz(quiz, answers, rng);

    expect(result.personalityTag).toMatch(/型$/);
    expect(result.personalitySignature).toBe(`我的恋爱人格：${result.personalityTag}`);
    expect(result.personalityEvidence).toHaveLength(2);
    expect(result.personalityEvidence[0]).toMatchObject({
      question: "聊天突然有点别扭，你会怎么把气氛拉回来？",
      answer: "先接住情绪，再把误会说开",
      trait: "体贴"
    });
    expect(result.personalityEvidence[1]).toMatchObject({
      question: "暗恋一个人，你的进度通常是？",
      answer: "创造机会多接触，慢慢推进",
      trait: "主动"
    });
  });

  it("恋爱人格称号不止 4 个基础类型，能按答题组合产生差异", () => {
    const singleQuestion = QUESTION_BANK.single[0];
    const localQuestion = QUESTION_BANK.local[0];
    const personalityA = QUESTION_BANK.personality.find((question) => question.id === "P1")!;
    const personalityB = QUESTION_BANK.personality.find((question) => question.id === "P3")!;
    const quiz = [
      singleQuestion,
      localQuestion,
      personalityA,
      personalityB,
      QUESTION_BANK.love[0],
      QUESTION_BANK.love[1],
      QUESTION_BANK.fun[0],
      QUESTION_BANK.fun[1]
    ];
    const baseAnswers = {
      [singleQuestion.id]: singleQuestion.options.find((option) => option.eligibleSingle)!.id,
      [localQuestion.id]: localQuestion.options.find((option) => option.eligibleLocal)!.id,
      [QUESTION_BANK.love[0].id]: QUESTION_BANK.love[0].options[0].id,
      [QUESTION_BANK.love[1].id]: QUESTION_BANK.love[1].options[0].id,
      [QUESTION_BANK.fun[0].id]: QUESTION_BANK.fun[0].options[0].id,
      [QUESTION_BANK.fun[1].id]: QUESTION_BANK.fun[1].options[0].id
    };
    const tags = new Set<string>();

    for (const firstOption of personalityA.options) {
      for (const secondOption of personalityB.options) {
        const result = scoreQuiz(
          quiz,
          {
            ...baseAnswers,
            [personalityA.id]: firstOption.id,
            [personalityB.id]: secondOption.id
          },
          rng
        );
        tags.add(result.personalityTag);
      }
    }

    expect(PERSONALITY_ARCHETYPE_COUNT).toBeGreaterThanOrEqual(32);
    expect(tags.size).toBeGreaterThanOrEqual(10);
    expect([...tags].some((tag) => tag.includes("体贴暖男型"))).toBe(false);
  });

  it("理想型 prompt 包含可视维度但不把身高写进画面", () => {
    const selection: IdealTypeSelection = {
      appearanceVibe: "清甜元气",
      companionStyle: "活泼有梗",
      lifestyle: "旅行拍照",
      hairstyle: "齐刘海长发",
      bodyType: "娇小可爱",
      relationshipMode: "高频分享"
    };

    const result = buildIdealPrompt(selection, rng);

    expect(result.prompt).toContain("清甜元气");
    expect(result.prompt).toContain("活泼有梗");
    expect(result.prompt).toContain("旅行风景元素");
    expect(result.prompt).toContain("齐刘海长发");
    expect(result.prompt).toContain("娇小的身形");
    expect(result.prompt).toContain("浅色休闲穿搭");
    expect(result.prompt).not.toContain("职业");
    expect(result.prompt).not.toContain("身高");
    expect(result.seed).toMatch(/^zq-/);
    expect(result.negativePrompt).toContain("多人");
  });

  it("理想型定制维度不再混合发型和穿搭，发型保持独立单选维度", () => {
    expect("profession" in IDEAL_OPTIONS).toBe(false);
    expect("heightRange" in IDEAL_OPTIONS).toBe(false);
    expect(Object.keys(IDEAL_OPTIONS.hairstyle)).toEqual(["长直发", "长卷发", "齐肩短发", "波波头", "高马尾", "齐刘海长发"]);
    expect(Object.keys(IDEAL_OPTIONS.hairstyle).some((item) => item.includes("风"))).toBe(false);
  });

  it("理想型兜底图使用项目内高质量位图资产，而不是 SVG 假人", () => {
    const selection: IdealTypeSelection = {
      appearanceVibe: "温柔知性",
      companionStyle: "情绪稳定",
      lifestyle: "音乐文艺",
      hairstyle: "长卷发",
      bodyType: "匀称自然",
      relationshipMode: "慢慢升温"
    };

    expect(createFallbackPortrait(selection, "zq-test")).toMatch(/^\/images\/ideal-/);
    expect(createFallbackPortrait(selection, "zq-test")).toMatch(/\.png$/);
    expect(createFallbackPortrait(selection, "zq-test")).not.toContain("data:image/svg");
  });

  it("理想型兜底图会根据发型和职业选择不同画像", () => {
    const base: IdealTypeSelection = {
      appearanceVibe: "温柔知性",
      companionStyle: "情绪稳定",
      lifestyle: "宅家追剧",
      hairstyle: "长直发",
      bodyType: "匀称自然",
      relationshipMode: "慢慢升温"
    };

    const teacherLong = createFallbackPortrait(base, "zq-a");
    const medicalShort = createFallbackPortrait({ ...base, appearanceVibe: "邻家自然", hairstyle: "齐肩短发" }, "zq-b");
    const bobCreative = createFallbackPortrait({ ...base, appearanceVibe: "清冷高级", hairstyle: "波波头" }, "zq-c");
    const ponyStudent = createFallbackPortrait({ ...base, appearanceVibe: "运动阳光", hairstyle: "高马尾" }, "zq-d");

    expect(new Set([teacherLong, medicalShort, bobCreative, ponyStudent]).size).toBe(4);
  });

  it("理想型兜底图优先服从用户选择的发型", () => {
    const base: IdealTypeSelection = {
      appearanceVibe: "清甜元气",
      companionStyle: "活泼有梗",
      lifestyle: "健身运动",
      hairstyle: "长卷发",
      bodyType: "娇小可爱",
      relationshipMode: "高频分享"
    };

    expect(createFallbackPortrait(base, "zq-wave")).toBe("/images/ideal-workplace-wavy.png");
    expect(createFallbackPortrait({ ...base, appearanceVibe: "运动阳光", hairstyle: "高马尾" }, "zq-pony")).toBe("/images/ideal-student-ponytail.png");
    expect(createFallbackPortrait({ ...base, appearanceVibe: "清冷高级", hairstyle: "波波头" }, "zq-bob")).toBe("/images/ideal-creative-bob.png");
  });

  it("理想型兜底图同时尊重身材状态，微胖甜感不会出成苗条职场图", () => {
    const selection: IdealTypeSelection = {
      appearanceVibe: "邻家自然",
      companionStyle: "温柔会照顾人",
      lifestyle: "宠物生活",
      hairstyle: "长卷发",
      bodyType: "微胖甜感",
      relationshipMode: "稳定奔结婚"
    };

    expect(createFallbackPortrait(selection, "zq-curvy")).toBe("/images/ideal-curvy-wavy.png");
  });

  it("微胖甜感会优先命中发型和身材完全一致的专属画像", () => {
    const base: IdealTypeSelection = {
      appearanceVibe: "邻家自然",
      companionStyle: "温柔会照顾人",
      lifestyle: "宠物生活",
      hairstyle: "长直发",
      bodyType: "微胖甜感",
      relationshipMode: "稳定奔结婚"
    };

    const expectedByHair = {
      长直发: "/images/ideal-curvy-straight.png",
      长卷发: "/images/ideal-curvy-wavy.png",
      齐肩短发: "/images/ideal-curvy-short.png",
      波波头: "/images/ideal-curvy-bob.png",
      高马尾: "/images/ideal-curvy-ponytail.png",
      齐刘海长发: "/images/ideal-curvy-bangs.png"
    };

    for (const [hairstyle, src] of Object.entries(expectedByHair)) {
      expect(createFallbackPortrait({ ...base, hairstyle }, `zq-${hairstyle}`)).toBe(src);
    }
  });

  it("微胖甜感长发画像不会因为 seed 不同随机回到旧资产", () => {
    const base: IdealTypeSelection = {
      appearanceVibe: "邻家自然",
      companionStyle: "温柔会照顾人",
      lifestyle: "宠物生活",
      hairstyle: "长直发",
      bodyType: "微胖甜感",
      relationshipMode: "稳定奔结婚"
    };

    for (const seed of ["zq-a", "zq-9", "zq-m", "zq-z"]) {
      expect(createFallbackPortrait({ ...base, hairstyle: "长直发" }, seed)).toBe("/images/ideal-curvy-straight.png");
      expect(createFallbackPortrait({ ...base, hairstyle: "长卷发" }, seed)).toBe("/images/ideal-curvy-wavy.png");
    }
  });

  it("理想型卡片展示每个细节只出现一次", () => {
    const selection: IdealTypeSelection = {
      appearanceVibe: "温柔知性",
      companionStyle: "情绪稳定",
      lifestyle: "音乐文艺",
      hairstyle: "长卷发",
      bodyType: "匀称自然",
      relationshipMode: "慢慢升温"
    };

    const display = buildIdealCardDisplay(selection);
    const allItems = [display.headline, ...display.tags].join(" · ");

    expect(display.headline).toBe("温柔知性 · 长卷发 · 匀称自然");
    expect(display.tags).toEqual(["情绪稳定", "音乐文艺", "慢慢升温"]);
    for (const detail of Object.values(selection)) {
      expect(allItems.split(detail).length - 1).toBe(1);
    }
  });

  it("红娘匹配画像始终是章丘居住地且契合度不过度虚高", () => {
    const selection: IdealTypeSelection = {
      appearanceVibe: "温柔知性",
      companionStyle: "情绪稳定",
      lifestyle: "宠物生活",
      hairstyle: "长直发",
      bodyType: "匀称自然",
      relationshipMode: "稳定奔结婚"
    };

    const matched = generateMatchedGirl(selection, rng);

    expect(matched.residence).toMatch(/^章丘区·/);
    expect(matched.personality).toBe(selection.companionStyle);
    expect(matched.matchPercent).toBeGreaterThanOrEqual(85);
    expect(matched.matchPercent).toBeLessThanOrEqual(95);
    expect(matched.matchGap).toMatch(/心动|对味|舒服|遇见|画面|缘分/);
    expect(matched.matchGap).not.toMatch(/模板|标准|系统|生成|复制粘贴|真实感/);
    expect(matched.hobbies.length).toBeGreaterThanOrEqual(3);
  });

  it("匹配流程生成的女生数量与查找结果一致", () => {
    const selection: IdealTypeSelection = {
      appearanceVibe: "温柔知性",
      companionStyle: "情绪稳定",
      lifestyle: "宠物生活",
      hairstyle: "长直发",
      bodyType: "匀称自然",
      relationshipMode: "稳定奔结婚"
    };

    const matches = generateMatchedGirls(selection, 5, rng);

    expect(matches).toHaveLength(5);
    expect(matches.every((girl) => girl.residence.startsWith("章丘区·"))).toBe(true);
  });

  it("理想型步骤说明是给用户看的，不暴露系统生成逻辑", () => {
    expect(IDEAL_STEPS).toHaveLength(6);

    const subtitles = IDEAL_STEPS.map((step) => step.subtitle);

    for (const subtitle of subtitles) {
      expect(subtitle).not.toMatch(/决定|生成|图片|系统|比例|后续|匹配|不再|只选|自动/);
      expect(subtitle.length).toBeLessThanOrEqual(34);
    }

    expect(subtitles).toEqual([
      "先选第一眼会让你停一下的感觉。",
      "想象日常聊天和相处，选你最想靠近的那种。",
      "不用迎合别人审美，选你自己真的会心动的状态。",
      "周末怎么过，最能看出两个人合不合拍。",
      "你想谈得甜一点、稳一点，还是各自有空间一点？",
      "脑海里第一眼出现的发型，就选它。"
    ]);
  });

  it("理想型流程提示不使用技术化生成口吻", () => {
    const visibleCopy = [CUSTOMIZE_STEP_HINT, CUSTOMIZE_FINAL_HINT, IDEAL_LOADING_TITLE, IDEAL_LOADING_SUBTITLE].join(" ");

    expect(visibleCopy).toBe("选完会跳到下一关 最后一步，选完就开奖 正在安排你的理想型出场 把你刚才选的感觉，整理成一张心动卡。");
    expect(visibleCopy).not.toMatch(/自动|生成|系统|参与|决定/);
  });

  it("匹配页总结文案面向用户表达，不写内部评估口吻", () => {
    const copy = formatMatchCopy(89, "她和你想象里有一点点差别，但聊天舒服、生活节奏也对味。");

    expect(copy).toBe("不是满分才叫合适，89% 已经很有心动感。她和你想象里有一点点差别，但聊天舒服、生活节奏也对味。");
    expect(copy).not.toMatch(/模板|标准|系统|生成|评估|真实感/);
  });

  it("流程按钮和提示文案符合新的转化路径", () => {
    expect(CARD_SAVE_SHARE_LABEL).toBe("保存分享让更多人知道");
    expect(LOCAL_IDEAL_CTA_LABEL).toBe("看看章丘本地有没有理想型");
    expect(MATCHING_ARCHIVE_TITLE).toBe("检索大章丘红娘档案库");
    expect(MATCH_FOUND_CTA_LABEL).toBe("去看看");
    expect(SUCCESS_CONTACT_COPY).toBe("红娘会尽快联系你，请保持手机畅通。");
    expect(SAVE_IMAGE_HINT).toBe("长按保存图片，发朋友圈或发给朋友。");
  });

  it("留资页根据进入动机展示红娘帮忙话术", () => {
    const girlLead = getLeadPageContent("girl");
    const moreLead = getLeadPageContent("more");

    expect(LEAD_KICKER_LABEL).toBe("大章丘红娘帮你问");
    expect(LEAD_TRUST_BADGES).toEqual(["仅用于本次牵线", "不公开给女生", "红娘人工联系"]);
    expect(girlLead.title).toBe("我来帮你问问她");
    expect(girlLead.copy).toContain("帮你问问她是否愿意认识");
    expect(girlLead.ctaLabel).toBe("让红娘帮我问问");
    expect(moreLead.title).toBe("我来帮你继续找");
    expect(moreLead.copy).toContain("再从本地档案里帮你筛");
    expect(moreLead.ctaLabel).toBe("让红娘继续帮我找");
  });

  it("留资页使用真人微笑红娘头像而不是文字占位", () => {
    const pageSource = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
    const avatarPath = new URL(`../public${LEAD_AVATAR_SRC}`, import.meta.url);

    expect(LEAD_AVATAR_SRC).toBe("/images/matchmaker-friendly-smile-avatar.png");
    expect(existsSync(avatarPath)).toBe(true);
    expect(pageSource).toContain("src={LEAD_AVATAR_SRC}");
    expect(pageSource).not.toContain(">媒<");
  });

  it("想认识她和看更多理想型进入留资页使用不同动机", () => {
    const pageSource = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

    expect(pageSource).toContain('onClick={() => goToLeadForm("girl")}');
    expect(pageSource).toContain('onClick={() => goToLeadForm("more")}');
    expect(pageSource).toContain("leadIntent,");
    expect(pageSource).toContain("leadContent.ctaLabel");
  });

  it("红娘后台需要指定密码并支持读取已读状态", () => {
    const girl = generateMatchedGirl({ appearanceVibe: "清冷高级", companionStyle: "温柔稳定", bodyType: "高挑纤细", lifestyle: "宅家追剧", relationshipMode: "高频分享", hairstyle: "齐肩短发" }, rng);
    const jsonl = [
      JSON.stringify({
        id: "old-lead",
        createdAt: "2026-06-13T10:00:00.000Z",
        quizScore: 91,
        qualified: true,
        personalityTag: "主线直球冲锋手型",
        leadIntent: "more",
        idealType: { appearanceVibe: "甜美元气", companionStyle: "温柔稳定", bodyType: "微胖甜感", lifestyle: "宅家追剧", relationshipMode: "高频分享", hairstyle: "高马尾" },
        idealImageUrl: "/images/ideal-a.png",
        idealImageSeed: "seed-old",
        matchedGirl: girl,
        contact: { name: "小王", phone: "13800000000", consent: true }
      }),
      JSON.stringify({
        id: "new-lead",
        createdAt: "2026-06-14T10:00:00.000Z",
        quizScore: 96,
        qualified: true,
        personalityTag: "章丘心动天选玩家",
        leadIntent: "girl",
        idealType: { appearanceVibe: "清冷高级", companionStyle: "活泼有梗", bodyType: "高挑纤细", lifestyle: "运动散步", relationshipMode: "稳稳推进", hairstyle: "长发微卷" },
        idealImageUrl: "/images/ideal-b.png",
        idealImageSeed: "seed-new",
        matchedGirl: girl,
        contact: { name: "小李", phone: "13900000000", consent: true }
      })
    ].join("\n");

    expect(HONGNIANG_DEFAULT_PASSWORD).toBe("dazhangqiu13#");
    expect(verifyHongniangPassword("wrong", HONGNIANG_DEFAULT_PASSWORD)).toBe(false);
    expect(verifyHongniangPassword("dazhangqiu13#", HONGNIANG_DEFAULT_PASSWORD)).toBe(true);

    const list = buildHongniangLeadList(jsonl, new Set(["new-lead"]));
    expect(list.map((item) => item.id)).toEqual(["new-lead", "old-lead"]);
    expect(list[0].read).toBe(true);
    expect(list[0].leadSource).toBe("想认识这位女生");
    expect(list[0].intendedGirl?.nickname).toBe(girl.nickname);
    expect(list[1].read).toBe(false);
    expect(list[1].leadSource).toBe("想看更多本地理想型");
    expect(list[1].intendedGirl).toBeNull();
  });

  it("生产环境没有配置红娘密码时不能回退到默认密码", () => {
    const missingProductionPassword = getHongniangPassword({
      configuredPassword: "",
      nodeEnv: "production"
    });
    const configuredProductionPassword = getHongniangPassword({
      configuredPassword: "new-secure-password",
      nodeEnv: "production"
    });

    expect(missingProductionPassword).toBe("");
    expect(verifyHongniangPassword(HONGNIANG_DEFAULT_PASSWORD, missingProductionPassword)).toBe(false);
    expect(verifyHongniangPassword("new-secure-password", configuredProductionPassword)).toBe(true);
    expect(verifyHongniangPassword(HONGNIANG_DEFAULT_PASSWORD, configuredProductionPassword)).toBe(false);
  });

  it("服务器留资文件目录支持用 DATA_DIR 指向持久卷", () => {
    const volumePaths = getDataPaths({ dataDir: "/data", cwd: "/app" });
    const fallbackPaths = getDataPaths({ dataDir: "", cwd: "/app" });

    expect(volumePaths.dataDir).toBe("/data");
    expect(volumePaths.submissionsFile).toBe("/data/submissions.jsonl");
    expect(volumePaths.readStatusFile).toBe("/data/read-status.json");
    expect(fallbackPaths.dataDir).toBe("/app/data");
  });

  it("档案库发现人数里的数字需要独立放大高亮", () => {
    const pageSource = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
    const numberBlock = css.match(/\.match-count-number\s*\{(?<rules>[^}]+)\}/)?.groups?.rules ?? "";

    expect(pageSource).toContain('className="match-count-number"');
    expect(numberBlock).toContain("font-size: 42px;");
    expect(numberBlock).toContain("color: var(--coral-2);");
  });

  it("档案库检索页标题独立上移并加大突出", () => {
    const pageSource = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
    const titleBlock = css.match(/\.match-archive-title\s*\{(?<rules>[^}]+)\}/)?.groups?.rules ?? "";

    expect(pageSource).toContain('className="match-archive-title"');
    expect(pageSource).not.toContain("<span>{MATCHING_ARCHIVE_TITLE}</span>");
    expect(titleBlock).toContain("font-size: 34px;");
    expect(titleBlock).toContain("color: #d8b4fe;");
  });

  it("档案库检索过程大约 3 秒完成", () => {
    const pageSource = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

    expect(pageSource).toContain("const MATCH_SCAN_STEP_DELAY_MS = 600;");
    expect(pageSource).toContain("MATCH_SCAN_STEP_DELAY_MS * (index + 1)");
    expect(pageSource).not.toContain("520 * (index + 1)");
  });

  it("匹配看完后的空结果页用轻松口吻引导核实", () => {
    const pageSource = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

    expect(MATCH_EMPTY_TITLE).toBe("你也太挑了吧");
    expect(MATCH_EMPTY_COPY).toBe("红娘私藏的更多女生资料需要核实你的情况才能给你看");
    expect(MATCH_EMPTY_CTA_LABEL).toBe("帮我核实");
    expect(MATCH_EMPTY_STICKER_SRC).toBe("/images/reaction-awkward-sajiao-woman.jpg");
    expect(pageSource).toContain('className="empty-match-sticker"');
    expect(pageSource).toContain('src={MATCH_EMPTY_STICKER_SRC}');
    expect(pageSource).toContain('aria-label="30岁女生为难撒娇表情包"');
    expect(pageSource).toContain('className="empty-match-emphasis"');
    expect(pageSource).toContain("<span>红娘私藏的</span>");
    expect(pageSource).toContain("<span>资料需要核实你的情况才能给你看</span>");
  });

  it("留资校验只要求称呼和真实手机号样式", () => {
    expect(validateLeadContact({ name: "", phone: "", wechat: "", consent: false }).valid).toBe(false);
    expect(validateLeadContact({ name: "小王", phone: "", wechat: "", consent: false }).valid).toBe(false);
    expect(validateLeadContact({ name: "小王", phone: "1234", wechat: "", consent: false }).valid).toBe(false);
    expect(validateLeadContact({ name: "小王", phone: "13800000000", wechat: "", consent: false }).valid).toBe(true);
    expect(validateLeadContact({ name: "小王", phone: "", wechat: "wx_zhangqiu", consent: true }).valid).toBe(false);
  });

  it("前端取消 24 小时 3 次挑战限制，不再出现限次页", () => {
    const pageSource = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

    expect(pageSource).not.toContain('"limited"');
    expect(pageSource).not.toContain("recordChallengeAttempt");
    expect(pageSource).not.toContain("CHALLENGE_ATTEMPT_STORAGE_KEY");
    expect(pageSource).not.toContain("你今天已经打满");
  });

  it("后端只给重复手机号和同设备多次提交打标签，不拦截用户", () => {
    const now = Date.parse("2026-06-14T10:00:00.000Z");
    const current = createSubmission({
      id: "lead-current",
      visitorId: "visitor-a",
      createdAt: new Date(now).toISOString()
    });
    const history = [
      createSubmission({
        id: "same-phone",
        visitorId: "visitor-x",
        createdAt: new Date(now - PHONE_DUPLICATE_WINDOW_MS + 1000).toISOString(),
        contact: { name: "小李", phone: "13800000000", consent: true }
      }),
      createSubmission({
        id: "old-phone",
        visitorId: "visitor-y",
        createdAt: new Date(now - PHONE_DUPLICATE_WINDOW_MS - 1000).toISOString(),
        contact: { name: "小赵", phone: "13800000000", consent: true }
      })
    ];

    const result = detectSubmissionRisk(current, history, now);

    expect(result.flags).toEqual(["phone"]);
    expect(result.duplicateLeadId).toBe("same-phone");
    expect(result.blocked).toBe(false);
    expect(JSON.stringify(result).toLowerCase()).not.toContain("ip");
  });

  it("同一 visitorId 再次留资只打同设备多次提交标签", () => {
    const now = Date.parse("2026-06-14T10:00:00.000Z");
    const current = createSubmission({
      id: "lead-current",
      visitorId: "visitor-limit",
      createdAt: new Date(now).toISOString(),
      contact: { name: "新用户", phone: "13900000000", consent: true }
    });
    const history = [0, 1, 2].map((index) =>
      createSubmission({
        id: `device-${index}`,
        visitorId: "visitor-limit",
        createdAt: new Date(now - index * 60_000).toISOString(),
        contact: { name: `用户${index}`, phone: `1380000000${index}`, consent: true }
      })
    );

    expect(detectSubmissionRisk(current, history, now).flags).toEqual(["device"]);
    expect(detectSubmissionRisk(current, history, now).blocked).toBe(false);
  });

  it("同 IP 高频提交只在后台打标签，阈值高于普通同 Wi-Fi 场景", () => {
    const now = Date.parse("2026-06-14T10:00:00.000Z");
    const current = createSubmission({
      id: "lead-current",
      visitorId: "visitor-new",
      clientIpHash: "same-ip-hash",
      createdAt: new Date(now).toISOString(),
      contact: { name: "新用户", phone: "13900000000", consent: true }
    });
    const history = Array.from({ length: SUBMISSION_IP_FREQUENCY_LIMIT }, (_, index) =>
      createSubmission({
        id: `ip-${index}`,
        visitorId: `visitor-${index}`,
        clientIpHash: "same-ip-hash",
        createdAt: new Date(now - index * 60_000).toISOString(),
        contact: { name: `用户${index}`, phone: `1370000000${index}`, consent: true }
      })
    );

    expect(SUBMISSION_IP_FREQUENCY_LIMIT).toBeGreaterThanOrEqual(8);
    expect(detectSubmissionRisk(current, history.slice(0, 2), now).flags).toEqual([]);
    expect(detectSubmissionRisk(current, history, now).flags).toEqual(["ip"]);
    expect(detectSubmissionRisk(current, history, now).blocked).toBe(false);
  });

  it("红娘后台把重复手机号、同设备多次和同 IP 高频提交显示成不同标记", () => {
    const girl = generateMatchedGirl({ appearanceVibe: "清冷高级", companionStyle: "温柔稳定", bodyType: "高挑纤细", lifestyle: "宅家追剧", relationshipMode: "高频分享", hairstyle: "齐肩短发" }, rng);
    const jsonl = JSON.stringify({
      id: "risk-lead",
      createdAt: "2026-06-14T10:00:00.000Z",
      quizScore: 96,
      qualified: true,
      personalityTag: "章丘心动天选玩家",
      leadIntent: "girl",
      riskFlags: ["phone", "device", "ip"],
      idealType: { appearanceVibe: "清冷高级", companionStyle: "活泼有梗", bodyType: "高挑纤细", lifestyle: "运动散步", relationshipMode: "稳稳推进", hairstyle: "齐肩短发" },
      idealImageUrl: "/images/ideal-b.png",
      idealImageSeed: "seed-new",
      matchedGirl: girl,
      contact: { name: "小李", phone: "13900000000", consent: true }
    });

    const [lead] = buildHongniangLeadList(jsonl, new Set());

    expect(lead.leadSource).toContain("重复手机号");
    expect(lead.leadSource).toContain("同设备多次提交");
    expect(lead.leadSource).toContain("同 IP 高频提交");
  });
});
