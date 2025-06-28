# Analyse des Patterns Better Auth

## Vue d'ensemble

Cette analyse examine les patterns d'authentification avec Better Auth, leur intégration avec Next.js, la protection des routes, la gestion des sessions et des rôles.

## ANALYSE EN DEUX TEMPS

### Temps 1 : Configuration et patterns de base

- Configuration initiale de Better Auth
- Providers sociaux et email/password
- Gestion des sessions

### Temps 2 : Patterns avancés et protection

- Middleware et protection des routes
- Système de rôles et permissions
- Hooks et intégration client

## 1. Patterns de Configuration de Base

### 1.1 Configuration Initiale

```typescript
// auth.ts
import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: true,
    autoSignIn: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});
```

### 1.2 Configuration des Providers Sociaux

```typescript
export const auth = betterAuth({
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: "common",
      requireSelectAccount: true,
    },
  },
});
```

## 2. Patterns de Gestion des Sessions

### 2.1 Configuration des Sessions

```typescript
export const auth = betterAuth({
  session: {
    modelName: "sessions",
    fields: {
      userId: "user_id",
    },
    expiresIn: 604800, // 7 days
    updateAge: 86400, // 1 day
    disableSessionRefresh: false,
    additionalFields: {
      customField: {
        type: "string",
      },
    },
    storeSessionInDatabase: true,
    preserveSessionInDatabase: false,
    cookieCache: {
      enabled: true,
      maxAge: 300, // 5 minutes
    },
  },
});
```

### 2.2 Gestion des Cookies

```typescript
export const auth = betterAuth({
  advanced: {
    useSecureCookies: true,
    crossSubDomainCookies: {
      enabled: true,
      additionalCookies: ["custom_cookie"],
      domain: "example.com",
    },
    cookies: {
      session_token: {
        name: "custom_session_token",
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          partitioned: true,
        },
      },
    },
    defaultCookieAttributes: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    },
    cookiePrefix: "myapp",
  },
});
```

## 3. Patterns Client-Side

### 3.1 Configuration du Client

```typescript
// auth-client.ts
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL,
  plugins: [],
});
```

### 3.2 Hook useSession

```typescript
// React
import { authClient } from "@/lib/auth-client";

export function User() {
  const {
    data: session,
    isPending, // loading state
    error, // error object
    refetch, // refetch the session
  } = authClient.useSession();

  return (
    <div>
      {session ? (
        <div>
          <p>Welcome {session.user.name}</p>
          <button onClick={() => authClient.signOut()}>Sign Out</button>
        </div>
      ) : (
        <button
          onClick={() =>
            authClient.signIn.social({
              provider: "github",
            })
          }
        >
          Continue with GitHub
        </button>
      )}
    </div>
  );
}
```

### 3.3 Patterns de Connexion

```typescript
// Email/Password Sign In
await authClient.signIn.email({
  email: "user@example.com",
  password: "password123",
});

// Social Sign In
await authClient.signIn.social({
  provider: "github",
  callbackURL: "/dashboard",
});

// Sign Up
await authClient.signUp.email({
  email: "user@example.com",
  password: "password123",
  name: "John Doe",
});
```

## 4. Patterns de Protection des Routes

