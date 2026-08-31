import Link from "next/link";

const ICONS = {
  building:
    "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  person: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  video:
    "M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
  phone:
    "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  arrow: "M9 5l7 7-7 7",
} as const;

type Card = {
  href: string;
  accent: "blue" | "violet";
  icon: keyof typeof ICONS;
  badge: string;
  title: string;
  description: string;
  duration: string;
  method: string;
  methodIcon: keyof typeof ICONS;
  wide?: boolean;
};

const CARDS: Card[] = [
  {
    href: "/book?type=company&duration=40",
    accent: "blue",
    icon: "building",
    badge: "企業の方",
    title: "商談（40分）",
    description: "ビジネスに関するご相談・商談のお申し込みはこちら",
    duration: "40分",
    method: "Google Meet",
    methodIcon: "video",
  },
  {
    href: "/book?type=company&duration=30",
    accent: "blue",
    icon: "building",
    badge: "企業の方",
    title: "商談（30分）",
    description: "ビジネスに関するご相談・商談のお申し込みはこちら",
    duration: "30分",
    method: "Google Meet",
    methodIcon: "video",
  },
  {
    href: "/book?type=individual",
    accent: "violet",
    icon: "person",
    badge: "個人の方",
    title: "面談（30分）",
    description: "転職のご相談・面談のお申し込みはこちら",
    duration: "30分",
    method: "電話",
    methodIcon: "phone",
    wide: true,
  },
];

const ACCENT = {
  blue: {
    border: "hover:border-blue-500",
    iconBg: "bg-blue-100 group-hover:bg-blue-600",
    icon: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
    link: "text-blue-600",
  },
  violet: {
    border: "hover:border-violet-500",
    iconBg: "bg-violet-100 group-hover:bg-violet-600",
    icon: "text-violet-600",
    badge: "bg-violet-100 text-violet-700",
    link: "text-violet-600",
  },
} as const;

function Icon({ path, className }: { path: string; className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-4 md:mb-10">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
          ご予約の種別を選択してください
        </h1>
        <p className="text-gray-500 text-xs md:text-base">
          ご利用目的に合わせてお選びください
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        {CARDS.map((card) => {
          const a = ACCENT[card.accent];
          return (
            <Link
              key={card.href}
              href={card.href}
              className={`group block ${card.wide ? "col-span-2 md:col-span-1" : ""}`}
            >
              <div
                className={`bg-white rounded-2xl border-2 border-gray-200 p-4 md:p-8 h-full transition-all duration-200 hover:shadow-lg group-hover:-translate-y-1 ${a.border}`}
              >
                <div
                  className={`w-10 h-10 md:w-14 md:h-14 rounded-xl flex items-center justify-center mb-3 md:mb-6 transition-colors duration-200 ${a.iconBg}`}
                >
                  <Icon
                    path={ICONS[card.icon]}
                    className={`w-6 h-6 transition-colors duration-200 group-hover:text-white ${a.icon}`}
                  />
                </div>
                <div className="mb-2 md:mb-4">
                  <span
                    className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1.5 md:mb-3 ${a.badge}`}
                  >
                    {card.badge}
                  </span>
                  <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
                    {card.title}
                  </h2>
                  <p className="text-gray-500 text-xs md:text-sm leading-relaxed hidden md:block">
                    {card.description}
                  </p>
                </div>
                <div className="flex flex-col gap-1 md:flex-row md:gap-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Icon path={ICONS.clock} className="w-3.5 h-3.5 shrink-0" />
                    {card.duration}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Icon path={ICONS[card.methodIcon]} className="w-3.5 h-3.5 shrink-0" />
                    {card.method}
                  </div>
                </div>
                <div
                  className={`mt-3 md:mt-6 flex items-center font-semibold text-xs md:text-sm gap-1 transition-all duration-200 ${a.link}`}
                >
                  予約する
                  <Icon
                    path={ICONS.arrow}
                    className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform duration-200 group-hover:translate-x-1"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
