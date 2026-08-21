"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { FileUp, LoaderCircle, X } from "lucide-react";
import { parseMenuImportFile, type MenuImportFile } from "@/lib/menu-import";

export type ImportRestaurantOption = {
  id: string;
  slug: string;
  name: string;
};

type Props = {
  restaurants: ImportRestaurantOption[];
  onClose: () => void;
};

function venueName(item: MenuImportFile["restaurants"][number]) {
  return item.translations?.vi?.name || item.translations?.en?.name || item.slug || "Menu";
}

export function MenuImportDialog({ restaurants, onClose }: Props) {
  const [fileName, setFileName] = useState("");
  const [payload, setPayload] = useState<MenuImportFile | null>(null);
  const [copyImages, setCopyImages] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const existingSlugs = new Set(restaurants.map((item) => item.slug));
  const venues = payload?.restaurants.filter((item) => item.slug) ?? [];
  const totalItems = venues.reduce((n, item) => n + item.categories.reduce((m, c) => m + c.items.length, 0), 0);
  const updateCount = venues.filter((item) => existingSlugs.has(item.slug!)).length;
  const createCount = venues.length - updateCount;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setFileName(file.name);
    try {
      const json = JSON.parse(await file.text()) as unknown;
      setPayload(parseMenuImportFile(json));
    } catch (err) {
      setPayload(null);
      setError(err instanceof Error ? err.message : "Không đọc được file JSON.");
    }
  }

  async function onImport() {
    if (!payload) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/import-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ copyImages, file: payload }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Import thất bại.");
        setLoading(false);
        return;
      }
      window.location.href = "/admin/restaurants";
    } catch {
      setError("Import thất bại.");
      setLoading(false);
    }
  }

  const dialog = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Đóng"
        disabled={loading}
        className="absolute inset-0 cursor-pointer bg-black/50 backdrop-blur-[4px] disabled:cursor-wait"
        onClick={loading ? undefined : onClose}
      />
      <div className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-5 shadow-[var(--shadow-lift)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-xl">Import menu</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-background disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted">
          Chọn file JSON. Hệ thống sẽ cập nhật <strong>toàn bộ menu</strong> theo slug — không cần chọn từng nhà hàng.
          Nhà hàng chưa có sẽ được tạo mới.
        </p>

        <div className="mt-4 space-y-4">
          <label className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-white px-4 text-sm text-muted transition-colors duration-200 hover:border-primary hover:text-primary">
            <FileUp className="h-4 w-4" />
            {fileName || "Chọn file JSON"}
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              disabled={loading}
              onChange={(event) => onFile(event.target.files?.[0])}
            />
          </label>

          {payload ? (
            <>
              <div className="rounded-xl border border-border bg-white p-3">
                <p className="text-sm font-medium">
                  {venues.length} nhà hàng · {totalItems} món
                  {updateCount ? ` · ${updateCount} cập nhật` : ""}
                  {createCount ? ` · ${createCount} tạo mới` : ""}
                </p>
                <ul className="mt-2 max-h-44 space-y-1 overflow-y-auto text-sm text-muted">
                  {venues.map((item) => {
                    const count = item.categories.reduce((n, c) => n + c.items.length, 0);
                    const exists = existingSlugs.has(item.slug!);
                    return (
                      <li key={item.slug} className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate">{venueName(item)}</span>
                        <span className="shrink-0 text-xs">
                          {count} món · {exists ? "cập nhật" : "tạo mới"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={copyImages}
                  disabled={loading}
                  onChange={(event) => setCopyImages(event.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                Tải ảnh vào kho lưu trữ (Blob / Cloudinary)
              </label>

              <button
                type="button"
                disabled={loading || venues.length === 0}
                onClick={onImport}
                className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-cta font-semibold text-white transition-colors duration-200 hover:bg-cta-dark disabled:opacity-60"
              >
                {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                {loading ? "Đang import tất cả menu…" : "Import tất cả menu"}
              </button>
            </>
          ) : null}

          {error ? <p className="text-sm text-primary">{error}</p> : null}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(dialog, document.body);
}
