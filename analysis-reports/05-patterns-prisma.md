# Analyse des Patterns Prisma

## Vue d'ensemble

Cette analyse examine les patterns de modélisation de données avec Prisma, les relations, migrations, génération de types, et les opérations CRUD avancées.

## ANALYSE EN DEUX TEMPS

### Temps 1 : Modélisation et relations de base

- Patterns de définition de modèles
- Types de relations (1-1, 1-n, n-n)
- Migrations et évolution du schéma

### Temps 2 : Client Prisma et opérations avancées

- Patterns CRUD et requêtes complexes
- Transactions et gestion d'état
- Extensions et optimisations

## 1. Patterns de Modélisation de Base

### 1.1 Définition de Modèles Standard

```prisma
model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  name    String?
  posts   Post[]
  profile Profile?
}

model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  title     String   @db.VarChar(255)
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}

model Profile {
  id     Int     @id @default(autoincrement())
  bio    String?
  user   User    @relation(fields: [userId], references: [id])
  userId Int     @unique
}
```

**Caractéristiques identifiées :**

- `@id @default(autoincrement())` pour les clés primaires
- `@unique` pour les contraintes d'unicité
- `@default()` pour les valeurs par défaut
- `@updatedAt` pour les timestamps automatiques
- `@db.VarChar(255)` pour les types de base de données spécifiques

### 1.2 Relations One-to-One

```prisma
// Foreign key sur Profile
model User {
  id      String   @id @default(auto()) @map("_id") @db.ObjectId
  profile Profile?
}

model Profile {
  id     String @id @default(auto()) @map("_id") @db.ObjectId
  user   User   @relation(fields: [userId], references: [id])
  userId String @unique @db.ObjectId
}

// Foreign key sur User (alternative)
model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  profile   Profile? @relation(fields: [profileId], references: [id])
  profileId String?  @unique @db.ObjectId
}

model Profile {
  id   String @id @default(auto()) @map("_id") @db.ObjectId
  user User?
}
```

### 1.3 Relations One-to-Many

```prisma
model User {
  id    String @id @default(auto()) @map("_id") @db.ObjectId
  posts Post[]
}

model Post {
  id       String @id @default(auto()) @map("_id") @db.ObjectId
  author   User   @relation(fields: [authorId], references: [id])
  authorId String @db.ObjectId // relation scalar field
  title    String
}
```

### 1.4 Relations Many-to-Many Implicites

```prisma
model Post {
  id         Int        @id @default(autoincrement())
  title      String
  categories Category[]
}

model Category {
  id    Int    @id @default(autoincrement())
  name  String
  posts Post[]
}
```

### 1.5 Relations Many-to-Many Explicites

```prisma
model Post {
  id                Int                @id @default(autoincrement())
  title             String
  postsToCategories PostToCategories[]
}

model Category {
  id                Int                @id @default(autoincrement())
  name              String
  postsToCategories PostToCategories[]
}

model PostToCategories {
  postId     Int
  categoryId Int
  category   Category @relation(fields: [categoryId], references: [id])
  post       Post     @relation(fields: [postId], references: [id])

  @@id([postId, categoryId])
  @@index([postId])
  @@index([categoryId])
}
```

## 2. Patterns de Types et Contraintes

### 2.1 Énumérations

```prisma
model User {
  id   Int  @id @default(autoincrement())
  role Role @default(USER)
}

enum Role {
  USER
  ADMIN
  MODERATOR
}
```

### 2.2 Types Composites (MongoDB)

```prisma
model User {
  id      String   @id @default(auto()) @map("_id") @db.ObjectId
  address Address?
}

type Address {
  street String
  city   String
  state  String
  zip    String
}
```

### 2.3 Contraintes et Index

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String

  @@index([email])
  @@index([name, email])
}

model Post {
  id       Int    @id @default(autoincrement())
  authorId Int
  title    String

  @@index([authorId])
  @@unique([authorId, title])
}
```

## 3. Patterns de Migration

### 3.1 Évolution de Schéma

```bash
# Ajout d'un nouveau modèle
npx prisma migrate dev --name "add-tag-model"

