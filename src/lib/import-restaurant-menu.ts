import { prisma } from "@/lib/prisma";
import { uploadImageFromUrl } from "@/lib/storage";
import { translationRows, type ImportedRestaurant } from "@/lib/menu-import";

type ImageCache = Map<string, string | null>;

async function mapPool<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>) {
  const results: R[] = [];
  let index = 0;
  async function next(): Promise<void> {
    const current = index++;
    if (current >= items.length) return;
    results[current] = await worker(items[current]);
    await next();
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => next()));
  return results;
}

async function copyUrl(url: string | null | undefined, copyImages: boolean, cache: ImageCache) {
  if (!url) return null;
  if (!copyImages) return url;
  if (cache.has(url)) return cache.get(url) ?? null;
  try {
    const hosted = await uploadImageFromUrl(url);
    cache.set(url, hosted);
    return hosted;
  } catch {
    cache.set(url, url);
    return url;
  }
}

function restaurantName(restaurant: ImportedRestaurant) {
  return (
    restaurant.translations?.vi?.name ||
    restaurant.translations?.en?.name ||
    restaurant.slug ||
    "Nhà hàng"
  );
}

export async function importRestaurantMenu(options: {
  restaurantId: string;
  restaurant: ImportedRestaurant;
  copyImages: boolean;
  replace?: boolean;
  imageCache?: ImageCache;
}) {
  const { restaurantId, restaurant, copyImages } = options;
  const replace = options.replace !== false;
  const cache = options.imageCache ?? new Map<string, string | null>();
  const target = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (!target) throw new Error("Không tìm thấy nhà hàng.");

  const imageUrls = restaurant.categories.flatMap((category) =>
    category.items.map((item) => item.imageUrl).filter((url): url is string => Boolean(url)),
  );
  await mapPool([...new Set(imageUrls)], 4, (url) => copyUrl(url, copyImages, cache));

  if (replace) {
    await prisma.category.deleteMany({ where: { restaurantId } });
  }

  const last = await prisma.category.findFirst({
    where: { restaurantId },
    orderBy: { sortOrder: "desc" },
  });
  let sort = last?.sortOrder ?? -1;
  let itemCount = 0;
  let categoryCount = 0;

  for (const category of restaurant.categories) {
    const catTranslations = translationRows(category.translations);
    if (!catTranslations.length || !category.items.length) continue;
    sort += 1;
    categoryCount += 1;
    const created = await prisma.category.create({
      data: {
        restaurantId,
        sortOrder: sort,
        translations: { create: catTranslations.map(({ locale, name }) => ({ locale, name })) },
      },
    });
    for (const [index, item] of category.items.entries()) {
      const itemTranslations = translationRows(item.translations);
      if (!itemTranslations.length) continue;
      itemCount += 1;
      await prisma.menuItem.create({
        data: {
          categoryId: created.id,
          price: item.price,
          imageUrl: item.imageUrl ? (cache.get(item.imageUrl) ?? item.imageUrl) : null,
          isAvailable: true,
          isFeatured: false,
          sortOrder: index,
          translations: { create: itemTranslations },
        },
      });
    }
  }

  return {
    categories: categoryCount,
    items: itemCount,
    slug: target.slug,
  };
}

export async function importAllMenus(options: {
  restaurants: ImportedRestaurant[];
  copyImages: boolean;
}) {
  const { restaurants, copyImages } = options;
  const withSlug = restaurants.filter((item) => item.slug?.trim());
  if (!withSlug.length) {
    throw new Error("File không có nhà hàng nào có slug để cập nhật.");
  }

  const cache: ImageCache = new Map();
  const extraImages = withSlug.flatMap((item) => [item.coverUrl, item.logoUrl]).filter((url): url is string => Boolean(url));
  await mapPool([...new Set(extraImages)], 4, (url) => copyUrl(url, copyImages, cache));

  const existing = await prisma.restaurant.findMany({ select: { id: true, slug: true } });
  const bySlug = new Map(existing.map((item) => [item.slug, item.id]));

  let updated = 0;
  let created = 0;
  let categories = 0;
  let items = 0;

  for (const restaurant of withSlug) {
    const slug = restaurant.slug!.trim();
    const translations = translationRows(restaurant.translations ?? { vi: { name: restaurantName(restaurant) } });
    const coverUrl = await copyUrl(restaurant.coverUrl, copyImages, cache);
    const logoUrl = await copyUrl(restaurant.logoUrl, copyImages, cache);
    const venueType = restaurant.venueType === "hotel" ? "hotel" : "qsr";

    let restaurantId = bySlug.get(slug);
    if (!restaurantId) {
      const createdRestaurant = await prisma.restaurant.create({
        data: {
          slug,
          venueType,
          coverUrl,
          logoUrl,
          translations: { create: translations.length ? translations : [{ locale: "vi", name: restaurantName(restaurant) }] },
        },
      });
      restaurantId = createdRestaurant.id;
      bySlug.set(slug, restaurantId);
      created += 1;
    } else {
      await prisma.restaurantTranslation.deleteMany({ where: { restaurantId } });
      await prisma.restaurant.update({
        where: { id: restaurantId },
        data: {
          venueType,
          ...(restaurant.coverUrl ? { coverUrl } : {}),
          ...(restaurant.logoUrl ? { logoUrl } : {}),
          translations: {
            create: translations.length ? translations : [{ locale: "vi", name: restaurantName(restaurant) }],
          },
        },
      });
      updated += 1;
    }

    const result = await importRestaurantMenu({
      restaurantId,
      restaurant,
      copyImages,
      replace: true,
      imageCache: cache,
    });
    categories += result.categories;
    items += result.items;
  }

  let imagesCopied = 0;
  for (const [source, hosted] of cache) {
    if (hosted && hosted !== source) imagesCopied += 1;
  }

  return { updated, created, categories, items, imagesCopied, skipped: restaurants.length - withSlug.length };
}
