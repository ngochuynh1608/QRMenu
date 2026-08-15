"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { QrCodeImage, downloadQr } from "@/components/QrCodeImage";
import { updateQrCodes } from "@/app/admin/actions";

type Item = {
  id: string;
  slug: string;
  name: string;
  menuUrl: string;
};

type Props = {
  publicBaseUrl: string;
  qrRevision: number;
  items: Item[];
  updated?: boolean;
};

export function QrUpdatePanel({ publicBaseUrl, qrRevision, items, updated }: Props) {
  return (
    <div className="space-y-6">
      {updated ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Đã cập nhật mã QR theo URL mới (revision #{qrRevision}).
        </p>
      ) : null}

      <form action={updateQrCodes} className="space-y-4 rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)]">
        <h2 className="font-heading text-xl">URL công khai cho QR</h2>
        <p className="text-sm text-muted">
          Khi đổi domain / tunnel / production URL, nhập URL mới rồi bấm cập nhật. Mọi mã QR trên
          homepage và trang nhà hàng sẽ trỏ theo URL này.
        </p>
        <label className="block text-sm font-medium">
          Base URL
          <input
            name="publicBaseUrl"
            type="url"
            required
            defaultValue={publicBaseUrl}
            placeholder="https://menu.example.com"
            className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg bg-cta px-4 font-semibold text-white transition-colors duration-200 hover:bg-cta-dark"
          >
            Cập nhật mã QR
          </button>
          <Link
            href="/admin/settings"
            className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg border-2 border-primary px-4 font-semibold text-primary transition-colors duration-200 hover:bg-primary hover:text-white"
          >
            Thiết lập
          </Link>
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={`${item.id}-${qrRevision}`}
            className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)]"
          >
            <h3 className="truncate font-heading text-lg">{item.name}</h3>
            <p className="mt-1 break-all text-xs text-muted">{item.menuUrl}</p>
            <div className="mt-3 flex justify-center rounded-xl bg-white p-2 ring-1 ring-border">
              <QrCodeImage key={`${item.menuUrl}-${qrRevision}`} value={item.menuUrl} size={160} />
            </div>
            <button
              type="button"
              onClick={() => downloadQr(item.menuUrl, `${item.slug}-qr.png`)}
              className="mt-3 inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-primary px-3 font-medium text-primary transition-colors duration-200 hover:bg-primary hover:text-white"
            >
              <Download className="h-4 w-4" />
              Tải PNG
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
