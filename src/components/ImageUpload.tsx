"use client";

import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle } from "lucide-react";

type Props = {
  name: string;
  label: string;
  defaultValue?: string | null;
  /** When set, reject uploads that are not close to this size */
  expectedSize?: { width: number; height: number; tolerance?: number };
  hint?: string;
};

async function readImageSize(file: File): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Không đọc được ảnh"));
      el.src = url;
    });
    return { width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function ImageUpload({ name, label, defaultValue, expectedSize, hint }: Props) {
  const [url, setUrl] = useState(defaultValue || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      if (expectedSize) {
        const size = await readImageSize(file);
        const tol = expectedSize.tolerance ?? 40;
        if (
          Math.abs(size.width - expectedSize.width) > tol ||
          Math.abs(size.height - expectedSize.height) > tol
        ) {
          setError(
            `Ảnh phải khoảng ${expectedSize.width}×${expectedSize.height}px (hiện: ${size.width}×${size.height}).`,
          );
          setLoading(false);
          return;
        }
      }
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error || "Tải ảnh thất bại");
      } else {
        setUrl(data.url);
      }
    } catch {
      setError("Tải ảnh thất bại");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text">{label}</label>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
      <input type="hidden" name={name} value={url} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface px-4 py-3 text-sm text-muted transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {loading ? (
          <LoaderCircle className="h-5 w-5 animate-spin" />
        ) : (
          <ImagePlus className="h-5 w-5" />
        )}
        {url ? "Đổi ảnh" : "Tải ảnh lên"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => onFile(event.target.files?.[0])}
      />
      {error ? (
        <div className="space-y-1 text-sm text-primary">
          <p>{error}</p>
          {error.includes("BLOB_READ_WRITE_TOKEN") ? (
            <p className="text-muted">
              Vercel → project → Storage → Create Blob → Connect to Project → Redeploy.
            </p>
          ) : null}
        </div>
      ) : null}
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className={`rounded-lg ${
            expectedSize
              ? "mx-auto h-48 w-auto max-w-full object-cover"
              : "h-16 w-auto max-w-full object-contain bg-white p-2 ring-1 ring-border"
          }`}
        />
      ) : null}
    </div>
  );
}
