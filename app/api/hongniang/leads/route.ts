import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { buildHongniangLeadList, getHongniangPassword, parseReadIds, verifyHongniangPassword } from "@/lib/hongniang";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.jsonl");
const READ_STATUS_FILE = path.join(DATA_DIR, "read-status.json");

async function readText(filePath: string) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { password?: string };
  const password = getHongniangPassword();

  if (!password) {
    return NextResponse.json({ message: "后台密码未配置" }, { status: 500 });
  }

  if (!verifyHongniangPassword(body.password ?? "", password)) {
    return NextResponse.json({ message: "密码不正确" }, { status: 401 });
  }

  await mkdir(DATA_DIR, { recursive: true });
  const [submissions, readStatus] = await Promise.all([readText(SUBMISSIONS_FILE), readText(READ_STATUS_FILE)]);
  const leads = buildHongniangLeadList(submissions, parseReadIds(readStatus));

  return NextResponse.json({
    ok: true,
    total: leads.length,
    unread: leads.filter((lead) => !lead.read).length,
    leads
  });
}
