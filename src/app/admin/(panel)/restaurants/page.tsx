import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { pickTranslation } from "@/lib/utils";

export default async function RestaurantsPage() {
  const restaurants = await prisma.restaurant.findMany({
    include: { translations: true, categories: { include: { items: true } } },
    orderBy: { createdAt: "asc" },
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
      <ul className="space-y-3">
        {restaurants.map((restaurant) => {
          const name =
            pickTranslation(restaurant.translations, restaurant.defaultLang, "vi")?.name ||
            restaurant.slug;
          const itemCount = restaurant.categories.reduce(
            (sum, category) => sum + category.items.length,
            0,
          );
          return (
            <li
              key={restaurant.id}
              className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-heading text-xl">{name}</p>
                  <p className="text-sm text-muted">
                    /r/{restaurant.slug} ·{" "}
                    {restaurant.venueType === "hotel" ? "Hotel" : "QSR"} ·{" "}
                    {restaurant.categories.length} danh mục · {itemCount} món
                    {restaurant.isActive ? "" : " · ẩn"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/restaurants/${restaurant.id}`}
                    className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg border-2 border-primary px-3 font-medium text-primary transition-colors duration-200 hover:bg-primary hover:text-white"
                  >
                    Thông tin
                  </Link>
                  <Link
                    href={`/admin/restaurants/${restaurant.id}/menu`}
                    className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg bg-primary px-3 font-medium text-white transition-colors duration-200 hover:bg-primary-dark"
                  >
                    Menu
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
