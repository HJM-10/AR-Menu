/**
 * src/api/menu.ts
 *
 * Menu API calls.
 *
 * Backend endpoints:
 *   GET /menu-items              — public, returns available items
 *   GET /menu-categories         — public, returns active categories
 *   GET /menu-items/admin/all    — requires content_admin+ token
 *
 * Backend MenuItem fields (from models/menu.py + schemas/menu.py):
 *   id, category_id, name, description, price (Decimal),
 *   image_url, model_3d_url, ar_enabled, is_available,
 *   preparation_time_minutes, rating_avg, rating_count,
 *   category: { id, name, description, display_order, is_active }
 */
import api from './client';

export interface BackendCategory {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

export interface BackendMenuItem {
  id: string;               // UUID
  category_id: string;      // UUID FK
  category: BackendCategory | null;
  name: string;
  description: string | null;
  price: string;            // Decimal serialised as string
  image_url: string | null;
  model_3d_url: string | null;
  ar_enabled: boolean;
  is_available: boolean;
  preparation_time_minutes: number | null;
  rating_avg: string;
  rating_count: number;
}

export async function getMenuItems(): Promise<{ data: BackendMenuItem[] }> {
  const res = await api.get<{ success: boolean; message: string; data: BackendMenuItem[] }>(
    '/menu-items'
  );
  return res.data;
}

export async function getCategories(): Promise<{ data: BackendCategory[] }> {
  const res = await api.get<{ success: boolean; message: string; data: BackendCategory[] }>(
    '/menu-categories'
  );
  return res.data;
}

/** Admin: fetch all items including unavailable ones */
export async function getAdminMenuItems(): Promise<{ data: BackendMenuItem[] }> {
  const res = await api.get<{ success: boolean; message: string; data: BackendMenuItem[] }>(
    '/menu-items/admin/all'
  );
  return res.data;
}
