## 🌎 What we want to build

We’re building **`mercadopago-next`**, a TypeScript SDK that makes it **stupid-simple to integrate Mercado Pago into a Next.js app**, inspired by the DX of **better-auth** and using **Goncy’s Mercado Pago starter** as a reference.

**Goal (v1):**

* A **server-side SDK** that:

  * Initializes Mercado Pago with config (`accessToken`, `publicKey`, callbacks, etc.).
  * Exposes a single **`handler`** that can be plugged directly into a Next.js route (App Router).
  * Handles **checkout creation** (preferences) and **webhooks** in a unified way.

* A **client-side SDK** that:

  * Provides a simple **`createMPClient`** function for the browser.
  * Exposes methods like `checkout()` to start a payment flow by calling our backend routes.

Think of it as:

> “better-auth, but for Mercado Pago + Next.js”

Not generic “all PSPs” yet. Just **one job done extremely well: Mercado Pago in Next**.

Later, with the learnings from this, we can think about a more generic **better-pay / next-payments** library.

---

## 📦 Project structure (monorepo)

We’re using a **pnpm workspace monorepo**:

```txt
mercadopago-next-monorepo/
│
├── pnpm-workspace.yaml
│
├── packages/
│   └── mercadopago-next/         # The SDK/library
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsup.config.ts
│       ├── src/
│       │   ├── index.ts          # Public exports
│       │   ├── server/
│       │   │   ├── index.ts      # Re-exports server API
│       │   │   ├── core.ts       # createMercadoPago(config)
│       │   │   └── handler.ts    # mp.handler(req) – Next.js route handler
│       │   └── client/
│       │       ├── index.ts      # Re-exports client API
│       │       └── core.ts       # createMPClient({ baseUrl })
│       └── dist/                 # Build output (tsup) – main/module/types point here
│
└── apps/
    └── example/                  # Next.js app to test the SDK
        ├── app/
        │   └── page.tsx          # Imports mercadopago-next for manual testing
        └── next.config.mjs
```

---

## 🧠 High-level API design

**Server side (in user’s app):**

```ts
// apps/example/lib/mp.ts
import { createMercadoPago } from "mercadopago-next/server";

export const mp = createMercadoPago({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  publicKey: process.env.MP_PUBLIC_KEY,
  baseSuccessUrl: "https://myapp.com/payment/success",
  baseFailureUrl: "https://myapp.com/payment/failure",
  onEvent: async (event) => {
    // Normalize webhook events here
    // e.g. event.type === "payment.succeeded"
    // update DB, call RevenueCat, etc.
  },
});
```

```ts
// apps/example/app/api/mp/[...all]/route.ts
import { mp } from "@/lib/mp";

export const POST = mp.handler;
export const GET = mp.handler;
```

**Client side (in user’s app):**

```ts
// apps/example/lib/mp-client.ts
import { createMPClient } from "mercadopago-next/client";

export const mpClient = createMPClient({
  baseUrl: "/api/mp",
});
```

```tsx
"use client";

import { mpClient } from "@/lib/mp-client";

export function PayButton() {
  const handleClick = async () => {
    await mpClient.checkout({
      productId: "premium_monthly",
    });
  };

  return <button onClick={handleClick}>Pay with Mercado Pago</button>;
}
```

Internally, `mercadopago-next` will:

* Use the official **`mercadopago`** Node SDK on the server.
* (Optionally) integrate **`@mercadopago/sdk-js`** on the client for more advanced flows (Bricks, etc.) in later iterations.
* Normalize Mercado Pago webhooks into a consistent event shape passed to `onEvent`.

---

## 📚 References you’ll bring into Cursor

You’ll use as **reference (not copy-paste)**:

* **better-auth docs & code**

  * For the concept of `createX(config)`, `handler`, and provider-based design.
* **Goncy’s Mercado Pago starter**

  * For the “raw” integration details with Mercado Pago (preferences, webhooks, etc.).

---

If quieres, next step in Cursor can be:

* scaffold `src/server/core.ts`, `src/server/handler.ts`, `src/client/core.ts`, and `src/index.ts` with minimal but real code, so you can start iterating on the DX.

## Better-auth basic usage

# Basic Usage

Getting started with Better Auth

***

title: Basic Usage
description: Getting started with Better Auth
---------------------------------------------

Better Auth provides built-in authentication support for:

* **Email and password**
* **Social provider (Google, GitHub, Apple, and more)**

But also can easily be extended using plugins, such as: [username](/docs/plugins/username), [magic link](/docs/plugins/magic-link), [passkey](/docs/plugins/passkey), [email-otp](/docs/plugins/email-otp), and more.

## Email & Password

To enable email and password authentication:

```ts title="auth.ts"
import { betterAuth } from "better-auth"

export const auth = betterAuth({
    emailAndPassword: {    // [!code highlight]
        enabled: true // [!code highlight]
    } // [!code highlight]
})
```

### Sign Up

To sign up a user you need to call the client method `signUp.email` with the user's information.

```ts title="sign-up.ts"
import { authClient } from "@/lib/auth-client"; //import the auth client // [!code highlight]

const { data, error } = await authClient.signUp.email({
        email, // user email address
        password, // user password -> min 8 characters by default
        name, // user display name
        image, // User image URL (optional)
        callbackURL: "/dashboard" // A URL to redirect to after the user verifies their email (optional)
    }, {
        onRequest: (ctx) => {
            //show loading
        },
        onSuccess: (ctx) => {
            //redirect to the dashboard or sign in page
        },
        onError: (ctx) => {
            // display the error message
            alert(ctx.error.message);
        },
});
```

By default, the users are automatically signed in after they successfully sign up. To disable this behavior you can set `autoSignIn` to `false`.

```ts title="auth.ts"
import { betterAuth } from "better-auth"

export const auth = betterAuth({
    emailAndPassword: {
    	enabled: true,
    	autoSignIn: false //defaults to true // [!code highlight]
  },
})
```

### Sign In

To sign a user in, you can use the `signIn.email` function provided by the client.

```ts title="sign-in"
const { data, error } = await authClient.signIn.email({
        /**
         * The user email
         */
        email,
        /**
         * The user password
         */
        password,
        /**
         * A URL to redirect to after the user verifies their email (optional)
         */
        callbackURL: "/dashboard",
        /**
         * remember the user session after the browser is closed. 
         * @default true
         */
        rememberMe: false
}, {
    //callbacks
})
```

<Callout type="warn">
  Always invoke client methods from the client side. Don't call them from the server.
</Callout>

### Server-Side Authentication

To authenticate a user on the server, you can use the `auth.api` methods.

```ts title="server.ts"
import { auth } from "./auth"; // path to your Better Auth server instance

const response = await auth.api.signInEmail({
    body: {
        email,
        password
    },
    asResponse: true // returns a response object instead of data
});
```

<Callout>
  If the server cannot return a response object, you'll need to manually parse and set cookies. But for frameworks like Next.js we provide [a plugin](/docs/integrations/next#server-action-cookies) to handle this automatically
</Callout>

## Social Sign-On

Better Auth supports multiple social providers, including Google, GitHub, Apple, Discord, and more. To use a social provider, you need to configure the ones you need in the `socialProviders` option on your `auth` object.

```ts title="auth.ts"
import { betterAuth } from "better-auth";

export const auth = betterAuth({
    socialProviders: { // [!code highlight]
        github: { // [!code highlight]
            clientId: process.env.GITHUB_CLIENT_ID!, // [!code highlight]
            clientSecret: process.env.GITHUB_CLIENT_SECRET!, // [!code highlight]
        } // [!code highlight]
    }, // [!code highlight]
})
```

### Sign in with social providers

To sign in using a social provider you need to call `signIn.social`. It takes an object with the following properties:

```ts title="sign-in.ts"
import { authClient } from "@/lib/auth-client"; //import the auth client // [!code highlight]

await authClient.signIn.social({
    /**
     * The social provider ID
     * @example "github", "google", "apple"
     */
    provider: "github",
    /**
     * A URL to redirect after the user authenticates with the provider
     * @default "/"
     */
    callbackURL: "/dashboard", 
    /**
     * A URL to redirect if an error occurs during the sign in process
     */
    errorCallbackURL: "/error",
    /**
     * A URL to redirect if the user is newly registered
     */
    newUserCallbackURL: "/welcome",
    /**
     * disable the automatic redirect to the provider. 
     * @default false
     */
    disableRedirect: true,
});
```

You can also authenticate using `idToken` or `accessToken` from the social provider instead of redirecting the user to the provider's site. See social providers documentation for more details.

## Signout

To signout a user, you can use the `signOut` function provided by the client.

```ts title="user-card.tsx"
await authClient.signOut();
```

you can pass `fetchOptions` to redirect onSuccess

```ts title="user-card.tsx" 
await authClient.signOut({
  fetchOptions: {
    onSuccess: () => {
      router.push("/login"); // redirect to login page
    },
  },
});
```

## Session

Once a user is signed in, you'll want to access the user session. Better Auth allows you to easily access the session data from both the server and client sides.

### Client Side

#### Use Session

Better Auth provides a `useSession` hook to easily access session data on the client side. This hook is implemented using nanostore and has support for each supported framework and vanilla client, ensuring that any changes to the session (such as signing out) are immediately reflected in your UI.

<Tabs items={["React", "Vue","Svelte", "Solid", "Vanilla"]} defaultValue="react">
  <Tab value="React">
    ```tsx title="user.tsx"
    import { authClient } from "@/lib/auth-client" // import the auth client // [!code highlight] 

    export function User(){

        const { // [!code highlight]
            data: session, // [!code highlight]
            isPending, //loading state // [!code highlight]
            error, //error object // [!code highlight]
            refetch //refetch the session
        } = authClient.useSession() // [!code highlight]

        return (
            //...
        )
    }
    ```
  </Tab>

  <Tab value="Vue">
    ```vue title="index.vue"
    <script setup lang="ts">
    import { authClient } from "~/lib/auth-client" // [!code highlight]

    const session = authClient.useSession() // [!code highlight]
    </script>

    <template>
        <div>
            <div>
                <pre>{{ session.data }}</pre>
                <button v-if="session.data" @click="authClient.signOut()">
                    Sign out
                </button>
            </div>
        </div>
    </template>
    ```
  </Tab>

  <Tab value="Svelte">
    ```svelte title="user.svelte"
    <script lang="ts">
    import { authClient } from "$lib/auth-client"; // [!code highlight]

    const session = authClient.useSession(); // [!code highlight]
    </script>
    <p>
        {$session.data?.user.email}
    </p>
    ```
  </Tab>

  <Tab value="Vanilla">
    ```ts title="user.svelte"
    import { authClient } from "~/lib/auth-client"; //import the auth client

    authClient.useSession.subscribe((value)=>{
        //do something with the session //
    }) 
    ```
  </Tab>

  <Tab value="Solid">
    ```tsx title="user.tsx"
    import { authClient } from "~/lib/auth-client"; // [!code highlight]

    export default function Home() {
        const session = authClient.useSession() // [!code highlight]
        return (
            <pre>{JSON.stringify(session(), null, 2)}</pre>
        );
    }
    ```
  </Tab>
</Tabs>

#### Get Session

If you prefer not to use the hook, you can use the `getSession` method provided by the client.

```ts title="user.tsx"
import { authClient } from "@/lib/auth-client" // import the auth client // [!code highlight]

const { data: session, error } = await authClient.getSession()
```

