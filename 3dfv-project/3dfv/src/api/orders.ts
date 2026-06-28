/**
 * src/api/orders.ts
 *
 * Order API calls.
 *
 * Backend endpoints:
 *   POST  /orders            — create order (auth optional)
 *   GET   /orders/my         — user's own orders (auth required)
 *   GET   /orders/admin/all  — all orders (order_manager+)
 *   PATCH /orders/{id}/status — update status (order_manager+)
 *
 * OrderCreate schema (from backend schemas/order.py):
 *   customer_name: str  (required)
 *   customer_phone: str (required)
 *   table_number: str | None
 *   qr_session_id: UUID | None
 *   special_instructions: str | None
 *   items: [{ menu_item_id?: UUID, deal_id?: UUID, quantity: int, notes?: str }]
 */
import api from './client';

export interface OrderItemPayload {
  menu_item_id?: string;   // UUID — exactly one of menu_item_id or deal_id
  deal_id?: string;
  quantity: number;
  custom_unit_price?: number;
  notes?: string;
}

export interface OrderCreatePayload {
  customer_name: string;
  customer_phone: string;
  table_number?: string;
  qr_session_id?: string;
  special_instructions?: string;
  items: OrderItemPayload[];
}

export interface BackendOrder {
  id: string;
  user_id: string | null;
  qr_session_id: string | null;
  customer_name: string;
  customer_phone: string;
  table_number: string | null;
  status: string;
  total_amount: string;
  special_instructions: string | null;
  created_at: string | null;
  updated_at: string | null;
  items: {
    id: string;
    menu_item_id: string | null;
    deal_id: string | null;
    quantity: number;
    unit_price: string;
    subtotal: string;
    notes: string | null;
  }[];
}

export async function createOrder(
  payload: OrderCreatePayload
): Promise<{ data: BackendOrder }> {
  const res = await api.post<{ success: boolean; message: string; data: BackendOrder }>(
    '/orders',
    payload
  );
  return res.data;
}

export async function getMyOrders(): Promise<{ data: BackendOrder[] }> {
  const res = await api.get<{ success: boolean; message: string; data: BackendOrder[] }>(
    '/orders/my'
  );
  return res.data;
}

export async function getAdminOrders(): Promise<{ data: BackendOrder[] }> {
  const res = await api.get<{ success: boolean; message: string; data: BackendOrder[] }>(
    '/orders/admin/all'
  );
  return res.data;
}
