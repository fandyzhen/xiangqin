import type { IdealTypeSelection } from "./types";

export const COVER_CLUB_LABEL = "章友恋爱社";
export const CARD_SAVE_SHARE_LABEL = "保存分享让更多人知道";
export const LOCAL_IDEAL_CTA_LABEL = "看看章丘本地有没有理想型";
export const MATCHING_ARCHIVE_TITLE = "检索大章丘红娘档案库";
export const MATCH_FOUND_CTA_LABEL = "去看看";
export const MATCH_EMPTY_TITLE = "你也太挑了吧";
export const MATCH_EMPTY_COPY = "红娘私藏的更多女生资料需要核实你的情况才能给你看";
export const MATCH_EMPTY_CTA_LABEL = "帮我核实";
export const MATCH_EMPTY_STICKER_SRC = "/images/reaction-awkward-sajiao-woman.jpg";
export const CONTACT_INTRO_COPY = "红娘需要核实你的资料才能为你牵线咨询对方意见，免费。";
export const LEAD_AVATAR_SRC = "/images/matchmaker-friendly-smile-avatar.png";
export const LEAD_KICKER_LABEL = "大章丘红娘帮你问";
export const LEAD_TRUST_BADGES = ["仅用于本次牵线", "不公开给女生", "红娘人工联系"];
export const SUCCESS_CONTACT_COPY = "红娘会尽快联系你，请保持手机畅通。";
export const SAVE_IMAGE_HINT = "长按保存图片，发朋友圈或发给朋友。";

export type LeadEntryIntent = "girl" | "more";

export function getLeadPageContent(intent: LeadEntryIntent) {
  if (intent === "girl") {
    return {
      title: "我来帮你问问她",
      copy: "留下称呼和手机号，红娘先核实你的情况，再帮你问问她是否愿意认识。全程免费。",
      helperLine: "你不用自己硬聊，我先帮你问问。",
      contextLabel: "当前意向",
      contextTitle: "想认识刚才这位女生",
      contextCopy: "红娘会先核实你的资料，再替你咨询对方意愿。",
      ctaLabel: "让红娘帮我问问",
      steps: ["核实你的情况", "帮你问问她", "有意向再联系"]
    };
  }

  return {
    title: "我来帮你继续找",
    copy: "留下称呼和手机号，红娘核实后会按你的理想型，再从本地档案里帮你筛。全程免费。",
    helperLine: "你不用一个个刷，我按你的条件继续帮你找。",
    contextLabel: "继续筛选",
    contextTitle: "想看更多章丘本地理想型",
    contextCopy: "红娘会结合你的理想型和本地档案，继续帮你筛更合适的人。",
    ctaLabel: "让红娘继续帮我找",
    steps: ["核实你的情况", "按理想型继续筛", "有合适的再联系"]
  };
}

function uniqueNonEmpty(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

export function buildIdealCardDisplay(selection: IdealTypeSelection) {
  const headline = uniqueNonEmpty([selection.appearanceVibe, selection.hairstyle, selection.bodyType]).join(" · ");
  const tags = uniqueNonEmpty([selection.companionStyle, selection.lifestyle, selection.relationshipMode]);

  return { headline, tags };
}
