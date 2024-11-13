'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Stripe } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
) as Promise<Stripe>;

export default function CheckoutButton({ priceId }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId }),
    });

    const { sessionId } = await response.json();
    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId });

    setLoading(false);
  };

  return (
    <Button onClick={handleCheckout} disabled={loading} className='w-full'>
      {loading ? <Loader2 className='animate-spin' /> : 'Subscribe Now'}
    </Button>
  );
}
