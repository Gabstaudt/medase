import { AuthUser, UserRole } from "./types";

const USER_STORAGE_KEY = "medase:user";

export function getCurrentUser(): AuthUser | null {
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function hasRole(role: UserRole): boolean {
  return getCurrentUser()?.role === role;
}

export function isSecretary(): boolean {
  return hasRole("SECRETARIA");
}

export function isAdmin(): boolean {
  return hasRole("ADMIN");
}

export function getDefaultRouteForUser(): string {
  const user = getCurrentUser();

  if (!user) return "/login";
  if (user.role === "SECRETARIA") return "/secretary";

  return "/dashboard";
}

export function logout(): void {
  localStorage.removeItem(USER_STORAGE_KEY);
  sessionStorage.clear();
}
