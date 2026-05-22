import { NextRequest, NextResponse } from "next/server";
import { getState, incrementVote } from "@/lib/storage";
import { CATEGORY_IDS, TEAM_IDS } from "@/lib/teams";
import type { CategoryId } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { categoryId?: string; teamId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { categoryId, teamId } = body ?? {};

  if (!categoryId || !teamId) {
    return NextResponse.json(
      { error: "categoryId and teamId are required" },
      { status: 400 }
    );
  }

  if (!CATEGORY_IDS.includes(categoryId as CategoryId)) {
    return NextResponse.json({ error: "Unknown categoryId" }, { status: 400 });
  }

  if (!TEAM_IDS.includes(teamId)) {
    return NextResponse.json({ error: "Unknown teamId" }, { status: 400 });
  }

  const current = await getState();
  if (!current.isOpen) {
    return NextResponse.json(
      { error: "Voting is currently closed." },
      { status: 403 }
    );
  }

  const updated = await incrementVote(categoryId as CategoryId, teamId);
  return NextResponse.json(updated);
}
