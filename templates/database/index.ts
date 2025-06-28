/**
 * Template de configuration Prisma avec schémas de base, migrations et types
 * Basé sur les patterns d'analyse et les meilleures pratiques
 */

import { DirectoryStructure, FileTemplate, ProjectConfig } from "../types";

export interface DatabaseConfig extends ProjectConfig {
  database: "postgresql" | "mysql" | "sqlite" | "mongodb";
  orm: "prisma";
  features: (
    | "migrations"
    | "seeding"
    | "relations"
    | "soft-delete"
    | "audit-trail"
    | "zod-validation"
    | "extensions"
    | "multi-schema"
  )[];
  models: {
    user: boolean;
    session: boolean;
    post: boolean;
    profile: boolean;
    custom: string[];
  };
  validation: {
    useZodPrismaTypes: boolean;
    generateInputTypes: boolean;
    generateModelTypes: boolean;
    generatePartialTypes: boolean;
    customValidators: boolean;
  };
  performance: {
    connectionPooling: boolean;
    queryOptimization: boolean;
    indexing: boolean;
    caching: boolean;
  };
  security: {
    rowLevelSecurity: boolean;
    dataEncryption: boolean;
    auditLogging: boolean;
  };
}

export const defaultDatabaseConfig: DatabaseConfig = {
  projectName: "my-app",
  database: "postgresql",
  orm: "prisma",
  features: [
    "migrations",
    "seeding",
    "relations",
    "zod-validation",
    "extensions",
  ],
  models: {
    user: true,
    session: true,
    post: true,
    profile: true,
    custom: [],
  },
  validation: {
    useZodPrismaTypes: true,
    generateInputTypes: true,
    generateModelTypes: true,
    generatePartialTypes: false,
    customValidators: true,
  },
  performance: {
    connectionPooling: true,
    queryOptimization: true,
    indexing: true,
    caching: false,
  },
  security: {
    rowLevelSecurity: false,
    dataEncryption: false,
    auditLogging: false,
  },
};

/**
 * Structure de répertoire pour le template de base de données
 */
export const databaseDirectoryStructure: DirectoryStructure = {
  "prisma/": {
    type: "directory",
    description: "Configuration Prisma et base de données",
    children: {
      "schema.prisma": {
        type: "file",
        description: "Schéma principal Prisma",
      },
      "migrations/": {
        type: "directory",
        description: "Migrations de base de données",
        children: {},
      },
      "seed.ts": {
        type: "file",
        description: "Script de seeding",
      },
      "extensions/": {
        type: "directory",
        description: "Extensions Prisma personnalisées",
        children: {
          "soft-delete.ts": { type: "file" },
          "audit-trail.ts": { type: "file" },
          "pagination.ts": { type: "file" },
          "index.ts": { type: "file" },
        },
      },
    },
  },
  "src/lib/": {
    type: "directory",
    description: "Utilitaires base de données",
    children: {
      "db.ts": {
        type: "file",
        description: "Client Prisma configuré",
      },
      "db-utils.ts": {
        type: "file",
        description: "Utilitaires base de données",
      },
    },
  },
  "shared/types/": {
    type: "directory",
    description: "Types générés",
    children: {
      "database.ts": {
        type: "file",
        description: "Types base de données",
      },
      "prisma.ts": {
        type: "file",
        description: "Types Prisma étendus",
      },
    },
  },
  "shared/validation/": {
    type: "directory",
    description: "Schémas Zod générés",
    children: {
      "database.ts": {
        type: "file",
        description: "Validation base de données",
      },
      "models/": {
        type: "directory",
        description: "Validation par modèle",
        children: {
          "user.ts": { type: "file" },
          "post.ts": { type: "file" },
          "index.ts": { type: "file" },
        },
      },
    },
  },
};

/**
 * Génère le template de base de données complet
 */
export function generateDatabaseTemplate(config: DatabaseConfig = defaultDatabaseConfig) {
  const structure = databaseDirectoryStructure;
  const files: FileTemplate[] = [];

  // Génération des fichiers selon la configuration
  files.push(...generatePrismaFiles(config));
  files.push(...generateDatabaseUtilities(config));
  files.push(...generateValidationFiles(config));
  files.push(...generateTypeFiles(config));
  files.push(...generateExtensionFiles(config));

  // Scripts package.json
  const packageScripts = generatePackageScripts(config);

  // Instructions d'installation
  const instructions = generateDatabaseInstructions(config);

  return {
    config,
    structure,
    files,
    packageScripts,
    instructions,
  };
}

/**
 * Génère les scripts package.json pour la base de données
 */
function generatePackageScripts(config: DatabaseConfig) {
  const scripts: Record<string, string> = {
    // Scripts Prisma de base
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:reset": "prisma migrate reset",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
  };

  // Scripts conditionnels selon les features
  if (config.features.includes("zod-validation")) {
    scripts["db:generate:zod"] = "prisma generate zod";
  }

  if (config.features.includes("seeding")) {
    scripts["db:seed:dev"] = "NODE_ENV=development npm run db:seed";
    scripts["db:seed:prod"] = "NODE_ENV=production npm run db:seed";
  }

  return scripts;
}

/**
 * Génère les instructions d'installation et de configuration
 */
function generateDatabaseInstructions(config: DatabaseConfig): string[] {
  const instructions: string[] = [
    "# Configuration Base de Données",
    "",
    "## Installation des dépendances",
    "```bash",
    "pnpm add prisma @prisma/client",
  ];

  if (config.validation.useZodPrismaTypes) {
    instructions.push("pnpm add -D zod-prisma-types");
  }

  instructions.push(
    "```",
    "",
    "## Configuration de l'environnement",
    "Créez un fichier `.env` avec :",
    "```env",
    `DATABASE_URL="${getDatabaseUrl(config.database)}"`,
    "```",
    "",
    "## Initialisation de la base de données",
    "```bash",
    "# Générer le client Prisma",
    "pnpm db:generate",
    "",
    "# Créer et appliquer la première migration",
    "pnpm db:migrate --name init",
    "",
    "# Seeder la base de données (optionnel)",
    "pnpm db:seed",
    "```",
  );

  return instructions;
}

/**
 * Retourne l'URL de base de données selon le type
 */
function getDatabaseUrl(database: string): string {
  switch (database) {
    case "postgresql":
      return "postgresql://username:password@localhost:5432/database";
    case "mysql":
      return "mysql://username:password@localhost:3306/database";
    case "sqlite":
      return "file:./dev.db";
    case "mongodb":
      return "mongodb://username:password@localhost:27017/database";
    default:
      return "postgresql://username:password@localhost:5432/database";
  }
}

// Import des générateurs spécialisés
import { generatePrismaFiles } from "./schemas";
import { generateDatabaseUtilities } from "./utilities";
import { generateValidationFiles } from "./zod-integration";
import { generateTypeFiles } from "./types";
import { generateExtensionFiles } from "./extensions";

// Export des fonctions pour utilisation externe
export { generateCompleteDatabase } from "./generator";
export { examples } from "./example";
