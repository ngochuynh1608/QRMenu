import { put } from "@vercel/blob";
import { v2 as cloudinary } from "cloudinary";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_BYTES = 8 * 1024 * 1024;

export function isImageStorageConfigured() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET),
  );
}

function safeExt(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(ext)) return ext;
  return ".jpg";
}

export async function uploadImage(file: File) {
  if (file.size > MAX_BYTES) {
    throw new Error("Ảnh tối đa 8MB");
  }

  const ext = safeExt(file.name);
  const key = `qrmenu/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(key, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "qrmenu", resource_type: "image" },
        (error, result) => {
          if (error || !result) reject(error || new Error("Cloudinary upload failed"));
          else resolve(result);
        },
      );
      stream.end(buffer);
    });
    return uploaded.secure_url;
  }

  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "qrmenu", resource_type: "image" },
        (error, result) => {
          if (error || !result) reject(error || new Error("Cloudinary upload failed"));
          else resolve(result);
        },
      );
      stream.end(buffer);
    });
    return uploaded.secure_url;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Chưa cấu hình lưu ảnh. Thêm BLOB_READ_WRITE_TOKEN (Vercel Blob) hoặc CLOUDINARY_URL.",
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const name = path.basename(key);
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return `/uploads/${name}`;
}

export async function uploadImageFromUrl(url: string) {
  if (!url || url.startsWith("/uploads/")) return url;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(25000),
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`Không tải được ảnh (${res.status})`);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength > MAX_BYTES) throw new Error("Ảnh tối đa 8MB");
  let ext = ".jpg";
  try {
    ext = safeExt(new URL(url).pathname);
  } catch {
    ext = ".jpg";
  }
  const type = res.headers.get("content-type") || "image/jpeg";
  const file = new File([new Uint8Array(buffer)], `import${ext}`, { type });
  return uploadImage(file);
}
