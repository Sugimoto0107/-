"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { PREFECTURES } from "@/lib/prefectures";
import type {
  BookingType,
  CompanyFormData,
  IndividualFormData,
  TimeSlot,
} from "@/types";
import { resolveDuration } from "@/types";

type Step = "form" | "time" | "confirm" | "complete";

const STEP_LABELS = ["日程選択", "情報入力", "確認・予約"];

function StepIndicator({
  currentStep,
  isCompany,
}: {
  currentStep: Step;
  isCompany: boolean;
}) {
  const stepIndex =
    currentStep === "time" ? 0 : currentStep === "form" ? 1 : 2;
  const accentColor = isCompany ? "blue" : "violet";

  return (
    <div className="flex items-center justify-center mb-10">
      {STEP_LABELS.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                i < stepIndex
                  ? isCompany
                    ? "bg-blue-600 text-white"
                    : "bg-violet-600 text-white"
                  : i === stepIndex
                  ? isCompany
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-violet-600 text-white ring-4 ring-violet-100"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {i < stepIndex ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-xs mt-1.5 font-medium ${
                i === stepIndex ? "text-gray-700" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div
              className={`w-16 md:w-24 h-0.5 mb-5 mx-2 transition-all duration-300 ${
                i < stepIndex
                  ? isCompany
                    ? "bg-blue-600"
                    : "bg-violet-600"
                  : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function FieldGroup({
  label,
  required,
  children,
  error,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {!required && (
          <span className="text-gray-400 font-normal ml-1.5 text-xs">任意</span>
        )}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function inputClass(hasError?: boolean) {
  return `w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none focus:ring-2 ${
    hasError
      ? "border-red-400 focus:ring-red-100 focus:border-red-400"
      : "border-gray-300 focus:ring-blue-100 focus:border-blue-400"
  }`;
}

// --- Company Form ---
function CompanyForm({
  data,
  errors,
  onChange,
}: {
  data: CompanyFormData;
  errors: Partial<Record<keyof CompanyFormData, string>>;
  onChange: (key: keyof CompanyFormData, value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <FieldGroup label="社名" required error={errors.companyName}>
        <input
          type="text"
          value={data.companyName}
          onChange={(e) => onChange("companyName", e.target.value)}
          placeholder="株式会社サンプル"
          className={inputClass(!!errors.companyName)}
        />
      </FieldGroup>
      <FieldGroup label="担当者名" required error={errors.contactName}>
        <input
          type="text"
          value={data.contactName}
          onChange={(e) => onChange("contactName", e.target.value)}
          placeholder="山田 太郎"
          className={inputClass(!!errors.contactName)}
        />
      </FieldGroup>
      <FieldGroup label="メールアドレス" required error={errors.email}>
        <input
          type="email"
          value={data.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="example@company.co.jp"
          className={inputClass(!!errors.email)}
        />
      </FieldGroup>
      <FieldGroup label="電話番号（ハイフンなし）" required error={errors.phone}>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="0300000000"
          className={inputClass(!!errors.phone)}
        />
      </FieldGroup>
      <FieldGroup label="備考" error={errors.notes}>
        <textarea
          value={data.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          placeholder="ご相談の内容など、お気軽にご記入ください"
          rows={3}
          className={`${inputClass(!!errors.notes)} resize-none`}
        />
      </FieldGroup>
    </div>
  );
}

// --- Individual Form ---
function IndividualForm({
  data,
  errors,
  onChange,
}: {
  data: IndividualFormData;
  errors: Partial<Record<keyof IndividualFormData, string>>;
  onChange: (key: keyof IndividualFormData, value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <FieldGroup label="お名前" required error={errors.name}>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="山田 太郎"
          className={inputClass(!!errors.name)}
        />
      </FieldGroup>
      <FieldGroup label="年齢" required error={errors.age}>
        <input
          type="number"
          value={data.age}
          onChange={(e) => onChange("age", e.target.value)}
          placeholder="30"
          min="1"
          max="120"
          className={inputClass(!!errors.age)}
        />
      </FieldGroup>
      <FieldGroup label="居住地（都道府県）" required error={errors.prefecture}>
        <select
          value={data.prefecture}
          onChange={(e) => onChange("prefecture", e.target.value)}
          className={inputClass(!!errors.prefecture)}
        >
          <option value="">都道府県を選択</option>
          {PREFECTURES.map((pref) => (
            <option key={pref} value={pref}>
              {pref}
            </option>
          ))}
        </select>
      </FieldGroup>
      <FieldGroup label="メールアドレス" required error={errors.email}>
        <input
          type="email"
          value={data.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="example@email.com"
          className={inputClass(!!errors.email)}
        />
      </FieldGroup>
      <FieldGroup label="電話番号（ハイフンなし）" required error={errors.phone}>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="09000000000"
          className={inputClass(!!errors.phone)}
        />
      </FieldGroup>
      <FieldGroup label="備考" error={errors.notes}>
        <textarea
          value={data.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          placeholder="ご相談の内容など、お気軽にご記入ください"
          rows={3}
          className={`${inputClass(!!errors.notes)} resize-none`}
        />
      </FieldGroup>
    </div>
  );
}

// --- Time Slot Picker ---
function TimeSlotPicker({
  type,
  durationMinutes,
  selectedSlot,
  onSelect,
}: {
  type: BookingType;
  durationMinutes: number;
  selectedSlot: TimeSlot | null;
  onSelect: (slot: TimeSlot) => void;
}) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const isCompany = type === "company";
  const timeSlotRef = useRef<HTMLDivElement>(null);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/availability?type=${type}&duration=${durationMinutes}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSlots(data.slots);
      if (data.slots.length > 0) {
        setSelectedDate(data.slots[0].dateLabel);
      }
    } catch {
      setError("空き状況を取得できませんでした。再度お試しください。");
    } finally {
      setLoading(false);
    }
  }, [type, durationMinutes]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Group slots by date
  const slotsByDate: Record<string, TimeSlot[]> = {};
  for (const slot of slots) {
    if (!slotsByDate[slot.dateLabel]) {
      slotsByDate[slot.dateLabel] = [];
    }
    slotsByDate[slot.dateLabel].push(slot);
  }
  const dates = Object.keys(slotsByDate);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div
          className={`w-10 h-10 border-4 border-t-transparent rounded-full animate-spin ${
            isCompany ? "border-blue-500" : "border-violet-500"
          }`}
        />
        <p className="text-gray-500 text-sm">空き状況を確認中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchSlots}
          className="text-sm text-blue-600 underline"
        >
          再試行
        </button>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        現在ご予約可能な日程がありません。
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Date list */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          日付を選択
        </p>
        <div className="max-h-80 overflow-y-auto pr-1 space-y-1">
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => {
                setSelectedDate(date);
                setTimeout(() => {
                  timeSlotRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }, 50);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                selectedDate === date
                  ? isCompany
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-violet-600 text-white shadow-sm"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <span>{date}</span>
              <span
                className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  selectedDate === date
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {slotsByDate[date].length}枠
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Time slots */}
      <div ref={timeSlotRef}>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          時間を選択
        </p>
        {selectedDate ? (
          <div className="grid grid-cols-2 gap-2">
            {slotsByDate[selectedDate]?.map((slot) => {
              const isSelected = selectedSlot?.start === slot.start;
              return (
                <button
                  key={slot.start}
                  onClick={() => onSelect(slot)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                    isSelected
                      ? isCompany
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-violet-600 text-white border-violet-600 shadow-sm"
                      : isCompany
                      ? "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                      : "bg-white text-gray-700 border-gray-200 hover:border-violet-400 hover:text-violet-600"
                  }`}
                >
                  {slot.timeLabel}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">
            日付を選択してください
          </div>
        )}
      </div>
    </div>
  );
}

