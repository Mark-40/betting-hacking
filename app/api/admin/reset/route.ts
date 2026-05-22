import { NextResponse } from "next/server";
import { resetVotes } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST() {
  const state = resetVotes();
  return NextResponse.json(state);
}
