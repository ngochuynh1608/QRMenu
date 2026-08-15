"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  Star,
  X,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { UiMessages } from "@/lib/i18n";
import type { CSSProperties } from "react";

type Translation = { locale: string; name: string; description?: string | null };

export type MenuDish = {
  id: string;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  translations: Translation[];
};

export type MenuCategory = {
  id: string;
  translations: { locale: string; name: string }[];
  items: MenuDish[];
};

type Props = {
  restaurant: {
    slug: string;
    phone: string | null;
    address: string | null;
    hours: string | null;
    currency: string;
    defaultLang: string;
    logoUrl: string | null;
    coverUrl: string | null;
    translations: Translation[];
  };
  categories: MenuCategory[];
  locale: string;
  languages: { code: string; nativeName: string }[];
  ui: UiMessages;
  brandStyle?: CSSProperties;
  homeHref?: string;
};

function tName(items: { locale: string; name: string }[], locale: string, fallback: string) {
  return (
    items.find((item) => item.locale === locale)?.name ||
    items.find((item) => item.locale === fallback)?.name ||
    items[0]?.name ||
    ""
  );
}

function tDesc(items: Translation[], locale: string, fallback: string) {
  return (
    items.find((item) => item.locale === locale)?.description ||
    items.find((item) => item.locale === fallback)?.description ||
    items[0]?.description ||
    ""
  );
}

export function MenuView({
  restaurant,
  categories,
  locale,
  languages,
  ui,
  brandStyle,
  homeHref = "/",
}: Props) {
  const fallback = restaurant.defaultLang;
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");
  const [selected, setSelected] = useState<MenuDish | null>(null);
  const name = tName(restaurant.translations, locale, fallback);
  const description = tDesc(restaurant.translations, locale, fallback);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const nodes = categories
      .map((category) => document.getElementById(`cat-${category.id}`))
      .filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActiveId(visible.target.id.replace("cat-", ""));
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [categories]);

  function scrollToCategory(id: string) {
    document.getElementById(`cat-${id}`)?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <div style={brandStyle} className="min-h-dvh w-full bg-background text-text">
      <div className="mx-auto min-h-dvh max-w-lg pb-[env(safe-area-inset-bottom)]">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4">
          <Link
            href={homeHref}
            className="flex min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-text ring-1 ring-border transition-colors duration-200 hover:bg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={ui.backHome}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          {restaurant.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={restaurant.logoUrl}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-lg text-white">
              {name.slice(0, 1)}
            </div>
          )}
          <h1 className="min-w-0 flex-1 truncate font-heading text-xl leading-tight text-text">
            {name}
          </h1>
          <div className="flex gap-1" role="navigation" aria-label={ui.language}>
            {languages.map((language) => (
              <Link
                key={language.code}
                href={`/r/${restaurant.slug}?lang=${language.code}`}
                className={`flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full text-xs font-semibold uppercase transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  locale === language.code
                    ? "bg-primary text-white"
                    : "bg-white text-muted hover:bg-border"
                }`}
              >
                {language.code}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {restaurant.coverUrl ? (
        <div className="relative aspect-[16/7] w-full bg-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={restaurant.coverUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <section className="space-y-2 px-4 py-4">
        {description ? <p className="text-sm leading-relaxed text-muted">{description}</p> : null}
        <div className="flex flex-col gap-2 text-sm text-muted">
          {restaurant.address ? (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`}
              className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg px-1 transition-colors duration-200 hover:text-primary"
            >
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{restaurant.address}</span>
            </a>
          ) : null}
          {restaurant.hours ? (
            <p className="flex min-h-[44px] items-center gap-2 px-1">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                {ui.hours}: {restaurant.hours}
              </span>
            </p>
          ) : null}
          {restaurant.phone ? (
            <a
              href={`tel:${restaurant.phone}`}
              className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-cta px-4 font-semibold text-white transition-colors duration-200 hover:bg-cta-dark"
            >
              <Phone className="h-4 w-4" />
              {ui.call}: {restaurant.phone}
            </a>
          ) : null}
        </div>
      </section>

      {categories.length > 0 ? (
        <nav
          className="sticky top-[57px] z-20 border-y border-border bg-background/95 backdrop-blur-md"
          aria-label="Danh mục"
        >
          <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-hide">
            {categories.map((category) => {
              const label = tName(category.translations, locale, fallback);
              const isActive = activeId === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => scrollToCategory(category.id)}
                  className={`min-h-[44px] shrink-0 cursor-pointer rounded-full px-4 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive ? "bg-primary text-white" : "bg-white text-muted hover:bg-border"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </nav>
      ) : (
        <p className="px-4 py-10 text-center text-muted">{ui.noItems}</p>
      )}

      <div className="space-y-8 px-4 py-6">
        {categories.map((category) => (
          <section
            key={category.id}
            id={`cat-${category.id}`}
            className="scroll-mt-[120px]"
          >
            <h2 className="mb-3 font-heading text-2xl text-text">
              {tName(category.translations, locale, fallback)}
            </h2>
            <ul className="space-y-3">
              {category.items.map((item) => {
                const itemName = tName(item.translations, locale, fallback);
                const itemDesc = tDesc(item.translations, locale, fallback);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className="flex w-full cursor-pointer gap-3 rounded-2xl bg-surface p-3 text-left shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-border">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt=""
                            className={`h-full w-full object-cover ${item.isAvailable ? "" : "opacity-50"}`}
                          />
                        ) : (
                          <div className="h-full w-full bg-border" />
                        )}
                        {!item.isAvailable ? (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-semibold text-white">
                            {ui.soldOut}
                          </span>
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold leading-snug text-text">{itemName}</p>
                          <p className="shrink-0 font-semibold text-primary">
                            {formatPrice(item.price, restaurant.currency, locale)}
                          </p>
                        </div>
                        {itemDesc ? (
                          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
                            {itemDesc}
                          </p>
                        ) : null}
                        {item.isFeatured && item.isAvailable ? (
                          <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-cta-dark">
                            <Star className="h-3.5 w-3.5" />
                            {ui.featured}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            type="button"
            aria-label={ui.close}
            className="absolute inset-0 cursor-pointer bg-black/50 backdrop-blur-[4px]"
            onClick={() => setSelected(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-surface pb-[env(safe-area-inset-bottom)] shadow-[var(--shadow-lift)]"
          >
            <div className="relative aspect-[16/10] bg-border">
              {selected.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
              {!selected.isAvailable ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">
                  {ui.soldOut}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/90 text-text transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={ui.close}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-heading text-2xl text-text">
                  {tName(selected.translations, locale, fallback)}
                </h3>
                <p className="shrink-0 font-semibold text-primary">
                  {formatPrice(selected.price, restaurant.currency, locale)}
                </p>
              </div>
              {tDesc(selected.translations, locale, fallback) ? (
                <p className="text-sm leading-relaxed text-muted">
                  {tDesc(selected.translations, locale, fallback)}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      </div>
    </div>
  );
}
