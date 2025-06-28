/**
 * Générateur principal du template de base de données
 * Orchestre la génération de tous les fichiers Prisma
 */

import { FileTemplate, ProjectConfig } from "../types";
import { DatabaseConfig, generateDatabaseTemplate } from "./index";

/**
 * Interface pour les options de génération
 */
export interface DatabaseGenerationOptions {
  includeExamples?: boolean;
  includeMigrations?: boolean;
  includeTests?: boolean;
  customModels?: string[];
}

/**
 * Génère le template complet de base de données
 */
export function generateCompleteDatabase(
  config: DatabaseConfig,
  options: DatabaseGenerationOptions = {}
): {
  files: FileTemplate[];
  packageScripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  instructions: string[];
  postInstallSteps: string[];
} {
  // Générer le template de base
  const template = generateDatabaseTemplate(config);

  // Ajouter des fichiers supplémentaires selon les options
  const additionalFiles: FileTemplate[] = [];

  if (options.includeExamples) {
    additionalFiles.push(...generateExampleFiles(config));
  }

  if (options.includeMigrations) {
    additionalFiles.push(...generateMigrationFiles(config));
  }

  if (options.includeTests) {
    additionalFiles.push(...generateTestFiles(config));
  }

  // Ajouter des modèles personnalisés
  if (options.customModels && options.customModels.length > 0) {
    config.models.custom = options.customModels;
  }

  // Dépendances
  const dependencies = generateDependencies(config);
  const devDependencies = generateDevDependencies(config);

  // Étapes post-installation
  const postInstallSteps = generatePostInstallSteps(config);

  return {
    files: [...template.files, ...additionalFiles],
    packageScripts: template.packageScripts,
    dependencies,
    devDependencies,
    instructions: template.instructions,
    postInstallSteps,
  };
}

/**
 * Génère les dépendances selon la configuration
 */
function generateDependencies(config: DatabaseConfig): Record<string, string> {
  const deps: Record<string, string> = {
    "prisma": "^6.0.0",
    "@prisma/client": "^6.0.0",
  };

  if (config.validation.useZodPrismaTypes) {
    deps["zod"] = "^3.24.0";
  }

  // Dépendances spécifiques à la base de données
  switch (config.database) {
    case "postgresql":
      deps["pg"] = "^8.11.0";
      break;
    case "mysql":
      deps["mysql2"] = "^3.6.0";
      break;
    case "sqlite":
      // SQLite est inclus avec Prisma
      break;
    case "mongodb":
      deps["mongodb"] = "^6.0.0";
      break;
  }

  return deps;
}

/**
 * Génère les dépendances de développement
 */
function generateDevDependencies(config: DatabaseConfig): Record<string, string> {
  const devDeps: Record<string, string> = {
    "tsx": "^4.0.0",
  };

  if (config.validation.useZodPrismaTypes) {
    devDeps["zod-prisma-types"] = "^3.1.0";
  }

  // Types TypeScript pour la base de données
  switch (config.database) {
    case "postgresql":
      devDeps["@types/pg"] = "^8.10.0";
      break;
    case "mysql":
      devDeps["@types/mysql2"] = "^3.0.0";
      break;
  }

  return devDeps;
}

/**
 * Génère les fichiers d'exemple
 */
function generateExampleFiles(config: DatabaseConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Exemples d'utilisation
  files.push({
    path: "examples/database-usage.ts",
    content: `/**
 * Exemples d'utilisation de la base de données
 */

import { db } from '../src/lib/db';
import { userService, postService } from '../src/lib/db-utils';

async function examples() {
  console.log('🚀 Exemples d\'utilisation de la base de données');

  ${config.models.user ? `
  // Exemple 1: Créer un utilisateur
  const newUser = await userService.create({
    email: 'exemple@test.com',
    name: 'Utilisateur Test',
    role: 'USER',
  });
  console.log('👤 Utilisateur créé:', newUser);

  // Exemple 2: Rechercher un utilisateur par email
  const user = await userService.findByEmail('exemple@test.com');
  console.log('🔍 Utilisateur trouvé:', user);` : ''}

  ${config.models.post ? `
  // Exemple 3: Créer un post
  if (newUser) {
    const newPost = await postService.create({
      title: 'Mon premier article',
      content: 'Contenu de l\'article...',
      published: true,
      authorId: newUser.id,
    });
    console.log('📝 Post créé:', newPost);
  }

  // Exemple 4: Rechercher les posts publiés
  const publishedPosts = await postService.findPublished();
  console.log('📚 Posts publiés:', publishedPosts.length);` : ''}

  // Exemple 5: Pagination
  const paginatedUsers = await db.user.findManyPaginated({
    page: 1,
    pageSize: 10,
    orderBy: { createdAt: 'desc' },
  });
  console.log('📄 Utilisateurs paginés:', paginatedUsers);

  ${config.features.includes('soft-delete') ? `
  // Exemple 6: Soft delete
  if (newUser) {
    await db.user.softDelete({ id: newUser.id });
    console.log('🗑️ Utilisateur supprimé (soft delete)');

    // Restaurer
    await db.user.restore({ id: newUser.id });
    console.log('♻️ Utilisateur restauré');
  }` : ''}

  // Exemple 7: Transaction
  await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: 'transaction@test.com',
        name: 'Transaction User',
      },
    });

    ${config.models.profile ? `
    await tx.profile.create({
      data: {
        bio: 'Bio créée dans une transaction',
        userId: user.id,
      },
    });` : ''}

    console.log('💳 Transaction réussie');
  });
}

// Exécuter les exemples
examples()
  .catch(console.error)
  .finally(() => db.$disconnect());`,
  });

  return files;
}