You can also use it with client-side data-fetching libraries like [TanStack Query](https://tanstack.com/query/latest).

### Server Side

The server provides a `session` object that you can use to access the session data. It requires request headers object to be passed to the `getSession` method.

**Example: Using some popular frameworks**

<Tabs items={["Next.js", "Nuxt", "Svelte", "Astro", "Hono", "TanStack"]}>
  <Tab value="Next.js">
    ```ts title="server.ts"
    import { auth } from "./auth"; // path to your Better Auth server instance
    import { headers } from "next/headers";

    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    ```
  </Tab>

  <Tab value="Remix">
    ```ts title="route.ts"
    import { auth } from "lib/auth"; // path to your Better Auth server instance

    export async function loader({ request }: LoaderFunctionArgs) {
        const session = await auth.api.getSession({
            headers: request.headers
        })

        return json({ session })
    }
    ```
  </Tab>

  <Tab value="Astro">
    ```astro title="index.astro"
    ---
    import { auth } from "./auth";

    const session = await auth.api.getSession({
        headers: Astro.request.headers,
    });
    ---
    <!-- Your Astro Template -->
    ```
  </Tab>

  <Tab value="Svelte">
    ```ts title="+page.ts"
    import { auth } from "./auth";

    export async function load({ request }) {
        const session = await auth.api.getSession({
            headers: request.headers
        })
        return {
            props: {
                session
            }
        }
    }
    ```
  </Tab>

  <Tab value="Hono">
    ```ts title="index.ts"
    import { auth } from "./auth";

    const app = new Hono();

    app.get("/path", async (c) => {
        const session = await auth.api.getSession({
            headers: c.req.raw.headers
        })
    });
    ```
  </Tab>

  <Tab value="Nuxt">
    ```ts title="server/session.ts"
    import { auth } from "~/utils/auth";

    export default defineEventHandler((event) => {
        const session = await auth.api.getSession({
            headers: event.headers,
        })
    });
    ```
  </Tab>

  <Tab value="TanStack">
    ```ts title="app/routes/api/index.ts"
    import { auth } from "./auth";
    import { createAPIFileRoute } from "@tanstack/start/api";

    export const APIRoute = createAPIFileRoute("/api/$")({
        GET: async ({ request }) => {
            const session = await auth.api.getSession({
                headers: request.headers
            })
        },
    });
    ```
  </Tab>
</Tabs>

<Callout>
  For more details check [session-management](/docs/concepts/session-management) documentation.
</Callout>

## Using Plugins

One of the unique features of Better Auth is a plugins ecosystem. It allows you to add complex auth related functionality with small lines of code.

Below is an example of how to add two factor authentication using two factor plugin.

<Steps>
  <Step>
    ### Server Configuration

    To add a plugin, you need to import the plugin and pass it to the `plugins` option of the auth instance. For example, to add two factor authentication, you can use the following code:

    ```ts title="auth.ts"
    import { betterAuth } from "better-auth"
    import { twoFactor } from "better-auth/plugins" // [!code highlight]

    export const auth = betterAuth({
        //...rest of the options
        plugins: [ // [!code highlight]
            twoFactor() // [!code highlight]
        ] // [!code highlight]
    })
    ```

    now two factor related routes and method will be available on the server.
  </Step>

  <Step>
    ### Migrate Database

    After adding the plugin, you'll need to add the required tables to your database. You can do this by running the `migrate` command, or by using the `generate` command to create the schema and handle the migration manually.

    generating the schema:

    ```bash title="terminal"
    npx @better-auth/cli generate
    ```

    using the `migrate` command:

    ```bash title="terminal"
    npx @better-auth/cli migrate
    ```

    <Callout>
      If you prefer adding the schema manually, you can check the schema required on the [two factor plugin](/docs/plugins/2fa#schema) documentation.
    </Callout>
  </Step>

  <Step>
    ### Client Configuration

    Once we're done with the server, we need to add the plugin to the client. To do this, you need to import the plugin and pass it to the `plugins` option of the auth client. For example, to add two factor authentication, you can use the following code:

    ```ts title="auth-client.ts"  
    import { createAuthClient } from "better-auth/client";
    import { twoFactorClient } from "better-auth/client/plugins"; // [!code highlight]

    const authClient = createAuthClient({
        plugins: [ // [!code highlight]
            twoFactorClient({ // [!code highlight]
                twoFactorPage: "/two-factor" // the page to redirect if a user needs to verify 2nd factor // [!code highlight]
            }) // [!code highlight]
        ] // [!code highlight]
    })
    ```

    now two factor related methods will be available on the client.

    ```ts title="profile.ts"
    import { authClient } from "./auth-client"

    const enableTwoFactor = async() => {
        const data = await authClient.twoFactor.enable({
            password // the user password is required
        }) // this will enable two factor
    }

    const disableTwoFactor = async() => {
        const data = await authClient.twoFactor.disable({
            password // the user password is required
        }) // this will disable two factor
    }

    const signInWith2Factor = async() => {
        const data = await authClient.signIn.email({
            //...
        })
        //if the user has two factor enabled, it will redirect to the two factor page
    }

    const verifyTOTP = async() => {
        const data = await authClient.twoFactor.verifyTOTP({
            code: "123456", // the code entered by the user 
            /**
             * If the device is trusted, the user won't
             * need to pass 2FA again on the same device
             */
            trustDevice: true
        })
    }
    ```
  </Step>

  <Step>
    Next step: See the <Link href="/docs/plugins/2fa">two factor plugin documentation</Link>.
  </Step>
</Steps>

## better-auth nextjs specific integration
# Next.js integration

Integrate Better Auth with Next.js.

***

title: Next.js integration
description: Integrate Better Auth with Next.js.
------------------------------------------------

Better Auth can be easily integrated with Next.js. Before you start, make sure you have a Better Auth instance configured. If you haven't done that yet, check out the [installation](/docs/installation).

### Create API Route

We need to mount the handler to an API route. Create a route file inside `/api/auth/[...all]` directory. And add the following code:

```ts title="api/auth/[...all]/route.ts"
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

<Callout type="info">
  You can change the path on your better-auth configuration but it's recommended to keep it as `/api/auth/[...all]`
</Callout>

For `pages` route, you need to use `toNodeHandler` instead of `toNextJsHandler` and set `bodyParser` to `false` in the `config` object. Here is an example:

```ts title="pages/api/auth/[...all].ts"
import { toNodeHandler } from "better-auth/node"
import { auth } from "@/lib/auth"

// Disallow body parsing, we will parse it manually
export const config = { api: { bodyParser: false } }

export default toNodeHandler(auth.handler)
```

## Create a client

Create a client instance. You can name the file anything you want. Here we are creating `client.ts` file inside the `lib/` directory.

```ts title="auth-client.ts"
import { createAuthClient } from "better-auth/react" // make sure to import from better-auth/react

export const authClient =  createAuthClient({
    //you can pass client configuration here
})
```

Once you have created the client, you can use it to sign up, sign in, and perform other actions.
Some of the actions are reactive. The client uses [nano-store](https://github.com/nanostores/nanostores) to store the state and re-render the components when the state changes.

The client also uses [better-fetch](https://github.com/bekacru/better-fetch) to make the requests. You can pass the fetch configuration to the client.

## RSC and Server actions

The `api` object exported from the auth instance contains all the actions that you can perform on the server. Every endpoint made inside Better Auth is a invocable as a function. Including plugins endpoints.

**Example: Getting Session on a server action**

```tsx title="server.ts"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const someAuthenticatedAction = async () => {
    "use server";
    const session = await auth.api.getSession({
        headers: await headers()
    })
};
```

**Example: Getting Session on a RSC**

```tsx
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function ServerComponent() {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if(!session) {
        return <div>Not authenticated</div>
    }
    return (
        <div>
            <h1>Welcome {session.user.name}</h1>
        </div>
    )
}
```

<Callout type="warn">As RSCs cannot set cookies, the [cookie cache](/docs/concepts/session-management#cookie-cache) will not be refreshed until the server is interacted with from the client via Server Actions or Route Handlers.</Callout>

### Server Action Cookies

When you call a function that needs to set cookies, like `signInEmail` or `signUpEmail` in a server action, cookies won’t be set. This is because server actions need to use the `cookies` helper from Next.js to set cookies.

To simplify this, you can use the `nextCookies` plugin, which will automatically set cookies for you whenever a `Set-Cookie` header is present in the response.

```ts title="auth.ts"
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    //...your config
    plugins: [nextCookies()] // make sure this is the last plugin in the array // [!code highlight]
})
```

Now, when you call functions that set cookies, they will be automatically set.

```ts
"use server";
import { auth } from "@/lib/auth"

const signIn = async () => {
    await auth.api.signInEmail({
        body: {
            email: "user@email.com",
            password: "password",
        }
    })
}
```

## Auth Protection

In Next.js proxy/middleware, it's recommended to only check for the existence of a session cookie to handle redirection. To avoid blocking requests by making API or database calls.

### Next.js 16+ (Proxy)

Next.js 16 replaces "middleware" with "proxy". You can use the Node.js runtime for full session validation with database checks:

```ts title="proxy.ts"
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    // THIS IS NOT SECURE!
    // This is the recommended approach to optimistically redirect users
    // We recommend handling auth checks in each page/route
    if(!session) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard"], // Specify the routes the middleware applies to
};
```

For cookie-only checks (faster but less secure), use `getSessionCookie`:

```ts title="proxy.ts"
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);

    // THIS IS NOT SECURE!
    // This is the recommended approach to optimistically redirect users
    // We recommend handling auth checks in each page/route
	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard"], // Specify the routes the middleware applies to
};
```

<Callout type="info">
  **Migration from middleware:** Rename `middleware.ts` → `proxy.ts` and `middleware` → `proxy` function. All Better Auth methods work identically.
</Callout>

### Next.js 15.2.0+ (Node.js Runtime Middleware)

From Next.js 15.2.0, you can use the Node.js runtime in middleware for full session validation with database checks:

```ts title="middleware.ts"
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    // THIS IS NOT SECURE!
    // This is the recommended approach to optimistically redirect users
    // We recommend handling auth checks in each page/route
    if(!session) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    return NextResponse.next();
}

export const config = {
  runtime: "nodejs", // Required for auth.api calls
  matcher: ["/dashboard"], // Specify the routes the middleware applies to
};
```

<Callout type="warn">
  Node.js runtime in middleware is experimental in Next.js versions before 16. Consider upgrading to Next.js 16+ for stable proxy support.
</Callout>

### Next.js 13-15.1.x (Edge Runtime Middleware)

In older Next.js versions, middleware runs on the Edge Runtime and cannot make database calls. Use cookie-based checks for optimistic redirects:

<Callout type="warn">
  The <code>getSessionCookie()</code> function does not automatically reference the auth config specified in <code>auth.ts</code>. Therefore, if you customized the cookie name or prefix, you need to ensure that the configuration in <code>getSessionCookie()</code> matches the config defined in your <code>auth.ts</code>.
</Callout>

#### For Next.js release `15.1.7` and below

If you need the full session object, you'll have to fetch it from the `/api/auth/get-session` API route. Since Next.js middleware doesn't support running Node.js APIs directly, you must make an HTTP request.

<Callout>
  The example uses [better-fetch](https://better-fetch.vercel.app), but you can use any fetch library.
</Callout>

```ts title="middleware.ts"
import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Session = typeof auth.$Infer.Session;