# Modification d'un modèle existant
npx prisma migrate dev --name "add-published-field"

# Migration personnalisée
npx prisma migrate dev --name "custom-migration" --create-only
```

### 3.2 Migration SQL Générée

```sql
-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PostToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PostToTag_AB_unique" ON "_PostToTag"("A", "B");

-- AddForeignKey
ALTER TABLE "_PostToTag" ADD CONSTRAINT "_PostToTag_A_fkey"
FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## 4. Patterns Client Prisma - CRUD de Base

### 4.1 Opérations Create

```typescript
// Create simple
const user = await prisma.user.create({
  data: {
    name: "Alice",
    email: "alice@prisma.io",
  },
});

// Create avec relations
const user = await prisma.user.create({
  data: {
    email: "alice@prisma.io",
    posts: {
      create: [{ title: "My first post" }, { title: "My second post" }],
    },
    profile: {
      create: { bio: "I like coding" },
    },
  },
});

// CreateMany
const users = await prisma.user.createMany({
  data: [
    { name: "Alice", email: "alice@prisma.io" },
    { name: "Bob", email: "bob@prisma.io" },
  ],
  skipDuplicates: true,
});

// CreateManyAndReturn (nouveau)
const users = await prisma.user.createManyAndReturn({
  data: [
    { name: "Alice", email: "alice@prisma.io" },
    { name: "Bob", email: "bob@prisma.io" },
  ],
});
```

### 4.2 Opérations Read

```typescript
// FindMany avec filtres
const users = await prisma.user.findMany({
  where: {
    email: { contains: "prisma.io" },
    posts: { some: { published: true } },
  },
  include: { posts: true, profile: true },
  orderBy: { createdAt: "desc" },
  take: 10,
  skip: 20,
});

// FindUnique
const user = await prisma.user.findUnique({
  where: { email: "alice@prisma.io" },
  include: { posts: true },
});

// FindFirst
const user = await prisma.user.findFirst({
  where: { posts: { some: { published: true } } },
});

// FindUniqueOrThrow / FindFirstOrThrow
const user = await prisma.user.findUniqueOrThrow({
  where: { email: "alice@prisma.io" },
});
```

### 4.3 Opérations Update

```typescript
// Update simple
const user = await prisma.user.update({
  where: { id: 1 },
  data: { name: "Alice Updated" },
});

// Update avec relations
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    posts: {
      create: { title: "New post" },
      updateMany: {
        where: { published: false },
        data: { published: true },
      },
    },
  },
});

// UpdateMany
const result = await prisma.user.updateMany({
  where: { role: "USER" },
  data: { role: "MEMBER" },
});

// Opérations atomiques sur les nombres
const post = await prisma.post.update({
  where: { id: 1 },
  data: {
    views: { increment: 1 },
    likes: { increment: 1 },
  },
});
```

### 4.4 Opérations Delete

```typescript
// Delete simple
const user = await prisma.user.delete({
  where: { id: 1 },
});

// DeleteMany
const result = await prisma.user.deleteMany({
  where: { email: { contains: "test.com" } },
});

// Delete avec cascade (via relations)
const user = await prisma.user.delete({
  where: { id: 1 },
  include: { posts: true }, // Inclure les données supprimées
});
```

## 5. Patterns de Requêtes Avancées

### 5.1 Filtres Complexes

```typescript
// Opérateurs logiques
const posts = await prisma.post.findMany({
  where: {
    OR: [
      { title: { contains: "Prisma" } },
      { title: { contains: "Database" } },
    ],
    AND: {
      published: true,
      author: { role: "ADMIN" },
    },
    NOT: {
      title: { contains: "Draft" },
    },
  },
});

// Filtres sur relations
const users = await prisma.user.findMany({
  where: {
    posts: {
      some: {
        // Au moins un post publié
        published: true,
      },
    },
    profile: {
      is: {
        // Profile existe
        bio: { contains: "developer" },
      },
    },
  },
});
```

### 5.2 Sélection et Inclusion

