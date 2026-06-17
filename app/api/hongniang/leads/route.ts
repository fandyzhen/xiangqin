import { mkdir, readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { buildHongniangLeadList, getHongniangPassword, parseReadIds, verifyHongniangPassword } from "@/lib/hongniang";
import { getDataPaths } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const paths = getDataPaths();
  await mkdir(paths.dataDir, { recursive: true });
  const [submissions, readStatus] = await Promise.all([readText(paths.submissionsFile), readText(paths.readStatusFile)]);
  const leads = buildHongniangLeadList(submissions, parseReadIds(readStatus));

  return NextResponse.json({
    ok: true,
    total: leads.length,
    unread: leads.filter((lead) => !lead.read).length,
    leads
  });
}
