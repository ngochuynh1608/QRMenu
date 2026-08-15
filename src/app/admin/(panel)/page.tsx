import Link from "next/link";
import { Globe, Store, UtensilsCrossed } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminHomePage() {
  const [restaurants, items, languages] = await Promise.all([
    prisma.restaurant.count(),
    prisma.menuItem.count(),
    prisma.language.count({ where: { isEnabled: true } }),
  ]);

  const stats = [
    { label: "Nhà hàng", value: restaurants, href: "/admin/restaurants", icon: Store },
    { label: "Món ăn", value: items, href: "/admin/restaurants", icon: UtensilsCrossed },
    { label: "Ngôn ngữ đang bật", value: languages, href: "/admin/languages", icon: Globe },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Tổng quan</h1>
        <p className="mt-1 text-muted">Quản lý nội dung menu và mã QR nhà hàng.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="cursor-pointer rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-lift)]"
          >
            <stat.icon className="h-5 w-5 text-primary" />
            <p className="mt-3 font-heading text-3xl">{stat.value}</p>
            <p className="text-sm text-muted">{stat.label}</p>
          </Link>
        ))}
      </div>
      <Link
        href="/admin/restaurants/new"
        className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg bg-cta px-4 font-semibold text-white transition-colors duration-200 hover:bg-cta-dark"
      >
        Thêm nhà hàng
      </Link>
    </div>
  );
}
