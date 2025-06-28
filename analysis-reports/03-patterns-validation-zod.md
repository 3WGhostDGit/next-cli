# Analyse des Patterns de Validation Zod

## Vue d'ensemble

Cette analyse examine les patterns de validation Zod dans les projets Next.js, leur intégration avec les formulaires et Server Actions, et les bonnes pratiques de structuration des schémas.

## ANALYSE EN DEUX TEMPS

### Temps 1 : Analyse des patterns de base Zod

- Patterns de définition de schémas
- Validation de types primitifs
- Chaînage de validations

### Temps 2 : Analyse des patterns avancés et intégration Next.js

- Refinements et transformations
- Intégration avec Server Actions
- Patterns de formulaires complexes

## 1. Patterns Fondamentaux de Zod

### 1.1 Définition de Schéma de Base

```typescript
import { z } from "zod";

const User = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(18),
});

type User = z.infer<typeof User>;
```

**Caractéristiques identifiées :**

- Import depuis "zod"
- Définition avec `z.object()`
- Inférence de type avec `z.infer<typeof Schema>`
- Validation chainée (`.email()`, `.min()`)

### 1.2 Validation de Chaînes Avancée

```typescript
const stringValidations = z.object({
  email: z.string().email(),
  url: z.string().url(),
  uuid: z.string().uuid(),
  password: z
    .string()
    .min(8, { message: "Au moins 8 caractères" })
    .regex(/[A-Z]/, { message: "Au moins une majuscule" })
    .regex(/[0-9]/, { message: "Au moins un chiffre" })
    .regex(/[^a-zA-Z0-9]/, { message: "Au moins un caractère spécial" }),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Caractères alphanumériques uniquement",
    }),
});
```

## 2. Patterns de Validation Complexe

### 2.1 Refinements Personnalisés

```typescript
const passwordForm = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// Refinement asynchrone
const userSchema = z
  .object({
    email: z.string().email(),
  })
  .refine(
    async (data) => {
      const exists = await checkEmailExists(data.email);
      return !exists;
    },
    {
      message: "Cet email est déjà utilisé",
      path: ["email"],
    }
  );
```

### 2.2 Transformations de Données

```typescript
const numericString = z
  .string()
  .transform((val) => parseInt(val, 10))
  .pipe(z.number().min(0));

const trimmedString = z
  .string()
  .transform((val) => val.trim())
  .pipe(z.string().min(1, "Ne peut pas être vide"));

const dateFromString = z
  .string()
  .transform((str) => new Date(str))
  .pipe(z.date());
```

## 3. Patterns de Schémas Composés

### 3.1 Unions et Intersections

```typescript
// Union
const stringOrNumber = z.union([z.string(), z.number()]);
// ou
const stringOrNumber = z.string().or(z.number());

// Intersection
const userWithTimestamps = z
  .object({
    name: z.string(),
    email: z.string().email(),
  })
  .and(
    z.object({
      createdAt: z.date(),
      updatedAt: z.date(),
    })
  );
```

### 3.2 Schémas Optionnels et Nullables

```typescript
const userProfile = z.object({
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  bio: z.string().nullable(),
  age: z.number().optional().nullable(),
});

// Avec valeurs par défaut
const settings = z.object({
  theme: z.enum(["light", "dark"]).default("light"),
  notifications: z.boolean().default(true),
  language: z.string().default("en"),
});
```

## 4. Patterns de Validation de Formulaires

### 4.1 Schéma de Formulaire d'Inscription

```typescript
const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Le nom doit contenir au moins 2 caractères" })
      .trim(),
    email: z
      .string()
      .email({ message: "Veuillez entrer un email valide" })
      .trim(),
    password: z
      .string()
      .min(8, {
        message: "Le mot de passe doit contenir au moins 8 caractères",
      })
      .regex(/[a-zA-Z]/, { message: "Doit contenir au moins une lettre" })
      .regex(/[0-9]/, { message: "Doit contenir au moins un chiffre" })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Doit contenir au moins un caractère spécial",
      })
      .trim(),
  })
  .refine((data) => data.password.length >= 8, {
    message: "Le mot de passe est requis",
    path: ["password"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;
```

### 4.2 Validation avec safeParse

```typescript
export function validateSignupForm(formData: FormData) {
  const result = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  return { data: result.data };
}
```

## 5. Patterns d'Intégration avec Next.js

### 5.1 Validation dans Server Actions

```typescript
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

const createPostSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  content: z
    .string()
    .min(10, "Le contenu doit contenir au moins 10 caractères"),
  published: z.boolean().default(false),
});

export async function createPost(formData: FormData) {
  const validatedFields = createPostSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    published: formData.get("published") === "on",
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { title, content, published } = validatedFields.data;

  try {
    await db.post.create({
      data: { title, content, published },
    });

    revalidatePath("/posts");
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la création du post" };
  }
}
```

### 5.2 Validation d'API Routes

```typescript
// app/api/users/route.ts
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["user", "admin"]).default("user"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    const user = await db.user.create({
      data: validatedData,
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
```

## 6. Patterns de Schémas Réutilisables

### 6.1 Schémas de Base

