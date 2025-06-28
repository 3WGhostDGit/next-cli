/**
 * Générateur de layouts App Router avec navigation
 * Crée des layouts complets avec sidebar, header, breadcrumbs et protection
 */

import { NavigationConfig, LayoutConfig } from './index';
import { FileTemplate } from '../types';

/**
 * Générateur de layouts
 */
export class LayoutGenerator {
  constructor(private config: NavigationConfig) {}

  /**
   * Génère tous les layouts nécessaires
   */
  generate(): FileTemplate[] {
    const files: FileTemplate[] = [];

    // Layout racine
    files.push(this.generateRootLayout());

    // Layout principal selon le type
    switch (this.config.layout.type) {
      case 'sidebar':
      case 'dashboard':
        files.push(this.generateSidebarLayout());
        break;
      case 'header':
        files.push(this.generateHeaderLayout());
        break;
      case 'hybrid':
        files.push(this.generateHybridLayout());
        break;
    }

    // Layouts spécialisés
    if (this.config.security.middleware.adminRoutes.length > 0) {
      files.push(this.generateAdminLayout());
    }

    return files;
  }

  /**
   * Génère le layout racine (app/layout.tsx)
   */
  private generateRootLayout(): FileTemplate {
    return {
      path: 'app/layout.tsx',
      content: `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
${this.config.features.includes('theme-switcher') ? 'import { ThemeProvider } from "@/components/theme-provider";' : ''}
${this.config.features.includes('notifications') ? 'import { Toaster } from "sonner";' : ''}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "${this.config.name}",
  description: "${this.config.description}",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        ${this.config.features.includes('theme-switcher') ? `<ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          ${this.config.features.includes('notifications') ? '<Toaster />' : ''}
        </ThemeProvider>` : `{children}
        ${this.config.features.includes('notifications') ? '<Toaster />' : ''}`}
      </body>
    </html>
  );
}`,
    };
  }

  /**
   * Génère le layout avec sidebar
   */
  private generateSidebarLayout(): FileTemplate {
    const protectedPath = this.config.security.middleware.protectedRoutes[0] || '/dashboard';
    const layoutPath = protectedPath === '/dashboard' ? 'app/(dashboard)/layout.tsx' : `app${protectedPath}/layout.tsx`;

    return {
      path: layoutPath,
      content: `import { AppSidebar } from "@/components/navigation/app-sidebar";
import { Header } from "@/components/navigation/header";
${this.config.features.includes('breadcrumbs') ? 'import { Breadcrumbs } from "@/components/navigation/breadcrumbs";' : ''}
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
${this.config.security.authentication ? 'import { auth } from "@/lib/auth";' : ''}
${this.config.security.authentication ? 'import { redirect } from "next/navigation";' : ''}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  ${this.config.security.authentication ? `// Vérification de l'authentification côté serveur
  const session = await auth.api.getSession();
  
  if (!session) {
    redirect("/login");
  }` : ''}

  return (
    <SidebarProvider>
      <AppSidebar ${this.config.security.authentication ? 'user={session.user}' : ''} />
      <SidebarInset>
        <Header ${this.config.security.authentication ? 'user={session.user}' : ''} />
        ${this.config.features.includes('breadcrumbs') ? '<Breadcrumbs />' : ''}
        <main className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}`,
    };
  }

  /**
   * Génère le layout avec header
   */
  private generateHeaderLayout(): FileTemplate {
    return {
      path: 'app/(main)/layout.tsx',
      content: `import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
${this.config.features.includes('breadcrumbs') ? 'import { Breadcrumbs } from "@/components/navigation/breadcrumbs";' : ''}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      ${this.config.features.includes('breadcrumbs') ? '<Breadcrumbs />' : ''}
      <main className="flex-1 ${this.config.layout.maxWidth ? `container mx-auto max-w-${this.config.layout.maxWidth}` : 'container mx-auto'} ${this.getPaddingClass()}">
        {children}
      </main>
      <Footer />
    </div>
  );
}`,
    };
  }

  /**
   * Génère le layout hybride
   */
  private generateHybridLayout(): FileTemplate {
    return {
      path: 'app/(app)/layout.tsx',
      content: `"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { Header } from "@/components/navigation/header";
${this.config.features.includes('breadcrumbs') ? 'import { Breadcrumbs } from "@/components/navigation/breadcrumbs";' : ''}
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/use-media-query";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      {isDesktop ? (
        <>
          <AppSidebar />
          <SidebarInset>
            <Header />
            ${this.config.features.includes('breadcrumbs') ? '<Breadcrumbs />' : ''}
            <main className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </SidebarInset>
        </>
      ) : (
        <div className="min-h-screen flex flex-col">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <AppSidebar />
          ${this.config.features.includes('breadcrumbs') ? '<Breadcrumbs />' : ''}
          <main className="flex-1 p-4">
            {children}
          </main>
        </div>
      )}
    </SidebarProvider>
  );
}`,
    };
  }

