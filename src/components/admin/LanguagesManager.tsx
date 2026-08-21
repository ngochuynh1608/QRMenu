"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Languages, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { deleteLanguage, toggleLanguage, updateLanguage } from "@/app/admin/actions";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";

type LanguageRow = {
  code: string;
  name: string;
  nativeName: string;
  isEnabled: boolean;
};

export function LanguagesManager({ languages }: { languages: LanguageRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<LanguageRow | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function autoTranslate(code: string) {
    setBusy(code);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/auto-translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: code }),
      });
      const data = (await res.json()) as {
        error?: string;
        translated?: number;
        restaurants?: number;
        categories?: number;
        items?: number;
        ui?: number;
      };
      if (!res.ok) throw new Error(data.error || "Dịch tự động thất bại.");
      const count = data.translated ?? 0;
      setMessage(
        count === 0
          ? `${code}: không còn text thiếu.`
          : `${code}: đã dịch ${count} đoạn còn thiếu (${data.restaurants ?? 0} nhà hàng, ${data.categories ?? 0} danh mục, ${data.items ?? 0} món, ${data.ui ?? 0} giao diện).`,
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dịch tự động thất bại.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      {message ? <p className="rounded-xl bg-surface px-4 py-3 text-sm text-muted">{message}</p> : null}
      {error ? <p className="rounded-xl bg-surface px-4 py-3 text-sm text-primary">{error}</p> : null}
      <ul className="space-y-2">
        {languages.map((language) => {
          const isEditing = editing === language.code;
          return (
            <li
              key={language.code}
              className="space-y-3 rounded-2xl bg-surface px-4 py-3 shadow-[var(--shadow-card)]"
            >
              {isEditing ? (
                <form
                  action={async (form) => {
                    await updateLanguage(form);
                    setEditing(null);
                  }}
                  className="space-y-3"
                >
                  <input type="hidden" name="code" value={language.code} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm font-medium">
                      Tên
                      <input
                        name="name"
                        required
                        defaultValue={language.name}
                        className="mt-1 min-h-[44px] w-full rounded-lg border border-border px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      />
                    </label>
                    <label className="text-sm font-medium">
                      Tên bản địa
                      <input
                        name="nativeName"
                        required
                        defaultValue={language.nativeName}
                        className="mt-1 min-h-[44px] w-full rounded-lg border border-border px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-muted">Mã locale: {language.code}</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg bg-cta px-4 font-semibold text-white transition-colors duration-200 hover:bg-cta-dark"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg border-2 border-border px-4 font-medium text-muted transition-colors duration-200 hover:bg-background"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">
                      {language.nativeName}{" "}
                      <span className="text-sm font-normal text-muted">({language.code})</span>
                    </p>
                    <p className="text-sm text-muted">{language.name}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(language.code)}
                      className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border-2 border-border px-3 text-sm font-medium text-muted transition-colors duration-200 hover:bg-background hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                      Sửa
                    </button>
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() => autoTranslate(language.code)}
                      className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border-2 border-primary px-3 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary hover:text-white disabled:opacity-50"
                    >
                      {busy === language.code ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Languages className="h-4 w-4" />
                      )}
                      Tự động dịch
                    </button>
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
                    <button
                      type="button"
                      onClick={() => setPendingDelete(language)}
                      disabled={languages.length <= 1}
                      className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border-2 border-primary px-3 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xóa
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <ConfirmDeleteDialog
        open={Boolean(pendingDelete)}
        title="Xóa ngôn ngữ"
        description={
          pendingDelete
            ? `Ngôn ngữ ${pendingDelete.nativeName} (${pendingDelete.code}) và mọi bản dịch tương ứng sẽ bị xóa.`
            : undefined
        }
        onClose={() => setPendingDelete(null)}
        action={deleteLanguage}
        hiddenFields={pendingDelete ? { code: pendingDelete.code } : undefined}
      />
    </div>
  );
}
