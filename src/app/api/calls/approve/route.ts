import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const approveCallSchema = z.object({
  prospectId: z.string().min(1),
  approvedBy: z.string().min(1).default("demo-operator"),
  simulation: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  const limited = checkRateLimit("approve-call");
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Rate limit exceeded." },
      { status: 429 },
    );
  }

  const body = await request.json();
  const parsed = approveCallSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    approved: true,
    prospectId: parsed.data.prospectId,
    audit: {
      approvedBy: parsed.data.approvedBy,
      simulation: parsed.data.simulation,
      message:
        "Approval recorded. Live outbound calling must still be initiated through the configured provider adapter.",
    },
  });
}