### 4.1 Middleware Next.js

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from auth pages
  if (sessionCookie && ["/login", "/signup"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login
  if (!sessionCookie && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
```

### 4.2 Protection Server-Side

```typescript
// app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {session.user.name}</p>
    </div>
  );
}
```

### 4.3 Middleware Personnalisé

```typescript
// utils/require-auth.ts
import { auth } from "@/lib/auth";
import { createError } from "h3";

export const requireAuth = async (event: H3Event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  event.context.auth = session;
};
```

## 5. Patterns de Rôles et Permissions

### 5.1 Configuration des Rôles

```typescript
// permissions.ts
import { createAccessControl } from "better-auth/plugins/access";

export const statement = {
  user: ["create", "list", "set-role", "ban", "impersonate", "delete"],
  session: ["list", "revoke", "delete"],
  project: ["create", "share", "update", "delete"],
} as const;

const ac = createAccessControl(statement);

export const user = ac.newRole({
  project: ["create"],
});

export const admin = ac.newRole({
  user: ["create", "list", "set-role", "ban"],
  session: ["list", "revoke"],
  project: ["create", "update", "delete"],
});

export const superAdmin = ac.newRole({
  user: ["create", "list", "set-role", "ban", "impersonate", "delete"],
  session: ["list", "revoke", "delete"],
  project: ["create", "share", "update", "delete"],
});
```

### 5.2 Intégration des Rôles Server-Side

```typescript
// auth.ts
import { betterAuth } from "better-auth";
import { admin as adminPlugin } from "better-auth/plugins";
import { ac, admin, user, superAdmin } from "@/auth/permissions";

export const auth = betterAuth({
  plugins: [
    adminPlugin({
      ac,
      roles: {
        admin,
        user,
        superAdmin,
      },
    }),
  ],
});
```

### 5.3 Intégration des Rôles Client-Side

```typescript
// auth-client.ts
import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";
import { ac, admin, user, superAdmin } from "@/auth/permissions";

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      ac,
      roles: {
        admin,
        user,
        superAdmin,
      },
    }),
  ],
});
```

## 6. Patterns de Vérification des Permissions

### 6.1 Vérification Server-Side

```typescript
// Server-side permission check
import { auth } from "@/auth";

await auth.api.userHasPermission({
  body: {
    userId: "user-id",
    permissions: {
      project: ["create"],
      user: ["ban"],
    },
  },
});

// Check by role
await auth.api.userHasPermission({
  body: {
    role: "admin",
    permissions: {
      project: ["create"],
      user: ["ban"],
    },
  },
});
```

### 6.2 Vérification Client-Side

```typescript
// Client-side permission check
const canCreateProject = await authClient.admin.hasPermission({
  permissions: {
    project: ["create"],
  },
});

// Check role permissions
const canAdminUsers = authClient.admin.checkRolePermission({
  permissions: {
    user: ["delete"],
    session: ["revoke"],
  },
  role: "admin",
});
```

### 6.3 Gestion des Rôles

```typescript
// Set user role
const updatedUser = await authClient.admin.setRole({
  userId: "user_id_here",
  role: "admin", // or ["admin", "moderator"] for multiple roles
});

// Get user with roles
const user = await authClient.admin.listUsers({
  limit: 10,
});
```

## 7. Patterns de Hooks et Middleware

### 7.1 Hooks Before/After

```typescript
export const auth = betterAuth({
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        if (!ctx.body?.email.endsWith("@company.com")) {
          throw new APIError("BAD_REQUEST", {
            message: "Email must be from company domain",
          });
        }
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      // Log successful operations
      console.log(`Operation ${ctx.path} completed`);
    }),
  },
});
```

### 7.2 Middleware Personnalisé

```typescript
import { createAuthMiddleware, APIError } from "better-auth/api";

const rateLimitMiddleware = createAuthMiddleware(async (ctx) => {
  const ip = ctx.headers.get("x-forwarded-for");

  if (await isRateLimited(ip)) {
    throw new APIError("TOO_MANY_REQUESTS", {
      message: "Rate limit exceeded",
    });
  }
});
```

## 8. Implications pour le CLI

### 8.1 Templates de Configuration

Le CLI devra générer automatiquement :

1. **Configuration Better Auth** avec providers appropriés
2. **Middleware Next.js** pour protection des routes
3. **Client Auth** avec hooks configurés
4. **Types TypeScript** pour les sessions et utilisateurs

### 8.2 Patterns de Génération

```typescript
// Template pour auth.ts
export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    // Providers générés selon les besoins
  },
  plugins: [
    // Plugins générés selon les fonctionnalités
  ],
});