```typescript
// Select spécifique
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    posts: {
      select: {
        title: true,
        published: true,
      },
    },
  },
});

// Include avec filtres
const users = await prisma.user.findMany({
  include: {
    posts: {
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    },
    _count: {
      select: { posts: true },
    },
  },
});
```

### 5.3 Agrégations

```typescript
// Count
const count = await prisma.user.count({
  where: { role: "USER" },
});

// Agrégations numériques
const stats = await prisma.post.aggregate({
  _count: { id: true },
  _avg: { views: true },
  _sum: { likes: true },
  _min: { createdAt: true },
  _max: { updatedAt: true },
});

// GroupBy
const userStats = await prisma.user.groupBy({
  by: ["role"],
  _count: { id: true },
  _avg: { age: true },
  having: {
    age: { _avg: { gte: 18 } },
  },
});
```

## 6. Patterns de Transactions

### 6.1 Transactions Séquentielles

```typescript
// Transaction array (opérations indépendantes)
const [users, posts] = await prisma.$transaction([
  prisma.user.findMany(),
  prisma.post.findMany({ where: { published: true } }),
]);

// Avec options de transaction
await prisma.$transaction(
  [
    prisma.user.deleteMany({ where: { role: "TEMP" } }),
    prisma.user.createMany({ data: newUsers }),
  ],
  {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    maxWait: 5000,
    timeout: 10000,
  }
);
```

### 6.2 Transactions Interactives

```typescript
// Transaction interactive (opérations dépendantes)
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: "alice@prisma.io", name: "Alice" },
  });

  const post = await tx.post.create({
    data: {
      title: "Hello World",
      authorId: user.id,
    },
  });

  return { user, post };
});

// Gestion d'erreurs et rollback
try {
  await prisma.$transaction(async (tx) => {
    await tx.user.create({ data: userData });
    await tx.post.create({ data: postData });

    // Si une erreur survient ici, tout est rollback
    if (someCondition) {
      throw new Error("Rollback transaction");
    }
  });
} catch (error) {
  console.log("Transaction rolled back:", error);
}
```

### 6.3 Retry Pattern pour Conflits

```typescript
async function retryTransaction<T>(
  operation: () => Promise<T>,
  maxRetries = 5
): Promise<T> {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      if (error.code === "P2034" && retries < maxRetries - 1) {
        retries++;
        await new Promise((resolve) => setTimeout(resolve, 100 * retries));
        continue;
      }
      throw error;
    }
  }
}

// Utilisation
const result = await retryTransaction(() =>
  prisma.$transaction([
    prisma.user.deleteMany({ where: { status: "inactive" } }),
    prisma.user.createMany({ data: newUsers }),
  ])
);
```

## 7. Implications pour le CLI

### 7.1 Génération Automatique de Modèles

**Pour un modèle User :**

```prisma
// Génération automatique basée sur les champs
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations générées automatiquement
  posts    Post[]
  profile  Profile?
}

enum Role {
  USER
  ADMIN
}
```

### 7.2 Templates CRUD Automatiques

```typescript
// Génération automatique des opérations CRUD
export class UserService {
  async create(data: CreateUserInput) {
    return prisma.user.create({
      data,
      include: { profile: true, posts: true },
    });
  }

  async findMany(params: FindManyUserParams) {
    return prisma.user.findMany({
      where: params.where,
      include: params.include,
      orderBy: params.orderBy,
      take: params.take,
      skip: params.skip,
    });
  }

  async update(id: number, data: UpdateUserInput) {
    return prisma.user.update({
      where: { id },
      data,
      include: { profile: true, posts: true },
    });
  }

  async delete(id: number) {
    return prisma.user.delete({
      where: { id },
    });
  }
}
```

### 7.3 Détection de Patterns

Le CLI devra détecter :

- **Types de champs** → Validation Zod appropriée
- **Relations** → Génération des includes/selects
- **Contraintes uniques** → Validation d'unicité
- **Énumérations** → Types TypeScript et validation
- **Champs optionnels** → Gestion des valeurs nulles
- **Timestamps** → Gestion automatique des dates

### 7.4 Génération de Types TypeScript

