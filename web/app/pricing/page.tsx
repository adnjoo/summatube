import { Suspense } from 'react';

import { PricingBody } from '@/app/pricing/PricingBody';
import { Plan, PricingCard } from '@/components/PricingCard';

const FREE_SUMMARY_LIMIT = 50;
const PRO_PLAN_MONTHLY_PRICE = 1;

const pricingOptions: Plan[] = [
  {
    id: 'free',
    title: 'Free Plan',
    description:
      'Get the essentials for free, perfect for quick summaries without breaking the bank (or... actually, just free!).',
    features: [
      `Store up to ${FREE_SUMMARY_LIMIT} brilliant summaries`,
      'Standard-speed summary magic 🪄',
      'Access to basic models',
    ],
    note: 'Great for casually curious users or folks who just love the word "free".',
    isPremium: false,
  },
  {
    id: 'pro',
    title: 'Pro Plan',
    description:
      'Step it up a notch! Get faster, better summaries with fancy premium models and priority support that actually answers you.',
    features: [
      'Limitless summary vault',
      'Lightning-fast processing speed (say goodbye to waiting) ⚡️',
      'Access to pro models for enhanced accuracy',
    ],
    note: 'Perfect for power-users and professionals who need summaries on the fly!',
    isPremium: true,
    price: `$${PRO_PLAN_MONTHLY_PRICE}/month (yep, just a buck!)`,
  },
];

export default function Pricing() {
  return (
    <div className='flex min-h-screen flex-col items-center py-8 sm:py-16'>
      <Suspense fallback={null}>
        <PricingBody />
      </Suspense>

      <div className='mx-auto flex max-w-4xl flex-wrap justify-center gap-8'>
        {pricingOptions.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}
