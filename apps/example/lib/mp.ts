import { createMercadoPago } from "mercadopago-next/server";

export const mp = createMercadoPago({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  publicKey: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
  baseUrl: process.env.NEXT_PUBLIC_APP_URL,
  // Pre-configured products
  products: {
    premium_monthly: {
      title: "Premium Monthly",
      unitPrice: 3000,
      description: "Monthly premium access",
      currencyId: "COP",
    },
    premium_yearly: {
      title: "Premium Yearly",
      unitPrice: 9990,
      description: "Yearly premium access - Save 17%!",
      currencyId: "COP",
    },
  },

  // Pre-configured subscription plans
  plans: {
    premium_sub: {
      reason: "Premium Subscription",
      transactionAmount: 999,
      frequency: 1,
      frequencyType: "months",
    },
  },

  // Handle webhook events
  onEvent: async (event) => {
    console.log("[MP Event]", event.type, event.id);

    switch (event.type) {
      case "payment.approved":
        console.log("Payment approved!", {
          id: event.data.id,
          amount: event.data.transactionAmount,
          email: event.data.payerEmail,
          metadata: event.data.metadata,
        });
        // TODO: Fulfill order, update database, send confirmation email, etc.
        break;

      case "payment.rejected":
        console.log("Payment rejected:", event.data.id);
        // TODO: Handle rejection, notify user, etc.
        break;

      case "subscription.authorized":
        console.log("Subscription authorized!", {
          id: event.data.id,
          reason: event.data.reason,
        });
        // TODO: Grant access, update user subscription status, etc.
        break;

      case "subscription.cancelled":
        console.log("Subscription cancelled:", event.data.id);
        // TODO: Revoke access, update user subscription status, etc.
        break;

      default:
        console.log("Unhandled event:", event.type);
    }
  },
});
