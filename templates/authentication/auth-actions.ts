/**
 * Templates des Server Actions pour l'authentification
 * Génère les actions serveur pour l'authentification avec Better Auth
 */

import { AuthConfig } from './index';
import { FileTemplate } from '../types';

/**
 * Génère les Server Actions de connexion
 */
export const generateLoginAction = (config: AuthConfig): FileTemplate => {
  return {
    path: 'src/services/auth/login.ts',
    content: `"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { loginSchema } from "@/shared/validation/auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = formData.get("callbackUrl") as string || "${config.ui.redirectAfterLogin}";

  // Validation des données
  const result = loginSchema.safeParse({ email, password, callbackUrl });
  
  if (!result.success) {
    return {
      error: result.error.errors[0]?.message || "Données invalides",
    };
  }

  try {
    const session = await auth.api.signInEmail({
      body: {
        email: result.data.email,
        password: result.data.password,
      },
      headers: await headers(),
    });

    if (!session) {
      return {
        error: "Email ou mot de passe incorrect",
      };
    }

    // Redirection après connexion réussie
    redirect(callbackUrl);
  } catch (error) {
    console.error("Erreur de connexion:", error);
    return {
      error: "Une erreur s'est produite lors de la connexion",
    };
  }
}

export async function loginWithProviderAction(
  provider: string,
  callbackUrl?: string
) {
  try {
    const url = await auth.api.getSession({
      headers: await headers(),
    });

    // Redirection vers le provider OAuth
    redirect(\`/api/auth/signin/\${provider}?callbackUrl=\${encodeURIComponent(callbackUrl || "${config.ui.redirectAfterLogin}")}\`);
  } catch (error) {
    console.error(\`Erreur de connexion \${provider}:\`, error);
    return {
      error: \`Erreur de connexion avec \${provider}\`,
    };
  }
}`,
  };
};

/**
 * Génère les Server Actions d'inscription
 */
export const generateSignupAction = (config: AuthConfig): FileTemplate => {
  return {
    path: 'src/services/auth/signup.ts',
    content: `"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { signupSchema } from "@/shared/validation/auth";

export async function signupAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const callbackUrl = formData.get("callbackUrl") as string || "${config.ui.redirectAfterLogin}";

  // Validation des données
  const result = signupSchema.safeParse({ 
    name, 
    email, 
    password, 
    confirmPassword, 
    callbackUrl 
  });
  
  if (!result.success) {
    return {
      error: result.error.errors[0]?.message || "Données invalides",
    };
  }

  try {
    const session = await auth.api.signUpEmail({
      body: {
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
      },
      headers: await headers(),
    });

    if (!session) {
      return {
        error: "Erreur lors de la création du compte",
      };
    }

    ${config.security.requireEmailVerification ? `
    // Si la vérification d'email est requise
    return {
      success: true,
      message: "Compte créé ! Vérifiez votre email pour l'activer.",
      redirectTo: "/verify-email",
    };` : `
    // Redirection directe après inscription
    redirect(callbackUrl);`}
  } catch (error: any) {
    console.error("Erreur d'inscription:", error);
    
    // Gestion des erreurs spécifiques
    if (error.message?.includes("email")) {
      return {
        error: "Cette adresse email est déjà utilisée",
      };
    }
    
    return {
      error: "Une erreur s'est produite lors de l'inscription",
    };
  }
}`,
  };
};

/**
 * Génère les Server Actions de déconnexion
 */
export const generateLogoutAction = (config: AuthConfig): FileTemplate => {
  return {
    path: 'src/services/auth/logout.ts',
    content: `"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function logoutAction() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });

    // Redirection après déconnexion
    redirect("${config.ui.redirectAfterLogout}");
  } catch (error) {
    console.error("Erreur de déconnexion:", error);
    return {
      error: "Une erreur s'est produite lors de la déconnexion",
    };
  }
}

export async function logoutAllSessionsAction() {
  try {
    // Déconnexion de toutes les sessions
    await auth.api.signOut({
      headers: await headers(),
    });

    // TODO: Implémenter la déconnexion de toutes les sessions
    // Cela nécessite une implémentation personnalisée avec Better Auth

    redirect("${config.ui.redirectAfterLogout}");
  } catch (error) {
    console.error("Erreur de déconnexion globale:", error);
    return {
      error: "Une erreur s'est produite lors de la déconnexion",
    };
  }
}`,
  };
};

/**
 * Génère les Server Actions de réinitialisation de mot de passe
 */
