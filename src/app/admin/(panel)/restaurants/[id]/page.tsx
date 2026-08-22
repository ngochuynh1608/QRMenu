import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAllLanguages } from "@/lib/data";
import { RestaurantForm } from "@/components/admin/RestaurantForm";
import { getBaseUrl, pickTranslation } from "@/lib/utils";
import { RestaurantQrCard } from "@/components/RestaurantQrCard";
import { getUiMessages, parseUiMessages } from "@/lib/i18n";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";

export default async function EditRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!isAdmin(session)) redirect(`/admin/restaurants/${id}/menu`);
  const [restaurant, languages] = await Promise.all([
    prisma.restaurant.findUnique({ where: { id }, include: { translations: true } }),
    getAllLanguages(),
  ]);
  if (!restaurant) notFound();

  const name =
    pickTranslation(restaurant.translations, restaurant.defaultLang, "vi")?.name ||
    restaurant.slug;
  const baseUrl = await getBaseUrl();
  const ui = getUiMessages(
    restaurant.defaultLang,
    parseUiMessages(languages.find((item) => item.code === restaurant.defaultLang)?.uiMessages),
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-3xl">{name}</h1>
        <Link
          href={`/admin/restaurants/${restaurant.id}/menu`}
          className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg bg-primary px-4 font-medium text-white transition-colors duration-200 hover:bg-primary-dark"
        >
          Sửa menu
        </Link>
      </div>
      <RestaurantQrCard
        key={`${baseUrl}-${restaurant.slug}`}
        slug={restaurant.slug}
        name={name}
        menuUrl={`${baseUrl}/r/${restaurant.slug}`}
        ui={ui}
      />
      <div className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)]">
        <RestaurantForm
          restaurant={restaurant}
          languages={languages.map((item) => ({
            code: item.code,
            nativeName: item.nativeName,
          }))}
        />
      </div>
    </div>
  );
}
