import { NextResponse } from "next/server";
import { getState } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const state = await getState();
  return NextResponse.json(state, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
