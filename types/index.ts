export type BookingType = "company" | "individual";

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
