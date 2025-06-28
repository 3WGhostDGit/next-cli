/**
 * Template de génération de navigation avec layouts, menus, breadcrumbs et protection par rôles
 * Génère une navigation complète avec App Router, middleware de sécurité et composants shadcn/ui
 */

import { ProjectConfig, FileTemplate } from '../types';

/**
 * Configuration pour la génération de navigation
 */
export interface NavigationConfig extends ProjectConfig {
  layout: LayoutConfig;
  navigation: NavigationStructure;
  security: SecurityConfig;
  features: NavigationFeature[];
  styling: NavigationStyling;
}

/**
 * Fonctionnalités de navigation disponibles
 */
export type NavigationFeature = 
  | 'breadcrumbs'
  | 'sidebar'
  | 'mobile-menu'
  | 'command-palette'
  | 'navigation-history'
  | 'favorites'
  | 'search'
  | 'notifications'
  | 'user-menu'
  | 'theme-switcher'
  | 'multi-level-menu'
  | 'collapsible-sidebar';

/**
 * Configuration du layout
 */
export interface LayoutConfig {
  type: 'sidebar' | 'header' | 'hybrid' | 'dashboard';
  responsive: boolean;
  stickyHeader: boolean;
  stickyFooter: boolean;
  maxWidth?: string;
  padding: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Structure de navigation
 */
export interface NavigationStructure {
  items: NavigationItem[];
  groups: NavigationGroup[];
  footer?: NavigationFooter;
}

/**
 * Élément de navigation
 */
export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  badge?: string;
  description?: string;
  children?: NavigationItem[];
  roles?: string[];
  permissions?: string[];
  external?: boolean;
  disabled?: boolean;
  separator?: boolean;
}

/**
 * Groupe de navigation
 */
export interface NavigationGroup {
  id: string;
  label: string;
  items: NavigationItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
  roles?: string[];
}

/**
 * Pied de page de navigation
 */
export interface NavigationFooter {
  items: NavigationItem[];
  copyright?: string;
  links?: { label: string; href: string }[];
}

/**
 * Configuration de sécurité
 */
export interface SecurityConfig {
  authentication: boolean;
  authorization: boolean;
  roles: Role[];
  permissions: Permission[];
  middleware: MiddlewareConfig;
  redirects: RedirectConfig;
}

/**
 * Rôle utilisateur
 */
export interface Role {
  name: string;
  label: string;
  description?: string;
  permissions: string[];
  inherits?: string[];
}

/**
 * Permission
 */
export interface Permission {
  name: string;
  label: string;
  description?: string;
  resource?: string;
  action?: string;
}

/**
 * Configuration du middleware
 */
export interface MiddlewareConfig {
  enabled: boolean;
  publicRoutes: string[];
  protectedRoutes: string[];
  adminRoutes: string[];
  redirectAfterLogin: string;
  redirectAfterLogout: string;
  unauthorizedRedirect: string;
}

/**
 * Configuration des redirections
 */
export interface RedirectConfig {
  afterLogin: string;
  afterLogout: string;
  unauthorized: string;
  notFound: string;
}

/**
 * Style de navigation
 */
export interface NavigationStyling {
  theme: 'light' | 'dark' | 'system';
  variant: 'default' | 'minimal' | 'modern' | 'classic';
  sidebarWidth: number;
  headerHeight: number;
  colors: NavigationColors;
  animations: boolean;
}

/**
 * Couleurs de navigation
 */
export interface NavigationColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
}

/**
 * Générateur principal de navigation
 */
export class NavigationGenerator {
  constructor(private config: NavigationConfig) {}

  /**
   * Génère tous les fichiers nécessaires pour la navigation
   */
  generate(): FileTemplate[] {
    const files: FileTemplate[] = [];

    // 1. Layouts App Router
    files.push(...this.generateLayouts());

    // 2. Composants de navigation
    files.push(...this.generateNavigationComponents());

    // 3. Middleware de sécurité
    if (this.config.security.middleware.enabled) {
      files.push(this.generateMiddleware());
    }

    // 4. Hooks de navigation
    files.push(...this.generateNavigationHooks());

    // 5. Utilitaires et helpers
    files.push(...this.generateUtilities());

    // 6. Types et configurations
    files.push(this.generateTypes());

    return files;
  }

  /**
   * Génère les layouts App Router
   */
  private generateLayouts(): FileTemplate[] {
    // Implémentation dans layout-generator.ts
    return []; // Sera implémenté
  }

  /**
   * Génère les composants de navigation
   */
  private generateNavigationComponents(): FileTemplate[] {
    // Implémentation dans component-generator.ts
    return []; // Sera implémenté
  }

  /**
   * Génère le middleware de sécurité
   */
  private generateMiddleware(): FileTemplate {
    // Implémentation dans middleware-generator.ts
    return {
      path: 'middleware.ts',
      content: '', // Sera implémenté
    };
  }

  /**
   * Génère les hooks de navigation
   */
  private generateNavigationHooks(): FileTemplate[] {
    // Implémentation dans hooks-generator.ts
    return []; // Sera implémenté
  }

  /**
   * Génère les utilitaires
   */
  private generateUtilities(): FileTemplate[] {
    // Implémentation dans utilities-generator.ts
    return []; // Sera implémenté
  }

  /**
   * Génère les types
   */
  private generateTypes(): FileTemplate {
    // Implémentation dans types-generator.ts
    return {
      path: 'shared/types/navigation.ts',
      content: '', // Sera implémenté
    };
  }
}

/**
 * Fonction utilitaire pour créer une configuration de navigation
 */