```typescript
// schemas/base.ts
export const baseEntitySchema = z.object({
  id: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});
```

### 6.2 Extension de Schémas

```typescript
// schemas/user.ts
const userBaseSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export const createUserSchema = userBaseSchema;

export const updateUserSchema = userBaseSchema.partial();

export const userWithIdSchema = userBaseSchema.extend({
  id: z.string().cuid(),
});

export const userResponseSchema = userWithIdSchema.extend({
  ...baseEntitySchema.shape,
});
```

## 7. Patterns de Validation Conditionnelle

### 7.1 Validation Basée sur le Contexte

```typescript
const userSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("individual"),
    name: z.string(),
    email: z.string().email(),
  }),
  z.object({
    type: z.literal("company"),
    companyName: z.string(),
    contactEmail: z.string().email(),
    taxId: z.string(),
  }),
]);

// Validation conditionnelle avec refine
const orderSchema = z
  .object({
    items: z.array(
      z.object({
        id: z.string(),
        quantity: z.number().min(1),
      })
    ),
    shippingMethod: z.enum(["standard", "express"]),
    shippingAddress: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.shippingMethod === "express") {
        return data.shippingAddress !== undefined;
      }
      return true;
    },
    {
      message: "L'adresse de livraison est requise pour la livraison express",
      path: ["shippingAddress"],
    }
  );
```

## 8. Patterns de Gestion d'Erreurs

### 8.1 Formatage d'Erreurs Personnalisé

```typescript
export function formatZodErrors(error: z.ZodError) {
  return error.issues.reduce((acc, issue) => {
    const path = issue.path.join(".");
    if (!acc[path]) {
      acc[path] = [];
    }
    acc[path].push(issue.message);
    return acc;
  }, {} as Record<string, string[]>);
}

export function getFirstError(error: z.ZodError): string {
  return error.issues[0]?.message || "Erreur de validation";
}
```

### 8.2 Messages d'Erreur Localisés

```typescript
const messages = {
  required: "Ce champ est requis",
  email: "Veuillez entrer un email valide",
  minLength: (min: number) => `Minimum ${min} caractères requis`,
  maxLength: (max: number) => `Maximum ${max} caractères autorisés`,
};

const localizedUserSchema = z.object({
  name: z
    .string({ required_error: messages.required })
    .min(2, { message: messages.minLength(2) }),
  email: z
    .string({ required_error: messages.required })
    .email({ message: messages.email }),
});
```

## 9. Patterns de Performance

### 9.1 Lazy Loading de Schémas

```typescript
const recursiveSchema = z.lazy(() =>
  z.object({
    name: z.string(),
    children: z.array(recursiveSchema).optional(),
  })
);

// Pour les schémas volumineux
const heavySchema = z.lazy(() =>
  import("./heavy-schema").then((m) => m.schema)
);
```

### 9.2 Schémas Précompilés

```typescript
// Précompilation pour de meilleures performances
const compiledUserSchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
  })
  .strict(); // Mode strict pour de meilleures performances
```

## 10. Patterns de Tests

### 10.1 Tests de Validation

```typescript
// __tests__/schemas/user.test.ts
import { describe, it, expect } from "vitest";
import { userSchema } from "../schemas/user";

describe("User Schema", () => {
  it("should validate correct user data", () => {
    const validUser = {
      name: "John Doe",
      email: "john@example.com",
    };

    expect(() => userSchema.parse(validUser)).not.toThrow();
  });

  it("should reject invalid email", () => {
    const invalidUser = {
      name: "John Doe",
      email: "invalid-email",
    };

    expect(() => userSchema.parse(invalidUser)).toThrow();
  });

  it("should return formatted errors", () => {
    const result = userSchema.safeParse({
      name: "",
      email: "invalid",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(2);
    }
  });
});
```

## 11. Implications pour le CLI

### 11.1 Templates de Génération Automatique

**Pour un modèle User :**

```typescript
// Génération automatique de :
// 1. Schema de base
export const userSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
});

// 2. Schemas dérivés
export const createUserSchema = userSchema;
export const updateUserSchema = userSchema.partial();
export const userResponseSchema = userSchema.extend({
  id: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 3. Types TypeScript
export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
```

### 11.2 Patterns de Détection

Le CLI devra détecter :

- **Champs email** → Validation `.email()`
- **Mots de passe** → Validation complexe avec regex
- **Relations** → Schémas avec références
- **Énumérations** → `z.enum()` ou `z.nativeEnum()`
- **Dates** → Transformation string vers Date
- **Fichiers** → Validation de taille et type

### 11.3 Génération de Formulaires

```typescript
// Template de formulaire généré automatiquement
"use client";

import { useActionState } from "react";
import { createUser } from "@/actions/user";
import { userSchema } from "@/schemas/user";

export function UserForm() {
  const [state, formAction, pending] = useActionState(createUser, {});

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="name">Nom</label>
        <input type="text" id="name" name="name" required />
        {state?.errors?.name && <p className="error">{state.errors.name[0]}</p>}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" required />
        {state?.errors?.email && (
          <p className="error">{state.errors.email[0]}</p>
        )}
      </div>

      <button type="submit" disabled={pending}>
        {pending ? "Création..." : "Créer"}
      </button>
    </form>
  );
}
```

