import { MercadoPagoConfig as MPConfig } from "mercadopago";
import type {
  MercadoPagoConfig,
  CheckoutRequest,
  SubscribeRequest,
  WebhookBody,
} from "./types";
import { createCheckout } from "./checkout";
import { createSubscription } from "./subscription";
import { processWebhook } from "./webhook";

export function createHandler(
  mpClient: MPConfig,
  config: MercadoPagoConfig
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const action = pathSegments[pathSegments.length - 1]; // Last segment

    try {
      // Route to appropriate handler
      switch (action) {
        case "checkout":
          return handleCheckout(req, mpClient, config);
        case "subscribe":
          return handleSubscribe(req, mpClient, config);
        case "webhook":
          return handleWebhook(req, mpClient, config);
        case "config":
          return handleConfig(config);
        default:
          return jsonResponse({ error: "Not Found" }, 404);
      }
    } catch (error) {
      console.error("[mercadopago-next] Handler error:", error);
      return jsonResponse(
        {
          error: error instanceof Error ? error.message : "Internal Server Error",
        },
        500
      );
    }
  };
}

async function handleCheckout(
  req: Request,
  mpClient: MPConfig,
  config: MercadoPagoConfig
): Promise<Response> {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const body = (await req.json()) as CheckoutRequest;
  const result = await createCheckout(mpClient, config, body);

  return jsonResponse(result);
}

async function handleSubscribe(
  req: Request,
  mpClient: MPConfig,
  config: MercadoPagoConfig
): Promise<Response> {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const body = (await req.json()) as SubscribeRequest;
  const result = await createSubscription(mpClient, config, body);

  return jsonResponse(result);
}

async function handleWebhook(
  req: Request,
  mpClient: MPConfig,
  config: MercadoPagoConfig
): Promise<Response> {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const body = (await req.json()) as WebhookBody;

  // Process webhook (fetches resource, normalizes event, calls onEvent)
  await processWebhook(body, mpClient, config);

  // Always return 200 to acknowledge receipt
  // MP will retry if we return non-200
  return new Response(null, { status: 200 });
}

function handleConfig(config: MercadoPagoConfig): Response {
  return jsonResponse({
    publicKey: config.publicKey || null,
  });
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
