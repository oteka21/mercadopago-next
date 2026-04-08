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
- **Whitelabel-ready** - Supports all fields required to pass MP's integration quality checklist (enables Efecty and other offline methods)

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

| Option            | Type                               | Required | Description                                          |
| ----------------- | ---------------------------------- | -------- | ---------------------------------------------------- |
| `accessToken`     | `string`                           | Yes      | Your MP access token                                 |
| `publicKey`       | `string`                           | No       | Public key (returned via `/config`)                  |
| `webhookSecret`   | `string`                           | No       | Secret for webhook signature                         |
| `baseUrl`         | `string`                           | No       | Your app's base URL (for redirects)                  |
| `notificationUrl` | `string`                           | No       | Webhook URL sent to MP — required for whitelabel     |
| `successUrl`      | `string`                           | No       | Redirect URL after successful payment                |
| `failureUrl`      | `string`                           | No       | Redirect URL after failed payment                    |
| `pendingUrl`      | `string`                           | No       | Redirect URL for pending payment                     |
| `products`        | `Record<string, ProductConfig>`    | No       | Pre-configured products                              |
| `plans`           | `Record<string, PlanConfig>`       | No       | Pre-configured subscription plans                    |
| `onEvent`         | `(event: MPEvent) => Promise<void>`| No       | Webhook event handler                                |

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

