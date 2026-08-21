"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { addAdSlide, deleteAdSlide, moveAdSlide, toggleAdSlide } from "@/app/admin/actions";

type Slide = {
  id: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
};

export function AdsManager({ slides }: { slides: Slide[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <form action={addAdSlide} className="space-y-4 rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)]">
        <h2 className="font-heading text-xl">Thêm ảnh quảng cáo</h2>
        <ImageUpload
          name="imageUrl"
          label="Ảnh portrait"
          expectedSize={{ width: 1080, height: 1920, tolerance: 80 }}
          hint="Khuyến nghị đúng 1080×1920 (dọc, full màn hình kiosk)."
        />
        <button
          type="submit"
          className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg bg-cta px-4 font-semibold text-white transition-colors duration-200 hover:bg-cta-dark"
        >
          Thêm vào slideshow
        </button>
      </form>

      <ul className="space-y-3">
        {slides.length === 0 ? (
          <li className="rounded-2xl bg-surface p-6 text-center text-muted">
            Chưa có ảnh quảng cáo. Bật quảng cáo trong Thiết lập sau khi tải ảnh.
          </li>
        ) : (
          slides.map((slide, index) => (
            <li
              key={slide.id}
              className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-[var(--shadow-card)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.imageUrl}
                alt=""
                className="h-28 w-16 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-muted">{slide.imageUrl}</p>
                <p className="text-xs text-muted">#{index + 1}</p>
              </div>
              <form action={moveAdSlide}>
                <input type="hidden" name="id" value={slide.id} />
                <input type="hidden" name="direction" value="up" />
                <button
                  type="submit"
                  disabled={index === 0}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-background disabled:opacity-30"
                  aria-label="Lên"
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
              </form>
              <form action={moveAdSlide}>
                <input type="hidden" name="id" value={slide.id} />
                <input type="hidden" name="direction" value="down" />
                <button
                  type="submit"
                  disabled={index === slides.length - 1}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-background disabled:opacity-30"
                  aria-label="Xuống"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </form>
              <form action={toggleAdSlide}>
                <input type="hidden" name="id" value={slide.id} />
                <button
                  type="submit"
                  className={`min-h-[44px] min-w-[72px] cursor-pointer rounded-lg px-3 text-sm font-semibold transition-colors duration-200 ${
                    slide.isActive
                      ? "bg-primary text-white hover:bg-primary-dark"
                      : "bg-border text-muted"
                  }`}
                >
                  {slide.isActive ? "Bật" : "Tắt"}
                </button>
              </form>
              <button
                type="button"
                onClick={() => setPendingId(slide.id)}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-primary hover:bg-background"
                aria-label="Xóa"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))
        )}
      </ul>
      <ConfirmDeleteDialog
        open={Boolean(pendingId)}
        title="Xóa ảnh quảng cáo"
        description="Ảnh này sẽ bị gỡ khỏi slideshow."
        onClose={() => setPendingId(null)}
        action={deleteAdSlide}
        hiddenFields={pendingId ? { id: pendingId } : undefined}
      />
    </div>
  );
}
