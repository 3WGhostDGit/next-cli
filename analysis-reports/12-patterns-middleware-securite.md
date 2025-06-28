# Analyse des Patterns de Middleware et Sécurité

## Vue d'ensemble

Cette analyse examine les patterns de middleware Next.js, la sécurité des applications, l'authentification, l'autorisation, CORS, CSP, et les patterns de protection avancés.

## ANALYSE EN DEUX TEMPS

### Temps 1 : Middleware de base et authentification

- Middleware Next.js fondamental
- Patterns d'authentification et autorisation
- Redirection et protection des routes

### Temps 2 : Sécurité avancée et headers

- CORS et CSP (Content Security Policy)
- Headers de sécurité et rate limiting
- Patterns de protection contre les attaques

## 1. Patterns de Middleware Next.js

### 1.1 Middleware d'Authentification Basique

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  // Routes publiques
  const publicRoutes = ["/", "/login", "/signup", "/about", "/api/auth"];

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/api/auth")
  );

  // Redirection des utilisateurs authentifiés depuis les pages d'auth
  if (sessionCookie && ["/login", "/signup"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protection des routes privées
  if (!isPublicRoute && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

### 1.2 Middleware avec Autorisation par Rôle

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes publiques
  const publicRoutes = ["/", "/login", "/signup"];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute) {
    return NextResponse.next();
  }

  try {
    // Vérification de l'authentification
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Vérification des rôles pour les routes admin
    if (pathname.startsWith("/admin")) {
      if (!session.user.roles?.includes("admin")) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    // Vérification des rôles pour les routes modérateur
    if (pathname.startsWith("/moderator")) {
      const allowedRoles = ["admin", "moderator"];
      if (!session.user.roles?.some((role) => allowedRoles.includes(role))) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    // Ajout des informations utilisateur aux headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", session.user.id);
    requestHeaders.set("x-user-roles", JSON.stringify(session.user.roles));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("Middleware auth error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### 1.3 Middleware pour API Routes

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Middleware spécifique pour les API routes
  if (pathname.startsWith("/api/")) {
    return handleAPIMiddleware(request);
  }

  // Middleware pour les pages
  return handlePageMiddleware(request);
}

async function handleAPIMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CORS pour les API publiques
  if (pathname.startsWith("/api/public/")) {
    return handleCORS(request);
  }

  // Rate limiting pour les API d'authentification
  if (["/api/auth/login", "/api/auth/register"].includes(pathname)) {
    const rateLimitResult = await rateLimit(
      request.ip || "unknown",
      5, // 5 tentatives
      900 // 15 minutes
    );

    if (!rateLimitResult.success) {
      return new Response("Too Many Requests", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateLimitResult.reset.toString(),
        },
      });
    }
  }

  // Authentification pour les API protégées
  if (pathname.startsWith("/api/protected/")) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Ajout des informations utilisateur aux headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", session.user.id);
      requestHeaders.set("x-user-email", session.user.email);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return Response.json({ error: "Authentication failed" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

function handleCORS(request: NextRequest) {
  const allowedOrigins = [
    "http://localhost:3000",
    "https://myapp.com",
    "https://admin.myapp.com",
  ];

  const origin = request.headers.get("origin") ?? "";
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    const preflightHeaders = {
      ...(isAllowedOrigin && { "Access-Control-Allow-Origin": origin }),
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    };
    return NextResponse.json({}, { headers: preflightHeaders });
  }

  // Handle simple requests
  const response = NextResponse.next();

  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  return response;
}

async function handlePageMiddleware(request: NextRequest) {
  // Logique pour les pages (authentification, redirection, etc.)
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

## 2. Patterns de Sécurité Avancée

### 2.1 Content Security Policy (CSP)

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://vercel.live;
    style-src 'self' 'nonce-${nonce}' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' https: wss:;
    worker-src 'self' blob:;
    child-src 'self' blob:;
    manifest-src 'self';
    media-src 'self' blob: data:;
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", cspHeader);

  // Autres headers de sécurité
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // HSTS pour HTTPS
  if (request.nextUrl.protocol === "https:") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}

// Utilisation du nonce dans les composants
// app/layout.tsx
import { headers } from "next/headers";
import Script from "next/script";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = headers().get("x-nonce");

  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js"
          strategy="afterInteractive"
          nonce={nonce}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 2.2 Rate Limiting Avancé

```typescript
// lib/rate-limit.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface RateLimitConfig {
  requests: number;
  window: number; // en secondes
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async check(identifier: string): Promise<{
    success: boolean;
    remaining: number;
    reset: number;
    total: number;
  }> {
    const key = `rate_limit:${identifier}`;
    const now = Math.floor(Date.now() / 1000);
    const window = this.config.window;
    const windowStart = now - window;

    // Nettoyer les anciennes entrées
    await redis.zremrangebyscore(key, 0, windowStart);

    // Compter les requêtes actuelles
    const current = await redis.zcard(key);

    if (current >= this.config.requests) {
      const oldest = await redis.zrange(key, 0, 0, { withScores: true });
      const reset = oldest[0] ? oldest[0].score + window : now + window;

      return {
        success: false,
        remaining: 0,
        reset: reset,
        total: current,
      };
    }

    // Ajouter la requête actuelle
    await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });
    await redis.expire(key, window);

    return {
      success: true,
      remaining: this.config.requests - current - 1,
      reset: now + window,
      total: current + 1,
    };
  }
}

// Différents limiters pour différents cas d'usage
export const authLimiter = new RateLimiter({
  requests: 5,
  window: 900, // 15 minutes
});

export const apiLimiter = new RateLimiter({
  requests: 100,
  window: 60, // 1 minute
});

export const uploadLimiter = new RateLimiter({
  requests: 10,
  window: 3600, // 1 heure
});

// Middleware wrapper
export function withRateLimit(limiter: RateLimiter) {
  return async function (
    request: NextRequest,
    handler: (request: NextRequest) => Promise<Response>
  ) {
    const identifier = getIdentifier(request);
    const result = await limiter.check(identifier);

    if (!result.success) {
      return new Response("Too Many Requests", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limiter.config.requests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": result.reset.toString(),
          "Retry-After": (
            result.reset - Math.floor(Date.now() / 1000)
          ).toString(),
        },
      });
    }

    const response = await handler(request);

    // Ajouter les headers de rate limit aux réponses réussies
    response.headers.set(
      "X-RateLimit-Limit",
      limiter.config.requests.toString()
    );
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set("X-RateLimit-Reset", result.reset.toString());

    return response;
  };
}

function getIdentifier(request: NextRequest): string {
  // Utiliser l'IP comme identifiant principal
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";

  // Pour les utilisateurs authentifiés, utiliser l'ID utilisateur
  const userId = request.headers.get("x-user-id");
  if (userId) {
    return `user:${userId}`;
  }

  return `ip:${ip}`;
}
```

### 2.3 Protection CSRF

```typescript
// lib/csrf.ts
import { createHash, randomBytes } from "crypto";

export class CSRFProtection {
  private secret: string;

  constructor(secret?: string) {
    this.secret = secret || process.env.CSRF_SECRET || "default-secret";
  }

  generateToken(sessionId: string): string {
    const timestamp = Date.now().toString();
    const random = randomBytes(16).toString("hex");
    const payload = `${sessionId}:${timestamp}:${random}`;

    const hash = createHash("sha256")
      .update(payload + this.secret)
      .digest("hex");

    return Buffer.from(`${payload}:${hash}`).toString("base64");
  }

  validateToken(token: string, sessionId: string, maxAge = 3600000): boolean {
    try {
      const decoded = Buffer.from(token, "base64").toString();
      const [receivedSessionId, timestamp, random, hash] = decoded.split(":");

      // Vérifier l'ID de session
      if (receivedSessionId !== sessionId) {
        return false;
      }

      // Vérifier l'âge du token
      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > maxAge) {
        return false;
      }

      // Vérifier le hash
      const payload = `${receivedSessionId}:${timestamp}:${random}`;
      const expectedHash = createHash("sha256")
        .update(payload + this.secret)
        .digest("hex");

      return hash === expectedHash;
    } catch (error) {
      return false;
    }
  }
}

// Middleware CSRF
export function withCSRFProtection(
  handler: (request: NextRequest) => Promise<Response>
) {
  const csrf = new CSRFProtection();

  return async function (request: NextRequest) {
    // Ignorer les requêtes GET, HEAD, OPTIONS
    if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      return handler(request);
    }

    const sessionId = request.headers.get("x-session-id");
    const csrfToken = request.headers.get("x-csrf-token");

    if (!sessionId || !csrfToken) {
      return Response.json({ error: "CSRF token required" }, { status: 403 });
    }

    if (!csrf.validateToken(csrfToken, sessionId)) {
      return Response.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    return handler(request);
  };
}
```

## 3. Patterns de Validation et Sanitization

### 3.1 Validation des Headers

```typescript
// lib/header-validation.ts
import { z } from "zod";

const headerSchemas = {
  authorization: z
    .string()
    .regex(/^Bearer [A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/),
  contentType: z.enum([
    "application/json",
    "multipart/form-data",
    "text/plain",
  ]),
  userAgent: z.string().min(1).max(500),
  origin: z.string().url().optional(),
  referer: z.string().url().optional(),
};

export function validateHeaders(request: NextRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validation de l'authorization si présente
  const auth = request.headers.get("authorization");
  if (auth) {
    const result = headerSchemas.authorization.safeParse(auth);
    if (!result.success) {
      errors.push("Invalid authorization header format");
    }
  }

  // Validation du Content-Type pour les requêtes avec body
  if (["POST", "PUT", "PATCH"].includes(request.method)) {
    const contentType = request.headers.get("content-type")?.split(";")[0];
    if (contentType) {
      const result = headerSchemas.contentType.safeParse(contentType);
      if (!result.success) {
        errors.push("Invalid content-type header");
      }
    }
  }

  // Validation de l'User-Agent
  const userAgent = request.headers.get("user-agent");
  if (userAgent) {
    const result = headerSchemas.userAgent.safeParse(userAgent);
    if (!result.success) {
      errors.push("Invalid user-agent header");
    }
  }

  // Validation de l'Origin pour les requêtes CORS
  const origin = request.headers.get("origin");
  if (origin) {
    const result = headerSchemas.origin.safeParse(origin);
    if (!result.success) {
      errors.push("Invalid origin header");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Middleware de validation des headers
export function withHeaderValidation(
  handler: (request: NextRequest) => Promise<Response>
) {
  return async function (request: NextRequest) {
    const validation = validateHeaders(request);

    if (!validation.isValid) {
      return Response.json(
        {
          error: "Invalid headers",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    return handler(request);
  };
}
```

### 3.2 Sanitization et Validation des Inputs

```typescript
// lib/input-sanitization.ts
import DOMPurify from "isomorphic-dompurify";
import { z } from "zod";

export class InputSanitizer {
  // Sanitization HTML
  static sanitizeHTML(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "ol", "ul", "li"],
      ALLOWED_ATTR: [],
    });
  }

  // Sanitization pour les noms de fichiers
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/_{2,}/g, "_")
      .substring(0, 255);
  }

  // Sanitization pour les URLs
  static sanitizeURL(url: string): string | null {
    try {
      const parsed = new URL(url);
      const allowedProtocols = ["http:", "https:"];

      if (!allowedProtocols.includes(parsed.protocol)) {
        return null;
      }

      return parsed.toString();
    } catch {
      return null;
    }
  }

  // Sanitization pour les emails
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  // Échappement pour SQL (bien que Prisma gère cela)
  static escapeSQLString(input: string): string {
    return input.replace(/'/g, "''");
  }
}

// Schémas de validation communs
export const commonSchemas = {
  email: z.string().email().transform(InputSanitizer.sanitizeEmail),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain uppercase, lowercase, number and special character"
    ),

  username: z
    .string()
    .min(3)
    .max(30)
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens and underscores"
    ),

  filename: z
    .string()
    .transform(InputSanitizer.sanitizeFilename)
    .refine((name) => name.length > 0, "Invalid filename"),

  url: z
    .string()
    .transform(InputSanitizer.sanitizeURL)
    .refine((url) => url !== null, "Invalid URL"),

  html: z.string().transform(InputSanitizer.sanitizeHTML),

  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),

  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
};

// Middleware de validation et sanitization
export function withInputValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (request: NextRequest, validatedData: T) => Promise<Response>
) {
  return async function (request: NextRequest) {
    try {
      let data: any;

      // Parse le body selon le Content-Type
      const contentType = request.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        data = await request.json();
      } else if (contentType?.includes("multipart/form-data")) {
        const formData = await request.formData();
        data = Object.fromEntries(formData.entries());
      } else {
        data = {};
      }

      // Validation et sanitization
      const validatedData = schema.parse(data);

      return handler(request, validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json(
          {
            error: "Validation failed",
            details: error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      return Response.json({ error: "Invalid request data" }, { status: 400 });
    }
  };
}
```

### 3.3 Protection contre les Attaques par Injection

```typescript
// lib/injection-protection.ts
export class InjectionProtection {
  // Détection de tentatives d'injection SQL
  static detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(--|\/\*|\*\/)/,
      /(\b(SCRIPT|JAVASCRIPT|VBSCRIPT)\b)/i,
      /(<script|<\/script>)/i,
    ];

    return sqlPatterns.some((pattern) => pattern.test(input));
  }

  // Détection de tentatives XSS
  static detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<link/i,
      /<meta/i,
    ];

    return xssPatterns.some((pattern) => pattern.test(input));
  }

  // Détection de tentatives de Path Traversal
  static detectPathTraversal(input: string): boolean {
    const pathPatterns = [
      /\.\.\//,
      /\.\.\\/,
      /%2e%2e%2f/i,
      /%2e%2e%5c/i,
      /\.\.\%2f/i,
      /\.\.\%5c/i,
    ];

    return pathPatterns.some((pattern) => pattern.test(input));
  }

  // Détection de tentatives d'injection de commandes
  static detectCommandInjection(input: string): boolean {
    const commandPatterns = [
      /[;&|`$(){}[\]]/,
      /\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|ping|wget|curl|nc|telnet|ssh|ftp)\b/i,
    ];

    return commandPatterns.some((pattern) => pattern.test(input));
  }

  // Validation complète
  static validateInput(
    input: string,
    type: "general" | "filename" | "url" = "general"
  ): {
    isValid: boolean;
    threats: string[];
  } {
    const threats: string[] = [];

    if (this.detectSQLInjection(input)) {
      threats.push("SQL Injection attempt detected");
    }

    if (this.detectXSS(input)) {
      threats.push("XSS attempt detected");
    }

    if (type === "filename" && this.detectPathTraversal(input)) {
      threats.push("Path traversal attempt detected");
    }

    if (this.detectCommandInjection(input)) {
      threats.push("Command injection attempt detected");
    }

    return {
      isValid: threats.length === 0,
      threats,
    };
  }
}

