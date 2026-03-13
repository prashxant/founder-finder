import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runFounderPipeline } from "@/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const FindRequestSchema = z.object({
  url: z.string().min(1),
  openrouterKey: z.string().min(1),
  tavilyKey: z.string().optional(),
  icp: z.string().optional(),
  model: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = FindRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const { url, openrouterKey, tavilyKey, icp, model } = parsed.data;

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "A valid URL is required." },
        { status: 400 },
      );
    }

    const result = await runFounderPipeline({
      url,
      openrouterKey,
      tavilyKey,
      icp,
      model,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
