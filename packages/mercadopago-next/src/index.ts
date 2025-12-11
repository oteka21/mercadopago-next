// Server exports
export { createMercadoPago } from "./server";
export type {
  MercadoPagoConfig,
  MercadoPagoInstance,
  ProductConfig,
  PlanConfig,
  CheckoutRequest,
  CheckoutResponse,
  CheckoutItem,
  SubscribeRequest,
  SubscribeResponse,
  MPEvent,
  MPEventType,
  MPEventData,
  WebhookBody,
} from "./server";

// Client exports
export { createMPClient } from "./client";
export type {
  MPClientConfig,
  MPClientCheckoutOptions,
  MPClientSubscribeOptions,
  MPClient,
  CheckoutResult,
  SubscribeResult,
  ConfigResult,
} from "./client";
