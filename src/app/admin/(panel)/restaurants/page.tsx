import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { pickTranslation } from "@/lib/utils";
import { RestaurantList } from "@/components/admin/RestaurantList";

export default async function RestaurantsPage() {
  const restaurants = await prisma.restaurant.findMany({
    include: { translations: true, categories: { include: { items: true } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-3xl">Nhà hàng</h1>
        <Link
          href="/admin/restaurants/new"
          className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg bg-cta px-4 font-semibold text-white transition-colors duration-200 hover:bg-cta-dark"
        >
          Thêm mới
        </Link>
      </div>
      {restaurants.length === 0 ? (
        <p className="rounded-2xl bg-surface p-6 text-center text-muted">
          Chưa có nhà hàng. Thêm mới hoặc import menu JSON.
        </p>
      ) : (
        <RestaurantList
          restaurants={restaurants.map((restaurant) => ({
            id: restaurant.id,
            name:
              pickTranslation(restaurant.translations, restaurant.defaultLang, "vi")?.name ||
              restaurant.slug,
            slug: restaurant.slug,
            venueType: restaurant.venueType,
            isActive: restaurant.isActive,
            categoryCount: restaurant.categories.length,
            itemCount: restaurant.categories.reduce((sum, category) => sum + category.items.length, 0),
          }))}
        />
      )}
    </div>
  );
}
