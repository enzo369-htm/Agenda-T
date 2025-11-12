import Stripe from 'stripe';

// Lazy initialization para evitar errores durante el build
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build';
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    });
  }
  return stripeInstance;
}

// Mantener compatibilidad con código existente
export const stripe = new Proxy({} as Stripe, {
  get: (target, prop) => {
    return getStripe()[prop as keyof Stripe];
  },
});

export const PLAN_PRICES = {
  FREE: 0,
  BASIC: 9900, // $99 ARS
  PROFESSIONAL: 19900, // $199 ARS
  ENTERPRISE: 39900, // $399 ARS
};

export const PLAN_FEATURES = {
  FREE: {
    bookingsPerMonth: 50,
    employees: 1,
    services: 5,
    analytics: false,
    integrations: false,
    customDomain: false,
  },
  BASIC: {
    bookingsPerMonth: 200,
    employees: 3,
    services: 20,
    analytics: true,
    integrations: false,
    customDomain: false,
  },
  PROFESSIONAL: {
    bookingsPerMonth: 1000,
    employees: 10,
    services: 100,
    analytics: true,
    integrations: true,
    customDomain: true,
  },
  ENTERPRISE: {
    bookingsPerMonth: -1, // Ilimitado
    employees: -1,
    services: -1,
    analytics: true,
    integrations: true,
    customDomain: true,
  },
};

export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  metadata,
}: {
  customerId?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });
}

export async function createCustomer({
  email,
  name,
  metadata,
}: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}) {
  return stripe.customers.create({
    email,
    name,
    metadata,
  });
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.cancel(subscriptionId);
}

export async function updateSubscription(
  subscriptionId: string,
  params: Stripe.SubscriptionUpdateParams
) {
  return stripe.subscriptions.update(subscriptionId, params);
}

