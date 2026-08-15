import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  try {
    const url = await uploadImage(file);
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tải ảnh thất bại";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
