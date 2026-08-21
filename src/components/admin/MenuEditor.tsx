"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2, X } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { LocaleTabs } from "@/components/LocaleTabs";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import {
  deleteCategory,
  deleteItem,
  moveCategory,
  moveItem,
  saveCategory,
  saveItem,
} from "@/app/admin/actions";

type Translation = { locale: string; name: string; description?: string | null };
type Item = {
  id: string;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  translations: Translation[];
};
type Category = {
  id: string;
  translations: { locale: string; name: string }[];
  items: Item[];
};
type Language = { code: string; nativeName: string };

type Props = {
  restaurantId: string;
  categories: Category[];
  languages: Language[];
  defaultLang: string;
};

function tName(items: { locale: string; name: string }[], fallback: string) {
  return items.find((item) => item.locale === fallback)?.name || items[0]?.name || "—";
}

export function MenuEditor({ restaurantId, categories, languages, defaultLang }: Props) {
  const [categoryModal, setCategoryModal] = useState<Category | "new" | null>(null);
  const [itemModal, setItemModal] = useState<{ categoryId: string; item?: Item } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<
    | { type: "category"; id: string; name: string }
    | { type: "item"; id: string; name: string }
    | null
  >(null);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setCategoryModal("new")}
        className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-cta px-4 font-semibold text-white transition-colors duration-200 hover:bg-cta-dark"
      >
        <Plus className="h-4 w-4" />
        Thêm danh mục
      </button>

      {categories.map((category, index) => (
        <section key={category.id} className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2">
            <h2 className="min-w-0 flex-1 font-heading text-xl">
              {tName(category.translations, defaultLang)}
            </h2>
            <form action={moveCategory}>
              <input type="hidden" name="id" value={category.id} />
              <input type="hidden" name="restaurantId" value={restaurantId} />
              <input type="hidden" name="direction" value="up" />
              <button
                type="submit"
                disabled={index === 0}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors duration-200 hover:bg-background disabled:opacity-30"
                aria-label="Lên"
              >
                <ChevronUp className="h-5 w-5" />
              </button>
            </form>
            <form action={moveCategory}>
              <input type="hidden" name="id" value={category.id} />
              <input type="hidden" name="restaurantId" value={restaurantId} />
              <input type="hidden" name="direction" value="down" />
              <button
                type="submit"
                disabled={index === categories.length - 1}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors duration-200 hover:bg-background disabled:opacity-30"
                aria-label="Xuống"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </form>
            <button
              type="button"
              onClick={() => setCategoryModal(category)}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors duration-200 hover:bg-background"
              aria-label="Sửa danh mục"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                setPendingDelete({
                  type: "category",
                  id: category.id,
                  name: tName(category.translations, defaultLang),
                })
              }
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-primary transition-colors duration-200 hover:bg-background"
              aria-label="Xóa danh mục"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <ul className="mt-3 space-y-2">
            {category.items.map((item, itemIndex) => (
              <li
                key={item.id}
                className="flex items-center gap-2 rounded-xl border border-border bg-white p-2"
              >
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-border" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{tName(item.translations, defaultLang)}</p>
                  <p className="text-xs text-muted">
                    {item.price.toLocaleString("vi-VN")} · {item.isAvailable ? "còn bán" : "hết món"}
                  </p>
                </div>
                <form action={moveItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="restaurantId" value={restaurantId} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    disabled={itemIndex === 0}
                    className="flex h-11 w-9 cursor-pointer items-center justify-center text-muted disabled:opacity-30"
                    aria-label="Lên"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                </form>
                <form action={moveItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="restaurantId" value={restaurantId} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    disabled={itemIndex === category.items.length - 1}
                    className="flex h-11 w-9 cursor-pointer items-center justify-center text-muted disabled:opacity-30"
                    aria-label="Xuống"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => setItemModal({ categoryId: category.id, item })}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center text-muted"
                  aria-label="Sửa món"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPendingDelete({
                      type: "item",
                      id: item.id,
                      name: tName(item.translations, defaultLang),
                    })
                  }
                  className="flex h-11 w-11 cursor-pointer items-center justify-center text-primary"
                  aria-label="Xóa món"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setItemModal({ categoryId: category.id })}
            className="mt-3 inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-medium text-primary transition-colors duration-200 hover:bg-background"
          >
            <Plus className="h-4 w-4" />
            Thêm món
          </button>
        </section>
      ))}

      {categoryModal ? (
        <Modal onClose={() => setCategoryModal(null)} title={categoryModal === "new" ? "Thêm danh mục" : "Sửa danh mục"}>
          <form
            action={async (form) => {
              await saveCategory(form);
              setCategoryModal(null);
            }}
            className="space-y-4"
          >
            <input type="hidden" name="restaurantId" value={restaurantId} />
            <input type="hidden" name="locales" value={languages.map((item) => item.code).join(",")} />
            {categoryModal !== "new" ? <input type="hidden" name="id" value={categoryModal.id} /> : null}
            <LocaleTabs locales={languages}>
              {(locale) => {
                const current =
                  categoryModal === "new"
                    ? undefined
                    : categoryModal.translations.find((item) => item.locale === locale);
                return (
                  <label className="block text-sm font-medium">
                    Tên danh mục
                    <input
                      name={`t_${locale}_name`}
                      defaultValue={current?.name ?? ""}
                      className="mt-1 min-h-[44px] w-full rounded-lg border border-border px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </label>
                );
              }}
            </LocaleTabs>
            <button
              type="submit"
              className="flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-lg bg-cta font-semibold text-white transition-colors duration-200 hover:bg-cta-dark"
            >
              Lưu danh mục
            </button>
          </form>
        </Modal>
      ) : null}

      {itemModal ? (
        <Modal onClose={() => setItemModal(null)} title={itemModal.item ? "Sửa món" : "Thêm món"}>
          <form
            action={async (form) => {
              await saveItem(form);
              setItemModal(null);
            }}
            className="space-y-4"
          >
            <input type="hidden" name="restaurantId" value={restaurantId} />
            <input type="hidden" name="categoryId" value={itemModal.categoryId} />
            <input type="hidden" name="locales" value={languages.map((item) => item.code).join(",")} />
            {itemModal.item ? <input type="hidden" name="id" value={itemModal.item.id} /> : null}
            <LocaleTabs locales={languages}>
              {(locale) => {
                const current = itemModal.item?.translations.find((item) => item.locale === locale);
                return (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">
                      Tên món
                      <input
                        name={`t_${locale}_name`}
                        defaultValue={current?.name ?? ""}
                        className="mt-1 min-h-[44px] w-full rounded-lg border border-border px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      />
                    </label>
                    <label className="block text-sm font-medium">
                      Mô tả
                      <textarea
                        name={`t_${locale}_description`}
                        defaultValue={current?.description ?? ""}
                        rows={3}
                        className="mt-1 w-full rounded-lg border border-border px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      />
                    </label>
                  </div>
                );
              }}
            </LocaleTabs>
            <label className="block text-sm font-medium">
              Giá
              <input
                name="price"
                type="number"
                step="1000"
                defaultValue={itemModal.item?.price ?? 0}
                required
                className="mt-1 min-h-[44px] w-full rounded-lg border border-border px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </label>
            <ImageUpload
              key={itemModal.item?.id ?? "new"}
              name="imageUrl"
              label="Ảnh món"
              defaultValue={itemModal.item?.imageUrl}
            />
            <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="isAvailable"
                defaultChecked={itemModal.item?.isAvailable ?? true}
                className="h-4 w-4 accent-primary"
              />
              Còn bán
            </label>
            <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={itemModal.item?.isFeatured ?? false}
                className="h-4 w-4 accent-primary"
              />
              Món nổi bật
            </label>
            <button
              type="submit"
              className="flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-lg bg-cta font-semibold text-white transition-colors duration-200 hover:bg-cta-dark"
            >
              Lưu món
            </button>
          </form>
        </Modal>
      ) : null}
      {pendingDelete ? (
        <ConfirmDeleteDialog
          open
          title={pendingDelete.type === "category" ? "Xóa danh mục" : "Xóa món"}
          description={
            pendingDelete.type === "category"
              ? `Danh mục “${pendingDelete.name}” và toàn bộ món bên trong sẽ bị xóa.`
              : `Món “${pendingDelete.name}” sẽ bị xóa.`
          }
          onClose={() => setPendingDelete(null)}
          action={pendingDelete.type === "category" ? deleteCategory : deleteItem}
          hiddenFields={{ id: pendingDelete.id, restaurantId }}
        />
      ) : null}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 cursor-pointer bg-black/50 backdrop-blur-[4px]"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-[var(--shadow-lift)] sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-xl">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-background"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
