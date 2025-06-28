# Analyse des Patterns de Structure de Fichiers

## Vue d'ensemble

Cette analyse examine les patterns de structure de fichiers Next.js modernes, l'organisation du code avec App Router, la structuration des dossiers src/, shared/, et les bonnes pratiques d'organisation pour les applications complexes.

## ANALYSE EN DEUX TEMPS

### Temps 1 : Structure de base Next.js

- App Router et organisation des routes
- Dossiers src/, lib/, components/
- Conventions de nommage et organisation

### Temps 2 : Structure avancée et scalabilité

- Architecture modulaire et shared/
- Patterns d'organisation pour grandes applications
- Path aliases et configuration TypeScript

## 1. Structure de Base Next.js App Router

### 1.1 Structure Recommandée par l'Utilisateur

```
project/
├── app/                    # App Router (@/app)
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── route.ts
│   │   ├── posts/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── health/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   └── global-error.tsx
├── src/                    # Source (@/)
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── utils.ts
│   │   ├── validations.ts
│   │   └── constants.ts
│   ├── services/          # Server Actions
│   │   ├── auth/
│   │   │   ├── actions.ts
│   │   │   └── queries.ts
│   │   ├── posts/
│   │   │   ├── actions.ts
│   │   │   └── queries.ts
│   │   └── users/
│   │       ├── actions.ts
│   │       └── queries.ts
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-posts.ts
│   │   └── use-local-storage.ts
│   └── components/
│       ├── ui/            # shadcn/ui components
│       │   ├── button.tsx
│       │   ├── input.tsx
│       │   ├── card.tsx
│       │   └── index.ts
│       ├── forms/
│       │   ├── login-form.tsx
│       │   ├── post-form.tsx
│       │   └── contact-form.tsx
│       ├── layout/
│       │   ├── header.tsx
│       │   ├── footer.tsx
│       │   ├── sidebar.tsx
│       │   └── navigation.tsx
│       └── features/
│           ├── auth/
│           │   ├── login-card.tsx
│           │   └── user-menu.tsx
│           ├── posts/
│           │   ├── post-list.tsx
│           │   ├── post-card.tsx
│           │   └── post-editor.tsx
│           └── dashboard/
│               ├── stats-card.tsx
│               └── recent-activity.tsx
├── shared/                 # Types & Validation (@/shared)
│   ├── types/
│   │   ├── auth.ts
│   │   ├── posts.ts
│   │   ├── users.ts
│   │   └── api.ts
│   └── validation/
│       ├── auth.ts
│       ├── posts.ts
│       └── users.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   ├── images/
│   ├── icons/
│   └── favicon.ico
├── __tests__/
│   ├── components/
│   ├── pages/
│   ├── api/
│   └── utils/
├── docs/
│   ├── api.md
│   ├── deployment.md
│   └── development.md
├── components.json        # shadcn/ui config
├── next.config.js
├── tailwind.config.js     # deprecated in tailwind css V4
├── tsconfig.json
├── package.json
└── README.md
```

### 1.2 Configuration des Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./app/*"],
      "@/shared/*": ["./shared/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/services/*": ["./src/services/*"],
      "@/types/*": ["./shared/types/*"],
      "@/validation/*": ["./shared/validation/*"]
    }
  }
}
```

### 1.3 Configuration Next.js pour Path Aliases

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
      "@/app": path.resolve(__dirname, "app"),
      "@/shared": path.resolve(__dirname, "shared"),
    };
    return config;
  },
};

module.exports = nextConfig;
```

## 2. Organisation des Composants

### 2.1 Structure des Composants UI

```typescript
// src/components/ui/index.ts
export { Button } from "./button";
export { Input } from "./input";
export { Card, CardContent, CardHeader, CardTitle } from "./card";
export { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
export { Form, FormControl, FormField, FormItem, FormLabel } from "./form";

// Utilisation simplifiée
import { Button, Card, CardContent } from "@/components/ui";
```

### 2.2 Composants par Feature

```typescript
// src/components/features/auth/index.ts
export { LoginForm } from "./login-form";
export { SignupForm } from "./signup-form";
export { UserMenu } from "./user-menu";
export { AuthGuard } from "./auth-guard";

// src/components/features/posts/index.ts
export { PostList } from "./post-list";
export { PostCard } from "./post-card";
export { PostEditor } from "./post-editor";
export { PostFilters } from "./post-filters";

// Utilisation
import { LoginForm, UserMenu } from "@/components/features/auth";
import { PostList, PostCard } from "@/components/features/posts";
```

### 2.3 Composants de Layout

```typescript
// src/components/layout/index.ts
export { Header } from "./header";
export { Footer } from "./footer";
export { Sidebar } from "./sidebar";
export { Navigation } from "./navigation";
export { PageContainer } from "./page-container";

// src/components/layout/page-container.tsx
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function PageContainer({
  children,
  className,
  maxWidth = "xl",
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto px-4 sm:px-6 lg:px-8",
        {
          "max-w-sm": maxWidth === "sm",
          "max-w-md": maxWidth === "md",
          "max-w-lg": maxWidth === "lg",
          "max-w-xl": maxWidth === "xl",
          "max-w-2xl": maxWidth === "2xl",
          "max-w-none": maxWidth === "full",
        },
        className
      )}
    >
      {children}
    </div>
  );
}
```