export const generatePasswordResetActions = (config: AuthConfig): FileTemplate => {
  if (!config.features.includes('password-reset')) {
    return {
      path: 'src/services/auth/password-reset.ts',
      content: `// Fonctionnalité de réinitialisation de mot de passe non activée`,
    };
  }

  return {
    path: 'src/services/auth/password-reset.ts',
    content: `"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { forgotPasswordSchema, resetPasswordSchema } from "@/shared/validation/auth";

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;
  const redirectTo = formData.get("redirectTo") as string || \`\${process.env.NEXT_PUBLIC_APP_URL}/reset-password\`;

  // Validation des données
  const result = forgotPasswordSchema.safeParse({ email, redirectTo });
  
  if (!result.success) {
    return {
      error: result.error.errors[0]?.message || "Email invalide",
    };
  }

  try {
    await auth.api.forgetPassword({
      body: {
        email: result.data.email,
        redirectTo: result.data.redirectTo,
      },
      headers: await headers(),
    });

    return {
      success: true,
      message: "Un email de réinitialisation a été envoyé",
    };
  } catch (error: any) {
    console.error("Erreur mot de passe oublié:", error);
    
    // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
    return {
      success: true,
      message: "Si cette adresse email existe, un lien de réinitialisation a été envoyé",
    };
  }
}

export async function resetPasswordAction(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validation des données
  const result = resetPasswordSchema.safeParse({ 
    token, 
    password, 
    confirmPassword 
  });
  
  if (!result.success) {
    return {
      error: result.error.errors[0]?.message || "Données invalides",
    };
  }

  try {
    await auth.api.resetPassword({
      body: {
        token: result.data.token,
        password: result.data.password,
      },
      headers: await headers(),
    });

    return {
      success: true,
      message: "Mot de passe réinitialisé avec succès",
      redirectTo: "/login",
    };
  } catch (error: any) {
    console.error("Erreur réinitialisation mot de passe:", error);
    
    if (error.message?.includes("token")) {
      return {
        error: "Lien de réinitialisation invalide ou expiré",
      };
    }
    
    return {
      error: "Une erreur s'est produite lors de la réinitialisation",
    };
  }
}`,
  };
};

/**
 * Génère les Server Actions de gestion de profil
 */
export const generateProfileActions = (config: AuthConfig): FileTemplate => {
  return {
    path: 'src/services/auth/profile.ts',
    content: `"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { updateProfileSchema, changePasswordSchema } from "@/shared/validation/auth";

export async function updateProfileAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  // Validation des données
  const result = updateProfileSchema.safeParse({ name, email });
  
  if (!result.success) {
    return {
      error: result.error.errors[0]?.message || "Données invalides",
    };
  }

  try {
    // Vérifier la session actuelle
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        error: "Session expirée",
      };
    }

    // Mettre à jour le profil
    await auth.api.updateUser({
      body: {
        name: result.data.name,
        email: result.data.email,
      },
      headers: await headers(),
    });

    // Revalider la page
    revalidatePath("/dashboard/profile");

    return {
      success: true,
      message: "Profil mis à jour avec succès",
    };
  } catch (error: any) {
    console.error("Erreur mise à jour profil:", error);
    
    if (error.message?.includes("email")) {
      return {
        error: "Cette adresse email est déjà utilisée",
      };
    }
    
    return {
      error: "Une erreur s'est produite lors de la mise à jour",
    };
  }
}

export async function changePasswordAction(formData: FormData) {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmNewPassword = formData.get("confirmNewPassword") as string;

  // Validation des données
  const result = changePasswordSchema.safeParse({ 
    currentPassword, 
    newPassword, 
    confirmNewPassword 
  });
  
  if (!result.success) {
    return {
      error: result.error.errors[0]?.message || "Données invalides",
    };
  }

  try {
    // Vérifier la session actuelle
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        error: "Session expirée",
      };
    }

    // Changer le mot de passe
    await auth.api.changePassword({
      body: {
        currentPassword: result.data.currentPassword,
        newPassword: result.data.newPassword,
      },
      headers: await headers(),
    });

    return {
      success: true,
      message: "Mot de passe modifié avec succès",
    };
  } catch (error: any) {
    console.error("Erreur changement mot de passe:", error);
    
    if (error.message?.includes("current")) {
      return {
        error: "Mot de passe actuel incorrect",
      };
    }
    
    return {
      error: "Une erreur s'est produite lors du changement de mot de passe",
    };
  }
}`,
  };
};
