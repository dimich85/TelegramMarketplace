import { apiRequest } from "./queryClient";

export interface CreateInvoiceResponse {
  success: boolean;
  invoice_id: string;
  pay_url: string;
  url_callback: string;
  expire_at: string;
  status: string;
}

export interface InvoiceStatusResponse {
  success: boolean;
  status: 'created' | 'paid' | 'expired' | 'cancel';
  amount: string;
  currency: string;
  order_id: string;
}

/**
 * Creates a payment invoice through the server API
 * @param amount The amount to top up (minimum 10)
 * @param userId The user ID
 * @returns The invoice data with payment URL
 */
export async function createInvoice(amount: number, userId: number): Promise<CreateInvoiceResponse> {
  const response = await apiRequest('POST', '/api/topup/create', {
    amount,
    userId
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create invoice');
  }
  
  return await response.json();
}

/**
 * Checks the status of a payment invoice
 * @param orderId The order ID to check
 * @returns The status of the invoice
 */
export async function checkInvoiceStatus(orderId: string): Promise<InvoiceStatusResponse> {
  const response = await apiRequest('GET', `/api/topup/status/${orderId}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to check invoice status');
  }
  
  return await response.json();
}

/**
 * Opens the payment URL in a new window/tab
 * @param payUrl The payment URL from CryptoCloud
 */
export function openPaymentUrl(payUrl: string): void {
  window.open(payUrl, '_blank');
}
