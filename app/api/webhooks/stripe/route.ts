import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Actualizar pago
        if (session.metadata?.bookingId) {
          await prisma.payment.updateMany({
            where: {
              bookingId: session.metadata.bookingId,
            },
            data: {
              status: 'COMPLETED',
              providerPaymentId: session.payment_intent as string,
            },
          });

          // Actualizar estado de la reserva
          await prisma.booking.update({
            where: { id: session.metadata.bookingId },
            data: {
              paymentStatus: 'COMPLETED',
              status: 'CONFIRMED',
            },
          });
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await prisma.subscription.upsert({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          update: {
            status: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
          create: {
            businessId: subscription.metadata.businessId,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            planType: subscription.metadata.planType as any,
            status: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status: 'CANCELLED',
          },
        });
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        if (paymentIntent.metadata?.bookingId) {
          await prisma.payment.updateMany({
            where: {
              bookingId: paymentIntent.metadata.bookingId,
            },
            data: {
              status: 'COMPLETED',
              providerPaymentId: paymentIntent.id,
            },
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        if (paymentIntent.metadata?.bookingId) {
          await prisma.payment.updateMany({
            where: {
              bookingId: paymentIntent.metadata.bookingId,
            },
            data: {
              status: 'FAILED',
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

