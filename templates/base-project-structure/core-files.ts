/**
 * Templates des fichiers core pour la structure de base
 * Basé sur les patterns Next.js App Router et les meilleures pratiques
 */

import { FileTemplate } from "../types";

// Interface for the base project configuration
export interface BaseProjectConfig {
  projectName: string;
  useTypeScript: boolean;
  useSrcDirectory: boolean;
  useAppRouter: boolean;
  packageManager: "npm" | "yarn" | "pnpm" | "bun";
}

/**
 * Génère le Root Layout (app/layout.tsx)
 */
export const generateRootLayout = (config: BaseProjectConfig): FileTemplate => {
  return {
    path: "app/layout.tsx",
    content: `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: '${config.projectName}',
    template: '%s | ${config.projectName}',
  },
  description: 'Une application Next.js moderne avec App Router',
  keywords: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: '${config.projectName}',
    description: 'Une application Next.js moderne avec App Router',
    siteName: '${config.projectName}',
  },
  twitter: {
    card: 'summary_large_image',
    title: '${config.projectName}',
    description: 'Une application Next.js moderne avec App Router',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}`,
  };
};

/**
 * Génère la page d'accueil (app/page.tsx)
 */
export const generateHomePage = (config: BaseProjectConfig): FileTemplate => {
  return {
    path: "app/page.tsx",
    content: `import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-6xl">
            Bienvenue sur{' '}
            <span className="text-blue-600 dark:text-blue-400">${config.projectName}</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
            Une application Next.js moderne avec App Router, TypeScript, Tailwind CSS, et shadcn/ui
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild>
              <Link href="/dashboard">Commencer</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/docs">Documentation</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>⚡ Next.js 15</CardTitle>
              <CardDescription>
                App Router avec Server Components et streaming
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Profitez des dernières fonctionnalités de Next.js avec l'App Router,
                les Server Components, et les optimisations de performance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎨 shadcn/ui</CardTitle>
              <CardDescription>
                Composants UI modernes et accessibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Interface utilisateur construite avec shadcn/ui et Tailwind CSS
                pour une expérience moderne et responsive.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔐 Better Auth</CardTitle>
              <CardDescription>
                Authentification sécurisée et moderne
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Système d'authentification complet avec support des providers
                sociaux et gestion des sessions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🗄️ Prisma ORM</CardTitle>
              <CardDescription>
                Base de données type-safe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                ORM moderne avec génération de types automatique et migrations
                pour une base de données robuste.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>✅ Validation Zod</CardTitle>
              <CardDescription>
                Validation de données robuste
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Validation côté client et serveur avec Zod et React Hook Form
                pour des formulaires fiables.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🧪 Tests Intégrés</CardTitle>
              <CardDescription>
                Suite de tests complète
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Tests unitaires avec Jest et tests E2E avec Playwright pour
                une application fiable.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}`,
  };
};

/**
 * Génère le fichier de styles globaux (app/globals.css) pour Tailwind CSS v4
 */
