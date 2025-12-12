# MercadoPago Setup Guide

This guide walks you through setting up MercadoPago for use with `mercadopago-next`.

## Table of Contents

1. [Create a MercadoPago Application](#1-create-a-mercadopago-application)
2. [Get Your Credentials](#2-get-your-credentials)
3. [Create Test Accounts](#3-create-test-accounts)
4. [Configure Webhooks](#4-configure-webhooks)
5. [Expose Local Port for Development](#5-expose-local-port-for-development)
6. [Test Cards](#6-test-cards)

---

## 1. Create a MercadoPago Application

1. Go to [MercadoPago Developers](https://www.mercadopago.com/developers/panel/app)
2. Click **"Create Application"**
3. Fill in the application details:
   - **Name**: Your app name (e.g., "My Store")
   - **Product**: Select "Checkout Pro" or the integration type you need
4. Click **"Create"**

You'll be redirected to the integration dashboard.

---

## 2. Get Your Credentials

MercadoPago has two types of credentials:

| Type                       | When to Use                                    |
| -------------------------- | ---------------------------------------------- |
| **Test Credentials**       | During development (safe to use, no real money)|
| **Production Credentials** | In production (real transactions)              |

### Getting Credentials

1. In your application dashboard, look at the left sidebar
2. Click **"Test Credentials"** or **"Production Credentials"**
3. Copy the values:
   - **Public Key**: `APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Access Token**: `APP_USR-0000000000000000-000000-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-000000000`

### Important Notes for Checkout Pro

> **For Checkout Pro and Subscriptions**: You need to use **production credentials from a TEST account** during development. This sounds confusing but:
>
> 1. Create a test account (see below)
> 2. Log in as that test account
> 3. Create an application
> 4. Use the **production** credentials from that test account's application
>
> This is because Checkout Pro doesn't work with test credentials from your main account.

Add to your `.env.local`:

```env
MP_ACCESS_TOKEN=APP_USR-xxx
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-xxx
```

---

## 3. Create Test Accounts

Test accounts let you simulate buyers and sellers without real money.

### Creating Test Accounts

1. In your application dashboard, click **"Test Accounts"** in the left sidebar
2. Click **"Create Test Account"**
3. Fill in the details:
   - **Name**: e.g., "Seller" or "Buyer"
   - **Country**: Select your country
   - **Initial Balance**: Amount of fake money (e.g., 10000)
4. Create at least **two accounts**:
   - **Seller**: Will receive payments
   - **Buyer**: Will make payments

### Test Account Workflow

| Account  | Purpose               | How to Use                                      |
| -------- | --------------------- | ----------------------------------------------- |
| Seller   | Your store's account  | Log in (incognito), create app, get credentials |
| Buyer    | Customer account      | Use to complete test purchases                  |

### Logging Into Test Accounts

1. Open an **incognito/private window**
2. Go to [mercadopago.com](https://www.mercadopago.com)
3. Log in with test account credentials (email/password shown in your dashboard)

---

## 4. Configure Webhooks

Webhooks notify your app when payments are completed.

### Setup Steps

1. In your application dashboard, click **"Webhooks"** in the left sidebar
2. Click **"Configure Notifications"**
3. Select the environment:
   - **Test Mode**: For test account transactions
   - **Production Mode**: For real transactions
4. Enter your webhook URL:
   ```
   https://your-app.com/api/mp/webhook
   ```
   (Replace with your actual URL)
5. Select the events you want to receive:
   - **Payments**: For Checkout Pro
   - **Plans and Subscriptions**: For subscriptions
6. Click **"Save"**

### Local Development

For webhooks to reach your local machine, you need to expose your port. See [Section 5](#5-expose-local-port-for-development).

---

## 5. Expose Local Port for Development

MercadoPago can't reach `localhost`, so you need to expose your local server.

### Option A: Cloudflare Tunnel (Recommended)

1. Install [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)

2. Run the tunnel:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```

3. Copy the generated URL (e.g., `https://random-name.trycloudflare.com`)

### Option B: VS Code Dev Tunnels

1. In VS Code, go to the **Ports** panel (View > Ports)
2. Click **"Forward a Port"**
3. Enter `3000`
4. Right-click the port and set **Visibility** to **Public**
5. Copy the generated URL

### Option C: ngrok

1. Install [ngrok](https://ngrok.com/download)

2. Run:
   ```bash
   ngrok http 3000
   ```

3. Copy the forwarding URL

### Using Your Tunnel URL

Add to your `.env.local`:

```env
NEXT_PUBLIC_APP_URL=https://your-tunnel-url.com
```

Update your webhook configuration in MercadoPago to use this URL:
```
https://your-tunnel-url.com/api/mp/webhook
```

---

## 6. Test Cards

Use these test cards when completing payments as the Buyer:

### Approved Payment

| Card Type   | Number                  | CVV   | Expiration      |
| ----------- | ----------------------- | ----- | --------------- |
| Visa        | `4509 9535 6623 3704`   | `123` | Any future date |
| Mastercard  | `5031 7557 3453 0604`   | `123` | Any future date |

### Rejected Payment

| Scenario  | Card Number           |
| --------- | --------------------- |
| Rejected  | `4000 0000 0000 0002` |

### Cardholder Details

| Field | Value                              |
| ----- | ---------------------------------- |
| Name  | `APRO` (approved) or `OTHE` (rejected) |
| DNI   | `12345678`                         |

> **Tip**: Using `APRO` as the cardholder name ensures the payment is approved.

---

## Development Checklist

- [ ] Created MercadoPago application
- [ ] Created test accounts (Seller + Buyer)
- [ ] Got credentials from Seller's test application
- [ ] Added credentials to `.env.local`
- [ ] Set up tunnel for local development
- [ ] Configured webhook URL in MercadoPago
- [ ] Tested payment flow with test cards

---

## Common Issues

### "Invalid access token"

- Make sure you're using the correct credentials
- For Checkout Pro, use **production credentials from a test account**

### Webhooks not arriving

- Check that your tunnel is running
- Verify webhook URL in MercadoPago dashboard
- Make sure webhook visibility is set to **Public** (if using VS Code tunnels)
- Check that you selected the correct environment (Test/Production)

### "Payment not found"

- This usually happens with simulated webhook tests
- Try a real test payment instead

### Subscription errors

- Make sure to use the email from your **Buyer** test account
- Subscriptions require a valid MercadoPago user email

---

## Next Steps

Once you've completed this setup:

1. Start your Next.js app: `npm run dev`
2. Visit your app and test a checkout
3. Verify the webhook is received in your terminal logs
4. Check the payment in your Seller test account dashboard

For SDK usage, see the main [README](../README.md).
