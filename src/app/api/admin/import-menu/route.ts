import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { parseMenuImportFile } from "@/lib/menu-import";
import { importAllMenus } from "@/lib/import-restaurant-menu";
import { revalidatePath } from "next/cache";

export const maxDuration = 300;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    copyImages?: boolean;
    file?: unknown;
  };

  if (!body.file) {
    return NextResponse.json({ error: "Thiếu file JSON." }, { status: 400 });
  }

  let parsed;
  try {
    parsed = parseMenuImportFile(body.file);
  } catch (error) {
    const message = error instanceof Error ? error.message : "File JSON không hợp lệ.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!parsed.restaurants.length) {
    return NextResponse.json({ error: "File không có nhà hàng nào." }, { status: 400 });
  }

  try {
    const result = await importAllMenus({
      restaurants: parsed.restaurants,
      copyImages: body.copyImages !== false,
    });
    revalidatePath("/");
    revalidatePath("/admin", "layout");
    revalidatePath("/admin/restaurants");
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import thất bại.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
