import { NextRequest, NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/google-drive";

export async function POST(request: NextRequest) {
  const { eventId } = await request.json();

  if (!eventId) {
    return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "Google OAuth not configured" },
      { status: 500 }
    );
  }

  const url = getAuthUrl(eventId);
  return NextResponse.json({ url });
}
