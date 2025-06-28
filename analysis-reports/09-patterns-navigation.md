# Analyse des Patterns de Navigation

## Vue d'ensemble

Cette analyse examine les patterns de navigation avec Next.js App Router, les composants de navigation avec shadcn/ui, et les patterns d'intégration pour les menus, breadcrumbs, et navigation guards.

## ANALYSE EN DEUX TEMPS

### Temps 1 : Patterns de base Next.js

- Composants Link et useRouter
- Hooks de navigation (usePathname, useSearchParams)
- Navigation programmatique et déclarative

### Temps 2 : Patterns avancés et UI

- Navigation guards et middleware
- Composants de navigation avec shadcn/ui
- Breadcrumbs, sidebars et menus complexes

## 1. Patterns de Base Next.js Navigation

### 1.1 Composant Link Fondamental

```tsx
import Link from "next/link";

// Navigation basique
export default function Navigation() {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
        <li>
          <Link href="/dashboard">Dashboard</Link>
        </li>
      </ul>
    </nav>
  );
}

// Navigation vers routes dynamiques
export function PostList({ posts }: { posts: Post[] }) {
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  );
}

// Navigation avec objet URL
export function AdvancedNavigation() {
  return (
    <div>
      <Link
        href={{
          pathname: "/blog/[slug]",
          query: { slug: "my-post" },
        }}
      >
        Blog Post
      </Link>

      <Link
        href={{
          pathname: "/search",
          query: { q: "nextjs", category: "tech" },
        }}
      >
        Search Results
      </Link>
    </div>
  );
}
```

**Caractéristiques identifiées :**

- Navigation déclarative avec `<Link>`
- Support des routes dynamiques avec template literals
- Configuration avancée avec objets URL
- Prefetching automatique des routes

### 1.2 Navigation Programmatique avec useRouter

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function ProgrammaticNavigation() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleNavigation = (path: string) => {
    startTransition(() => {
      router.push(path);
    });
  };

  const handleReplace = (path: string) => {
    router.replace(path); // Ne pas ajouter à l'historique
  };

  const handleBack = () => {
    router.back();
  };

  const handleForward = () => {
    router.forward();
  };

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => handleNavigation("/dashboard")}
        disabled={isPending}
      >
        {isPending ? "Navigating..." : "Go to Dashboard"}
      </button>

      <button onClick={() => handleReplace("/login")}>
        Replace with Login
      </button>

      <button onClick={handleBack}>Go Back</button>

      <button onClick={handleForward}>Go Forward</button>

      <button onClick={handleRefresh}>Refresh Data</button>

      {/* Navigation avec options */}
      <button onClick={() => router.push("/dashboard", { scroll: false })}>
        Navigate without scroll
      </button>
    </div>
  );
}
```

### 1.3 Hooks de Navigation Avancés

```tsx
"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";

export function NavigationHooks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Créer une nouvelle query string
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  // Supprimer un paramètre
  const removeQueryParam = useCallback(
    (name: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(name);
      return params.toString();
    },
    [searchParams]
  );

  // Navigation avec préservation des paramètres
  const navigateWithParams = (newPath: string) => {
    const currentParams = searchParams.toString();
    const url = currentParams ? `${newPath}?${currentParams}` : newPath;
    router.push(url);
  };

  return (
    <div className="space-y-4">
      <div>
        <p>Current pathname: {pathname}</p>
        <p>Current search params: {searchParams.toString()}</p>
      </div>

      {/* Mise à jour des paramètres de recherche */}
      <div className="space-x-2">
        <button
          onClick={() => {
            router.push(pathname + "?" + createQueryString("sort", "asc"));
          }}
        >
          Sort ASC
        </button>

        <button
          onClick={() => {
            router.push(pathname + "?" + createQueryString("sort", "desc"));
          }}
        >
          Sort DESC
        </button>

        <button
          onClick={() => {
            router.push(pathname + "?" + removeQueryParam("sort"));
          }}
        >
          Clear Sort
        </button>
      </div>

      {/* Navigation avec préservation des paramètres */}
      <button onClick={() => navigateWithParams("/products")}>
        Go to Products (keep params)
      </button>
    </div>
  );
}
```

## 2. Patterns de Navigation Active

### 2.1 Liens Actifs avec usePathname

```tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
  className?: string;
}

