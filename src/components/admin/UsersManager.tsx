"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  createAdminUserAction,
  deleteAdminUserAction,
  updateAdminUserAction,
} from "@/app/admin/actions";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { ROLE_ADMIN, ROLE_CONTENT } from "@/lib/roles";

export type AdminUserRow = {
  id: string;
  username: string;
  email: string;
  role: string;
};

const ROLE_LABEL: Record<string, string> = {
  [ROLE_ADMIN]: "Quản trị viên",
  [ROLE_CONTENT]: "Quản trị nội dung",
};

const inputClass =
  "mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-4 text-base text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none";

export function UsersManager({
  users,
  currentUserId,
}: {
  users: AdminUserRow[];
  currentUserId: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminUserRow | null>(null);

  return (
    <div className="space-y-4">
      <form
        action={createAdminUserAction}
        className="space-y-3 rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)]"
      >
        <h2 className="font-heading text-xl">Thêm tài khoản</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Tên tài khoản
            <input name="username" required minLength={3} maxLength={32} className={inputClass} />
          </label>
          <label className="text-sm font-medium">
            Email
            <input name="email" type="email" required className={inputClass} />
          </label>
          <label className="text-sm font-medium">
            Mật khẩu
            <input name="password" type="password" required minLength={8} className={inputClass} />
          </label>
          <label className="text-sm font-medium">
            Vai trò
            <select name="role" defaultValue={ROLE_CONTENT} className={inputClass}>
              <option value={ROLE_ADMIN}>Quản trị viên</option>
              <option value={ROLE_CONTENT}>Quản trị nội dung</option>
            </select>
          </label>
        </div>
        <p className="text-xs text-muted">
          Quản trị nội dung chỉ được thêm, sửa, xóa menu và quảng cáo.
        </p>
        <button
          type="submit"
          className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg bg-cta px-4 font-semibold text-white transition-colors duration-200 hover:bg-cta-dark"
        >
          Tạo tài khoản
        </button>
      </form>

      <ul className="space-y-3">
        {users.map((user) => {
          const isSelf = user.id === currentUserId;
          const editing = editingId === user.id;
          return (
            <li key={user.id} className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)]">
              {editing ? (
                <form action={updateAdminUserAction} className="space-y-3">
                  <input type="hidden" name="id" value={user.id} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm font-medium">
                      Tên tài khoản
                      <input
                        name="username"
                        required
                        minLength={3}
                        maxLength={32}
                        defaultValue={user.username}
                        className={inputClass}
                      />
                    </label>
                    <label className="text-sm font-medium">
                      Email
                      <input
                        name="email"
                        type="email"
                        required
                        defaultValue={user.email}
                        className={inputClass}
                      />
                    </label>
                    <label className="text-sm font-medium">
                      Mật khẩu mới
                      <input name="password" type="password" minLength={8} className={inputClass} />
                      <span className="mt-1 block text-xs text-muted">Để trống nếu giữ nguyên.</span>
                    </label>
                    <label className="text-sm font-medium">
                      Vai trò
                      <select name="role" defaultValue={user.role} className={inputClass}>
                        <option value={ROLE_ADMIN}>Quản trị viên</option>
                        <option value={ROLE_CONTENT}>Quản trị nội dung</option>
                      </select>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg bg-cta px-4 font-semibold text-white transition-colors duration-200 hover:bg-cta-dark"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg border-2 border-border px-4 font-medium text-muted transition-colors duration-200 hover:bg-background"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-heading text-xl">{user.username}</p>
                    <p className="text-sm text-muted">
                      {user.email} · {ROLE_LABEL[user.role] || user.role}
                      {isSelf ? " · tài khoản của bạn" : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(user.id)}
                      className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border-2 border-primary px-3 font-medium text-primary transition-colors duration-200 hover:bg-primary hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                      Sửa
                    </button>
                    <button
                      type="button"
                      disabled={isSelf}
                      onClick={() => setPendingDelete(user)}
                      className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border-2 border-primary px-3 font-medium text-primary transition-colors duration-200 hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xóa
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <ConfirmDeleteDialog
        open={Boolean(pendingDelete)}
        title={`Xóa tài khoản ${pendingDelete?.username ?? ""}`}
        description="Tài khoản sẽ bị xóa vĩnh viễn."
        onClose={() => setPendingDelete(null)}
        action={deleteAdminUserAction}
        hiddenFields={pendingDelete ? { id: pendingDelete.id } : undefined}
      />
    </div>
  );
}
