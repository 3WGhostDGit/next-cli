/**
 * Générateur principal du template d'authentification
 * Orchestre la génération de tous les fichiers d'authentification
 */

import { FileTemplate, GenerationResult } from "../types";
import {
  generateLoginAction,
  generateLogoutAction,
  generatePasswordResetActions,
  generateProfileActions,
  generateSignupAction,
} from "./auth-actions";
import {
  generateLoginForm,
  generateSignupForm,
  generateSocialLogin,
} from "./auth-components";
import {
  generateAuthApiRoute,
  generateAuthClientConfig,
  generateAuthEnvExample,
  generateAuthMiddleware,
  generateAuthServerConfig,
} from "./auth-config";
import {
  generateAuthGuard,
  generateAuthTypes,
  generateAuthValidation,
  generateUseAuth,
  generateUserMenu,
} from "./auth-hooks";
import {
  generateDashboardPage,
  generateForgotPasswordPage,
  generateLoginPage,
  generateSignupPage,
  generateVerifyEmailPage,
} from "./auth-pages";
import {
  AuthConfig,
  defaultAuthConfig,
  generateAuthDirectoryStructure,
  getAuthDependencies,
} from "./index";

/**
 * Valide la configuration d'authentification
 */
export function validateAuthConfig(config: Partial<AuthConfig>): string[] {
  const errors: string[] = [];

  // Validation du nom de projet
  if (config.projectName && !/^[a-z0-9-]+$/.test(config.projectName)) {
    errors.push(
      "Le nom du projet doit contenir uniquement des lettres minuscules, chiffres et tirets"
    );
  }

  // Validation des providers
  if (config.providers && config.providers.length === 0) {
    errors.push(
      "Au moins un provider d'authentification doit être sélectionné"
    );
  }

  // Validation de la base de données
  if (
    config.database &&
    !["postgresql", "mysql", "sqlite"].includes(config.database)
  ) {
    errors.push(
      "Base de données non supportée. Utilisez postgresql, mysql ou sqlite"
    );
  }

  // Validation de la sécurité
  if (config.security) {
    if (
      config.security.minPasswordLength &&
      config.security.minPasswordLength < 6
    ) {
      errors.push(
        "La longueur minimale du mot de passe doit être d'au moins 6 caractères"
      );
    }
    if (
      config.security.maxPasswordLength &&
      config.security.maxPasswordLength > 256
    ) {
      errors.push(
        "La longueur maximale du mot de passe ne peut pas dépasser 256 caractères"
      );
    }
    if (
      config.security.minPasswordLength &&
      config.security.maxPasswordLength &&
      config.security.minPasswordLength >= config.security.maxPasswordLength
    ) {
      errors.push(
        "La longueur minimale doit être inférieure à la longueur maximale"
      );
    }
  }

  // Validation des fonctionnalités
  if (config.features) {
    if (
      config.features.includes("email-verification") &&
      !config.providers?.includes("email")
    ) {
      errors.push("La vérification d'email nécessite le provider email");
    }
    if (
      config.features.includes("password-reset") &&
      !config.providers?.includes("email")
    ) {
      errors.push(
        "La réinitialisation de mot de passe nécessite le provider email"
      );
    }
  }

  return errors;
}

/**
 * Génère un projet d'authentification complet avec validation
 */
export function generateValidatedAuthProject(
  config: Partial<AuthConfig> = {}
): GenerationResult<AuthConfig> {
  // Validation de la configuration
  const errors = validateAuthConfig(config);
  if (errors.length > 0) {
    return { errors };
  }

  // Fusion avec la configuration par défaut
  const finalConfig: AuthConfig = {
    ...defaultAuthConfig,
    ...config,
    sessionConfig: {
      ...defaultAuthConfig.sessionConfig,
      ...config.sessionConfig,
    },
    security: {
      ...defaultAuthConfig.security,
      ...config.security,
    },
    ui: {
      ...defaultAuthConfig.ui,
      ...config.ui,
    },
  };

  // Génération des fichiers
  const files: FileTemplate[] = [];

  try {
    // Configuration Better Auth
    files.push(generateAuthServerConfig(finalConfig));
    files.push(generateAuthClientConfig(finalConfig));
    files.push(generateAuthMiddleware(finalConfig));
    files.push(generateAuthApiRoute());
    files.push(generateAuthEnvExample(finalConfig));

    // Composants d'authentification
    files.push(generateLoginForm(finalConfig));
    files.push(generateSignupForm(finalConfig));
    files.push(generateSocialLogin(finalConfig));
    files.push(generateAuthGuard(finalConfig));
    files.push(generateUserMenu(finalConfig));

    // Pages d'authentification
    files.push(generateLoginPage(finalConfig));
    files.push(generateSignupPage(finalConfig));
    files.push(generateDashboardPage(finalConfig));

    // Pages conditionnelles
    if (finalConfig.features.includes("password-reset")) {
      files.push(generateForgotPasswordPage(finalConfig));
    }

    if (finalConfig.features.includes("email-verification")) {
      files.push(generateVerifyEmailPage(finalConfig));
    }

    // Hooks et utilitaires
    files.push(generateUseAuth(finalConfig));

    // Server Actions
    files.push(generateLoginAction(finalConfig));
    files.push(generateSignupAction(finalConfig));
    files.push(generateLogoutAction(finalConfig));
    files.push(generatePasswordResetActions(finalConfig));
    files.push(generateProfileActions(finalConfig));

    // Types et validation
    files.push(generateAuthTypes(finalConfig));
    files.push(generateAuthValidation(finalConfig));

    // Génération des instructions
    const instructions = generateAuthInstructions(finalConfig);

    // Structure de répertoires
    const structure = generateAuthDirectoryStructure();

    return {
      files,
      instructions,
      structure,
      config: finalConfig,
    };
  } catch (error) {
    return {
      errors: [
        `Erreur lors de la génération: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`,
      ],
    };
  }
}