export function NavLink({
  href,
  children,
  exact = false,
  className,
}: NavLinkProps) {
  const pathname = usePathname();

  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent",
        className
      )}
    >
      {children}
    </Link>
  );
}

// Navigation avec indicateurs visuels
export function MainNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", exact: true },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/products", label: "Products" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {navItems.map((item) => (
        <NavLink key={item.href} href={item.href} exact={item.exact}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
```

### 2.2 Navigation avec Segments de Layout

```tsx
"use client";

import {
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
} from "next/navigation";
import Link from "next/link";

// Navigation pour un layout spécifique
export function BlogNavigation() {
  const segment = useSelectedLayoutSegment();

  const navItems = [
    { slug: null, label: "All Posts" }, // null pour la route racine
    { slug: "tech", label: "Technology" },
    { slug: "design", label: "Design" },
    { slug: "business", label: "Business" },
  ];

  return (
    <nav className="flex space-x-4">
      {navItems.map((item) => (
        <Link
          key={item.slug || "all"}
          href={item.slug ? `/blog/${item.slug}` : "/blog"}
          className={cn(
            "px-3 py-2 rounded-md text-sm font-medium",
            segment === item.slug
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

// Breadcrumbs avec segments multiples
export function Breadcrumbs() {
  const segments = useSelectedLayoutSegments();

  const breadcrumbItems = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);

    return { href, label };
  });

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground">
        Home
      </Link>

      {breadcrumbItems.map((item, index) => (
        <div key={item.href} className="flex items-center space-x-2">
          <span>/</span>
          {index === breadcrumbItems.length - 1 ? (
            <span className="text-foreground font-medium">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
```

## 3. Patterns de Navigation Guards

### 3.1 Middleware de Protection

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  // Routes publiques
  const publicRoutes = ["/", "/login", "/signup", "/about"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/api/auth")
  );

  // Redirection des utilisateurs authentifiés depuis les pages d'auth
  if (sessionCookie && ["/login", "/signup"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protection des routes privées
  if (!isPublicRoute && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protection des routes admin
  if (pathname.startsWith("/admin")) {
    const session = await validateSession(sessionCookie);
    if (!session?.user.roles?.includes("admin")) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### 3.2 Protection Côté Client

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallback,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && requiredRole && !user.roles?.includes(requiredRole)) {
      router.push("/unauthorized");
    }
  }, [user, requiredRole, router]);

  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && !user.roles?.includes(requiredRole)) {
    return null;
  }

  return <>{children}</>;
}

// Hook pour la protection conditionnelle
export function useRequireAuth(redirectTo = "/login") {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  return { user, isLoading };
}
```

## 4. Patterns de Navigation avec shadcn/ui

### 4.1 Navigation Menu Component

```tsx
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";

const components = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task.",
  },
];

export function MainNavigation() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">
                      shadcn/ui
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Beautifully designed components built with Radix UI and
                      Tailwind CSS.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/docs" title="Introduction">
                Re-usable components built using Radix UI and Tailwind CSS.
              </ListItem>
              <ListItem href="/docs/installation" title="Installation">
                How to install dependencies and structure your app.
              </ListItem>
              <ListItem href="/docs/primitives/typography" title="Typography">
                Styles for headings, paragraphs, lists...etc
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/docs" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Documentation
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
```

### 4.2 Breadcrumbs avec shadcn/ui

```tsx
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSelectedLayoutSegments } from "next/navigation";

export function DynamicBreadcrumbs() {
  const segments = useSelectedLayoutSegments();

  const breadcrumbItems = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ");

    return { href, label, isLast: index === segments.length - 1 };
  });

  // Gérer les breadcrumbs trop longs
  const shouldCollapse = breadcrumbItems.length > 3;
  const visibleItems = shouldCollapse
    ? [breadcrumbItems[0], ...breadcrumbItems.slice(-2)]
    : breadcrumbItems;
  const hiddenItems = shouldCollapse ? breadcrumbItems.slice(1, -2) : [];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbItems.length > 0 && <BreadcrumbSeparator />}

        {shouldCollapse && hiddenItems.length > 0 && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink href={visibleItems[0].href}>
                {visibleItems[0].label}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center">
                  <BreadcrumbEllipsis className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {hiddenItems.map((item) => (
                    <DropdownMenuItem key={item.href}>
                      <BreadcrumbLink href={item.href}>
                        {item.label}
                      </BreadcrumbLink>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {visibleItems.slice(1).map((item, index) => (
              <React.Fragment key={item.href}>
                <BreadcrumbItem>
                  {item.isLast ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!item.isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </>
        )}

        {!shouldCollapse &&
          visibleItems.map((item, index) => (
            <React.Fragment key={item.href}>
              <BreadcrumbItem>
                {item.isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!item.isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
```

## 5. Implications pour le CLI

### 5.1 Génération Automatique de Navigation

Le CLI devra détecter et générer automatiquement :

**Patterns de base :**

- Composants Link avec routes typées
- Navigation active avec usePathname
- Hooks de navigation configurés
- Middleware de protection des routes

**Patterns avancés :**

- Navigation Menu avec shadcn/ui
- Breadcrumbs dynamiques
- Sidebar avec état persistant
- Guards de navigation par rôle

### 5.2 Templates de Génération

```typescript
// Template de navigation généré automatiquement
export const generateNavigation = (routes: RouteConfig[]) => {
  const navItems = routes.filter((route) => route.showInNav);

  return `
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function MainNavigation() {
  const pathname = usePathname()

  const navItems = [
    ${navItems
      .map(
        (route) => `
    {
      href: '${route.path}',
      label: '${route.label}',
      exact: ${route.exact || false},
      ${route.requiredRole ? `requiredRole: '${route.requiredRole}',` : ""}
    }`
      )
      .join(",\n    ")}
  ]

  return (
    <nav className="flex items-center space-x-4">
      {navItems.map((item) => {
        const isActive = item.exact 
          ? pathname === item.href 
          : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
`;
};
```

### 5.3 Détection de Patterns

Le CLI devra identifier :

- **Structure de routes** → Navigation automatique
- **Besoins d'authentification** → Guards et middleware
- **Hiérarchie de pages** → Breadcrumbs et sidebar
- **Rôles utilisateur** → Protection par rôle
- **Types de navigation** → Menu, tabs, sidebar

## 6. Patterns de Sidebar Navigation

### 6.1 Sidebar avec shadcn/ui

```tsx
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronRight,
  Home,
  Settings,
  Users,
  FileText,
  BarChart3,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Users",
    icon: Users,
    items: [
      { title: "All Users", href: "/users", icon: Users },
      { title: "Add User", href: "/users/new", icon: Users },
      { title: "User Roles", href: "/users/roles", icon: Users },
    ],
  },
  {
    title: "Content",
    icon: FileText,
    items: [
      { title: "Posts", href: "/posts", icon: FileText },
      { title: "Categories", href: "/categories", icon: FileText },
      { title: "Tags", href: "/tags", icon: FileText },
    ],
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Home className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">My App</span>
                  <span className="truncate text-xs">Admin Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible
                      defaultOpen={item.items.some(
                        (subItem) =>
                          subItem.href && pathname.startsWith(subItem.href)
                      )}
                      className="group/collapsible"
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.href}
                              >
                                <Link href={subItem.href!}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={pathname === item.href}
                    >
                      <Link href={item.href!}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/profile">
                <Settings className="size-4" />
                <span>Account Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

// Layout avec sidebar
export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">{/* Header content */}</div>
        </header>
        <div className="flex-1 p-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
```

### 6.2 Navigation Mobile Responsive

```tsx
"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/products", label: "Products" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Navigation responsive complète
export function ResponsiveNavigation() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">My App</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Dashboard
            </Link>
            <Link
              href="/products"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Products
            </Link>
            <Link
              href="/settings"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Settings
            </Link>
          </nav>
        </div>

        <MobileNavigation />

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or other components */}
          </div>
        </div>
      </div>
    </header>
  );
}
```

## 7. Patterns de Navigation Contextuelle

### 7.1 Navigation par Onglets

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface TabNavigationProps {
  tabs: Array<{
    value: string;
    label: string;
    content: React.ReactNode;
  }>;
  defaultTab?: string;
}

export function TabNavigation({ tabs, defaultTab }: TabNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get("tab") || defaultTab || tabs[0]?.value;

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleTabChange = (value: string) => {
    router.push("?" + createQueryString("tab", value));
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-3">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

// Utilisation
export function UserProfilePage() {
  const tabs = [
    {
      value: "profile",
      label: "Profile",
      content: <UserProfileForm />,
    },
    {
      value: "security",
      label: "Security",
      content: <SecuritySettings />,
    },
    {
      value: "notifications",
      label: "Notifications",
      content: <NotificationSettings />,
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">User Settings</h1>
      <TabNavigation tabs={tabs} defaultTab="profile" />
    </div>
  );
}
```

### 7.2 Navigation avec État Persistant

```tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface NavigationState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  breadcrumbs: Array<{ label: string; href: string }>;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href: string }>) => void;
}

const NavigationContext = createContext<NavigationState | undefined>(undefined);

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState<
    Array<{ label: string; href: string }>
  >([]);

  // Persister l'état de la sidebar
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-open");
    if (saved !== null) {
      setSidebarOpen(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-open", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  return (
    <NavigationContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        activeSection,
        setActiveSection,
        breadcrumbs,
        setBreadcrumbs,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}

// Hook pour mettre à jour automatiquement les breadcrumbs
export function useBreadcrumbs(
  breadcrumbs: Array<{ label: string; href: string }>
) {
  const { setBreadcrumbs } = useNavigation();

  useEffect(() => {
    setBreadcrumbs(breadcrumbs);

    return () => {
      setBreadcrumbs([]);
    };
  }, [breadcrumbs, setBreadcrumbs]);
}
```

## 8. Patterns de Navigation Avancée

### 8.1 Navigation avec Recherche

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search, FileText, Users, Settings, BarChart3 } from "lucide-react";

interface SearchableItem {
  id: string;
  title: string;
  description?: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  category: string;
}

const searchableItems: SearchableItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Overview and analytics",
    href: "/dashboard",
    icon: BarChart3,
    category: "Pages",
  },
  {
    id: "users",
    title: "Users",
    description: "Manage user accounts",
    href: "/users",
    icon: Users,
    category: "Management",
  },
  {
    id: "posts",
    title: "Posts",
    description: "Content management",
    href: "/posts",
    icon: FileText,
    category: "Content",
  },
  {
    id: "settings",
    title: "Settings",
    description: "Application settings",
    href: "/settings",
    icon: Settings,
    category: "Configuration",
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  const filteredItems = searchableItems.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
  );

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SearchableItem[]>);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 relative w-full justify-start text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type a command or search..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {Object.entries(groupedItems).map(([category, items]) => (
            <CommandGroup key={category} heading={category}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.title}
                  onSelect={() => handleSelect(item.href)}
                >
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
```

### 8.2 Navigation avec Historique

```tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { History, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface HistoryItem {
  path: string;
  title: string;
  timestamp: number;
}

export function NavigationHistory() {
  const pathname = usePathname();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Ajouter la page actuelle à l'historique
  useEffect(() => {
    const title = document.title || pathname;
    const newItem: HistoryItem = {
      path: pathname,
      title,
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      // Éviter les doublons consécutifs
      if (prev.length > 0 && prev[prev.length - 1].path === pathname) {
        return prev;
      }

      // Limiter l'historique à 10 éléments
      const updated = [...prev, newItem].slice(-10);

      // Persister dans localStorage
      localStorage.setItem("navigation-history", JSON.stringify(updated));

      return updated;
    });
  }, [pathname]);

  // Charger l'historique depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("navigation-history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to parse navigation history:", error);
      }
    }
  }, []);

  const recentPages = history
    .filter((item) => item.path !== pathname)
    .slice(-5)
    .reverse();

  const canGoBack = history.length > 1;

  const handleGoBack = () => {
    if (canGoBack) {
      window.history.back();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleGoBack}
        disabled={!canGoBack}
        title="Go back"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      {recentPages.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Recent pages">
              <History className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {recentPages.map((item, index) => (
              <DropdownMenuItem key={`${item.path}-${item.timestamp}`} asChild>
                <Link href={item.path} className="flex flex-col items-start">
                  <span className="font-medium truncate w-full">
                    {item.title}
                  </span>
                  <span className="text-xs text-muted-foreground truncate w-full">
                    {item.path}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
```

## 9. Implications Avancées pour le CLI

### 9.1 Génération de Navigation Complexe

Le CLI devra détecter et générer automatiquement :

**Patterns avancés :**

- Sidebar responsive avec état persistant
- Navigation mobile avec Sheet
- Command palette avec recherche
- Breadcrumbs dynamiques avec collapse
- Navigation par onglets avec URL sync

**Templates de génération :**

```typescript
// Générateur de navigation complète
export const generateCompleteNavigation = (config: NavigationConfig) => {
  const hasSidebar = config.layout === "sidebar";
  const hasCommandPalette = config.features.includes("search");
  const hasBreadcrumbs = config.features.includes("breadcrumbs");
  const hasHistory = config.features.includes("history");

  return `
import { NavigationProvider } from '@/components/navigation/navigation-provider'
import { AppSidebar } from '@/components/navigation/app-sidebar'
import { ResponsiveNavigation } from '@/components/navigation/responsive-navigation'
import { CommandPalette } from '@/components/navigation/command-palette'
import { DynamicBreadcrumbs } from '@/components/navigation/breadcrumbs'
import { NavigationHistory } from '@/components/navigation/history'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <NavigationProvider>
      ${
        hasSidebar
          ? `
      <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            ${hasBreadcrumbs ? "<DynamicBreadcrumbs />" : ""}
            <div className="flex-1" />
            ${hasCommandPalette ? "<CommandPalette />" : ""}
            ${hasHistory ? "<NavigationHistory />" : ""}
          </header>
          <div className="flex-1 p-4">
            {children}
          </div>
        </main>
      </SidebarProvider>
      `
          : `
      <ResponsiveNavigation />
      <main className="container mx-auto py-6">
        ${hasBreadcrumbs ? "<DynamicBreadcrumbs />" : ""}
        {children}
      </main>
      `
      }
    </NavigationProvider>
  )
}
`;
};
```

### 9.2 Détection de Patterns Complexes

Le CLI devra identifier :

- **Type d'application** → Admin panel vs site public
- **Complexité de navigation** → Simple vs multi-niveau
- **Besoins de recherche** → Command palette nécessaire
- **Navigation mobile** → Responsive patterns requis
- **État persistant** → Préférences utilisateur

## Conclusion

Les patterns de navigation avec Next.js App Router et shadcn/ui offrent une base très structurée pour la génération automatique. Le CLI devra implémenter des templates qui couvrent la navigation déclarative et programmatique, les guards de sécurité, et les composants UI cohérents.

Les patterns avancés comme la sidebar responsive, le command palette, et la navigation contextuelle nécessitent une détection intelligente des besoins pour générer automatiquement des systèmes de navigation performants et complets. L'intégration avec shadcn/ui permet une génération de navigation accessible et responsive, tandis que les hooks Next.js fournissent les fonctionnalités avancées nécessaires pour des applications professionnelles avec protection des routes et navigation contextuelle.
