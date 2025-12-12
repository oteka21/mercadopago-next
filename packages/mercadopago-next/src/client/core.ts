import type {
  MPClientConfig,
  MPClientCheckoutOptions,
  MPClientSubscribeOptions,
  MPClient,
  CheckoutResult,
  SubscribeResult,
  ConfigResult,
} from "./types";

export function createMPClient(config: MPClientConfig): MPClient {
  const baseUrl = config.baseUrl.replace(/\/$/, ""); // Remove trailing slash

  return {
    async checkout(options: MPClientCheckoutOptions): Promise<CheckoutResult | void> {
      const res = await fetch(`${baseUrl}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: options.productId,
          items: options.items,
          quantity: options.quantity,
          metadata: options.metadata,
          payerEmail: options.payerEmail,
          externalReference: options.externalReference,
          successUrl: options.successUrl,
          failureUrl: options.failureUrl,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Checkout failed" }));
        throw new Error(error.error || "Checkout failed");
      }

      const data: CheckoutResult = await res.json();

      if (options.redirect !== false) {
        window.location.href = data.url;
        return;
      }

      return data;
    },

    async subscribe(options: MPClientSubscribeOptions): Promise<SubscribeResult | void> {
      const res = await fetch(`${baseUrl}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: options.planId,
          reason: options.reason,
          transactionAmount: options.transactionAmount,
          frequency: options.frequency,
          frequencyType: options.frequencyType,
          payerEmail: options.payerEmail,
          metadata: options.metadata,
          externalReference: options.externalReference,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Subscribe failed" }));
        throw new Error(error.error || "Subscribe failed");
      }

      const data: SubscribeResult = await res.json();

      if (options.redirect !== false) {
        window.location.href = data.url;
        return;
      }

      return data;
    },

    async getConfig(): Promise<ConfigResult> {
      const res = await fetch(`${baseUrl}/config`);

      if (!res.ok) {
        throw new Error("Failed to get config");
      }

      return res.json();
    },
  };
}
