export type Translation = { locale: string };

export function pickTranslation<T extends Translation>(
  translations: T[],
  locale: string,
  fallback: string,
): T | undefined {
  return (
    translations.find((item) => item.locale === locale) ||
    translations.find((item) => item.locale === fallback) ||
    translations[0]
  );
}

export function formatPrice(amount: number, currency: string, locale: string) {
  const localeTag = locale === "vi" ? "vi-VN" : locale === "ja" ? "ja-JP" : locale === "ko" ? "ko-KR" : locale === "zh" ? "zh-CN" : "en-US";
  return new Intl.NumberFormat(localeTag, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" || currency === "JPY" ? 0 : 2,
  }).format(amount);
}

export async function getBaseUrl() {
  const { prisma } = await import("./prisma");
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (settings?.publicBaseUrl?.trim()) {
    return settings.publicBaseUrl.trim().replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  const { headers } = await import("next/headers");
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}
