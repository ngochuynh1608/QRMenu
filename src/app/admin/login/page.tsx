import Link from "next/link";
import { ChefHat } from "lucide-react";
import { loginAction } from "../actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const { error, reset } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-[var(--shadow-card)]">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
            <ChefHat className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-heading text-2xl">Đăng nhập admin</h1>
            <p className="text-sm text-muted">Quản lý nhà hàng, menu và ngôn ngữ</p>
          </div>
        </div>
        {reset ? (
          <p className="mb-4 rounded-lg bg-cta/10 px-3 py-2 text-sm text-cta-dark">
            Đã đặt lại mật khẩu. Đăng nhập bằng mật khẩu mới.
          </p>
        ) : null}
        {error ? (
          <p className="mb-4 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
            Tài khoản hoặc mật khẩu không đúng.
          </p>
        ) : null}
        <form action={loginAction} className="space-y-4">
          <label className="block text-sm font-medium">
            Tài khoản
            <input
              name="account"
              type="text"
              required
              autoComplete="username"
              className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
            <span className="mt-1 block text-xs text-muted">Tên đăng nhập hoặc email.</span>
          </label>
          <label className="block text-sm font-medium">
            Mật khẩu
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-lg bg-cta font-semibold text-white transition-colors duration-200 hover:bg-cta-dark"
          >
            Đăng nhập
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link href="/admin/forgot" className="font-medium text-primary hover:underline">
            Quên mật khẩu?
          </Link>
        </p>
      </div>
    </main>
  );
}
