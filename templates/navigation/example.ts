/**
 * Exemples d'utilisation du générateur de navigation
 * Démontre les différents cas d'usage et configurations
 */

import { NavigationGenerator, createNavigationConfig, NAVIGATION_PRESETS } from './index';
import type { NavigationStructure, NavigationItem } from './index';

/**
 * Exemple 1: Navigation simple pour site vitrine
 */
export function generateSimpleNavigation() {
  const config = NAVIGATION_PRESETS.simple;
  const generator = new NavigationGenerator(config);
  return generator.generate();
}

/**
 * Exemple 2: Navigation dashboard complète
 */
export function generateDashboardNavigation() {
  const config = NAVIGATION_PRESETS.dashboard;
  const generator = new NavigationGenerator(config);
  return generator.generate();
}

/**
 * Exemple 3: Navigation admin avancée
 */
export function generateAdminNavigation() {
  const config = NAVIGATION_PRESETS.admin;
  const generator = new NavigationGenerator(config);
  return generator.generate();
}

/**
 * Exemple 4: Navigation e-commerce avec protection par rôles
 */
export function generateEcommerceNavigation() {
  const navigation: NavigationStructure = {
    items: [],
    groups: [
      {
        id: 'dashboard',
        label: 'Tableau de bord',
        items: [
          {
            id: 'overview',
            label: 'Vue d\'ensemble',
            href: '/dashboard',
            icon: 'LayoutDashboard',
            description: 'Statistiques générales',
          },
          {
            id: 'analytics',
            label: 'Analytiques',
            href: '/dashboard/analytics',
            icon: 'TrendingUp',
            description: 'Analyses détaillées',
            roles: ['admin', 'manager'],
          },
        ],
      },
      {
        id: 'catalog',
        label: 'Catalogue',
        items: [
          {
            id: 'products',
            label: 'Produits',
            href: '/products',
            icon: 'Package',
            badge: 'new',
            children: [
              {
                id: 'products-list',
                label: 'Liste des produits',
                href: '/products',
                icon: 'List',
              },
              {
                id: 'products-create',
                label: 'Ajouter un produit',
                href: '/products/create',
                icon: 'Plus',
                roles: ['admin', 'manager'],
              },
              {
                id: 'products-import',
                label: 'Importer des produits',
                href: '/products/import',
                icon: 'Upload',
                roles: ['admin'],
              },
            ],
          },
          {
            id: 'categories',
            label: 'Catégories',
            href: '/categories',
            icon: 'FolderTree',
            roles: ['admin', 'manager'],
          },
          {
            id: 'inventory',
            label: 'Inventaire',
            href: '/inventory',
            icon: 'Warehouse',
            roles: ['admin', 'manager', 'inventory'],
          },
        ],
      },
      {
        id: 'orders',
        label: 'Commandes',
        items: [
          {
            id: 'orders-list',
            label: 'Toutes les commandes',
            href: '/orders',
            icon: 'ShoppingCart',
          },
          {
            id: 'orders-pending',
            label: 'En attente',
            href: '/orders?status=pending',
            icon: 'Clock',
            badge: '12',
          },
          {
            id: 'orders-processing',
            label: 'En cours',
            href: '/orders?status=processing',
            icon: 'Truck',
          },
          {
            id: 'orders-completed',
            label: 'Terminées',
            href: '/orders?status=completed',
            icon: 'CheckCircle',
          },
        ],
      },
      {
        id: 'customers',
        label: 'Clients',
        items: [
          {
            id: 'customers-list',
            label: 'Liste des clients',
            href: '/customers',
            icon: 'Users',
          },
          {
            id: 'customers-segments',
            label: 'Segments',
            href: '/customers/segments',
            icon: 'Target',
            roles: ['admin', 'marketing'],
          },
          {
            id: 'customers-reviews',
            label: 'Avis clients',
            href: '/reviews',
            icon: 'Star',
          },
        ],
      },
      {
        id: 'marketing',
        label: 'Marketing',
        items: [
          {
            id: 'promotions',
            label: 'Promotions',
            href: '/promotions',
            icon: 'Percent',
            roles: ['admin', 'marketing'],
          },
          {
            id: 'coupons',
            label: 'Codes promo',
            href: '/coupons',
            icon: 'Ticket',
            roles: ['admin', 'marketing'],
          },
          {
            id: 'newsletters',
            label: 'Newsletters',
            href: '/newsletters',
            icon: 'Mail',
            roles: ['admin', 'marketing'],
          },
        ],
      },
      {
        id: 'reports',
        label: 'Rapports',
        items: [
          {
            id: 'sales-reports',
            label: 'Ventes',
            href: '/reports/sales',
            icon: 'BarChart3',
            roles: ['admin', 'manager'],
          },
          {
            id: 'inventory-reports',
            label: 'Inventaire',
            href: '/reports/inventory',
            icon: 'Package',
            roles: ['admin', 'manager', 'inventory'],
          },
          {
            id: 'customer-reports',
            label: 'Clients',
            href: '/reports/customers',
            icon: 'Users',
            roles: ['admin', 'manager'],
          },
        ],
      },
      {
        id: 'settings',
        label: 'Paramètres',
        items: [
          {
            id: 'store-settings',
            label: 'Boutique',
            href: '/settings/store',
            icon: 'Store',
            roles: ['admin'],
          },
          {
            id: 'payment-settings',
            label: 'Paiements',
            href: '/settings/payments',
            icon: 'CreditCard',
            roles: ['admin'],
          },
          {
            id: 'shipping-settings',
            label: 'Livraison',
            href: '/settings/shipping',
            icon: 'Truck',
            roles: ['admin', 'manager'],
          },
          {
            id: 'tax-settings',
            label: 'Taxes',
            href: '/settings/taxes',
            icon: 'Calculator',
            roles: ['admin'],
          },
          { id: 'separator-1', label: '', href: '', separator: true },
          {
            id: 'user-management',
            label: 'Utilisateurs',
            href: '/settings/users',
            icon: 'UserCog',
            roles: ['admin'],
          },
          {
            id: 'roles-permissions',
            label: 'Rôles & Permissions',
            href: '/settings/roles',
            icon: 'Shield',
            roles: ['admin'],
          },
        ],
      },
    ],
    footer: {
      items: [
        {
          id: 'help',
          label: 'Aide',
          href: '/help',
          icon: 'HelpCircle',
        },
        {
          id: 'support',
          label: 'Support',
          href: '/support',
          icon: 'MessageCircle',
        },
        {
          id: 'documentation',
          label: 'Documentation',
          href: '/docs',
          icon: 'Book',
          external: true,
        },
      ],
      copyright: '© 2024 Mon E-commerce. Tous droits réservés.',
      links: [
        { label: 'Politique de confidentialité', href: '/privacy' },
        { label: 'Conditions d\'utilisation', href: '/terms' },
      ],
    },
  };

  const config = createNavigationConfig('E-commerce', navigation, {
    layout: {
      type: 'sidebar',
      responsive: true,
      stickyHeader: true,
      stickyFooter: false,
      padding: 'md',
    },
    features: [
      'breadcrumbs',
      'sidebar',
      'mobile-menu',
      'command-palette',
      'navigation-history',
      'favorites',
      'search',
      'notifications',
      'user-menu',
      'theme-switcher',
      'multi-level-menu',
      'collapsible-sidebar',
    ],
    security: {
      authentication: true,
      authorization: true,
      roles: [
        {
          name: 'admin',
          label: 'Administrateur',
          description: 'Accès complet à toutes les fonctionnalités',
          permissions: ['*'],
        },
        {
          name: 'manager',
          label: 'Gestionnaire',
          description: 'Gestion des produits, commandes et clients',
          permissions: ['products:*', 'orders:*', 'customers:*', 'reports:read'],
        },
        {
          name: 'inventory',
          label: 'Gestionnaire d\'inventaire',
          description: 'Gestion de l\'inventaire et des stocks',
          permissions: ['products:read', 'inventory:*', 'reports:inventory'],
        },
        {
          name: 'marketing',
          label: 'Marketing',
          description: 'Gestion des promotions et du marketing',
          permissions: ['promotions:*', 'coupons:*', 'newsletters:*', 'customers:segments'],
        },
        {
          name: 'support',
          label: 'Support client',
          description: 'Support et service client',
          permissions: ['customers:read', 'orders:read', 'reviews:*'],
        },
      ],
      permissions: [
        { name: 'products:read', label: 'Voir les produits' },
        { name: 'products:write', label: 'Modifier les produits' },
        { name: 'products:delete', label: 'Supprimer les produits' },
        { name: 'orders:read', label: 'Voir les commandes' },
        { name: 'orders:write', label: 'Modifier les commandes' },
        { name: 'customers:read', label: 'Voir les clients' },
        { name: 'customers:write', label: 'Modifier les clients' },
        { name: 'inventory:read', label: 'Voir l\'inventaire' },
        { name: 'inventory:write', label: 'Modifier l\'inventaire' },
        { name: 'reports:read', label: 'Voir les rapports' },
        { name: 'promotions:read', label: 'Voir les promotions' },
        { name: 'promotions:write', label: 'Modifier les promotions' },
      ],
      middleware: {
        enabled: true,
        publicRoutes: ['/', '/login', '/signup', '/forgot-password'],
        protectedRoutes: ['/dashboard', '/products', '/orders', '/customers'],
        adminRoutes: ['/settings/users', '/settings/roles'],
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
    styling: {
      theme: 'system',
      variant: 'modern',
      sidebarWidth: 320,
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
  });

  const generator = new NavigationGenerator(config);
  return generator.generate();
}

/**
 * Exemple 5: Navigation SaaS avec multi-tenancy
 */
export function generateSaaSNavigation() {
  const navigation: NavigationStructure = {
    items: [],
    groups: [
      {
        id: 'workspace',
        label: 'Espace de travail',
        items: [
          {
            id: 'dashboard',
            label: 'Tableau de bord',
            href: '/dashboard',
            icon: 'LayoutDashboard',
          },
          {
            id: 'projects',
            label: 'Projets',
            href: '/projects',
            icon: 'FolderOpen',
            badge: '5',
          },
          {
            id: 'tasks',
            label: 'Tâches',
            href: '/tasks',
            icon: 'CheckSquare',
          },
          {
            id: 'calendar',
            label: 'Calendrier',
            href: '/calendar',
            icon: 'Calendar',
          },
        ],
      },
      {
        id: 'team',
        label: 'Équipe',
        items: [
          {
            id: 'members',
            label: 'Membres',
            href: '/team/members',
            icon: 'Users',
          },
          {
            id: 'invitations',
            label: 'Invitations',
            href: '/team/invitations',
            icon: 'UserPlus',
            roles: ['admin', 'manager'],
          },
          {
            id: 'roles',
            label: 'Rôles',
            href: '/team/roles',
            icon: 'Shield',
            roles: ['admin'],
          },
        ],
      },
      {
        id: 'organization',
        label: 'Organisation',
        items: [
          {
            id: 'billing',
            label: 'Facturation',
            href: '/billing',
            icon: 'CreditCard',
            roles: ['admin', 'billing'],
          },
          {
            id: 'usage',
            label: 'Utilisation',
            href: '/usage',
            icon: 'BarChart3',
            roles: ['admin'],
          },
          {
            id: 'settings',
            label: 'Paramètres',
            href: '/settings',
            icon: 'Settings',
            roles: ['admin'],
          },
        ],
      },
    ],
  };

  const config = createNavigationConfig('SaaS Platform', navigation, {
    layout: {
      type: 'hybrid',
      responsive: true,
      stickyHeader: true,
      stickyFooter: false,
      padding: 'lg',
    },
    features: [
      'breadcrumbs',
      'sidebar',
      'mobile-menu',
      'command-palette',
      'notifications',
      'user-menu',
      'theme-switcher',
    ],
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
          name: 'manager',
          label: 'Gestionnaire',
          permissions: ['team:read', 'team:write', 'projects:*'],
        },
        {
          name: 'member',
          label: 'Membre',
          permissions: ['projects:read', 'tasks:*'],
        },
        {
          name: 'billing',
          label: 'Facturation',
          permissions: ['billing:*', 'usage:read'],
        },
      ],
      permissions: [
        { name: 'projects:read', label: 'Voir les projets' },
        { name: 'projects:write', label: 'Modifier les projets' },
        { name: 'tasks:read', label: 'Voir les tâches' },
        { name: 'tasks:write', label: 'Modifier les tâches' },
        { name: 'team:read', label: 'Voir l\'équipe' },
        { name: 'team:write', label: 'Gérer l\'équipe' },
        { name: 'billing:read', label: 'Voir la facturation' },
        { name: 'billing:write', label: 'Gérer la facturation' },
      ],
      middleware: {
        enabled: true,
        publicRoutes: ['/', '/login', '/signup', '/pricing'],
        protectedRoutes: ['/dashboard', '/projects', '/tasks', '/team'],
        adminRoutes: ['/settings', '/team/roles'],
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
  });

  const generator = new NavigationGenerator(config);
  return generator.generate();
}

/**
 * Utilitaire pour tester la génération de tous les exemples de navigation
 */
export function generateAllNavigationExamples() {
  return {
    simple: generateSimpleNavigation(),
    dashboard: generateDashboardNavigation(),
    admin: generateAdminNavigation(),
    ecommerce: generateEcommerceNavigation(),
    saas: generateSaaSNavigation(),
  };
}
