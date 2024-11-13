import { PricingBody } from '@/app/(marketing)/pricing/PricingBody';
import CheckoutButton from '@/components/CheckoutButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Pricing() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-100'>
      <PricingBody />
      <Card className='mx-auto w-full max-w-lg rounded-lg bg-white p-6 shadow-lg'>
        <CardHeader>
          <CardTitle className='text-center text-2xl font-semibold'>
            Premium Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='mb-4 text-center text-gray-600'>
            Unlock exclusive features and support by subscribing to our premium
            plan.
          </p>
          <div className='flex justify-center'>
            <CheckoutButton priceId={process.env.NEXT_PUBLIC_TEST_ID} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