export function createNavigationConfig(
  name: string,
  navigation: NavigationStructure,
  options: Partial<NavigationConfig> = {}
): NavigationConfig {
  return {
    name,
    description: options.description || `Navigation pour ${name}`,
    version: options.version || '1.0.0',
    layout: options.layout || {
      type: 'sidebar',
      responsive: true,
      stickyHeader: true,
      stickyFooter: false,
      padding: 'md',
    },
    navigation,
    security: options.security || {
      authentication: true,
      authorization: true,
      roles: [
        {
          name: 'user',
          label: 'Utilisateur',
          permissions: ['read'],
        },
        {
          name: 'admin',
          label: 'Administrateur',
          permissions: ['read', 'write', 'delete'],
        },
      ],
      permissions: [
        { name: 'read', label: 'Lecture' },
        { name: 'write', label: 'Écriture' },
        { name: 'delete', label: 'Suppression' },
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
      redirects: {
        afterLogin: '/dashboard',
        afterLogout: '/',
        unauthorized: '/unauthorized',
        notFound: '/404',
      },
    },
    features: options.features || ['breadcrumbs', 'sidebar', 'mobile-menu', 'user-menu'],
    styling: options.styling || {
      theme: 'system',
      variant: 'default',
      sidebarWidth: 280,
      headerHeight: 64,
      colors: {
        primary: 'hsl(var(--primary))',
        secondary: 'hsl(var(--secondary))',
        accent: 'hsl(var(--accent))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
      },
      animations: true,
    },
    ...options,
  };
}

/**
 * Presets de navigation prédéfinis
 */
export const NAVIGATION_PRESETS = {
  dashboard: createNavigationConfig('Dashboard', {
    items: [],
    groups: [
      {
        id: 'main',
        label: 'Principal',
        items: [
          { id: 'dashboard', label: 'Tableau de bord', href: '/dashboard', icon: 'LayoutDashboard' },
          { id: 'analytics', label: 'Analytiques', href: '/analytics', icon: 'BarChart3' },
        ],
      },
      {
        id: 'management',
        label: 'Gestion',
        items: [
          { id: 'users', label: 'Utilisateurs', href: '/users', icon: 'Users', roles: ['admin'] },
          { id: 'settings', label: 'Paramètres', href: '/settings', icon: 'Settings' },
        ],
      },
    ],
  }, {
    features: ['breadcrumbs', 'sidebar', 'mobile-menu', 'user-menu', 'theme-switcher'],
  }),

  admin: createNavigationConfig('Admin', {
    items: [],
    groups: [
      {
        id: 'dashboard',
        label: 'Tableau de bord',
        items: [
          { id: 'overview', label: 'Vue d\'ensemble', href: '/admin', icon: 'Home' },
          { id: 'analytics', label: 'Analytiques', href: '/admin/analytics', icon: 'TrendingUp' },
        ],
      },
      {
        id: 'users',
        label: 'Utilisateurs',
        items: [
          { id: 'users-list', label: 'Liste', href: '/admin/users', icon: 'Users' },
          { id: 'roles', label: 'Rôles', href: '/admin/roles', icon: 'Shield' },
          { id: 'permissions', label: 'Permissions', href: '/admin/permissions', icon: 'Key' },
        ],
      },
      {
        id: 'system',
        label: 'Système',
        items: [
          { id: 'settings', label: 'Paramètres', href: '/admin/settings', icon: 'Settings' },
          { id: 'logs', label: 'Logs', href: '/admin/logs', icon: 'FileText' },
          { id: 'backup', label: 'Sauvegarde', href: '/admin/backup', icon: 'Database' },
        ],
      },
    ],
  }, {
    layout: { type: 'sidebar', responsive: true, stickyHeader: true, stickyFooter: false, padding: 'lg' },
    features: ['breadcrumbs', 'sidebar', 'mobile-menu', 'command-palette', 'user-menu', 'notifications'],
    security: {
      authentication: true,
      authorization: true,
      roles: [
        { name: 'admin', label: 'Administrateur', permissions: ['admin:read', 'admin:write', 'admin:delete'] },
        { name: 'moderator', label: 'Modérateur', permissions: ['admin:read', 'admin:write'] },
      ],
      permissions: [
        { name: 'admin:read', label: 'Lecture admin' },
        { name: 'admin:write', label: 'Écriture admin' },
        { name: 'admin:delete', label: 'Suppression admin' },
      ],
      middleware: {
        enabled: true,
        publicRoutes: ['/', '/login'],
        protectedRoutes: ['/admin'],
        adminRoutes: ['/admin'],
        redirectAfterLogin: '/admin',
        redirectAfterLogout: '/',
        unauthorizedRedirect: '/unauthorized',
      },
      redirects: {
        afterLogin: '/admin',
        afterLogout: '/',
        unauthorized: '/unauthorized',
        notFound: '/404',
      },
    },
  }),

  simple: createNavigationConfig('Simple', {
    items: [
      { id: 'home', label: 'Accueil', href: '/', icon: 'Home' },
      { id: 'about', label: 'À propos', href: '/about', icon: 'Info' },
      { id: 'contact', label: 'Contact', href: '/contact', icon: 'Mail' },
    ],
    groups: [],
  }, {
    layout: { type: 'header', responsive: true, stickyHeader: true, stickyFooter: false, padding: 'md' },
    features: ['mobile-menu', 'theme-switcher'],
    security: {
      authentication: false,
      authorization: false,
      roles: [],
      permissions: [],
      middleware: { enabled: false, publicRoutes: [], protectedRoutes: [], adminRoutes: [], redirectAfterLogin: '/', redirectAfterLogout: '/', unauthorizedRedirect: '/' },
      redirects: { afterLogin: '/', afterLogout: '/', unauthorized: '/', notFound: '/404' },
    },
  }),
} as const;
