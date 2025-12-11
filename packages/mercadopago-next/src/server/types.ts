import type { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";
import type { PreApprovalResponse } from "mercadopago/dist/clients/preApproval/commonTypes";

// ============ CONFIG ============
export interface MercadoPagoConfig {
  /** Your MP access token (required) */
  accessToken: string;

  /** Public key for client-side (optional, returned via /config endpoint) */
  publicKey?: string;

  /** Webhook secret for signature verification (optional) */
  webhookSecret?: string;

  /** Base URL of your app (for redirects, e.g. "https://myapp.com") */
  baseUrl?: string;

  /** Success redirect URL (default: baseUrl + "/payment/success") */
  successUrl?: string;

  /** Failure redirect URL (default: baseUrl + "/payment/failure") */
  failureUrl?: string;

  /** Pending redirect URL (default: baseUrl + "/payment/pending") */
  pendingUrl?: string;

  /** Pre-configured products for checkout */
  products?: Record<string, ProductConfig>;

  /** Pre-configured subscription plans */
  plans?: Record<string, PlanConfig>;

  /** Webhook event handler - called when MP sends notifications */
  onEvent?: (event: MPEvent) => Promise<void>;
}

export interface ProductConfig {
  title: string;
  unitPrice: number;
  currencyId?: string; // Default: "ARS"
  description?: string;
  pictureUrl?: string;
  categoryId?: string;
}

export interface PlanConfig {
  reason: string; // Subscription description
  transactionAmount: number;
  currencyId?: string; // Default: "ARS"
  frequency: number; // e.g. 1
  frequencyType: "days" | "months";
}

// ============ CHECKOUT REQUEST/RESPONSE ============
export interface CheckoutRequest {
  /** Use pre-configured product by ID */
  productId?: string;

  /** OR pass custom items directly */
  items?: CheckoutItem[];

  /** Quantity (default: 1) - only used with productId */
  quantity?: number;

  /** Custom metadata to attach to preference */
  metadata?: Record<string, unknown>;

  /** Payer email (optional) */
  payerEmail?: string;

  /** External reference for your system */
  externalReference?: string;

  /** Override success/failure URLs for this checkout */
  successUrl?: string;
  failureUrl?: string;
  pendingUrl?: string;
}

export interface CheckoutItem {
  id?: string;
  title: string;
  unitPrice: number;
  quantity: number;
  currencyId?: string;
  description?: string;
  pictureUrl?: string;
}

export interface CheckoutResponse {
  /** URL to redirect user to MP checkout */
  url: string;
  /** Preference ID */
  preferenceId: string;
  /** Sandbox URL (for testing) */
  sandboxUrl: string;
}

// ============ SUBSCRIPTION REQUEST/RESPONSE ============
export interface SubscribeRequest {
  /** Use pre-configured plan by ID */
  planId?: string;

  /** OR pass custom subscription config */
  reason?: string;
  transactionAmount?: number;
  frequency?: number;
  frequencyType?: "days" | "months";
  currencyId?: string;

  /** Payer email (required for subscriptions) */
  payerEmail: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;

  /** External reference */
  externalReference?: string;

  /** Back URL after subscription */
  backUrl?: string;
}

export interface SubscribeResponse {
  /** URL to redirect user to MP subscription checkout */
  url: string;
  /** Subscription/PreApproval ID */
  subscriptionId: string;
}

// ============ WEBHOOK EVENTS ============
export type MPEventType =
  | "payment.created"
  | "payment.approved"
  | "payment.pending"
  | "payment.in_process"
  | "payment.rejected"
  | "payment.cancelled"
  | "payment.refunded"
  | "payment.charged_back"
  | "subscription.authorized"
  | "subscription.pending"
  | "subscription.paused"
  | "subscription.cancelled";

export interface MPEvent {
  /** Normalized event type */
  type: MPEventType;

  /** Resource ID (payment ID or subscription ID) */
  id: string;

  /** Normalized data */
  data: MPEventData;

  /** Raw response from MP API */
  raw: PaymentResponse | PreApprovalResponse;

  /** Original webhook body */
  webhook: WebhookBody;
}

export interface MPEventData {
  id: number | string;
  status: string;
  externalReference?: string;
  metadata?: Record<string, unknown>;

  // Payment specific
  transactionAmount?: number;
  currencyId?: string;
  payerEmail?: string;
  paymentMethodId?: string;

  // Subscription specific
  reason?: string;
  autoRecurring?: {
    frequency: number;
    frequencyType: string;
    transactionAmount: number;
    currencyId: string;
  };
}

export interface WebhookBody {
  id: number;
  live_mode: boolean;
  type: string; // "payment" | "subscription_preapproval" | etc.
  date_created: string;
  user_id: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

// ============ INSTANCE ============
export interface MercadoPagoInstance {
  /** Next.js App Router handler - mount at /api/mp/[...all]/route.ts */
  handler: (req: Request) => Promise<Response>;

  /** Direct API access */
  api: {
    /** Create checkout preference */
    createPreference: (data: CheckoutRequest) => Promise<CheckoutResponse>;
    /** Create subscription */
    createSubscription: (data: SubscribeRequest) => Promise<SubscribeResponse>;
    /** Get payment by ID */
    getPayment: (id: string) => Promise<PaymentResponse>;
    /** Get subscription by ID */
    getSubscription: (id: string) => Promise<PreApprovalResponse>;
  };

  /** Config (for internal use) */
  config: MercadoPagoConfig;
}