```typescript
// Types générés automatiquement
export type User = {
  id: number;
  email: string;
  name: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserInput = Omit<User, "id" | "createdAt" | "updatedAt">;
export type UpdateUserInput = Partial<CreateUserInput>;

export type UserWithRelations = User & {
  posts: Post[];
  profile: Profile | null;
};
```

## 8. Patterns d'Extensions Prisma Client

### 8.1 Extensions de Requête

```typescript
// Extension pour logging automatique
const prisma = new PrismaClient().$extends({
  query: {
    $allOperations({ operation, model, args, query }) {
      const start = performance.now();
      const result = await query(args);
      const end = performance.now();

      console.log(`${model}.${operation} took ${end - start}ms`);
      return result;
    },
  },
});

// Extension pour filtrage automatique
const prisma = new PrismaClient().$extends({
  query: {
    user: {
      async findMany({ args, query }) {
        // Ajouter automatiquement un filtre pour les utilisateurs actifs
        args.where = { ...args.where, active: true };
        return query(args);
      },
    },
  },
});

// Extension pour soft delete
const prisma = new PrismaClient().$extends({
  query: {
    $allModels: {
      async delete({ args, query, model }) {
        // Convertir delete en update avec deletedAt
        return prisma[model].update({
          ...args,
          data: { deletedAt: new Date() },
        });
      },
      async findMany({ args, query }) {
        // Exclure automatiquement les enregistrements supprimés
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
    },
  },
});
```

### 8.2 Extensions de Modèle

```typescript
// Ajouter des méthodes personnalisées aux modèles
const prisma = new PrismaClient().$extends({
  model: {
    user: {
      async findByEmail(email: string) {
        return prisma.user.findUnique({
          where: { email },
          include: { posts: true, profile: true },
        });
      },

      async createWithProfile(userData: CreateUserData) {
        return prisma.user.create({
          data: {
            ...userData,
            profile: {
              create: { bio: userData.bio || "" },
            },
          },
          include: { profile: true },
        });
      },
    },

    post: {
      async findPublished() {
        return prisma.post.findMany({
          where: { published: true },
          include: { author: true },
          orderBy: { createdAt: "desc" },
        });
      },

      async incrementViews(id: number) {
        return prisma.post.update({
          where: { id },
          data: { views: { increment: 1 } },
        });
      },
    },
  },
});

// Utilisation des extensions
const user = await prisma.user.findByEmail("alice@prisma.io");
const newUser = await prisma.user.createWithProfile({
  email: "bob@prisma.io",
  name: "Bob",
  bio: "Developer",
});
```

### 8.3 Extensions de Client

```typescript
// Ajouter des méthodes au niveau client
const prisma = new PrismaClient().$extends({
  client: {
    $log: (message: string) => console.log(`[PRISMA] ${message}`),

    async $totalQueries() {
      const metrics = await prisma.$metrics.json();
      return metrics.counters[0]?.value || 0;
    },

    async $healthCheck() {
      try {
        await prisma.$queryRaw`SELECT 1`;
        return { status: "healthy", timestamp: new Date() };
      } catch (error) {
        return {
          status: "unhealthy",
          error: error.message,
          timestamp: new Date(),
        };
      }
    },
  },
});

// Utilisation
prisma.$log("Starting application");
const health = await prisma.$healthCheck();
const totalQueries = await prisma.$totalQueries();
```

## 9. Patterns de Requêtes Raw et Optimisation

### 9.1 Requêtes SQL Raw

```typescript
// Requêtes typées avec Prisma.sql
import { Prisma } from "@prisma/client";

const users = await prisma.$queryRaw(
  Prisma.sql`
    SELECT u.*, COUNT(p.id) as post_count
    FROM "User" u
    LEFT JOIN "Post" p ON u.id = p."authorId"
    WHERE u.role = ${role}
    GROUP BY u.id
    ORDER BY post_count DESC
  `
);

// Requêtes préparées
const getUsersByRole = Prisma.sql`
  SELECT * FROM "User" WHERE role = $1
`;
const users = await prisma.$queryRawTyped(getUsersByRole("ADMIN"));

// Exécution de commandes
const result = await prisma.$executeRaw(
  Prisma.sql`
    UPDATE "Post"
    SET views = views + 1
    WHERE id = ${postId}
  `
);
```

