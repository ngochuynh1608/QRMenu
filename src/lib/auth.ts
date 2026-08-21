import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

function getSecret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "qrmenu-dev-secret-change-in-production",
  );
}

async function setSession(userId: string, email: string) {
  const token = await new SignJWT({ sub: userId, email })
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

export async function login(email: string, password: string) {
  const user = await prisma.adminUser.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user) return false;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return false;
  await setSession(user.id, user.email);
  return true;
}

export type UpdateAdminError = "current" | "email" | "short" | "unchanged";

export async function updateAdminAccount(params: {
  userId: string;
  email: string;
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: true } | { ok: false; error: UpdateAdminError }> {
  const user = await prisma.adminUser.findUnique({ where: { id: params.userId } });
  if (!user) return { ok: false, error: "current" };

  const passwordOk = await bcrypt.compare(params.currentPassword, user.passwordHash);
  if (!passwordOk) return { ok: false, error: "current" };

  const email = params.email.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "email" };
  }

  const emailChanged = email !== user.email.toLowerCase();
  const changingPassword = params.newPassword.length > 0;

  if (!emailChanged && !changingPassword) {
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

  const updated = await prisma.adminUser.update({
    where: { id: user.id },
    data: {
      email,
      ...(changingPassword ? { passwordHash: await bcrypt.hash(params.newPassword, 10) } : {}),
    },
  });

  await setSession(updated.id, updated.email);
  return { ok: true };
}

export async function logout() {
  (await cookies()).delete("session");
}

export async function getSession() {
  const token = (await cookies()).get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return { id: String(payload.sub), email: String(payload.email ?? "") };
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