## 3. Organisation des Services et Actions

### 3.1 Structure des Services

```typescript
// src/services/auth/actions.ts
"use server";

import { z } from "zod";
import { LoginSchema, SignupSchema } from "@/shared/validation/auth";
import { auth } from "@/lib/auth";

export async function loginAction(prevState: any, formData: FormData) {
  // Implementation
}

export async function signupAction(prevState: any, formData: FormData) {
  // Implementation
}

// src/services/auth/queries.ts
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getCurrentUser() {
  const session = await auth.api.getSession();
  if (!session) return null;

  return await db.user.findUnique({
    where: { id: session.user.id },
  });
}

export async function getUserById(id: string) {
  return await db.user.findUnique({
    where: { id },
  });
}

// src/services/auth/index.ts
export * from "./actions";
export * from "./queries";
```

### 3.2 Structure des Hooks

```typescript
// src/hooks/use-auth.ts
"use client";

import { authClient } from "@/lib/auth-client";

export function useAuth() {
  const { data: session, isPending, error } = authClient.useSession();

  return {
    user: session?.user,
    isLoading: isPending,
    isAuthenticated: !!session,
    error,
    signIn: authClient.signIn,
    signOut: authClient.signOut,
  };
}

// src/hooks/use-posts.ts
("use client");

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost, getPosts, updatePost, deletePost } from "@/services/posts";

export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// src/hooks/index.ts
export { useAuth } from "./use-auth";
export { usePosts, useCreatePost } from "./use-posts";
export { useLocalStorage } from "./use-local-storage";
```

## 4. Organisation des Types et Validation

### 4.1 Types Partagés

```typescript
// shared/types/auth.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "user" | "admin" | "moderator";
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: User;
  expires: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// shared/types/posts.ts
export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  published: boolean;
  authorId: string;
  author: User;
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

// shared/types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// shared/types/index.ts
export * from "./auth";
export * from "./posts";
export * from "./api";
```

### 4.2 Schémas de Validation

```typescript
// shared/validation/auth.ts
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const SignupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase and number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;

// shared/validation/posts.ts
import { z } from "zod";

export const CreatePostSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  content: z.string().min(10, "Content must be at least 10 characters"),
  excerpt: z.string().max(200).optional(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

export const UpdatePostSchema = CreatePostSchema.partial();

export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;

// shared/validation/index.ts
export * from "./auth";
export * from "./posts";
```

## 5. Configuration et Utilitaires

### 5.1 Bibliothèque d'Utilitaires

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function truncate(text: string, length: number) {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

// src/lib/constants.ts
export const APP_CONFIG = {
  name: "Mon App",
  description: "Description de mon application",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  version: "1.0.0",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  POSTS: "/posts",
  SETTINGS: "/settings",
} as const;

export const API_ROUTES = {
  AUTH: "/api/auth",
  POSTS: "/api/posts",
  USERS: "/api/users",
} as const;

// src/lib/validations.ts
import { z } from "zod";

export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(8);
export const slugSchema = z.string().regex(/^[a-z0-9-]+$/);

export function validateEmail(email: string) {
  return emailSchema.safeParse(email);
}

export function validatePassword(password: string) {
  return passwordSchema.safeParse(password);
}
```

### 5.2 Configuration de Base de Données

```typescript
// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});

// src/lib/auth-client.ts
("use client");

import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});
```

## 6. Implications pour le CLI

### 6.1 Génération Automatique de Structure

Le CLI devra détecter et générer automatiquement :

**Structure de base :**

- Dossiers app/, src/, shared/ avec organisation recommandée
- Configuration des path aliases TypeScript et Next.js
- Index files pour faciliter les imports
- Structure modulaire par feature

**Organisation des fichiers :**

- Composants organisés par type (ui, features, layout)
- Services séparés en actions et queries
- Types et validation dans shared/
- Hooks personnalisés avec patterns réutilisables

### 6.2 Détection de Patterns

Le CLI devra identifier :

- **Features complexes** → Organisation modulaire par feature
- **Composants réutilisables** → Structure ui/ avec index
- **Types partagés** → Dossier shared/ avec validation
- **Services métier** → Organisation par domaine
- **Hooks personnalisés** → Patterns de composition

## Conclusion

Les patterns de structure de fichiers Next.js offrent une base solide pour l'organisation d'applications complexes. Le CLI devra implémenter des templates qui respectent la structure recommandée par l'utilisateur, avec une organisation claire par domaine métier, des path aliases optimisés, et une séparation logique entre les différents types de code.

L'intégration de ces patterns permet de créer des applications maintenables et scalables dès la génération, avec une structure cohérente qui facilite la collaboration en équipe et l'évolution du projet.