// Middleware de protection contre les injections
export function withInjectionProtection(
  handler: (request: NextRequest) => Promise<Response>
) {
  return async function (request: NextRequest) {
    try {
      // Vérifier les query parameters
      const url = new URL(request.url);
      for (const [key, value] of url.searchParams.entries()) {
        const validation = InjectionProtection.validateInput(value);
        if (!validation.isValid) {
          console.warn(
            `Injection attempt in query param ${key}:`,
            validation.threats
          );
          return Response.json(
            { error: "Malicious input detected" },
            { status: 400 }
          );
        }
      }

      // Vérifier le body pour les requêtes POST/PUT/PATCH
      if (["POST", "PUT", "PATCH"].includes(request.method)) {
        const contentType = request.headers.get("content-type");

        if (contentType?.includes("application/json")) {
          const body = await request.json();
          const bodyString = JSON.stringify(body);

          const validation = InjectionProtection.validateInput(bodyString);
          if (!validation.isValid) {
            console.warn(
              "Injection attempt in request body:",
              validation.threats
            );
            return Response.json(
              { error: "Malicious input detected" },
              { status: 400 }
            );
          }
        }
      }

      return handler(request);
    } catch (error) {
      console.error("Injection protection error:", error);
      return Response.json(
        { error: "Request validation failed" },
        { status: 400 }
      );
    }
  };
}
```

## 4. Patterns de Monitoring et Logging

### 4.1 Logging de Sécurité

```typescript
// lib/security-logger.ts
interface SecurityEvent {
  type:
    | "auth_failure"
    | "rate_limit"
    | "injection_attempt"
    | "csrf_violation"
    | "suspicious_activity";
  severity: "low" | "medium" | "high" | "critical";
  ip: string;
  userAgent: string;
  userId?: string;
  details: Record<string, any>;
  timestamp: Date;
}

