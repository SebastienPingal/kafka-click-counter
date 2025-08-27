import { NextRequest, NextResponse } from "next/server";
import { sendClickEvent } from "@/lib/producer/clicks";

export async function POST(request: NextRequest) {
  const { event } = await request.json();
  console.log('🕖 event', event);
  await sendClickEvent(event);

  return NextResponse.json({ message: "Click received" })
} 