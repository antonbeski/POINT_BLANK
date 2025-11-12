import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PaymentResponse, VerificationResponse } from '@/lib/types/razorpay';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' } as VerificationResponse,
        { status: 401 }
      );
    }

    const body = (await request.json()) as PaymentResponse;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Verify signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    if (!keySecret) {
      return NextResponse.json(
        { success: false, message: 'Payment system not configured' } as VerificationResponse,
        { status: 500 }
      );
    }

    // Create expected signature
    const shasum = crypto.createHmac('sha256', keySecret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = shasum.digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid signature' } as VerificationResponse,
        { status: 400 }
      );
    }

    // Signature verified - payment is genuine
    // TODO: Update your database with payment details here
    console.log('Payment verified for user:', user.email, {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified',
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    } as VerificationResponse);
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Verification failed' } as VerificationResponse,
      { status: 500 }
    );
  }
}
