import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdmin();
  return NextResponse.json({ authenticated: Boolean(session), user: session?.u ?? null });
}
