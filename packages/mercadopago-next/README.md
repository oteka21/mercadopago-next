# mercadopago-next

The simplest way to integrate Mercado Pago into your Next.js app.

> "better-auth, but for Mercado Pago + Next.js"

## Features

- **Zero-config defaults** - Works out of the box with sensible defaults
- **Type-safe** - Full TypeScript support with autocomplete
- **Checkout Pro** - Redirect users to MP checkout in one line
- **Subscriptions** - Create recurring payments easily
- **Webhook handling** - Normalized events with `onEvent` callback
- **Pre-configured products** - Define products once, reference by ID
- **Next.js App Router** - First-class support for the new App Router

## Installation

```bash
npm install mercadopago-next mercadopago
# or
pnpm add mercadopago-next mercadopago
```

## Quick Start

### 1. Create the server instance

```ts
// lib/mp.ts
import { createMercadoPago } from "mercadopago-next/server";

export const mp = createMercadoPago({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  publicKey: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
  baseUrl: process.env.NEXT_PUBLIC_APP_URL,

  // Pre-configure your products (optional)
  products: {
    premium: {
      title: "Premium Plan",
      unitPrice: 999, // In cents or your currency's smallest unit
    },
  },

  // Handle webhook events
  onEvent: async (event) => {
    if (event.type === "payment.approved") {
      // Fulfill order, update database, etc.
      console.log("Payment approved!", event.data);
    }
  },
});
```

### 2. Mount the API handler

```ts
// app/api/mp/[...all]/route.ts
import { mp } from "@/lib/mp";

export const POST = mp.handler;
export const GET = mp.handler;
```

### 3. Create the client instance

```ts
// lib/mp-client.ts
import { createMPClient } from "mercadopago-next/client";

export const mpClient = createMPClient({
  baseUrl: "/api/mp",
});
```

### 4. Use in your components

```tsx
"use client";
import { mpClient } from "@/lib/mp-client";

export function BuyButton() {
  return (
    <button onClick={() => mpClient.checkout({ productId: "premium" })}>
      Buy Premium
    </button>
  );
}
```

That's it! Clicking the button redirects to Mercado Pago checkout.

---

## Server Configuration

### `createMercadoPago(config)`

| Option          | Type                               | Required | Description                              |
| --------------- | ---------------------------------- | -------- | ---------------------------------------- |
| `accessToken`   | `string`                           | Yes      | Your MP access token                     |
| `publicKey`     | `string`                           | No       | Public key (returned via `/config`)      |
| `webhookSecret` | `string`                           | No       | Secret for webhook signature             |
| `baseUrl`       | `string`                           | No       | Your app's base URL (for redirects)      |
| `successUrl`    | `string`                           | No       | Redirect URL after successful payment    |
| `failureUrl`    | `string`                           | No       | Redirect URL after failed payment        |
| `pendingUrl`    | `string`                           | No       | Redirect URL for pending payment         |
| `products`      | `Record<string, ProductConfig>`    | No       | Pre-configured products                  |
| `plans`         | `Record<string, PlanConfig>`       | No       | Pre-configured subscription plans        |
| `onEvent`       | `(event: MPEvent) => Promise<void>`| No       | Webhook event handler                    |

### Product Configuration

```ts
products: {
  product_id: {
    title: "Product Name",      // Required
    unitPrice: 1000,            // Required (in smallest currency unit)
    currencyId: "ARS",          // Default: "ARS"
    description: "...",         // Optional
    pictureUrl: "https://...",  // Optional
    categoryId: "...",          // Optional
  },
}
```

### Plan Configuration (Subscriptions)

```ts
plans: {
  plan_id: {
    reason: "Monthly Subscription",  // Required
    transactionAmount: 999,          // Required
    frequency: 1,                    // Required
    frequencyType: "months",         // "days" | "months"
    currencyId: "ARS",               // Default: "ARS"
  },
}
```

---

## Client Methods

### `mpClient.checkout(options)`

Start a checkout flow.

