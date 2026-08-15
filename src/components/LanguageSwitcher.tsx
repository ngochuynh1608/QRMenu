import Link from "next/link";

type Language = { code: string; nativeName: string };

type Props = {
  languages: Language[];
  locale: string;
  makeHref: (code: string) => string;
};

export function LanguageSwitcher({ languages, locale, makeHref }: Props) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Language">
      {languages.map((language) => {
        const active = locale === language.code;
        return (
          <Link
            key={language.code}
            href={makeHref(language.code)}
            className={`flex min-h-14 min-w-14 cursor-pointer items-center justify-center rounded-2xl px-4 text-base font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              active
                ? "bg-primary text-white"
                : "bg-white text-muted ring-1 ring-border hover:bg-border"
            }`}
          >
            {language.nativeName}
          </Link>
        );
      })}
    </nav>
  );
}
