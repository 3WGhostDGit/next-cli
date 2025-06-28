# Template de Génération de Navigation

Ce template génère une navigation complète avec layouts App Router, menus, breadcrumbs et protection par rôles pour Next.js.

## 🚀 Fonctionnalités

- **App Router Layouts** : Layouts Next.js 14+ avec Server Components
- **shadcn/ui Navigation** : Sidebar, Header, Breadcrumbs modernes
- **Protection par rôles** : Middleware de sécurité avec Better Auth
- **Navigation responsive** : Mobile-first avec composants adaptatifs
- **Breadcrumbs dynamiques** : Navigation contextuelle automatique
- **Command Palette** : Recherche et navigation rapide
- **Thème switcher** : Support dark/light mode
- **TypeScript** : Types complets pour la navigation

## 📦 Structure générée

```
app/
├── layout.tsx                    # Layout racine
├── (dashboard)/layout.tsx        # Layout dashboard
├── (admin)/layout.tsx           # Layout admin
├── loading.tsx                  # Page de chargement
├── error.tsx                    # Page d'erreur
├── not-found.tsx               # Page 404
└── unauthorized/page.tsx       # Page non autorisé
src/
├── components/navigation/
│   ├── app-sidebar.tsx         # Sidebar principale
│   ├── admin-sidebar.tsx       # Sidebar admin
│   ├── header.tsx              # Header avec navigation
│   ├── breadcrumbs.tsx         # Breadcrumbs dynamiques
│   ├── mobile-menu.tsx         # Menu mobile
│   ├── command-palette.tsx     # Palette de commandes
│   ├── user-menu.tsx           # Menu utilisateur
│   └── theme-switcher.tsx      # Sélecteur de thème
├── hooks/navigation/
│   ├── use-navigation.ts       # Hook de navigation
│   ├── use-breadcrumbs.ts      # Hook breadcrumbs
│   └── use-permissions.ts      # Hook permissions
├── lib/
│   ├── permissions.ts          # Gestion des permissions
│   └── navigation.ts           # Utilitaires navigation
middleware.ts                   # Middleware de sécurité
shared/
└── types/navigation.ts         # Types de navigation
```

## 🛠️ Utilisation

### Configuration de base

```typescript
import { NavigationGenerator, createNavigationConfig } from './templates/navigation';

const navigation = {
  items: [],
  groups: [
    {
      id: 'main',
      label: 'Principal',
      items: [
        {
          id: 'dashboard',
          label: 'Tableau de bord',
          href: '/dashboard',
          icon: 'LayoutDashboard',
        },
        {
          id: 'users',
          label: 'Utilisateurs',
          href: '/users',
          icon: 'Users',
          roles: ['admin'],
        },
      ],
    },
  ],
};

const config = createNavigationConfig('Mon App', navigation);
const generator = new NavigationGenerator(config);
const files = generator.generate();
```

### Types de layouts supportés

| Type | Description | Cas d'usage |
|------|-------------|-------------|
| `sidebar` | Sidebar fixe + contenu | Dashboard, admin |
| `header` | Header + contenu | Site vitrine, blog |
| `hybrid` | Sidebar desktop + header mobile | Applications complexes |
| `dashboard` | Layout optimisé dashboard | Tableaux de bord |

### Configuration de sécurité

```typescript
const config = createNavigationConfig('App', navigation, {
  security: {
    authentication: true,
    authorization: true,
    roles: [
      {
        name: 'admin',
        label: 'Administrateur',
        permissions: ['*'],
      },
      {
        name: 'user',
        label: 'Utilisateur',
        permissions: ['read'],
      },
    ],
    middleware: {
      enabled: true,
      publicRoutes: ['/', '/login', '/signup'],
      protectedRoutes: ['/dashboard'],
      adminRoutes: ['/admin'],
      redirectAfterLogin: '/dashboard',
      redirectAfterLogout: '/',
      unauthorizedRedirect: '/unauthorized',
    },
  },
});
```

### Navigation avec permissions

```typescript
const navigationItems = [
  {
    id: 'public-item',
    label: 'Accueil',
    href: '/',
    icon: 'Home',
    // Visible pour tous
  },
  {
    id: 'user-item',
    label: 'Profil',
    href: '/profile',
    icon: 'User',
    roles: ['user', 'admin'], // Visible pour user et admin
  },
  {
    id: 'admin-item',
    label: 'Administration',
    href: '/admin',
    icon: 'Settings',
    roles: ['admin'], // Visible pour admin uniquement
    permissions: ['admin:read'], // Permission spécifique
  },
];
```

### Navigation multi-niveaux

```typescript
const menuWithSubItems = {
  id: 'products',
  label: 'Produits',
  icon: 'Package',
  children: [
    {
      id: 'products-list',
      label: 'Liste',
      href: '/products',
      icon: 'List',
    },
    {
      id: 'products-create',
      label: 'Créer',
      href: '/products/create',
      icon: 'Plus',
      roles: ['admin', 'manager'],
    },
    {
      id: 'categories',
      label: 'Catégories',
      href: '/categories',
      icon: 'FolderTree',
      roles: ['admin'],
    },
  ],
};
```

