import type { MatchedGirl, SubmissionPayload } from "./types";

export const HONGNIANG_DEFAULT_PASSWORD = "dazhangqiu13#";

export type HongniangLead = SubmissionPayload & {
  read: boolean;
  leadSource: string;
  intendedGirl: MatchedGirl | null;
};

export function verifyHongniangPassword(input: string, password = process.env.HONGNIANG_PASSWORD || HONGNIANG_DEFAULT_PASSWORD) {
  return input === password;
}

export function getLeadSourceLabel(intent: SubmissionPayload["leadIntent"]) {
  if (intent === "girl") {
    return "想认识这位女生";
  }
  return "想看更多本地理想型";
}

const RISK_LABELS = {
  phone: "重复手机号",
  device: "同设备多次提交",
  ip: "同 IP 高频提交"
} as const;

export function getRiskLabels(payload: SubmissionPayload) {
  const flags = payload.riskFlags?.length ? payload.riskFlags : payload.duplicateReason ? [payload.duplicateReason] : [];
  return flags.map((flag) => RISK_LABELS[flag]).filter(Boolean);
}

export function getIntendedGirl(payload: SubmissionPayload) {
  return payload.leadIntent === "girl" ? payload.matchedGirl : null;
}

export function parseReadIds(source: string) {
  if (!source.trim()) {
    return new Set<string>();
  }

  try {
    const data = JSON.parse(source) as { readIds?: string[] };
    return new Set((data.readIds ?? []).filter(Boolean));
  } catch {
    return new Set<string>();
  }
}

export function buildReadStatusJson(readIds: Set<string>) {
  return JSON.stringify(
    {
      updatedAt: new Date().toISOString(),
      readIds: Array.from(readIds)
    },
    null,
    2
  );
}

export function buildHongniangLeadList(jsonl: string, readIds: Set<string>) {
  return jsonl
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as SubmissionPayload];
      } catch {
        return [];
      }
    })
    .map((payload): HongniangLead => ({
      ...payload,
      read: Boolean(payload.id && readIds.has(payload.id)),
      leadSource: [getLeadSourceLabel(payload.leadIntent), ...getRiskLabels(payload)].join(" · "),
      intendedGirl: getIntendedGirl(payload)
    }))
    .sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bTime - aTime;
    });
}