```ts
// Using pre-configured product
await mpClient.checkout({ productId: "premium" });

// Using custom items
await mpClient.checkout({
  items: [{ title: "Custom Item", unitPrice: 500, quantity: 2 }],
  metadata: { orderId: "123" },
});

// Get URL without redirecting
const { url } = await mpClient.checkout({
  productId: "premium",
  redirect: false,
});
```

| Option              | Type             | Description                        |
| ------------------- | ---------------- | ---------------------------------- |
| `productId`         | `string`         | Pre-configured product ID          |
| `items`             | `CheckoutItem[]` | Custom items (alt to productId)    |
| `quantity`          | `number`         | Quantity for productId (default: 1)|
| `metadata`          | `object`         | Custom data attached to preference |
| `payerEmail`        | `string`         | Pre-fill payer email               |
| `externalReference` | `string`         | Your internal reference            |
| `redirect`          | `boolean`        | Auto-redirect (default: true)      |

### `mpClient.subscribe(options)`

Start a subscription flow.

```ts
await mpClient.subscribe({
  planId: "premium_monthly",
  payerEmail: "user@email.com",
});
```

| Option              | Type      | Description                    |
| ------------------- | --------- | ------------------------------ |
| `planId`            | `string`  | Pre-configured plan ID         |
| `payerEmail`        | `string`  | **Required** - Payer email     |
| `metadata`          | `object`  | Custom data                    |
| `redirect`          | `boolean` | Auto-redirect (default: true)  |

### `mpClient.getConfig()`

Get public configuration from server.

```ts
const { publicKey } = await mpClient.getConfig();
```

---

## Webhook Events

The `onEvent` callback receives normalized events:

```ts
onEvent: async (event) => {
  console.log(event.type);  // "payment.approved"
  console.log(event.id);    // "12345678"
  console.log(event.data);  // Normalized data
  console.log(event.raw);   // Raw MP API response
}
```

### Event Types

| Event                     | Description                    |
| ------------------------- | ------------------------------ |
| `payment.created`         | Payment was created            |
| `payment.approved`        | Payment was approved           |
| `payment.pending`         | Payment is pending             |
| `payment.in_process`      | Payment is being processed     |
| `payment.rejected`        | Payment was rejected           |
| `payment.cancelled`       | Payment was cancelled          |
| `payment.refunded`        | Payment was refunded           |
| `payment.charged_back`    | Payment was charged back       |
| `subscription.authorized` | Subscription was authorized    |
| `subscription.pending`    | Subscription is pending        |
| `subscription.paused`     | Subscription was paused        |
| `subscription.cancelled`  | Subscription was cancelled     |

---

## Direct API Access

For advanced use cases, access the MP API directly:

```ts
// In server code
import { mp } from "@/lib/mp";

// Create preference programmatically
const preference = await mp.api.createPreference({
  items: [{ title: "Item", unitPrice: 100, quantity: 1 }],
});

// Get payment details
const payment = await mp.api.getPayment("12345");

// Get subscription details
const subscription = await mp.api.getSubscription("abc123");
```

---

## API Routes

The handler exposes these endpoints:

| Method | Path         | Description                |
| ------ | ------------ | -------------------------- |
| POST   | `/checkout`  | Create checkout preference |
| POST   | `/subscribe` | Create subscription        |
| POST   | `/webhook`   | Receive MP webhooks        |
| GET    | `/config`    | Get public config          |

---

## Environment Variables

```env
# Required
MP_ACCESS_TOKEN=APP_USR-xxx

# Optional (but recommended)
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-xxx
NEXT_PUBLIC_APP_URL=https://your-app.com

# Optional
MP_WEBHOOK_SECRET=xxx
```

---

## MercadoPago Setup

See the [MercadoPago Setup Guide](./docs/mercadopago-setup.md) for step-by-step instructions on:

- Creating a MercadoPago application
- Getting your credentials
- Setting up test accounts
- Configuring webhooks
- Testing locally with tunnels

---

## License

MIT
