"use client";

import { ImageUpload } from "@/components/ImageUpload";
import { LocaleTabs } from "@/components/LocaleTabs";
import { deleteRestaurant, saveRestaurant } from "@/app/admin/actions";

type Restaurant = {
  id: string;
  slug: string;
  phone: string | null;
  address: string | null;
  hours: string | null;
  currency: string;
  defaultLang: string;
  venueType?: string;
  logoUrl: string | null;
  coverUrl: string | null;
  isActive: boolean;
  translations: { locale: string; name: string; description: string | null }[];
};

type Props = {
  restaurant?: Restaurant;
  languages: { code: string; nativeName: string }[];
};

export function RestaurantForm({ restaurant, languages }: Props) {
  const locales = languages.map((item) => item.code).join(",");

  return (
    <form action={saveRestaurant} className="space-y-5">
      {restaurant ? <input type="hidden" name="id" value={restaurant.id} /> : null}
      <input type="hidden" name="locales" value={locales} />

      <LocaleTabs locales={languages}>
        {(locale) => {
          const translation = restaurant?.translations.find((item) => item.locale === locale);
          return (
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Tên nhà hàng
                <input
                  name={`t_${locale}_name`}
                  defaultValue={translation?.name ?? ""}
                  className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </label>
              <label className="block text-sm font-medium">
                Mô tả
                <textarea
                  name={`t_${locale}_description`}
                  defaultValue={translation?.description ?? ""}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </label>
            </div>
          );
        }}
      </LocaleTabs>

      <label className="block text-sm font-medium">
        Slug (URL / QR)
        <input
          name="slug"
          defaultValue={restaurant?.slug ?? ""}
          required
          placeholder="pho-24"
          className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Điện thoại
          <input
            name="phone"
            defaultValue={restaurant?.phone ?? ""}
            className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </label>
        <label className="block text-sm font-medium">
          Giờ mở cửa
          <input
            name="hours"
            defaultValue={restaurant?.hours ?? ""}
            className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </label>
      </div>

      <label className="block text-sm font-medium">
        Địa chỉ
        <input
          name="address"
          defaultValue={restaurant?.address ?? ""}
          className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Loại
          <select
            name="venueType"
            defaultValue={restaurant?.venueType ?? "qsr"}
            className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          >
            <option value="qsr">Quick Service Restaurant</option>
            <option value="hotel">Hotel</option>
          </select>
        </label>
        <label className="block text-sm font-medium">
          Tiền tệ
          <input
            name="currency"
            defaultValue={restaurant?.currency ?? "VND"}
            className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </label>
      </div>

      <label className="block text-sm font-medium">
        Ngôn ngữ mặc định
        <select
          name="defaultLang"
          defaultValue={restaurant?.defaultLang ?? "vi"}
          className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        >
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.nativeName}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={restaurant?.isActive ?? true}
          className="h-4 w-4 accent-primary"
        />
        Hiển thị công khai
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <ImageUpload name="logoUrl" label="Logo" defaultValue={restaurant?.logoUrl} />
        <ImageUpload name="coverUrl" label="Ảnh bìa" defaultValue={restaurant?.coverUrl} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg bg-cta px-4 font-semibold text-white transition-colors duration-200 hover:bg-cta-dark"
        >
          Lưu
        </button>
        {restaurant ? (
          <button
            type="submit"
            formAction={deleteRestaurant}
            className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg border-2 border-primary px-4 font-semibold text-primary transition-colors duration-200 hover:bg-primary hover:text-white"
          >
            Xóa nhà hàng
          </button>
        ) : null}
      </div>
    </form>
  );
}
