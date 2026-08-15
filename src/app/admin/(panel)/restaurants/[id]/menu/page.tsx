import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAllLanguages } from "@/lib/data";
import { pickTranslation } from "@/lib/utils";
import { MenuEditor } from "@/components/admin/MenuEditor";

export default async function RestaurantMenuAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [restaurant, languages] = await Promise.all([
    prisma.restaurant.findUnique({
      where: { id },
      include: {
        translations: true,
        categories: {
          orderBy: { sortOrder: "asc" },
          include: {
            translations: true,
            items: {
              orderBy: { sortOrder: "asc" },
              include: { translations: true },
            },
          },
        },
      },
    }),
    getAllLanguages(),
  ]);
  if (!restaurant) notFound();

  const name =
    pickTranslation(restaurant.translations, restaurant.defaultLang, "vi")?.name ||
    restaurant.slug;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl">Menu · {name}</h1>
          <p className="text-sm text-muted">Danh mục, món và bản dịch</p>
        </div>
        <Link
          href={`/admin/restaurants/${restaurant.id}`}
          className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg border-2 border-primary px-4 font-medium text-primary transition-colors duration-200 hover:bg-primary hover:text-white"
        >
          Thông tin & QR
        </Link>
      </div>
      <MenuEditor
        restaurantId={restaurant.id}
        defaultLang={restaurant.defaultLang}
        categories={restaurant.categories}
        languages={languages.map((item) => ({
          code: item.code,
          nativeName: item.nativeName,
        }))}
      />
    </div>
  );
}
