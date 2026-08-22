import { getSiteSettings } from "@/lib/data";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireAdminPage } from "@/lib/auth";

export default async function SettingsPage() {
  await requireAdminPage();
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="font-heading text-3xl">Thiết lập</h1>
        <p className="mt-1 text-muted">Logo, tên website, màu thương hiệu và quảng cáo idle.</p>
      </div>
      <div className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)]">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
