/**
 * Générateur principal du template de base - Structure de projet
 *
 * Ce générateur combine tous les éléments pour créer une structure de projet Next.js complète
 * Basé sur les 17 analyses de patterns terminées et les meilleures pratiques
 */

import { DirectoryStructure, FileTemplate } from "../types";
import {
  generateComponentsJson,
  generateEnvExample,
  generateGitignore,
  generateNextConfig,
  generatePostCSSConfig,
  generateReadme,
  generateTsConfig,
} from "./config-files";
import {
  generateErrorPage,
  generateGlobalStyles,
  generateHomePage,
  generateLoadingPage,
  generateNotFoundPage,
  generateRootLayout,
} from "./core-files";
import {
  BaseProjectConfig,
  defaultBaseProjectConfig,
  generateDirectoryStructure,
  generatePackageJson,
} from "./index";
import {
  generateBaseTypes,
  generateConstants,
  generateDbClient,
  generateUseDebounce,
  generateUseLocalStorage,
  generateUtils,
} from "./utility-files";

export interface GeneratedProject {
  config: BaseProjectConfig;
  structure: DirectoryStructure;
  files: FileTemplate[];
  instructions: string[];
}

/**
 * Génère un projet Next.js complet avec la structure de base
 */
export function generateBaseProject(
  customConfig: Partial<BaseProjectConfig> = {}
): GeneratedProject {
  // Fusionner la configuration par défaut avec la configuration personnalisée
  const config: BaseProjectConfig = {
    ...defaultBaseProjectConfig,
    ...customConfig,
  };

  // Générer la structure de répertoires
  const structure = generateDirectoryStructure(config);

  // Générer tous les fichiers
  const files: FileTemplate[] = [
    // Configuration
    generatePackageJson(config),
    generateTsConfig(config),
    generateNextConfig(),
    generatePostCSSConfig(),
    generateComponentsJson(),
    generateEnvExample(),
    generateGitignore(),
    generateReadme(config),

    // Fichiers core de l'application
    generateRootLayout(config),
    generateHomePage(config),
    generateGlobalStyles(),
    generateLoadingPage(),
    generateErrorPage(),
    generateNotFoundPage(),

    // Utilitaires et hooks
    generateUtils(config),
    generateConstants(config),
    generateDbClient(config),
    generateUseLocalStorage(config),
    generateUseDebounce(config),
    generateBaseTypes(),

    // Fichiers additionnels
    ...generateAdditionalFiles(),
  ];

  // Instructions d'installation et de configuration
  const instructions = generateInstructions(config);

  return {
    config,
    structure,
    files,
    instructions,
  };
}

/**
 * Génère des fichiers additionnels selon la configuration
 */
function generateAdditionalFiles(): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Prisma schema de base
  files.push({
    path: "prisma/schema.prisma",
    content: `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sessions Session[]

  @@map("users")
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}`,
  });

  // Seed file
  files.push({
    path: "prisma/seed.ts",
    content: `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Créer un utilisateur de test
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Utilisateur Test',
    },
  });

  console.log('✅ Database seeded successfully');
  console.log('📧 Test user:', testUser.email);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });`,
  });

  // Middleware de base
  files.push({
    path: "middleware.ts",
    content: `import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Ajouter des headers de sécurité de base
  const response = NextResponse.next();

  // Headers de sécurité
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};`,
  });

  // Configuration ESLint
  files.push({
    path: ".eslintrc.json",
    content: JSON.stringify(
      {
        extends: ["next/core-web-vitals", "next/typescript"],
        rules: {
          "@typescript-eslint/no-unused-vars": "error",
          "@typescript-eslint/no-explicit-any": "warn",
          "prefer-const": "error",
          "no-var": "error",
        },
      },
      null,
      2
    ),
  });

  // Configuration Prettier
  files.push({
    path: ".prettierrc",
    content: JSON.stringify(
      {
        semi: true,
        trailingComma: "es5",
        singleQuote: true,
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
      },
      null,
      2
    ),
  });

  return files;
}

/**
 * Génère les instructions d'installation et de configuration
 */
function generateInstructions(config: BaseProjectConfig): string[] {
  const packageManager = config.packageManager;

  return [
    "🚀 Instructions d'installation et de configuration",
    "",
    "1. Installer les dépendances:",
    `   ${packageManager} install`,
    "",
    "2. Configurer les variables d'environnement:",
    "   cp .env.example .env",
    "   # Éditer le fichier .env avec vos valeurs",
    "",
    "3. Configurer la base de données:",
    `   ${packageManager} run db:push`,
    `   ${packageManager} run db:seed`,
    "",
    "4. Installer les composants shadcn/ui de base:",
    "   npx shadcn@latest add button",
    "   npx shadcn@latest add input",
    "   npx shadcn@latest add form",
    "   npx shadcn@latest add card",
    "",
    "5. Lancer le serveur de développement:",
    `   ${packageManager} run dev`,
    "",
    "6. Ouvrir http://localhost:3000 dans votre navigateur",
    "",
    "📁 Structure du projet générée:",
    `- app/: Routes et layouts (App Router)`,
    `- ${config.useSrcDirectory ? "src/" : ""}: Code source`,
    `- shared/: Types et validation partagés`,
    `- prisma/: Configuration base de données`,
    `- postcss.config.ts: Configuration Tailwind CSS v4`,
    `- components.json: Configuration shadcn/ui`,
    "",
    "🔧 Prochaines étapes recommandées:",
    "- Configurer l'authentification avec Better Auth",
    "- Ajouter des composants UI supplémentaires",
    "- Implémenter les Server Actions",
    "- Configurer les tests",
    "- Déployer sur Vercel ou votre plateforme préférée",
    "",
    "⚡ Nouvelles fonctionnalités Tailwind CSS v4:",
    "- Configuration CSS-first avec @theme",
    "- Performance améliorée avec le nouveau moteur",
    "- Syntaxe simplifiée pour les utilitaires",
    "- Support natif des CSS variables",
    "",
    "📚 Documentation:",
    "- Next.js: https://nextjs.org/docs",
    "- Tailwind CSS v4: https://tailwindcss.com/docs/upgrade-guide",
    "- shadcn/ui: https://ui.shadcn.com",
    "- Prisma: https://www.prisma.io/docs",
    "- Better Auth: https://better-auth.com",
  ];
}

/**
 * Valide la configuration du projet
 */
export function validateProjectConfig(
  config: Partial<BaseProjectConfig>
): string[] {
  const errors: string[] = [];

  if (config.projectName && !/^[a-z0-9-]+$/.test(config.projectName)) {
    errors.push(
      "Le nom du projet doit contenir uniquement des lettres minuscules, des chiffres et des tirets"
    );
  }

  if (
    config.packageManager &&
    !["npm", "yarn", "pnpm", "bun"].includes(config.packageManager)
  ) {
    errors.push("Le gestionnaire de packages doit être npm, yarn, pnpm ou bun");
  }

  return errors;
}

/**
 * Génère un projet avec validation
 */
export function generateValidatedBaseProject(
  customConfig: Partial<BaseProjectConfig> = {}
): GeneratedProject | { errors: string[] } {
  const errors = validateProjectConfig(customConfig);

  if (errors.length > 0) {
    return { errors };
  }

  return generateBaseProject(customConfig);
}
