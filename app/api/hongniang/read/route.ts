import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { buildReadStatusJson, getHongniangPassword, parseReadIds, verifyHongniangPassword } from "@/lib/hongniang";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const READ_STATUS_FILE = path.join(DATA_DIR, "read-status.json");

async function readCurrentStatus() {
  try {
    return await readFile(READ_STATUS_FILE, "utf8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { id?: string; password?: string; read?: boolean };
  const password = getHongniangPassword();

  if (!password) {
    return NextResponse.json({ message: "后台密码未配置" }, { status: 500 });
  }

  if (!verifyHongniangPassword(body.password ?? "", password)) {
    return NextResponse.json({ message: "密码不正确" }, { status: 401 });
  }

  if (!body.id) {
    return NextResponse.json({ message: "缺少线索 ID" }, { status: 400 });
  }

  await mkdir(DATA_DIR, { recursive: true });
  const readIds = parseReadIds(await readCurrentStatus());

  if (body.read === false) {
    readIds.delete(body.id);
  } else {
    readIds.add(body.id);
  }

  await writeFile(READ_STATUS_FILE, buildReadStatusJson(readIds), "utf8");

  return NextResponse.json({ ok: true, id: body.id, read: readIds.has(body.id) });
}
