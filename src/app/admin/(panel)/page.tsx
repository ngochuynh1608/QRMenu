import Link from "next/link";
import { Globe, Megaphone, Store, UtensilsCrossed } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function AdminHomePage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const admin = isAdmin(session);

  const [restaurants, items, languages, ads] = await Promise.all([
    prisma.restaurant.count(),
    prisma.menuItem.count(),
    prisma.language.count({ where: { isEnabled: true } }),
    prisma.adSlide.count(),
  ]);

  const stats = admin
    ? [
        { label: "Nhà hàng", value: restaurants, href: "/admin/restaurants", icon: Store },
        { label: "Món ăn", value: items, href: "/admin/restaurants", icon: UtensilsCrossed },
        { label: "Ngôn ngữ đang bật", value: languages, href: "/admin/languages", icon: Globe },
      ]
    : [
        { label: "Nhà hàng", value: restaurants, href: "/admin/restaurants", icon: Store },
        { label: "Món ăn", value: items, href: "/admin/restaurants", icon: UtensilsCrossed },
        { label: "Quảng cáo", value: ads, href: "/admin/ads", icon: Megaphone },
      ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Tổng quan</h1>
        <p className="mt-1 text-muted">
          {admin
            ? "Quản lý nội dung menu và mã QR nhà hàng."
            : "Quản lý menu và quảng cáo."}
        </p>
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
      {admin ? (
        <Link
          href="/admin/restaurants/new"
          className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg bg-cta px-4 font-semibold text-white transition-colors duration-200 hover:bg-cta-dark"
        >
          Thêm nhà hàng
        </Link>
      ) : null}
    </div>
  );
}
