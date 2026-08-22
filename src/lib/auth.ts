import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import {
  isAdmin,
  isValidEmail,
  isValidUsername,
  normalizeUsername,
  ROLE_ADMIN,
  ROLE_CONTENT,
  type AdminRole,
} from "./roles";

export {
  isAdmin,
  isValidEmail,
  isValidUsername,
  normalizeUsername,
  parseAdminRole,
  ROLE_ADMIN,
  ROLE_CONTENT,
} from "./roles";
export type { AdminRole } from "./roles";

export type Session = {
  id: string;
  email: string;
  username: string;
  role: AdminRole;
};

function getSecret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "qrmenu-dev-secret-change-in-production",
  );
}

function toSession(user: { id: string; email: string; username: string; role: string }): Session {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role === ROLE_CONTENT ? ROLE_CONTENT : ROLE_ADMIN,
  };
}

async function setSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecret());

  (await cookies()).set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function login(account: string, password: string) {
  const value = account.trim().toLowerCase();
  if (!value) return false;
  const user = await prisma.adminUser.findFirst({
    where: {
      OR: [{ email: value }, { username: value }],
    },
  });
  if (!user) return false;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return false;
  await setSession(user.id);
  return true;
}

export type UpdateAdminError = "current" | "email" | "username" | "short" | "unchanged";

export async function updateAdminAccount(params: {
  userId: string;
  username: string;
  email: string;
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: true } | { ok: false; error: UpdateAdminError }> {
  const user = await prisma.adminUser.findUnique({ where: { id: params.userId } });
  if (!user) return { ok: false, error: "current" };

  const passwordOk = await bcrypt.compare(params.currentPassword, user.passwordHash);
  if (!passwordOk) return { ok: false, error: "current" };

  const email = params.email.trim().toLowerCase();
  if (!email || !isValidEmail(email)) {
    return { ok: false, error: "email" };
  }

  const username = normalizeUsername(params.username);
  if (!isValidUsername(username)) {
    return { ok: false, error: "username" };
  }

  const emailChanged = email !== user.email.toLowerCase();
  const usernameChanged = username !== user.username.toLowerCase();
  const changingPassword = params.newPassword.length > 0;

  if (!emailChanged && !usernameChanged && !changingPassword) {
    return { ok: false, error: "unchanged" };
  }

  if (changingPassword && params.newPassword.length < 8) {
    return { ok: false, error: "short" };
  }

  if (emailChanged) {
    const taken = await prisma.adminUser.findFirst({
      where: { email, NOT: { id: user.id } },
    });
    if (taken) return { ok: false, error: "email" };
  }

  if (usernameChanged) {
    const taken = await prisma.adminUser.findFirst({
      where: { username, NOT: { id: user.id } },
    });
    if (taken) return { ok: false, error: "username" };
  }

  const updated = await prisma.adminUser.update({
    where: { id: user.id },
    data: {
      email,
      username,
      ...(changingPassword ? { passwordHash: await bcrypt.hash(params.newPassword, 10) } : {}),
    },
  });

  await setSession(updated.id);
  return { ok: true };
}

export type ForgotPasswordError = "invalid" | "short" | "unconfigured";

export async function resetPasswordWithBackup(params: {
  username: string;
  backupPassword: string;
  newPassword: string;
}): Promise<{ ok: true } | { ok: false; error: ForgotPasswordError }> {
  const expected = process.env.ADMIN_BACKUP_PASSWORD ?? "";
  if (!expected) return { ok: false, error: "unconfigured" };
  if (params.newPassword.length < 8) return { ok: false, error: "short" };

  const username = normalizeUsername(params.username);
  const backupOk = params.backupPassword === expected;
  const user = username ? await prisma.adminUser.findUnique({ where: { username } }) : null;
  if (!backupOk || !user) return { ok: false, error: "invalid" };

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(params.newPassword, 10) },
  });
  return { ok: true };
}

export async function logout() {
  (await cookies()).delete("session");
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const id = String(payload.sub ?? "");
    if (!id) return null;
    const user = await prisma.adminUser.findUnique({ where: { id } });
    if (!user) return null;
    return toSession(user);
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (!isAdmin(session)) {
    throw new Error("Forbidden");
  }
  return session;
}

export async function requireAdminPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!isAdmin(session)) redirect("/admin");
  return session;
}
