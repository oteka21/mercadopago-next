import {
  MercadoPagoConfig as MPConfig,
  Payment,
  PreApproval,
} from "mercadopago";
import type { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";
import type { PreApprovalResponse } from "mercadopago/dist/clients/preApproval/commonTypes";
import type {
  MercadoPagoConfig,
  WebhookBody,
  MPEvent,
  MPEventType,
  MPEventData,
} from "./types";

export async function processWebhook(
  body: WebhookBody,
  mpClient: MPConfig,
  config: MercadoPagoConfig
): Promise<MPEvent | null> {
  const { type, data } = body;

  // Handle payment webhooks
  if (type === "payment") {
    return processPaymentWebhook(body, data.id, mpClient, config);
  }

  // Handle subscription webhooks
  if (type === "subscription_preapproval") {
    return processSubscriptionWebhook(body, data.id, mpClient, config);
  }

  // Unhandled webhook type
  return null;
}

async function processPaymentWebhook(
  webhook: WebhookBody,
  paymentId: string,
  mpClient: MPConfig,
  config: MercadoPagoConfig
): Promise<MPEvent | null> {
  // Fetch full payment details
  const payment = await new Payment(mpClient).get({ id: paymentId });

  if (!payment) {
    console.warn(`[mercadopago-next] Payment ${paymentId} not found`);
    return null;
  }

  // Normalize event type
  const eventType = normalizePaymentEventType(payment);

  if (!eventType) {
    return null;
  }

  // Build normalized event
  const event: MPEvent = {
    type: eventType,
    id: paymentId,
    data: normalizePaymentData(payment),
    raw: payment,
    webhook,
  };

  // Call onEvent if provided
  if (config.onEvent) {
    await config.onEvent(event);
  }

  return event;
}

async function processSubscriptionWebhook(
  webhook: WebhookBody,
  subscriptionId: string,
  mpClient: MPConfig,
  config: MercadoPagoConfig
): Promise<MPEvent | null> {
  // Fetch full subscription details
  const subscription = await new PreApproval(mpClient).get({ id: subscriptionId });

  if (!subscription) {
    console.warn(`[mercadopago-next] Subscription ${subscriptionId} not found`);
    return null;
  }

  // Normalize event type
  const eventType = normalizeSubscriptionEventType(subscription);

  if (!eventType) {
    return null;
  }

  // Build normalized event
  const event: MPEvent = {
    type: eventType,
    id: subscriptionId,
    data: normalizeSubscriptionData(subscription),
    raw: subscription,
    webhook,
  };

  // Call onEvent if provided
  if (config.onEvent) {
    await config.onEvent(event);
  }

  return event;
}

function normalizePaymentEventType(payment: PaymentResponse): MPEventType | null {
  const status = payment.status;

  switch (status) {
    case "approved":
      return "payment.approved";
    case "pending":
      return "payment.pending";
    case "in_process":
      return "payment.in_process";
    case "rejected":
      return "payment.rejected";
    case "cancelled":
      return "payment.cancelled";
    case "refunded":
      return "payment.refunded";
    case "charged_back":
      return "payment.charged_back";
    default:
      // For newly created payments or unknown statuses
      if (payment.id) {
        return "payment.created";
      }
      return null;
  }
}

function normalizeSubscriptionEventType(
  subscription: PreApprovalResponse
): MPEventType | null {
  const status = subscription.status;

  switch (status) {
    case "authorized":
      return "subscription.authorized";
    case "pending":
      return "subscription.pending";
    case "paused":
      return "subscription.paused";
    case "cancelled":
      return "subscription.cancelled";
    default:
      return null;
  }
}

function normalizePaymentData(payment: PaymentResponse): MPEventData {
  return {
    id: payment.id!,
    status: payment.status || "unknown",
    externalReference: payment.external_reference || undefined,
    metadata: payment.metadata || undefined,
    transactionAmount: payment.transaction_amount || undefined,
    currencyId: payment.currency_id || undefined,
    payerEmail: payment.payer?.email || undefined,
    paymentMethodId: payment.payment_method_id || undefined,
  };
}

function normalizeSubscriptionData(subscription: PreApprovalResponse): MPEventData {
  return {
    id: subscription.id!,
    status: subscription.status || "unknown",
    externalReference: subscription.external_reference || undefined,
    reason: subscription.reason || undefined,
    autoRecurring: subscription.auto_recurring
      ? {
          frequency: subscription.auto_recurring.frequency || 0,
          frequencyType: subscription.auto_recurring.frequency_type || "",
          transactionAmount: subscription.auto_recurring.transaction_amount || 0,
          currencyId: subscription.auto_recurring.currency_id || "",
        }
      : undefined,
  };
}
