/**
 * Template de base - Structure de projet Next.js
 *
 * Ce template génère la structure de fichiers Next.js avec app/, src/, shared/ et configuration
 * Basé sur les 17 analyses de patterns terminées
 */

import { DirectoryStructure, FileTemplate, ProjectConfig } from "../types";

export interface BaseProjectConfig extends ProjectConfig {
  projectName: string;
  useTypeScript: boolean;
  useSrcDirectory: boolean;
  useAppRouter: boolean;
  packageManager: "npm" | "yarn" | "pnpm" | "bun";
  pathAliases: {
    "@/*": string;
    "@/app/*": string;
    "@/shared/*": string;
    "@/components/*": string;
    "@/lib/*": string;
    "@/hooks/*": string;
    "@/services/*": string;
  };
  dependencies: {
    core: string[];
    dev: string[];
    ui: string[];
    validation: string[];
    database: string[];
    auth: string[];
  };
}

export const defaultBaseProjectConfig: BaseProjectConfig = {
  projectName: "nextjs-app",
  useTypeScript: true,
  useSrcDirectory: true,
  useAppRouter: true,
  packageManager: "npm",
  pathAliases: {
    "@/*": "./src/*",
    "@/app/*": "./app/*",
    "@/shared/*": "./shared/*",
    "@/components/*": "./src/components/*",
    "@/lib/*": "./src/lib/*",
    "@/hooks/*": "./src/hooks/*",
    "@/services/*": "./src/services/*",
  },
  dependencies: {
    core: ["next@^15.1.0", "react@^19.0.0", "react-dom@^19.0.0"],
    dev: [
      "@types/node@^22.0.0",
      "@types/react@^19.0.0",
      "@types/react-dom@^19.0.0",
      "typescript@^5.7.0",
      "eslint@^9.0.0",
      "eslint-config-next@^15.1.0",
      "@eslint/eslintrc@^3.0.0",
    ],
    ui: [
      "tailwindcss@latest",
      "@tailwindcss/postcss@latest",
      "class-variance-authority@^0.7.0",
      "clsx@^2.1.0",
      "tailwind-merge@^2.5.0",
      "lucide-react@^0.460.0",
      "tailwindcss-animate@^1.0.7",
    ],
    validation: [
      "zod@^3.24.0",
      "@hookform/resolvers@^3.9.0",
      "react-hook-form@^7.53.0",
    ],
    database: ["prisma@^6.0.0", "@prisma/client@^6.0.0"],
    auth: ["better-auth@^1.0.0"],
  },
};

/**
 * Structure de répertoires recommandée par l'utilisateur
 */
