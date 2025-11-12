export interface RazorpayOrder {
  id: string;
  entity: 'order';
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: 'created' | 'paid' | 'attempted';
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  entity: 'payment';
  amount: number;
  currency: string;
  status: 'authorized' | 'captured' | 'failed' | 'refunded';
  method: 'card' | 'netbanking' | 'wallet' | 'upi' | 'emandate';
  description: string;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  email: string;
  contact: string;
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;
  notes: Record<string, any>;
  order_id: string | null;
  created_at: number;
}

export interface RazorpayWebhookPayload {
  id: string;
  entity: 'event';
  event: string;
  contains: string[];
  payload: {
    order?: {
      entity: Partial<RazorpayOrder>;
    };
    payment?: {
      entity: Partial<RazorpayPayment>;
    };
    subscription?: {
      entity: any;
    };
  };
  created_at: number;
}

export interface CheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name?: string;
  description?: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: PaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface PaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  orderId?: string;
  paymentId?: string;
}

export interface CreateOrderRequest {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

// Declare Razorpay on window for client-side
declare global {
  interface Window {
    Razorpay: any;
  }
}
