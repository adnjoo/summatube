import Stripe from 'stripe';

export async function POST(request) {
  const { priceId, userId } = await request.json();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.headers.get('origin')}/pricing?status=success`,
      cancel_url: `${request.headers.get('origin')}/pricing?status=cancel`,
      metadata: {
        userId: userId,
      },
    });

    return new Response(JSON.stringify({ sessionId: session.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.log(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
