import { MercadoPagoConfig as MPConfig, Preference } from "mercadopago";
import type {
  MercadoPagoConfig,
  CheckoutRequest,
  CheckoutResponse,
  CheckoutItem,
} from "./types";

const DEFAULT_CURRENCY = "ARS";

export async function createCheckout(
  mpClient: MPConfig,
  config: MercadoPagoConfig,
  data: CheckoutRequest
): Promise<CheckoutResponse> {
  // Build items array
  const items = buildItems(config, data);

  if (items.length === 0) {
    throw new Error(
      "[mercadopago-next] No items provided. Use productId or items array."
    );
  }

  // Build back URLs
  const backUrls = buildBackUrls(config, data);

  // Build preference body
  const preferenceBody: Parameters<Preference["create"]>[0]["body"] = {
    items: items.map((item) => ({
      id: item.id || item.title.toLowerCase().replace(/\s+/g, "_"),
      title: item.title,
      unit_price: item.unitPrice,
      quantity: item.quantity,
      currency_id: item.currencyId || DEFAULT_CURRENCY,
      description: item.description,
      picture_url: item.pictureUrl,
    })),
    back_urls: backUrls,
    auto_return: "approved",
  };

  // Add optional fields
  if (data.metadata) {
    preferenceBody.metadata = data.metadata;
  }

  if (data.externalReference) {
    preferenceBody.external_reference = data.externalReference;
  }

  if (data.payerEmail) {
    preferenceBody.payer = {
      email: data.payerEmail,
    };
  }

  // Create preference
  const preference = await new Preference(mpClient).create({
    body: preferenceBody,
  });

  if (!preference.init_point || !preference.id) {
    throw new Error("[mercadopago-next] Failed to create preference");
  }

  return {
    url: preference.init_point,
    preferenceId: preference.id,
    sandboxUrl: preference.sandbox_init_point || preference.init_point,
  };
}

function buildItems(
  config: MercadoPagoConfig,
  data: CheckoutRequest
): CheckoutItem[] {
  // If custom items provided, use them
  if (data.items && data.items.length > 0) {
    return data.items;
  }

  // If productId provided, look up in config
  if (data.productId) {
    const product = config.products?.[data.productId];

    if (!product) {
      throw new Error(
        `[mercadopago-next] Product "${data.productId}" not found in config.products`
      );
    }

    return [
      {
        id: data.productId,
        title: product.title,
        unitPrice: product.unitPrice,
        quantity: data.quantity || 1,
        currencyId: product.currencyId,
        description: product.description,
        pictureUrl: product.pictureUrl,
      },
    ];
  }

  return [];
}

function buildBackUrls(
  config: MercadoPagoConfig,
  data: CheckoutRequest
): { success?: string; failure?: string; pending?: string } {
  const baseUrl = config.baseUrl || "";

  return {
    success:
      data.successUrl || config.successUrl || `${baseUrl}/payment/success`,
    failure:
      data.failureUrl || config.failureUrl || `${baseUrl}/payment/failure`,
    pending:
      data.pendingUrl || config.pendingUrl || `${baseUrl}/payment/pending`,
  };
}
