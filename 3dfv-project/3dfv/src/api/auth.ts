/**
 * src/api/auth.ts
 *
 * Authentication API calls.
 *
 * Backend endpoints:
 *   POST /auth/login    — { email, password } → { success, data: { access_token, token_type, user } }
 *   POST /auth/register — { email, full_name, phone?, password } → { success, data: user }
 *   GET  /auth/me       — (requires Bearer token) → { success, data: user }
 */
import api from './client';

export interface BackendUser {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  is_active: boolean;
  role_id: string;
  role: { id: string; name: string; description: string | null } | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: BackendUser;
}

export async function login(email: string, password: string): Promise<{ data: LoginResponse }> {
  const res = await api.post<{ success: boolean; message: string; data: LoginResponse }>(
    '/auth/login',
    { email, password }
  );
  return res.data;
}

export async function loginWithGoogle(idToken: string): Promise<{ data: LoginResponse }> {
  const res = await api.post<{ success: boolean; message: string; data: LoginResponse }>(
    '/auth/google',
    { id_token: idToken }
  );
  return res.data;
}

export async function register(
  full_name: string,
  email: string,
  password: string,
  phone?: string
): Promise<{ data: BackendUser }> {
  const res = await api.post<{ success: boolean; message: string; data: BackendUser }>(
    '/auth/register',
    { full_name, email, password, ...(phone ? { phone } : {}) }
  );
  return res.data;
}

export async function getMe(): Promise<{ data: BackendUser }> {
  const res = await api.get<{ success: boolean; message: string; data: BackendUser }>(
    '/auth/me'
  );
  return res.data;
}
