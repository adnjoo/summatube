'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Stripe } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { AppConfig } from '@/lib/constants';
import { useUser } from '@/lib/hooks';
import { cn } from '@/lib/utils';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
) as Promise<Stripe>;

interface CheckoutButtonProps {
  priceId: string;
  className?: string;
}

export default function CheckoutButton({
  priceId,
  className,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const user = useUser();

  const handleCheckout = async () => {
    setLoading(true);

    const response = await fetch(
      AppConfig.SITE_MAP.API.CREATE_CHECKOUT_SESSION,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      }
    );

    const { sessionId } = await response.json();
    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId });

    setLoading(false);
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading || !user}
      className={cn('w-full', className)}
    >
      {loading ? (
        <Loader2 className='animate-spin' />
      ) : user ? (
        'Checkout'
      ) : (
        'Sign In to Purchase'
      )}
    </Button>
  );
}