// With full payer data (recommended — improves approval rate and enables offline methods like Efecty)
await mpClient.checkout({
  productId: "premium",
  externalReference: order.id,
  payerEmail: user.email,
  payerFirstName: user.firstName,
  payerLastName: user.lastName,
  payerPhone: user.phone,
  payerIdentification: { type: "CC", number: user.cedula },
});
```

| Option                | Type                               | Description                                            |
| --------------------- | ---------------------------------- | ------------------------------------------------------ |
| `productId`           | `string`                           | Pre-configured product ID                              |
| `items`               | `CheckoutItem[]`                   | Custom items (alt to productId)                        |
| `quantity`            | `number`                           | Quantity for productId (default: 1)                    |
| `metadata`            | `object`                           | Custom data attached to preference                     |
| `externalReference`   | `string`                           | Your internal order ID — required for whitelabel       |
| `notificationUrl`     | `string`                           | Override webhook URL for this checkout                 |
| `payerEmail`          | `string`                           | Payer email — improves fraud scoring                   |
| `payerFirstName`      | `string`                           | Payer first name — improves fraud scoring              |
| `payerLastName`       | `string`                           | Payer last name — improves fraud scoring               |
| `payerPhone`          | `string`                           | Payer phone number — improves fraud scoring            |
| `payerIdentification` | `{ type: string; number: string }` | Payer ID document (CC, NIT, etc.) — improves scoring   |
| `redirect`            | `boolean`                          | Auto-redirect (default: true)                          |

### `CheckoutItem`

| Field         | Type              | Description                                                    |
| ------------- | ----------------- | -------------------------------------------------------------- |
| `title`       | `string`          | Item name                                                      |
| `unitPrice`   | `number`          | Price per unit                                                 |
| `quantity`    | `number`          | Quantity                                                       |
| `description` | `string`          | Item description — improves fraud scoring                      |
| `categoryId`  | `MPItemCategory`  | MP category — improves fraud scoring (see below)               |
| `pictureUrl`  | `string`          | Item image URL                                                 |
| `currencyId`  | `string`          | Currency (default: `"ARS"`)                                    |

### `MPItemCategory`

```ts
import type { MPItemCategory } from "mercadopago-next/server";
```

| Value           | Description                          |
| --------------- | ------------------------------------ |
| `virtual_goods` | E-books, credits, digital files, etc |
| `services`      | General services                     |
| `learnings`     | Courses, workshops, trainings        |
| `games`         | Online games & credits               |
| `entertainment` | Music, movies, books, toys           |
| `electronics`   | Audio, video, GPS                    |
| `fashion`       | Clothing, shoes, accessories         |
| `home`          | Appliances, garden                   |
| `tickets`       | Events, concerts, sports             |
| `travels`       | Flights, hotels, vouchers            |
| `others`        | Other categories                     |

Full list: `art`, `baby`, `coupons`, `donations`, `computing`, `cameras`, `video_games`, `television`, `car_electronics`, `automotive`, `musical`, `phones`

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

| Event                     | Description                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| `payment.created`         | Payment was created                                                                                  |
| `payment.approved`        | Payment was approved — safe to fulfill order                                                        |
| `payment.pending`         | Payment is pending — waiting for buyer action (e.g. Efecty: buyer must pay at a physical location)  |
| `payment.in_process`      | Payment is being reviewed by MP                                                                     |
| `payment.rejected`        | Payment was rejected by MP or the issuer                                                            |
| `payment.cancelled`       | **Expired** — Efecty/offline payments expire after 3 days; or buyer abandoned the checkout. This is NOT the same as rejected — the buyer can retry |
| `payment.refunded`        | Payment was refunded                                                                                 |
| `payment.charged_back`    | Payment was charged back (dispute)                                                                  |
| `subscription.authorized` | Subscription was authorized                                                                         |
| `subscription.pending`    | Subscription is pending                                                                             |
| `subscription.paused`     | Subscription was paused                                                                             |
| `subscription.cancelled`  | Subscription was cancelled                                                                          |

> **Important — `payment.cancelled` vs `payment.rejected`**: Do not map both to the same database status. `cancelled` means the payment window expired or the user abandoned checkout — the user is allowed to try again. `rejected` means the transaction was actively refused. If you map `cancelled` to `rejected` in your DB and then block re-registration on rejected status, you will lock out users who simply let their Efecty ticket expire.

### Webhook Security

Set `webhookSecret` to verify that webhooks come from MercadoPago and not from a third party:

```ts
export const mp = createMercadoPago({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  webhookSecret: process.env.MP_WEBHOOK_SECRET!, // ← enable signature verification
  // ...
});
```

When `webhookSecret` is set, the handler verifies the `x-signature` header on every incoming webhook. Requests with an invalid or missing signature are rejected with `401`. The secret is found in your MercadoPago dashboard under **Webhooks → Signature**.

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

## Production Patterns

### Correct `onEvent` handler

Map each event to the appropriate status in your database. Never collapse `cancelled` into `rejected`:

```ts
onEvent: async (event) => {
  const HANDLED_EVENTS = [
    "payment.approved",
    "payment.rejected",
    "payment.pending",
    "payment.cancelled",
  ] as const;

  if (!HANDLED_EVENTS.includes(event.type as (typeof HANDLED_EVENTS)[number])) return;

  const statusMap = {
    "payment.approved":  "approved",
    "payment.rejected":  "rejected",
    "payment.pending":   "pending",
    "payment.cancelled": "cancelled", // ← keep separate from "rejected"
  } as const;

  await db
    .update(orders)
    .set({ paymentStatus: statusMap[event.type] })
    .where(eq(orders.mpExternalRef, event.data.externalReference!));
},
```

Your database schema should include `"cancelled"` as a valid payment status alongside `"approved"`, `"rejected"`, and `"pending"`.

### Handling re-attempts for pending/cancelled payments

When a user with an existing pending or cancelled payment submits the form again, do **not** insert a new record. Instead, reuse the existing record and generate a new preference:

```ts
export async function createRegistration(data: RegistrationInput) {
  const existing = await db
    .select()
    .from(registrations)
    .where(eq(registrations.idNumber, data.idNumber))
    .limit(1);

  const record = existing[0];

  // Block if already paid
  if (record?.paymentStatus === "approved") {
    return { error: "ALREADY_REGISTERED" };
  }

  const externalReference = `ORDER-${data.idNumber}-${Date.now()}`;

  if (record) {
    // Reuse the existing row — update the external reference for the new attempt
    await db
      .update(registrations)
      .set({ mpExternalRef: externalReference, paymentStatus: "pending" })
      .where(eq(registrations.idNumber, data.idNumber));
  } else {
    await db.insert(registrations).values({ ...data, mpExternalRef: externalReference });
  }

  const { url } = await mp.api.createPreference({
    productId: "your-product",
    externalReference,
    // ... payer fields
  });

  redirect(url);
}
```

Without this pattern, each re-attempt creates a new row. Since `mpExternalRef` has a UNIQUE constraint, the second attempt would also fail with a database error.

### Always send full payer data

Incomplete payer data degrades your integration quality score and can cause rejections (especially for offline payment methods like Efecty). Always send all available fields:

```ts
await mp.api.createPreference({
  productId: "your-product",
  externalReference: order.id,
  payerEmail: user.email,           // required for whitelabel
  payerFirstName: user.firstName,   // required for whitelabel
  payerLastName: user.lastName,     // required for whitelabel
  payerPhone: user.phone,           // required for whitelabel
  payerIdentification: {
    type: "CC",                     // required for whitelabel (Colombia)
    number: user.documentNumber,
  },
});
```

### `categoryId` in pre-configured products

When using `products` in config, always set `categoryId` — it is forwarded to the preference and improves fraud scoring:

```ts
products: {
  inscripcion: {
    title: "Event Registration",
    unitPrice: 50000,
    currencyId: "COP",
    categoryId: "tickets", // ← always set this
  },
},
```

---

## License

MIT
