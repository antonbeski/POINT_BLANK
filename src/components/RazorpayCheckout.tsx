'use client';

import { useState } from 'react';
import { PaymentResponse, VerificationResponse } from '@/lib/types/razorpay';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface RazorpayCheckoutProps {
  amount: number;
  planName: string;
  planDescription?: string;
  userEmail?: string;
  userName?: string;
  onSuccess?: (response: PaymentResponse) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function RazorpayCheckout({
  amount,
  planName,
  planDescription = 'Premium Subscription',
  userEmail = '',
  userName = '',
  onSuccess,
  onError,
  className = '',
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Step 1: Create order on backend
      const token = localStorage.getItem('bearer_token');
      const orderResponse = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          notes: {
            plan: planName,
            description: planDescription,
          },
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const { orderId } = await orderResponse.json();

      // Step 2: Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        // Step 3: Open Razorpay checkout
        const razorpayOptions = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          order_id: orderId,
          amount: amount * 100, // in paise
          currency: 'INR',
          name: 'Point Blank Analytics',
          description: planDescription,
          prefill: {
            email: userEmail,
            name: userName,
          },
          handler: async (response: PaymentResponse) => {
            // Step 4: Verify payment on backend
            try {
              const verifyResponse = await fetch('/api/razorpay/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(response),
              });

              const verificationResult =
                (await verifyResponse.json()) as VerificationResponse;

              if (verificationResult.success) {
                toast.success('Payment successful!');
                onSuccess?.(response);
              } else {
                throw new Error(verificationResult.message);
              }
            } catch (err) {
              const error = err instanceof Error ? err : new Error(String(err));
              toast.error(`Payment verification failed: ${error.message}`);
              onError?.(error);
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              toast.info('Payment cancelled');
            },
          },
          theme: {
            color: '#ffffff',
          },
        };

        const razorpay = new window.Razorpay(razorpayOptions);
        razorpay.open();

        setLoading(false);
      };

      script.onerror = () => {
        throw new Error('Failed to load Razorpay script');
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
      onError?.(error);
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className={className}
    >
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </Button>
  );
}
