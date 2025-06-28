/**
 * Générateur principal du template Navigation
 * Orchestre la génération de tous les fichiers de navigation
 */

import { FileTemplate } from "../types";
import { NavigationConfig } from "./index";
import { generateNavigationTypes } from "./types";
import { generateNavigationSchemas } from "./schemas";
import { generateNavigationUtilities } from "./utilities";

/**
 * Interface pour les options de génération Navigation
 */
export interface NavigationGenerationOptions {
  includeExamples?: boolean;
  includeTests?: boolean;
  includeMiddleware?: boolean;
  includeErrorPages?: boolean;
  includeCommandPalette?: boolean;
}

/**
 * Générateur principal Navigation
 */
export class NavigationGenerator {
  constructor(private config: NavigationConfig) {}

  /**
   * Génère le template Navigation complet
   */
  generate(options: NavigationGenerationOptions = {}): {
    files: FileTemplate[];
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    instructions: string[];
  } {
    const files: FileTemplate[] = [];

    // 1. Types TypeScript
    files.push(...generateNavigationTypes(this.config));

    // 2. Schémas de validation
    files.push(...generateNavigationSchemas(this.config));

    // 3. Layouts App Router
    files.push(...this.generateLayouts());

    // 4. Composants de navigation
    files.push(...this.generateNavigationComponents());

    // 5. Middleware de sécurité (optionnel)
    if (options.includeMiddleware && this.config.security.middleware.enabled) {
      files.push(this.generateMiddleware());
    }

    // 6. Pages d'erreur (optionnel)
    if (options.includeErrorPages) {
      files.push(...this.generateErrorPages());
    }

    // 7. Command Palette (optionnel)
    if (options.includeCommandPalette && this.config.features.includes('command-palette')) {
      files.push(this.generateCommandPalette());
    }

    // 8. Hooks personnalisés
    files.push(...this.generateNavigationHooks());

    // 9. Utilitaires
    files.push(...generateNavigationUtilities(this.config));

    return {
      files,
      dependencies: this.getDependencies(),
      devDependencies: this.getDevDependencies(),
      instructions: this.getInstructions(),
    };
  }

  /**
   * Génère les layouts App Router
   */
  private generateLayouts(): FileTemplate[] {
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

    return files;
  }

  /**
   * Génère le layout racine
   */
  private generateRootLayout(): FileTemplate {
    return {
      path: 'app/layout.tsx',
      content: this.generateRootLayoutContent(),
    };
  }

  /**
   * Génère le contenu du layout racine
   */
  private generateRootLayoutContent(): string {
    return `import type { Metadata } from "next";
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
}`;
  }

  /**
   * Génère le layout avec sidebar
   */
  private generateSidebarLayout(): FileTemplate {
    const protectedPath = this.config.security.middleware.protectedRoutes[0] || '/dashboard';
    const layoutPath = protectedPath === '/dashboard' ? 'app/(dashboard)/layout.tsx' : `app${protectedPath}/layout.tsx`;

    return {
      path: layoutPath,
      content: this.generateSidebarLayoutContent(),
    };
  }

  /**
   * Génère le contenu du layout sidebar
   */
  private generateSidebarLayoutContent(): string {
    return `import { AppSidebar } from "@/components/navigation/app-sidebar";
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
  ${this.config.security.authentication ? `const session = await auth.api.getSession();

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
}`;
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
   * Génère les composants de navigation
   */
  private generateNavigationComponents(): FileTemplate[] {
    const files: FileTemplate[] = [];

    // Sidebar principal
    if (this.config.features.includes('sidebar')) {
      files.push(this.generateAppSidebar());
    }

    // Header
    files.push(this.generateHeader());

    // Breadcrumbs
    if (this.config.features.includes('breadcrumbs')) {
      files.push(this.generateBreadcrumbs());
    }

    // Menu mobile
    if (this.config.features.includes('mobile-menu')) {
      files.push(this.generateMobileMenu());
    }

    return files;
  }

  /**
   * Génère le composant sidebar
   */
  private generateAppSidebar(): FileTemplate {
    return {
      path: 'src/components/navigation/app-sidebar.tsx',
      content: `"use client";

import { ChevronDown, Home, Settings, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        ${this.generateSidebarGroups()}
      </SidebarContent>
    </Sidebar>
  );
}`,
    };
  }

  /**
   * Génère les groupes de la sidebar
   */
  private generateSidebarGroups(): string {
    return this.config.navigation.groups.map(group => `
        <SidebarGroup>
          <SidebarGroupLabel>${group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              ${group.items.map(item => `
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="${item.href || '#'}">
                    ${item.icon ? `<${item.icon} />` : ''}
                    <span>${item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>`).join('')}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>`).join('');
  }

  /**
   * Génère le composant header
   */
  private generateHeader(): FileTemplate {
    return {
      path: 'src/components/navigation/header.tsx',
      content: `"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
  user?: any;
}

