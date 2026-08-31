export type BookingType = "company" | "individual";

// 商談は40分/30分から選べる。面談は30分固定。
export const COMPANY_DURATIONS = [40, 30] as const;
export const DEFAULT_COMPANY_DURATION = 40;
export const INDIVIDUAL_DURATION = 30;

// クエリパラメータの値を、種別ごとに許可された所要時間へ丸める
export function resolveDuration(
  type: BookingType,
  raw: string | number | null | undefined
): number {
  if (type === "individual") return INDIVIDUAL_DURATION;
  const value = Number(raw);
  return (COMPANY_DURATIONS as readonly number[]).includes(value)
    ? value
    : DEFAULT_COMPANY_DURATION;
}

export interface CompanyFormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  notes: string;
}

export interface IndividualFormData {
  name: string;
  age: string;
  prefecture: string;
  email: string;
  phone: string;
  notes: string;
}

export type FormData = CompanyFormData | IndividualFormData;

export interface TimeSlot {
  start: string; // ISO string
  end: string; // ISO string
  label: string; // "2024年4月15日（月）10:00〜10:40"
  dateLabel: string; // "2024年4月15日（月）"
  timeLabel: string; // "10:00〜10:40"
}

export interface AvailabilityResponse {
  slots: TimeSlot[];
}

export interface BookingRequest {
  type: BookingType;
  formData: CompanyFormData | IndividualFormData;
  slot: TimeSlot;
}

export interface BookingResponse {
  success: boolean;
  eventId?: string;
  meetLink?: string;
  error?: string;
}