### 9.2 Requêtes MongoDB Raw

```typescript
// Requêtes MongoDB natives
const users = await prisma.user.findRaw({
  filter: { age: { $gt: 25 } },
  options: { projection: { name: 1, email: 1 } },
});

// Agrégations MongoDB
const stats = await prisma.user.aggregateRaw({
  pipeline: [
    { $match: { status: "active" } },
    { $group: { _id: "$role", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ],
});

// Commandes MongoDB
const result = await prisma.$runCommandRaw({
  aggregate: "User",
  pipeline: [
    { $match: { name: "Alice" } },
    { $project: { email: true, _id: false } },
  ],
});
```

### 9.3 Optimisation des Performances

```typescript
// Stratégies de chargement des relations
const users = await prisma.user.findMany({
  relationLoadStrategy: "join", // ou 'query'
  include: { posts: true },
});

// Pagination efficace avec curseur
async function getPaginatedPosts(cursor?: number, take = 10) {
  return prisma.post.findMany({
    take,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { id: "asc" },
  });
}

// Requêtes en lot pour éviter N+1
const userIds = [1, 2, 3, 4, 5];
const users = await prisma.user.findMany({
  where: { id: { in: userIds } },
  include: { posts: true },
});
```

## 10. Patterns de Gestion d'Erreurs

### 10.1 Gestion des Erreurs Prisma

```typescript
import { Prisma } from "@prisma/client";

async function createUser(data: CreateUserData) {
  try {
    return await prisma.user.create({ data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002":
          throw new Error("Email already exists");
        case "P2025":
          throw new Error("Record not found");
        case "P2003":
          throw new Error("Foreign key constraint failed");
        default:
          throw new Error(`Database error: ${error.message}`);
      }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new Error("Invalid data provided");
    }

    throw error;
  }
}

// Wrapper générique pour gestion d'erreurs
function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const errorMap = {
      P2002: "Unique constraint violation",
      P2025: "Record not found",
      P2003: "Foreign key constraint failed",
      P2034: "Transaction conflict, please retry",
    };

    throw new Error(errorMap[error.code] || `Database error: ${error.code}`);
  }

  throw error;
}
```

### 10.2 Validation et Transformation

```typescript
// Middleware de validation avec Zod
import { z } from "zod";

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
});

async function createUserWithValidation(input: unknown) {
  const data = CreateUserSchema.parse(input);

  return prisma.user.create({
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
}

// Transformation des données
const prisma = new PrismaClient().$extends({
  result: {
    user: {
      fullName: {
        needs: { firstName: true, lastName: true },
        compute(user) {
          return `${user.firstName} ${user.lastName}`;
        },
      },
      isAdmin: {
        needs: { role: true },
        compute(user) {
          return user.role === "ADMIN";
        },
      },
    },
  },
});
```

## 11. Patterns de Configuration et Déploiement

### 11.1 Configuration Multi-Environnement

```typescript
// Configuration par environnement
const getDatabaseUrl = () => {
  switch (process.env.NODE_ENV) {
    case "production":
      return process.env.DATABASE_URL;
    case "test":
      return process.env.TEST_DATABASE_URL;
    default:
      return process.env.DEV_DATABASE_URL;
  }
};

const prisma = new PrismaClient({
  datasources: {
    db: { url: getDatabaseUrl() },
  },
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn"]
      : ["error"],
});

// Configuration avec pool de connexions
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  transactionOptions: {
    maxWait: 5000,
    timeout: 10000,
    isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
  },
});
```

### 11.2 Patterns de Déploiement

```typescript
// Singleton pattern pour Prisma Client
declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

### 11.3 Monitoring et Observabilité

```typescript
// Logging avancé
const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "error" },
    { emit: "event", level: "info" },
    { emit: "event", level: "warn" },
  ],
});

prisma.$on("query", (e) => {
  console.log("Query:", e.query);
  console.log("Params:", e.params);
  console.log("Duration:", e.duration + "ms");
});

prisma.$on("error", (e) => {
  console.error("Prisma Error:", e);
});

