/**
 * src/services/tokenStorage.ts
 *
 * Thin wrapper around expo-secure-store for JWT token management.
 * Falls back gracefully when SecureStore is unavailable (e.g. web).
 */
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'current_user';

function getBrowserStorage(): Storage | null {
  try {
    return typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage;
  } catch {
    return null;
  }
}

export async function saveToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (e) {
    getBrowserStorage()?.setItem(TOKEN_KEY, token);
    console.warn('[TokenStorage] saveToken failed', e);
  }
}

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return getBrowserStorage()?.getItem(TOKEN_KEY) ?? null;
  }
}

export async function clearToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch (e) {
    const storage = getBrowserStorage();
    storage?.removeItem(TOKEN_KEY);
    storage?.removeItem(USER_KEY);
    console.warn('[TokenStorage] clearToken failed', e);
  }
}

export async function saveUser(user: object): Promise<void> {
  try {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  } catch (e) {
    getBrowserStorage()?.setItem(USER_KEY, JSON.stringify(user));
    console.warn('[TokenStorage] saveUser failed', e);
  }
}

export async function getStoredUser<T>(): Promise<T | null> {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    const raw = getBrowserStorage()?.getItem(USER_KEY);
    if (raw) return JSON.parse(raw) as T;
    return null;
  }
}
