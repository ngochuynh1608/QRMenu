import { notFound } from "next/navigation";
import { MenuView } from "@/components/MenuView";
import {
  brandStyleVars,
  getEnabledLanguages,
  getRestaurantMenu,
  getSiteSettings,
  resolveLocale,
} from "@/lib/data";
import { getUiMessages } from "@/lib/i18n";
import { pickTranslation } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const [restaurant, settings] = await Promise.all([
    getRestaurantMenu(slug),
    getSiteSettings(),
  ]);
  if (!restaurant) return { title: settings.siteName };
  const locale = lang || restaurant.defaultLang;
  const name = pickTranslation(restaurant.translations, locale, restaurant.defaultLang)?.name;
  return { title: name ? `${name} · ${settings.siteName}` : settings.siteName };
}

export default async function RestaurantMenuPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const [restaurant, languages, settings] = await Promise.all([
    getRestaurantMenu(slug),
    getEnabledLanguages(),
    getSiteSettings(),
  ]);

  if (!restaurant || !restaurant.isActive) notFound();

  const locale = resolveLocale(
    lang,
    restaurant.defaultLang,
    languages.map((item) => item.code),
  );

  return (
    <MenuView
      restaurant={{
        slug: restaurant.slug,
        phone: restaurant.phone,
        address: restaurant.address,
        hours: restaurant.hours,
        currency: restaurant.currency,
        defaultLang: restaurant.defaultLang,
        logoUrl: restaurant.logoUrl,
        coverUrl: restaurant.coverUrl,
        translations: restaurant.translations,
      }}
      categories={restaurant.categories}
      locale={locale}
      languages={languages.map((item) => ({
        code: item.code,
        nativeName: item.nativeName,
      }))}
      ui={getUiMessages(locale)}
      brandStyle={brandStyleVars(settings)}
      homeHref={`/?lang=${locale}`}
    />
  );
}
