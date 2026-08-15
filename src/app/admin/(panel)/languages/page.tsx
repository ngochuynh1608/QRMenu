import { addLanguage, toggleLanguage } from "@/app/admin/actions";
import { getAllLanguages } from "@/lib/data";

export default async function LanguagesPage() {
  const languages = await getAllLanguages();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Ngôn ngữ</h1>
        <p className="mt-1 text-muted">
          Bật locale để hiện trên menu khách. Nội dung món được dịch trong từng nhà hàng.
        </p>
      </div>

      <ul className="space-y-2">
        {languages.map((language) => (
          <li
            key={language.code}
            className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 shadow-[var(--shadow-card)]"
          >
            <div>
              <p className="font-medium">
                {language.nativeName}{" "}
                <span className="text-sm font-normal text-muted">({language.code})</span>
              </p>
              <p className="text-sm text-muted">{language.name}</p>
            </div>
            <form action={toggleLanguage}>
              <input type="hidden" name="code" value={language.code} />
              <button
                type="submit"
                className={`min-h-[44px] min-w-[72px] cursor-pointer rounded-lg px-3 text-sm font-semibold transition-colors duration-200 ${
                  language.isEnabled
                    ? "bg-primary text-white hover:bg-primary-dark"
                    : "bg-border text-muted hover:bg-secondary/40"
                }`}
              >
                {language.isEnabled ? "Đang bật" : "Đang tắt"}
              </button>
            </form>
          </li>
        ))}
      </ul>

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
