import CheckoutButton from '@/components/CheckoutButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type Plan = {
  id: string;
  title: string;
  description: string;
  features: string[];
  note: string;
  isPremium: boolean;
  price?: string;
};

type PricingCardProps = {
  plan: Plan;
};

export function PricingCard({ plan }: PricingCardProps) {
  const { title, description, features, note, isPremium, price } = plan;

  return (
    <Card className='flex w-full max-w-sm flex-col rounded-lg bg-white p-6 shadow-lg'>
      <CardHeader>
        <CardTitle className='text-center text-2xl font-semibold'>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col items-center'>
        <p className='mb-4 text-center text-gray-600'>{description}</p>
        <ul className='mb-4 space-y-2 text-gray-600'>
          {features.map((feature, index) => (
            <li key={index} className='flex items-center'>
              <span className='mr-2'>✔️</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <p className='mb-4 text-center text-sm text-gray-500'>{note}</p>
        {isPremium && (
          <div className='flex flex-col items-center'>
            <span className='mb-2 text-lg font-bold text-gray-700'>
              {price}
            </span>
            <CheckoutButton
              priceId={process.env.NEXT_PUBLIC_TEST_ID as string}
              className='w-full max-w-xs rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700'
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
