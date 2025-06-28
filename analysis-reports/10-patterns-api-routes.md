# Analyse des Patterns d'API Routes

## Vue d'ensemble

Cette analyse examine les patterns d'API Routes avec Next.js App Router, les Route Handlers, la validation, la gestion d'erreurs, l'authentification, et les patterns d'intégration pour CORS, rate limiting et streaming.

## ANALYSE EN DEUX TEMPS

### Temps 1 : Patterns de base Route Handlers

- Route Handlers fondamentaux (GET, POST, PUT, DELETE)
- Gestion des requêtes et réponses
- Validation et gestion d'erreurs de base

### Temps 2 : Patterns avancés et middleware

- Middleware et authentification
- CORS, rate limiting, streaming
- Patterns de sécurité et optimisation

## 1. Patterns de Base Route Handlers

### 1.1 Structure Route Handler Fondamentale

```typescript
// app/api/users/route.ts
export async function GET(request: Request) {
  try {
    const users = await db.user.findMany();
    return Response.json(users);
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await db.user.create({ data: body });
    return Response.json(user, { status: 201 });
  } catch (error) {
    return new Response("Failed to create user", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const user = await db.user.update({
      where: { id },
      data,
    });
    return Response.json(user);
  } catch (error) {
    return new Response("Failed to update user", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response("ID is required", { status: 400 });
    }

    await db.user.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response("Failed to delete user", { status: 500 });
  }
}
```

**Caractéristiques identifiées :**

- Méthodes HTTP explicites comme fonctions exportées
- Utilisation de l'API Web Request/Response
- Gestion d'erreurs avec try/catch
- Status codes HTTP appropriés

### 1.2 Gestion des Paramètres et Query Strings

```typescript
// app/api/users/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}

// app/api/posts/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  try {
    const where = {
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.post.count({ where }),
    ]);

    return Response.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return new Response("Failed to fetch posts", { status: 500 });
  }
}
```

### 1.3 Gestion des Différents Types de Body

```typescript
// app/api/upload/route.ts
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      // JSON body
      const data = await request.json();
      return Response.json({ received: data });
    }

    if (contentType?.includes("multipart/form-data")) {
      // FormData body
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const name = formData.get("name") as string;

      if (!file) {
        return new Response("No file uploaded", { status: 400 });
      }

      // Process file upload
      const buffer = await file.arrayBuffer();
      const filename = `${Date.now()}-${file.name}`;

      // Save file logic here

      return Response.json({
        filename,
        size: file.size,
        type: file.type,
        name,
      });
    }

    if (contentType?.includes("text/plain")) {
      // Text body
      const text = await request.text();
      return Response.json({ text });
    }

    return new Response("Unsupported content type", { status: 400 });
  } catch (error) {
    return new Response("Upload failed", { status: 500 });
  }
}
```

## 2. Patterns de Validation avec Zod

### 2.1 Validation des Données d'Entrée

```typescript
// app/api/users/route.ts
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  age: z.number().min(18, "Must be at least 18 years old").optional(),
  role: z.enum(["user", "admin"]).default("user"),
});

const updateUserSchema = createUserSchema.partial().extend({
  id: z.string().cuid("Invalid user ID"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return Response.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const user = await db.user.create({
      data: validatedData,
    });

    return Response.json(user, { status: 201 });
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

    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    const user = await db.user.update({
      where: { id: validatedData.id },
      data: validatedData,
    });

    return Response.json(user);
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

    if (error.code === "P2025") {
      // Prisma record not found
      return new Response("User not found", { status: 404 });
    }

    return new Response("Internal Server Error", { status: 500 });
  }
}
```

### 2.2 Validation des Query Parameters

