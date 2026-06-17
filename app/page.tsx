"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { buildShareAchievement } from "@/lib/achievement";
import { APP_NAME } from "@/lib/brand";
import { COVER_CTA_LABEL, COVER_GALLERY_IMAGES, COVER_META_BADGES, COVER_QUALIFY_LABEL } from "@/lib/cover";
import { CUSTOMIZE_FINAL_HINT, CUSTOMIZE_STEP_HINT, IDEAL_LOADING_SUBTITLE, IDEAL_LOADING_TITLE, IDEAL_STEPS, type ChoiceOption, type IdealStep } from "@/lib/ideal-steps";
import { buildIdealPrompt, createFallbackPortrait } from "@/lib/ideal";
import { formatMatchCopy, generateMatchedGirls, randomMatchCount } from "@/lib/match";
import { PARTICIPANT_STORAGE_KEY, nextParticipantCount } from "@/lib/participants";
import { buildQuiz, scoreQuiz } from "@/lib/quiz";
import { validateLeadContact } from "@/lib/submission";
import {
  CARD_SAVE_SHARE_LABEL,
  COVER_CLUB_LABEL,
  LEAD_AVATAR_SRC,
  LEAD_KICKER_LABEL,
  LEAD_TRUST_BADGES,
  type LeadEntryIntent,
  LOCAL_IDEAL_CTA_LABEL,
  MATCHING_ARCHIVE_TITLE,
  MATCH_EMPTY_CTA_LABEL,
  MATCH_EMPTY_STICKER_SRC,
  MATCH_EMPTY_TITLE,
  MATCH_FOUND_CTA_LABEL,
  SAVE_IMAGE_HINT,
  SUCCESS_CONTACT_COPY,
  buildIdealCardDisplay,
  getLeadPageContent
} from "@/lib/ui-flow";
import type {
  IdealPromptResult,
  IdealTypeSelection,
  LeadContact,
  MatchedGirl,
  QuizQuestion,
  QuizResult,
  SubmissionPayload
} from "@/lib/types";

type Stage = "cover" | "quiz" | "result" | "customize" | "generating" | "card" | "matching" | "match" | "lead" | "success";

type ImageState = IdealPromptResult & {
  imageUrl: string;
  provider: string;
};

const DEFAULT_IDEAL: IdealTypeSelection = {
  appearanceVibe: "",
  companionStyle: "",
  bodyType: "",
  lifestyle: "",
  relationshipMode: "",
  hairstyle: ""
};

const QUALIFY_RATE = 78.23;

