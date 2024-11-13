import CheckoutButton from '@/components/CheckoutButton';

export default function Pricing() {
  return (
    <div className='mx-auto max-w-4xl px-4 py-12'>
      <CheckoutButton priceId={process.env.TEST_ID} />
    </div>
  );
}