```typescript
// app/api/posts/route.ts
import { z } from "zod";

const querySchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val))
    .pipe(z.number().min(1))
    .default("1"),
  limit: z
    .string()
    .transform((val) => parseInt(val))
    .pipe(z.number().min(1).max(100))
    .default("10"),
  category: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "title", "views"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validatedQuery = querySchema.parse(queryParams);

    const where = {
      ...(validatedQuery.category && { category: validatedQuery.category }),
      ...(validatedQuery.search && {
        OR: [
          { title: { contains: validatedQuery.search, mode: "insensitive" } },
          { content: { contains: validatedQuery.search, mode: "insensitive" } },
        ],
      }),
    };

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        skip: (validatedQuery.page - 1) * validatedQuery.limit,
        take: validatedQuery.limit,
        orderBy: { [validatedQuery.sortBy]: validatedQuery.sortOrder },
      }),
      db.post.count({ where }),
    ]);

    return Response.json({
      posts,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total,
        pages: Math.ceil(total / validatedQuery.limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          error: "Invalid query parameters",
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    return new Response("Internal Server Error", { status: 500 });
  }
}
```

## 3. Patterns d'Authentification et Autorisation

### 3.1 Middleware d'Authentification

```typescript
// lib/auth-middleware.ts
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: User) => Promise<Response>
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    return handler(request, session.user);
  } catch (error) {
    return new Response("Authentication failed", { status: 401 });
  }
}

export async function withRole(
  request: NextRequest,
  requiredRole: string,
  handler: (request: NextRequest, user: User) => Promise<Response>
) {
  return withAuth(request, async (req, user) => {
    if (!user.roles?.includes(requiredRole)) {
      return new Response("Forbidden", { status: 403 });
    }

    return handler(req, user);
  });
}
```

### 3.2 Routes Protégées

```typescript
// app/api/admin/users/route.ts
import { withRole } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  return withRole(request, "admin", async (req, user) => {
    try {
      const users = await db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          roles: true,
          createdAt: true,
        },
      });

      return Response.json(users);
    } catch (error) {
      return new Response("Failed to fetch users", { status: 500 });
    }
  });
}

export async function DELETE(request: NextRequest) {
  return withRole(request, "admin", async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const userId = searchParams.get("id");

      if (!userId) {
        return new Response("User ID is required", { status: 400 });
      }

      // Prevent admin from deleting themselves
      if (userId === user.id) {
        return new Response("Cannot delete your own account", { status: 400 });
      }

      await db.user.delete({
        where: { id: userId },
      });

      return new Response(null, { status: 204 });
    } catch (error) {
      return new Response("Failed to delete user", { status: 500 });
    }
  });
}
```

### 3.3 Routes Utilisateur Spécifiques

```typescript
// app/api/user/profile/route.ts
import { withAuth } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const profile = await db.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
          createdAt: true,
        },
      });

      return Response.json(profile);
    } catch (error) {
      return new Response("Failed to fetch profile", { status: 500 });
    }
  });
}

export async function PUT(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const body = await req.json();
      const updateSchema = z.object({
        name: z.string().min(2).optional(),
        bio: z.string().max(500).optional(),
        avatar: z.string().url().optional(),
      });

      const validatedData = updateSchema.parse(body);

      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: validatedData,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
        },
      });

      return Response.json(updatedUser);
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

      return new Response("Failed to update profile", { status: 500 });
    }
  });
}
```

## 4. Patterns de Gestion d'Erreurs

### 4.1 Gestionnaire d'Erreurs Centralisé

```typescript
// lib/error-handler.ts
import { Prisma } from "@prisma/client";
import { z } from "zod";

export class APIError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

export function handleAPIError(error: unknown): Response {
  console.error("API Error:", error);

  // Validation errors
  if (error instanceof z.ZodError) {
    return Response.json(
      {
        error: "Validation failed",
        details: error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  // Custom API errors
  if (error instanceof APIError) {
    return Response.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.status }
    );
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return Response.json(
          { error: "A record with this data already exists" },
          { status: 409 }
        );
      case "P2025":
        return Response.json({ error: "Record not found" }, { status: 404 });
      case "P2003":
        return Response.json(
          { error: "Foreign key constraint failed" },
          { status: 400 }
        );
      default:
        return Response.json({ error: "Database error" }, { status: 500 });
    }
  }

  // Generic server error
  return Response.json({ error: "Internal server error" }, { status: 500 });
}

// Wrapper pour les route handlers
export function withErrorHandler(
  handler: (request: Request, context?: any) => Promise<Response>
) {
  return async (request: Request, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleAPIError(error);
    }
  };
}
```

