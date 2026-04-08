import { createHmac } from "crypto";
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

  // Verify MP signature if webhookSecret is configured
  if (config.webhookSecret) {
    const xSignature = req.headers.get("x-signature");
    const xRequestId = req.headers.get("x-request-id");

    if (!xSignature) {
      return jsonResponse({ error: "Missing x-signature header" }, 401);
    }

    // Parse ts and v1 from "ts=TIMESTAMP,v1=HASH"
    const parts = Object.fromEntries(
      xSignature.split(",").map((part) => part.split("=") as [string, string])
    );
    const ts = parts["ts"];
    const v1 = parts["v1"];

    if (!ts || !v1) {
      return jsonResponse({ error: "Invalid x-signature format" }, 401);
    }

    // Reconstruct the signed template
    const rawBody = await req.text();
    const parsed = JSON.parse(rawBody) as WebhookBody;
    const dataId = parsed.data?.id ?? "";
    const template = [
      `id:${dataId}`,
      xRequestId ? `request-id:${xRequestId}` : null,
      `ts:${ts}`,
    ]
      .filter(Boolean)
      .join(";");

    const expected = createHmac("sha256", config.webhookSecret)
      .update(template)
      .digest("hex");

    if (expected !== v1) {
      return jsonResponse({ error: "Invalid webhook signature" }, 401);
    }

    await processWebhook(parsed, mpClient, config);
  } else {
    const body = (await req.json()) as WebhookBody;
    await processWebhook(body, mpClient, config);
  }

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
