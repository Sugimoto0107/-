import type { Metadata, Viewport } from "next";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "ホキラオン杉本との日程調整",
  description: "商談・面談のご予約はこちらからお申し込みください",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
            <a href="/" className="flex items-center gap-3">
              <Image
                src="/hokiraon-mark.png"
                alt="ホキラオン株式会社"
                width={540}
                height={480}
                priority
                className="h-14 w-auto"
              />
              <span className="font-bold text-gray-900 text-lg">
                ホキラオン杉本との日程調整
              </span>
            </a>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-gray-200 mt-16">
          <div className="max-w-4xl mx-auto px-4 py-6" />
        </footer>
      </body>
    </html>
  );
}