### 4.2 Utilisation du Gestionnaire d'Erreurs

```typescript
// app/api/posts/route.ts
import { withErrorHandler, APIError } from "@/lib/error-handler";

export const GET = withErrorHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    throw new APIError("Post ID is required", 400, "MISSING_ID");
  }

  const post = await db.post.findUnique({
    where: { id },
    include: {
      author: {
        select: { name: true, avatar: true },
      },
      comments: {
        include: {
          author: {
            select: { name: true, avatar: true },
          },
        },
      },
    },
  });

  if (!post) {
    throw new APIError("Post not found", 404, "POST_NOT_FOUND");
  }

  return Response.json(post);
});

export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json();

  const createPostSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    categoryId: z.string().cuid("Invalid category ID"),
    published: z.boolean().default(false),
  });

  const validatedData = createPostSchema.parse(body);

  // Verify category exists
  const category = await db.category.findUnique({
    where: { id: validatedData.categoryId },
  });

  if (!category) {
    throw new APIError("Category not found", 404, "CATEGORY_NOT_FOUND");
  }

  const post = await db.post.create({
    data: {
      ...validatedData,
      authorId: "current-user-id", // From auth context
    },
    include: {
      author: {
        select: { name: true, avatar: true },
      },
      category: true,
    },
  });

  return Response.json(post, { status: 201 });
});
```

## 5. Implications pour le CLI

### 5.1 Génération Automatique d'API Routes

Le CLI devra détecter et générer automatiquement :

**Patterns de base :**

- Route handlers avec méthodes HTTP appropriées
- Validation Zod intégrée pour body et query params
- Gestion d'erreurs centralisée
- Authentification et autorisation par rôle

**Patterns avancés :**

- Middleware d'authentification réutilisable
- Pagination et filtrage automatiques
- Upload de fichiers avec validation
- Rate limiting et CORS configurables

### 5.2 Templates de Génération

```typescript
// Template d'API route généré automatiquement
export const generateAPIRoute = (entity: EntityConfig) => {
  const hasAuth = entity.requiresAuth;
  const hasRoles = entity.roles && entity.roles.length > 0;

  return `
import { z } from 'zod'
import { withErrorHandler${hasAuth ? ", withAuth" : ""}${
    hasRoles ? ", withRole" : ""
  } } from '@/lib/api-utils'
import { db } from '@/lib/db'

const create${entity.name}Schema = z.object({
  ${entity.fields
    .map((field) => `${field.name}: ${generateZodSchema(field)}`)
    .join(",\n  ")}
})

const update${entity.name}Schema = create${entity.name}Schema.partial().extend({
  id: z.string().cuid('Invalid ${entity.name.toLowerCase()} ID')
})

const querySchema = z.object({
  page: z.string().transform(val => parseInt(val)).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(100)).default('10'),
  ${entity.searchableFields
    ?.map((field) => `${field}: z.string().optional()`)
    .join(",\n  ")}
})

export const GET = withErrorHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const queryParams = Object.fromEntries(searchParams.entries())
  const validatedQuery = querySchema.parse(queryParams)

  const where = {
    ${entity.searchableFields
      ?.map(
        (field) => `
    ...(validatedQuery.${field} && { ${field}: { contains: validatedQuery.${field}, mode: 'insensitive' } })`
      )
      .join(",\n    ")}
  }

  const [${entity.name.toLowerCase()}s, total] = await Promise.all([
    db.${entity.name.toLowerCase()}.findMany({
      where,
      skip: (validatedQuery.page - 1) * validatedQuery.limit,
      take: validatedQuery.limit,
      orderBy: { createdAt: 'desc' }
    }),
    db.${entity.name.toLowerCase()}.count({ where })
  ])

  return Response.json({
    ${entity.name.toLowerCase()}s,
    pagination: {
      page: validatedQuery.page,
      limit: validatedQuery.limit,
      total,
      pages: Math.ceil(total / validatedQuery.limit)
    }
  })
})

