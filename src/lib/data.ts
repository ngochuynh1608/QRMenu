import type { SiteSettings } from "@prisma/client";
import { prisma } from "./prisma";
import { pickTranslation } from "./utils";
import type { CSSProperties } from "react";

function prismaErrorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code: unknown }).code);
  }
  return "";
}

function isSchemaUnavailable(error: unknown) {
  const code = prismaErrorCode(error);
  return code === "P2021" || code === "P2022" || code === "P2010";
}

const FALLBACK_SETTINGS: SiteSettings = {
  id: "default",
  siteName: "QRMenu",
  logoUrl: null,
  publicBaseUrl: null,
  qrRevision: 0,
  primaryColor: "#DC2626",
  secondaryColor: "#F87171",
  ctaColor: "#CA8A04",
  backgroundColor: "#FEF2F2",
  textColor: "#450A0A",
  adsEnabled: false,
  adsIdleSeconds: 10,
  adsSlideSeconds: 8,
  displayLang: "vi",
  translateLang: "vi",
};

export async function getEnabledLanguages() {
  try {
    return await prisma.language.findMany({
      where: { isEnabled: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch (error) {
    if (isSchemaUnavailable(error)) return [];
    throw error;
  }
}

export async function getAllLanguages() {
  return prisma.language.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getPublicRestaurants() {
  try {
    return await prisma.restaurant.findMany({
      where: { isActive: true },
      include: { translations: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  } catch (error) {
    if (isSchemaUnavailable(error)) return [];
    throw error;
  }
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
  try {
    const existing = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (existing) return existing;
    return await prisma.siteSettings.create({
      data: { id: "default" },
    });
  } catch (error) {
    console.error("[getSiteSettings] database unavailable, using fallback", error);
    return FALLBACK_SETTINGS;
  }
}

export async function getActiveAdSlides() {
  try {
    return await prisma.adSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch (error) {
    if (isSchemaUnavailable(error)) return [];
    throw error;
  }
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
