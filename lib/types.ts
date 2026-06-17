export type QuestionKind = "single" | "local" | "personality" | "love" | "fun";

export type Trait = "体贴" | "主动" | "闷骚" | "直球";

export interface QuizOption {
  id: string;
  label: string;
  score?: number;
  trait?: Trait;
  eligibleSingle?: boolean;
  eligibleLocal?: boolean;
}

export interface QuizQuestion {
  id: string;
  kind: QuestionKind;
  text: string;
  options: QuizOption[];
}

export interface PersonalityEvidence {
  question: string;
  answer: string;
  trait: Trait;
  insight: string;
}

export interface QuizResult {
  qualified: boolean;
  disqualifiedReason?: "non-single" | "non-local";
  score: number;
  trait: Trait;
  personalityTag: string;
  personalitySignature: string;
  personalityAnalysis: string;
  personalityEvidence: PersonalityEvidence[];
  suggestions: string[];
}

export interface IdealTypeSelection {
  appearanceVibe: string;
  companionStyle: string;
  bodyType: string;
  lifestyle: string;
  relationshipMode: string;
  hairstyle: string;
}

export interface IdealPromptResult {
  prompt: string;
  negativePrompt: string;
  seed: string;
}

export interface MatchedGirl {
  nickname: string;
  residence: string;
  personality: string;
  profession: string;
  height: number;
  weight: number;
  hobbies: string[];
  matchPercent: number;
  matchGap: string;
}

export type LeadIntent = "girl" | "more";
export type SubmissionRiskFlag = "phone" | "device" | "ip";

export interface LeadContact {
  name: string;
  phone?: string;
  wechat?: string;
  consent: boolean;
}

export interface SubmissionPayload {
  id?: string;
  createdAt?: string;
  clientSubmittedAt?: string;
  visitorId?: string;
  clientIpHash?: string;
  riskFlags?: SubmissionRiskFlag[];
  duplicateReason?: "phone" | "device" | "ip";
  quizScore: number;
  qualified: boolean;
  personalityTag: string;
  leadIntent?: LeadIntent;
  idealType: IdealTypeSelection;
  idealImageUrl: string;
  idealImageSeed: string;
  matchedGirl: MatchedGirl;
  contact: LeadContact;
}
