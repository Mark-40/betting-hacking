import { NextRequest, NextResponse } from "next/server";
import { setOpen, toggleOpen } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { isOpen?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    // empty body = flip current
  }

  const updated =
    typeof body.isOpen === "boolean"
      ? await setOpen(body.isOpen)
      : await toggleOpen();

  return NextResponse.json(updated);
}