/**
 * Génère les fichiers de migration
 */
function generateMigrationFiles(config: DatabaseConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Script de migration personnalisé
  files.push({
    path: "scripts/migrate.ts",
    content: `#!/usr/bin/env tsx

/**
 * Script de migration personnalisé
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

async function migrate() {
  console.log('🔄 Début de la migration...');

  try {
    // Vérifier si la base de données existe
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL non définie');
    }

    // Générer le client Prisma
    console.log('📦 Génération du client Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Appliquer les migrations
    console.log('🚀 Application des migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    ${config.features.includes('seeding') ? `
    // Seeder si en développement
    if (process.env.NODE_ENV === 'development') {
      console.log('🌱 Seeding de la base de données...');
      execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
    }` : ''}

    console.log('✅ Migration terminée avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

migrate();`,
  });

  // Script de reset
  files.push({
    path: "scripts/reset-db.ts",
    content: `#!/usr/bin/env tsx

/**
 * Script de reset de la base de données
 */

import { execSync } from 'child_process';
import readline from 'readline';

async function resetDatabase() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise<string>((resolve) => {
    rl.question(
      '⚠️  Êtes-vous sûr de vouloir reset la base de données? (oui/non): ',
      resolve
    );
  });

  rl.close();

  if (answer.toLowerCase() !== 'oui') {
    console.log('❌ Reset annulé');
    return;
  }

  try {
    console.log('🔄 Reset de la base de données...');
    execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
    
    console.log('✅ Base de données resetée avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors du reset:', error);
    process.exit(1);
  }
}

resetDatabase();`,
  });

  return files;
}

/**
 * Génère les fichiers de test
 */
function generateTestFiles(config: DatabaseConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Configuration de test
  files.push({
    path: "tests/setup.ts",
    content: `/**
 * Configuration des tests pour la base de données
 */

import { PrismaClient } from '@prisma/client';

// Client Prisma pour les tests
export const testDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'file:./test.db',
    },
  },
});

// Setup avant tous les tests
export async function setupTests() {
  // Nettoyer la base de données
  await cleanDatabase();
}

// Cleanup après tous les tests
export async function teardownTests() {
  await testDb.$disconnect();
}

// Nettoyer la base de données
export async function cleanDatabase() {
  const tablenames = await testDb.$queryRaw<Array<{ tablename: string }>>\`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  \`;

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await testDb.$executeRawUnsafe(\`TRUNCATE TABLE "\${tablename}" CASCADE;\`);
      } catch (error) {
        console.log({ error });
      }
    }
  }
}`,
  });

  // Tests d'exemple
  if (config.models.user) {
    files.push({
      path: "tests/user.test.ts",
      content: `/**
 * Tests pour le modèle User
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { testDb, setupTests, teardownTests, cleanDatabase } from './setup';
import { userService } from '../src/lib/db-utils';

describe('User Model', () => {
  beforeAll(async () => {
    await setupTests();
  });

  afterAll(async () => {
    await teardownTests();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should create a user', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER' as const,
    };

    const user = await userService.create(userData);

    expect(user).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.name).toBe(userData.name);
    expect(user.role).toBe(userData.role);
  });

  it('should find user by email', async () => {
    const userData = {
      email: 'find@example.com',
      name: 'Find User',
    };

    await userService.create(userData);
    const foundUser = await userService.findByEmail(userData.email);

    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe(userData.email);
  });

  it('should update user', async () => {
    const user = await userService.create({
      email: 'update@example.com',
      name: 'Original Name',
    });

    const updatedUser = await userService.update(user.id, {
      name: 'Updated Name',
    });

    expect(updatedUser.name).toBe('Updated Name');
  });

  ${config.features.includes('soft-delete') ? `
  it('should soft delete user', async () => {
    const user = await userService.create({
      email: 'delete@example.com',
      name: 'Delete User',
    });

    await testDb.user.softDelete({ id: user.id });

    const deletedUser = await testDb.user.findUnique({
      where: { id: user.id },
    });

    expect(deletedUser).toBeNull();

    const deletedUserWithDeleted = await testDb.user.findUnique({
      where: { id: user.id },
      includeDeleted: true,
    });

    expect(deletedUserWithDeleted).toBeDefined();
    expect(deletedUserWithDeleted?.deletedAt).toBeDefined();
  });` : ''}
});`,
    });
  }

  return files;
}

/**
 * Génère les étapes post-installation
 */
function generatePostInstallSteps(config: DatabaseConfig): string[] {
  const steps: string[] = [
    "1. Configurer la variable d'environnement DATABASE_URL dans .env",
    "2. Exécuter 'pnpm db:generate' pour générer le client Prisma",
    "3. Exécuter 'pnpm db:migrate --name init' pour créer la première migration",
  ];

  if (config.features.includes('seeding')) {
    steps.push("4. Exécuter 'pnpm db:seed' pour seeder la base de données");
  }

  if (config.validation.useZodPrismaTypes) {
    steps.push("5. Les schémas Zod seront générés automatiquement avec le client Prisma");
  }

  steps.push("6. Démarrer le serveur de développement");

  return steps;
}
