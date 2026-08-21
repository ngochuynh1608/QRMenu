import { getSession } from "@/lib/auth";
import { autoTranslateLocale } from "@/lib/auto-translate";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const maxDuration = 300;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { locale?: unknown };
  const locale = typeof body.locale === "string" ? body.locale.trim().toLowerCase() : "";
  if (!locale) {
    return NextResponse.json({ error: "Thiếu mã ngôn ngữ." }, { status: 400 });
  }

  try {
    const result = await autoTranslateLocale(locale);
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    revalidatePath("/admin/languages");
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Dịch tự động thất bại.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
