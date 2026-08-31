import { google } from "googleapis";
import {
  addDays,
  startOfDay,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  addMinutes,
  isWeekend,
  isBefore,
  isAfter,
  parseISO,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import * as HolidayJp from "@holiday-jp/holiday_jp";
import type { TimeSlot } from "@/types";

const TIMEZONE = "Asia/Tokyo";

function getOAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  return oauth2Client;
}

export function getCalendarClient() {
  return google.calendar({ version: "v3", auth: getOAuthClient() });
}

function formatJapaneseDate(date: Date): string {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const zonedDate = toZonedTime(date, TIMEZONE);
  const year = zonedDate.getFullYear();
  const month = zonedDate.getMonth() + 1;
  const day = zonedDate.getDate();
  const dayOfWeek = days[zonedDate.getDay()];
  return `${year}年${month}月${day}日（${dayOfWeek}）`;
}

function formatJapaneseTime(date: Date): string {
  const zonedDate = toZonedTime(date, TIMEZONE);
  const h = zonedDate.getHours().toString().padStart(2, "0");
  const m = zonedDate.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function isHoliday(date: Date): boolean {
  // Use JST date for holiday check
  const jst = toZonedTime(date, TIMEZONE);
  return HolidayJp.isHoliday(jst);
}

function makeJstTime(base: Date, hour: number, minute: number): Date {
  const zoned = toZonedTime(base, TIMEZONE);
  return fromZonedTime(
    setMilliseconds(setSeconds(setMinutes(setHours(zoned, hour), minute), 0), 0),
    TIMEZONE
  );
}

// 予約枠の開始時刻は 00分 / 30分 のみに揃える（10分スタートなどを出さない）
const SLOT_INTERVAL_MINUTES = 30;

// 指定した時刻を 00分 / 30分 のグリッドに切り上げる
function ceilToSlotGrid(hour: number, minute: number): { hour: number; minute: number } {
  const total = hour * 60 + minute;
  const ceiled = Math.ceil(total / SLOT_INTERVAL_MINUTES) * SLOT_INTERVAL_MINUTES;
  return { hour: Math.floor(ceiled / 60), minute: ceiled % 60 };
}

// 1日分の枠を生成する。開始時刻は SLOT_INTERVAL_MINUTES 刻み、
// 所要時間ぶん確保できない枠（終了が受付終了を超えるもの）は作らない。
function generateDaySlots(
  day: Date,
  openHour: number,
  openMinute: number,
  closeHour: number,
  closeMinute: number,
  durationMinutes: number
): { start: Date; end: Date }[] {
  const slots: { start: Date; end: Date }[] = [];
  const open = ceilToSlotGrid(openHour, openMinute);
  let slotStart = makeJstTime(day, open.hour, open.minute);
  const dayEnd = makeJstTime(day, closeHour, closeMinute);

  while (isBefore(slotStart, dayEnd)) {
    const slotEnd = addMinutes(slotStart, durationMinutes);
    if (isAfter(slotEnd, dayEnd)) break;
    slots.push({ start: slotStart, end: slotEnd });
    slotStart = addMinutes(slotStart, SLOT_INTERVAL_MINUTES);
  }

  return slots;
}

function generateSlots(durationMinutes: number): { start: Date; end: Date }[] {
  const slots: { start: Date; end: Date }[] = [];
  const now = new Date();
  const startDate = addDays(startOfDay(now), 1); // Start from tomorrow
  const endDate = addDays(startDate, 21); // Look 3 weeks ahead

  let current = startDate;
  while (isBefore(current, endDate)) {
    const weekend = isWeekend(current);
    const holiday = isHoliday(current);

    if (weekend || holiday) {
      // Weekends & holidays: 21:30 - 23:00 JST
      slots.push(...generateDaySlots(current, 21, 30, 23, 0, durationMinutes));
    } else {
      // Weekdays: 9:30 - 23:00 JST
      slots.push(...generateDaySlots(current, 9, 30, 23, 0, durationMinutes));
    }

    current = addDays(current, 1);
  }

  return slots;
}

export async function getAvailableSlots(
  durationMinutes: number
): Promise<TimeSlot[]> {
  const calendar = getCalendarClient();
  const now = new Date();
  const timeMax = addDays(now, 22);

  // Get busy times from Google Calendar
  const freebusyResponse = await calendar.freebusy.query({
    requestBody: {
      timeMin: now.toISOString(),
      timeMax: timeMax.toISOString(),
      timeZone: TIMEZONE,
      items: [{ id: process.env.GOOGLE_CALENDAR_ID || "primary" }],
    },
  });

  const busyTimes =
    freebusyResponse.data.calendars?.[
      process.env.GOOGLE_CALENDAR_ID || "primary"
    ]?.busy || [];

  const allSlots = generateSlots(durationMinutes);

  // Filter out slots that overlap with busy times
  const availableSlots = allSlots.filter((slot) => {
    return !busyTimes.some((busy) => {
      if (!busy.start || !busy.end) return false;
      const busyStart = parseISO(busy.start);
      const busyEnd = parseISO(busy.end);
      // Overlap check: slot starts before busy ends AND slot ends after busy starts
      return isBefore(slot.start, busyEnd) && isAfter(slot.end, busyStart);
    });
  });

  // Format slots for response
  return availableSlots.map((slot) => {
    const dateLabel = formatJapaneseDate(slot.start);
    const startTime = formatJapaneseTime(slot.start);
    const endTime = formatJapaneseTime(slot.end);
    const timeLabel = `${startTime}〜${endTime}`;
    return {
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
      label: `${dateLabel} ${timeLabel}`,
      dateLabel,
      timeLabel,
    };
  });
}

export async function createCalendarEvent(params: {
  title: string;
  start: string;
  end: string;
  attendeeEmail: string;
  attendeeName: string;
  description?: string;
}): Promise<{ eventId: string; meetLink: string }> {
  const calendar = getCalendarClient();

  const event = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
    conferenceDataVersion: 1,
    sendUpdates: "all",
    requestBody: {
      summary: params.title,
      description: params.description,
      start: { dateTime: params.start, timeZone: TIMEZONE },
      end: { dateTime: params.end, timeZone: TIMEZONE },
      attendees: [{ email: params.attendeeEmail, displayName: params.attendeeName }],
      conferenceData: {
        createRequest: {
          requestId: `booking-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });

  const meetLink =
    event.data.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === "video"
    )?.uri || "";

  return {
    eventId: event.data.id || "",
    meetLink,
  };
}
