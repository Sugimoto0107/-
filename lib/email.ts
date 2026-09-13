import nodemailer from "nodemailer";
import type { BookingType, CompanyFormData, IndividualFormData } from "@/types";
import { isRecrootsInterview } from "@/types";

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Intl.DateTimeFormat("ja-JP", options).format(date);
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function buildCompanyEmailHtml(params: {
  formData: CompanyFormData;
  slot: { start: string; end: string };
  meetLink: string;
}): string {
  const { formData, slot, meetLink } = params;
  const dateTimeStr = formatDateTime(slot.start);
  const endTimeStr = formatTime(slot.end);
  // RECROOTSの取材枠は「商談」と呼ばない
  const label = isRecrootsInterview("company", slot) ? "取材" : "商談";

  return `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; background:#f9fafb; margin:0; padding:24px;">
  <div style="max-width:560px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#2563eb; padding:32px 40px;">
      <h1 style="color:#fff; margin:0; font-size:22px; font-weight:700;">${label}のご予約が確定しました</h1>
    </div>
    <div style="padding:32px 40px;">
      <p style="color:#374151; font-size:15px; line-height:1.7;">
        ${formData.contactName} 様<br><br>
        この度はご予約いただきありがとうございます。<br>
        以下の日程で${label}のご予約が確定しました。
      </p>

      <div style="background:#f3f4f6; border-radius:8px; padding:20px 24px; margin:24px 0;">
        <table style="width:100%; border-collapse:collapse; font-size:14px; color:#374151;">
          <tr>
            <td style="padding:8px 0; font-weight:600; width:120px;">日時</td>
            <td style="padding:8px 0;">${dateTimeStr}〜${endTimeStr}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; font-weight:600;">形式</td>
            <td style="padding:8px 0;">オンライン (Google Meet)</td>
          </tr>
          <tr>
            <td style="padding:8px 0; font-weight:600;">会社名</td>
            <td style="padding:8px 0;">${formData.companyName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; font-weight:600;">担当者</td>
            <td style="padding:8px 0;">${formData.contactName} 様</td>
          </tr>
          ${formData.notes ? `
          <tr>
            <td style="padding:8px 0; font-weight:600; vertical-align:top;">備考</td>
            <td style="padding:8px 0;">${formData.notes}</td>
          </tr>` : ""}
        </table>
      </div>

      <div style="text-align:center; margin:32px 0 24px;">
        <a href="${meetLink}" style="display:inline-block; background:#2563eb; color:#fff; text-decoration:none; padding:14px 36px; border-radius:8px; font-size:15px; font-weight:600;">
          Google Meet に参加する
        </a>
        <p style="color:#6b7280; font-size:12px; margin:12px 0 0;">${meetLink}</p>
      </div>

      <p style="color:#6b7280; font-size:13px; line-height:1.7; border-top:1px solid #e5e7eb; padding-top:20px; margin-top:8px;">
        ご不明な点がございましたら、お気軽にご連絡ください。<br>
        当日はどうぞよろしくお願いいたします。
      </p>
    </div>
  </div>
</body>
</html>`;
}