export async function middleware(request: NextRequest) {
	const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
		baseURL: request.nextUrl.origin,
		headers: {
			cookie: request.headers.get("cookie") || "", // Forward the cookies from the request
		},
	});

	if (!session) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard"], // Apply middleware to specific routes
};
```

#### For Next.js release `15.2.0` and above

From Next.js 15.2.0, you can use the Node.js runtime in middleware for full session validation with database checks:

<Callout type="warn">
  You may refer to the [Next.js documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware#runtime) for more information about runtime configuration, and how to enable it.
  Be careful when using the new runtime. It's an experimental feature and it may be subject to breaking changes.
</Callout>

```ts title="middleware.ts"
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if(!session) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/dashboard"], // Apply middleware to specific routes
};
```

#### Cookie-based checks (recommended for all versions)

```ts title="middleware.ts"
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);

    // THIS IS NOT SECURE!
    // This is the recommended approach to optimistically redirect users
    // We recommend handling auth checks in each page/route
	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard"], // Specify the routes the middleware applies to
};
```

<Callout type="warn">
  **Security Warning:** The `getSessionCookie` function only checks for the
  existence of a session cookie; it does **not** validate it. Relying solely
  on this check for security is dangerous, as anyone can manually create a
  cookie to bypass it. You must always validate the session on your server for
  any protected actions or pages.
</Callout>

<Callout type="info">
  If you have a custom cookie name or prefix, you can pass it to the `getSessionCookie` function.

  ```ts
  const sessionCookie = getSessionCookie(request, {
      cookieName: "my_session_cookie",
      cookiePrefix: "my_prefix"
  });
  ```
</Callout>

Alternatively, you can use the `getCookieCache` helper to get the session object from the cookie cache.

```ts title="middleware.ts"
import { getCookieCache } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
	const session = await getCookieCache(request);
	if (!session) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}
	return NextResponse.next();
}
```

### How to handle auth checks in each page/route

In this example, we are using the `auth.api.getSession` function within a server component to get the session object,
then we are checking if the session is valid. If it's not, we are redirecting the user to the sign-in page.

```tsx title="app/dashboard/page.tsx"
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if(!session) {
        redirect("/sign-in")
    }

    return <h1>Welcome {session.user.name}</h1>
}
```

## Next.js 16 Compatibility

Better Auth is fully compatible with Next.js 16. The main change is that "middleware" is now called "proxy". See the [Auth Protection](#auth-protection) section above for Next.js 16+ proxy examples.

### Migration Guide

Use Next.js codemod for automatic migration:

```bash
npx @next/codemod@canary middleware-to-proxy .
```

Or manually:

* Rename `middleware.ts` → `proxy.ts`
* Change function name: `middleware` → `proxy`

All Better Auth methods work identically. See the [Next.js migration guide](https://nextjs.org/docs/app/api-reference/file-conventions/proxy#migration-to-proxy) for details.

## Goncy implementation example 
Selected Files Directory Structure:

└── ./
    ├── configuracion
    │   ├── clonar-aplicacion
    │   │   └── README.md
    │   ├── crear-aplicacion
    │   │   └── README.md
    │   ├── credenciales
    │   │   └── README.md
    │   ├── cuentas-de-prueba
    │   │   └── README.md
    │   ├── exponer-puerto
    │   │   └── README.md
    │   └── webhook
    │       └── README.md
    ├── integraciones
    │   ├── checkout-api
    │   │   ├── src
    │   │   │   ├── app
    │   │   │   │   ├── layout.tsx
    │   │   │   │   ├── message-form.tsx
    │   │   │   │   └── page.tsx
    │   │   │   └── api.ts
    │   │   ├── .env.example
    │   │   ├── README.md
    │   │   └── window.d.ts
    │   ├── checkout-bricks
    │   │   ├── src
    │   │   │   ├── app
    │   │   │   │   ├── layout.tsx
    │   │   │   │   ├── message-form.tsx
    │   │   │   │   └── page.tsx
    │   │   │   └── api.ts
    │   │   ├── .env.example
    │   │   ├── README.md
    │   │   └── window.d.ts
    │   ├── checkout-pro
    │   │   ├── src
    │   │   │   ├── app
    │   │   │   │   ├── api
    │   │   │   │   │   └── mercadopago
    │   │   │   │   │       └── route.ts
    │   │   │   │   ├── layout.tsx
    │   │   │   │   └── page.tsx
    │   │   │   └── api.ts
    │   │   ├── .env.example
    │   │   └── README.md
    │   ├── marketplace
    │   │   ├── src
    │   │   │   ├── app
    │   │   │   │   ├── api
    │   │   │   │   │   └── mercadopago
    │   │   │   │   │       ├── connect
    │   │   │   │   │       │   └── route.ts
    │   │   │   │   │       └── route.ts
    │   │   │   │   ├── layout.tsx
    │   │   │   │   └── page.tsx
    │   │   │   └── api.ts
    │   │   ├── .env.example
    │   │   └── README.md
    │   └── suscripciones
    │       ├── src
    │       │   ├── app
    │       │   │   ├── api
    │       │   │   │   └── mercadopago
    │       │   │   │       └── route.ts
    │       │   │   ├── layout.tsx
    │       │   │   └── page.tsx
    │       │   └── api.ts
    │       ├── .env.example
    │       ├── README.md
    │       └── window.d.ts
    └── README.md



--- README.md ---

# Integración de Mercado Pago en Next.js

En este respositorio vamos a aprender a integrar Mercado Pago en una aplicación de comentarios utilizando Next.js con App Router. El fin de la aplicación es poder agregar mensajes a una lista de mensajes.

## Índice

Vamos a tener diferentes carpetas y aplicaciones para cada tipo de integración, así mantenemos el código simple y podemos enfocarnos en lo que nos interesa.

1. Integraciones
    1. [Checkout Pro](./integraciones/checkout-pro/README.md): Los usuarios van a tener que pagar para poder agregar un mensaje a la lista. Usamos Checkout Pro para crear una preferencia de pago y redirigir al usuario a Mercado Pago para que pueda pagar. Configuramos un webhook para recibir notificaciones del pago y verificar la autenticidad de la notificación.
    2. [Suscripciones](./integraciones/suscripciones/README.md): Los usuarios van a tener que suscribirse para poder agregar un mensaje a la lista. Usamos Suscripciones sin plan asociado con pago pendiente. Configuramos un webhook para recibir notificaciones de suscripción y verificar la autenticidad de la notificación.
    3. [Checkout Bricks](./integraciones/checkout-bricks/README.md): Los usuarios van a tener que pagar para poder agregar un mensaje a la lista. Usamos Checkout Bricks para tomar los datos de pago dentro de nuestra aplicación.
    4. [Split de pagos (Marketplace)](./integraciones/marketplace/README.md): Vamos a ser el intermediario entre un usuario de nuestra aplicación que quiere recibir mensajes en su muro y un usuario que quiere pagar para escribir en ese muro. Vamos a usar Checkout Pro con la integración de Marketplace para quedarnos con una ganancia por cada mensaje.
    5. [Checkout API](./integraciones/checkout-api/README.md): Los usuarios van a pagar desde nuestra plataforma y usando nuestros propios componentes, lo que permite tener una UI más adaptada a nuestras necesidades. Vamos a usar la librería de componentes de React de MercadoPago para poder pagar de manera segura y compliant.
2. Configuración
    1. [Clonar el repositorio](./configuracion/clonar-aplicacion/README.md): Como clonar el repositorio y correr las aplicaciones iniciales.
    2. [Crear una aplicación en Mercado Pago](./configuracion/crear-aplicacion/README.md): Como entrar al panel de desarrolladores de Mercado Pago y crear una aplicación.
    3. [Cuentas de prueba](./configuracion/cuentas-de-prueba/README.md): Como crear cuentas de prueba y usar tarjetas de prueba.
    4. [Credenciales](./configuracion/credenciales/README.md): Que son y que tipo de credenciales existen, cuando y como usarlas.
    4. [Exponer un puerto públicamente](./configuracion/exponer-puerto/README.md): Como hacer que Mercado Pago se pueda comunicar con nuestra aplicación mientras corre en local, muy útil para recibir notificaciones de pago y suscripciones durante el desarrollo.
    5. [Recibir notificaciones de pago y suscripciones](./configuracion/webhook/README.md): Como configurar un webhook en nuestra aplicación para recibir notificaciones de pago y suscripciones.

---

Si te gusta mi contenido, seguime en [Twitter](https://twitter.gonzalopozzo.com), en [Twitch](https://twitch.gonzalopozzo.com), en [YouTube](https://youtube.gonzalopozzo.com), doname un [Cafecito](https://cafecito.gonzalopozzo.com) o volvete [sponsor en github](https://github.com/sponsors/goncy) ✨


--- configuracion/clonar-aplicacion/README.md ---

# Clonar la aplicación inicial

Cada uno de los tutoriales sobre integraciones posee una aplicación Next.js con código inicial para que puedas clonarla y empezar a trabajar.

## Índice

1. [Pre-requisitos](#pre-requisitos)
2. [Clonar el repositorio](#clonar-el-repositorio)
3. [Abrir el proyecto en tu editor de código](#abrir-el-proyecto-en-tu-editor-de-código)
4. [Instalar las dependencias](#instalar-las-dependencias)
5. [Correr la aplicación](#correr-la-aplicación)

## Pre-requisitos

Para poder correr el proyecto vamos a necesitar:

- Tener [Git](https://git-scm.com/downloads) instalado.
- Tener [Node.js](https://nodejs.org/en/download/) instalado.
- Tener [algún editor de código instalado](https://code.visualstudio.com/download).

## Clonar el repositorio

Abrimos la terminal y nos paramos en la carpeta donde queremos clonar el repositorio. Y ejecutamos:

```bash
git clone https://github.com/goncy/next-mercadopago.git
```

Una vez clonado el repositorio, accedemos a la carpeta:

```bash
cd next-mercadopago
```

Luego, nos movemos a la carpeta del proyecto que queremos ejecutar. Cada integración posee su propia carpeta:

```bash
# Si queremos implementar Checkout Pro
cd integraciones/checkout-pro

# Si queremos implementar Suscripciones
cd integraciones/suscripciones

# Si queremos implementar Checkout Bricks
cd integraciones/checkout-bricks

# Si queremos implementar Marketplace
cd integraciones/marketplace
```

## Abrir el proyecto en tu editor de código

Ahora vamos a abrir nuestro editor de código y abrir la carpeta del proyecto. Asegurate de abrir la carpeta del proyecto, no el repositorio completo.

## Instalar las dependencias

Ahora vamos a instalar las dependencias ejecutando:

```bash
npm install
```

> [!NOTE]
> Podes usar `pnpm` u otro gestor de paquetes en vez de `npm` para instalar las dependencias si querés.

## Correr la aplicación

Ahora para correr la aplicación ejecutamos:

```bash
npm run dev
```

Si vamos al navegador y accedemos a `http://localhost:3000` deberíamos ver la aplicación funcionando.

> [!NOTE]
> Algunas integraciones como `Checkout Bricks` o `Checkout API` necesitan correr en una conexión segura (HTTPS). Los proyectos ya están configurados usando el flag [`--experimental-https` de Next.js](https://nextjs.org/docs/app/api-reference/cli/next#using-https-during-development). En esos casos recordá ingresar a `https://localhost:3000` en vez de `http://localhost:3000`. También recordalo a la hora de [exponer el puerto](../exponer-puerto/README.md) o cualquier cosa que refiera a localhost.

---

[Volver al inicio](../../README.md)


--- configuracion/crear-aplicacion/README.md ---

# Crear aplicación de Mercado Pago

En este documento vamos a ver como crear una aplicación en Mercado Pago para luego usar en nuestra aplicación Next.js. Cada aplicación de Mercado Pago tiene un conjunto de credenciales, configuraciones y nos permite configurar notificaciones de eventos relacionados con transacciones.

Vamos a ir a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel/app) y creamos una nueva aplicación.

![image](./screenshots/crear-aplicacion.jpg)

Una vez dentro, cargamos todos los datos de nuestra aplicación. En "¿Qué producto estás integrando?" vas a elegir el que quieras integrar.

![image](./screenshots/app-form.jpg)

Una vez creada la aplicación vamos a ser redirigidos a la pantalla de integración.

---

[Volver al inicio](../../README.md)


--- configuracion/credenciales/README.md ---

# Credenciales

Las credenciales son las claves, públicas o privadas, que vamos a usar desde nuestra aplicación Next.js para interactuar con Mercado Pago.

Las credenciales pueden ser de dos tipos:

- **Credenciales de producción**: Usamos estas credenciales para interactuar con Mercado Pago en un entorno real.
- **Credenciales de prueba**: Usamos estas credenciales para interactuar con Mercado Pago en un entorno de pruebas.

Pero no todo es tan simple... En algunas integraciones, como `Checkout Bricks`, vamos a crear una aplicación y durante la etapa de desarrollo vamos a usar las credenciales de prueba de esa aplicación.

Pero para otras integraciones, como `Checkout Pro` o `Suscripciones`...

![image](./screenshots/prueba-checkoutpro.jpg)

Vamos a tener que iniciar sesión con una cuenta de prueba (generalmente la cuenta de Vendedor) y crear una aplicación, de la misma manera que lo haríamos con una cuenta real, para usar las credenciales de **producción** de esa aplicación durante la etapa de desarrollo. Vamos a usar las credenciales de **producción** de nuestra cuenta de **prueba**, porque en en una cuenta de **prueba** producción es **prueba**.

No me mires a mi, yo no hice las reglas...

Dependiendo de cuales nescesites, una vez hayas ingresado a tu aplicación, vas a encontrar en el panel izquierdo los links a `Credenciales de producción` o `Credenciales de prueba` de tu aplicación.

![image](./screenshots/sidebar.jpg)

Por suerte muchas veces, dependiendo de que tipo de integración hayas elegido o en que tipo de cuenta estes, los links a las credenciales que no puedas usar van a estar deshabilitados o te va a indicar si tenes que crear una aplicación desde una cuenta de prueba.

---

[Volver al inicio](../../README.md)

--- configuracion/cuentas-de-prueba/README.md ---

# Cuentas de prueba

Las cuentas de prueba son importantes durante el periodo de desarrollo ya que como estamos manejando dinero, las interacciones de nuestra aplicación deberían ser entre cuentas de prueba con dinero ficticio.

## Índice

