/**
 * Utilitaires pour le template Navigation
 * Fonctions helper et utilitaires réutilisables pour la navigation
 */

import { NavigationConfig, NavigationItem } from "./index";
import { FileTemplate } from "../types";

/**
 * Génère les utilitaires pour la navigation
 */
export function generateNavigationUtilities(config: NavigationConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Utilitaires principaux
  files.push(generateMainNavigationUtilities(config));

  // Utilitaires de permissions
  if (config.security.authorization) {
    files.push(generatePermissionUtilities(config));
  }

  // Utilitaires de formatage
  files.push(generateFormattingUtilities(config));

  return files;
}

/**
 * Génère les utilitaires principaux de navigation
 */
function generateMainNavigationUtilities(config: NavigationConfig): FileTemplate {
  return {
    path: 'src/lib/navigation-utils.ts',
    content: `/**
 * Utilitaires pour la navigation
 * Fonctions helper pour les opérations de navigation
 */

import type { NavigationItem, NavigationGroup, BreadcrumbItem } from "@/shared/types/navigation";

/**
 * Filtre les éléments de navigation selon les rôles de l'utilisateur
 */
export function filterNavigationByRoles(
  items: NavigationItem[],
  userRoles: string[]
): NavigationItem[] {
  return items
    .filter(item => canAccessNavigationItem(item, userRoles))
    .map(item => ({
      ...item,
      children: item.children ? filterNavigationByRoles(item.children, userRoles) : undefined,
    }));
}

/**
 * Filtre les groupes de navigation selon les rôles de l'utilisateur
 */
export function filterNavigationGroupsByRoles(
  groups: NavigationGroup[],
  userRoles: string[]
): NavigationGroup[] {
  return groups
    .filter(group => canAccessNavigationGroup(group, userRoles))
    .map(group => ({
      ...group,
      items: filterNavigationByRoles(group.items, userRoles),
    }))
    .filter(group => group.items.length > 0);
}

/**
 * Vérifie si un utilisateur peut accéder à un élément de navigation
 */
export function canAccessNavigationItem(
  item: NavigationItem,
  userRoles: string[]
): boolean {
  // Si aucun rôle n'est spécifié, l'élément est accessible à tous
  if (!item.roles || item.roles.length === 0) {
    return true;
  }

  // Vérifier si l'utilisateur a au moins un des rôles requis
  return item.roles.some(role => userRoles.includes(role));
}

/**
 * Vérifie si un utilisateur peut accéder à un groupe de navigation
 */
export function canAccessNavigationGroup(
  group: NavigationGroup,
  userRoles: string[]
): boolean {
  // Si aucun rôle n'est spécifié, le groupe est accessible à tous
  if (!group.roles || group.roles.length === 0) {
    return true;
  }

  // Vérifier si l'utilisateur a au moins un des rôles requis
  return group.roles.some(role => userRoles.includes(role));
}

/**
 * Trouve un élément de navigation par son ID
 */
export function findNavigationItem(
  items: NavigationItem[],
  id: string
): NavigationItem | null {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    
    if (item.children) {
      const found = findNavigationItem(item.children, id);
      if (found) {
        return found;
      }
    }
  }
  
  return null;
}

/**
 * Trouve un élément de navigation par son href
 */
export function findNavigationItemByHref(
  items: NavigationItem[],
  href: string
): NavigationItem | null {
  for (const item of items) {
    if (item.href === href) {
      return item;
    }
    
    if (item.children) {
      const found = findNavigationItemByHref(item.children, href);
      if (found) {
        return found;
      }
    }
  }
  
  return null;
}

/**
 * Génère les breadcrumbs pour un chemin donné
 */
export function generateBreadcrumbs(
  pathname: string,
  navigationItems: NavigationItem[]
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Ajouter l'accueil
  breadcrumbs.push({
    label: 'Accueil',
    href: '/',
    icon: 'Home',
  });

  // Diviser le chemin en segments
  const segments = pathname.split('/').filter(Boolean);
  
  // Construire les breadcrumbs pour chaque segment
  for (let i = 0; i < segments.length; i++) {
    const currentPath = '/' + segments.slice(0, i + 1).join('/');
    const item = findNavigationItemByHref(navigationItems, currentPath);
    
    if (item) {
      breadcrumbs.push({
        label: item.label,
        href: currentPath,
        icon: item.icon,
      });
    } else {
      // Générer un label à partir du segment
      const label = segments[i]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        label,
        href: currentPath,
      });
    }
  }

  return breadcrumbs;
}

/**
 * Vérifie si un chemin est actif
 */
export function isPathActive(currentPath: string, itemPath: string): boolean {
  if (itemPath === '/') {
    return currentPath === '/';
  }
  
  return currentPath === itemPath || currentPath.startsWith(itemPath + '/');
}

/**
 * Obtient tous les éléments de navigation de manière plate
 */
export function flattenNavigationItems(items: NavigationItem[]): NavigationItem[] {
  const flattened: NavigationItem[] = [];
  
  for (const item of items) {
    flattened.push(item);
    
    if (item.children) {
      flattened.push(...flattenNavigationItems(item.children));
    }
  }
  
  return flattened;
}

/**
 * Construit l'arbre de navigation avec les états actifs
 */
export function buildNavigationTree(
  items: NavigationItem[],
  currentPath: string
): NavigationItem[] {
  return items.map(item => ({
    ...item,
    active: isPathActive(currentPath, item.href || ''),
    children: item.children ? buildNavigationTree(item.children, currentPath) : undefined,
  }));
}

/**
 * Génère les mots-clés de recherche pour un élément de navigation
 */
export function generateSearchKeywords(item: NavigationItem): string[] {
  const keywords: string[] = [];
  
  // Ajouter le label
  keywords.push(item.label.toLowerCase());
  
  // Ajouter la description si elle existe
  if (item.description) {
    keywords.push(...item.description.toLowerCase().split(' '));
  }
  
  // Ajouter des mots-clés basés sur l'href
  if (item.href) {
    const pathSegments = item.href.split('/').filter(Boolean);
    keywords.push(...pathSegments);
  }
  
  return [...new Set(keywords)]; // Supprimer les doublons
}

/**
 * Trie les éléments de navigation par ordre alphabétique
 */
export function sortNavigationItems(items: NavigationItem[]): NavigationItem[] {
  return [...items].sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Groupe les éléments de navigation par catégorie
 */
export function groupNavigationItems(
  items: NavigationItem[],
  groupBy: (item: NavigationItem) => string
): Record<string, NavigationItem[]> {
  const groups: Record<string, NavigationItem[]> = {};
  
  for (const item of items) {
    const category = groupBy(item);
    
    if (!groups[category]) {
      groups[category] = [];
    }
    
    groups[category].push(item);
  }
  
  return groups;
}`,
  };
}