// Template pour auth-client.ts
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL,
  plugins: [
    // Plugins client générés
  ],
});
```

### 8.3 Détection de Patterns

Le CLI devra détecter :

- **Besoins d'authentification** → Configuration Better Auth
- **Protection de routes** → Middleware Next.js
- **Gestion de rôles** → Système de permissions
- **Providers sociaux** → Configuration OAuth
- **Sessions personnalisées** → Configuration avancée

## 9. Patterns Avancés - Organisations et Teams

### 9.1 Configuration des Organisations

```typescript
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    organization({
      organizationCreation: {
        disabled: false,
        beforeCreate: async ({ organization, user }, request) => {
          return {
            data: {
              ...organization,
              metadata: {
                customField: "value",
              },
            },
          };
        },
        afterCreate: async ({ organization, member, user }, request) => {
          await setupDefaultResources(organization.id);
        },
      },
    }),
  ],
});
```

### 9.2 Gestion des Membres et Rôles d'Organisation

```typescript
// Client-side organization management
await authClient.organization.create({
  name: "My Organization",
  slug: "my-org",
});

await authClient.organization.updateMemberRole({
  memberId: "member-id",
  role: "admin", // or ["admin", "moderator"]
});

await authClient.organization.inviteMember({
  email: "user@example.com",
  role: "member",
});
```

### 9.3 Permissions d'Organisation

```typescript
// Organization-specific permissions
const canManageOrg = await authClient.organization.hasPermission({
  permissions: {
    organization: ["update"],
    member: ["create", "delete"],
  },
});

const canCreateProject = authClient.organization.checkRolePermission({
  permissions: {
    organization: ["delete"],
    member: ["delete"],
  },
  role: "admin",
});
```

## 10. Patterns de Plugins Avancés

### 10.1 Plugin Passkey

```typescript
import { passkey } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    passkey({
      rpID: "localhost", // your domain
      rpName: "My App",
      origin: "http://localhost:3000",
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "preferred",
        userVerification: "preferred",
      },
    }),
  ],
});
```

### 10.2 Plugin Multi-Session

```typescript
import { multiSession } from "better-auth/plugins";
import { multiSessionClient } from "better-auth/client/plugins";

// Server
export const auth = betterAuth({
  plugins: [multiSession()],
});

