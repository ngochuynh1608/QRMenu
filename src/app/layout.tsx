import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { brandStyleVars, getSiteSettings } from "@/lib/data";
import "./globals.css";

export const dynamic = "force-dynamic";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.siteName,
    description: "Digital QR menus for restaurants",
  };
}

export async function generateViewport(): Promise<Viewport> {
  const settings = await getSiteSettings();
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: settings.primaryColor,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const brand = brandStyleVars(settings);

  return (
    <html lang="vi" className={beVietnam.variable} style={brand}>
      <body className="min-h-dvh bg-background font-body text-text antialiased">
        {children}
      </body>
    </html>
  );
}
