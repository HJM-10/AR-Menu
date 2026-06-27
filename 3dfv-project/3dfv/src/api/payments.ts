/**
 * src/api/payments.ts
 *
 * Payment API calls.
 *
 * Backend endpoints:
 *   GET  /payments/gateways  — list active payment gateways (public)
 *   POST /payments           — create a payment record (auth required)
 *
 * PaymentCreate schema (from backend schemas/payment.py):
 *   order_id: UUID
 *   gateway_id: UUID
 *   amount: Decimal
 *   reference?: str
 */
import api from './client';

export interface PaymentGateway {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
}

export interface PaymentCreatePayload {
  order_id: string;    // UUID of the order
  gateway_id: string;  // UUID of the payment gateway
  amount: number;
  currency?: string;   // defaults to 'PKR' on backend, but send it explicitly
  reference?: string;
}

export interface BackendPayment {
  id: string;
  order_id: string;
  gateway_id: string;
  amount: string;
  currency: string;
  status: string;
  gateway_payment_id: string | null;
  payment_method: string | null;
  raw_response: object | null;
}

export async function getGateways(): Promise<{ data: PaymentGateway[] }> {
  const res = await api.get<{ success: boolean; message: string; data: PaymentGateway[] }>(
    '/payments/gateways'
  );
  return res.data;
}

export async function createPayment(
  payload: PaymentCreatePayload
): Promise<{ data: BackendPayment }> {
  const res = await api.post<{ success: boolean; message: string; data: BackendPayment }>(
    '/payments',
    payload
  );
  return res.data;
}