export const generateDirectoryStructure = (
  config: BaseProjectConfig
): DirectoryStructure => {
  const srcPath = config.useSrcDirectory ? "src/" : "";

  return {
    "app/": {
      type: "directory",
      description: "App Router - Routes et layouts (@/app)",
      children: {
        "(auth)/": {
          type: "directory",
          description: "Route group pour authentification",
          children: {
            "login/": {
              type: "directory",
              children: { "page.tsx": { type: "file" } },
            },
            "signup/": {
              type: "directory",
              children: { "page.tsx": { type: "file" } },
            },
          },
        },
        "api/": {
          type: "directory",
          description: "API Routes",
          children: {
            "auth/": { type: "directory", children: {} },
          },
        },
        "globals.css": {
          type: "file",
          description: "Styles globaux Tailwind CSS",
        },
        "layout.tsx": { type: "file", description: "Root Layout obligatoire" },
        "page.tsx": { type: "file", description: "Page d'accueil" },
        "loading.tsx": { type: "file", description: "UI de chargement" },
        "error.tsx": { type: "file", description: "Error boundary" },
        "not-found.tsx": { type: "file", description: "Page 404" },
      },
    },
    [`${srcPath}`]: {
      type: "directory",
      description: "Source code (@/)",
      children: {
        "lib/": {
          type: "directory",
          description: "Utilitaires et configuration",
          children: {
            "utils.ts": { type: "file", description: "Utilitaires généraux" },
            "constants.ts": {
              type: "file",
              description: "Constantes application",
            },
            "auth.ts": {
              type: "file",
              description: "Configuration Better Auth",
            },
            "db.ts": { type: "file", description: "Client Prisma" },
          },
        },
        "services/": {
          type: "directory",
          description: "Server Actions (@/services)",
          children: {
            "auth/": { type: "directory", children: {} },
            "users/": { type: "directory", children: {} },
          },
        },
        "hooks/": {
          type: "directory",
          description: "Custom React hooks (@/hooks)",
          children: {
            "use-auth.ts": { type: "file" },
            "use-local-storage.ts": { type: "file" },
          },
        },
        "components/": {
          type: "directory",
          description: "Composants React (@/components)",
          children: {
            "ui/": {
              type: "directory",
              description: "Composants shadcn/ui",
              children: {
                "button.tsx": { type: "file" },
                "input.tsx": { type: "file" },
                "form.tsx": { type: "file" },
                "card.tsx": { type: "file" },
              },
            },
            "layout/": {
              type: "directory",
              description: "Composants de layout",
              children: {
                "header.tsx": { type: "file" },
                "footer.tsx": { type: "file" },
                "sidebar.tsx": { type: "file" },
                "navigation.tsx": { type: "file" },
              },
            },
            "features/": {
              type: "directory",
              description: "Composants par feature",
              children: {
                "auth/": { type: "directory", children: {} },
                "dashboard/": { type: "directory", children: {} },
              },
            },
          },
        },
      },
    },
    "shared/": {
      type: "directory",
      description: "Types & Validation (@/shared)",
      children: {
        "types/": {
          type: "directory",
          description: "Types TypeScript partagés",
          children: {
            "auth.ts": { type: "file" },
            "users.ts": { type: "file" },
            "api.ts": { type: "file" },
            "index.ts": { type: "file", description: "Exports centralisés" },
          },
        },
        "validation/": {
          type: "directory",
          description: "Schémas Zod",
          children: {
            "auth.ts": { type: "file" },
            "users.ts": { type: "file" },
            "index.ts": { type: "file", description: "Exports centralisés" },
          },
        },
      },
    },
    "prisma/": {
      type: "directory",
      description: "Configuration base de données",
      children: {
        "schema.prisma": { type: "file" },
        "migrations/": { type: "directory", children: {} },
        "seed.ts": { type: "file" },
      },
    },
    "public/": {
      type: "directory",
      description: "Assets statiques",
      children: {
        "images/": { type: "directory", children: {} },
        "icons/": { type: "directory", children: {} },
        "favicon.ico": { type: "file" },
      },
    },
    "__tests__/": {
      type: "directory",
      description: "Tests",
      children: {
        "components/": { type: "directory", children: {} },
        "pages/": { type: "directory", children: {} },
        "api/": { type: "directory", children: {} },
        "utils/": { type: "directory", children: {} },
      },
    },
    "docs/": {
      type: "directory",
      description: "Documentation",
      children: {
        "api.md": { type: "file" },
        "deployment.md": { type: "file" },
        "development.md": { type: "file" },
      },
    },
  };
};

/**
 * Génère le package.json avec les dépendances appropriées
 */
export const generatePackageJson = (
  config: BaseProjectConfig
): FileTemplate => {
  const allDependencies = [
    ...config.dependencies.core,
    ...config.dependencies.ui,
    ...config.dependencies.validation,
    ...config.dependencies.database,
    ...config.dependencies.auth,
  ];

  const allDevDependencies = config.dependencies.dev;

  return {
    path: "package.json",
    content: JSON.stringify(
      {
        name: config.projectName,
        version: "0.1.0",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
          lint: "next lint",
          "lint:fix": "next lint --fix",
          "type-check": "tsc --noEmit",
          "db:generate": "prisma generate",
          "db:push": "prisma db push",
          "db:migrate": "prisma migrate dev",
          "db:seed": "tsx prisma/seed.ts",
          "db:studio": "prisma studio",
          test: "jest",
          "test:watch": "jest --watch",
          "test:coverage": "jest --coverage",
          e2e: "playwright test",
          "e2e:ui": "playwright test --ui",
          preview: "npm run build && npm run start",
        },
        dependencies: allDependencies.reduce((acc, dep) => {
          const lastAtIndex = dep.lastIndexOf("@");
          if (lastAtIndex > 0) {
            const name = dep.substring(0, lastAtIndex);
            const version = dep.substring(lastAtIndex + 1);
            acc[name] = version;
          } else {
            acc[dep] = "latest";
          }
          return acc;
        }, {} as Record<string, string>),
        devDependencies: allDevDependencies.reduce((acc, dep) => {
          const lastAtIndex = dep.lastIndexOf("@");
          if (lastAtIndex > 0) {
            const name = dep.substring(0, lastAtIndex);
            const version = dep.substring(lastAtIndex + 1);
            acc[name] = version;
          } else {
            acc[dep] = "latest";
          }
          return acc;
        }, {} as Record<string, string>),
      },
      null,
      2
    ),
  };
};
