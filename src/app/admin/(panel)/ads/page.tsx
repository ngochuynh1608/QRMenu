import Link from "next/link";
import { getAllAdSlides, getSiteSettings } from "@/lib/data";
import { AdsManager } from "@/components/admin/AdsManager";

export default async function AdsPage() {
  const [slides, settings] = await Promise.all([getAllAdSlides(), getSiteSettings()]);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="font-heading text-3xl">Quảng cáo</h1>
        <p className="mt-1 text-muted">
          Ảnh 1080×1920 chạy slideshow trên homepage khi không có tương tác.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-white p-4 text-sm text-muted">
        Trạng thái:{" "}
        <strong className="text-text">{settings.adsEnabled ? "Đang bật" : "Đang tắt"}</strong>
        {" · "}Idle {settings.adsIdleSeconds}s · mỗi slide {settings.adsSlideSeconds}s.{" "}
        <Link href="/admin/settings" className="cursor-pointer font-medium text-primary underline">
          Đổi trong Thiết lập
        </Link>
      </div>
      <AdsManager slides={slides} />
    </div>
  );
}
