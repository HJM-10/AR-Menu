export type Flow =
  | 'splash'
  | 'onboarding'
  | 'auth'
  | 'otp'
  | 'admin'
  | 'home'
  | 'itemDetail'
  | 'arLanding'
  | 'qrScan'
  | 'cart'
  | 'checkout'
  | 'cardPayment'
  | 'thanks';

export type Category =
  | 'All'
  | 'Burgers'
  | 'Pizza'
  | 'Fries'
  | 'Wraps'
  | 'Sandwiches'
  | 'Drinks'
  | string; // allow dynamic categories from backend

/**
 * Frontend MenuItem — used throughout the UI.
 *
 * Adapter note: when fetching from the backend, map:
 *   image_url  → image
 *   category.name → category
 * Fields not in the backend (tags, pairingSuggestion) fall back to defaults.
 */
export type MenuItem = {
  id: string;              // UUID from backend
  name: string;
  category: Category;
  price: number;           // converted from backend Decimal string
  description: string;
  image: string;           // mapped from backend image_url
  tags: string[];          // not in backend — defaults to []
  pairingSuggestion: string; // not in backend — defaults to ''
  // Extra backend fields kept for admin operations
  category_id?: string;   // UUID FK — needed for edit/create
  image_url?: string;     // original backend field
  ar_enabled?: boolean;
  is_available?: boolean;
  model_3d_url?: string | null;
};

export type CartItem = {
  item: MenuItem;
  quantity: number;
  notes: string;
  portion: string;
  addons: string[];
};

/** Logged-in user info derived from backend /auth/me response */
export type LoggedInUser = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  is_active: boolean;
  role: string; // role.name — 'customer' | 'content_admin' | 'order_manager' | 'super_admin'
};
