export interface MPClientConfig {
  /** Base URL of your API route, e.g. "/api/mp" */
  baseUrl: string;
}

export interface MPClientCheckoutOptions {
  /** Pre-configured product ID */
  productId?: string;

  /** OR custom items */
  items?: Array<{
    title: string;
    unitPrice: number;
    quantity: number;
    description?: string;
    pictureUrl?: string;
  }>;

  /** Quantity for productId (default: 1) */
  quantity?: number;

  /** Metadata */
  metadata?: Record<string, unknown>;

  /** Payer email */
  payerEmail?: string;

  /** External reference */
  externalReference?: string;

  /** Override success URL */
  successUrl?: string;

  /** Override failure URL */
  failureUrl?: string;

  /**
   * If false, returns URL instead of redirecting
   * @default true
   */
  redirect?: boolean;
}

export interface MPClientSubscribeOptions {
  /** Pre-configured plan ID */
  planId?: string;

  /** OR custom subscription config */
  reason?: string;
  transactionAmount?: number;
  frequency?: number;
  frequencyType?: "days" | "months";

  /** Payer email (required) */
  payerEmail: string;

  /** Metadata */
  metadata?: Record<string, unknown>;

  /** External reference */
  externalReference?: string;

  /**
   * If false, returns URL instead of redirecting
   * @default true
   */
  redirect?: boolean;
}

export interface CheckoutResult {
  url: string;
  preferenceId: string;
  sandboxUrl: string;
}

export interface SubscribeResult {
  url: string;
  subscriptionId: string;
}

export interface ConfigResult {
  publicKey: string | null;
}

export interface MPClient {
  /** Start checkout flow */
  checkout: (options: MPClientCheckoutOptions) => Promise<CheckoutResult | void>;

  /** Start subscription flow */
  subscribe: (options: MPClientSubscribeOptions) => Promise<SubscribeResult | void>;

  /** Get public config from server */
  getConfig: () => Promise<ConfigResult>;
}
