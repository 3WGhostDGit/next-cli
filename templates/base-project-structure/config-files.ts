/**
 * Templates de fichiers de configuration pour le projet de base
 * Basé sur les patterns d'analyse Next.js et les meilleures pratiques
 */

import { FileTemplate, ProjectConfig } from "../types";

// Interface pour la configuration du projet de base
export interface BaseProjectConfig extends ProjectConfig {
  projectName: string;
  useTypeScript: boolean;
  useSrcDirectory: boolean;
  useAppRouter: boolean;
  packageManager: "npm" | "yarn" | "pnpm" | "bun";
}

/**
 * Génère le tsconfig.json optimisé pour Next.js
 */
export const generateTsConfig = (config: BaseProjectConfig): FileTemplate => {
  const srcPath = config.useSrcDirectory ? "./src" : ".";

  return {
    path: "tsconfig.json",
    content: JSON.stringify(
      {
        compilerOptions: {
          target: "ES2020",
          lib: ["dom", "dom.iterable", "esnext"],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "preserve",
          incremental: true,
          plugins: [{ name: "next" }],
          baseUrl: ".",
          paths: {
            "@/*": [srcPath + "/*"],
            "@/app/*": ["./app/*"],
            "@/shared/*": ["./shared/*"],
            "@/components/*": [srcPath + "/components/*"],
            "@/lib/*": [srcPath + "/lib/*"],
            "@/hooks/*": [srcPath + "/hooks/*"],
            "@/services/*": [srcPath + "/services/*"],
            "@/types/*": ["./shared/types/*"],
            "@/validation/*": ["./shared/validation/*"],
          },
          forceConsistentCasingInFileNames: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
        },
        include: [
          "next-env.d.ts",
          "**/*.ts",
          "**/*.tsx",
          ".next/types/**/*.ts",
        ],
        exclude: ["node_modules"],
      },
      null,
      2
    ),
  };
};

/**
 * Génère le next.config.ts avec les optimisations recommandées
 */
export const generateNextConfig = (): FileTemplate => {
  return {
    path: "next.config.ts",
    content: `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Mode standalone pour Docker
  output: 'standalone',
  
  // Optimisations de production
  compress: true,
  poweredByHeader: false,
  
  // Configuration des images
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 an
  },
  
  // Configuration expérimentale
  experimental: {
    typedRoutes: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
    ],
  },
  
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;`,
  };
};

/**
 * Génère le postcss.config.ts pour Tailwind CSS v4
 */
export const generatePostCSSConfig = (): FileTemplate => {
  return {
    path: "postcss.config.ts",
    content: `export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};`,
  };
};

/**
 * Génère le components.json pour shadcn/ui
 */
export const generateComponentsJson = (): FileTemplate => {
  return {
    path: "components.json",
    content: JSON.stringify(
      {
        $schema: "https://ui.shadcn.com/schema.json",
        style: "new-york",
        rsc: true,
        tsx: true,
        tailwind: {
          config: "postcss.config.ts",
          css: "app/globals.css",
          baseColor: "zinc",
          cssVariables: true,
          prefix: "",
        },
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
          ui: "@/components/ui",
          lib: "@/lib",
          hooks: "@/hooks",
        },
        iconLibrary: "lucide",
      },
      null,
      2
    ),
  };
};

/**
 * Génère le fichier .env.example avec les variables d'environnement
 */
export const generateEnvExample = (): FileTemplate => {
  return {
    path: ".env.example",
    content: `# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Providers OAuth (optionnel)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Email (optionnel)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM=""

# Monitoring (optionnel)
SENTRY_DSN=""
VERCEL_ANALYTICS_ID=""`,
  };
};

/**
 * Génère le fichier .gitignore
 */
export const generateGitignore = (): FileTemplate => {
  return {
    path: ".gitignore",
    content: `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# prisma
/prisma/migrations/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
Thumbs.db`,
  };
};

/**
 * Génère le fichier README.md
 */
export const generateReadme = (config: BaseProjectConfig): FileTemplate => {
  return {
    path: "README.md",
    content: `# ${config.projectName}

Une application Next.js moderne avec App Router, TypeScript, Tailwind CSS, shadcn/ui, Prisma, et Better Auth.

## 🚀 Stack Technologique

- **Framework**: Next.js 15 avec App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Base de données**: Prisma ORM
- **Authentification**: Better Auth
- **Validation**: Zod + React Hook Form
- **Tests**: Jest + React Testing Library + Playwright

## 📁 Structure du Projet

\`\`\`
${config.projectName}/
├── app/                    # App Router (@/app)
│   ├── (auth)/            # Route group authentification
│   ├── api/               # API Routes
│   ├── globals.css        # Styles globaux
│   ├── layout.tsx         # Root Layout
│   └── page.tsx           # Page d'accueil
├── ${config.useSrcDirectory ? "src/" : ""}                    # Source (@/)
│   ├── lib/               # Utilitaires et configuration
│   ├── services/          # Server Actions
│   ├── hooks/             # Custom React hooks
│   └── components/        # Composants React
├── shared/                # Types & Validation (@/shared)
│   ├── types/             # Types TypeScript
│   └── validation/        # Schémas Zod
├── prisma/                # Configuration base de données
└── components.json        # Configuration shadcn/ui
\`\`\`

## 🛠️ Installation

1. Cloner le repository
2. Installer les dépendances:
   \`\`\`bash
   ${config.packageManager} install
   \`\`\`

3. Configurer les variables d'environnement:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Configurer la base de données:
   \`\`\`bash
   ${config.packageManager} run db:push
   ${config.packageManager} run db:seed
   \`\`\`

5. Lancer le serveur de développement:
   \`\`\`bash
   ${config.packageManager} run dev
   \`\`\`

## 📝 Scripts Disponibles

- \`dev\`: Serveur de développement
- \`build\`: Build de production
- \`start\`: Serveur de production
- \`lint\`: Linter ESLint
- \`type-check\`: Vérification TypeScript
- \`db:*\`: Commandes Prisma
- \`test\`: Tests unitaires
- \`e2e\`: Tests end-to-end

## 🔧 Configuration

### Path Aliases

- \`@/*\`: ${config.useSrcDirectory ? "./src/*" : "./*"}
- \`@/app/*\`: ./app/*
- \`@/shared/*\`: ./shared/*
- \`@/components/*\`: ${
      config.useSrcDirectory ? "./src/components/*" : "./components/*"
    }

### shadcn/ui

Les composants UI sont configurés avec le style "new-york" et les CSS variables.

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Better Auth Documentation](https://better-auth.com)`,
  };
};