## 7. Patterns Avancés - Refinements et Transformations

### 7.1 Refinements Personnalisés

```typescript
// Refinement simple
const myString = z.string().refine((val) => val.length <= 255, {
  message: "String can't be more than 255 characters",
});

// Refinement avec path personnalisé
const passwordForm = z
  .object({
    password: z.string(),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

// Refinement asynchrone
const userId = z.string().refine(async (id) => {
  // verify that ID exists in database
  return true;
});
```

### 7.2 SuperRefine pour Validation Avancée

```typescript
const UniqueStringArray = z.array(z.string()).superRefine((val, ctx) => {
  if (val.length > 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_big,
      maximum: 3,
      type: "array",
      inclusive: true,
      message: "Too many items 😡",
    });
  }

  if (val.length !== new Set(val).size) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `No duplicates allowed.`,
    });
  }
});
```

### 7.3 Transformations de Données

```typescript
// Transformation simple
const stringToNumber = z.string().transform((val) => val.length);

// Transformation avec validation
const numberInString = z.string().transform((val, ctx) => {
  const parsed = parseInt(val);
  if (isNaN(parsed)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Not a number",
    });
    return z.NEVER;
  }
  return parsed;
});

// Chaînage transform et refine
const nameToGreeting = z
  .string()
  .transform((val) => val.toUpperCase())
  .refine((val) => val.length > 15)
  .transform((val) => `Hello ${val}`)
  .refine((val) => val.indexOf("!") === -1);
```

### 7.4 Pipe pour Validation en Pipeline

```typescript
const stringToLength = z
  .string()
  .transform((val) => val.length)
  .pipe(z.number().min(5));

// Preprocessing avant validation
const coercedInt = z.preprocess((val) => {
  if (typeof val === "string") {
    return Number.parseInt(val);
  }
  return val;
}, z.int());
```

## 8. Patterns de Parsing Asynchrone

### 8.1 ParseAsync pour Schémas Asynchrones

```typescript
const schema = z.string().refine(async (val) => val.length <= 8);

// Parsing asynchrone
await schema.parseAsync("hello"); // => "hello"

// Safe parsing asynchrone
const result = await schema.safeParseAsync("hello");
// => { success: true; data: "hello" }
```

### 8.2 Transformations Asynchrones

```typescript
const IdToUser = z
  .string()
  .uuid()
  .transform(async (id) => {
    return await getUserById(id);
  });

// Utilisation obligatoire de parseAsync
const user = await IdToUser.parseAsync("uuid-here");
```

## 9. Patterns de Gestion d'Erreurs Avancée

### 9.1 Messages d'Erreur Personnalisés

```typescript
// Avec fonction d'erreur dynamique
const numberWithRandomCatch = z.number().catch((ctx) => {
  ctx.error; // the caught ZodError
  return Math.random();
});

// Refinement avec abort
const myString = z
  .string()
  .refine((val) => val.length > 8, { error: "Too short!", abort: true })
  .refine((val) => val === val.toLowerCase(), { error: "Must be lowercase" });
```

### 9.2 Gestion d'Issues Multiples

```typescript
const schema = z.number().superRefine((val, ctx) => {
  if (val < 10) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "should be >= 10",
      fatal: true,
    });
    return z.NEVER;
  }

  if (val !== 12) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "should be twelve",
    });
  }
});
```

## 10. Implications pour le CLI - Patterns Avancés

### 10.1 Génération de Refinements Automatiques

```typescript
// Pour un champ email unique
const userEmailSchema = z
  .string()
  .email("Email invalide")
  .refine(
    async (email) => {
      const exists = await db.user.findUnique({ where: { email } });
      return !exists;
    },
    {
      message: "Cet email est déjà utilisé",
      path: ["email"],
    }
  );

// Pour validation de mot de passe
const passwordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });
```

### 10.2 Templates de Transformation

```typescript
// Transformation automatique pour les dates
const dateStringSchema = z
  .string()
  .transform((str) => new Date(str))
  .pipe(z.date());

// Transformation pour les nombres
const numericStringSchema = z
  .string()
  .transform((val) => parseInt(val, 10))
  .pipe(z.number().min(0));
```

### 10.3 Détection de Patterns Complexes

Le CLI devra détecter :

- **Champs uniques** → Refinement asynchrone avec DB check
- **Confirmation de champs** → Refinement avec path personnalisé
- **Transformations de type** → String vers Number/Date
- **Validation conditionnelle** → SuperRefine avec logique complexe
- **Preprocessing** → Coercion de types avant validation

## Conclusion

Les patterns Zod sont très structurés et prévisibles, ce qui facilite grandement la génération automatique. Le CLI devra implémenter des templates qui couvrent les cas d'usage les plus courants tout en permettant la personnalisation pour les besoins spécifiques.

Les patterns avancés comme les refinements asynchrones, les transformations et le preprocessing offrent des possibilités puissantes pour la validation de données complexes que le CLI devra intégrer intelligemment.
