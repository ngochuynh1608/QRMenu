export const ROLE_ADMIN = "admin";
export const ROLE_CONTENT = "content";

export type AdminRole = typeof ROLE_ADMIN | typeof ROLE_CONTENT;

const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function isValidUsername(value: string) {
  return USERNAME_RE.test(value);
}

export function isValidEmail(value: string) {
  return EMAIL_RE.test(value);
}

export function parseAdminRole(value: string): AdminRole | null {
  if (value === ROLE_ADMIN || value === ROLE_CONTENT) return value;
  return null;
}

export function isAdmin(session: { role: string }) {
  return session.role === ROLE_ADMIN;
}