export const POST = ${
    hasAuth
      ? hasRoles
        ? `withRole(request, '${entity.roles[0]}', `
        : "withAuth(request, "
      : ""
  }withErrorHandler(async (request: Request${
    hasAuth ? ", user: User" : ""
  }) => {
  const body = await request.json()
  const validatedData = create${entity.name}Schema.parse(body)

  const ${entity.name.toLowerCase()} = await db.${entity.name.toLowerCase()}.create({
    data: {
      ...validatedData,
      ${hasAuth ? "userId: user.id" : ""}
    }
  })

  return Response.json(${entity.name.toLowerCase()}, { status: 201 })
})${hasAuth ? ")" : ""}
`;
};
```

### 5.3 Détection de Patterns

Le CLI devra identifier :

- **Entités de données** → CRUD routes automatiques
- **Besoins d'authentification** → Middleware auth intégré
- **Rôles utilisateur** → Protection par rôle
- **Champs recherchables** → Filtrage automatique
- **Relations** → Includes et joins appropriés

## 6. Patterns Avancés - CORS et Sécurité

### 6.1 Configuration CORS

```typescript
// lib/cors.ts
export function setCORSHeaders(response: Response, origin?: string) {
  const allowedOrigins = [
    "http://localhost:3000",
    "https://myapp.com",
    "https://admin.myapp.com",
  ];

  const corsOrigin = origin && allowedOrigins.includes(origin) ? origin : "*";

  response.headers.set("Access-Control-Allow-Origin", corsOrigin);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Max-Age", "86400");

  return response;
}

// app/api/public/data/route.ts
export async function GET(request: Request) {
  const origin = request.headers.get("origin");

  try {
    const data = await db.publicData.findMany();
    const response = Response.json(data);
    return setCORSHeaders(response, origin);
  } catch (error) {
    const response = new Response("Internal Server Error", { status: 500 });
    return setCORSHeaders(response, origin);
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  const response = new Response(null, { status: 200 });
  return setCORSHeaders(response, origin);
}
```

### 6.2 Rate Limiting

```typescript
// lib/rate-limit.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function rateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 60 // seconds
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const key = `rate_limit:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - window;

  // Remove old entries
  await redis.zremrangebyscore(key, 0, windowStart);

  // Count current requests
  const current = await redis.zcard(key);

  if (current >= limit) {
    const oldest = await redis.zrange(key, 0, 0, { withScores: true });
    const reset = oldest[0] ? oldest[0].score + window : now + window;

    return {
      success: false,
      remaining: 0,
      reset: reset,
    };
  }

  // Add current request
  await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });
  await redis.expire(key, window);

  return {
    success: true,
    remaining: limit - current - 1,
    reset: now + window,
  };
}

// Middleware wrapper
export function withRateLimit(
  limit: number = 10,
  window: number = 60,
  keyGenerator: (request: Request) => string = (req) => {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";
    return ip;
  }
) {
  return function (
    handler: (request: Request, context?: any) => Promise<Response>
  ) {
    return async (request: Request, context?: any) => {
      const identifier = keyGenerator(request);
      const result = await rateLimit(identifier, limit, window);

      if (!result.success) {
        return new Response("Too Many Requests", {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": result.reset.toString(),
            "Retry-After": (
              result.reset - Math.floor(Date.now() / 1000)
            ).toString(),
          },
        });
      }

      const response = await handler(request, context);

      // Add rate limit headers to successful responses
      response.headers.set("X-RateLimit-Limit", limit.toString());
      response.headers.set(
        "X-RateLimit-Remaining",
        result.remaining.toString()
      );
      response.headers.set("X-RateLimit-Reset", result.reset.toString());

      return response;
    };
  };
}
```

### 6.3 Utilisation du Rate Limiting

```typescript
// app/api/auth/login/route.ts
import { withRateLimit } from "@/lib/rate-limit";

