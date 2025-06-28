/**
 * Templates des composants d'authentification
 * Génère les composants UI pour l'authentification avec shadcn/ui
 */

import { FileTemplate } from "../types";
import { AuthConfig } from "./index";

/**
 * Génère le composant de formulaire de connexion
 */
export const generateLoginForm = (config: AuthConfig): FileTemplate => {
  const socialProviders = config.providers.filter((p) => p !== "email");

  return {
    path: "src/components/auth/login-form.tsx",
    content: `"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/ui/icons";
import { authClient } from "@/lib/auth-client";
import { SocialLogin } from "./social-login";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "${
    config.ui.redirectAfterLogin
  }";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: callbackUrl,
      });

      if (error) {
        setError(error.message || "Une erreur s'est produite");
        return;
      }

      if (data?.session) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Connexion</CardTitle>
        <CardDescription className="text-center">
          Connectez-vous à votre compte
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        ${
          socialProviders.length > 0
            ? `<SocialLogin />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou continuer avec
            </span>
          </div>
        </div>`
            : ""
        }

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
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              ${
                config.features.includes("password-reset")
                  ? `<Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Mot de passe oublié ?
              </Link>`
                  : ""
              }
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Se connecter
          </Button>
        </form>

        <div className="text-center text-sm">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            S'inscrire
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}`,
  };
};

/**
 * Génère le composant de formulaire d'inscription
 */
export const generateSignupForm = (config: AuthConfig): FileTemplate => {
  const socialProviders = config.providers.filter((p) => p !== "email");

  return {
    path: "src/components/auth/signup-form.tsx",
    content: `"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/ui/icons";
import { authClient } from "@/lib/auth-client";
import { SocialLogin } from "./social-login";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (password.length < ${config.security.minPasswordLength}) {
      setError(\`Le mot de passe doit contenir au moins \${${
        config.security.minPasswordLength
      }} caractères\`);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: "${config.ui.redirectAfterLogin}",
      });

      if (error) {
        setError(error.message || "Une erreur s'est produite");
        return;
      }

      if (data?.session) {
        ${
          config.security.requireEmailVerification
            ? `
        setSuccess("Compte créé ! Vérifiez votre email pour activer votre compte.");
        setTimeout(() => {
          router.push("/verify-email");
        }, 2000);`
            : `
        router.push("${config.ui.redirectAfterLogin}");
        router.refresh();`
        }
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Inscription</CardTitle>
        <CardDescription className="text-center">
          Créez votre compte
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
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        ${
          socialProviders.length > 0
            ? `<SocialLogin />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou continuer avec
            </span>
          </div>
        </div>`
            : ""
        }

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              type="text"
              placeholder="Votre nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
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
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Minimum ${config.security.minPasswordLength} caractères
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Créer un compte
          </Button>
        </form>

        <div className="text-center text-sm">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Se connecter
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}`,
  };
};

/**
 * Génère le composant de connexion sociale
 */
export const generateSocialLogin = (config: AuthConfig): FileTemplate => {
  const socialProviders = config.providers.filter((p) => p !== "email");

  if (socialProviders.length === 0) {
    return {
      path: "src/components/auth/social-login.tsx",
      content: `// Aucun provider social configuré
export function SocialLogin() {
  return null;
}`,
    };
  }

  const providerButtons = socialProviders
    .map((provider) => {
      const providerNames: Record<string, string> = {
        github: "GitHub",
        google: "Google",
        discord: "Discord",
        microsoft: "Microsoft",
      };
      const providerName =
        providerNames[provider] ||
        provider.charAt(0).toUpperCase() + provider.slice(1);

      return `
          <Button
            variant="outline"
            onClick={() => handleSocialLogin("${provider}")}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading === "${provider}" && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            <Icons.${provider} className="mr-2 h-4 w-4" />
            Continuer avec ${providerName}
          </Button>`;
    })
    .join("");

  return {
    path: "src/components/auth/social-login.tsx",
    content: `"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { authClient } from "@/lib/auth-client";

export function SocialLogin() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "${config.ui.redirectAfterLogin}";

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(provider);
    
    try {
      await authClient.signIn.social({
        provider: provider as any,
        callbackURL: callbackUrl,
      });
    } catch (error) {
      console.error(\`Erreur de connexion \${provider}:\`, error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-2">${providerButtons}
    </div>
  );
}`,
  };
};
