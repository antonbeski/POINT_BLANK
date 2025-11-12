"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { RazorpayCheckout } from "@/components/RazorpayCheckout";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { PaymentResponse } from "@/lib/types/razorpay";

const pricingPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      '5 stock analyses per day',
      'Basic charts and indicators',
      '30-day analysis history',
      'Standard support',
    ],
    limitations: [
      'No portfolio tracking',
      'No advanced indicators',
      'Limited watchlist (10 stocks)',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 999,
    description: 'For serious traders and investors',
    features: [
      'Unlimited stock analyses',
      'Advanced charts and all indicators',
      'Unlimited analysis history',
      'Portfolio tracking with P/L',
      'Unlimited watchlist',
      'Priority support',
      'Export to CSV/PDF',
      'Real-time alerts',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 4999,
    description: 'For teams and institutions',
    features: [
      'Everything in Pro',
      'Team collaboration (up to 10 users)',
      'API access',
      'Custom indicators',
      'Dedicated account manager',
      'Advanced analytics',
      'White-label options',
      '24/7 premium support',
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [processingPlan, setProcessingPlan] = React.useState<string | null>(null);

  const handleSelectPlan = (planId: string, price: number) => {
    if (!session?.user) {
      router.push(`/login?redirect=${encodeURIComponent('/pricing')}`);
      return;
    }

    if (price === 0) {
      // Free plan - no payment needed
      router.push('/');
      return;
    }

    setProcessingPlan(planId);
  };

  const handlePaymentSuccess = (response: PaymentResponse, planId: string) => {
    console.log('Payment successful:', response);
    setProcessingPlan(null);
    router.push('/?payment=success');
  };

  const handlePaymentError = (error: Error) => {
    console.error('Payment error:', error);
    setProcessingPlan(null);
  };

  return (
    <div className="min-h-dvh w-full bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/60 bg-background/60 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-[120rem] px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <h1 className="text-xl font-heading font-bold">POINT BLANK</h1>
              <span className="text-xs text-muted-foreground">Market Intelligence</span>
            </Link>

            <div className="flex items-center gap-3">
              {!isPending && !session?.user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/login")}
                >
                  Sign in
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Pricing Content */}
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock powerful market intelligence tools. Start with our free plan or upgrade for unlimited access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl ring-1 bg-card/60 backdrop-blur p-8 relative ${
                plan.popular
                  ? 'ring-2 ring-foreground shadow-[0_20px_80px_rgba(255,255,255,0.1)]'
                  : 'ring-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-heading font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-heading font-bold">₹{plan.price}</span>
                  {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
                </div>
              </div>

              <div className="mb-8">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <Check className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.limitations?.map((limitation, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="h-5 w-5 flex-shrink-0 mt-0.5 text-center">—</span>
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.price === 0 ? (
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSelectPlan(plan.id, plan.price)}
                >
                  Get Started Free
                </Button>
              ) : processingPlan === plan.id && session?.user ? (
                <RazorpayCheckout
                  amount={plan.price}
                  planName={plan.name}
                  planDescription={`${plan.name} Plan - Point Blank Analytics`}
                  userEmail={session.user.email || ''}
                  userName={session.user.name || ''}
                  onSuccess={(response) => handlePaymentSuccess(response, plan.id)}
                  onError={handlePaymentError}
                  className="w-full"
                />
              ) : (
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSelectPlan(plan.id, plan.price)}
                >
                  {session?.user ? 'Select Plan' : 'Sign in to Subscribe'}
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            All plans include secure payments powered by Razorpay
          </p>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            ← Back to dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-background/60 px-4 py-6 sm:px-6 mt-12">
        <div className="mx-auto flex max-w-[120rem] flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Point Blank Analytics. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-foreground transition">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground transition">
              Status
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
