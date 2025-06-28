/**
 * Templates des hooks et utilitaires d'authentification
 * Génère les hooks React et utilitaires pour l'authentification
 */

import { AuthConfig } from './index';
import { FileTemplate } from '../types';

/**
 * Génère le hook d'authentification principal
 */
export const generateUseAuth = (config: AuthConfig): FileTemplate => {
  return {
    path: 'src/hooks/use-auth.ts',
    content: `"use client";

import { useSession } from "@/lib/auth-client";

export function useAuth() {
  const { data: session, isPending, error } = useSession();

  return {
    user: session?.user ?? null,
    session: session ?? null,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    error,
  };
}

export type AuthUser = NonNullable<ReturnType<typeof useAuth>['user']>;
export type AuthSession = NonNullable<ReturnType<typeof useAuth>['session']>;`,
  };
};

/**
 * Génère le composant AuthGuard pour protéger les composants
 */
export const generateAuthGuard = (config: AuthConfig): FileTemplate => {
  return {
    path: 'src/components/auth/auth-guard.tsx',
    content: `"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Icons } from "@/components/ui/icons";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  fallback,
  redirectTo = "/login" 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Icons.spinner className="h-6 w-6 animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * HOC pour protéger les pages
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string;
    fallback?: React.ReactNode;
  }
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard 
        redirectTo={options?.redirectTo}
        fallback={options?.fallback}
      >
        <Component {...props} />
      </AuthGuard>
    );
  };
}`,
  };
};

/**
 * Génère le composant UserMenu
 */
export const generateUserMenu = (config: AuthConfig): FileTemplate => {
  return {
    path: 'src/components/auth/user-menu.tsx',
    content: `"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/ui/icons";
import { authClient } from "@/lib/auth-client";
import type { User } from "@/lib/auth";

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("${config.ui.redirectAfterLogout}");
            router.refresh();
          },
        },
      });
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
            <AvatarFallback>
              {user.name ? getInitials(user.name) : "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || "Utilisateur"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile">
            <Icons.user className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Icons.settings className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isLoading}
          className="cursor-pointer"
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.logOut className="mr-2 h-4 w-4" />
          )}
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}`,
  };
};

/**
 * Génère les types TypeScript pour l'authentification
 */
export const generateAuthTypes = (config: AuthConfig): FileTemplate => {
  return {
    path: 'shared/types/auth.ts',
    content: `/**
 * Types d'authentification
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  id: string;
  userId: string;
  expiresAt: Date;
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
  callbackUrl?: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  callbackUrl?: string;
}

export interface ForgotPasswordData {
  email: string;
  redirectTo?: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthResponse<T = any> {
  data?: T;
  error?: AuthError;
}

// Types pour les providers sociaux
export type SocialProvider = ${config.providers.filter(p => p !== 'email').map(p => `'${p}'`).join(' | ') || 'never'};

// Types pour les fonctionnalités
export interface AuthFeatures {
  emailVerification: ${config.features.includes('email-verification')};
  passwordReset: ${config.features.includes('password-reset')};
  socialLogin: ${config.features.includes('social-login')};
  twoFactor: ${config.features.includes('2fa')};
  passkey: ${config.features.includes('passkey')};
  multiSession: ${config.features.includes('multi-session')};
  organizations: ${config.features.includes('organizations')};
}

// Types pour les permissions (si organisations activées)
${config.features.includes('organizations') ? `
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: OrganizationRole;
  user: AuthUser;
  organization: Organization;
  createdAt: Date;
}

export type OrganizationRole = 'owner' | 'admin' | 'member';

export interface OrganizationInvitation {
  id: string;
  email: string;
  organizationId: string;
  role: OrganizationRole;
  status: 'pending' | 'accepted' | 'rejected';
  expiresAt: Date;
  createdAt: Date;
}` : ''}`,
  };
};

/**
 * Génère les schémas de validation Zod pour l'authentification
 */
export const generateAuthValidation = (config: AuthConfig): FileTemplate => {
  return {
    path: 'shared/validation/auth.ts',
    content: `import { z } from "zod";

/**
 * Schémas de validation pour l'authentification
 */

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis"),
  callbackUrl: z.string().optional(),
});

export const signupSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
  password: z
    .string()
    .min(${config.security.minPasswordLength}, \`Le mot de passe doit contenir au moins \${${config.security.minPasswordLength}} caractères\`)
    .max(${config.security.maxPasswordLength}, \`Le mot de passe ne peut pas dépasser \${${config.security.maxPasswordLength}} caractères\`)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
    ),
  confirmPassword: z.string(),
  callbackUrl: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
  redirectTo: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token requis"),
  password: z
    .string()
    .min(${config.security.minPasswordLength}, \`Le mot de passe doit contenir au moins \${${config.security.minPasswordLength}} caractères\`)
    .max(${config.security.maxPasswordLength}, \`Le mot de passe ne peut pas dépasser \${${config.security.maxPasswordLength}} caractères\`)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
  newPassword: z
    .string()
    .min(${config.security.minPasswordLength}, \`Le nouveau mot de passe doit contenir au moins \${${config.security.minPasswordLength}} caractères\`)
    .max(${config.security.maxPasswordLength}, \`Le nouveau mot de passe ne peut pas dépasser \${${config.security.maxPasswordLength}} caractères\`)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
    ),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Les nouveaux mots de passe ne correspondent pas",
  path: ["confirmNewPassword"],
});

// Types inférés
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;`,
  };
};
