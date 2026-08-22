import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth";
import { UsersManager } from "@/components/admin/UsersManager";

const ERRORS: Record<string, string> = {
  username: "Tên tài khoản không hợp lệ hoặc đã được sử dụng (3–32 ký tự: a-z, 0-9, . _ -).",
  email: "Email không hợp lệ hoặc đã được sử dụng.",
  short: "Mật khẩu phải có ít nhất 8 ký tự.",
  role: "Vai trò không hợp lệ.",
  lastadmin: "Phải còn ít nhất một tài khoản quản trị viên.",
  self: "Không thể xóa tài khoản đang đăng nhập.",
  missing: "Không tìm thấy tài khoản.",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string; saved?: string; deleted?: string }>;
}) {
  const session = await requireAdminPage();
  const users = await prisma.adminUser.findMany({
    orderBy: [{ role: "asc" }, { username: "asc" }],
    select: { id: true, username: true, email: true, role: true },
  });
  const { error, created, saved, deleted } = await searchParams;
  const errorMessage = error ? ERRORS[error] || "Không cập nhật được tài khoản." : "";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="font-heading text-3xl">Người dùng</h1>
        <p className="mt-1 text-muted">
          Quản trị viên có toàn quyền. Quản trị nội dung chỉ sửa menu và quảng cáo.
        </p>
      </div>
      {created ? (
        <p className="rounded-lg bg-cta/10 px-3 py-2 text-sm text-cta-dark">Đã tạo tài khoản.</p>
      ) : null}
      {saved ? (
        <p className="rounded-lg bg-cta/10 px-3 py-2 text-sm text-cta-dark">Đã cập nhật tài khoản.</p>
      ) : null}
      {deleted ? (
        <p className="rounded-lg bg-cta/10 px-3 py-2 text-sm text-cta-dark">Đã xóa tài khoản.</p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">{errorMessage}</p>
      ) : null}
      <UsersManager users={users} currentUserId={session.id} />
    </div>
  );
}