export class SecurityLogger {
  private static instance: SecurityLogger;
  private events: SecurityEvent[] = [];

  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  log(event: Omit<SecurityEvent, "timestamp">) {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.events.push(fullEvent);

    // Log vers différents services selon la sévérité
    if (event.severity === "critical") {
      this.alertCritical(fullEvent);
    }

    // Envoyer vers un service de monitoring
    this.sendToMonitoring(fullEvent);

    // Log local
    console.log(`[SECURITY] ${event.type}:`, fullEvent);
  }

  private async alertCritical(event: SecurityEvent) {
    // Envoyer une alerte immédiate (Slack, email, etc.)
    try {
      await fetch(process.env.SECURITY_WEBHOOK_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🚨 CRITICAL SECURITY EVENT: ${event.type}`,
          attachments: [
            {
              color: "danger",
              fields: [
                { title: "IP", value: event.ip, short: true },
                { title: "User Agent", value: event.userAgent, short: true },
                {
                  title: "Details",
                  value: JSON.stringify(event.details),
                  short: false,
                },
              ],
            },
          ],
        }),
      });
    } catch (error) {
      console.error("Failed to send critical alert:", error);
    }
  }

  private async sendToMonitoring(event: SecurityEvent) {
    // Envoyer vers un service de monitoring (DataDog, Sentry, etc.)
    try {
      if (process.env.NODE_ENV === "production") {
        // Exemple avec un service de monitoring
        await fetch(process.env.MONITORING_ENDPOINT!, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.MONITORING_TOKEN}`,
          },
          body: JSON.stringify(event),
        });
      }
    } catch (error) {
      console.error("Failed to send to monitoring:", error);
    }
  }

  getRecentEvents(hours = 24): SecurityEvent[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.events.filter((event) => event.timestamp > cutoff);
  }

  getEventsByType(type: SecurityEvent["type"], hours = 24): SecurityEvent[] {
    return this.getRecentEvents(hours).filter((event) => event.type === type);
  }

  getEventsByIP(ip: string, hours = 24): SecurityEvent[] {
    return this.getRecentEvents(hours).filter((event) => event.ip === ip);
  }
}

