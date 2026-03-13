import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runFounderPipeline } from "@/pipeline";
import { getPostHogClient } from "@/lib/posthog-server";

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
  const distinctId =
    request.headers.get("X-POSTHOG-DISTINCT-ID") ?? "anonymous";
  const sessionId = request.headers.get("X-POSTHOG-SESSION-ID") ?? undefined;

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

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId,
      event: "api_find_completed",
      properties: {
        company_url: url,
        company_name: result.company,
        founders_found: result.founders.length,
        has_tavily_key: Boolean(tavilyKey),
        has_icp: Boolean(icp),
        $session_id: sessionId,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId,
      event: "api_find_failed",
      properties: {
        error_message:
          error instanceof Error ? error.message : "An unknown error occurred.",
        $session_id: sessionId,
      },
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