/**
 * Génère les utilitaires de permissions
 */
function generatePermissionUtilities(config: NavigationConfig): FileTemplate {
  return {
    path: 'src/lib/navigation-permissions.ts',
    content: `/**
 * Utilitaires pour les permissions de navigation
 * Fonctions helper pour la gestion des permissions
 */

import type { User, Role, Permission } from "@/shared/types/navigation-permissions";
import type { NavigationItem } from "@/shared/types/navigation";

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export function hasPermission(user: User, permission: string): boolean {
  return user.permissions.includes(permission) || user.permissions.includes('*');
}

/**
 * Vérifie si un utilisateur a un rôle spécifique
 */
export function hasRole(user: User, role: string): boolean {
  return user.roles.includes(role);
}

/**
 * Vérifie si un utilisateur a au moins un des rôles spécifiés
 */
export function hasAnyRole(user: User, roles: string[]): boolean {
  return roles.some(role => user.roles.includes(role));
}

/**
 * Vérifie si un utilisateur a tous les rôles spécifiés
 */
export function hasAllRoles(user: User, roles: string[]): boolean {
  return roles.every(role => user.roles.includes(role));
}

/**
 * Vérifie si un utilisateur peut accéder à un élément de navigation
 */
export function canAccessNavigationItem(user: User, item: NavigationItem): boolean {
  // Vérifier les rôles
  if (item.roles && item.roles.length > 0) {
    if (!hasAnyRole(user, item.roles)) {
      return false;
    }
  }
  
  // Vérifier les permissions
  if (item.permissions && item.permissions.length > 0) {
    if (!item.permissions.some(permission => hasPermission(user, permission))) {
      return false;
    }
  }
  
  return true;
}

/**
 * Obtient toutes les permissions d'un utilisateur (directes + héritées des rôles)
 */
export function getUserPermissions(user: User, roles: Role[]): string[] {
  const permissions = new Set(user.permissions);
  
  // Ajouter les permissions des rôles
  for (const roleName of user.roles) {
    const role = roles.find(r => r.name === roleName);
    if (role) {
      role.permissions.forEach(permission => permissions.add(permission));
      
      // Gérer l'héritage de rôles
      if (role.inherits) {
        for (const inheritedRoleName of role.inherits) {
          const inheritedRole = roles.find(r => r.name === inheritedRoleName);
          if (inheritedRole) {
            inheritedRole.permissions.forEach(permission => permissions.add(permission));
          }
        }
      }
    }
  }
  
  return Array.from(permissions);
}

/**
 * Vérifie si un chemin est protégé
 */
export function isProtectedPath(pathname: string, protectedRoutes: string[]): boolean {
  return protectedRoutes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}

/**
 * Vérifie si un chemin nécessite des privilèges admin
 */
export function isAdminPath(pathname: string, adminRoutes: string[]): boolean {
  return adminRoutes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}

/**
 * Obtient la route de redirection appropriée pour un utilisateur
 */
export function getRedirectRoute(
  user: User | null,
  requestedPath: string,
  config: {
    publicRoutes: string[];
    protectedRoutes: string[];
    adminRoutes: string[];
    redirectAfterLogin: string;
    redirectAfterLogout: string;
    unauthorizedRedirect: string;
  }
): string | null {
  // Si l'utilisateur n'est pas connecté
  if (!user) {
    if (isProtectedPath(requestedPath, config.protectedRoutes) || 
        isAdminPath(requestedPath, config.adminRoutes)) {
      return '/login?callbackUrl=' + encodeURIComponent(requestedPath);
    }
    return null;
  }
  
  // Si l'utilisateur est connecté mais n'a pas les permissions pour une route admin
  if (isAdminPath(requestedPath, config.adminRoutes)) {
    if (!hasAnyRole(user, ['admin', 'superAdmin'])) {
      return config.unauthorizedRedirect;
    }
  }
  
  return null;
}

/**
 * Filtre les permissions par ressource
 */
export function filterPermissionsByResource(
  permissions: Permission[],
  resource: string
): Permission[] {
  return permissions.filter(permission => 
    permission.resource === resource || !permission.resource
  );
}

/**
 * Groupe les permissions par action
 */
export function groupPermissionsByAction(permissions: Permission[]): Record<string, Permission[]> {
  const groups: Record<string, Permission[]> = {};
  
  for (const permission of permissions) {
    const action = permission.action || 'general';
    
    if (!groups[action]) {
      groups[action] = [];
    }
    
    groups[action].push(permission);
  }
  
  return groups;
}`,
  };
}

