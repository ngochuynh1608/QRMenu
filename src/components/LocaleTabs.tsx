"use client";

import { useState } from "react";

type Props = {
  locales: { code: string; nativeName: string }[];
  children: (locale: string) => React.ReactNode;
};

export function LocaleTabs({ locales, children }: Props) {
  const [active, setActive] = useState(locales[0]?.code ?? "vi");

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {locales.map((locale) => (
          <button
            key={locale.code}
            type="button"
            onClick={() => setActive(locale.code)}
            className={`min-h-[44px] shrink-0 cursor-pointer rounded-full px-4 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              active === locale.code
                ? "bg-primary text-white"
                : "bg-white text-muted hover:bg-border"
            }`}
          >
            {locale.nativeName}
          </button>
        ))}
      </div>
      {locales.map((locale) => (
        <div key={locale.code} hidden={active !== locale.code}>
          {children(locale.code)}
        </div>
      ))}
    </div>
  );
}
