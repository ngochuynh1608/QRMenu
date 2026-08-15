import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

function getSecret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "qrmenu-dev-secret-change-in-production",
  );
}

export async function login(email: string, password: string) {
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) return false;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return false;

  const token = await new SignJWT({ sub: user.id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecret());

  (await cookies()).set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return true;
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
