import { NextRequest, NextResponse } from "next/server";
import { updateState } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { isOpen?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    // empty body == toggle current
  }

  const updated = updateState((s) => {
    if (typeof body.isOpen === "boolean") {
      s.isOpen = body.isOpen;
    } else {
      s.isOpen = !s.isOpen;
    }
  });

  return NextResponse.json(updated);
}
