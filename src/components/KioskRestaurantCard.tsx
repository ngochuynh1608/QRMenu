"use client";

import Link from "next/link";
import { QrCodeImage } from "./QrCodeImage";

type Props = {
  slug: string;
  name: string;
  description?: string | null;
  avatarUrl?: string | null;
  menuUrl: string;
  menuHref: string;
  viewMenuLabel: string;
  qrKey?: number | string;
};

export function KioskRestaurantCard({
  slug,
  name,
  description,
  avatarUrl,
  menuUrl,
  menuHref,
  viewMenuLabel,
  qrKey = 0,
}: Props) {
  return (
    <Link
      href={menuHref}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl bg-surface p-5 shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-16 w-16 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary font-heading text-2xl font-semibold text-white">
            {name.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-heading text-xl font-semibold uppercase tracking-wide text-text sm:text-2xl">
            {name}
          </h2>
          {description ? (
            <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-muted">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col items-center gap-4">
        <div className="rounded-2xl bg-white p-3 ring-1 ring-border">
          <QrCodeImage key={`${menuUrl}-${qrKey}`} value={menuUrl} size={180} />
        </div>
        <span className="inline-flex min-h-14 w-full cursor-pointer items-center justify-center rounded-xl bg-cta px-6 text-lg font-semibold text-white transition-colors duration-200 group-hover:bg-cta-dark">
          {viewMenuLabel}
        </span>
      </div>
      <span className="sr-only">{slug}</span>
    </Link>
  );
}
