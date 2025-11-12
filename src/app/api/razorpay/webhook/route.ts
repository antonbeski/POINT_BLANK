import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { RazorpayWebhookPayload } from '@/lib/types/razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    
    if (!webhookSecret) {
      console.warn('RAZORPAY_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(body);
    const expectedSignature = shasum.digest('hex');

    if (expectedSignature !== signature) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Signature verified, process webhook
    const payload = JSON.parse(body) as RazorpayWebhookPayload;

    switch (payload.event) {
      case 'payment.authorized':
        console.log('Payment authorized:', payload.payload.payment?.entity);
        break;

      case 'payment.captured':
        const payment = payload.payload.payment?.entity;
        console.log('Payment captured:', payment?.id);
        // TODO: Update database, send confirmation email, etc.
        break;

      case 'payment.failed':
        console.log('Payment failed:', payload.payload.payment?.entity);
        break;

      case 'order.paid':
        console.log('Order paid:', payload.payload.order?.entity);
        break;

      case 'refund.created':
        console.log('Refund created:', payload.payload.payment?.entity);
        break;

      default:
        console.log('Unhandled event:', payload.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