/**
 * Génère les utilitaires de formatage
 */
function generateFormattingUtilities(config: NavigationConfig): FileTemplate {
  return {
    path: 'src/lib/navigation-formatters.ts',
    content: `/**
 * Formatters pour la navigation
 * Fonctions de formatage et d'affichage pour la navigation
 */

import type { NavigationItem, BreadcrumbItem, NotificationItem } from "@/shared/types/navigation";

/**
 * Formate un élément de navigation pour l'affichage
 */
export function formatNavigationItem(item: NavigationItem): {
  displayLabel: string;
  displayIcon: string;
  displayBadge: string;
  displayDescription: string;
} {
  return {
    displayLabel: item.label || 'Sans titre',
    displayIcon: item.icon || 'Circle',
    displayBadge: item.badge || '',
    displayDescription: item.description || '',
  };
}

/**
 * Formate un breadcrumb pour l'affichage
 */
export function formatBreadcrumb(item: BreadcrumbItem): string {
  return item.label;
}

/**
 * Formate une notification pour l'affichage
 */
export function formatNotification(notification: NotificationItem): {
  displayTitle: string;
  displayMessage: string;
  displayTime: string;
  displayType: string;
} {
  return {
    displayTitle: notification.title,
    displayMessage: truncateText(notification.message, 100),
    displayTime: formatRelativeTime(notification.timestamp),
    displayType: getNotificationTypeLabel(notification.type),
  };
}

/**
 * Tronque un texte avec ellipses
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Formate un temps relatif
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'À l\\'instant';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return \`Il y a \${diffInMinutes} minute\${diffInMinutes > 1 ? 's' : ''}\`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return \`Il y a \${diffInHours} heure\${diffInHours > 1 ? 's' : ''}\`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return \`Il y a \${diffInDays} jour\${diffInDays > 1 ? 's' : ''}\`;
  }
  
  return date.toLocaleDateString('fr-FR');
}

/**
 * Obtient le label d'un type de notification
 */
export function getNotificationTypeLabel(type: 'info' | 'success' | 'warning' | 'error'): string {
  const labels = {
    info: 'Information',
    success: 'Succès',
    warning: 'Attention',
    error: 'Erreur',
  };
  
  return labels[type] || 'Information';
}

/**
 * Génère une classe CSS pour un type de notification
 */
export function getNotificationTypeClass(type: 'info' | 'success' | 'warning' | 'error'): string {
  const classes = {
    info: 'bg-blue-50 text-blue-900 border-blue-200',
    success: 'bg-green-50 text-green-900 border-green-200',
    warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    error: 'bg-red-50 text-red-900 border-red-200',
  };
  
  return classes[type] || classes.info;
}

/**
 * Formate un chemin pour l'affichage
 */
export function formatPath(path: string): string {
  return path
    .split('/')
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' > ');
}

/**
 * Génère un slug à partir d'un texte
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Capitalise la première lettre d'un texte
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Formate un nom de rôle pour l'affichage
 */
export function formatRoleName(role: string): string {
  return role
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
}`,
  };
}