// Middleware de logging automatique
export function withSecurityLogging(
  handler: (request: NextRequest) => Promise<Response>
) {
  return async function (request: NextRequest) {
    const logger = SecurityLogger.getInstance();
    const startTime = Date.now();

    try {
      const response = await handler(request);

      // Log les réponses d'erreur de sécurité
      if (response.status === 401) {
        logger.log({
          type: "auth_failure",
          severity: "medium",
          ip: request.ip || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
          details: {
            path: request.nextUrl.pathname,
            method: request.method,
          },
        });
      }

      if (response.status === 429) {
        logger.log({
          type: "rate_limit",
          severity: "medium",
          ip: request.ip || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
          details: {
            path: request.nextUrl.pathname,
            method: request.method,
          },
        });
      }

      return response;
    } catch (error) {
      // Log les erreurs inattendues
      logger.log({
        type: "suspicious_activity",
        severity: "high",
        ip: request.ip || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        details: {
          path: request.nextUrl.pathname,
          method: request.method,
          error: error.message,
          duration: Date.now() - startTime,
        },
      });

      throw error;
    }
  };
}
```

## 5. Implications pour le CLI

### 5.1 Génération Automatique de Middleware

Le CLI devra détecter et générer automatiquement :

**Middleware de base :**

- Authentification avec redirection automatique
- Autorisation par rôle avec routes protégées
- Rate limiting adaptatif selon le type d'endpoint
- CORS configuré selon l'environnement

**Sécurité avancée :**

- CSP avec nonce dynamique
- Headers de sécurité complets
- Protection CSRF pour les formulaires
- Validation et sanitization des inputs
- Protection contre les injections
- Logging de sécurité automatique

### 5.2 Templates de Génération

```typescript
// Générateur de middleware complet
export const generateSecurityMiddleware = (config: SecurityConfig) => {
  const hasAuth = config.authentication;
  const hasRoles = config.roles && config.roles.length > 0;
  const hasRateLimit = config.rateLimit;
  const hasCSRF = config.csrfProtection;

  return `
import { NextRequest, NextResponse } from 'next/server'
${hasAuth ? "import { auth } from '@/lib/auth'" : ""}
${
  hasRateLimit
    ? "import { authLimiter, apiLimiter } from '@/lib/rate-limit'"
    : ""
}
${hasCSRF ? "import { withCSRFProtection } from '@/lib/csrf'" : ""}
import { SecurityLogger } from '@/lib/security-logger'
import { InjectionProtection } from '@/lib/injection-protection'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const logger = SecurityLogger.getInstance()

  // Protection contre les injections
  const injectionCheck = InjectionProtection.validateInput(request.url)
  if (!injectionCheck.isValid) {
    logger.log({
      type: 'injection_attempt',
      severity: 'high',
      ip: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: { threats: injectionCheck.threats, path: pathname }
    })

    return Response.json({ error: 'Malicious input detected' }, { status: 400 })
  }

  // Routes publiques
  const publicRoutes = ${JSON.stringify(config.publicRoutes || ["/"])}
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route)
  )

  ${
    hasRateLimit
      ? `
  // Rate limiting pour l'authentification
  if (['/api/auth/login', '/api/auth/register'].includes(pathname)) {
    const rateLimitResult = await authLimiter.check(request.ip || 'unknown')

    if (!rateLimitResult.success) {
      logger.log({
        type: 'rate_limit',
        severity: 'medium',
        ip: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: { path: pathname, limit: 'auth' }
      })

      return new Response('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.reset.toString()
        }
      })
    }
  }

  // Rate limiting pour les API
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
    const rateLimitResult = await apiLimiter.check(request.ip || 'unknown')

    if (!rateLimitResult.success) {
      return new Response('Too Many Requests', { status: 429 })
    }
  }
  `
      : ""
  }

  ${
    hasAuth
      ? `
  // Authentification
  if (!isPublicRoute) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers
      })

      if (!session) {
        logger.log({
          type: 'auth_failure',
          severity: 'medium',
          ip: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          details: { path: pathname, reason: 'no_session' }
        })

        return NextResponse.redirect(new URL('/login', request.url))
      }

      ${
        hasRoles
          ? `
      // Vérification des rôles
      ${config.protectedRoutes
        ?.map(
          (route) => `
      if (pathname.startsWith('${route.path}')) {
        const requiredRoles = ${JSON.stringify(route.roles)}
        const hasRequiredRole = session.user.roles?.some(role =>
          requiredRoles.includes(role)
        )

        if (!hasRequiredRole) {
          logger.log({
            type: 'auth_failure',
            severity: 'medium',
            ip: request.ip || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
            userId: session.user.id,
            details: {
              path: pathname,
              reason: 'insufficient_role',
              userRoles: session.user.roles,
              requiredRoles
            }
          })

          return NextResponse.redirect(new URL('/unauthorized', request.url))
        }
      }
      `
        )
        .join("")}
      `
          : ""
      }

      // Ajouter les informations utilisateur aux headers
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', session.user.id)
      requestHeaders.set('x-user-email', session.user.email)
      ${
        hasRoles
          ? "requestHeaders.set('x-user-roles', JSON.stringify(session.user.roles))"
          : ""
      }

      return NextResponse.next({
        request: { headers: requestHeaders }
      })

    } catch (error) {
      logger.log({
        type: 'auth_failure',
        severity: 'high',
        ip: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: { path: pathname, error: error.message }
      })

      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  `
      : ""
  }

  // Headers de sécurité
  const response = NextResponse.next()

  // CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const cspHeader = \`
    default-src 'self';
    script-src 'self' 'nonce-\${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-\${nonce}' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  \`.replace(/\\s{2,}/g, ' ').trim()

  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('x-nonce', nonce)

  // Autres headers de sécurité
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  if (request.nextUrl.protocol === 'https:') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
`;
};
```

### 5.3 Détection de Patterns

Le CLI devra identifier :

- **Routes protégées** → Middleware d'authentification automatique
- **Rôles utilisateur** → Autorisation par rôle
- **API publiques** → CORS et rate limiting appropriés
- **Formulaires** → Protection CSRF intégrée
- **Uploads** → Validation et rate limiting spécialisés
- **Données sensibles** → Logging de sécurité renforcé

## Conclusion

Les patterns de middleware et sécurité Next.js offrent une base robuste pour la génération automatique d'applications sécurisées. Le CLI devra implémenter des templates qui couvrent l'authentification, l'autorisation, la protection contre les attaques courantes, et les bonnes pratiques de sécurité web.

L'intégration de ces patterns permet de créer des applications sécurisées par défaut, avec une protection en profondeur, des mécanismes de défense adaptés aux menaces modernes, et un monitoring de sécurité automatique pour détecter et répondre aux incidents.
