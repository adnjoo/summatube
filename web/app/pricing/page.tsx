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
      'Access essential features with basic models, perfect for quick and simple summaries.',
    features: [
      `Save up to ${FREE_SUMMARY_LIMIT} summaries`,
      'Standard summary generation speed',
      'Access to basic models',
      'Basic customer support',
    ],
    note: 'Great for casual users looking to explore summary features.',
    isPremium: false,
  },
  {
    id: 'pro',
    title: 'Pro Plan',
    description:
      'Unlock advanced features, faster processing, and access to premium models for high-quality summaries.',
    features: [
      'Unlimited summary storage',
      'Faster processing speed',
      'Access to pro models for enhanced accuracy',
      'Priority customer support',
    ],
    note: 'Perfect for professionals who need high-quality, reliable summaries.',
    isPremium: true,
    price: `$${PRO_PLAN_MONTHLY_PRICE}/month`,
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
