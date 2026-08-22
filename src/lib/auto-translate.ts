import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { translateTexts } from "@/lib/google-translate";
import { UI_MESSAGE_KEYS, UI_MESSAGES, parseUiMessages, type UiMessages } from "@/lib/i18n";

type TranslationRow = { locale: string; name: string; description?: string | null };

function pickSource(rows: TranslationRow[], preferred: string[]) {
  for (const locale of preferred) {
    const row = rows.find((item) => item.locale === locale && item.name.trim());
    if (row) return row;
  }
  return rows.find((item) => item.name.trim());
}

function sameText(a: string, b: string) {
  return a.trim().localeCompare(b.trim(), undefined, { sensitivity: "accent" }) === 0;
}

function needsTranslate(current: string | null | undefined, source: string) {
  if (!source.trim()) return false;
  if (!current?.trim()) return true;
  return sameText(current, source);
}

export async function autoTranslateLocale(target: string) {
  const locale = target.trim().toLowerCase();
  const language = await prisma.language.findUnique({ where: { code: locale } });
  if (!language) throw new Error("Không tìm thấy ngôn ngữ.");

  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  const translateLang = settings?.translateLang?.trim().toLowerCase() || "vi";
  const sourceOrder = [translateLang, "vi", "en"].filter(
    (code, index, list) =>
      Boolean(code) && code !== locale && list.indexOf(code) === index,
  );
  if (!sourceOrder.length) {
    throw new Error("Ngôn ngữ dịch mặc định trùng ngôn ngữ đích. Chọn nguồn khác (ví dụ tiếng Việt).");
  }

  const restaurants = await prisma.restaurant.findMany({
    include: {
      translations: true,
      categories: {
        include: {
          translations: true,
          items: { include: { translations: true } },
        },
      },
    },
  });

  type Job = { from: string; text: string; apply: (translated: string) => void };
  const jobs: Job[] = [];
  const restaurantCreates: Array<{ restaurantId: string; name: string; description: string | null }> = [];
  const restaurantUpdates: Array<{ id: string; name?: string; description?: string | null }> = [];
  const categoryCreates: Array<{ categoryId: string; name: string }> = [];
  const categoryUpdates: Array<{ id: string; name: string }> = [];
  const itemCreates: Array<{ menuItemId: string; name: string; description: string | null }> = [];
  const itemUpdates: Array<{ id: string; name?: string; description?: string | null }> = [];

  for (const restaurant of restaurants) {
    const source = pickSource(restaurant.translations, sourceOrder);
    if (!source) continue;
    const current = restaurant.translations.find((item) => item.locale === locale);
    if (!current) {
      const created = { restaurantId: restaurant.id, name: source.name, description: source.description ?? null };
      restaurantCreates.push(created);
      jobs.push({
        from: source.locale,
        text: source.name,
        apply: (value) => {
          created.name = value;
        },
      });
      if (source.description?.trim()) {
        jobs.push({
          from: source.locale,
          text: source.description,
          apply: (value) => {
            created.description = value;
          },
        });
      }
    } else {
      const patch: { id: string; name?: string; description?: string | null } = { id: current.id };
      if (needsTranslate(current.name, source.name)) {
        jobs.push({
          from: source.locale,
          text: source.name,
          apply: (value) => {
            patch.name = value;
          },
        });
        restaurantUpdates.push(patch);
      }
      if (source.description?.trim() && needsTranslate(current.description, source.description)) {
        jobs.push({
          from: source.locale,
          text: source.description,
          apply: (value) => {
            patch.description = value;
          },
        });
        if (!restaurantUpdates.includes(patch)) restaurantUpdates.push(patch);
      }
    }

    for (const category of restaurant.categories) {
      const catSource = pickSource(category.translations, sourceOrder);
      if (!catSource) continue;
      const catCurrent = category.translations.find((item) => item.locale === locale);
      if (!catCurrent) {
        const created = { categoryId: category.id, name: catSource.name };
        categoryCreates.push(created);
        jobs.push({
          from: catSource.locale,
          text: catSource.name,
          apply: (value) => {
            created.name = value;
          },
        });
      } else if (needsTranslate(catCurrent.name, catSource.name)) {
        const patch = { id: catCurrent.id, name: catSource.name };
        categoryUpdates.push(patch);
        jobs.push({
          from: catSource.locale,
          text: catSource.name,
          apply: (value) => {
            patch.name = value;
          },
        });
      }

      for (const item of category.items) {
        const itemSource = pickSource(item.translations, sourceOrder);
        if (!itemSource) continue;
        const itemCurrent = item.translations.find((row) => row.locale === locale);
        if (!itemCurrent) {
          const created = {
            menuItemId: item.id,
            name: itemSource.name,
            description: itemSource.description ?? null,
          };
          itemCreates.push(created);
          jobs.push({
            from: itemSource.locale,
            text: itemSource.name,
            apply: (value) => {
              created.name = value;
            },
          });
          if (itemSource.description?.trim()) {
            jobs.push({
              from: itemSource.locale,
              text: itemSource.description,
              apply: (value) => {
                created.description = value;
              },
            });
          }
        } else {
          const patch: { id: string; name?: string; description?: string | null } = { id: itemCurrent.id };
          if (needsTranslate(itemCurrent.name, itemSource.name) && itemSource.name.trim()) {
            jobs.push({
              from: itemSource.locale,
              text: itemSource.name,
              apply: (value) => {
                patch.name = value;
              },
            });
            itemUpdates.push(patch);
          }
          if (itemSource.description?.trim() && needsTranslate(itemCurrent.description, itemSource.description)) {
            jobs.push({
              from: itemSource.locale,
              text: itemSource.description,
              apply: (value) => {
                patch.description = value;
              },
            });
            if (!itemUpdates.includes(patch)) itemUpdates.push(patch);
          }
        }
      }
    }
  }

  const currentUi = {
    ...(UI_MESSAGES[locale] ?? {}),
    ...(parseUiMessages(language.uiMessages) ?? {}),
  } as Partial<UiMessages>;
  const uiSourceLocale = UI_MESSAGES[translateLang] ? translateLang : "vi";
  const uiSource = UI_MESSAGES[uiSourceLocale];
  const uiPatch: Partial<UiMessages> = { ...currentUi };
  let uiChanged = false;
  for (const key of UI_MESSAGE_KEYS) {
    const sourceText = uiSource[key];
    if (!sourceText) continue;
    if (currentUi[key]?.trim() && !sameText(currentUi[key] || "", sourceText)) continue;
    jobs.push({
      from: uiSourceLocale,
      text: sourceText,
      apply: (value) => {
        uiPatch[key] = value;
        uiChanged = true;
      },
    });
  }

  const bySource = new Map<string, Job[]>();
  for (const job of jobs) {
    const list = bySource.get(job.from) ?? [];
    list.push(job);
    bySource.set(job.from, list);
  }

  for (const [from, group] of bySource) {
    const translated = await translateTexts(
      group.map((job) => job.text),
      from,
      locale,
    );
    group.forEach((job, index) => job.apply(translated[index] || job.text));
  }

  const [restaurantIds, categoryIds, itemIds] = await Promise.all([
    prisma.restaurant.findMany({ select: { id: true } }),
    prisma.category.findMany({ select: { id: true } }),
    prisma.menuItem.findMany({ select: { id: true } }),
  ]);
  const restaurantsOk = new Set(restaurantIds.map((row) => row.id));
  const categoriesOk = new Set(categoryIds.map((row) => row.id));
  const itemsOk = new Set(itemIds.map((row) => row.id));

  const newRestaurants = restaurantCreates.filter((row) => restaurantsOk.has(row.restaurantId));
  const newCategories = categoryCreates.filter((row) => categoriesOk.has(row.categoryId));
  const newItems = itemCreates.filter((row) => itemsOk.has(row.menuItemId));

  if (newRestaurants.length) {
    await prisma.restaurantTranslation.createMany({
      data: newRestaurants.map((row) => ({
        restaurantId: row.restaurantId,
        locale,
        name: row.name,
        description: row.description,
      })),
      skipDuplicates: true,
    });
  }
  if (newCategories.length) {
    await prisma.categoryTranslation.createMany({
      data: newCategories.map((row) => ({
        categoryId: row.categoryId,
        locale,
        name: row.name,
      })),
      skipDuplicates: true,
    });
  }
  if (newItems.length) {
    await prisma.menuItemTranslation.createMany({
      data: newItems.map((row) => ({
        menuItemId: row.menuItemId,
        locale,
        name: row.name,
        description: row.description,
      })),
      skipDuplicates: true,
    });
  }

  if (restaurantUpdates.length || categoryUpdates.length || itemUpdates.length || uiChanged) {
    await prisma.$transaction(
      async (tx) => {
        for (const row of restaurantUpdates) {
          await tx.restaurantTranslation.update({
            where: { id: row.id },
            data: {
              ...(row.name !== undefined ? { name: row.name } : {}),
              ...(row.description !== undefined ? { description: row.description } : {}),
            },
          });
        }
        for (const row of categoryUpdates) {
          await tx.categoryTranslation.update({
            where: { id: row.id },
            data: { name: row.name },
          });
        }
        for (const row of itemUpdates) {
          await tx.menuItemTranslation.update({
            where: { id: row.id },
            data: {
              ...(row.name !== undefined ? { name: row.name } : {}),
              ...(row.description !== undefined ? { description: row.description } : {}),
            },
          });
        }
        if (uiChanged) {
          await tx.language.update({
            where: { code: locale },
            data: { uiMessages: uiPatch as Prisma.InputJsonValue },
          });
        }
      },
      { timeout: 120_000 },
    );
  }

  return {
    translated: jobs.length,
    restaurants: restaurantCreates.length + restaurantUpdates.length,
    categories: categoryCreates.length + categoryUpdates.length,
    items: itemCreates.length + itemUpdates.length,
    ui: uiChanged ? UI_MESSAGE_KEYS.filter((key) => !currentUi[key]?.trim()).length : 0,
  };
}
