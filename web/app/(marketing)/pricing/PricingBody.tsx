'use client';

import { useSearchParams } from 'next/navigation';

export const PricingBody = () => {
  const searchParams = useSearchParams();

  const status = searchParams.get('status');
  return (
    <div className='mx-auto mb-4 w-full max-w-lg px-4'>
      {status === 'success' && (
        <div className='mb-4 rounded-lg border border-green-200 bg-green-100 p-4 text-center text-green-800'>
          🎉 Payment successful! Thank you for subscribing.
        </div>
      )}
      {status === 'cancel' && (
        <div className='mb-4 rounded-lg border border-red-200 bg-red-100 p-4 text-center text-red-800'>
          Payment was canceled. Please try again if you'd like to subscribe.
        </div>
      )}
    </div>
  );
};