export const POST = withRateLimit(5, 900, (req) => {
  // Rate limit by IP for login attempts
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  return `login:${ip}`;
})(async (request: Request) => {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate credentials
    const user = await auth.signIn("credentials", { email, password });

    return Response.json({ success: true, user });
  } catch (error) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }
});

// app/api/public/search/route.ts
export const GET = withRateLimit(
  100,
  60
)(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return new Response("Query parameter required", { status: 400 });
  }

  try {
    const results = await searchService.search(query);
    return Response.json(results);
  } catch (error) {
    return new Response("Search failed", { status: 500 });
  }
});
```

## 7. Patterns de Streaming et Réponses Avancées

### 7.1 Streaming de Données

```typescript
// app/api/stream/data/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const batchSize = parseInt(searchParams.get("batchSize") || "100");

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let offset = 0;
        let hasMore = true;

        while (hasMore) {
          const batch = await db.largeDataset.findMany({
            skip: offset,
            take: batchSize,
            orderBy: { id: "asc" },
          });

          if (batch.length === 0) {
            hasMore = false;
            break;
          }

          // Send batch as JSON lines
          for (const item of batch) {
            const line = JSON.stringify(item) + "\n";
            controller.enqueue(encoder.encode(line));
          }

          offset += batchSize;

          // Add small delay to prevent overwhelming
          await new Promise((resolve) => setTimeout(resolve, 10));
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Transfer-Encoding": "chunked",
    },
  });
}
```

### 7.2 Server-Sent Events (SSE)

```typescript
// app/api/events/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return new Response("User ID required", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      const data = `data: ${JSON.stringify({
        type: "connected",
        timestamp: Date.now(),
      })}\n\n`;
      controller.enqueue(encoder.encode(data));

      // Set up real-time subscription (example with Redis)
      const subscription = redis.subscribe(`user:${userId}:events`);

      subscription.on("message", (channel, message) => {
        try {
          const event = JSON.parse(message);
          const sseData = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(sseData));
        } catch (error) {
          console.error("SSE message error:", error);
        }
      });

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        const ping = `data: ${JSON.stringify({
          type: "ping",
          timestamp: Date.now(),
        })}\n\n`;
        controller.enqueue(encoder.encode(ping));
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        subscription.unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
```

### 7.3 Upload de Fichiers avec Streaming

```typescript
// app/api/upload/stream/route.ts
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response("No file uploaded", { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (file.size > maxSize) {
      return Response.json({ error: "File too large" }, { status: 400 });
    }

    // Create upload directory
    const uploadDir = join(process.cwd(), "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filepath = join(uploadDir, filename);

    // Stream file to disk
    const buffer = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(buffer));

    // Save file metadata to database
    const fileRecord = await db.file.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path: filepath,
      },
    });

    return Response.json({
      id: fileRecord.id,
      filename,
      size: file.size,
      type: file.type,
      url: `/api/files/${fileRecord.id}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response("Upload failed", { status: 500 });
  }
}
```

## 8. Patterns de Cache et Performance

### 8.1 Cache avec Next.js

```typescript
// app/api/posts/[id]/route.ts
import { unstable_cache } from "next/cache";