## 📋 Exemples prêts à l'emploi

### Navigation simple

```typescript
import { NAVIGATION_PRESETS } from './templates/navigation';
const simpleNav = new NavigationGenerator(NAVIGATION_PRESETS.simple);
```

### Navigation dashboard

```typescript
const dashboardNav = new NavigationGenerator(NAVIGATION_PRESETS.dashboard);
```

### Navigation admin

```typescript
const adminNav = new NavigationGenerator(NAVIGATION_PRESETS.admin);
```

## 🔧 Intégration dans le projet

### 1. Installation des dépendances

```bash
pnpm add better-auth
npx shadcn@latest add sidebar navigation-menu breadcrumb
npx shadcn@latest add command dialog button
```

### 2. Configuration du middleware

Le middleware généré protège automatiquement vos routes :

```typescript
// middleware.ts (généré automatiquement)
export async function middleware(request: NextRequest) {
  // Authentification et autorisation automatiques
  // Redirection selon les rôles
  // Logging des accès
}
```

### 3. Utilisation des layouts

```tsx
// app/(dashboard)/layout.tsx (généré)
import { AppSidebar } from "@/components/navigation/app-sidebar";

export default async function DashboardLayout({ children }) {
  const session = await auth.api.getSession();
  
  return (
    <SidebarProvider>
      <AppSidebar user={session.user} />
      <main>{children}</main>
    </SidebarProvider>
  );
}
```

### 4. Utilisation des composants

```tsx
// Dans vos pages
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";

export default function ProductsPage() {
  return (
    <div>
      <Breadcrumbs />
      <h1>Produits</h1>
      {/* Contenu */}
    </div>
  );
}
```

## 🎯 Fonctionnalités avancées

### Command Palette

```tsx
import { CommandPalette } from "@/components/navigation/command-palette";

// Recherche rapide dans l'application
// Navigation par raccourcis clavier
// Actions contextuelles
```

### Breadcrumbs dynamiques

```tsx
// Génération automatique basée sur la route
// /products/123/edit → Produits > Produit #123 > Modifier
// Personnalisable par page
```

### Navigation history

```tsx
import { useNavigationHistory } from "@/hooks/navigation/use-navigation-history";

function BackButton() {
  const { goBack, canGoBack } = useNavigationHistory();
  
  return (
    <Button onClick={goBack} disabled={!canGoBack}>
      Retour
    </Button>
  );
}
```

### Permissions côté client

```tsx
import { usePermissions } from "@/lib/permissions";

function AdminButton() {
  const { hasRole } = usePermissions();
  
  if (!hasRole('admin')) {
    return null;
  }
  
  return <Button>Action Admin</Button>;
}
```

## 🔒 Sécurité

### Middleware de protection

- **Authentification** : Vérification automatique des sessions
- **Autorisation** : Contrôle d'accès par rôles et permissions
- **Redirection** : Gestion intelligente des redirections
- **Logging** : Audit des tentatives d'accès

### Protection des routes

```typescript
// Routes publiques : accessibles sans authentification
publicRoutes: ['/', '/login', '/signup']

// Routes protégées : authentification requise
protectedRoutes: ['/dashboard', '/profile']

// Routes admin : rôles spécifiques requis
adminRoutes: ['/admin', '/settings']
```

### Vérification des permissions

```typescript
// Server-side (Server Actions)
import { checkPermission } from "@/lib/permissions";

export async function deleteUser(id: string) {
  await checkPermission('users', 'delete');
  // Logique de suppression
}

// Client-side (Composants)
import { usePermissions } from "@/lib/permissions";

function DeleteButton() {
  const { hasPermission } = usePermissions();
  
  return hasPermission('users:delete') ? (
    <Button variant="destructive">Supprimer</Button>
  ) : null;
}
```

## 🎨 Personnalisation

### Thèmes et styles

```typescript
const config = createNavigationConfig('App', navigation, {
  styling: {
    theme: 'system', // light, dark, system
    variant: 'modern', // default, minimal, modern, classic
    sidebarWidth: 280,
    headerHeight: 64,
    colors: {
      primary: 'hsl(var(--primary))',
      // Couleurs personnalisées
    },
    animations: true,
  },
});
```

### Icônes personnalisées

```typescript
// Utilise Lucide React par défaut
// Personnalisable avec n'importe quelle bibliothèque d'icônes
const menuItem = {
  id: 'custom',
  label: 'Custom',
  href: '/custom',
  icon: 'CustomIcon', // Votre icône personnalisée
};
```

## 📚 Ressources

- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui Navigation](https://ui.shadcn.com/docs/components/navigation-menu)
- [Better Auth](https://www.better-auth.com/)
- [Lucide Icons](https://lucide.dev/)
