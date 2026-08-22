import { getAllLanguages } from "@/lib/data";
import { RestaurantForm } from "@/components/admin/RestaurantForm";
import { requireAdminPage } from "@/lib/auth";

export default async function NewRestaurantPage() {
  await requireAdminPage();
  const languages = await getAllLanguages();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="font-heading text-3xl">Thêm nhà hàng</h1>
      <div className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)]">
        <RestaurantForm
          languages={languages.map((item) => ({
            code: item.code,
            nativeName: item.nativeName,
          }))}
        />
      </div>
    </div>
  );
}
