import { AuthUser, UserRole } from "./types";

const USER_STORAGE_KEY = "medase:user";
const TOKEN_STORAGE_KEY = "medase:access_token";

type BackendUserRole =
  | "user"
  | "superuser"
  | "admin"
  | "secretaria"
  | "medico";

type BackendUserResponse = {
  usuario_id: number;
  nome: string;
  telefone: string;
  email: string;
  role: BackendUserRole;
};

export type RegisterPayload = {
  email: string;
  senha: string;
  nome: string;
  telefone: string;
  role: Exclude<BackendUserRole, "admin" | "superuser" | "user">;
  registro_profissional?: string;
  especialidade_principal?: string;
  instituicao?: string;
  universidade?: string;
  ano_formacao?: number;
  residencia_medica?: string;
  especializacoes?: string[];
};

function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
}

function normalizeRole(role: BackendUserRole): UserRole | null {
  if (role === "secretaria") return "SECRETARIA";
  if (role === "admin" || role === "superuser" || role === "medico") return "ADMIN";
  return null;
}

function normalizeBackendUser(user: BackendUserResponse): AuthUser {
  const normalizedRole = normalizeRole(user.role);

  if (!normalizedRole) {
    throw new Error("O perfil desse usuário não possui acesso ao Medase.");
  }

  return {
    id: user.usuario_id,
    name: user.nome,
    email: user.email,
    phone: user.telefone,
    role: normalizedRole,
    backendRole: user.role,
  };
}

function persistSession(accessToken: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

async function parseResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const detail =
      typeof payload?.detail === "string"
        ? payload.detail
        : Array.isArray(payload?.detail) && payload.detail.length > 0
          ? payload.detail[0]?.msg || fallbackMessage
          : fallbackMessage;

    throw new Error(detail);
  }

  return payload as T;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

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
  return getCurrentUser() !== null && getAccessToken() !== null;
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
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.clear();
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const loginResponse = await fetch(`${getApiBaseUrl()}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username: email,
      password,
    }).toString(),
  });

  const tokenPayload = await parseResponse<{ access_token: string; token_type: string }>(
    loginResponse,
    "Nao foi possivel realizar o login.",
  );

  const currentUserResponse = await fetch(`${getApiBaseUrl()}/users/eu`, {
    headers: {
      Authorization: `Bearer ${tokenPayload.access_token}`,
    },
  });

  const backendUser = await parseResponse<BackendUserResponse>(
    currentUserResponse,
    "Nao foi possivel carregar o usuario autenticado.",
  );

  const user = normalizeBackendUser(backendUser);
  persistSession(tokenPayload.access_token, user);

  return user;
}

export async function registerAccount(payload: RegisterPayload): Promise<AuthUser> {
  const response = await fetch(`${getApiBaseUrl()}/users/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  await parseResponse<BackendUserResponse>(
    response,
    "Nao foi possivel concluir o cadastro.",
  );

  return login(payload.email, payload.senha);
}