function buildIndividualEmailHtml(params: {
  formData: IndividualFormData;
  slot: { start: string; end: string };
  meetLink: string;
}): string {
  const { formData, slot, meetLink } = params;
  const dateTimeStr = formatDateTime(slot.start);
  const endTimeStr = formatTime(slot.end);

  return `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; background:#f9fafb; margin:0; padding:24px;">
  <div style="max-width:560px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#7c3aed; padding:32px 40px;">
      <h1 style="color:#fff; margin:0; font-size:22px; font-weight:700;">面談のご予約が確定しました</h1>
    </div>
    <div style="padding:32px 40px;">
      <p style="color:#374151; font-size:15px; line-height:1.7;">
        ${formData.name} 様<br><br>
        この度はご予約いただきありがとうございます。<br>
        以下の日程で面談のご予約が確定しました。
      </p>

      <div style="background:#f3f4f6; border-radius:8px; padding:20px 24px; margin:24px 0;">
        <table style="width:100%; border-collapse:collapse; font-size:14px; color:#374151;">
          <tr>
            <td style="padding:8px 0; font-weight:600; width:120px;">日時</td>
            <td style="padding:8px 0;">${dateTimeStr}〜${endTimeStr}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; font-weight:600;">形式</td>
            <td style="padding:8px 0;">オンライン (Google Meet) ＋ お電話</td>
          </tr>
          <tr>
            <td style="padding:8px 0; font-weight:600;">お名前</td>
            <td style="padding:8px 0;">${formData.name} 様</td>
          </tr>
          <tr>
            <td style="padding:8px 0; font-weight:600;">居住地</td>
            <td style="padding:8px 0;">${formData.prefecture}</td>
          </tr>
          ${formData.notes ? `
          <tr>
            <td style="padding:8px 0; font-weight:600; vertical-align:top;">備考</td>
            <td style="padding:8px 0;">${formData.notes}</td>
          </tr>` : ""}
        </table>
      </div>

      <div style="background:#ede9fe; border-radius:8px; padding:16px 20px; margin:0 0 24px;">
        <p style="color:#5b21b6; font-size:14px; margin:0; font-weight:600;">
          📞 046−404−9187 からお電話します
        </p>
        <p style="color:#6d28d9; font-size:13px; margin:8px 0 0;">
          面談開始時刻になりましたら、上記の番号よりご連絡いたします。
        </p>
      </div>

      <div style="text-align:center; margin:0 0 24px;">
        <a href="${meetLink}" style="display:inline-block; background:#7c3aed; color:#fff; text-decoration:none; padding:14px 36px; border-radius:8px; font-size:15px; font-weight:600;">
          Google Meet に参加する
        </a>
        <p style="color:#6b7280; font-size:12px; margin:12px 0 0;">${meetLink}</p>
      </div>

      <p style="color:#6b7280; font-size:13px; line-height:1.7; border-top:1px solid #e5e7eb; padding-top:20px; margin-top:8px;">
        ご不明な点がございましたら、お気軽にご連絡ください。<br>
        当日はどうぞよろしくお願いいたします。
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendAdminNotificationEmail(params: {
  type: BookingType;
  formData: CompanyFormData | IndividualFormData;
  slot: { start: string; end: string };
  meetLink: string;
  eventTitle: string;
}): Promise<void> {
  const { type, formData, slot, meetLink, eventTitle } = params;
  const transporter = getTransporter();
  const fromName = process.env.GMAIL_FROM_NAME || "スケジュール調整";
  const adminEmail = "m.sugimoto@hokiraon.jp";

  const dateTimeStr = formatDateTime(slot.start);
  const endTimeStr = formatTime(slot.end);

  let details = "";
  if (type === "company") {
    const d = formData as CompanyFormData;
    details = `会社名: ${d.companyName}\n担当者: ${d.contactName}\n電話: ${d.phone}\nメール: ${d.email}${d.notes ? `\n備考: ${d.notes}` : ""}`;
  } else {
    const d = formData as IndividualFormData;
    details = `氏名: ${d.name}\n年齢: ${d.age}歳\n居住地: ${d.prefecture}\n電話: ${d.phone}\nメール: ${d.email}${d.notes ? `\n備考: ${d.notes}` : ""}`;
  }

  await transporter.sendMail({
    from: `"${fromName}" <${adminEmail}>`,
    to: adminEmail,
    subject: `【新規予約】${eventTitle}`,
    text: `新しい予約が入りました。\n\n【予約内容】\n${eventTitle}\n日時: ${dateTimeStr}〜${endTimeStr}\n\n【お客様情報】\n${details}\n\nGoogle Meet: ${meetLink}`,
  });
}

export async function sendConfirmationEmail(params: {
  type: BookingType;
  formData: CompanyFormData | IndividualFormData;
  slot: { start: string; end: string };
  meetLink: string;
}): Promise<void> {
  const { type, formData, slot, meetLink } = params;

  const transporter = getTransporter();
  const fromName = process.env.GMAIL_FROM_NAME || "スケジュール調整";
  const fromEmail = process.env.GMAIL_USER;

  let toEmail: string;
  let subject: string;
  let html: string;

  if (type === "company") {
    const data = formData as CompanyFormData;
    toEmail = data.email;
    subject = `【日程確定】${isRecrootsInterview(type, slot) ? "取材" : "商談"}のご予約が完了しました`;
    html = buildCompanyEmailHtml({ formData: data, slot, meetLink });
  } else {
    const data = formData as IndividualFormData;
    toEmail = data.email;
    subject = `【日程確定】面談のご予約が完了しました`;
    html = buildIndividualEmailHtml({ formData: data, slot, meetLink });
  }

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: toEmail,
    subject,
    html,
  });
}
