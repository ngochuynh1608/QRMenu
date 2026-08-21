import { addLanguage } from "@/app/admin/actions";
import { getAllLanguages } from "@/lib/data";
import { LanguagesManager } from "@/components/admin/LanguagesManager";

export default async function LanguagesPage() {
  const languages = await getAllLanguages();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Ngôn ngữ</h1>
        <p className="mt-1 text-muted">
          Sửa tên locale, bật/tắt trên menu khách, và dịch các text còn thiếu bằng Google Dịch.
        </p>
      </div>

      <LanguagesManager
        languages={languages.map((language) => ({
          code: language.code,
          name: language.name,
          nativeName: language.nativeName,
          isEnabled: language.isEnabled,
        }))}
      />

      <form action={addLanguage} className="space-y-3 rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)]">
        <h2 className="font-heading text-xl">Thêm ngôn ngữ</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm font-medium">
            Mã
            <input
              name="code"
              required
              placeholder="fr"
              className="mt-1 min-h-[44px] w-full rounded-lg border border-border px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </label>
          <label className="text-sm font-medium">
            Tên
            <input
              name="name"
              required
              placeholder="French"
              className="mt-1 min-h-[44px] w-full rounded-lg border border-border px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </label>
          <label className="text-sm font-medium">
            Tên bản địa
            <input
              name="nativeName"
              required
              placeholder="Français"
              className="mt-1 min-h-[44px] w-full rounded-lg border border-border px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </label>
        </div>
        <button
          type="submit"
          className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg bg-cta px-4 font-semibold text-white transition-colors duration-200 hover:bg-cta-dark"
        >
          Thêm
        </button>
      </form>
    </div>
  );
}
