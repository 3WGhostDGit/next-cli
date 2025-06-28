/**
 * Templates des pages d'authentification
 * Génère les pages Next.js pour l'authentification
 */

import { AuthConfig } from './index';
import { FileTemplate } from '../types';

/**
 * Génère la page de connexion
 */
export const generateLoginPage = (config: AuthConfig): FileTemplate => {
  return {
    path: 'app/(auth)/login/page.tsx',
    content: `import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            ${config.projectName}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Bienvenue ! Connectez-vous pour continuer.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}`,
  };
};

/**
 * Génère la page d'inscription
 */
export const generateSignupPage = (config: AuthConfig): FileTemplate => {
  return {
    path: 'app/(auth)/signup/page.tsx',
    content: `import { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Inscription",
  description: "Créez votre compte",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            ${config.projectName}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Créez votre compte pour commencer.
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}`,
  };
};

/**
 * Génère la page de mot de passe oublié
 */
export const generateForgotPasswordPage = (config: AuthConfig): FileTemplate => {
  if (!config.features.includes('password-reset')) {
    return {
      path: 'app/(auth)/forgot-password/page.tsx',
      content: `// Fonctionnalité de réinitialisation de mot de passe non activée
export default function ForgotPasswordPage() {
  return null;
}`,
    };
  }

  return {
    path: 'app/(auth)/forgot-password/page.tsx',
    content: `"use client";

import { useState } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/ui/icons";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error } = await authClient.forgetPassword({
        email,
        redirectTo: \`\${window.location.origin}/reset-password\`,
      });

      if (error) {
        setError(error.message || "Une erreur s'est produite");
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Email envoyé</CardTitle>
            <CardDescription>
              Vérifiez votre boîte mail pour réinitialiser votre mot de passe
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Un lien de réinitialisation a été envoyé à <strong>{email}</strong>
            </p>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Retour à la connexion
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Mot de passe oublié</CardTitle>
          <CardDescription className="text-center">
            Entrez votre email pour recevoir un lien de réinitialisation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer le lien
            </Button>
          </form>

          <div className="text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">
              Retour à la connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}`,
  };
};

/**
 * Génère la page de vérification d'email
 */
export const generateVerifyEmailPage = (config: AuthConfig): FileTemplate => {
  if (!config.features.includes('email-verification')) {
    return {
      path: 'app/(auth)/verify-email/page.tsx',
      content: `// Fonctionnalité de vérification d'email non activée
export default function VerifyEmailPage() {
  return null;
}`,
    };
  }

  return {
    path: 'app/(auth)/verify-email/page.tsx',
    content: `"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/ui/icons";
import { authClient } from "@/lib/auth-client";

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const { error } = await authClient.verifyEmail({
        query: { token },
      });

      if (error) {
        setError(error.message || "Erreur de vérification");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("${config.ui.redirectAfterLogin}");
      }, 3000);
    } catch (err) {
      setError("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-6">
            <Icons.spinner className="h-6 w-6 animate-spin" />
            <span className="ml-2">Vérification en cours...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {success ? "Email vérifié !" : "Vérification d'email"}
          </CardTitle>
          <CardDescription>
            {success 
              ? "Votre email a été vérifié avec succès"
              : "Vérifiez votre boîte mail"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <AlertDescription>
                Redirection automatique vers le tableau de bord...
              </AlertDescription>
            </Alert>
          )}
          
          {!token && !success && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Un email de vérification a été envoyé à votre adresse.
                Cliquez sur le lien dans l'email pour activer votre compte.
              </p>
              <Button onClick={() => router.push("/login")} variant="outline" className="w-full">
                Retour à la connexion
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}`,
  };
};

/**
 * Génère la page de dashboard protégée
 */
export const generateDashboardPage = (config: AuthConfig): FileTemplate => {
  return {
    path: 'app/dashboard/page.tsx',
    content: `import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserMenu } from "@/components/auth/user-menu";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Dashboard
            </h1>
            <UserMenu user={session.user} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bienvenue !</CardTitle>
                <CardDescription>
                  Vous êtes connecté avec succès
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  <strong>Nom :</strong> {session.user.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Email :</strong> {session.user.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>ID :</strong> {session.user.id}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session</CardTitle>
                <CardDescription>
                  Informations de votre session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  <strong>Session ID :</strong> {session.id}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Expire le :</strong> {new Date(session.expiresAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Actions disponibles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="/dashboard/profile" className="block text-sm text-primary hover:underline">
                  Modifier le profil
                </a>
                <a href="/dashboard/settings" className="block text-sm text-primary hover:underline">
                  Paramètres
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}`,
  };
};