- [Crear cuentas de prueba](#crear-cuentas-de-prueba)
- [Tarjetas de prueba](#tarjetas-de-prueba)

## Crear cuentas de prueba

Luego de haber [creado una aplicación](./crear-aplicacion.md) vamos a acceder a ella y luego vamos a ir `Cuentas de prueba` en el menú izquierdo y tocamos el botón de `Crear cuenta de prueba`.

![image](./screenshots/crear-cuentas.jpg)

Vamos a darle un nombre, un país y un monto inicial de crédito a la cuenta.

> [!TIP]
> Generalmente vas a necesitar al menos dos cuentas de prueba: una para el `Vendedor` y otra para el `Comprador`. En algunos casos, como el de `Marketplace`, vas a necesitar una tercer cuenta para representar al `Intermediario` que no es ni comprador ni vendedor.

![image](./screenshots/form-cuenta.jpg)

Luego abrimos una ventana de incógnito (u otro perfil del navegador) y nos logueamos con la cuenta de prueba para asegurarnos de que la creamos correctamente.

![image](./screenshots/login-prueba.jpg)

Ahora ya podemos usar la cuenta de prueba para interactuar con nuestras aplicaciones.

## Tarjetas de prueba

La mayoría de las veces vamos a poder pagar con dinero en cuenta, pero si quisieramos hacer pagos de prueba con tarjetas, una vez que iniciamos sesión con nuestra cuenta de pruebas, entramos a [alguna de sus aplicaciones](https://www.mercadopago.com.ar/developers/panel/app/) (o creamos una aplicación si no la tenemos) y nos vamos a `Tarjetas de prueba`.

![image](./screenshots/tarjetas.jpg)

Acá no solo vamos a encontrar un listado de tarjetas de prueba, sino que nombre y DNI deberíamos usar para cada una. Con nombres como `APRO` podemos hacer que nuestros pagos sean aceptados o podríamos usar otro como `OTHE` o `CONT` para ver como se comportaría nuestra aplicación frente a pagos rechazados o pendientes.

> [!TIP]
> En mi experiencia la tarjeta de Visa es la que mejor funciona.

---

[Volver al inicio](../../README.md)

--- configuracion/exponer-puerto/README.md ---

# Exponer puerto

En Mercado Pago no todos los medios de pago son "síncronos", por ende, es necesario configurar una URL de nuestra aplicación a la cual Mercado Pago nos notifique cuando un pago haya sido aprobado / rechazado / anulado / etc.

Como Mercado Pago no sabe que es `localhost:3000` (ni tampoco lo que es nuestro equipo local), vamos a tener que exponer el puerto donde corre nuestra aplicación en nuestro equipo local, a internet.

Una vez que tengamos la URL, independientemente de la herramienta que usemos para exponer nuestro puerto, vamos a agregarla a nuestro `.env.local` como `APP_URL`.

## Índice

1. [Herramientas](#herramientas)
    1. [Cloudflared Tunnel](#cloudflared-tunnel)
    2. [VSCode Dev Tunnels](#vscode-dev-tunnels)
2. [Probando el link](#probando-el-link)

## Herramientas

Cualquier herramienta que nos permita exponer un puerto de nuestra aplicación a internet va a ser suficiente. Te dejo acá dos alternativas que probé y funcionan bien.

### Cloudflared Tunnel

Podemos instalar [Cloudflared Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel/#1-download-and-install-cloudflared) y usarlo para exponer nuestro puerto. Simplemente [descargá el binario correspondiente a tu sistema operativo](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) y corré el siguiente comando:

```bash
cloudflared tunnel --url http://localhost:3000
```

> [!NOTE]
> Asegurate de cerrar y abrir la terminal en caso de que no te reconozca el comando.

### VSCode Dev Tunnels

Yo estoy usando VSCode, por ende voy a usar `Dev Tunnels` para exponer el puerto. Si nos dirigimos a la sección de `Ports` y hacemos click en `Forward a Port`, podemos elegir un puerto (nuestra aplicación corre en el 3000) y nos dará una URL. Asegurate de cambiar la visibilidad de la URL a `Public` para que Mercado Pago pueda acceder a ella.

![image](./screenshots/port-forward.jpg)

> [!NOTE]
> Si no ves la sección de `Ports` en VSCode, presiona `ctrl + shift + p` (o `cmd + shift + p` en Mac) y busca `Forward a Port` (o en español asumo debe ser `Exponer un puerto`) y te mostrará la sección.

## Probando el link

Si corremos nuestra aplicación con `npm run dev` (habiendo hecho `npm install` previamente) y luego entramos a la URL que obtuvimos, deberíamos ver nuestra aplicación corriendo. Para asegurarte de que es pública, intentá de acceder con tu celular sin conectarte a la misma red wifi.

---

[Volver al inicio](../../README.md)


--- configuracion/webhook/README.md ---

# Configurar un webhook para recibir notificaciones de pago y suscripciones

Para poder configurar un webhook en Mercado Pago, primero necesitamos [exponer nuestro puerto en local hacia internet](../exponer-puerto/README.md). Si todavía no lo hiciste, hacelo y volvé.

Vamos a ir a [Mercado Pago](https://www.mercadopago.com.ar/developers/panel/app) e ingresamos a la aplicación de la cual queremos recibir notificaciones. Luego seleccionamos la sección de `Webhooks` del panel izquierdo y clickeamos el botón de `Configurar notificaciones`:

![image](./screenshots/config.jpg)

Seleccioná el entorno del cual quieras recibir notificaciones (recordá que si estás en una cuenta de prueba, posiblemente quieras seleccionar `Modo productivo`) y en la URL de producción, pegamos la URL que tenemos en `APP_URL` dentro de nuestro archivo `.env.local` (la que obtuvimos cuando expusimos nuestro puerto local más arriba) y le agregamos el endpoint al que queremos que nos llegen las notificaciones. Por ejemplo, en este tutorial, las notificaciones las recibo en `/api/mercadopago`. Seleccionamos los eventos que queremos recibir y le damos a `Guardar configuración`:

![image](./screenshots/save-config.jpg)

Si vamos a `Simular notificación` y emitimos una notificación, deberíamos ver un mensaje similar a este indicando de que hubo un error (ya que el pago no existe) y también deberíamos ver un log en la terminal de nuestro equipo local incluyendo información sobre la notificación.

![image](./screenshots/test-webhook.jpg)

Si bien "no funcionó", nos sirve por que sabemos que Mercado Pago puede comunicarse con nuestra aplicación.

---

[Volver al inicio](../../README.md)

--- integraciones/checkout-api/.env.example ---

# Renombrar este archivo a `.env.local` y agregar los valores correspondientes

MP_ACCESS_TOKEN=
NEXT_PUBLIC_MP_PUBLIC_KEY=


--- integraciones/checkout-api/README.md ---

# Integración de Mercado Pago con Checkout API

En este documento vamos a aprender a agregar pagos a nuestra aplicación utilizando Mercado Pago Checkout API. Los usuarios van a poder agregar mensajes a una lista de mensajes pagando por cada mensaje.

Antes de continuar, asegurate de haber [clonado el proyecto](../../configuracion/clonar-aplicacion/README.md), [creado una aplicación en Mercado Pago](../../configuracion/crear-aplicacion/README.md) y copiado las [`credenciales de prueba`](../../configuracion/credenciales/README.md) a tu archivo `.env.example` y renombrarlo a `.env.local`.

## Índice

1. [Revisando nuestra aplicación](#revisando-nuestra-aplicación)
2. [Crear el formulario de pago](#crear-el-formulario-de-pago)
3. [Efectivizar el pago](#efectivizar-el-pago)
4. [Probar la integración](#probar-la-integración)
5. [Consideraciones](#consideraciones)

## Revisando nuestra aplicación

En la página de inicio de nuestra aplicación (`/src/app/page.tsx`) se renderiza un formulario llamado `MessageForm` que incluye un campo para escribir el mensaje y un formulario con campos de número de tarjeta, fecha de vencimiento y código de seguridad para realizar el pago. Adicionalmente se pide nombre e email los cuales son usados para generar un token de pago para luego efectivizar el pago. Al hacer submit de este formulario, se ejecuta un Server Action que recibe el mensaje y la información del pago y agrega el mensaje a la lista:

```tsx
import {revalidatePath} from "next/cache";

import MessageForm from "./message-form";

import api from "@/api";

// Queremos que esta página sea dinámica para siempre poder ver la información actualizada del usuario
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Obtenemos los mensajes de la base de datos
  const messages = await api.message.list();

  async function add(
    message: string,
    data: {amount: number; email: string; installments: number; token: string},
  ) {
    "use server";

    // Creamos el pago con los datos del formulario
    const payment = await api.message.buy(data);

    // Añadimos el mensaje a la lista
    await api.message.add({text: message, id: payment.id!});

    // Revalidamos la ruta para poder ver el formulario de agregar mensaje
    revalidatePath("/");
  }

  return (
    <section className="grid gap-8">
      <MessageForm amount={100} onSubmitAction={add} />
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            {message.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

## Crear el formulario de pago

Nuestro formulario de pago (`src/app/message-form.tsx`) va a encargarse de capturar el mensaje del usuario, los datos de pago y enviarlos al servidor. Para eso usamos la librería `@mercadopago/sdk-react` y los componentes `CardNumber`, `SecurityCode` y `ExpirationDate`. También usamos la función `createCardToken`:

```tsx
"use client";

import {initMercadoPago, CardNumber, ExpirationDate, SecurityCode, createCardToken} from "@mercadopago/sdk-react";
import Form from "next/form"

// Inicializamos el SDK
initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!);

export default function MessageForm({
  onSubmitAction,
  amount,
}: {
  onSubmitAction: (
    message: string,
    data: {amount: number; email: string; installments: number; token: string},
  ) => Promise<void>;
  amount: number;
}) {
  async function handleSubmit(formData: FormData) {
    const message = formData.get("message") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    // Creamos un token de tarjeta para poder procesar el pago desde el servidor
    const token = await createCardToken({cardholderName: name})

    // Enviamos todos los datos al servidor
    await onSubmitAction(message, {
      amount,
      email,
      installments: 1,
      token: token!.id,
    });
  }

  // Renderizamos el formulario con los campos de pago
  return (
    <Form action={handleSubmit}>
      <textarea
        required
        name="message"
        placeholder="Hola perro"
        rows={3}
      />
      <CardNumber placeholder="1234 1234 1234 1234" />
      <SecurityCode placeholder="123" />
      <ExpirationDate placeholder="12/2025" />
      <input name="name" placeholder="Nombre" type="text" />
      <input name="email" placeholder="Email" type="email" />
      <button type="submit">Pagar</button>
    </Form>
  );
}
```

## Efectivizar el pago

Dentro de `/src/api.ts`, la función `buy` en `message` se encarga de tomar los datos del formulario y crear un pago en Mercado Pago:

```ts
const api = {
  message: {
    async buy(data: {amount: number; email: string; installments: number; token: string}) {
      // Creamos el pago con los datos del formulario
      const payment = await new Payment(mercadopago).create({
        body: {
          payer: {
            email: data.email,
          },
          token: data.token,
          transaction_amount: data.amount,
          installments: data.installments,
        },
      });

      // Devolvemos el pago
      return payment;
    },
  },
};
```

> [!NOTE]
> Cuando el usuario hizo submit del formulario, en realidad no pagó, sino que generamos un token de pago para posteriormente (una vez que validemos los datos desde el servidor) podamos efectivizar el pago como hacemos ahora.

## Probar la integración

Ahora vamos a nuestra aplicación, cargamos un mensaje, llenamos el formulario con los datos que tenemos en `Tarjetas de prueba` en nuestra aplicación de Mercado Pago y presionamos `Pagar`. Después de unos segundos deberíamos ver la página actualizada con nuestro nuevo mensaje.

## Consideraciones

Siempre asegurate de validar los montos y estado de los pagos. En una aplicación real no estaría de más [configurar un webhook para recibir notificaciones](../../configuracion/webhook/README.md) sobre los pagos de tu aplicación para tener más control sobre el estado y validez de los pagos. Podés ver un ejemplo de como [recibir notificaciones de un webhook de pago](../checkout-pro/README.md#recibir-notificaciones) en la sección de Checkout Pro.

---

[Volver al inicio](../../README.md)


--- integraciones/checkout-api/src/api.ts ---

import {readFileSync, writeFileSync} from "node:fs";

import {MercadoPagoConfig, Payment} from "mercadopago";

interface Message {
  id: number;
  text: string;
}

export const mercadopago = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN!});

const api = {
  message: {
    async list(): Promise<Message[]> {
      // Leemos el archivo de la base de datos de los mensajes
      const db = readFileSync("db/message.db");

      // Devolvemos los datos como un array de objetos
      return JSON.parse(db.toString());
    },
    async add(message: Message): Promise<void> {
      // Obtenemos los mensajes
      const db = await api.message.list();

      // Agregamos el nuevo mensaje
      const draft = db.concat(message);

      // Guardamos los datos
      writeFileSync("db/message.db", JSON.stringify(draft, null, 2));
    },
    async buy(data: {amount: number; email: string; installments: number; token: string}) {
      // Creamos el pago con los datos del brick
      const payment = await new Payment(mercadopago).create({
        body: {
          payer: {
            email: data.email,
          },
          token: data.token,
          transaction_amount: data.amount,
          installments: data.installments,
        },
      });

      // Devolvemos el pago
      return payment;
    },
  },
};

export default api;


--- integraciones/checkout-api/src/app/layout.tsx ---

import type {Metadata} from "next";

import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js + Mercado Pago",
  description: "Como integrar Mercado Pago en una aplicación Next.js - By Goncy",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="container m-auto grid min-h-screen max-w-screen-sm grid-rows-[auto_1fr_auto] px-4 font-sans antialiased">
        <header className="text-xl leading-[4rem] font-bold">
          <Link href="/">Next.js + Mercado Pago</Link>
        </header>
        <main className="py-4">{children}</main>
        <footer className="text-center leading-[4rem] opacity-70">
          © {new Date().getFullYear()} Next.js + Mercado Pago
        </footer>
      </body>
    </html>
  );
}


--- integraciones/checkout-api/src/app/message-form.tsx ---

"use client";

import {
  initMercadoPago,
  CardNumber,
  ExpirationDate,
  SecurityCode,
  createCardToken,
} from "@mercadopago/sdk-react";
import Form from "next/form";

// Inicializamos el SDK
initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!);

export default function MessageForm({
  onSubmitAction,
  amount,
}: {
  onSubmitAction: (
    message: string,
    data: {amount: number; email: string; installments: number; token: string},
  ) => Promise<void>;
  amount: number;
}) {
  async function handleSubmit(formData: FormData) {
    const message = formData.get("message") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    // Creamos un token de tarjeta para poder procesar el pago desde el servidor
    const token = await createCardToken({cardholderName: name});

    // Enviamos todos los datos al servidor
    await onSubmitAction(message, {
      amount,
      email,
      installments: 1,
      token: token!.id,
    });
  }

  // Renderizamos el componente de bricks
  return (
    <Form action={handleSubmit}>
      <textarea required name="message" placeholder="Hola perro" rows={3} />
      <CardNumber placeholder="1234 1234 1234 1234" />
      <SecurityCode placeholder="123" />
      <ExpirationDate placeholder="12/2025" />
      <input name="name" placeholder="Nombre" type="text" />
      <input name="email" placeholder="Email" type="email" />
      <button type="submit">Pagar</button>
    </Form>
  );
}


--- integraciones/checkout-api/src/app/page.tsx ---

import {revalidatePath} from "next/cache";

import MessageForm from "./message-form";

import api from "@/api";

// Queremos que esta página sea dinámica para siempre poder ver la información actualizada del usuario
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Obtenemos los mensajes de la base de datos
  const messages = await api.message.list();

  async function add(
    message: string,
    data: {amount: number; email: string; installments: number; token: string},
  ) {
    "use server";

    // Creamos el pago con los datos del formulario
    const payment = await api.message.buy(data);

    // Añadimos el mensaje a la lista
    await api.message.add({text: message, id: payment.id!});

    // Revalidamos la ruta para poder ver el formulario de agregar mensaje
    revalidatePath("/");
  }

  return (
    <section className="grid gap-8">
      <MessageForm amount={100} onSubmitAction={add} />
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.text}</li>
        ))}
      </ul>
    </section>
  );
}


--- integraciones/checkout-api/window.d.ts ---

export declare global {
  interface Window {
    cardPaymentBrickController?: {
      unmount: () => void;
    };
  }
}


--- integraciones/checkout-bricks/.env.example ---

# Renombrar este archivo a `.env.local` y agregar los valores correspondientes

MP_ACCESS_TOKEN=
NEXT_PUBLIC_MP_PUBLIC_KEY=


--- integraciones/checkout-bricks/README.md ---

# Integración de Mercado Pago con Checkout Bricks

En este documento vamos a aprender a agregar pagos a nuestra aplicación utilizando Mercado Pago Checkout Bricks. Los usuarios van a poder agregar mensajes a una lista de mensajes pagando por cada mensaje.

Antes de continuar, asegurate de haber [clonado el proyecto](../../configuracion/clonar-aplicacion/README.md), [creado una aplicación en Mercado Pago](../../configuracion/crear-aplicacion/README.md) y copiado las [`credenciales de prueba`](../../configuracion/credenciales/README.md) a tu archivo `.env.example` y renombrarlo a `.env.local`.

## Índice

1. [Revisando nuestra aplicación](#revisando-nuestra-aplicación)
2. [Crear el formulario de pago](#crear-el-formulario-de-pago)
3. [Efectivizar el pago](#efectivizar-el-pago)
4. [Probar la integración](#probar-la-integración)
5. [Consideraciones](#consideraciones)

## Revisando nuestra aplicación

En la página de inicio de nuestra aplicación (`/src/app/page.tsx`) se renderiza un formulario llamado `MessageForm` que incluye un campo para escribir el mensaje y un formulario de Mercado Pago para realizar el pago. Al hacer submit de este formulario, se ejecuta un Server Action que recibe el mensaje y la información del pago y agrega el mensaje a la lista:

```tsx
import {revalidatePath} from "next/cache";

import MessageForm from "./message-form";

import api from "@/api";

// Queremos que esta página sea dinámica para siempre poder ver la información actualizada del usuario
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Obtenemos los mensajes de la base de datos
  const messages = await api.message.list();

  async function add(
    message: string,
    data: {amount: number; email: string; installments: number; token: string},
  ) {
    "use server";

    // Creamos el pago con los datos del brick
    const payment = await api.message.buy(data);

    // Añadimos el mensaje a la lista
    await api.message.add({text: message, id: payment.id!});

    // Revalidamos la ruta para poder ver el formulario de agregar mensaje
    revalidatePath("/");
  }

  return (
    <section className="grid gap-8">
      <MessageForm amount={100} onSubmitAction={add} />
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            {message.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

## Crear el formulario de pago

Nuestro formulario de pago (`src/app/message-form.tsx`) va a encargarse de capturar el mensaje del usuario, los datos de pago y enviarlos al servidor. Para eso usamos la librería `@mercadopago/sdk-react` y el componente `CardPayment`:

```tsx
"use client";

import type {
  ICardPaymentBrickPayer,
  ICardPaymentFormData,
} from "@mercadopago/sdk-react/bricks/cardPayment/type";

import {useEffect, useRef} from "react";
import {initMercadoPago, CardPayment} from "@mercadopago/sdk-react";

export default function MessageForm({
  onSubmitAction,
  amount,
}: {
  onSubmitAction: (
    message: string,
    data: {amount: number; email: string; installments: number; token: string},
  ) => Promise<void>;
  amount: number;
}) {
  // Nos guardamos una referencia del formulario para obtener los datos cuando se haga submit
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(data: ICardPaymentFormData<ICardPaymentBrickPayer>) {
    // Obtenemos los datos del formulario
    const formData = new FormData(formRef.current!);
    const message = formData.get("message") as string;

    // Enviamos los datos al servidor, incluyendo el mensaje del usuario
    await onSubmitAction(message, {
      amount,
      email: data.payer.email!,
      installments: data.installments,
      token: data.token,
    });
  }

  useEffect(() => {
    // Inicializamos el SDK
    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!);

    // Desmontamos el componente de bricks cuando se desmonte el componente
    return () => {
      window?.cardPaymentBrickController?.unmount();
    };
  }, []);

  // Renderizamos el componente de bricks
  return (
    <form ref={formRef}>
      <textarea
        required
        name="message"
        placeholder="Hola perro"
        rows={3}
      />
      <CardPayment
        customization={{paymentMethods: {maxInstallments: 1, minInstallments: 1}}}
        initialization={{amount}}
        onSubmit={handleSubmit}
      />
    </form>
  );
}
```

## Efectivizar el pago

Dentro de `/src/api.ts`, la función `buy` en `message` se encarga de tomar los datos del formulario y crear un pago en Mercado Pago:

```ts
const api = {
  message: {
    async buy(data: {amount: number; email: string; installments: number; token: string}) {
      // Creamos el pago con los datos del brick
      const payment = await new Payment(mercadopago).create({
        body: {
          payer: {
            email: data.email,
          },
          token: data.token,
          transaction_amount: data.amount,
          installments: data.installments,
        },
      });

      // Devolvemos el pago
      return payment;
    },
  },
};
```

> [!NOTE]
> Cuando el usuario hizo submit del formulario, en realidad no pagó, sino que generó un token de pago para posteriormente (una vez que validemos los datos desde el servidor) podamos efectivizar el pago como hacemos ahora.

## Probar la integración

Ahora vamos a nuestra aplicación, cargamos un mensaje, llenamos el formulario con los datos que tenemos en `Tarjetas de prueba` en nuestra aplicación de Mercado Pago y presionamos `Pagar`. Después de unos segundos deberíamos ver la página actualizada con nuestro nuevo mensaje.

## Consideraciones

Siempre asegurate de validar los montos y estado de los pagos. En una aplicación real no estaría de más [configurar un webhook para recibir notificaciones](../../configuracion/webhook/README.md) sobre los pagos de tu aplicación para tener más control sobre el estado y validez de los pagos. Podés ver un ejemplo de como [recibir notificaciones de un webhook de pago](../checkout-pro/README.md#recibir-notificaciones) en la sección de Checkout Pro.

---

[Volver al inicio](../../README.md)


--- integraciones/checkout-bricks/src/api.ts ---

import {readFileSync, writeFileSync} from "node:fs";

import {MercadoPagoConfig, Payment} from "mercadopago";

interface Message {
  id: number;
  text: string;
}

export const mercadopago = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN!});

const api = {
  message: {
    async list(): Promise<Message[]> {
      // Leemos el archivo de la base de datos de los mensajes
      const db = readFileSync("db/message.db");

      // Devolvemos los datos como un array de objetos
      return JSON.parse(db.toString());
    },
    async add(message: Message): Promise<void> {
      // Obtenemos los mensajes
      const db = await api.message.list();

      // Agregamos el nuevo mensaje
      const draft = db.concat(message);

      // Guardamos los datos
      writeFileSync("db/message.db", JSON.stringify(draft, null, 2));
    },
    async buy(data: {amount: number; email: string; installments: number; token: string}) {
      // Creamos el pago con los datos del brick
      const payment = await new Payment(mercadopago).create({
        body: {
          payer: {
            email: data.email,
          },
          token: data.token,
          transaction_amount: data.amount,
          installments: data.installments,
        },
      });

      // Devolvemos el pago
      return payment;
    },
  },
};

export default api;


--- integraciones/checkout-bricks/src/app/layout.tsx ---

import type {Metadata} from "next";

import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js + Mercado Pago",
  description: "Como integrar Mercado Pago en una aplicación Next.js - By Goncy",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="container m-auto grid min-h-screen max-w-screen-sm grid-rows-[auto_1fr_auto] px-4 font-sans antialiased">
        <header className="text-xl leading-[4rem] font-bold">
          <Link href="/">Next.js + Mercado Pago</Link>
        </header>
        <main className="py-4">{children}</main>
        <footer className="text-center leading-[4rem] opacity-70">
          © {new Date().getFullYear()} Next.js + Mercado Pago
        </footer>
      </body>
    </html>
  );
}


--- integraciones/checkout-bricks/src/app/message-form.tsx ---

"use client";

import type {
  ICardPaymentBrickPayer,
  ICardPaymentFormData,
} from "@mercadopago/sdk-react/bricks/cardPayment/type";

import {useEffect, useRef} from "react";
import {initMercadoPago, CardPayment} from "@mercadopago/sdk-react";

export default function MessageForm({
  onSubmitAction,
  amount,
}: {
  onSubmitAction: (
    message: string,
    data: {amount: number; email: string; installments: number; token: string},
  ) => Promise<void>;
  amount: number;
}) {
  // Nos guardamos una referencia del formulario para obtener los datos cuando se haga submit
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(data: ICardPaymentFormData<ICardPaymentBrickPayer>) {
    // Obtenemos los datos del formulario
    const formData = new FormData(formRef.current!);
    const message = formData.get("message") as string;

    // Enviamos los datos al servidor, incluyendo el mensaje del usuario
    await onSubmitAction(message, {
      amount,
      email: data.payer.email!,
      installments: data.installments,
      token: data.token,
    });
  }

  useEffect(() => {
    // Inicializamos el SDK
    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!);

    // Desmontamos el componente de bricks cuando se desmonte el componente
    return () => {
      window?.cardPaymentBrickController?.unmount();
    };
  }, []);

  // Renderizamos el componente de bricks
  return (
    <form ref={formRef}>
      <textarea required name="message" placeholder="Hola perro" rows={3} />
      <CardPayment
        customization={{paymentMethods: {maxInstallments: 1, minInstallments: 1}}}
        initialization={{amount}}
        onSubmit={handleSubmit}
      />
    </form>
  );
}


--- integraciones/checkout-bricks/src/app/page.tsx ---

import {revalidatePath} from "next/cache";

import MessageForm from "./message-form";

import api from "@/api";

// Queremos que esta página sea dinámica para siempre poder ver la información actualizada del usuario
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Obtenemos los mensajes de la base de datos
  const messages = await api.message.list();

  async function add(
    message: string,
    data: {amount: number; email: string; installments: number; token: string},
  ) {
    "use server";

    // Creamos el pago con los datos del brick
    const payment = await api.message.buy(data);

    // Añadimos el mensaje a la lista
    await api.message.add({text: message, id: payment.id!});

    // Revalidamos la ruta para poder ver el formulario de agregar mensaje
    revalidatePath("/");
  }

  return (
    <section className="grid gap-8">
      <MessageForm amount={100} onSubmitAction={add} />
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.text}</li>
        ))}
      </ul>
    </section>
  );
}


--- integraciones/checkout-bricks/window.d.ts ---

export declare global {
  interface Window {
    cardPaymentBrickController?: {
      unmount: () => void;
    };
  }
}


--- integraciones/checkout-pro/.env.example ---

# Renombrar este archivo a `.env.local` y agregar los valores correspondientes

MP_ACCESS_TOKEN=
APP_URL=


--- integraciones/checkout-pro/README.md ---

# Integración de Mercado Pago con Checkout Pro

En este documento vamos a aprender a agregar pagos a nuestra aplicación utilizando Mercado Pago Checkout Pro. Los usuarios van a poder agregar mensajes a una lista de mensajes pagando por cada mensaje.

Antes de continuar, asegurate de haber [clonado el proyecto](../../configuracion/clonar-aplicacion/README.md), [creado una aplicación en Mercado Pago](../../configuracion/crear-aplicacion/README.md) (para producción), haber creado dos [cuentas de prueba](../../configuracion/cuentas-de-prueba/README.md) para Comprador y Vendedor, haber iniciado sesión en otro navegador con la cuenta de prueba de Vendedor y [crear una aplicación en Mercado Pago](../../configuracion/crear-aplicacion/README.md) (para desarrollo), haber [copiado las credenciales](../../configuracion/credenciales/README.md) de producción de la aplicación del Vendedor a tu archivo `.env.example` y renombrarlo a `.env.local`, haber [expuesto el puerto 3000 al exterior](../../configuracion/exponer-puerto/README.md) y haber [configurado un webhook](../../configuracion/webhook/README.md) para escuchar eventos de `Pagos`.

## Video

[![Integrar pagos con Mercado Pago a una aplicación Next.js](https://img.youtube.com/vi/BUHUW7tAr_Y/maxresdefault.jpg)](https://www.youtube.com/watch?v=BUHUW7tAr_Y)

## Indice

1. [Revisando nuestra aplicación](#revisando-nuestra-aplicación)
2. [Crear una preferencia de pago](#crear-una-preferencia-de-pago)
3. [Recibir notificaciones de pagos](#recibir-notificaciones-de-pagos)
4. [Verificar la autenticidad del pago](#verificar-la-autenticidad-del-pago)
5. [Probar la integración](#probar-la-integración)

## Revisando nuestra aplicación

En la página de inicio de nuestra aplicación (`/src/app/page.tsx`) se renderiza un formulario para agregar un mensaje a nuestra lista de mensajes. Al hacer submit de este formulario, se ejecuta un Server Action que obtiene una URL de Mercado Pago a la cual vamos a redirigir al usuario para que pueda pagar:

```tsx
import {redirect} from "next/navigation";

import api from "@/api";

// Queremos que esta página sea estática, nos encargaremos de revalidar los datos cuando agreguemos un nuevo mensaje
export const dynamic = "force-static";

export default async function HomePage() {
  const messages = await api.message.list();

  async function add(formData: FormData) {
    "use server";

    const message = formData.get("text") as string;
    const url = await api.message.submit(message);

    redirect(url);
  }

  return (
    <section className="grid gap-8">
      <form action={add} className="grid gap-2">
        <textarea
          className="border-2 border-blue-400 p-2"
          name="text"
          placeholder="Hola perro"
          rows={3}
        />
        <button className="rounded bg-blue-400 p-2" type="submit">
          Enviar
        </button>
      </form>
      <ul className="grid gap-2">
        {messages.map((message) => (
          <li key={message.id} className="rounded bg-blue-400/10 p-4">
            {message.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

## Crear una preferencia de pago

Dentro de `/src/api.ts`, la función `submit` en `message` se encarga de crear una preferencia de pago y devolver el init point (url de pago):

```ts
const api = {
  message: {
    async submit(text: string): Promise<string> {
      // Creamos la preferencia incluyendo el precio, titulo y metadata. La información de `items` es standard de Mercado Pago. La información que nosotros necesitamos para nuestra DB debería vivir en `metadata`.
      const preference = await new Preference(mercadopago).create({
        body: {
          items: [
            {
              id: "message",
              unit_price: 100,
              quantity: 1,
              title: "Mensaje de muro",
            },
          ],
          metadata: {
            text,
          },
        },
      });

      // Devolvemos el init point (url de pago) para que el usuario pueda pagar
      return preference.init_point!;
    }
  }
}
```

Podemos pensar a la preferencia de pago como un objeto que representa una orden de compra. algo que un usuario quiere comprar.

Hay varias propiedades más que podemos agregar a la preferencia de pago, como la URL a la cual se va a redirigir al usuario luego de pagar. Una descripción más extensa del producto, etc. Podés ver más [acá](https://www.mercadopago.com.ar/developers/es/reference/preferences/_checkout_preferences/post).

## Recibir notificaciones

Tenemos un Route Handler (`src/app/api/mercadopago/route.ts`) definido en nuestra aplicación que se encarga de recibir las notificaciones de Mercado Pago.

```ts
import {Payment} from "mercadopago";
import {revalidatePath} from "next/cache";

import api, {mercadopago} from "@/api";

export async function POST(request: Request) {
  // Obtenemos el cuerpo de la petición que incluye información sobre la notificación
  const body: {data: {id: string}} = await request.json();

  // Obtenemos el pago
  const payment = await new Payment(mercadopago).get({id: body.data.id});

  // Si se aprueba, agregamos el mensaje
  if (payment.status === "approved") {
    // Obtenemos los datos
    await api.message.add({id: payment.id!, text: payment.metadata.text});

    // Revalidamos la página de inicio para mostrar los datos actualizados
    revalidatePath("/");
  }

  // Respondemos con un estado 200 para indicarle que la notificación fue recibida
  return new Response(null, {status: 200});
}
```

> [!NOTE]
> Es importante siempre retornar un estado 200 para indicarle a Mercado Pago que la notificación fue recibida. Solo debemos retornar un estado que no sea 200 cuando hubo algún error por el cual queremos que Mercado Pago nos notifique nuevamente.

## Verificar la autenticidad del pago

Este Route Handler va a recibir las notificaciones de pago de Mercado Pago, va a obtener el pago usando el ID que nos llega en la notificación. En caso de que el pago sea aprobado, va a agregar el mensaje a nuestra lista de mensajes y va a revalidar la página de inicio para que se muestren los mensajes actualizados.

De esta manera nos aseguramos de que el pago exista y haya sido aprobado. También nuestro método `api.message.add` se encarga de validar que no exista un mensaje con el mismo ID, para que no se dupliquen.

```ts
// Si ya existe un mensaje con ese id, lanzamos un error
if (db.some((_message) => _message.id === message.id)) {
  throw new Error("Message already added");
}
```

En una aplicación real deberíamos verificar la concordancia de la clave secreta, devolver errores más descriptivos y más, pero por simplicidad y tiempo te voy a dejar esa tarea a vos, podés ver más [acá](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks#configuracinatravsdetusintegraciones).

## Probar la integración

Ahora vamos a intentar de hacer el flujo completo de agregar un mensaje a nuestra lista de mensajes y veamos si funciona.

![image](./screenshots/pago-aprobado.jpg)

Excelente, nuestro pago fue aprobado, la notificación fue recibida y nuestro mensaje fue agregado a la lista ✨.

---

[Volver al inicio](../../README.md)


--- integraciones/checkout-pro/src/api.ts ---

import {readFileSync, writeFileSync} from "node:fs";

import {MercadoPagoConfig, Preference} from "mercadopago";

interface Message {
  id: number;
  text: string;
}

export const mercadopago = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN!});

const api = {
  message: {
    async list(): Promise<Message[]> {
      // Leemos el archivo de la base de datos de los mensajes
      const db = readFileSync("db/message.db");

      // Devolvemos los datos como un array de objetos
      return JSON.parse(db.toString());
    },
    async add(message: Message): Promise<void> {
      // Obtenemos los mensajes
      const db = await api.message.list();

      // Si ya existe un mensaje con ese id, lanzamos un error
      if (db.some((_message) => _message.id === message.id)) {
        throw new Error("Message already added");
      }

      // Agregamos el nuevo mensaje
      const draft = db.concat(message);

      // Guardamos los datos
      writeFileSync("db/message.db", JSON.stringify(draft, null, 2));
    },
    async submit(text: Message["text"]) {
      // Creamos la preferencia incluyendo el precio, titulo y metadata. La información de `items` es standard de Mercado Pago. La información que nosotros necesitamos para nuestra DB debería vivir en `metadata`.
      const preference = await new Preference(mercadopago).create({
        body: {
          items: [
            {
              id: "message",
              unit_price: 100,
              quantity: 1,
              title: "Mensaje de muro",
            },
          ],
          metadata: {
            text,
          },
        },
      });

      // Devolvemos el init point (url de pago) para que el usuario pueda pagar
      return preference.init_point!;
    },
  },
};

export default api;


--- integraciones/checkout-pro/src/app/api/mercadopago/route.ts ---

import {Payment} from "mercadopago";
import {revalidatePath} from "next/cache";

import api, {mercadopago} from "@/api";

export async function POST(request: Request) {
  // Obtenemos el cuerpo de la petición que incluye información sobre la notificación
  const body: {data: {id: string}} = await request.json();

  // Obtenemos el pago
  const payment = await new Payment(mercadopago).get({id: body.data.id});

  // Si se aprueba, agregamos el mensaje
  if (payment.status === "approved") {
    // Obtenemos los datos
    await api.message.add({id: payment.id!, text: payment.metadata.text});

    // Revalidamos la página de inicio para mostrar los datos actualizados
    revalidatePath("/");
  }

  // Respondemos con un estado 200 para indicarle que la notificación fue recibida
  return new Response(null, {status: 200});
}


--- integraciones/checkout-pro/src/app/layout.tsx ---

import type {Metadata} from "next";

import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js + Mercado Pago",
  description: "Como integrar Mercado Pago en una aplicación Next.js - By Goncy",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="container m-auto grid min-h-screen max-w-screen-sm grid-rows-[auto_1fr_auto] px-4 font-sans antialiased">
        <header className="text-xl leading-[4rem] font-bold">
          <Link href="/">Next.js + Mercado Pago</Link>
        </header>
        <main className="py-4">{children}</main>
        <footer className="text-center leading-[4rem] opacity-70">
          © {new Date().getFullYear()} Next.js + Mercado Pago
        </footer>
      </body>
    </html>
  );
}


--- integraciones/checkout-pro/src/app/page.tsx ---

import {redirect} from "next/navigation";

import api from "@/api";

// Queremos que esta página sea estática, nos encargaremos de revalidar los datos cuando agreguemos un nuevo mensaje
export const dynamic = "force-static";

export default async function HomePage() {
  const messages = await api.message.list();

  async function add(formData: FormData) {
    "use server";

    const message = formData.get("text") as string;
    const url = await api.message.submit(message);

    redirect(url);
  }

  return (
    <section className="grid gap-8">
      <form action={add}>
        <textarea name="text" placeholder="Hola perro" rows={3} />
        <button type="submit">Enviar</button>
      </form>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.text}</li>
        ))}
      </ul>
    </section>
  );
}


--- integraciones/marketplace/.env.example ---

# Renombrar este archivo a `.env.local` y agregar los valores correspondientes

MP_ACCESS_TOKEN=
MP_CLIENT_SECRET=
NEXT_PUBLIC_MP_PUBLIC_KEY=
NEXT_PUBLIC_MP_CLIENT_ID=
APP_URL=


--- integraciones/marketplace/README.md ---

# Integración de Mercado Pago con Checkout Pro y Split de pagos (Marketplace)

En este documento vamos a aprender a agregar pagos a nuestra aplicación utilizando Mercado Pago Checkout Pro con la funcionalidad de Marketplace. Los usuarios van a poder agregar mensajes a una lista de mensajes pagando por cada mensaje y el intermediario (Marketplace) se queda con una parte de la venta.

Un caso de uso para esta implementación sería una plataforma como [Cafecito](https://cafecito.app/). Donde hay creadores de contenido (Vendedor), un comprador para ese contenido (Comprador) y la plataforma que se queda con una parte por el valor agregado (Marketplace).

La implementación de esta funcionalidad es muy similar a la integracion con Checkout Pro, así que para poder seguir, primero completá todos los pasos de la [Integración de Mercado Pago con Checkout Pro](../checkout-pro/README.md).

## Índice

1. [Crear una cuenta de prueba extra para Marketplace](#crear-una-cuenta-de-prueba-extra-para-marketplace)
2. [Configurando la URL de redirección](#configurando-la-url-de-redirección)
3. [Revisando nuestra aplicación](#revisando-nuestra-aplicación)
4. [Obtener la URL de autorización](#obtener-la-url-de-autorización)
5. [Autorizar la integración](#autorizar-la-integración)
6. [Guardar el access token autorizado](#guardar-el-access-token-autorizado)
7. [Crear una preferencia de pago en nombre del creador de contenido](#crear-una-preferencia-de-pago-en-nombre-del-creador-de-contenido)
8. [Probar la integración](#probar-la-integración)

## Crear una cuenta de prueba extra para Marketplace

Como en este proceso hay 3 partes (Comprador, Vendedor y Marketplace), crear una cuenta de prueba más. Ya teníamos la de Comprador y Vendedor, vamos a crear una cuenta nueva llamada `Creador de contenido` y renombremos la de `Vendedor` como `Marketplace`.

![image](./screenshots/cuentas-de-prueba.jpg)

No es estrictamente necesario renombrar la cuenta, pero como ya tenemos la aplicación creada y configurada en la cuenta de Vendedor, es más claro tener los roles diferenciados.

## Configurando la URL de redirección

En este proceso vamos a hacer que el usario "Creador de contenido" autorice al usuario "Marketplace" a crear preferencias de pago en su nombre. Esto se hace mediante OAuth, donde luego de que el usuario "Creador de contenido" autorice la integración, se lo redirigirá a una URL de nuestra aplicación, la cual debemos configurar en Mercado Pago.

En Mercado Pago, dentro del panel de administración de nuestra aplicación en nuestra cuenta de `Marketplace`, vamos al link que dice `editar`.

![image](./screenshots/editar-link.jpg)

Nos vamos a desplazar hacia abajo y en `URLs de redireccionamiento` vamos a agregar la URL de nuestra aplicación (la que tenemos en `APP_URL` en nuestro archivo `.env.local`) y le agregamos `/api/mercadopago/connect` al final. Vamos a ver que hace esa ruta más adelante.

![image](./screenshots/url-redireccion.jpg)

## Revisando nuestra aplicación

En la página de inicio de nuestra aplicación (`/src/app/page.tsx`) si el usuario ya autorizó la integración, se renderiza el formulario para agregar un mensaje, de la misma manera que lo hacemos en la integración de Checkout Pro. Sino, se renderiza un link que nos redirige a Mercado Pago para que autorice la integración:

```tsx
import {redirect} from "next/navigation";

import api from "@/api";

// Queremos que esta página sea dinámica para saber el estado del marketplace
export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  // Obtenemos el usuario y los mensajes
  const user = await api.user.fetch();
  const messages = await api.message.list();

  // Obtenemos la URL de autorización
  const authorizationUrl = await api.user.authorize();

  // Creamos una preferencia de pago y redirigimos al usuario a Mercado Pago
  async function add(formData: FormData) {
    "use server";

    const message = formData.get("text") as string;
    const url = await api.message.submit(message);

    redirect(url);
  }

  return (
    <section className="grid gap-8">
      {/* Si el usuario ya autorizó la integración, mostramos el formulario */}
      {user.marketplace ? (
        <form action={add}>
          <textarea
            name="text"
            placeholder="Hola perro"
            rows={3}
          />
          <button type="submit">
            Enviar
          </button>
        </form>
      ) : (
        // Si no autorizó la integración, mostramos un botón para redirigirlo a Mercado Pago a autorizar
        <a href={authorizationUrl}>
          Conectar Mercado Pago
        </a>
      )}
      <ul className="grid gap-2">
        {messages.map((message) => (
          <li key={message.id}>
            {message.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

## Obtener la URL de autorización

Dentro de `/src/api.ts`, la función `authorize` en `user` se encarga de generar la URL a donde vamos a redirigir al usuario para que autorice al Marketplace a crear preferencias de pago en su nombre:

```ts
const api = {
  user: {
    async authorize() {
      // Obtenemos la url de autorización
      const url = new OAuth(mercadopago).getAuthorizationURL({
        options: {
          client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
          redirect_uri: `${process.env.APP_URL}/api/mercadopago/connect`,
        },
      });

      // Devolvemos la url
      return url;
    },
  }
}
```

> [!IMPORTANT]
> Para esta integración necesitamos que `NEXT_PUBLIC_MP_CLIENT_ID` esté definido en nuestro archivo `.env.local`. Recordá tomarlo desde la aplicación que creaste desde tu cuenta Marketplace.

## Autorizar la integración

Si vamos a nuestra aplicación, vamos a ver un botón que dice `Conectar Mercado Pago`. Asegurate de clickear ese link mientras estás logueado como `Creador de contenido`. Esto nos va a redirigir a Mercado Pago donde nos va a preguntar a que país correspondemos y luego vas a ver una pantalla como esta:

![image](./screenshots/pantalla-autorizacion.jpg)

Vamos a continuar, aceptar y vamos a ser redirigidos a nuestra aplicación, donde vamos a ver el formulario para agregar un mensaje.

## Guardar el access token autorizado

Una vez que el usuario fue autorizado, es redirigido a nuestra aplicación hacia la ruta `/api/mercadopago/connect` junto con un parámetro `code` en la URL:

```ts
import {NextRequest, NextResponse} from "next/server";

import api from "@/api";

export async function GET(request: NextRequest) {
  // Obtenemos el code de la request
  const code = request.nextUrl.searchParams.get("code");

  // Conectamos al usuario con el code y obtenemos las credenciales
  const credentials = await api.user.connect(code!);

  // Actualizamos las credenciales del usuario
  await api.user.update({marketplace: credentials.access_token});

  // Redirigimos al usuario a la página del marketplace
  return NextResponse.redirect(process.env.APP_URL!);
}
```

Vamos a extraer ese parametro y se lo pasamos a la función `connect` en `user` para obtener las credenciales del usuario, incluyendo un access token que nos permite crear preferencias de pago en nombre del creador de contenido.

Luego actualizamos el usuario con el access token para poder accederlo desde nuestra aplicación y redirigimos al usuario nuevamente a la página de inicio.

> [!NOTE]
> Las credenciales incluyen más información, como un refresh token, cuando vence y más. En una aplicación real deberíamos guardar ambos e intercambiar el refresh token por un nuevo access token cuando este expire. Pero esa tarea te la dejo a vos.

Dentro de `/src/api.ts`, la función `connect` en `user` se encarga de intercambiar el code por esas credenciales que luegos guardamos en el usuario:

```ts
const api = {
  message: {
    async connect(code: string) {
      // Obtenemos las credenciales del usuario usando el code que obtuvimos de oauth
      const credentials = await new OAuth(mercadopago).create({
        body: {
          client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
          client_secret: process.env.MP_CLIENT_SECRET,
          code,
          redirect_uri: `${process.env.APP_URL}/api/mercadopago/connect`,
        },
      });

      // Devolvemos las credenciales
      return credentials;
    },
  }
}
```

## Crear una preferencia de pago en nombre del creador de contenido

Dentro de `/src/api.ts`, la función `submit` en `message` se encarga de crear una preferencia de pago y devolver el init point (url de pago). Pero no vamos a usar nuestro cliente de Mercado Pago como veníamos haciendo antes, sino que vamos a crear un nuevo cliente usando el access token del Marketplace. Entonces, cuando creemos esa preferencia, el pago va a ir para el creador de contenido, pero va a retener un valor fijo (el definido en `marketplace_fee`) como comisión para el usuario Marketplace:

```ts
const api = {
  message: {
    async submit(text: Message["text"], marketplace: string) {
      // Creamos el cliente de Mercado Pago usando el access token del Marketplace
      const client: MercadoPagoConfig = new MercadoPagoConfig({accessToken: marketplace});

      // Creamos la preferencia incluyendo el precio, titulo y metadata. La información de `items` es standard de Mercado Pago. La información que nosotros necesitamos para nuestra DB debería vivir en `metadata`.
      const preference = await new Preference(client).create({
        body: {
          items: [
            {
              id: "message",
              unit_price: 100,
              quantity: 1,
              title: "Mensaje de muro",
            },
          ],
          metadata: {
            text,
          },
          // Le agregamos ARS 5 de comisión
          marketplace_fee: 5,
        },
      });

      // Devolvemos el init point (url de pago) para que el usuario pueda pagar
      return preference.init_point!;
    }
  }
}
```

## Probar la integración

Ya que usamos como base la integración de Checkout Pro, deberíamos tener la configuración del webhook de notificaciones de pago configurado. Por ende, si ya estamos conectados a Mercado Pago, deberíamos poder agregar un mensaje, recordá estar logeado con la tercer cuenta, la de Comprador (que no es ni Marketplace ni Creador de contenido).

![image](./screenshots/pago-aprobado.jpg)

Una vez que el pago fue aprobado, deberíamos ver el mensaje en la lista. Y si nos fijamos en la actividad de cuenta de Mercado Pago del Creador de contenido, deberíamos ver el pago con el detalle indicando la comisión que se queda el Marketplace.

![image](./screenshots/actividad-de-cuenta.jpg)

---

[Volver al inicio](../../README.md)


--- integraciones/marketplace/src/api.ts ---

import {readFileSync, writeFileSync} from "node:fs";

import {MercadoPagoConfig, Preference, OAuth} from "mercadopago";

interface Message {
  id: number;
  text: string;
}

interface User {
  id: number;
  name: string;
  marketplace: string | null;
}

export const mercadopago = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN!});

const api = {
  user: {
    async fetch(): Promise<User> {
      // Leemos el archivo de la base de datos del usuario
      const db = readFileSync("db/user.db");

      // Devolvemos los datos como un objeto
      return JSON.parse(db.toString());
    },
    async update(data: Partial<User>): Promise<void> {
      // Obtenemos los datos del usuario
      const db = await api.user.fetch();

      // Extendemos los datos con los nuevos datos
      const draft = {...db, ...data};

      // Guardamos los datos
      writeFileSync("db/user.db", JSON.stringify(draft, null, 2));
    },
    async authorize() {
      // Obtenemos la url de autorización
      const url = new OAuth(mercadopago).getAuthorizationURL({
        options: {
          client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
          redirect_uri: `${process.env.APP_URL}/api/mercadopago/connect`,
        },
      });

      // Devolvemos la url
      return url;
    },
    async connect(code: string) {
      // Obtenemos las credenciales del usuario usando el code que obtuvimos de oauth
      const credentials = await new OAuth(mercadopago).create({
        body: {
          client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
          client_secret: process.env.MP_CLIENT_SECRET,
          code,
          redirect_uri: `${process.env.APP_URL}/api/mercadopago/connect`,
        },
      });

      // Devolvemos las credenciales
      return credentials;
    },
  },
  message: {
    async list(): Promise<Message[]> {
      // Leemos el archivo de la base de datos de los mensajes
      const db = readFileSync("db/message.db");

      // Devolvemos los datos como un array de objetos
      return JSON.parse(db.toString());
    },
    async add(message: Message): Promise<void> {
      // Obtenemos los mensajes
      const db = await api.message.list();

      // Si ya existe un mensaje con ese id, lanzamos un error
      if (db.some((_message) => _message.id === message.id)) {
        throw new Error("Message already added");
      }

      // Agregamos el nuevo mensaje
      const draft = db.concat(message);

      // Guardamos los datos
      writeFileSync("db/message.db", JSON.stringify(draft, null, 2));
    },
    async submit(text: Message["text"], marketplace: string) {
      // Creamos el cliente de Mercado Pago usando el access token del Marketplace
      const client: MercadoPagoConfig = new MercadoPagoConfig({accessToken: marketplace});

      // Creamos la preferencia incluyendo el precio, titulo y metadata. La información de `items` es standard de Mercado Pago. La información que nosotros necesitamos para nuestra DB debería vivir en `metadata`.
      const preference = await new Preference(client).create({
        body: {
          items: [
            {
              id: "message",
              unit_price: 100,
              quantity: 1,
              title: "Mensaje de muro",
            },
          ],
          metadata: {
            text,
          },
          // Le agregamos ARS 5 de comisión
          marketplace_fee: 5,
        },
      });

      // Devolvemos el init point (url de pago) para que el usuario pueda pagar
      return preference.init_point!;
    },
  },
};

export default api;


--- integraciones/marketplace/src/app/api/mercadopago/connect/route.ts ---

import {NextRequest, NextResponse} from "next/server";

import api from "@/api";

export async function GET(request: NextRequest) {
  // Obtenemos el code de la request
  const code = request.nextUrl.searchParams.get("code");

  // Conectamos al usuario con el code y obtenemos las credenciales
  const credentials = await api.user.connect(code!);

  // Actualizamos las credenciales del usuario
  await api.user.update({marketplace: credentials.access_token});

  // Redirigimos al usuario a la página del marketplace
  return NextResponse.redirect(process.env.APP_URL!);
}


--- integraciones/marketplace/src/app/api/mercadopago/route.ts ---

import {Payment} from "mercadopago";
import {revalidatePath} from "next/cache";

import api, {mercadopago} from "@/api";

export async function POST(request: Request) {
  // Obtenemos el cuerpo de la petición que incluye información sobre la notificación
  const body: {data: {id: string}} = await request.json();

  // Obtenemos el pago
  const payment = await new Payment(mercadopago).get({id: body.data.id});

  // Si se aprueba, agregamos el mensaje
  if (payment.status === "approved") {
    // Obtenemos los datos
    await api.message.add({id: payment.id!, text: payment.metadata.text});

    // Revalidamos la página de inicio para mostrar los datos actualizados
    revalidatePath("/");
  }

  // Respondemos con un estado 200 para indicarle que la notificación fue recibida
  return new Response(null, {status: 200});
}


--- integraciones/marketplace/src/app/layout.tsx ---

import type {Metadata} from "next";

import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js + Mercado Pago",
  description: "Como integrar Mercado Pago en una aplicación Next.js - By Goncy",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="container m-auto grid min-h-screen max-w-screen-sm grid-rows-[auto_1fr_auto] px-4 font-sans antialiased">
        <header className="text-xl leading-[4rem] font-bold">
          <Link href="/">Next.js + Mercado Pago</Link>
        </header>
        <main className="py-4">{children}</main>
        <footer className="text-center leading-[4rem] opacity-70">
          © {new Date().getFullYear()} Next.js + Mercado Pago
        </footer>
      </body>
    </html>
  );
}


--- integraciones/marketplace/src/app/page.tsx ---

import {redirect} from "next/navigation";

import api from "@/api";

// Queremos que esta página sea dinámica para saber el estado del marketplace
export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  // Obtenemos el usuario y los mensajes
  const user = await api.user.fetch();
  const messages = await api.message.list();

  // Obtenemos la URL de autorización
  const authorizationUrl = await api.user.authorize();

  // Creamos una preferencia de pago y redirigimos al usuario a Mercado Pago
  async function add(formData: FormData) {
    "use server";

    const message = formData.get("text") as string;
    const url = await api.message.submit(message, user.marketplace!);

    redirect(url);
  }

  return (
    <section className="grid gap-8">
      {/* Si el usuario ya autorizó la integración, mostramos el formulario */}
      {user.marketplace ? (
        <form action={add}>
          <textarea name="text" placeholder="Hola perro" rows={3} />
          <button type="submit">Enviar</button>
        </form>
      ) : (
        // Si no autorizó la integración, mostramos un botón para redirigirlo a Mercado Pago a autorizar
        <a href={authorizationUrl}>Conectar Mercado Pago</a>
      )}
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.text}</li>
        ))}
      </ul>
    </section>
  );
}


--- integraciones/suscripciones/.env.example ---

# Renombrar este archivo a `.env.local` y agregar los valores correspondientes

MP_ACCESS_TOKEN=
APP_URL=


--- integraciones/suscripciones/README.md ---

# Integración de Mercado Pago con Suscripciones

En este documento vamos a aprender a agregar suscripciones a nuestra aplicación utilizando [Suscripciones sin plan asociado con pago pendiente](https://www.mercadopago.com.ar/developers/es/docs/subscriptions/integration-configuration/subscription-no-associated-plan/pending-payments). Los usuarios van a poder agregar mensajes a una lista de mensajes siempre y cuando estén suscritos.

Antes de continuar, asegurate de haber [clonado el proyecto](../../configuracion/clonar-aplicacion/README.md), [creado una aplicación en Mercado Pago](../../configuracion/crear-aplicacion/README.md) (para producción), haber creado dos [cuentas de prueba](../../configuracion/cuentas-de-prueba/README.md) para Comprador y Vendedor, haber iniciado sesión en otro navegador con la cuenta de prueba de Vendedor y [crear una aplicación en Mercado Pago](../../configuracion/crear-aplicacion/README.md) (para desarrollo), haber [copiado las credenciales](../../configuracion/credenciales/README.md) de producción de la aplicación del Vendedor a tu archivo `.env.example` y renombrarlo a `.env.local`, haber [expuesto el puerto 3000 al exterior](../../configuracion/exponer-puerto/README.md) y haber [configurado un webhook](../../configuracion/webhook/README.md) para escuchar eventos de `Planes y Suscripciones`.

## Indice

1. [Revisando nuestra aplicación](#revisando-nuestra-aplicación)
2. [Crear una suscripción](#crear-una-suscripción)
3. [Recibir notificaciones](#recibir-notificaciones)
4. [Actualizar el estado de la suscripción](#actualizar-el-estado-de-la-suscripción)
5. [Probar la integración](#probar-la-integración)

## Revisando nuestra aplicación

En la página de inicio de nuestra aplicación (`/src/app/page.tsx`) se renderizan cosas diferentes dependiendo de si el usuario tiene o no una suscripción activa:
- Si no tiene una suscripción activa: Se renderiza un formulario para suscribirse, que al hacer submit, se redirecciona al usuario a Mercado Pago para que pueda pagar.
- Si el usuario tiene una suscripción activa: Se renderiza un formulario para agregar un mensaje a nuestra lista de mensajes.

Independientemente de si el usuario tiene o no una suscripción activa, se renderiza una lista de mensajes.

```tsx
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";

import api from "@/api";

export default async function SuscripcionesPage() {
  // Obtenemos los mensajes y el usuario
  const messages = await api.message.list();
  // Obtenemos el usuario
  const user = await api.user.fetch();

  async function suscribe(formData: FormData) {
    "use server";

    // Obtenemos el email del usuario
    const email = formData.get("email");

    // Suscribimos al usuario
    const url = await api.user.suscribe(user.id, email as string);

    // Redireccionamos al usuario a Mercado Pago para que pueda pagar
    redirect(url);
  }

  async function add(formData: FormData) {
    "use server";

    // Obtenemos el mensaje del usuario
    const message = formData.get("message");

    // Agregamos el mensaje a nuestra lista
    await api.message.add(message as string);

    // Revalidamos la página para que se muestren los mensajes actualizados
    revalidatePath("/");
  }

  return (
    <div className="grid gap-12">
      {user.suscription ? (
        <form action={add}>
          <textarea name="message" rows={4} />
          <button type="submit">
            Submit
          </button>
        </form>
      ) : (
        <form action={suscribe}>
          <input
            defaultValue={user.email}
            name="email"
            placeholder="goncy@goncy.com"
            type="email"
          />
          <button type="submit">
            Suscribirse
          </button>
        </form>
      )}
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            <p>{message.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

> [!NOTE]
> En esta aplicación de ejemplo siempre vamos a tener un usuario (que se obtiene desde `/db/user.db`), lo único que vamos a hacer es interactuar con la propiedad `suscription` del usuario. En una aplicación real vas a manejar la lógica de autenticación normalmente.

## Crear una suscripción

Dentro de `/src/api.ts`, la función `suscribe` en `user` se encarga de crear una suscripción sin plan asociado (con pago pendiente) y devolver el init point (url de pago):

```ts
const api = {
  user: {
    async suscribe(email: string) {
      const suscription = await new PreApproval(mercadopago).create({
        body: {
          back_url: process.env.APP_URL!,
          reason: "Suscripción a mensajes de muro",
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 100,
            currency_id: "ARS",
          },
          payer_email: email,
          status: "pending",
        },
      });

      return suscription.init_point!;
    },
  }
}
```

Las suscripciones de pago pueden ser de 2 tipos:
- Suscripciones con plan asociado: Consta de 2 pasos, primero crear el plan, el cual estipula el título, monto, descripción, etc. Y el segundo paso es crear la suscripción. El problema es que para hacer esto, necesitamos un `card_token_id` el que generalmente obtenemos mediante Checkout Bricks o la Checkout API (la cual no vamos a implementar acá), queremos redirigir al usuario a Mercado Pago para que pueda pagar, similar a lo que haríamos con una preferencia de pago.
- Suscripciones sin plan asociado: Son suscripciones que se crean en el momento de pago, sin pasar por la creación de un plan. Al igual que las preferencias, nos devuelve un `init_point` para redirigir al usuario a Mercado Pago para completar el pago. Estas suscripciones pueden ser o de pago autorizado (necesitamos un `card_token_id`, lo cual no queremos ahora), o de pago pendiente para que el usuario complete el pago en Mercado Pago (justo lo que queremos).

Como te habrás dado cuenta, arriba estamos creando una suscripción sin plan asociado y de pago pendiente (status `pending`) y luego devolvemos el `init_point` y usamos esa URL para redirigir al usuario a Mercado Pago.

## Recibir notificaciones

Tenemos un Route Handler (`src/app/api/mercadopago/route.ts`) definido en nuestra aplicación que se encarga de recibir las notificaciones de Mercado Pago.

```ts
import {PreApproval} from "mercadopago";

import api, {mercadopago} from "@/api";

export async function POST(request: Request) {
  // Obtenemos el cuerpo de la petición que incluye el tipo de notificación
  const body: {data: {id: string}; type: string} = await request.json();

  // Solo nos interesan las notificaciones de suscripciones
  if (body.type === "subscription_preapproval") {
    // Obtenemos la suscripción
    const preapproval = await new PreApproval(mercadopago).get({id: body.data.id});

    // Si se aprueba, actualizamos el usuario con el id de la suscripción
    if (preapproval.status === "authorized") {
      // Actualizamos el usuario con el id de la suscripción
      await api.user.update({suscription: preapproval.id});
    }
  }

  // Respondemos con un estado 200 para indicarle que la notificación fue recibida
  return new Response(null, {status: 200});
}
```

> [!NOTE]
> Es importante siempre retornar un estado 200 para indicarle a Mercado Pago que la notificación fue recibida. Solo debemos retornar un estado que no sea 200 cuando hubo algún error por el cual queremos que Mercado Pago nos notifique nuevamente.

## Actualizar el estado de la suscripción

Este Route Handler va a recibir las notificaciones de pago de Mercado Pago, va a obtener la suscripción usando el ID que nos llega en la notificación. En caso de que la suscripción haya sido autorizada, va a actualizar el usuario con el ID de la suscripción.

En una aplicación real deberíamos verificar la concordancia de la clave secreta, devolver errores más descriptivos, actualizar la suscripción si el usuario se da de baja y más, pero por simplicidad y tiempo te voy a dejar esa tarea a vos, podés ver más [acá](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks#configuracinatravsdetusintegraciones).

## Probar la integración

Ahora vamos a iniciar sesión con nuestra cuenta de prueba comprador, vamos a ir a la página de inicio de nuestra aplicación y en el formulario de suscripción, vamos a escribir el email de nuestro usuario de la cuenta de prueba comprador de Mercado Pago (podés obtener este email entrando a [este link](https://www.mercadopago.com.ar/hub-engine/hubs/my-profile) desde el navegador donde estás logeado con esa cuenta). Eso nos va a redirigir a Mercado Pago. Completemos el pago y deberíamos ver algo como esto:

![image](./screenshots/suscripcion-aprobada.jpg)

> [!IMPORTANT]
> Es importante que uses el mail de la cuenta de prueba comprador de Mercado Pago, ya que si usas otro mail, posiblemente obtengas un error (poco descriptivo) y no puedas suscribirte.

Excelente, nuestra suscripción fue aprobada, la notificación fue recibida y si refrescamos la página e intentamos agregar un mensaje a la lista debería funcionar correctamente ✨.

---

[Volver al inicio](../../README.md)


--- integraciones/suscripciones/src/api.ts ---

import fs from "node:fs";

import {MercadoPagoConfig, PreApproval} from "mercadopago";

interface Message {
  id: number;
  text: string;
}

interface User {
  id: number;
  name: string;
  suscription: string | null;
  email: string;
}

export const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const api = {
  user: {
    async suscribe(email: string) {
      const suscription = await new PreApproval(mercadopago).create({
        body: {
          back_url: process.env.APP_URL!,
          reason: "Suscripción a mensajes de muro",
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 100,
            currency_id: "ARS",
          },
          payer_email: email,
          status: "pending",
        },
      });

      return suscription.init_point!;
    },
    async fetch(): Promise<User> {
      const user = fs.readFileSync("db/user.db", "utf-8");

      return JSON.parse(user);
    },
    async update(data: Partial<User>) {
      const user = await api.user.fetch();

      fs.writeFileSync("db/user.db", JSON.stringify({...user, ...data}));
    },
  },
  message: {
    async add(message: string) {
      const messages = await api.message.list();

      messages.push({
        id: messages.length + 1,
        text: message,
      });

      fs.writeFileSync("db/message.db", JSON.stringify(messages));
    },
    async list(): Promise<Message[]> {
      const messages = fs.readFileSync("db/message.db", "utf-8");

      return JSON.parse(messages);
    },
  },
};

export default api;


--- integraciones/suscripciones/src/app/api/mercadopago/route.ts ---

import {PreApproval} from "mercadopago";

import api, {mercadopago} from "@/api";

export async function POST(request: Request) {
  // Obtenemos el cuerpo de la petición que incluye el tipo de notificación
  const body: {data: {id: string}; type: string} = await request.json();

  // Solo nos interesan las notificaciones de suscripciones
  if (body.type === "subscription_preapproval") {
    // Obtenemos la suscripción
    const preapproval = await new PreApproval(mercadopago).get({id: body.data.id});

    // Si se aprueba, actualizamos el usuario con el id de la suscripción
    if (preapproval.status === "authorized") {
      // Actualizamos el usuario con el id de la suscripción
      await api.user.update({suscription: preapproval.id});
    }
  }

  // Respondemos con un estado 200 para indicarle que la notificación fue recibida
  return new Response(null, {status: 200});
}


--- integraciones/suscripciones/src/app/layout.tsx ---

import type {Metadata} from "next";

import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js + Mercado Pago",
  description: "Como integrar Mercado Pago en una aplicación Next.js - By Goncy",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="container m-auto grid min-h-screen max-w-screen-sm grid-rows-[auto_1fr_auto] px-4 font-sans antialiased">
        <header className="text-xl leading-[4rem] font-bold">
          <Link href="/">Next.js + Mercado Pago</Link>
        </header>
        <main className="py-4">{children}</main>
        <footer className="text-center leading-[4rem] opacity-70">
          © {new Date().getFullYear()} Next.js + Mercado Pago
        </footer>
      </body>
    </html>
  );
}


--- integraciones/suscripciones/src/app/page.tsx ---

import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";

import api from "@/api";

export default async function SuscripcionesPage() {
  const messages = await api.message.list();
  const user = await api.user.fetch();

  async function suscribe(formData: FormData) {
    "use server";

    const email = formData.get("email");
    const url = await api.user.suscribe(email as string);

    redirect(url);
  }

  async function add(formData: FormData) {
    "use server";

    const message = formData.get("message");

    await api.message.add(message as string);

    revalidatePath("/");
  }

  return (
    <div className="grid gap-8">
      {user.suscription ? (
        <form action={add}>
          <textarea name="message" rows={4} />
          <button type="submit">Submit</button>
        </form>
      ) : (
        <form action={suscribe}>
          <input
            defaultValue={user.email}
            name="email"
            placeholder="goncy@goncy.com"
            type="email"
          />
          <button type="submit">Suscribirse</button>
        </form>
      )}
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            <p>{message.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}


--- integraciones/suscripciones/window.d.ts ---

export declare global {
  interface Window {
    cardPaymentBrickController?: {
      unmount: () => void;
    };
  }
}
