/**
 * Template d'authentification - Better Auth
 *
 * Ce template génère une configuration complète d'authentification avec Better Auth
 * Basé sur les patterns d'analyse Better Auth terminés
 */

import { DirectoryStructure, ProjectConfig } from "../types";

export interface AuthConfig extends ProjectConfig {
  authProvider: "better-auth";
  providers: ("google" | "github" | "discord" | "microsoft" | "email")[];
  features: (
    | "2fa"
    | "email-verification"
    | "password-reset"
    | "social-login"
    | "passkey"
    | "multi-session"
    | "organizations"
  )[];
  database: "postgresql" | "mysql" | "sqlite";
  sessionConfig: {
    expiresIn: number; // seconds
    updateAge: number; // seconds
    cookieCache: boolean;
  };
  security: {
    rateLimit: boolean;
    csrf: boolean;
    requireEmailVerification: boolean;
    minPasswordLength: number;
    maxPasswordLength: number;
  };
  ui: {
    theme: "light" | "dark" | "system";
    customPages: boolean;
    redirectAfterLogin: string;
    redirectAfterLogout: string;
  };
}

export const defaultAuthConfig: AuthConfig = {
  projectName: "nextjs-auth-app",
  useTypeScript: true,
  packageManager: "npm",
  authProvider: "better-auth",
  providers: ["email", "github", "google"],
  features: ["email-verification", "password-reset", "social-login"],
  database: "postgresql",
  sessionConfig: {
    expiresIn: 604800, // 7 days
    updateAge: 86400, // 1 day
    cookieCache: true,
  },
  security: {
    rateLimit: true,
    csrf: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  ui: {
    theme: "system",
    customPages: true,
    redirectAfterLogin: "/dashboard",
    redirectAfterLogout: "/",
  },
};

/**
 * Structure de répertoires pour l'authentification
 */
export const generateAuthDirectoryStructure = (): DirectoryStructure => {
  return {
    "app/": {
      type: "directory",
      description: "App Router avec routes d'authentification",
      children: {
        "(auth)/": {
          type: "directory",
          description: "Route group pour authentification",
          children: {
            "login/": {
              type: "directory",
              children: {
                "page.tsx": { type: "file", description: "Page de connexion" },
              },
            },
            "signup/": {
              type: "directory",
              children: {
                "page.tsx": { type: "file", description: "Page d'inscription" },
              },
            },
            "forgot-password/": {
              type: "directory",
              children: {
                "page.tsx": {
                  type: "file",
                  description: "Mot de passe oublié",
                },
              },
            },
            "reset-password/": {
              type: "directory",
              children: {
                "page.tsx": {
                  type: "file",
                  description: "Réinitialisation mot de passe",
                },
              },
            },
            "verify-email/": {
              type: "directory",
              children: {
                "page.tsx": { type: "file", description: "Vérification email" },
              },
            },
          },
        },
        "api/": {
          type: "directory",
          children: {
            "auth/": {
              type: "directory",
              children: {
                "[...all]/": {
                  type: "directory",
                  children: {
                    "route.ts": {
                      type: "file",
                      description: "API routes Better Auth",
                    },
                  },
                },
              },
            },
          },
        },
        "dashboard/": {
          type: "directory",
          description: "Pages protégées",
          children: {
            "page.tsx": { type: "file", description: "Dashboard principal" },
            "profile/": {
              type: "directory",
              children: {
                "page.tsx": { type: "file", description: "Profil utilisateur" },
              },
            },
            "settings/": {
              type: "directory",
              children: {
                "page.tsx": { type: "file", description: "Paramètres" },
              },
            },
          },
        },
      },
    },
    "src/": {
      type: "directory",
      children: {
        "lib/": {
          type: "directory",
          children: {
            "auth.ts": {
              type: "file",
              description: "Configuration Better Auth serveur",
            },
            "auth-client.ts": {
              type: "file",
              description: "Client Better Auth",
            },
            "permissions.ts": {
              type: "file",
              description: "Système de permissions",
            },
          },
        },
        "components/": {
          type: "directory",
          children: {
            "auth/": {
              type: "directory",
              description: "Composants d'authentification",
              children: {
                "login-form.tsx": { type: "file" },
                "signup-form.tsx": { type: "file" },
                "forgot-password-form.tsx": { type: "file" },
                "reset-password-form.tsx": { type: "file" },
                "social-login.tsx": { type: "file" },
                "auth-guard.tsx": { type: "file" },
                "user-menu.tsx": { type: "file" },
              },
            },
          },
        },
        "hooks/": {
          type: "directory",
          children: {
            "use-auth.ts": {
              type: "file",
              description: "Hook d'authentification",
            },
            "use-session.ts": { type: "file", description: "Hook de session" },
            "use-permissions.ts": {
              type: "file",
              description: "Hook de permissions",
            },
          },
        },
        "services/": {
          type: "directory",
          children: {
            "auth/": {
              type: "directory",
              children: {
                "login.ts": {
                  type: "file",
                  description: "Server Action login",
                },
                "signup.ts": {
                  type: "file",
                  description: "Server Action signup",
                },
                "logout.ts": {
                  type: "file",
                  description: "Server Action logout",
                },
                "password-reset.ts": {
                  type: "file",
                  description: "Server Actions mot de passe",
                },
              },
            },
          },
        },
      },
    },
    "shared/": {
      type: "directory",
      children: {
        "types/": {
          type: "directory",
          children: {
            "auth.ts": {
              type: "file",
              description: "Types d'authentification",
            },
          },
        },
        "validation/": {
          type: "directory",
          children: {
            "auth.ts": { type: "file", description: "Schémas Zod auth" },
          },
        },
      },
    },
    "middleware.ts": {
      type: "file",
      description: "Middleware de protection des routes",
    },
  };
};

/**
 * Génère les dépendances nécessaires pour l'authentification
 */
export const getAuthDependencies = (
  config: AuthConfig
): { dependencies: string[]; devDependencies: string[] } => {
  const dependencies = ["better-auth@^1.0.0"];

  const devDependencies: string[] = [];

  // Adapter base de données
  switch (config.database) {
    case "postgresql":
      dependencies.push("pg@^8.11.0", "@types/pg@^8.11.0");
      break;
    case "mysql":
      dependencies.push("mysql2@^3.6.0");
      break;
    case "sqlite":
      dependencies.push(
        "better-sqlite3@^9.0.0",
        "@types/better-sqlite3@^7.6.0"
      );
      break;
  }

  // Plugins selon les fonctionnalités
  if (config.features.includes("organizations")) {
    // Plugin organisation inclus dans better-auth
  }

  if (config.features.includes("passkey")) {
    // Plugin passkey inclus dans better-auth
  }

  if (config.features.includes("multi-session")) {
    // Plugin multi-session inclus dans better-auth
  }

  return { dependencies, devDependencies };
};

/**
 * Génère la configuration des providers
 */
export const generateProvidersConfig = (config: AuthConfig): string => {
  const providers: string[] = [];

  if (config.providers.includes("github")) {
    providers.push(`
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },`);
  }

  if (config.providers.includes("google")) {
    providers.push(`
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },`);
  }

  if (config.providers.includes("discord")) {
    providers.push(`
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    },`);
  }

  if (config.providers.includes("microsoft")) {
    providers.push(`
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: "common",
      requireSelectAccount: true,
    },`);
  }

  return providers.length > 0
    ? `
  socialProviders: {${providers.join("")}
  },`
    : "";
};

/**
 * Génère la configuration des plugins
 */
export const generatePluginsConfig = (
  config: AuthConfig
): { imports: string; plugins: string } => {
  const plugins: string[] = [];
  const imports: string[] = [];

  if (config.features.includes("organizations")) {
    imports.push('import { organization } from "better-auth/plugins";');
    plugins.push("organization()");
  }

  if (config.features.includes("passkey")) {
    imports.push('import { passkey } from "better-auth/plugins";');
    plugins.push(`passkey({
      rpID: process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost",
      rpName: "${config.projectName}",
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    })`);
  }

  if (config.features.includes("multi-session")) {
    imports.push('import { multiSession } from "better-auth/plugins";');
    plugins.push("multiSession()");
  }

  const importsStr = imports.length > 0 ? imports.join("\n") + "\n" : "";
  const pluginsStr =
    plugins.length > 0
      ? `
  plugins: [
    ${plugins.join(",\n    ")}
  ],`
      : "";

  return { imports: importsStr, plugins: pluginsStr };
};
