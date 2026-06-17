import { QUESTION_BANK, SUGGESTIONS, TRAIT_PRIORITY } from "./questions";
import type { QuizOption, QuizQuestion, QuizResult, Trait } from "./types";

type Rng = () => number;
type TraitCount = {
  trait: Trait;
  count: number;
};

const defaultRng: Rng = () => Math.random();
const SCORE_AURAS = ["高光", "主线", "潜力", "成长"] as const;
const TRAIT_COMBO_NAMES: Record<Trait, Record<Trait, string>> = {
  体贴: {
    体贴: "细节守护者",
    主动: "攻守兼备者",
    闷骚: "温柔反差男",
    直球: "坦诚守护者"
  },
  主动: {
    体贴: "暖场推进官",
    主动: "心动发起人",
    闷骚: "反差行动派",
    直球: "直球冲锋手"
  },
  闷骚: {
    体贴: "慢热治愈系",
    主动: "隐藏推进派",
    闷骚: "慢热宝藏男",
    直球: "外冷内直男"
  },
  直球: {
    体贴: "真诚照顾派",
    主动: "坦率开局王",
    闷骚: "反差真诚派",
    直球: "真诚直球派"
  }
};
const TRAIT_CHARM_COPY: Record<Trait, string> = {
  体贴: "你的魅力来自细节和照顾感，容易让人觉得相处很安心。",
  主动: "你的魅力来自行动力和方向感，关系不容易卡在尴尬沉默里。",
  闷骚: "你的魅力来自反差和慢热，熟悉之后会有越挖越有料的感觉。",
  直球: "你的魅力来自坦荡和真诚，不绕弯子的表达反而很有记忆点。"
};
const TRAIT_STYLE_COPY: Record<Trait, string> = {
  体贴: "你还带一点细节流，会把对方没说出口的小情绪放在心上。",
  主动: "你还带一点上分流，关键时候愿意把关系往前推一步。",
  闷骚: "你还带一点反差流，表面稳住，心里其实有自己的小剧场。",
  直球: "你还带一点坦率流，喜欢把想法讲清楚，不让关系长期猜谜。"
};

export const PERSONALITY_ARCHETYPE_COUNT = SCORE_AURAS.length * TRAIT_PRIORITY.length * TRAIT_PRIORITY.length;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function shuffled<T>(items: T[], rng: Rng): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function pick<T>(items: T[], count: number, rng: Rng) {
  return shuffled(items, rng).slice(0, count);
}

function withShuffledOptions(question: QuizQuestion, rng: Rng): QuizQuestion {
  return {
    ...question,
    options: shuffled(question.options, rng)
  };
}

function findSelectedOption(question: QuizQuestion, selectedId: string | undefined): QuizOption | undefined {
  return question.options.find((option) => option.id === selectedId);
}

function traitInsight(trait: Trait) {
  switch (trait) {
    case "体贴":
      return "说明你会先照顾对方感受，再处理问题。";
    case "主动":
      return "说明你愿意推进关系，不把机会全交给运气。";
    case "闷骚":
      return "说明你有心动但偏慢热，需要更多表达出口。";
    case "直球":
      return "说明你表达直接坦荡，但要多补一点情绪缓冲。";
    default:
      return "说明你的恋爱处理方式有明显个人风格。";
  }
}

function rankTraits(traits: Trait[]): TraitCount[] {
  const counts = new Map<Trait, number>();
  for (const trait of traits) {
    counts.set(trait, (counts.get(trait) ?? 0) + 1);
  }

  return [...TRAIT_PRIORITY]
    .map((trait) => ({ trait, count: counts.get(trait) ?? 0 }))
    .sort((left, right) => {
      const diff = right.count - left.count;
      return diff || TRAIT_PRIORITY.indexOf(left.trait) - TRAIT_PRIORITY.indexOf(right.trait);
    });
}

function pickTrait(traits: Trait[]): Trait {
  return rankTraits(traits)[0].trait;
}

function pickSecondaryTrait(traits: Trait[], primary: Trait): Trait {
  const ranked = rankTraits(traits);
  return ranked.find((item) => item.trait !== primary && item.count > 0)?.trait ?? primary;
}

function scoreAura(score: number) {
  if (score >= 95) return "高光";
  if (score >= 90) return "主线";
  if (score >= 84) return "潜力";
  return "成长";
}

function buildPersonalityProfile(primary: Trait, secondary: Trait, score: number) {
  const aura = scoreAura(score);
  const tag = `${aura}${TRAIT_COMBO_NAMES[primary][secondary]}型`;
  const styleCopy = secondary === primary ? "" : TRAIT_STYLE_COPY[secondary];

  return {
    tag,
    copy: `${TRAIT_CHARM_COPY[primary]}${styleCopy}这张人格卡不是只看分数，而是由你的答题选择组合出来的专属称号。`
  };
}

export function buildQuiz(rng: Rng = defaultRng): QuizQuestion[] {
  return [
    ...pick(QUESTION_BANK.single, 1, rng),
    ...pick(QUESTION_BANK.local, 1, rng),
    ...pick(QUESTION_BANK.personality, 2, rng),
    ...pick(QUESTION_BANK.love, 2, rng),
    ...pick(QUESTION_BANK.fun, 2, rng)
  ].map((question) => withShuffledOptions(question, rng));
}

export function scoreQuiz(
  quiz: QuizQuestion[],
  answers: Record<string, string>,
  rng: Rng = defaultRng
): QuizResult {
  const singleQuestion = quiz.find((question) => question.kind === "single");
  const localQuestion = quiz.find((question) => question.kind === "local");
  const singleAnswer = singleQuestion ? findSelectedOption(singleQuestion, answers[singleQuestion.id]) : undefined;
  const localAnswer = localQuestion ? findSelectedOption(localQuestion, answers[localQuestion.id]) : undefined;
  const disqualifiedReason =
    singleAnswer?.eligibleSingle === false || !singleAnswer
      ? "non-single"
      : localAnswer?.eligibleLocal === false || !localAnswer
        ? "non-local"
        : undefined;

  const scoringAnswers = quiz
    .filter((question) => question.kind !== "single" && question.kind !== "local")
    .map((question) => ({
      question,
      option: findSelectedOption(question, answers[question.id])
    }))
    .filter((item): item is { question: QuizQuestion; option: QuizOption } => Boolean(item.option));

  const rawScore = scoringAnswers.reduce((sum, item) => sum + (item.option.score ?? 0), 0);
  const score = disqualifiedReason
    ? clamp(Math.round(62 + rawScore * 1.7), 58, 92)
    : clamp(Math.round(78 + rawScore), 78, 99);
  const traits = scoringAnswers
    .map((item) => item.option.trait)
    .filter((value): value is Trait => Boolean(value));
  const trait = pickTrait(traits);
  const secondaryTrait = pickSecondaryTrait(traits, trait);
  const analysis = buildPersonalityProfile(trait, secondaryTrait, score);
  const personalityEvidence = scoringAnswers
    .filter((item): item is { question: QuizQuestion; option: QuizOption & { trait: Trait } } => Boolean(item.option.trait))
    .map((item) => ({
      question: item.question.text,
      answer: item.option.label,
      trait: item.option.trait,
      insight: traitInsight(item.option.trait)
    }));

  return {
    qualified: !disqualifiedReason,
    disqualifiedReason,
    score,
    trait,
    personalityTag: analysis.tag,
    personalitySignature: `我的恋爱人格：${analysis.tag}`,
    personalityAnalysis: analysis.copy,
    personalityEvidence,
    suggestions: shuffled(SUGGESTIONS, rng).slice(0, 3)
  };
}
