import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { updateAdminAccountAction } from "@/app/admin/actions";

const ERRORS: Record<string, string> = {
  current: "Mật khẩu hiện tại không đúng.",
  email: "Email không hợp lệ hoặc đã được sử dụng.",
  mismatch: "Mật khẩu mới và xác nhận không khớp.",
  short: "Mật khẩu mới phải có ít nhất 8 ký tự.",
  unchanged: "Không có thay đổi nào để lưu.",
};

export default async function AdminAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const user = await prisma.adminUser.findUnique({ where: { id: session.id } });
  if (!user) redirect("/admin/login");

  const { error, saved } = await searchParams;
  const errorMessage = error ? ERRORS[error] || "Không cập nhật được tài khoản." : "";

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="font-heading text-3xl">Tài khoản</h1>
        <p className="mt-1 text-muted">Đổi email đăng nhập và mật khẩu admin.</p>
      </div>

      <div className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)]">
        {saved ? (
          <p className="mb-4 rounded-lg bg-cta/10 px-3 py-2 text-sm text-cta-dark">
            Đã cập nhật thông tin đăng nhập.
          </p>
        ) : null}
        {errorMessage ? (
          <p className="mb-4 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">{errorMessage}</p>
        ) : null}

        <form action={updateAdminAccountAction} className="space-y-4">
          <label className="block text-sm font-medium">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              defaultValue={user.email}
              className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </label>

          <label className="block text-sm font-medium">
            Mật khẩu hiện tại
            <input
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
            <span className="mt-1 block text-xs text-muted">
              Bắt buộc để xác nhận khi đổi email hoặc mật khẩu.
            </span>
          </label>

          <label className="block text-sm font-medium">
            Mật khẩu mới
            <input
              name="newPassword"
              type="password"
              minLength={8}
              autoComplete="new-password"
              className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
            <span className="mt-1 block text-xs text-muted">
              Để trống nếu chỉ đổi email. Tối thiểu 8 ký tự.
            </span>
          </label>

          <label className="block text-sm font-medium">
            Xác nhận mật khẩu mới
            <input
              name="confirmPassword"
              type="password"
              minLength={8}
              autoComplete="new-password"
              className="mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </label>

          <button
            type="submit"
            className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg bg-cta px-4 font-semibold text-white transition-colors duration-200 hover:bg-cta-dark"
          >
            Lưu tài khoản
          </button>
        </form>
      </div>
    </div>
  );
}
