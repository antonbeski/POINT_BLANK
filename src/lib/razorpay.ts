import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

if (!keyId || !keySecret) {
  console.warn('Razorpay API keys not configured. Payment features will not work.');
}

export const razorpay = keyId && keySecret ? new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
}) : null;

export const getRazorpayPublicKey = () => {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
};
