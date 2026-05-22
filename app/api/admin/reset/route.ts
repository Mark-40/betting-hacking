import { NextResponse } from "next/server";
import { resetAll } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST() {
  const state = await resetAll();
  return NextResponse.json(state);
}
