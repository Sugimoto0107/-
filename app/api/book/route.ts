import { NextRequest, NextResponse } from "next/server";
import { createCalendarEvent } from "@/lib/google-calendar";
import { sendConfirmationEmail } from "@/lib/email";
import type { BookingRequest, CompanyFormData, IndividualFormData } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json();
    const { type, formData, slot } = body;

    // Determine attendee details based on type
    let attendeeEmail: string;
    let attendeeName: string;
    let eventTitle: string;
    let eventDescription: string;

    if (type === "company") {
      const data = formData as CompanyFormData;
      attendeeEmail = data.email;
      attendeeName = `${data.contactName}（${data.companyName}）`;
      eventTitle = "商談";
      eventDescription = [
        `会社名: ${data.companyName}`,
        `担当者: ${data.contactName}`,
        `電話: ${data.phone}`,
        `メール: ${data.email}`,
        data.notes ? `備考: ${data.notes}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    } else {
      const data = formData as IndividualFormData;
      attendeeEmail = data.email;
      attendeeName = data.name;
      eventTitle = "面談";
      eventDescription = [
        `氏名: ${data.name}`,
        `年齢: ${data.age}歳`,
        `居住地: ${data.prefecture}`,
        `電話: ${data.phone}`,
        `メール: ${data.email}`,
        data.notes ? `備考: ${data.notes}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    }

    // Create Google Calendar event with Meet link
    const { eventId, meetLink } = await createCalendarEvent({
      title: eventTitle,
      start: slot.start,
      end: slot.end,
      attendeeEmail,
      attendeeName,
      description: eventDescription,
    });

    // Send confirmation email
    await sendConfirmationEmail({
      type,
      formData,
      slot,
      meetLink,
    });

    return NextResponse.json({ success: true, eventId, meetLink });
  } catch (error) {
    console.error("Booking failed:", error);
    return NextResponse.json(
      { success: false, error: "予約処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
