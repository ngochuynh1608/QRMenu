"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Props = {
  src: string;
  alt?: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

function canOptimize(src: string) {
  if (src.startsWith("/")) return true;
  try {
    const host = new URL(src).hostname;
    return (
      host === "images.unsplash.com" ||
      host === "res.cloudinary.com" ||
      host === "grandvrio.com" ||
      host.endsWith(".grandvrio.com") ||
      host.endsWith(".public.blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

export function MediaImage({ src, alt = "", sizes, className = "", priority = false }: Props) {
  const [loaded, setLoaded] = useState(false);
  const optimized = canOptimize(src);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className="absolute inset-0">
      {!loaded ? (
        <div className="img-shimmer absolute inset-0" aria-hidden="true" />
      ) : null}
      {optimized ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={70}
          priority={priority}
          className={`object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
          onLoad={() => setLoaded(true)}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
