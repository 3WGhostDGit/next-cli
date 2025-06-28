# Template de Base de Données Prisma

Template complet pour la configuration Prisma avec schémas de base, migrations, types TypeScript et validation Zod.

## 🚀 Fonctionnalités

### Bases de données supportées
- **PostgreSQL** - Recommandé pour la production
- **MySQL** - Compatible avec la plupart des hébergeurs
- **SQLite** - Parfait pour le prototypage et les tests
- **MongoDB** - Pour les applications nécessitant une flexibilité de schéma

### Fonctionnalités avancées
- ✅ **Migrations automatiques** - Évolution sécurisée du schéma
- ✅ **Seeding** - Données de test et d'initialisation
- ✅ **Relations complexes** - One-to-one, one-to-many, many-to-many
- ✅ **Soft Delete** - Suppression logique avec restauration
- ✅ **Audit Trail** - Traçabilité des modifications
- ✅ **Validation Zod** - Types et validation automatiques
- ✅ **Extensions Prisma** - Fonctionnalités personnalisées
- ✅ **Pagination** - Pagination cursor et offset
- ✅ **Optimisation** - Connection pooling, indexing, caching

## 📁 Structure générée

```
project/
├── prisma/
│   ├── schema.prisma          # Schéma principal
│   ├── seed.ts               # Script de seeding
│   ├── migrations/           # Migrations de base de données
│   └── extensions/           # Extensions Prisma
│       ├── index.ts          # Extension principale
│       ├── soft-delete.ts    # Soft delete
│       ├── audit-trail.ts    # Audit trail
│       └── pagination.ts     # Pagination
├── src/lib/
│   ├── db.ts                 # Client Prisma configuré
│   └── db-utils.ts           # Services et utilitaires
├── shared/
│   ├── types/
│   │   ├── database.ts       # Types de base de données
│   │   └── prisma.ts         # Types Prisma étendus
│   └── validation/
│       ├── database.ts       # Validation de base
│       └── models/           # Validation par modèle
│           ├── user.ts
│           ├── post.ts
│           └── index.ts
├── examples/                 # Exemples d'utilisation
├── scripts/                  # Scripts de migration
└── tests/                    # Tests de base de données
```

## 🛠️ Configuration

### Configuration de base

```typescript
import { DatabaseConfig } from './templates/database';

const config: DatabaseConfig = {
  projectName: "my-app",
  database: "postgresql",
  orm: "prisma",
  features: [
    "migrations",
    "seeding", 
    "relations",
    "zod-validation"
  ],
  models: {
    user: true,
    session: true,
    post: true,
    profile: true,
    custom: ["Category", "Tag"]
  },
  validation: {
    useZodPrismaTypes: true,
    generateInputTypes: true,
    generateModelTypes: true,
    generatePartialTypes: false,
    customValidators: true
  }
};
```

### Fonctionnalités disponibles

| Fonctionnalité | Description |
|----------------|-------------|
| `migrations` | Migrations automatiques de schéma |
| `seeding` | Scripts de données initiales |
| `relations` | Relations entre modèles |
| `soft-delete` | Suppression logique |
| `audit-trail` | Traçabilité des modifications |
| `zod-validation` | Validation avec Zod |
| `extensions` | Extensions Prisma personnalisées |
| `multi-schema` | Support multi-schémas (PostgreSQL) |

## 📊 Modèles de base

### User
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  role      Role     @default(USER)
  status    Status   @default(ACTIVE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  sessions  Session[]
  posts     Post[]
  profile   Profile?
}
```

### Post
```prisma
model Post {
  id        String   @id @default(cuid())
  title     String   @db.VarChar(255)
  content   String?
  image     String?
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  authorId  String
  
  author User @relation(fields: [authorId], references: [id])
}
```

## 🔧 Utilisation

### Installation

```bash
# Générer le template
pnpm add prisma @prisma/client zod zod-prisma-types

# Configurer l'environnement
echo "DATABASE_URL=postgresql://user:pass@localhost:5432/db" > .env

# Générer le client et migrer
pnpm db:generate
pnpm db:migrate --name init
pnpm db:seed
```

### Utilisation du client

```typescript
import { db } from '@/lib/db';
import { userService } from '@/lib/db-utils';

// Utilisation directe
const users = await db.user.findMany();

// Avec pagination
const paginatedUsers = await db.user.findManyPaginated({
  page: 1,
  pageSize: 10
});

// Avec service
const user = await userService.findByEmail('user@example.com');

// Avec soft delete
await db.user.softDelete({ id: userId });
await db.user.restore({ id: userId });
```

### Validation Zod

```typescript
import { createUserSchema, updateUserSchema } from '@/shared/validation';

// Validation à la création
const userData = createUserSchema.parse({
  email: 'user@example.com',
  name: 'John Doe'
});

// Validation à la mise à jour
const updateData = updateUserSchema.parse({
  name: 'Jane Doe'
});
```

## 🎯 Exemples de configuration

### PostgreSQL Production
```typescript
const productionConfig: DatabaseConfig = {
  database: "postgresql",
  features: [
    "migrations", "seeding", "relations", 
    "soft-delete", "audit-trail", "zod-validation", 
    "extensions"
  ],
  performance: {
    connectionPooling: true,
    queryOptimization: true,
    indexing: true,
    caching: true
  },
  security: {
    rowLevelSecurity: true,
    auditLogging: true
  }
};
```

### SQLite Développement
```typescript
const devConfig: DatabaseConfig = {
  database: "sqlite",
  features: ["migrations", "seeding", "zod-validation"],
  models: {
    user: true,
    post: true,
    profile: false,
    session: false,
    custom: []
  }
};
```

## 📝 Scripts disponibles

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push", 
    "db:migrate": "prisma migrate dev",
    "db:migrate:reset": "prisma migrate reset",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

## 🧪 Tests

Le template inclut une configuration de tests complète :

```typescript
import { testDb, setupTests, cleanDatabase } from './tests/setup';

describe('User Model', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should create a user', async () => {
    const user = await testDb.user.create({
      data: { email: 'test@example.com', name: 'Test' }
    });
    expect(user).toBeDefined();
  });
});
```

## 🔒 Sécurité

### Row Level Security (PostgreSQL)
```sql
-- Généré automatiquement si activé
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_policy ON users FOR ALL TO authenticated_user USING (id = current_user_id());
```

### Audit Trail
```typescript
// Utilisation avec audit trail
await db.user.withUser('admin-id', async () => {
  await db.user.create({
    data: { email: 'new@example.com' }
  });
  // createdBy et updatedBy seront automatiquement définis
});
```

## 📚 Documentation

- [Guide Prisma](https://www.prisma.io/docs)
- [Zod Validation](https://zod.dev)
- [Extensions Prisma](https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions)

## 🤝 Contribution

Ce template est basé sur les meilleures pratiques analysées et peut être étendu selon les besoins du projet.
