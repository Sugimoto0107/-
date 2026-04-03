import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/google-calendar";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const durationMinutes = type === "individual" ? 30 : 40;

  try {
    const slots = await getAvailableSlots(durationMinutes);
    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Failed to fetch availability:", error);
    return NextResponse.json(
      { error: "カレンダーの空き状況を取得できませんでした" },
      { status: 500 }
    );
  }
}
