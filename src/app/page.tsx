import Link from "next/link";
import {
  getActiveAdSlides,
  getEnabledLanguages,
  getPublicRestaurants,
  getSiteSettings,
  resolveLocale,
} from "@/lib/data";
import { getUiMessages } from "@/lib/i18n";
import { getBaseUrl, pickTranslation } from "@/lib/utils";
import { KioskRestaurantCard } from "@/components/KioskRestaurantCard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { KioskIdleAds } from "@/components/KioskIdleAds";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const [restaurants, languages, settings, slides] = await Promise.all([
    getPublicRestaurants(),
    getEnabledLanguages(),
    getSiteSettings(),
    getActiveAdSlides(),
  ]);
  const locale = resolveLocale(
    lang,
    languages[0]?.code || "vi",
    languages.map((item) => item.code),
  );
  const ui = getUiMessages(locale);
  const baseUrl = await getBaseUrl();

  return (
    <KioskIdleAds
      enabled={settings.adsEnabled}
      idleSeconds={settings.adsIdleSeconds}
      slideSeconds={settings.adsSlideSeconds}
      slides={slides.map((slide) => ({ id: slide.id, imageUrl: slide.imageUrl }))}
    >
      <main className="mx-auto min-h-dvh max-w-6xl px-4 py-6 pb-[env(safe-area-inset-bottom)] sm:px-8 sm:py-8">
          <header className="mb-8 flex flex-col gap-5">
            <div className="flex flex-col items-start gap-3">
              {settings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.logoUrl}
                  alt={settings.siteName}
                  className="h-12 w-auto max-w-[min(100%,320px)] object-contain sm:h-14"
                />
              ) : (
                <p className="text-sm font-semibold tracking-wide text-cta uppercase">
                  {settings.siteName}
                </p>
              )}
              <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <h1 className="font-heading text-3xl text-text sm:text-5xl">{ui.restaurants}</h1>
                <LanguageSwitcher
                  languages={languages.map((item) => ({
                    code: item.code,
                    nativeName: item.nativeName,
                  }))}
                  locale={locale}
                  makeHref={(code) => `/?lang=${code}`}
                />
              </div>
            </div>
          </header>

          <p className="mb-6 text-lg text-muted sm:text-xl">{ui.tapOrScan}</p>

          {restaurants.length === 0 ? (
            <p className="rounded-2xl bg-surface p-8 text-center text-muted">
              Chưa có nhà hàng. Vào admin để thêm.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {restaurants.map((restaurant) => {
                const translation = pickTranslation(
                  restaurant.translations,
                  locale,
                  restaurant.defaultLang,
                );
                const menuPath = `/r/${restaurant.slug}?lang=${locale}`;
                return (
                  <KioskRestaurantCard
                    key={restaurant.id}
                    slug={restaurant.slug}
                    name={translation?.name || restaurant.slug}
                    description={translation?.description}
                    avatarUrl={restaurant.logoUrl || restaurant.coverUrl}
                    menuUrl={`${baseUrl}${menuPath}`}
                    menuHref={menuPath}
                    viewMenuLabel={ui.viewMenu}
                    qrKey={settings.qrRevision}
                  />
                );
              })}
            </div>
          )}

          <p className="mt-10 text-center">
            <Link
              href="/admin"
              className="inline-flex min-h-11 cursor-pointer items-center text-sm text-muted/70 transition-colors duration-200 hover:text-primary"
            >
              {ui.admin}
            </Link>
          </p>
        </main>
    </KioskIdleAds>
  );
}