const getCachedPost = unstable_cache(
  async (id: string) => {
    return db.post.findUnique({
      where: { id },
      include: {
        author: { select: { name: true, avatar: true } },
        tags: true,
      },
    });
  },
  ["post"],
  {
    tags: ["posts"],
    revalidate: 3600, // 1 hour
  }
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await getCachedPost(id);

    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    return Response.json(post, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
```

### 8.2 Cache Redis Personnalisé

```typescript
// lib/cache.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // Try to get from cache
  const cached = await redis.get(key);
  if (cached) {
    return cached as T;
  }

  // Fetch fresh data
  const data = await fetcher();

  // Store in cache
  await redis.setex(key, ttl, JSON.stringify(data));

  return data;
}

// app/api/stats/route.ts
export async function GET(request: Request) {
  try {
    const stats = await withCache(
      "app:stats",
      async () => {
        const [userCount, postCount, commentCount] = await Promise.all([
          db.user.count(),
          db.post.count(),
          db.comment.count(),
        ]);

        return { userCount, postCount, commentCount };
      },
      300 // 5 minutes
    );

    return Response.json(stats, {
      headers: {
        "Cache-Control": "public, s-maxage=300",
      },
    });
  } catch (error) {
    return new Response("Failed to fetch stats", { status: 500 });
  }
}
```

## 9. Implications Avancées pour le CLI

### 9.1 Génération de Patterns Complexes

Le CLI devra détecter et générer automatiquement :

**Patterns de sécurité :**

- CORS configuré selon l'environnement
- Rate limiting par endpoint et utilisateur
- Validation stricte avec sanitization
- Headers de sécurité appropriés

**Patterns de performance :**

- Cache intelligent avec invalidation
- Streaming pour grandes données
- Compression et optimisation
- Monitoring et métriques

### 9.2 Templates Avancés

```typescript
// Générateur d'API complète avec sécurité
export const generateSecureAPIRoute = (entity: EntityConfig) => {
  const needsRateLimit = entity.public || entity.sensitive;
  const needsCache = entity.cacheable;
  const needsStreaming = entity.largeData;

  return `
import { z } from 'zod'
import { withErrorHandler, withAuth, withRole } from '@/lib/api-utils'
${needsRateLimit ? "import { withRateLimit } from '@/lib/rate-limit'" : ""}
${needsCache ? "import { withCache } from '@/lib/cache'" : ""}
import { db } from '@/lib/db'

${generateSchemas(entity)}

export const GET = ${
    needsRateLimit ? `withRateLimit(${entity.rateLimit || 100}, 60)` : ""
  }(
  withErrorHandler(async (request: Request) => {
    const { searchParams } = new URL(request.url)
    const validatedQuery = querySchema.parse(Object.fromEntries(searchParams.entries()))

    ${
      needsCache
        ? `
    const cacheKey = \`${entity.name.toLowerCase()}:\${JSON.stringify(validatedQuery)}\`
    const data = await withCache(cacheKey, async () => {
      return fetchData(validatedQuery)
    }, ${entity.cacheTTL || 3600})
    `
        : `
    const data = await fetchData(validatedQuery)
    `
    }

    return Response.json(data${
      needsCache
        ? `, {
      headers: { 'Cache-Control': 'public, s-maxage=${
        entity.cacheTTL || 3600
      }' }
    }`
        : ""
    })
  })
)${needsRateLimit ? ")" : ""}

async function fetchData(query: any) {
  const where = buildWhereClause(query)

  ${
    needsStreaming
      ? `
  if (query.stream) {
    return streamLargeDataset(where)
  }
  `
      : ""
  }

  const [items, total] = await Promise.all([
    db.${entity.name.toLowerCase()}.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { createdAt: 'desc' }
    }),
    db.${entity.name.toLowerCase()}.count({ where })
  ])

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit)
    }
  }
}
`;
};
```

## Conclusion

Les patterns d'API Routes avec Next.js App Router offrent une base très structurée pour la génération automatique. Le CLI devra implémenter des templates qui couvrent la validation Zod, la gestion d'erreurs centralisée, l'authentification par rôle, et les patterns CRUD complets.

Les patterns avancés comme CORS, rate limiting, streaming et cache nécessitent une détection intelligente des besoins pour générer automatiquement des APIs sécurisées et performantes. L'intégration avec les Route Handlers permet une génération d'APIs type-safe et performantes, tandis que les patterns de middleware fournissent la sécurité et la réutilisabilité nécessaires pour des applications professionnelles.
