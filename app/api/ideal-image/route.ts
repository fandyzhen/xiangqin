import { NextResponse } from "next/server";
import { buildIdealPrompt, createFallbackPortrait } from "@/lib/ideal";
import type { IdealTypeSelection } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const selection = (await request.json()) as IdealTypeSelection;
    const promptResult = buildIdealPrompt(selection);
    const imageUrl = createFallbackPortrait(selection, promptResult.seed);

    return NextResponse.json({
      ...promptResult,
      imageUrl,
      provider: "local-fallback"
    });
  } catch {
    return NextResponse.json({ message: "理想型生成失败，请稍后再试。" }, { status: 400 });
  }
}