// Client
export const authClient = createAuthClient({
  plugins: [multiSessionClient()],
});
```

### 10.3 Plugin API Keys

```typescript
import { apiKey } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    apiKey({
      permissions: {
        defaultPermissions: {
          files: ["read"],
          users: ["read"],
        },
      },
    }),
  ],
});
```

## 11. Patterns de Hooks Avancés

### 11.1 Custom Session Plugin

```typescript
import { customSession } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    customSession(async ({ user, session }) => {
      const roles = await findUserRoles(session.userId);
      const permissions = await getUserPermissions(user.id);

      return {
        roles,
        permissions,
        user: {
          ...user,
          customField: "value",
        },
        session,
      };
    }),
  ],
});
```

### 11.2 Plugin Middleware

```typescript
const myPlugin = () => {
  return {
    id: "my-plugin",
    middlewares: [
      {
        path: "/my-plugin/protected",
        middleware: createAuthMiddleware(async (ctx) => {
          const session = await getSessionFromCtx(ctx);

          if (!session) {
            throw new APIError("UNAUTHORIZED", {
              message: "Authentication required",
            });
          }

          if (!hasPermission(session.user, "admin")) {
            throw new APIError("FORBIDDEN", {
              message: "Admin access required",
            });
          }
        }),
      },
    ],
    hooks: {
      before: [
        {
          matcher: (context) => {
            return context.path.startsWith("/admin");
          },
          handler: createAuthMiddleware(async (ctx) => {
            // Admin-specific logic
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin;
};
```

## 12. Patterns d'Intégration Framework

### 12.1 Intégration TRPC

```typescript
import { authClient } from "@/lib/auth-client";

export const api = createTRPCReact<AppRouter>();

export function TRPCProvider(props: { children: React.ReactNode }) {
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          headers() {
            const headers = new Map<string, string>();
            const cookies = authClient.getCookie();
            if (cookies) {
              headers.set("Cookie", cookies);
            }
            return Object.fromEntries(headers);
          },
        }),
      ],
    })
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      {props.children}
    </api.Provider>
  );
}
```

### 12.2 Intégration Astro

```typescript
// middleware.ts
import { auth } from "@/auth";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  if (session) {
    context.locals.user = session.user;
    context.locals.session = session.session;
  } else {
    context.locals.user = null;
    context.locals.session = null;
  }

  return next();
});
```

### 12.3 Intégration Nuxt

```typescript
// middleware/auth.global.ts
import { authClient } from "~/lib/auth-client";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { data: session } = await authClient.useSession(useFetch);

  if (!session.value) {
    if (to.path.startsWith("/dashboard")) {
      return navigateTo("/login");
    }
  }
});
```

## 13. Patterns de Sécurité Avancée

### 13.1 Rate Limiting

```typescript
const rateLimitPlugin = () => {
  return {
    id: "rate-limit",
    hooks: {
      before: [
        {
          matcher: (context) => {
            return ["/sign-in", "/sign-up"].includes(context.path);
          },
          handler: createAuthMiddleware(async (ctx) => {
            const ip = ctx.headers.get("x-forwarded-for");
            const key = `rate_limit:${ip}:${ctx.path}`;

            const attempts = await redis.incr(key);
            if (attempts === 1) {
              await redis.expire(key, 900); // 15 minutes
            }

            if (attempts > 5) {
              throw new APIError("TOO_MANY_REQUESTS", {
                message: "Too many attempts. Try again later.",
              });
            }
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin;
};
```

### 13.2 CSRF Protection

```typescript
export const auth = betterAuth({
  advanced: {
    disableCSRFCheck: false, // Keep CSRF protection enabled
    useSecureCookies: true,
    crossSubDomainCookies: {
      enabled: false, // Disable for security unless needed
    },
  },
});
```

### 13.3 IP Tracking et Géolocalisation

```typescript
export const auth = betterAuth({
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-client-ip", "x-forwarded-for"],
      disableIpTracking: false,
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-in/email" && ctx.context.newSession) {
        const ip = ctx.headers.get("x-forwarded-for");
        const location = await getLocationFromIP(ip);

        // Log suspicious login attempts
        if (location.country !== user.lastKnownCountry) {
          await sendSecurityAlert(user.email, location);
        }
      }
    }),
  },
});
```

## 14. Implications pour le CLI - Patterns Avancés

### 14.1 Génération de Plugins

Le CLI devra détecter et générer :

```typescript
// Détection automatique des besoins
const plugins = [];

if (needsOrganizations) {
  plugins.push(`organization({
        ac,
        roles: { owner, admin, member }
    })`);
}

if (needsPasskeys) {
  plugins.push(`passkey({
        rpID: "${domain}",
        rpName: "${appName}",
        origin: "${origin}"
    })`);
}

if (needsMultiSession) {
  plugins.push(`multiSession()`);
}
```

### 14.2 Templates de Middleware

```typescript
// Template de middleware généré automatiquement
export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Routes publiques
  const publicRoutes = ["/", "/login", "/signup", "/api/auth"];
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Routes protégées
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Routes admin
  if (pathname.startsWith("/admin")) {
    const session = await validateSession(sessionCookie);
    if (!session?.user.roles?.includes("admin")) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}
```

### 14.3 Détection de Patterns Complexes

Le CLI devra identifier :

- **Multi-tenancy** → Plugin organisation
- **Authentification biométrique** → Plugin passkey
- **Sessions multiples** → Plugin multi-session
- **API externes** → Plugin API keys
- **Sécurité avancée** → Rate limiting, CSRF
- **Intégrations** → TRPC, Astro, Nuxt

## Conclusion

Better Auth offre des patterns très structurés pour l'authentification dans Next.js. Le CLI devra implémenter des templates qui couvrent la configuration de base, la protection des routes, et la gestion des rôles, tout en permettant une personnalisation avancée selon les besoins du projet.

Les patterns avancés comme les organisations, les plugins de sécurité et les intégrations framework-spécifiques nécessitent une détection intelligente des besoins pour générer automatiquement la configuration appropriée.
