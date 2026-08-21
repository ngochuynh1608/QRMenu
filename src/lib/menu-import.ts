import { z } from "zod";

const transSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
});

const itemSchema = z.object({
  price: z.coerce.number().nonnegative(),
  imageUrl: z.string().nullable().optional(),
  translations: z.record(z.string(), transSchema),
});

const categorySchema = z.object({
  translations: z.record(z.string(), transSchema),
  items: z.array(itemSchema).default([]),
});

export const importedRestaurantSchema = z.object({
  slug: z.string().optional(),
  venueType: z.enum(["qsr", "hotel"]).optional(),
  coverUrl: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  translations: z.record(z.string(), transSchema).optional(),
  categories: z.array(categorySchema),
});

export const menuImportFileSchema = z.object({
  version: z.number().optional(),
  source: z.string().optional(),
  exportedAt: z.string().optional(),
  restaurants: z.array(importedRestaurantSchema),
});

export type ImportedRestaurant = z.infer<typeof importedRestaurantSchema>;
export type MenuImportFile = z.infer<typeof menuImportFileSchema>;

export function parseMenuImportFile(raw: unknown): MenuImportFile {
  if (!raw || typeof raw !== "object") {
    throw new Error("File JSON không hợp lệ.");
  }
  const data = raw as Record<string, unknown>;
  if (Array.isArray(data.restaurants)) {
    return menuImportFileSchema.parse(data);
  }
  if (Array.isArray(data.categories)) {
    return menuImportFileSchema.parse({ restaurants: [data] });
  }
  throw new Error("File thiếu restaurants hoặc categories.");
}

export function translationRows(bag: Record<string, { name: string; description?: string | null }>) {
  return Object.entries(bag)
    .map(([locale, value]) => ({
      locale,
      name: value.name.trim(),
      description: value.description?.trim() || null,
    }))
    .filter((row) => row.name);
}
