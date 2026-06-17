import type { SubmissionPayload, SubmissionRiskFlag } from "./types";

export const PHONE_DUPLICATE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
export const SUBMISSION_DEVICE_WINDOW_MS = 24 * 60 * 60 * 1000;
export const SUBMISSION_IP_WINDOW_MS = 24 * 60 * 60 * 1000;
export const SUBMISSION_IP_FREQUENCY_LIMIT = 8;

export interface SubmissionRiskResult {
  flags: SubmissionRiskFlag[];
  blocked: false;
  duplicateLeadId?: string;
}

function getTime(payload: SubmissionPayload) {
  const time = payload.createdAt ? Date.parse(payload.createdAt) : 0;
  return Number.isFinite(time) ? time : 0;
}

function isRecent(payload: SubmissionPayload, now: number, windowMs: number) {
  const time = getTime(payload);
  return time > 0 && now - time < windowMs;
}

function normalizePhone(phone?: string) {
  return phone?.trim() ?? "";
}

export function detectSubmissionRisk(payload: SubmissionPayload, history: SubmissionPayload[], now = Date.now()): SubmissionRiskResult {
  const flags: SubmissionRiskFlag[] = [];
  const phone = normalizePhone(payload.contact.phone);
  const visitorId = payload.visitorId?.trim() ?? "";
  const clientIpHash = payload.clientIpHash?.trim() ?? "";
  const recentSamePhone = phone
    ? history.find((item) => normalizePhone(item.contact.phone) === phone && isRecent(item, now, PHONE_DUPLICATE_WINDOW_MS))
    : undefined;
  const recentSameDeviceCount = visitorId
    ? history.filter((item) => item.visitorId === visitorId && isRecent(item, now, SUBMISSION_DEVICE_WINDOW_MS)).length
    : 0;
  const recentSameIpCount = clientIpHash
    ? history.filter((item) => item.clientIpHash === clientIpHash && isRecent(item, now, SUBMISSION_IP_WINDOW_MS)).length
    : 0;

  if (recentSamePhone) {
    flags.push("phone");
  }
  if (recentSameDeviceCount > 0) {
    flags.push("device");
  }
  if (recentSameIpCount >= SUBMISSION_IP_FREQUENCY_LIMIT) {
    flags.push("ip");
  }

  return {
    flags,
    blocked: false,
    duplicateLeadId: recentSamePhone?.id
  };
}
