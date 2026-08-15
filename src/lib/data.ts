import { prisma } from "./prisma";
import { pickTranslation } from "./utils";
import type { CSSProperties } from "react";

export async function getEnabledLanguages() {
  return prisma.language.findMany({
    where: { isEnabled: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getAllLanguages() {
  return prisma.language.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getPublicRestaurants() {
  return prisma.restaurant.findMany({
    where: { isActive: true },
    include: { translations: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getRestaurantMenu(slug: string) {
  return prisma.restaurant.findUnique({
    where: { slug },
    include: {
      translations: true,
      categories: {
        where: { isActive: true },
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
  });
}

export async function getSiteSettings() {
  const existing = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (existing) return existing;
  return prisma.siteSettings.create({
    data: { id: "default" },
  });
}

export async function getActiveAdSlides() {
  return prisma.adSlide.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getAllAdSlides() {
  return prisma.adSlide.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export function resolveLocale(
  requested: string | undefined,
  defaultLang: string,
  enabledCodes: string[],
) {
  if (requested && enabledCodes.includes(requested)) return requested;
  if (enabledCodes.includes(defaultLang)) return defaultLang;
  return enabledCodes[0] || "vi";
}

export function darkenHex(hex: string, amount = 0.15) {
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 6) return hex;
  const num = Number.parseInt(cleaned, 16);
  const r = Math.max(0, Math.round(((num >> 16) & 255) * (1 - amount)));
  const g = Math.max(0, Math.round(((num >> 8) & 255) * (1 - amount)));
  const b = Math.max(0, Math.round((num & 255) * (1 - amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function brandStyleVars(settings: {
  primaryColor: string;
  secondaryColor: string;
  ctaColor: string;
  backgroundColor: string;
  textColor: string;
}): CSSProperties {
  return {
    ["--color-primary" as string]: settings.primaryColor,
    ["--color-primary-dark" as string]: darkenHex(settings.primaryColor),
    ["--color-secondary" as string]: settings.secondaryColor,
    ["--color-cta" as string]: settings.ctaColor,
    ["--color-cta-dark" as string]: darkenHex(settings.ctaColor),
    ["--color-background" as string]: settings.backgroundColor,
    ["--color-text" as string]: settings.textColor,
    ["--color-muted" as string]: darkenHex(settings.textColor, 0.25),
    ["--color-border" as string]: settings.secondaryColor,
  };
}

export { pickTranslation };
