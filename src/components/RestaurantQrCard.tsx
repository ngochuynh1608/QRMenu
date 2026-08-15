"use client";

import Link from "next/link";
import { Download, ExternalLink, Printer } from "lucide-react";
import { QrCodeImage, downloadQr } from "./QrCodeImage";
import type { UiMessages } from "@/lib/i18n";

type Props = {
  slug: string;
  name: string;
  description?: string | null;
  address?: string | null;
  menuUrl: string;
  ui: UiMessages;
};

export function RestaurantQrCard({ slug, name, description, address, menuUrl, ui }: Props) {
  return (
    <article className="flex flex-col rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] print:break-inside-avoid print:shadow-none print:ring-1 print:ring-border">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <div className="rounded-xl bg-white p-2 ring-1 ring-border">
          <QrCodeImage value={menuUrl} size={160} />
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h2 className="font-heading text-2xl text-text">{name}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
          ) : null}
          {address ? <p className="mt-2 text-sm text-muted">{address}</p> : null}
          <p className="mt-2 break-all text-xs text-muted">{menuUrl}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2 no-print sm:justify-start">
        <Link
          href={`/r/${slug}`}
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-cta px-4 font-semibold text-white transition-colors duration-200 hover:bg-cta-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta"
        >
          <ExternalLink className="h-4 w-4" />
          {ui.viewMenu}
        </Link>
        <button
          type="button"
          onClick={() => downloadQr(menuUrl, `${slug}-qr.png`)}
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border-2 border-primary px-4 font-semibold text-primary transition-colors duration-200 hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Download className="h-4 w-4" />
          {ui.downloadQr}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-white px-4 font-semibold text-muted transition-colors duration-200 hover:bg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Printer className="h-4 w-4" />
          {ui.printQr}
        </button>
      </div>
    </article>
  );
}
