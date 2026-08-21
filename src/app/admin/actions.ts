"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { login, logout, requireSession, updateAdminAccount } from "@/lib/auth";

function formString(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseTranslations(form: FormData, prefix: string, locales: string[]) {
  return locales
    .map((locale) => ({
      locale,
      name: formString(form, `${prefix}_${locale}_name`),
      description: formString(form, `${prefix}_${locale}_description`) || null,
    }))
    .filter((item) => item.name);
}

function revalidatePublicAndAdmin(slug?: string) {
  revalidatePath("/");
  revalidatePath("/admin", "layout");
  if (slug) revalidatePath(`/r/${slug}`);
}

export async function loginAction(form: FormData) {
  const email = formString(form, "email");
  const password = formString(form, "password");
  const ok = await login(email, password);
  if (!ok) {
    redirect("/admin/login?error=1");
  }
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

export async function updateAdminAccountAction(form: FormData) {
  const session = await requireSession();
  const email = formString(form, "email");
  const currentPassword = formString(form, "currentPassword");
  const newPassword = typeof form.get("newPassword") === "string" ? String(form.get("newPassword")) : "";
  const confirmPassword =
    typeof form.get("confirmPassword") === "string" ? String(form.get("confirmPassword")) : "";

  if (!currentPassword) {
    redirect("/admin/account?error=current");
  }
  if (newPassword !== confirmPassword) {
    redirect("/admin/account?error=mismatch");
  }

  const result = await updateAdminAccount({
    userId: session.id,
    email,
    currentPassword,
    newPassword,
  });

  if (!result.ok) {
    redirect(`/admin/account?error=${result.error}`);
  }

  revalidatePath("/admin/account");
  redirect("/admin/account?saved=1");
}

export async function saveRestaurant(form: FormData) {
  await requireSession();
  const id = formString(form, "id");
  const slug = formString(form, "slug")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");
  const locales = formString(form, "locales").split(",").filter(Boolean);
  const translations = parseTranslations(form, "t", locales);

  const data = {
    slug,
    phone: formString(form, "phone") || null,
    address: formString(form, "address") || null,
    hours: formString(form, "hours") || null,
    currency: formString(form, "currency") || "VND",
    defaultLang: formString(form, "defaultLang") || "vi",
    logoUrl: formString(form, "logoUrl") || null,
    coverUrl: formString(form, "coverUrl") || null,
    venueType: formString(form, "venueType") === "hotel" ? "hotel" : "qsr",
    isActive: form.get("isActive") === "on",
  };

  if (id) {
    await prisma.restaurantTranslation.deleteMany({ where: { restaurantId: id } });
    await prisma.restaurant.update({
      where: { id },
      data: {
        ...data,
        translations: { create: translations },
      },
    });
  } else {
    const last = await prisma.restaurant.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const created = await prisma.restaurant.create({
      data: {
        ...data,
        sortOrder: (last?.sortOrder ?? -1) + 1,
        translations: { create: translations },
      },
    });
    revalidatePublicAndAdmin(created.slug);
    redirect(`/admin/restaurants/${created.id}/menu`);
  }

  revalidatePublicAndAdmin(slug);
  redirect(`/admin/restaurants/${id}`);
}

export async function reorderRestaurants(ids: string[]) {
  await requireSession();
  const existing = await prisma.restaurant.findMany({ select: { id: true } });
  const allowed = new Set(existing.map((item) => item.id));
  if (!ids.length || ids.length !== existing.length || ids.some((id) => !allowed.has(id))) {
    throw new Error("Danh sách nhà hàng không hợp lệ");
  }

  await prisma.$transaction(
    ids.map((id, index) => prisma.restaurant.update({ where: { id }, data: { sortOrder: index } })),
  );
  revalidatePublicAndAdmin();
}

export async function deleteRestaurant(form: FormData) {
  await requireSession();
  const id = formString(form, "id");
  await prisma.restaurant.delete({ where: { id } });
  revalidatePublicAndAdmin();
  redirect("/admin/restaurants");
}

export async function saveCategory(form: FormData) {
  await requireSession();
  const restaurantId = formString(form, "restaurantId");
  const id = formString(form, "id");
  const locales = formString(form, "locales").split(",").filter(Boolean);
  const translations = parseTranslations(form, "t", locales).map(({ locale, name }) => ({
    locale,
    name,
  }));

  if (id) {
    await prisma.categoryTranslation.deleteMany({ where: { categoryId: id } });
    await prisma.category.update({
      where: { id },
      data: {
        isActive: form.get("isActive") !== "off",
        translations: { create: translations },
      },
    });
  } else {
    const last = await prisma.category.findFirst({
      where: { restaurantId },
      orderBy: { sortOrder: "desc" },
    });
    await prisma.category.create({
      data: {
        restaurantId,
        sortOrder: (last?.sortOrder ?? -1) + 1,
        translations: { create: translations },
      },
    });
  }

  revalidatePath(`/admin/restaurants/${restaurantId}/menu`);
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (restaurant) revalidatePath(`/r/${restaurant.slug}`);
}

export async function deleteCategory(form: FormData) {
  await requireSession();
  const id = formString(form, "id");
  const restaurantId = formString(form, "restaurantId");
  await prisma.category.delete({ where: { id } });
  revalidatePath(`/admin/restaurants/${restaurantId}/menu`);
}

export async function moveCategory(form: FormData) {
  await requireSession();
  const id = formString(form, "id");
  const restaurantId = formString(form, "restaurantId");
  const direction = formString(form, "direction");
  const categories = await prisma.category.findMany({
    where: { restaurantId },
    orderBy: { sortOrder: "asc" },
  });
  const index = categories.findIndex((item) => item.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= categories.length) return;

  const current = categories[index];
  const other = categories[swapWith];
  await prisma.$transaction([
    prisma.category.update({ where: { id: current.id }, data: { sortOrder: other.sortOrder } }),
    prisma.category.update({ where: { id: other.id }, data: { sortOrder: current.sortOrder } }),
  ]);
  revalidatePath(`/admin/restaurants/${restaurantId}/menu`);
}

export async function saveItem(form: FormData) {
  await requireSession();
  const restaurantId = formString(form, "restaurantId");
  const categoryId = formString(form, "categoryId");
  const id = formString(form, "id");
  const locales = formString(form, "locales").split(",").filter(Boolean);
  const translations = parseTranslations(form, "t", locales);
  const price = Number(formString(form, "price") || "0");

  const payload = {
    categoryId,
    price,
    imageUrl: formString(form, "imageUrl") || null,
    isAvailable: form.get("isAvailable") === "on",
    isFeatured: form.get("isFeatured") === "on",
  };

  if (id) {
    await prisma.menuItemTranslation.deleteMany({ where: { menuItemId: id } });
    await prisma.menuItem.update({
      where: { id },
      data: { ...payload, translations: { create: translations } },
    });
  } else {
    const last = await prisma.menuItem.findFirst({
      where: { categoryId },
      orderBy: { sortOrder: "desc" },
    });
    await prisma.menuItem.create({
      data: {
        ...payload,
        sortOrder: (last?.sortOrder ?? -1) + 1,
        translations: { create: translations },
      },
    });
  }

  revalidatePath(`/admin/restaurants/${restaurantId}/menu`);
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (restaurant) revalidatePath(`/r/${restaurant.slug}`);
}

export async function deleteItem(form: FormData) {
  await requireSession();
  const id = formString(form, "id");
  const restaurantId = formString(form, "restaurantId");
  await prisma.menuItem.delete({ where: { id } });
  revalidatePath(`/admin/restaurants/${restaurantId}/menu`);
}

export async function moveItem(form: FormData) {
  await requireSession();
  const id = formString(form, "id");
  const restaurantId = formString(form, "restaurantId");
  const direction = formString(form, "direction");
  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) return;
  const items = await prisma.menuItem.findMany({
    where: { categoryId: item.categoryId },
    orderBy: { sortOrder: "asc" },
  });
  const index = items.findIndex((entry) => entry.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= items.length) return;
  const current = items[index];
  const other = items[swapWith];
  await prisma.$transaction([
    prisma.menuItem.update({ where: { id: current.id }, data: { sortOrder: other.sortOrder } }),
    prisma.menuItem.update({ where: { id: other.id }, data: { sortOrder: current.sortOrder } }),
  ]);
  revalidatePath(`/admin/restaurants/${restaurantId}/menu`);
}

export async function toggleLanguage(form: FormData) {
  await requireSession();
  const code = formString(form, "code");
  const current = await prisma.language.findUnique({ where: { code } });
  if (!current) return;
  await prisma.language.update({
    where: { code },
    data: { isEnabled: !current.isEnabled },
  });
  revalidatePath("/admin/languages");
  revalidatePath("/");
}

export async function addLanguage(form: FormData) {
  await requireSession();
  const code = formString(form, "code").toLowerCase();
  const name = formString(form, "name");
  const nativeName = formString(form, "nativeName");
  const last = await prisma.language.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.language.create({
    data: {
      code,
      name,
      nativeName,
      isEnabled: true,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
  revalidatePath("/admin/languages");
}

export async function saveSiteSettings(form: FormData) {
  await requireSession();
  const idleRaw = Number(formString(form, "adsIdleSeconds") || "10");
  const slideRaw = Number(formString(form, "adsSlideSeconds") || "8");
  const publicBaseUrl = normalizePublicUrl(formString(form, "publicBaseUrl"));
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      siteName: formString(form, "siteName") || "QRMenu",
      logoUrl: formString(form, "logoUrl") || null,
      publicBaseUrl,
      primaryColor: formString(form, "primaryColor") || "#DC2626",
      secondaryColor: formString(form, "secondaryColor") || "#F87171",
      ctaColor: formString(form, "ctaColor") || "#CA8A04",
      backgroundColor: formString(form, "backgroundColor") || "#FEF2F2",
      textColor: formString(form, "textColor") || "#450A0A",
      adsEnabled: form.get("adsEnabled") === "on",
      adsIdleSeconds: idleRaw === 15 ? 15 : 10,
      adsSlideSeconds: Math.min(30, Math.max(3, slideRaw || 8)),
    },
    update: {
      siteName: formString(form, "siteName") || "QRMenu",
      logoUrl: formString(form, "logoUrl") || null,
      publicBaseUrl,
      primaryColor: formString(form, "primaryColor") || "#DC2626",
      secondaryColor: formString(form, "secondaryColor") || "#F87171",
      ctaColor: formString(form, "ctaColor") || "#CA8A04",
      backgroundColor: formString(form, "backgroundColor") || "#FEF2F2",
      textColor: formString(form, "textColor") || "#450A0A",
      adsEnabled: form.get("adsEnabled") === "on",
      adsIdleSeconds: idleRaw === 15 ? 15 : 10,
      adsSlideSeconds: Math.min(30, Math.max(3, slideRaw || 8)),
    },
  });
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/qr");
  revalidatePath("/admin/ads");
  revalidatePath("/admin", "layout");
}

function normalizePublicUrl(raw: string) {
  const value = raw.trim().replace(/\/$/, "");
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export async function updateQrCodes(form: FormData) {
  await requireSession();
  const publicBaseUrl = normalizePublicUrl(formString(form, "publicBaseUrl"));
  const current = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      publicBaseUrl,
      qrRevision: 1,
    },
    update: {
      publicBaseUrl,
      qrRevision: (current?.qrRevision ?? 0) + 1,
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/qr");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/restaurants");
  redirect("/admin/qr?updated=1");
}

export async function addAdSlide(form: FormData) {
  await requireSession();
  const imageUrl = formString(form, "imageUrl");
  if (!imageUrl) return;
  const last = await prisma.adSlide.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.adSlide.create({
    data: {
      imageUrl,
      sortOrder: (last?.sortOrder ?? -1) + 1,
      isActive: true,
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/ads");
}

export async function deleteAdSlide(form: FormData) {
  await requireSession();
  const id = formString(form, "id");
  await prisma.adSlide.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/ads");
}

export async function toggleAdSlide(form: FormData) {
  await requireSession();
  const id = formString(form, "id");
  const current = await prisma.adSlide.findUnique({ where: { id } });
  if (!current) return;
  await prisma.adSlide.update({
    where: { id },
    data: { isActive: !current.isActive },
  });
  revalidatePath("/");
  revalidatePath("/admin/ads");
}

export async function moveAdSlide(form: FormData) {
  await requireSession();
  const id = formString(form, "id");
  const direction = formString(form, "direction");
  const slides = await prisma.adSlide.findMany({ orderBy: { sortOrder: "asc" } });
  const index = slides.findIndex((item) => item.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= slides.length) return;
  const current = slides[index];
  const other = slides[swapWith];
  await prisma.$transaction([
    prisma.adSlide.update({ where: { id: current.id }, data: { sortOrder: other.sortOrder } }),
    prisma.adSlide.update({ where: { id: other.id }, data: { sortOrder: current.sortOrder } }),
  ]);
  revalidatePath("/");
  revalidatePath("/admin/ads");
}
