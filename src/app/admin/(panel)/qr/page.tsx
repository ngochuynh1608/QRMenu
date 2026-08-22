import { getPublicRestaurants, getSiteSettings } from "@/lib/data";
import { getBaseUrl, pickTranslation } from "@/lib/utils";
import { QrUpdatePanel } from "@/components/admin/QrUpdatePanel";
import { requireAdminPage } from "@/lib/auth";

export default async function QrAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  await requireAdminPage();
  const { updated } = await searchParams;
  const [settings, restaurants, baseUrl] = await Promise.all([
    getSiteSettings(),
    getPublicRestaurants(),
    getBaseUrl(),
  ]);

  const items = restaurants.map((restaurant) => {
    const name =
      pickTranslation(restaurant.translations, restaurant.defaultLang, "vi")?.name ||
      restaurant.slug;
    return {
      id: restaurant.id,
      slug: restaurant.slug,
      name,
      menuUrl: `${baseUrl}/r/${restaurant.slug}`,
    };
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-3xl">Cập nhật QR</h1>
        <p className="mt-1 text-muted">
          Đổi URL công khai và làm mới toàn bộ mã QR theo domain mới.
        </p>
      </div>
      <QrUpdatePanel
        publicBaseUrl={settings.publicBaseUrl || baseUrl}
        qrRevision={settings.qrRevision}
        items={items}
        updated={updated === "1"}
      />
    </div>
  );
}
