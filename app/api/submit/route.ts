import { mkdir, appendFile, readFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { APP_NAME } from "@/lib/brand";
import { detectSubmissionRisk } from "@/lib/experience-limit";
import { getDataPaths } from "@/lib/storage";
import { formatSubmissionEmail, validateLeadContact } from "@/lib/submission";
import type { SubmissionPayload } from "@/lib/types";

export const runtime = "nodejs";

const RECIPIENT = process.env.LEAD_TO_EMAIL || "35457311@qq.com";
const IP_HASH_SALT = process.env.IP_HASH_SALT || "zhangqiu-love-rank-ip-marker";

function hasSmtpConfig() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
  );
}

async function writeBackup(payload: SubmissionPayload) {
  const paths = getDataPaths();
  await mkdir(paths.dataDir, { recursive: true });
  await appendFile(paths.submissionsFile, `${JSON.stringify(payload)}\n`, "utf8");
}

async function readBackup() {
  const paths = getDataPaths();
  try {
    const source = await readFile(paths.submissionsFile, "utf8");
    return source
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .flatMap((line) => {
        try {
          return [JSON.parse(line) as SubmissionPayload];
        } catch {
          return [];
        }
      });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function sendEmail(payload: SubmissionPayload) {
  if (!hasSmtpConfig()) {
    return false;
  }

  const port = Number(process.env.SMTP_PORT);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: RECIPIENT,
    subject: `【新线索】${APP_NAME}`,
    text: formatSubmissionEmail(payload)
  });

  return true;
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    forwardedFor ||
    ""
  );
}

function hashClientIp(ip: string) {
  if (!ip) {
    return "";
  }
  return createHash("sha256").update(`${IP_HASH_SALT}:${ip}`).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmissionPayload;
    const validation = validateLeadContact(body.contact);

    if (!validation.valid) {
      return NextResponse.json({ message: validation.message }, { status: 400 });
    }

    const payload: SubmissionPayload = {
      ...body,
      id: body.id || randomUUID(),
      createdAt: body.createdAt || new Date().toISOString(),
      clientIpHash: hashClientIp(getClientIp(request))
    };

    const history = await readBackup();
    const risk = detectSubmissionRisk(payload, history);
    const markedPayload: SubmissionPayload = {
      ...payload,
      riskFlags: risk.flags
    };

    await writeBackup(markedPayload);
    const emailSent = await sendEmail(markedPayload);

    return NextResponse.json({ ok: true, emailSent, recipient: RECIPIENT, riskFlags: risk.flags });
  } catch (error) {
    const message = error instanceof Error ? error.message : "提交失败";
    return NextResponse.json({ message }, { status: 500 });
  }
}