export function Header({ onMenuClick, user }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      {onMenuClick && (
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="h-4 w-4" />
        </Button>
      )}

      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-lg font-semibold">${this.config.name}</h1>

        <div className="flex items-center gap-2">
          ${this.config.features.includes('theme-switcher') ? '<ThemeToggle />' : ''}
          ${this.config.features.includes('user-menu') ? '<UserMenu user={user} />' : ''}
        </div>
      </div>
    </header>
  );
}`,
    };
  }

  /**
   * Génère le composant breadcrumbs
   */
  private generateBreadcrumbs(): FileTemplate {
    return {
      path: 'src/components/navigation/breadcrumbs.tsx',
      content: `"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <Breadcrumb className="px-4 py-2">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const href = '/' + segments.slice(0, index + 1).join('/');
          const isLast = index === segments.length - 1;
          const label = segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <div key={href} className="flex items-center">
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}`,
    };
  }

  /**
   * Génère le menu mobile
   */
  private generateMobileMenu(): FileTemplate {
    return {
      path: 'src/components/navigation/mobile-menu.tsx',
      content: `"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <nav className="flex flex-col space-y-4">
          {/* Navigation items */}
        </nav>
      </SheetContent>
    </Sheet>
  );
}`,
    };
  }

  /**
   * Génère le middleware de sécurité
   */
  private generateMiddleware(): FileTemplate {
    return {
      path: 'middleware.ts',
      content: this.generateMiddlewareContent(),
    };
  }

  /**
   * Génère le contenu du middleware
   */
  private generateMiddlewareContent(): string {
    return `import { NextRequest, NextResponse } from "next/server";
${this.config.security.authentication ? 'import { getSessionCookie } from "better-auth/cookies";' : ''}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorer les fichiers statiques
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Routes publiques
  const publicRoutes = ${JSON.stringify(this.config.security.middleware.publicRoutes)};
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  ${this.config.security.authentication ? `
  // Vérification de l'authentification
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }` : ''}

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};`;
  }

  /**
   * Génère les pages d'erreur
   */
  private generateErrorPages(): FileTemplate[] {
    return [
      {
        path: 'app/not-found.tsx',
        content: `import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <h2 className="text-2xl font-semibold">Page non trouvée</h2>
        <div className="flex gap-3 justify-center">
          <Button asChild>
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
      },
    ];
  }

  /**
   * Génère la command palette
   */
  private generateCommandPalette(): FileTemplate {
    return {
      path: 'src/components/navigation/command-palette.tsx',
      content: `"use client";

import { useState } from "react";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Rechercher..." />
      <CommandList>
        <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {/* Command items */}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}`,
    };
  }

  /**
   * Génère les hooks de navigation
   */
  private generateNavigationHooks(): FileTemplate[] {
    return [
      {
        path: 'src/hooks/navigation/use-navigation.ts',
        content: `"use client";

import { usePathname, useRouter } from "next/navigation";

export function useNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const navigate = (href: string) => {
    router.push(href);
  };

  return {
    pathname,
    isActive,
    navigate,
  };
}`,
      },
    ];
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

  /**
   * Retourne les dépendances nécessaires
   */
  private getDependencies(): Record<string, string> {
    return {
      "lucide-react": "^0.294.0",
    };
  }

  /**
   * Retourne les dépendances de développement
   */
  private getDevDependencies(): Record<string, string> {
    return {};
  }

  /**
   * Retourne les instructions d'installation
   */
  private getInstructions(): string[] {
    return [
      "1. Installer les dépendances: pnpm add lucide-react",
      "2. Installer les composants shadcn/ui: npx shadcn@latest add sidebar breadcrumb button sheet command",
      "3. Configurer Better Auth si l'authentification est activée",
      "4. Personnaliser les composants de navigation selon vos besoins",
      "5. Configurer le middleware de sécurité",
    ];
  }
}