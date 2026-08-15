"use client";

import { useEffect, useState } from "react";

type Props = {
  value: string;
  size?: number;
  className?: string;
};

export function QrCodeImage({ value, size = 180, className }: Props) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(value, {
        width: size * 2,
        margin: 1,
        color: { dark: "#450A0A", light: "#FFFFFF" },
      }).then((url) => {
        if (!cancelled) setSrc(url);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!src) {
    return (
      <div
        className={`animate-pulse rounded-lg bg-border ${className ?? ""}`}
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`QR code for ${value}`}
      width={size}
      height={size}
      className={className}
    />
  );
}

export async function downloadQr(value: string, filename: string) {
  const QRCode = await import("qrcode");
  const url = await QRCode.toDataURL(value, {
    width: 720,
    margin: 2,
    color: { dark: "#450A0A", light: "#FFFFFF" },
  });
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
}
