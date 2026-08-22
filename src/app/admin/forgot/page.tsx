import Link from "next/link";
import { ChefHat } from "lucide-react";
import { forgotPasswordAction } from "../actions";

const ERRORS: Record<string, string> = {
  invalid: "Tên tài khoản hoặc mật khẩu dự phòng không đúng.",
  mismatch: "Mật khẩu mới và xác nhận không khớp.",
  short: "Mật khẩu mới phải có ít nhất 8 ký tự.",
  unconfigured: "Chưa cấu hình mật khẩu dự phòng trên máy chủ.",
};

export default async function AdminForgotPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error ? ERRORS[error] || "Không đặt lại được mật khẩu." : "";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-[var(--shadow-card)]">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
            <ChefHat className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-heading text-2xl">Quên mật khẩu</h1>
            <p className="text-sm text-muted">Đặt lại bằng tên tài khoản và mật khẩu dự phòng.</p>
          </div>
        </div>
        {errorMessage ? (
          <p className="mb-4 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">{errorMessage}</p>
        ) : null}
        <form action={forgotPasswordAction} className="space-y-4">
          <label className="block text-sm font-medium">
            Tên tài khoản
            <input
              name="username"
              type="text"
              required
              autoComplete="username"
              className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium">
            Mật khẩu dự phòng
            <input
              name="backupPassword"
              type="password"
              required
              autoComplete="off"
              className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium">
            Mật khẩu mới
            <input
              name="newPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium">
            Xác nhận mật khẩu mới
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-lg bg-cta font-semibold text-white transition-colors duration-200 hover:bg-cta-dark"
          >
            Đặt lại mật khẩu
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link href="/admin/login" className="font-medium text-primary hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </main>
  );
}