  /**
   * Génère le layout admin
   */
  private generateAdminLayout(): FileTemplate {
    const adminPath = this.config.security.middleware.adminRoutes[0] || '/admin';

    return {
      path: `app${adminPath}/layout.tsx`,
      content: `import { AdminSidebar } from "@/components/navigation/admin-sidebar";
import { AdminHeader } from "@/components/navigation/admin-header";
${this.config.features.includes('breadcrumbs') ? 'import { Breadcrumbs } from "@/components/navigation/breadcrumbs";' : ''}
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vérification de l'authentification et des permissions admin
  const session = await auth.api.getSession();
  
  if (!session) {
    redirect("/login");
  }

  // Vérifier les rôles admin
  const userRoles = session.user.roles || [];
  const hasAdminRole = userRoles.some((role: string) => 
    ['admin', 'superAdmin'].includes(role)
  );

  if (!hasAdminRole) {
    redirect("/unauthorized");
  }

  return (
    <SidebarProvider>
      <AdminSidebar user={session.user} />
      <SidebarInset>
        <AdminHeader user={session.user} />
        ${this.config.features.includes('breadcrumbs') ? '<Breadcrumbs />' : ''}
        <main className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              {children}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}`,
    };
  }

  /**
   * Retourne la classe CSS pour le padding
   */
  private getPaddingClass(): string {
    switch (this.config.layout.padding) {
      case 'none': return '';
      case 'sm': return 'p-2 md:p-4';
      case 'md': return 'p-4 md:p-6';
      case 'lg': return 'p-6 md:p-8 lg:p-10';
      default: return 'p-4 md:p-6';
    }
  }
}

/**
 * Générateur de pages d'erreur et de statut
 */
export class ErrorPagesGenerator {
  constructor(private config: NavigationConfig) {}

  /**
   * Génère toutes les pages d'erreur nécessaires
   */
  generate(): FileTemplate[] {
    const files: FileTemplate[] = [];

    // Page 404
    files.push(this.generateNotFoundPage());

    // Page d'erreur générale
    files.push(this.generateErrorPage());

    // Page non autorisé
    if (this.config.security.authorization) {
      files.push(this.generateUnauthorizedPage());
    }

    // Page de chargement globale
    files.push(this.generateLoadingPage());

    return files;
  }

  /**
   * Génère la page 404
   */
  private generateNotFoundPage(): FileTemplate {
    return {
      path: 'app/not-found.tsx',
      content: `import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
          <h2 className="text-2xl font-semibold">Page non trouvée</h2>
          <p className="text-muted-foreground">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Accueil
            </Link>
          </Button>
          <Button asChild variant="outline" onClick={() => window.history.back()}>
            <span>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}`,
    };
  }

  /**
   * Génère la page d'erreur générale
   */
  private generateErrorPage(): FileTemplate {
    return {
      path: 'app/error.tsx',
      content: `"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log l'erreur pour le monitoring
    console.error('Erreur de l\\'application:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="space-y-2">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-semibold">Une erreur s'est produite</h1>
          <p className="text-muted-foreground">
            Quelque chose s'est mal passé. Veuillez réessayer.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left text-sm bg-muted p-4 rounded-md">
              <summary className="cursor-pointer font-medium">
                Détails de l'erreur (développement)
              </summary>
              <pre className="mt-2 whitespace-pre-wrap break-words">
                {error.message}
              </pre>
            </details>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}`,
    };
  }

  /**
   * Génère la page non autorisé
   */
  private generateUnauthorizedPage(): FileTemplate {
    return {
      path: 'app/unauthorized/page.tsx',
      content: `import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Home, ArrowLeft } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="space-y-2">
          <Shield className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-semibold">Accès non autorisé</h1>
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default">
            <Link href="${this.config.security.redirects.afterLogin}">
              <Home className="mr-2 h-4 w-4" />
              Tableau de bord
            </Link>
          </Button>
          <Button asChild variant="outline" onClick={() => window.history.back()}>
            <span>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}`,
    };
  }

  /**
   * Génère la page de chargement
   */
  private generateLoadingPage(): FileTemplate {
    return {
      path: 'app/loading.tsx',
      content: `import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}`,
    };
  }
}
