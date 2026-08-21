import { put } from "@vercel/blob";
import { v2 as cloudinary } from "cloudinary";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_EDGE = 1200;

export function isImageStorageConfigured() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET),
  );
}

async function compressImage(input: Buffer) {
  const image = sharp(input, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  if (meta.format === "gif" && (meta.pages ?? 1) > 1) {
    return { buffer: input, ext: ".gif" as const, type: "image/gif" };
  }
  const buffer = await image
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 72, effort: 4 })
    .toBuffer();
  return { buffer, ext: ".webp" as const, type: "image/webp" };
}

function uploadKey(ext: string) {
  return `qrmenu/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
}

export async function uploadImage(file: File) {
  if (file.size > MAX_BYTES) {
    throw new Error("Ảnh tối đa 8MB");
  }

  const raw = Buffer.from(await file.arrayBuffer());
  let compressed: { buffer: Buffer; ext: ".gif" | ".webp" | ".jpg"; type: string };
  try {
    compressed = await compressImage(raw);
  } catch {
    compressed = { buffer: raw, ext: ".jpg", type: file.type || "image/jpeg" };
  }
  const key = uploadKey(compressed.ext);
  const body = new Uint8Array(compressed.buffer);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(key, body, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
      contentType: compressed.type,
    });
    return blob.url;
  }

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const uploaded = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "qrmenu", resource_type: "image", format: "webp", quality: "auto" },
        (error, result) => {
          if (error || !result) reject(error || new Error("Cloudinary upload failed"));
          else resolve(result);
        },
      );
      stream.end(compressed.buffer);
    });
    return uploaded.secure_url;
  }

  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
    const uploaded = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "qrmenu", resource_type: "image", format: "webp", quality: "auto" },
        (error, result) => {
          if (error || !result) reject(error || new Error("Cloudinary upload failed"));
          else resolve(result);
        },
      );
      stream.end(compressed.buffer);
    });
    return uploaded.secure_url;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Chưa cấu hình lưu ảnh. Thêm BLOB_READ_WRITE_TOKEN (Vercel Blob) hoặc CLOUDINARY_URL.",
    );
  }

  const name = path.basename(key);
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), compressed.buffer);
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
  const file = new File([new Uint8Array(buffer)], "import.jpg", {
    type: res.headers.get("content-type") || "image/jpeg",
  });
  return uploadImage(file);
}
