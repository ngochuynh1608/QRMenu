"use client";

import { ImageUpload } from "@/components/ImageUpload";
import { ColorField } from "@/components/admin/ColorField";
import { saveSiteSettings } from "@/app/admin/actions";
import Link from "next/link";

type Settings = {
  siteName: string;
  logoUrl: string | null;
  publicBaseUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  ctaColor: string;
  backgroundColor: string;
  textColor: string;
  adsEnabled: boolean;
  adsIdleSeconds: number;
  adsSlideSeconds: number;
};

export function SettingsForm({ settings }: { settings: Settings }) {
  return (
    <form action={saveSiteSettings} className="space-y-5">
      <label className="block text-sm font-medium">
        Tên website
        <input
          name="siteName"
          defaultValue={settings.siteName}
          required
          className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        />
      </label>

      <ImageUpload
        name="logoUrl"
        label="Logo chính (ngang)"
        defaultValue={settings.logoUrl}
        hint="Logo ngang hiện phía trên tiêu đề homepage."
      />

      <label className="block text-sm font-medium">
        URL công khai (dùng cho mã QR)
        <input
          name="publicBaseUrl"
          type="url"
          defaultValue={settings.publicBaseUrl ?? ""}
          placeholder="https://menu.example.com"
          className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        />
        <span className="mt-1 block text-xs text-muted">
          Khi đổi domain, nhập URL mới rồi vào{" "}
          <Link href="/admin/qr" className="cursor-pointer font-medium text-primary underline">
            Cập nhật QR
          </Link>{" "}
          để áp dụng cho toàn bộ mã.
        </span>
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <ColorField name="primaryColor" label="Màu chính" defaultValue={settings.primaryColor} />
        <ColorField name="secondaryColor" label="Màu phụ" defaultValue={settings.secondaryColor} />
        <ColorField name="ctaColor" label="Màu nút CTA" defaultValue={settings.ctaColor} />
        <ColorField
          name="backgroundColor"
          label="Màu nền"
          defaultValue={settings.backgroundColor}
        />
        <ColorField name="textColor" label="Màu chữ" defaultValue={settings.textColor} />
      </div>

      <fieldset className="space-y-3 rounded-2xl border border-border bg-white p-4">
        <legend className="px-1 text-sm font-semibold">Quảng cáo (idle kiosk)</legend>
        <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="adsEnabled"
            defaultChecked={settings.adsEnabled}
            className="h-4 w-4 accent-primary"
          />
          Bật slideshow quảng cáo khi không tương tác
        </label>
        <label className="block text-sm font-medium">
          Thời gian chờ không chạm (giây)
          <select
            name="adsIdleSeconds"
            defaultValue={String(settings.adsIdleSeconds === 15 ? 15 : 10)}
            className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          >
            <option value="10">10 giây</option>
            <option value="15">15 giây</option>
          </select>
        </label>
        <label className="block text-sm font-medium">
          Thời gian mỗi slide (giây)
          <input
            name="adsSlideSeconds"
            type="number"
            min={3}
            max={30}
            defaultValue={settings.adsSlideSeconds}
            className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </label>
        <p className="text-xs text-muted">
          Ảnh quảng cáo tải tại mục Quảng cáo (khuyến nghị 1080×1920). Chạm màn hình sẽ tắt ads và
          hiện lại danh sách.
        </p>
      </fieldset>

      <button
        type="submit"
        className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg bg-cta px-4 font-semibold text-white transition-colors duration-200 hover:bg-cta-dark"
      >
        Lưu thiết lập
      </button>
    </form>
  );
}
