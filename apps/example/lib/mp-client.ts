import { createMPClient } from "mercadopago-next/client";

export const mpClient = createMPClient({
  baseUrl: "/api/mp",
});
