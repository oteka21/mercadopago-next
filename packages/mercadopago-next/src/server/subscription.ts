import { MercadoPagoConfig as MPConfig, PreApproval } from "mercadopago";
import type {
  MercadoPagoConfig,
  SubscribeRequest,
  SubscribeResponse,
  PlanConfig,
} from "./types";

const DEFAULT_CURRENCY = "ARS";

export async function createSubscription(
  mpClient: MPConfig,
  config: MercadoPagoConfig,
  data: SubscribeRequest
): Promise<SubscribeResponse> {
  // Validate payer email
  if (!data.payerEmail) {
    throw new Error("[mercadopago-next] payerEmail is required for subscriptions");
  }

  // Get plan config (from planId or custom)
  const planConfig = getPlanConfig(config, data);

  // Build back URL
  const backUrl = data.backUrl || config.baseUrl || "";

  // Create subscription (PreApproval with pending status)
  const subscription = await new PreApproval(mpClient).create({
    body: {
      back_url: backUrl,
      reason: planConfig.reason,
      auto_recurring: {
        frequency: planConfig.frequency,
        frequency_type: planConfig.frequencyType,
        transaction_amount: planConfig.transactionAmount,
        currency_id: planConfig.currencyId || DEFAULT_CURRENCY,
      },
      payer_email: data.payerEmail,
      status: "pending", // Pending payment - user will complete on MP
      external_reference: data.externalReference,
    },
  });

  if (!subscription.init_point || !subscription.id) {
    throw new Error("[mercadopago-next] Failed to create subscription");
  }

  return {
    url: subscription.init_point,
    subscriptionId: subscription.id,
  };
}

function getPlanConfig(
  config: MercadoPagoConfig,
  data: SubscribeRequest
): PlanConfig {
  // If planId provided, look up in config
  if (data.planId) {
    const plan = config.plans?.[data.planId];

    if (!plan) {
      throw new Error(
        `[mercadopago-next] Plan "${data.planId}" not found in config.plans`
      );
    }

    return plan;
  }

  // Otherwise, use custom config from request
  if (!data.reason || !data.transactionAmount || !data.frequency || !data.frequencyType) {
    throw new Error(
      "[mercadopago-next] When not using planId, you must provide: reason, transactionAmount, frequency, frequencyType"
    );
  }

  return {
    reason: data.reason,
    transactionAmount: data.transactionAmount,
    frequency: data.frequency,
    frequencyType: data.frequencyType,
    currencyId: data.currencyId,
  };
}