/**
 * Génère les instructions d'installation et de configuration
 */
function generateAuthInstructions(config: AuthConfig): string[] {
  const instructions: string[] = [];
  const { dependencies, devDependencies } = getAuthDependencies(config);

  // Instructions d'installation
  instructions.push(
    "## 🔐 Configuration de l'authentification avec Better Auth"
  );
  instructions.push("");

  // Installation des dépendances
  if (dependencies.length > 0) {
    const depCommand =
      config.packageManager === "npm"
        ? "npm install"
        : config.packageManager === "yarn"
        ? "yarn add"
        : config.packageManager === "pnpm"
        ? "pnpm add"
        : "bun add";
    instructions.push(`1. **Installer les dépendances :**`);
    instructions.push(`   \`${depCommand} ${dependencies.join(" ")}\``);
    instructions.push("");
  }

  // Configuration de la base de données
  instructions.push("2. **Configurer la base de données :**");
  switch (config.database) {
    case "postgresql":
      instructions.push("   - Créer une base de données PostgreSQL");
      instructions.push("   - Configurer DATABASE_URL dans .env");
      break;
    case "mysql":
      instructions.push("   - Créer une base de données MySQL");
      instructions.push("   - Configurer DATABASE_URL dans .env");
      break;
    case "sqlite":
      instructions.push("   - Le fichier SQLite sera créé automatiquement");
      break;
  }
  instructions.push("");

  // Configuration des variables d'environnement
  instructions.push("3. **Configurer les variables d'environnement :**");
  instructions.push("   - Copier .env.example vers .env");
  instructions.push(
    "   - Générer BETTER_AUTH_SECRET: `openssl rand -base64 32`"
  );

  if (config.providers.includes("github")) {
    instructions.push(
      "   - Configurer GitHub OAuth dans GitHub Developer Settings"
    );
  }
  if (config.providers.includes("google")) {
    instructions.push("   - Configurer Google OAuth dans Google Cloud Console");
  }
  if (config.providers.includes("discord")) {
    instructions.push(
      "   - Configurer Discord OAuth dans Discord Developer Portal"
    );
  }
  if (config.providers.includes("microsoft")) {
    instructions.push("   - Configurer Microsoft OAuth dans Azure Portal");
  }
  instructions.push("");

  // Migration de la base de données
  instructions.push("4. **Initialiser la base de données :**");
  instructions.push(
    "   - Better Auth créera automatiquement les tables nécessaires"
  );
  instructions.push("   - Démarrer l'application: `npm run dev`");
  instructions.push("");

  // Fonctionnalités activées
  instructions.push("5. **Fonctionnalités activées :**");
  config.features.forEach((feature) => {
    switch (feature) {
      case "email-verification":
        instructions.push("   ✅ Vérification d'email");
        break;
      case "password-reset":
        instructions.push("   ✅ Réinitialisation de mot de passe");
        break;
      case "social-login":
        instructions.push("   ✅ Connexion sociale");
        break;
      case "2fa":
        instructions.push("   ✅ Authentification à deux facteurs");
        break;
      case "passkey":
        instructions.push("   ✅ Authentification par passkey");
        break;
      case "multi-session":
        instructions.push("   ✅ Sessions multiples");
        break;
      case "organizations":
        instructions.push("   ✅ Gestion d'organisations");
        break;
    }
  });
  instructions.push("");

  // Routes disponibles
  instructions.push("6. **Routes d'authentification disponibles :**");
  instructions.push("   - `/login` - Page de connexion");
  instructions.push("   - `/signup` - Page d'inscription");
  instructions.push("   - `/dashboard` - Page protégée (exemple)");

  if (config.features.includes("password-reset")) {
    instructions.push("   - `/forgot-password` - Mot de passe oublié");
    instructions.push("   - `/reset-password` - Réinitialisation");
  }

  if (config.features.includes("email-verification")) {
    instructions.push("   - `/verify-email` - Vérification d'email");
  }
  instructions.push("");

  // Configuration de sécurité
  instructions.push("7. **Configuration de sécurité :**");
  instructions.push(
    `   - Longueur mot de passe: ${config.security.minPasswordLength}-${config.security.maxPasswordLength} caractères`
  );
  instructions.push(
    `   - Vérification email: ${
      config.security.requireEmailVerification ? "Activée" : "Désactivée"
    }`
  );
  instructions.push(
    `   - Protection CSRF: ${config.security.csrf ? "Activée" : "Désactivée"}`
  );
  instructions.push(
    `   - Rate limiting: ${config.security.rateLimit ? "Activé" : "Désactivé"}`
  );
  instructions.push("");

  // Utilisation
  instructions.push("8. **Utilisation dans les composants :**");
  instructions.push("   ```tsx");
  instructions.push('   import { useAuth } from "@/hooks/use-auth";');
  instructions.push(
    '   import { AuthGuard } from "@/components/auth/auth-guard";'
  );
  instructions.push("   ");
  instructions.push("   function MyComponent() {");
  instructions.push("     const { user, isAuthenticated } = useAuth();");
  instructions.push("     return <div>{user?.name}</div>;");
  instructions.push("   }");
  instructions.push("   ```");

  return instructions;
}