export const generateGlobalStyles = (): FileTemplate => {
  return {
    path: "app/globals.css",
    content: `@import "tailwindcss";

@theme {
  /* Couleurs personnalisées pour shadcn/ui */
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(222.2 84% 4.9%);
  --color-card: hsl(0 0% 100%);
  --color-card-foreground: hsl(222.2 84% 4.9%);
  --color-popover: hsl(0 0% 100%);
  --color-popover-foreground: hsl(222.2 84% 4.9%);
  --color-primary: hsl(221.2 83.2% 53.3%);
  --color-primary-foreground: hsl(210 40% 98%);
  --color-secondary: hsl(210 40% 96%);
  --color-secondary-foreground: hsl(222.2 84% 4.9%);
  --color-muted: hsl(210 40% 96%);
  --color-muted-foreground: hsl(215.4 16.3% 46.9%);
  --color-accent: hsl(210 40% 96%);
  --color-accent-foreground: hsl(222.2 84% 4.9%);
  --color-destructive: hsl(0 84.2% 60.2%);
  --color-destructive-foreground: hsl(210 40% 98%);
  --color-border: hsl(214.3 31.8% 91.4%);
  --color-input: hsl(214.3 31.8% 91.4%);
  --color-ring: hsl(221.2 83.2% 53.3%);

  /* Couleurs dark mode */
  --color-background-dark: hsl(222.2 84% 4.9%);
  --color-foreground-dark: hsl(210 40% 98%);
  --color-card-dark: hsl(222.2 84% 4.9%);
  --color-card-foreground-dark: hsl(210 40% 98%);
  --color-popover-dark: hsl(222.2 84% 4.9%);
  --color-popover-foreground-dark: hsl(210 40% 98%);
  --color-primary-dark: hsl(217.2 91.2% 59.8%);
  --color-primary-foreground-dark: hsl(222.2 84% 4.9%);
  --color-secondary-dark: hsl(217.2 32.6% 17.5%);
  --color-secondary-foreground-dark: hsl(210 40% 98%);
  --color-muted-dark: hsl(217.2 32.6% 17.5%);
  --color-muted-foreground-dark: hsl(215 20.2% 65.1%);
  --color-accent-dark: hsl(217.2 32.6% 17.5%);
  --color-accent-foreground-dark: hsl(210 40% 98%);
  --color-destructive-dark: hsl(0 62.8% 30.6%);
  --color-destructive-foreground-dark: hsl(210 40% 98%);
  --color-border-dark: hsl(217.2 32.6% 17.5%);
  --color-input-dark: hsl(217.2 32.6% 17.5%);
  --color-ring-dark: hsl(224.3 76.3% 94.1%);

  /* Border radius */
  --radius: 0.5rem;

  /* Breakpoints personnalisés */
  --breakpoint-3xl: 1920px;

  /* Animations personnalisées */
  --animate-fade-in: fadeIn 0.5s ease-in-out;
  --animate-slide-up: slideUp 0.5s ease-out;
}

/* Utilitaires personnalisés */
@utility container {
  max-width: 1400px;
  margin-inline: auto;
  padding-inline: 2rem;
}

@utility animate-fade-in {
  animation: var(--animate-fade-in);
}

@utility animate-slide-up {
  animation: var(--animate-slide-up);
}

/* Dark mode avec class strategy */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--color-background-dark);
    --color-foreground: var(--color-foreground-dark);
    --color-card: var(--color-card-dark);
    --color-card-foreground: var(--color-card-foreground-dark);
    --color-popover: var(--color-popover-dark);
    --color-popover-foreground: var(--color-popover-foreground-dark);
    --color-primary: var(--color-primary-dark);
    --color-primary-foreground: var(--color-primary-foreground-dark);
    --color-secondary: var(--color-secondary-dark);
    --color-secondary-foreground: var(--color-secondary-foreground-dark);
    --color-muted: var(--color-muted-dark);
    --color-muted-foreground: var(--color-muted-foreground-dark);
    --color-accent: var(--color-accent-dark);
    --color-accent-foreground: var(--color-accent-foreground-dark);
    --color-destructive: var(--color-destructive-dark);
    --color-destructive-foreground: var(--color-destructive-foreground-dark);
    --color-border: var(--color-border-dark);
    --color-input: var(--color-input-dark);
    --color-ring: var(--color-ring-dark);
  }
}

.dark {
  --color-background: var(--color-background-dark);
  --color-foreground: var(--color-foreground-dark);
  --color-card: var(--color-card-dark);
  --color-card-foreground: var(--color-card-foreground-dark);
  --color-popover: var(--color-popover-dark);
  --color-popover-foreground: var(--color-popover-foreground-dark);
  --color-primary: var(--color-primary-dark);
  --color-primary-foreground: var(--color-primary-foreground-dark);
  --color-secondary: var(--color-secondary-dark);
  --color-secondary-foreground: var(--color-secondary-foreground-dark);
  --color-muted: var(--color-muted-dark);
  --color-muted-foreground: var(--color-muted-foreground-dark);
  --color-accent: var(--color-accent-dark);
  --color-accent-foreground: var(--color-accent-foreground-dark);
  --color-destructive: var(--color-destructive-dark);
  --color-destructive-foreground: var(--color-destructive-foreground-dark);
  --color-border: var(--color-border-dark);
  --color-input: var(--color-input-dark);
  --color-ring: var(--color-ring-dark);
}

/* Keyframes pour les animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Base styles */
* {
  border-color: var(--color-border);
}

body {
  background-color: var(--color-background);
  color: var(--color-foreground);
}`,
  };
};

/**
 * Génère la page de chargement (app/loading.tsx)
 */
export const generateLoadingPage = (): FileTemplate => {
  return {
    path: "app/loading.tsx",
    content: `export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-sm text-slate-600 dark:text-slate-300">Chargement...</p>
      </div>
    </div>
  );
}`,
  };
};

/**
 * Génère la page d'erreur (app/error.tsx)
 */
export const generateErrorPage = (): FileTemplate => {
  return {
    path: "app/error.tsx",
    content: `'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log l'erreur vers un service de monitoring
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-red-600">Une erreur s'est produite</CardTitle>
          <CardDescription>
            Quelque chose s'est mal passé. Veuillez réessayer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-200 font-mono">
                {error.message}
              </p>
            </div>
          )}
          <div className="flex flex-col space-y-2">
            <Button onClick={reset} className="w-full">
              Réessayer
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'} className="w-full">
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}`,
  };
};

/**
 * Génère la page 404 (app/not-found.tsx)
 */
export const generateNotFoundPage = (): FileTemplate => {
  return {
    path: "app/not-found.tsx",
    content: `import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-slate-400">404</CardTitle>
          <CardDescription className="text-lg">Page non trouvée</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <div className="flex flex-col space-y-2">
            <Button asChild>
              <Link href="/">Retour à l'accueil</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Tableau de bord</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}`,
  };
};
