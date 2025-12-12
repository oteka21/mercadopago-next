import {
  MercadoPagoConfig as MPConfig,
  Payment,
  PreApproval,
} from "mercadopago";
import type { MercadoPagoConfig, MercadoPagoInstance } from "./types";
import { createHandler } from "./handler";
import { createCheckout } from "./checkout";
import { createSubscription } from "./subscription";

export function createMercadoPago(config: MercadoPagoConfig): MercadoPagoInstance {
  // Validate required config
  if (!config.accessToken) {
    throw new Error("[mercadopago-next] accessToken is required");
  }

  // Initialize MP SDK
  const mpClient = new MPConfig({ accessToken: config.accessToken });

  // Build instance
  return {
    handler: createHandler(mpClient, config),
    api: {
      createPreference: (data) => createCheckout(mpClient, config, data),
      createSubscription: (data) => createSubscription(mpClient, config, data),
      getPayment: (id) => new Payment(mpClient).get({ id }),
      getSubscription: (id) => new PreApproval(mpClient).get({ id }),
    },
    config,
  };
}