// --- Confirmation View ---
function ConfirmationView({
  type,
  formData,
  slot,
}: {
  type: BookingType;
  formData: CompanyFormData | IndividualFormData;
  slot: TimeSlot;
}) {
  const isCompany = type === "company";
  const rows: { label: string; value: string }[] = [];

  if (isCompany) {
    const d = formData as CompanyFormData;
    rows.push(
      { label: "社名", value: d.companyName },
      { label: "担当者名", value: d.contactName },
      { label: "メールアドレス", value: d.email },
      { label: "電話番号", value: d.phone }
    );
    if (d.notes) rows.push({ label: "備考", value: d.notes });
  } else {
    const d = formData as IndividualFormData;
    rows.push(
      { label: "お名前", value: d.name },
      { label: "年齢", value: `${d.age}歳` },
      { label: "居住地", value: d.prefecture },
      { label: "メールアドレス", value: d.email },
      { label: "電話番号", value: d.phone }
    );
    if (d.notes) rows.push({ label: "備考", value: d.notes });
  }

  return (
    <div className="space-y-6">
      <div
        className={`rounded-xl p-5 ${
          isCompany ? "bg-blue-50 border border-blue-100" : "bg-violet-50 border border-violet-100"
        }`}
      >
        <p
          className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
            isCompany ? "text-blue-600" : "text-violet-600"
          }`}
        >
          予約日時
        </p>
        <p className={`text-lg font-bold ${isCompany ? "text-blue-900" : "text-violet-900"}`}>
          {slot.label}
        </p>
        <p className={`text-sm mt-1 ${isCompany ? "text-blue-700" : "text-violet-700"}`}>
          {isCompany ? "商談（40分） · Google Meet" : "面談（30分） · 電話"}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-4 px-5 py-3.5 text-sm">
            <span className="text-gray-500 w-28 flex-shrink-0">{row.label}</span>
            <span className="text-gray-900 font-medium break-all">{row.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
        <p className="font-semibold mb-1.5">予約確定後について</p>
        <ul className="space-y-1 text-gray-500">
          <li>・ 登録されたメールアドレスに確認メールをお送りします</li>
          <li>・ メールにはGoogle MeetのリンクとGoogleカレンダーの招待が含まれます</li>
          {!isCompany && (
            <li>・ 面談開始時刻に 046−404−9187 よりお電話いたします</li>
          )}
        </ul>
      </div>
    </div>
  );
}

// --- Complete View ---
function CompleteView({
  type,
  meetLink,
  slot,
}: {
  type: BookingType;
  meetLink: string;
  slot: TimeSlot;
}) {
  const isCompany = type === "company";
  return (
    <div className="text-center py-4">
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
          isCompany ? "bg-blue-100" : "bg-violet-100"
        }`}
      >
        <svg
          className={`w-10 h-10 ${isCompany ? "text-blue-600" : "text-violet-600"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        ご予約が完了しました
      </h2>
      <p className="text-gray-500 mb-8 text-sm">
        確認メールをご登録のメールアドレスにお送りしました
      </p>

      <div
        className={`rounded-xl p-5 mb-6 text-left ${
          isCompany ? "bg-blue-50 border border-blue-100" : "bg-violet-50 border border-violet-100"
        }`}
      >
        <p
          className={`text-xs font-semibold uppercase tracking-wide mb-1.5 ${
            isCompany ? "text-blue-600" : "text-violet-600"
          }`}
        >
          予約日時
        </p>
        <p className={`text-base font-bold ${isCompany ? "text-blue-900" : "text-violet-900"}`}>
          {slot.label}
        </p>
      </div>

      {!isCompany && (
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 mb-6 text-left">
          <p className="text-violet-800 font-semibold text-sm">
            📞 046−404−9187 からお電話します
          </p>
          <p className="text-violet-600 text-xs mt-1">
            面談開始時刻になりましたら、上記の番号よりご連絡いたします
          </p>
        </div>
      )}

    </div>
  );
}

// --- Main Booking Page ---
function BookingPageContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const type: BookingType =
    typeParam === "individual" ? "individual" : "company";
  const isCompany = type === "company";
  const durationMinutes = resolveDuration(type, searchParams.get("duration"));

  const [step, setStep] = useState<Step>("time");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [meetLink, setMeetLink] = useState("");

  const [companyData, setCompanyData] = useState<CompanyFormData>({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [individualData, setIndividualData] = useState<IndividualFormData>({
    name: "",
    age: "",
    prefecture: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [companyErrors, setCompanyErrors] = useState<
    Partial<Record<keyof CompanyFormData, string>>
  >({});
  const [individualErrors, setIndividualErrors] = useState<
    Partial<Record<keyof IndividualFormData, string>>
  >({});
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateCompanyForm(): boolean {
    const errors: Partial<Record<keyof CompanyFormData, string>> = {};
    if (!companyData.companyName.trim()) errors.companyName = "社名を入力してください";
    if (!companyData.contactName.trim()) errors.contactName = "担当者名を入力してください";
    if (!companyData.email.trim()) {
      errors.email = "メールアドレスを入力してください";
    } else if (!validateEmail(companyData.email)) {
      errors.email = "正しいメールアドレスを入力してください";
    }
    if (!companyData.phone.trim()) errors.phone = "電話番号を入力してください";
    setCompanyErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateIndividualForm(): boolean {
    const errors: Partial<Record<keyof IndividualFormData, string>> = {};
    if (!individualData.name.trim()) errors.name = "お名前を入力してください";
    if (!individualData.age.trim()) {
      errors.age = "年齢を入力してください";
    } else if (isNaN(Number(individualData.age)) || Number(individualData.age) < 1) {
      errors.age = "正しい年齢を入力してください";
    }
    if (!individualData.prefecture) errors.prefecture = "都道府県を選択してください";
    if (!individualData.email.trim()) {
      errors.email = "メールアドレスを入力してください";
    } else if (!validateEmail(individualData.email)) {
      errors.email = "正しいメールアドレスを入力してください";
    }
    if (!individualData.phone.trim()) errors.phone = "電話番号を入力してください";
    setIndividualErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleTimeNext() {
    if (!selectedSlot) {
      setSlotError("日程を選択してください");
      return;
    }
    setSlotError(null);
    setStep("form");
  }

  function handleFormNext() {
    const valid = isCompany ? validateCompanyForm() : validateIndividualForm();
    if (valid) setStep("confirm");
  }

  async function handleSubmit() {
    if (!selectedSlot) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          formData: isCompany ? companyData : individualData,
          slot: selectedSlot,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "エラーが発生しました");
      setMeetLink(data.meetLink || "");
      setStep("complete");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "予約処理中にエラーが発生しました"
      );
    } finally {
      setSubmitting(false);
    }
  }

  const accentBg = isCompany ? "bg-blue-600 hover:bg-blue-700" : "bg-violet-600 hover:bg-violet-700";
  const accentText = isCompany ? "text-blue-600" : "text-violet-600";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
              isCompany
                ? "bg-blue-100 text-blue-700"
                : "bg-violet-100 text-violet-700"
            }`}
          >
            {isCompany ? "企業の方" : "個人の方"}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isCompany ? "商談のご予約" : "面談のご予約"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {isCompany
            ? `${durationMinutes}分間のオンライン商談`
            : `${durationMinutes}分間の面談（電話）`}
        </p>
      </div>

      {step !== "complete" && (
        <StepIndicator
          currentStep={step}
          isCompany={isCompany}
        />
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
        {step === "form" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              お客様情報の入力
            </h2>
            {isCompany ? (
              <CompanyForm
                data={companyData}
                errors={companyErrors}
                onChange={(key, val) =>
                  setCompanyData((prev) => ({ ...prev, [key]: val }))
                }
              />
            ) : (
              <IndividualForm
                data={individualData}
                errors={individualErrors}
                onChange={(key, val) =>
                  setIndividualData((prev) => ({ ...prev, [key]: val }))
                }
              />
            )}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep("time")}
                className="px-6 py-3 rounded-xl text-gray-600 font-semibold text-sm border border-gray-300 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                前へ
              </button>
              <button
                onClick={handleFormNext}
                className={`px-8 py-3 rounded-xl text-white font-semibold text-sm flex items-center gap-2 ${accentBg}`}
              >
                次へ
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {step === "time" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              ご希望の日時を選択
            </h2>
            <TimeSlotPicker
              type={type}
              durationMinutes={durationMinutes}
              selectedSlot={selectedSlot}
              onSelect={(slot) => {
                setSelectedSlot(slot);
                setSlotError(null);
              }}
            />
            {slotError && (
              <p className="text-red-500 text-sm mt-3">{slotError}</p>
            )}
            <div className="flex justify-end mt-8">
              <button
                onClick={handleTimeNext}
                className={`px-8 py-3 rounded-xl text-white font-semibold text-sm flex items-center gap-2 ${accentBg}`}
              >
                次へ
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {step === "confirm" && selectedSlot && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              予約内容の確認
            </h2>
            <ConfirmationView
              type={type}
              formData={isCompany ? companyData : individualData}
              slot={selectedSlot}
            />
            {submitError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {submitError}
              </div>
            )}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep("form")}
                disabled={submitting}
                className="px-6 py-3 rounded-xl text-gray-600 font-semibold text-sm border border-gray-300 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                前へ
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`px-8 py-3 rounded-xl text-white font-semibold text-sm flex items-center gap-2 ${accentBg} disabled:opacity-60`}
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    処理中...
                  </>
                ) : (
                  <>
                    予約を確定する
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === "complete" && selectedSlot && (
          <CompleteView type={type} meetLink={meetLink} slot={selectedSlot} />
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}
