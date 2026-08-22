import Link from "next/link";
import {
  ChefHat,
  CircleUser,
  Globe,
  LayoutDashboard,
  LogOut,
  Megaphone,
  QrCode,
  Settings,
  Store,
  Users,
} from "lucide-react";
import { logoutAction } from "../actions";
import { prisma } from "@/lib/prisma";
import { pickTranslation } from "@/lib/utils";
import { ImportNavButton } from "@/components/admin/ImportNavButton";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";

export const dynamic = "force-dynamic";

const ALL_NAV = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, adminOnly: false },
  { href: "/admin/restaurants", label: "Nhà hàng", icon: Store, adminOnly: false },
  { href: "/admin/qr", label: "Cập nhật QR", icon: QrCode, adminOnly: true },
  { href: "/admin/languages", label: "Ngôn ngữ", icon: Globe, adminOnly: true },
  { href: "/admin/ads", label: "Quảng cáo", icon: Megaphone, adminOnly: false },
  { href: "/admin/settings", label: "Thiết lập", icon: Settings, adminOnly: true },
  { href: "/admin/users", label: "Người dùng", icon: Users, adminOnly: true },
  { href: "/admin/account", label: "Tài khoản", icon: CircleUser, adminOnly: false },
];

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const admin = session ? isAdmin(session) : false;
  const nav = ALL_NAV.filter((item) => admin || !item.adminOnly);

  const restaurants = admin
    ? await prisma.restaurant.findMany({
        include: { translations: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      })
    : [];

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="flex cursor-pointer items-center gap-2 text-text">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <ChefHat className="h-5 w-5" />
            </span>
            <span className="font-heading text-lg">QRMenu Admin</span>
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted transition-colors duration-200 hover:bg-background hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {admin ? (
            <ImportNavButton
              restaurants={restaurants.map((restaurant) => ({
                id: restaurant.id,
                slug: restaurant.slug,
                name:
                  pickTranslation(restaurant.translations, restaurant.defaultLang, "vi")?.name ||
                  restaurant.slug,
              }))}
            />
          ) : null}
          <Link
            href="/"
            className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center rounded-lg px-3 text-sm font-medium text-muted transition-colors duration-200 hover:text-primary"
          >
            QR công khai
          </Link>
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        {children}
      </div>
    </div>
  );
}