// Métriques personnalisées
const prisma = new PrismaClient().$extends({
  query: {
    $allOperations({ operation, model, args, query }) {
      const start = Date.now();

      return query(args).finally(() => {
        const duration = Date.now() - start;

        // Envoyer métriques à votre système de monitoring
        metrics.histogram("prisma_query_duration", duration, {
          model,
          operation,
        });
      });
    },
  },
});
```

## 12. Implications Avancées pour le CLI

### 12.1 Génération d'Extensions Automatiques

```typescript
// Template d'extension généré automatiquement
export const createPrismaExtensions = () => {
  return Prisma.defineExtension((client) =>
    client.$extends({
      query: {
        $allModels: {
          async create({ args, query, model }) {
            // Validation automatique avec Zod
            const schema = getValidationSchema(model, "create");
            args.data = schema.parse(args.data);

            return query(args);
          },

          async update({ args, query, model }) {
            // Validation automatique avec Zod
            const schema = getValidationSchema(model, "update");
            args.data = schema.parse(args.data);

            return query(args);
          },
        },
      },

      model: {
        // Génération automatique de méthodes par modèle
        $allModels: {
          async findManyWithPagination<T>(this: T, params: PaginationParams) {
            const { page = 1, limit = 10, ...where } = params;
            const skip = (page - 1) * limit;

            const [data, total] = await Promise.all([
              (this as any).findMany({
                where,
                skip,
                take: limit,
              }),
              (this as any).count({ where }),
            ]);

            return {
              data,
              pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
              },
            };
          },
        },
      },
    })
  );
};
```

### 12.2 Génération de Services Automatiques

```typescript
// Template de service généré pour chaque modèle
export class BaseService<T extends Record<string, any>> {
  constructor(
    private model: any,
    private schema: {
      create: z.ZodSchema;
      update: z.ZodSchema;
    }
  ) {}

  async create(data: z.infer<typeof this.schema.create>) {
    const validatedData = this.schema.create.parse(data);
    return this.model.create({ data: validatedData });
  }

  async findMany(params: FindManyParams<T>) {
    return this.model.findMany(params);
  }

  async findById(id: string | number) {
    const result = await this.model.findUnique({ where: { id } });
    if (!result) {
      throw new Error(`${this.model.name} not found`);
    }
    return result;
  }

  async update(id: string | number, data: z.infer<typeof this.schema.update>) {
    const validatedData = this.schema.update.parse(data);
    return this.model.update({
      where: { id },
      data: validatedData,
    });
  }

  async delete(id: string | number) {
    return this.model.delete({ where: { id } });
  }
}

// Génération automatique pour chaque modèle
export const userService = new BaseService(prisma.user, {
  create: CreateUserSchema,
  update: UpdateUserSchema,
});

export const postService = new BaseService(prisma.post, {
  create: CreatePostSchema,
  update: UpdatePostSchema,
});
```

### 12.3 Détection de Patterns Complexes

Le CLI devra identifier et générer automatiquement :

- **Soft Delete** → Extension de requête pour deletedAt
- **Audit Trail** → Hooks pour createdBy/updatedBy
- **Multi-tenancy** → Filtrage automatique par tenant
- **Caching** → Extensions avec Redis/Memory cache
- **Validation** → Intégration Zod automatique
- **Pagination** → Méthodes de pagination standardisées
- **Search** → Intégration full-text search
- **File Upload** → Gestion des URLs et métadonnées
- **Notifications** → Hooks pour événements CRUD

## Conclusion

Les patterns Prisma sont très structurés et offrent une base solide pour la génération automatique. Le CLI devra implémenter des templates qui couvrent la modélisation de données, les opérations CRUD, les transactions, et les requêtes complexes, tout en générant automatiquement les types TypeScript et les validations Zod correspondantes.

Les patterns avancés comme les extensions, les requêtes raw, la gestion d'erreurs et l'optimisation des performances nécessitent une compréhension approfondie pour générer du code optimisé et maintenable. Le CLI devra également détecter automatiquement les besoins spécifiques (soft delete, audit, multi-tenancy) pour générer les extensions appropriées.
