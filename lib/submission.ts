import { APP_NAME } from "./brand";
import { getIntendedGirl, getLeadSourceLabel, getRiskLabels } from "./hongniang";
import type { LeadContact, SubmissionPayload } from "./types";

export function validateLeadContact(contact: LeadContact): { valid: boolean; message?: string } {
  const name = contact.name.trim();
  const phone = contact.phone?.trim() ?? "";

  if (!name) {
    return { valid: false, message: "请留一个称呼，方便红娘联系你。" };
  }

  if (!phone) {
    return { valid: false, message: "请填写手机号。" };
  }

  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return { valid: false, message: "请填写正确的手机号。" };
  }

  return { valid: true };
}

export function formatSubmissionEmail(payload: SubmissionPayload) {
  const createdAt = payload.createdAt ?? new Date().toLocaleString("zh-CN", { hour12: false });
  const intendedGirl = getIntendedGirl(payload);
  const riskLabels = getRiskLabels(payload);

  return `【新线索 - ${APP_NAME}】
提交时间：${createdAt}
留资来源：${getLeadSourceLabel(payload.leadIntent)}
后台标记：${riskLabels.length ? riskLabels.join("、") : "无"}
———— 联系方式 ————
称呼：${payload.contact.name}
手机号：${payload.contact.phone || ""}
———— 资格赛 ————
脱单资格赛得分：${payload.quizScore}
性格分析：${payload.personalityTag}
———— 他的理想型 ————
第一眼气质：${payload.idealType.appearanceVibe}
相处性格：${payload.idealType.companionStyle}
身材：${payload.idealType.bodyType}
生活方式：${payload.idealType.lifestyle}
关系模式：${payload.idealType.relationshipMode}
发型：${payload.idealType.hairstyle}
———— ${intendedGirl ? "想认识的女生" : "参考匹配画像"} ————
昵称：${payload.matchedGirl.nickname} / 居住地：${payload.matchedGirl.residence}
身高：${payload.matchedGirl.height} / 体重：${payload.matchedGirl.weight}kg / 职业：${payload.matchedGirl.profession} / 爱好：${payload.matchedGirl.hobbies.join("、")}
契合度：${payload.matchedGirl.matchPercent}%
轻微差距：${payload.matchedGirl.matchGap}
理想型生成图：${payload.idealImageUrl}
seed：${payload.idealImageSeed}`;
}