const MATCH_LINES = ["读取本地资料标签中", "相处性格匹配中", "生活方式匹配中", "关系节奏匹配中", "身材状态匹配中"];
const MATCH_SCAN_STEP_DELAY_MS = 600;
const VISITOR_ID_STORAGE_KEY = "zq_visitor_id";

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `lead-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function getOrCreateVisitorId() {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem(VISITOR_ID_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const nextId = `visitor-${randomId()}`;
  window.localStorage.setItem(VISITOR_ID_STORAGE_KEY, nextId);
  return nextId;
}

function ChoiceCard({
  active,
  option,
  onClick
}: {
  active: boolean;
  option: ChoiceOption;
  onClick: () => void;
}) {
  return (
    <button className={`choice-card ${active ? "is-active" : ""}`} type="button" onClick={onClick}>
      <span className="choice-emoji" aria-hidden="true">
        {option.emoji}
      </span>
      <span className="choice-copy">
        <strong>{option.value}</strong>
        <small>{option.desc}</small>
      </span>
      <span className="choice-mark" aria-hidden="true">
        {active ? "✓" : ""}
      </span>
    </button>
  );
}

export default function HomePage() {
  const [stage, setStage] = useState<Stage>("cover");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [ideal, setIdeal] = useState<IdealTypeSelection>(DEFAULT_IDEAL);
  const [idealStepIndex, setIdealStepIndex] = useState(0);
  const [imageState, setImageState] = useState<ImageState | null>(null);
  const [qrCode, setQrCode] = useState("");
  const [shareImage, setShareImage] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [qualifyRate, setQualifyRate] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [matchStep, setMatchStep] = useState(0);
  const [matchedGirls, setMatchedGirls] = useState<MatchedGirl[]>([]);
  const [matchIndex, setMatchIndex] = useState(0);
  const [leadIntent, setLeadIntent] = useState<LeadEntryIntent>("more");
  const [contact, setContact] = useState<LeadContact>({ name: "", phone: "", wechat: "", consent: true });
  const [formMessage, setFormMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [visitorId, setVisitorId] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const currentQuestion = quiz[questionIndex];
  const progress = quiz.length ? Math.round(((questionIndex + 1) / quiz.length) * 100) : 0;
  const currentIdealStep = IDEAL_STEPS[idealStepIndex] ?? IDEAL_STEPS[0];
  const idealProgress = Math.round(((idealStepIndex + 1) / IDEAL_STEPS.length) * 100);
  const achievement = useMemo(
    () =>
      result
        ? buildShareAchievement({
            score: result.score,
            personalityTag: result.personalityTag,
            qualified: result.qualified
          })
        : null,
    [result]
  );
  const idealSummary = useMemo(
    () => [ideal.appearanceVibe, ideal.companionStyle, ideal.bodyType, ideal.lifestyle, ideal.relationshipMode, ideal.hairstyle].filter(Boolean),
    [ideal]
  );
  const idealCardDisplay = useMemo(() => buildIdealCardDisplay(ideal), [ideal]);
  const activeMatchedGirl = matchedGirls[matchIndex] ?? null;
  const leadContent = useMemo(() => getLeadPageContent(leadIntent), [leadIntent]);

  useEffect(() => {
    setVisitorId(getOrCreateVisitorId());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextCount = nextParticipantCount(window.localStorage.getItem(PARTICIPANT_STORAGE_KEY));
    window.localStorage.setItem(PARTICIPANT_STORAGE_KEY, String(nextCount));

    let frame = 0;
    let timer = 0;
    const totalFrames = 42;
    const delayTimer = window.setTimeout(() => {
      timer = window.setInterval(() => {
        frame += 1;
        const eased = 1 - Math.pow(1 - frame / totalFrames, 3);
        setParticipantCount(Math.round(nextCount * eased));
        setQualifyRate(Number((QUALIFY_RATE * eased).toFixed(2)));
        if (frame >= totalFrames) {
          window.clearInterval(timer);
          setParticipantCount(nextCount);
          setQualifyRate(QUALIFY_RATE);
        }
      }, 22);
    }, 180);

    return () => {
      window.clearTimeout(delayTimer);
      if (timer) window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function makeQr() {
      if (typeof window === "undefined") return;
      const QRCode = await import("qrcode");
      const dataUrl = await QRCode.toDataURL(window.location.href.split("#")[0], {
        width: 128,
        margin: 1,
        color: {
          dark: "#3d2e2a",
          light: "#faf5f0"
        }
      });
      if (!cancelled) {
        setQrCode(dataUrl);
      }
    }

    makeQr();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (stage !== "matching") return;

    setMatchStep(0);
    const count = randomMatchCount();
    setMatchCount(count);
    setMatchIndex(0);
    setMatchedGirls(generateMatchedGirls(ideal, count));
    const timers = MATCH_LINES.map((_, index) =>
      window.setTimeout(() => {
        setMatchStep(index + 1);
      }, MATCH_SCAN_STEP_DELAY_MS * (index + 1))
    );

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, [ideal, stage]);

  function startQuiz() {
    const nextQuiz = buildQuiz();
    setQuiz(nextQuiz);
    setQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setImageState(null);
    setShareImage("");
    setShareModalOpen(false);
    setFormMessage("");
    setIdeal(DEFAULT_IDEAL);
    setIdealStepIndex(0);
    setMatchedGirls([]);
    setMatchIndex(0);
    setMatchCount(0);
    setLeadIntent("more");
    setContact({ name: "", phone: "", wechat: "", consent: true });
    setStage("quiz");
  }

  function answerQuestion(question: QuizQuestion, optionId: string) {
    const nextAnswers = { ...answers, [question.id]: optionId };
    setAnswers(nextAnswers);

    if (questionIndex >= quiz.length - 1) {
      setResult(scoreQuiz(quiz, nextAnswers));
      setStage("result");
      return;
    }

    window.setTimeout(() => setQuestionIndex((value) => value + 1), 160);
  }

  function createNextIdeal(step: IdealStep, value: string): IdealTypeSelection {
    const nextIdeal = { ...ideal };
    switch (step.key) {
      case "appearanceVibe":
        return { ...nextIdeal, appearanceVibe: value };
      case "companionStyle":
        return { ...nextIdeal, companionStyle: value };
      case "bodyType":
        return { ...nextIdeal, bodyType: value };
      case "lifestyle":
        return { ...nextIdeal, lifestyle: value };
      case "relationshipMode":
        return { ...nextIdeal, relationshipMode: value };
      case "hairstyle":
        return { ...nextIdeal, hairstyle: value };
      default:
        return nextIdeal;
    }
  }

  function selectIdealOption(step: IdealStep, value: string) {
    const nextIdeal = createNextIdeal(step, value);
    setIdeal(nextIdeal);

    if (idealStepIndex >= IDEAL_STEPS.length - 1) {
      window.setTimeout(() => generateIdeal("card", nextIdeal), 160);
      return;
    }

    window.setTimeout(() => setIdealStepIndex((index) => Math.min(index + 1, IDEAL_STEPS.length - 1)), 160);
  }

  function isChoiceActive(step: IdealStep, value: string) {
    return ideal[step.key] === value;
  }

  function openCustomize() {
    setIdeal(DEFAULT_IDEAL);
    setIdealStepIndex(0);
    setStage("customize");
  }

  async function generateIdeal(nextStage: Stage = "card", selectedIdeal: IdealTypeSelection = ideal) {
    setStage("generating");
    setShareImage("");
    setShareModalOpen(false);

    try {
      const response = await fetch("/api/ideal-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedIdeal)
      });

      if (!response.ok) {
        throw new Error("image api failed");
      }

      const data = (await response.json()) as ImageState;
      setImageState(data);
    } catch {
      const promptResult = buildIdealPrompt(selectedIdeal);
      setImageState({
        ...promptResult,
        imageUrl: createFallbackPortrait(selectedIdeal, promptResult.seed),
        provider: "client-fallback"
      });
    }

    window.setTimeout(() => setStage(nextStage), 640);
  }

  async function saveShareCard() {
    if (!cardRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      backgroundColor: null,
      useCORS: true
    });
    setShareImage(canvas.toDataURL("image/png"));
    setShareModalOpen(true);
  }

  function openMatchedGirls() {
    setMatchIndex(0);
    setStage("match");
  }

  function showNextMatchedGirl() {
    setMatchIndex((index) => Math.min(index + 1, matchedGirls.length));
  }

  function goToLeadForm(intent: LeadEntryIntent = "more") {
    setLeadIntent(intent);
    setFormMessage("");
    setStage("lead");
  }

  async function shareEntry() {
    const text = achievement?.shareText ?? `我刚测了${APP_NAME}，看看你能不能解锁红娘匹配。`;
    const url = window.location.href.split("#")[0];

    if (navigator.share) {
      await navigator.share({ title: APP_NAME, text, url });
      return;
    }

    await navigator.clipboard.writeText(`${text} ${url}`);
    setFormMessage("链接已复制，发给单身兄弟试试。");
  }

  async function submitLead() {
    if (!result || !imageState) return;
    const matchedGirl = activeMatchedGirl ?? matchedGirls[matchedGirls.length - 1];
    if (!matchedGirl) return;
    const validation = validateLeadContact(contact);
    if (!validation.valid) {
      setFormMessage(validation.message ?? "请检查留资信息。");
      return;
    }

    const payload: SubmissionPayload = {
      id: randomId(),
      visitorId: visitorId || getOrCreateVisitorId(),
      clientSubmittedAt: new Date().toISOString(),
      quizScore: result.score,
      qualified: result.qualified,
      personalityTag: result.personalityTag,
      leadIntent,
      idealType: ideal,
      idealImageUrl: imageState.imageUrl,
      idealImageSeed: imageState.seed,
      matchedGirl,
      contact
    };

    setSubmitting(true);
    setFormMessage("");

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message || "提交失败");
      }

      setStage("success");
      setShareImage("");
      setShareModalOpen(false);
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : "提交失败，请稍后再试。");
    } finally {
      setSubmitting(false);
    }
  }

  function renderShareCard() {
    if (!result || !imageState) return null;

    return (
      <div className="share-card" ref={cardRef}>
        <div className="poster-hero">
          <img className="ideal-portrait" src={imageState.imageUrl} alt="理想型 AI 概念图" />
          <div className="poster-topline">
            <span>{APP_NAME}</span>
            <strong>{achievement?.rank ?? "A"}</strong>
          </div>
          <div className="poster-score">
            <span>脱单战力</span>
            <strong>{result.score}</strong>
          </div>
          {qrCode ? <img className="poster-qr" src={qrCode} alt="再入口二维码" /> : <span className="poster-qr qr-fallback">扫码再测</span>}
          <div className="poster-caption">
            <span>我的恋爱人格</span>
            <strong>{result.personalityTag}</strong>
          </div>
        </div>
        {achievement && <p className="share-hook">{achievement.shareText}</p>}
        <div className="ideal-definition">
          <span>我的理想型</span>
          <strong>{idealCardDisplay.headline}</strong>
          <div className="card-tags">
            {idealCardDisplay.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="shell">
      <section className={`phone stage-${stage}`}>
        {stage !== "cover" && (
          <div className="topbar">
            <span>{APP_NAME}</span>
            <strong>章丘限定</strong>
          </div>
        )}

        {stage === "cover" && (
          <div className="screen cover-screen">
            <div className="game-aura" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>

            <div className="cover-hero">
              <span className="cover-kicker">ZHANGQIU BOYS · LOVE RANK</span>
              <h1 className="hero-title" aria-label={APP_NAME}>
                <span className="hero-title-area">章丘男生</span>
                <span className="hero-title-main">脱单资格赛</span>
              </h1>
              <p>闯关成功，即可定制你的专属理想型。</p>
            </div>

            <div className="game-console">
              <div className="console-screen">
                <span>赛季热度</span>
                <strong>{participantCount.toLocaleString("en-US")}</strong>
                <small>章丘男生已进入挑战</small>
                <div className="scanline" aria-hidden="true" />
              </div>
              <div className="qualify-ring">
                <span>{COVER_QUALIFY_LABEL}</span>
                <strong>{qualifyRate.toFixed(2)}%</strong>
                <small>当前挑战热度</small>
              </div>
            </div>

            <div className="reward-preview" aria-label="理想型通关奖励预览">
              <span>通关奖励预览</span>
              <div className="preview-carousel">
                {[0, 1, 2].map((column) => (
                  <div className="preview-slot" style={{ "--slot": column } as CSSProperties} key={column}>
                    {COVER_GALLERY_IMAGES.filter((_, index) => index % 3 === column).map((image, index) => (
                      <img
                        src={image.src}
                        alt={image.alt}
                        style={{ "--frame": index } as CSSProperties}
                        key={image.src}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <button className="primary-cta" type="button" onClick={startQuiz}>
              {COVER_CTA_LABEL}
            </button>
            <p className="cover-club-label">{COVER_CLUB_LABEL}</p>

            {COVER_META_BADGES.length > 0 && (
              <div className="cover-meta">
                {COVER_META_BADGES.map((badge) => (
                  <span key={badge}>{badge}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {stage === "quiz" && currentQuestion && (
          <div className="screen quiz-screen">
            <div className="progress-block">
              <span>
                第 {questionIndex + 1} / {quiz.length} 题
              </span>
              <div className="progress-track">
                <i style={{ width: `${progress}%` }} />
              </div>
            </div>
            <article className="question-card">
              <span className="question-kind">{currentQuestion.kind === "single" || currentQuestion.kind === "local" ? "资格核验" : "恋爱战力"}</span>
              <h2>{currentQuestion.text}</h2>
              <div className="answer-list">
                {currentQuestion.options.map((option, index) => (
                  <button
                    className={`answer-button ${answers[currentQuestion.id] === option.id ? "is-picked" : ""}`}
                    key={option.id}
                    type="button"
                    onClick={() => answerQuestion(currentQuestion, option.id)}
                  >
                    <span>{String.fromCharCode(65 + index)}</span>
                    <strong>{option.label}</strong>
                  </button>
                ))}
              </div>
            </article>
          </div>
        )}

        {stage === "result" && result && (
          <div className="screen result-screen">
            <div className={`result-score ${result.qualified ? "qualified" : "blocked"}`}>
              <span>{achievement?.rarity ?? (result.qualified ? "资格通过" : "围观战报")}</span>
              <strong>{result.score}</strong>
              <small>{achievement ? `${achievement.rank} · ${achievement.title}` : "脱单战力分"}</small>
              {achievement && (
                <div className="honor-strip">
                  <span>{achievement.badge}</span>
                  <span>击败 {achievement.percentile}% 章丘男生</span>
                </div>
              )}
            </div>
            <article className="analysis-card">
              <span className="analysis-kicker">我的恋爱人格</span>
              <h2>{result.personalityTag}</h2>
              <p>{result.personalityAnalysis}</p>
              {result.personalityEvidence.length > 0 && (
                <div className="evidence-block">
                  <strong>结论依据</strong>
                  {result.personalityEvidence.map((item) => (
                    <div className="evidence-item" key={`${item.question}-${item.answer}`}>
                      <span>{item.trait}</span>
                      <p>{item.question}</p>
                      <small>
                        你的选择：{item.answer}。{item.insight}
                      </small>
                    </div>
                  ))}
                </div>
              )}
              <ul>
                {result.suggestions.map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            </article>
            {result.qualified ? (
              <button className="primary-cta" type="button" onClick={openCustomize}>
                定制我的理想型
              </button>
            ) : (
              <div className="share-panel">
                <p>{result.disqualifiedReason === "non-local" ? "章丘男生通道目前只服务章丘本地，期待以后开到你那边。" : "把这个挑战入口发给你的单身兄弟。"}</p>
                <button className="primary-cta" type="button" onClick={shareEntry}>
                  分享给兄弟
                </button>
              </div>
            )}
          </div>
        )}

        {stage === "customize" && (
          <div className="screen customize-screen">
            <div className="ideal-stepbar">
              <span>
                理想型 {idealStepIndex + 1} / {IDEAL_STEPS.length}
              </span>
              <div className="progress-track">
                <i style={{ width: `${idealProgress}%` }} />
              </div>
            </div>

            <header className="ideal-head">
              <span>{CUSTOMIZE_STEP_HINT}</span>
              <h2>{currentIdealStep.title}</h2>
              <p>{currentIdealStep.subtitle}</p>
            </header>

            <div className={`choice-list layout-${currentIdealStep.layout ?? "grid"}`}>
              {currentIdealStep.options.map((option) => (
                <ChoiceCard
                  active={isChoiceActive(currentIdealStep, option.value)}
                  key={option.value}
                  option={option}
                  onClick={() => selectIdealOption(currentIdealStep, option.value)}
                />
              ))}
            </div>

            <div className="ideal-summary">
              {idealSummary.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <div className="step-actions">
              <button
                className="ghost-cta"
                type="button"
                disabled={idealStepIndex === 0}
                onClick={() => setIdealStepIndex((value) => Math.max(value - 1, 0))}
              >
                上一步
              </button>
              <span className="auto-next-hint">{idealStepIndex >= IDEAL_STEPS.length - 1 ? CUSTOMIZE_FINAL_HINT : "点一个选项继续"}</span>
            </div>
          </div>
        )}

        {stage === "generating" && (
          <div className="screen loading-screen">
            <div className="radar">
              <i />
              <i />
              <i />
            </div>
            <h2>{IDEAL_LOADING_TITLE}</h2>
            <p>{IDEAL_LOADING_SUBTITLE}</p>
          </div>
        )}

        {stage === "card" && result && imageState && (
          <div className="screen card-screen">
            {renderShareCard()}
            <button className="secondary-cta" type="button" onClick={saveShareCard}>
              {CARD_SAVE_SHARE_LABEL}
            </button>
            <button className="primary-cta" type="button" onClick={() => setStage("matching")}>
              {LOCAL_IDEAL_CTA_LABEL}
            </button>
          </div>
        )}

        {stage === "matching" && (
          <div className="screen matching-screen">
            <header className="match-archive-header">
              <span>ZHANGQIU LOCAL ARCHIVE</span>
              <h2 className="match-archive-title">{MATCHING_ARCHIVE_TITLE}</h2>
            </header>
            <div className="archive-box">
              {MATCH_LINES.map((line, index) => (
                <p className={matchStep > index ? "is-done" : ""} key={line}>
                  {matchStep > index ? "✓ " : "· "}
                  {line}…
                </p>
              ))}
              {matchStep >= MATCH_LINES.length && (
                <>
                  <strong className="match-found-text">
                    发现 <span className="match-count-number">{matchCount}</span> 位符合你理想型的章丘女生
                  </strong>
                  <button className="primary-cta" type="button" onClick={openMatchedGirls}>
                    {MATCH_FOUND_CTA_LABEL}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {stage === "match" && activeMatchedGirl && (
          <div className="screen match-screen">
            <article className="girl-card">
              <div className="blur-avatar">
                <img src={imageState?.imageUrl ?? "/images/ideal-fallback-premium.png"} alt="" />
                <span>{activeMatchedGirl.nickname.slice(0, 1)}</span>
              </div>
              <div className="match-percent">
                <span>契合度</span>
                <strong>{activeMatchedGirl.matchPercent}%</strong>
              </div>
              <h2>{activeMatchedGirl.nickname}</h2>
              <p>{activeMatchedGirl.residence}</p>
              <dl>
                <div>
                  <dt>性格</dt>
                  <dd>{activeMatchedGirl.personality}</dd>
                </div>
                <div>
                  <dt>职业</dt>
                  <dd>{activeMatchedGirl.profession}</dd>
                </div>
                <div>
                  <dt>身高</dt>
                  <dd>{activeMatchedGirl.height}cm</dd>
                </div>
                <div>
                  <dt>体重</dt>
                  <dd>{activeMatchedGirl.weight}kg</dd>
                </div>
              </dl>
              <div className="hobby-row">
                {activeMatchedGirl.hobbies.map((hobby) => (
                  <span key={hobby}>{hobby}</span>
                ))}
              </div>
              <div className="fit-list">
                <span>相处感 ✓ 很合拍</span>
                <span>生活方式 ✓ 有共同画面</span>
                <span>关系节奏 ✓ 接近同频</span>
                <span>身高体重 ≈ 有一点真实差距</span>
              </div>
            </article>
            <p className="match-copy">{formatMatchCopy(activeMatchedGirl.matchPercent, activeMatchedGirl.matchGap)}</p>
            <button className="primary-cta" type="button" onClick={() => goToLeadForm("girl")}>
              想认识她
            </button>
            <button className="secondary-cta subtle-cta" type="button" onClick={showNextMatchedGirl}>
              换一位看看
            </button>
          </div>
        )}

        {stage === "match" && !activeMatchedGirl && (
          <div className="screen match-screen">
            <div className="archive-box empty-match-box">
              <div className="empty-match-sticker" aria-label="30岁女生为难撒娇表情包">
                <img src={MATCH_EMPTY_STICKER_SRC} alt="" />
              </div>
              <h2>{MATCH_EMPTY_TITLE}</h2>
              <p>
                <span>红娘私藏的</span>
                <span className="empty-match-emphasis">更多女生</span>
                <span>资料需要核实你的情况才能给你看</span>
              </p>
              <button className="primary-cta" type="button" onClick={() => goToLeadForm("more")}>
                {MATCH_EMPTY_CTA_LABEL}
              </button>
            </div>
          </div>
        )}

        {stage === "success" && (
          <div className="screen success-screen">
            <div className="success-mark">✓</div>
            <h2>资料已提交</h2>
            <p>{SUCCESS_CONTACT_COPY}</p>
            <div className="success-share-wrap">{renderShareCard()}</div>
            <button className="primary-cta" type="button" onClick={saveShareCard}>
              {CARD_SAVE_SHARE_LABEL}
            </button>
          </div>
        )}

        {stage === "lead" && (
          <div className="screen lead-screen">
            <div className="lead-card">
              <div className="lead-helper">
                <img className="lead-helper-avatar" src={LEAD_AVATAR_SRC} alt="大章丘红娘头像" />
                <div>
                  <span>{LEAD_KICKER_LABEL}</span>
                  <strong>{leadContent.helperLine}</strong>
                </div>
              </div>

              <header className="lead-title-block">
                <h2>{leadContent.title}</h2>
                <p>{leadContent.copy}</p>
              </header>

              <div className="lead-intent-strip">
                <span>{leadContent.contextLabel}</span>
                <strong>{leadContent.contextTitle}</strong>
                <small>{leadContent.contextCopy}</small>
              </div>

              <div className="lead-trust-row">
                {LEAD_TRUST_BADGES.map((badge) => (
                  <span key={badge}>{badge}</span>
                ))}
              </div>

              <ol className="lead-steps" aria-label="红娘处理流程">
                {leadContent.steps.map((step, index) => (
                  <li key={step}>
                    <span>{index + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>

              <label>
                怎么称呼你
                <input value={contact.name} onChange={(event) => setContact((current) => ({ ...current, name: event.target.value }))} placeholder="比如：小王" />
              </label>
              <label>
                红娘联系你的手机号
                <input value={contact.phone} onChange={(event) => setContact((current) => ({ ...current, phone: event.target.value }))} inputMode="tel" placeholder="请输入 11 位手机号" />
              </label>
              {formMessage && <p className="form-message">{formMessage}</p>}
              <button className="primary-cta" type="button" disabled={submitting} onClick={submitLead}>
                {submitting ? "提交中" : leadContent.ctaLabel}
              </button>
            </div>
          </div>
        )}

        {shareModalOpen && shareImage && (
          <div className="modal-backdrop">
            <div className="share-modal">
              <button className="modal-close" type="button" onClick={() => setShareModalOpen(false)}>
                ×
              </button>
              <p>{SAVE_IMAGE_HINT}</p>
              <img src={shareImage} alt="可保存的战绩卡" />
              {stage === "card" && (
                <button
                  className="primary-cta"
                  type="button"
                  onClick={() => {
                    setShareModalOpen(false);
                    setStage("matching");
                  }}
                >
                  {LOCAL_IDEAL_CTA_LABEL}
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
