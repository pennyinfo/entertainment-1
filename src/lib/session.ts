// Simple localStorage session helpers — NO real auth (per user request).
export type UserSession = { userId: string; name: string };
export type AdminSession = { adminId: string; mobile: string };
export type SuperAdminSession = { superAdminId: string; email: string };

const KEY_USER = "ft_user";
const KEY_ADMIN = "ft_admin";
const KEY_SUPER = "ft_super";

const isBrowser = () => typeof window !== "undefined";

export const userSession = {
  get(): UserSession | null {
    if (!isBrowser()) return null;
    const v = localStorage.getItem(KEY_USER);
    return v ? JSON.parse(v) : null;
  },
  set(s: UserSession) {
    localStorage.setItem(KEY_USER, JSON.stringify(s));
  },
  clear() {
    localStorage.removeItem(KEY_USER);
  },
};

export const adminSession = {
  get(): AdminSession | null {
    if (!isBrowser()) return null;
    const v = localStorage.getItem(KEY_ADMIN);
    return v ? JSON.parse(v) : null;
  },
  set(s: AdminSession) {
    localStorage.setItem(KEY_ADMIN, JSON.stringify(s));
  },
  clear() {
    localStorage.removeItem(KEY_ADMIN);
  },
};

export const superAdminSession = {
  get(): SuperAdminSession | null {
    if (!isBrowser()) return null;
    const v = localStorage.getItem(KEY_SUPER);
    return v ? JSON.parse(v) : null;
  },
  set(s: SuperAdminSession) {
    localStorage.setItem(KEY_SUPER, JSON.stringify(s));
  },
  clear() {
    localStorage.removeItem(KEY_SUPER);
  },
};
