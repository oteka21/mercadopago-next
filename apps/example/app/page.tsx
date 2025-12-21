"use client";

import { useState } from "react";
import { mpClient } from "@/lib/mp-client";

export default function Home() {
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const handleCheckout = async (productId: string) => {
    setLoading(productId);
    try {
      await mpClient.checkout({ productId });
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Checkout failed. Check console for details.");
    } finally {
      setLoading(null);
    }
  };

  const handleCustomCheckout = async () => {
    setLoading("custom");
    try {
      await mpClient.checkout({
        items: [
          {
            title: "Custom Product",
            unitPrice: 500,
            quantity: 2,
            description: "A custom product created dynamically",
          },
        ],
        metadata: {
          orderId: "custom-123",
          source: "demo",
        },
      });
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Checkout failed. Check console for details.");
    } finally {
      setLoading(null);
    }
  };

  const handleSubscribe = async () => {
    if (!email) {
      alert("Please enter your email for subscription");
      return;
    }

    setLoading("subscribe");
    try {
      await mpClient.subscribe({
        planId: "premium_sub",
        payerEmail: email,
      });
    } catch (error) {
      console.error("Subscribe error:", error);
      alert("Subscribe failed. Check console for details.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            mercadopago-next Demo
          </h1>
          <p className="text-lg text-gray-600">
            The simplest way to integrate Mercado Pago into your Next.js app
          </p>
        </header>

        {/* One-time Payments */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-gray-800">
            One-time Payments (Checkout Pro)
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Pre-configured Product: Monthly */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="mb-4">
                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  Pre-configured
                </span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                Premium Monthly
              </h3>
              <p className="mb-4 text-gray-600">Monthly premium access</p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">$999</span>
                <span className="text-gray-500"> ARS</span>
              </div>
              <button
                onClick={() => handleCheckout("premium_monthly")}
                disabled={loading !== null}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === "premium_monthly" ? "Processing..." : "Buy Now"}
              </button>
            </div>

            {/* Pre-configured Product: Yearly */}
            <div className="rounded-xl bg-white p-6 shadow-lg ring-2 ring-indigo-500">
              <div className="mb-4">
                <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
                  Best Value
                </span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                Premium Yearly
              </h3>
              <p className="mb-4 text-gray-600">
                Yearly premium access - Save 17%!
              </p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">$9,990</span>
                <span className="text-gray-500"> ARS</span>
              </div>
              <button
                onClick={() => handleCheckout("premium_yearly")}
                disabled={loading !== null}
                className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === "premium_yearly" ? "Processing..." : "Buy Now"}
              </button>
            </div>

            {/* Dynamic/Custom Product */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="mb-4">
                <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  Dynamic
                </span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                Custom Product
              </h3>
              <p className="mb-4 text-gray-600">
                Items passed dynamically at checkout
              </p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">$1,000</span>
                <span className="text-gray-500"> ARS (2x $500)</span>
              </div>
              <button
                onClick={handleCustomCheckout}
                disabled={loading !== null}
                className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === "custom" ? "Processing..." : "Buy Custom"}
              </button>
            </div>
          </div>
        </section>

        {/* Subscriptions */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-gray-800">
            Subscriptions
          </h2>

          <div className="rounded-xl bg-white p-6 shadow-lg md:max-w-md">
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              Premium Subscription
            </h3>
            <p className="mb-4 text-gray-600">
              Monthly recurring payment for premium access
            </p>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">$999</span>
              <span className="text-gray-500"> ARS/month</span>
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email (required for subscriptions)
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <button
              onClick={handleSubscribe}
              disabled={loading !== null}
              className="w-full rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === "subscribe" ? "Processing..." : "Subscribe"}
            </button>
          </div>
        </section>

        {/* Code Examples */}
        <section>
          <h2 className="mb-6 text-2xl font-semibold text-gray-800">
            How it works
          </h2>

          <div className="space-y-6">
            <div className="rounded-xl bg-gray-900 p-6 text-sm">
              <p className="mb-2 text-gray-400">
                // Client-side: Start a checkout
              </p>
              <pre className="text-green-400">
                {`await mpClient.checkout({ productId: "premium_monthly" });`}
              </pre>
            </div>

            <div className="rounded-xl bg-gray-900 p-6 text-sm">
              <p className="mb-2 text-gray-400">
                // Client-side: Start a subscription
              </p>
              <pre className="text-green-400">
                {`await mpClient.subscribe({
  planId: "premium_sub",
  payerEmail: "user@email.com",
});`}
              </pre>
            </div>

            <div className="rounded-xl bg-gray-900 p-6 text-sm">
              <p className="mb-2 text-gray-400">
                // Server-side: Handle webhook events
              </p>
              <pre className="text-green-400">
                {`onEvent: async (event) => {
  if (event.type === "payment.approved") {
    // Fulfill order
  }
}`}
              </pre>
            </div>
          </div>
        </section>

        <footer className="mt-12 text-center text-gray-500">
          <p>
            Built with{" "}
            <a
              href="https://github.com/your-repo/mercadopago-next"
              className="text-blue-600 hover:underline"
            >
              mercadopago-next
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
