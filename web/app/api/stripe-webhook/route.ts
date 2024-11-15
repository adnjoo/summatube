// app/api/stripe-webhook/route.ts
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side context
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// import {
//   deletePriceRecord,
//   deleteProductRecord,
//   manageSubscriptionStatusChange,
//   upsertPriceRecord,
//   upsertProductRecord,
// } from '@/utils/supabase/admin';

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'product.deleted',
  'price.created',
  'price.updated',
  'price.deleted',
  'checkout.session.completed',
  'customer.created',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'charge.succeeded',
  'payment_intent.created',
  'payment_intent.succeeded',
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  try {
    if (!sig || !webhookSecret)
      return new Response('Webhook secret not found.', { status: 400 });
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log(`🔔  Webhook received: ${event.type}`);
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'product.created':
        case 'product.updated':
          //   await upsertProductRecord(event.data.object as Stripe.Product);
          break;
        case 'price.created':
        case 'price.updated':
          //   await upsertPriceRecord(event.data.object as Stripe.Price);
          break;
        case 'price.deleted':
          //   await deletePriceRecord(event.data.object as Stripe.Price);
          break;
        case 'product.deleted':
          //   await deleteProductRecord(event.data.object as Stripe.Product);
          break;
        case 'customer.created':
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          //   const subscription = event.data.object as Stripe.Subscription;
          //   await manageSubscriptionStatusChange(
          //     subscription.id,
          //     subscription.customer as string,
          //     event.type === 'customer.subscription.created'
          //   );
          break;
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session;

          // Extract metadata and session details
          const userId = checkoutSession.metadata?.userId; // Your application's user ID
          const stripeCustomerId = checkoutSession.customer as string;
          const subscriptionId = checkoutSession.subscription as string; // For subscriptions

          if (!userId) {
            console.error('User ID is missing in metadata.');
            break;
          }

          try {
            // Perform an upsert operation
            const { error } = await supabaseAdmin.from('users').upsert(
              {
                id: userId, // Primary key
                stripe_customer_id: stripeCustomerId,
                stripe_subscription_id: subscriptionId,
                pro: true, // Mark as pro since they've subscribed
              },
              { onConflict: 'id' }
            ); // 'id' is the conflict column

            if (error) {
              console.error('Error upserting user:', error.message);
              break;
            }

            console.log('User upserted successfully');
          } catch (err: any) {
            console.error(
              'Error handling checkout session completed:',
              err.message
            );
          }
          break;

        case 'payment_intent.created':
          break;
        case 'payment_intent.succeeded':
          break;
        case 'charge.succeeded':
          break;
        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      console.log(error);
      return new Response(
        'Webhook handler failed. View your Next.js function logs.',
        {
          status: 400,
        }
      );
    }
  } else {
    return new Response(`Unsupported event type: ${event.type}`, {
      status: 400,
    });
  }
  return new Response(JSON.stringify({ received: true }));
}
