/**
 * Templates de configuration Better Auth
 * Génère les fichiers de configuration serveur et client
 */

import { FileTemplate } from "../types";
import {
  AuthConfig,
  generatePluginsConfig,
  generateProvidersConfig,
} from "./index";

/**
 * Génère le fichier de configuration Better Auth serveur (src/lib/auth.ts)
 */
export const generateAuthServerConfig = (config: AuthConfig): FileTemplate => {
  const providersConfig = generateProvidersConfig(config);
  const { imports: pluginImports, plugins: pluginsConfig } =
    generatePluginsConfig(config);

  // Adapter de base de données
  let databaseConfig = "";
  let databaseImports = "";

  switch (config.database) {
    case "postgresql":
      databaseImports = 'import { Pool } from "pg";';
      databaseConfig = `
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),`;
      break;
    case "mysql":
      databaseImports = 'import { createConnection } from "mysql2/promise";';
      databaseConfig = `
  database: await createConnection(process.env.DATABASE_URL!),`;
      break;
    case "sqlite":
      databaseImports = 'import Database from "better-sqlite3";';
      databaseConfig = `
  database: new Database(process.env.DATABASE_URL || "./database.db"),`;
      break;
  }

  return {
    path: "src/lib/auth.ts",
    content: `import { betterAuth } from "better-auth";
${databaseImports}
${pluginImports}

export const auth = betterAuth({${databaseConfig}
  emailAndPassword: {
    enabled: ${config.providers.includes("email")},
    minPasswordLength: ${config.security.minPasswordLength},
    maxPasswordLength: ${config.security.maxPasswordLength},
    requireEmailVerification: ${config.security.requireEmailVerification},
    autoSignIn: true,
  },${providersConfig}
  session: {
    expiresIn: ${config.sessionConfig.expiresIn}, // ${
      config.sessionConfig.expiresIn / 86400
    } days
    updateAge: ${config.sessionConfig.updateAge}, // ${
      config.sessionConfig.updateAge / 86400
    } day(s)
    cookieCache: {
      enabled: ${config.sessionConfig.cookieCache},
      maxAge: 300, // 5 minutes
    },
  },
  rateLimit: {
    enabled: ${config.security.rateLimit},
    window: 60, // 1 minute
    max: 100, // 100 requests per minute
  },
  csrf: {
    enabled: ${config.security.csrf},
  },${pluginsConfig}
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;`,
  };
};

/**
 * Génère le fichier client Better Auth (src/lib/auth-client.ts)
 */
export const generateAuthClientConfig = (config: AuthConfig): FileTemplate => {
  const { imports: pluginImports } = generatePluginsConfig(config);

  // Imports client pour les plugins
  let clientPluginImports = "";
  let clientPlugins: string[] = [];

  if (config.features.includes("organizations")) {
    clientPluginImports +=
      'import { organizationClient } from "better-auth/client/plugins";\n';
    clientPlugins.push("organizationClient()");
  }

  if (config.features.includes("passkey")) {
    clientPluginImports +=
      'import { passkeyClient } from "better-auth/client/plugins";\n';
    clientPlugins.push("passkeyClient()");
  }

  if (config.features.includes("multi-session")) {
    clientPluginImports +=
      'import { multiSessionClient } from "better-auth/client/plugins";\n';
    clientPlugins.push("multiSessionClient()");
  }

  const clientPluginsConfig =
    clientPlugins.length > 0
      ? `
  plugins: [
    ${clientPlugins.join(",\n    ")}
  ],`
      : "";

  return {
    path: "src/lib/auth-client.ts",
    content: `"use client";

import { createAuthClient } from "better-auth/client";
${clientPluginImports}

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",${clientPluginsConfig}
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  user,
  organization,
} = authClient;`,
  };
};

/**
 * Génère le middleware de protection des routes
 */
export const generateAuthMiddleware = (config: AuthConfig): FileTemplate => {
  return {
    path: "middleware.ts",
    content: `import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Routes publiques
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/about",
    "/contact",
  ];
  
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/api/auth")
  );
  
  // Vérifier la session
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  
  // Redirection des utilisateurs authentifiés depuis les pages d'auth
  if (session && ["/login", "/signup"].includes(pathname)) {
    return NextResponse.redirect(new URL("${config.ui.redirectAfterLogin}", request.url));
  }
  
  // Protection des routes privées
  if (!isPublicRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Headers de sécurité
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};`,
  };
};

/**
 * Génère l'API route pour Better Auth
 */
export const generateAuthApiRoute = (): FileTemplate => {
  return {
    path: "app/api/auth/[...all]/route.ts",
    content: `import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

export { handler as GET, handler as POST };`,
  };
};

/**
 * Génère les variables d'environnement pour l'authentification
 */
export const generateAuthEnvExample = (config: AuthConfig): FileTemplate => {
  let envVars = `# Better Auth Configuration
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_DOMAIN="localhost"

# Database
DATABASE_URL="${
    config.database === "mysql"
      ? "mysql"
      : config.database === "postgresql"
      ? "postgresql"
      : null
  }//username:password@localhost:${
    config.database === "mysql"
      ? "3306"
      : config.database === "postgresql"
      ? "5432"
      : null
  }/database_name"
`; // rewrite well this method to detect if db is "postgresql" | "mysql" | "sqlite" create a function get prismaDbUrl that have params config.database and based to db rovide the correct url like getDbUrl({config.database}:{"postgresql" | "mysql" | "sqlite";}) : string

  if (config.providers.includes("github")) {
    envVars += `
# GitHub OAuth
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""`;
  }

  if (config.providers.includes("google")) {
    envVars += `
# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""`;
  }

  if (config.providers.includes("discord")) {
    envVars += `
# Discord OAuth
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""`;
  }

  if (config.providers.includes("microsoft")) {
    envVars += `
# Microsoft OAuth
MICROSOFT_CLIENT_ID=""
MICROSOFT_CLIENT_SECRET=""`;
  }

  if (config.features.includes("email-verification")) {
    envVars += `
# Email Configuration (for verification)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM=""`;
  }

  return {
    path: ".env.example",
    content: envVars,
  };
};
