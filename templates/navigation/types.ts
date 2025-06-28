/**
 * Types TypeScript pour le template Navigation
 * Génère tous les types nécessaires pour la navigation
 */

import { NavigationConfig } from "./index";
import { FileTemplate } from "../types";

/**
 * Génère les types TypeScript pour la navigation
 */
export function generateNavigationTypes(config: NavigationConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Types principaux de navigation
  files.push(generateMainNavigationTypes(config));

  // Types pour les permissions
  if (config.security.authorization) {
    files.push(generatePermissionTypes(config));
  }

  // Types pour les hooks
  files.push(generateNavigationHookTypes(config));

  return files;
}

/**
 * Génère les types principaux de navigation
 */
function generateMainNavigationTypes(config: NavigationConfig): FileTemplate {
  return {
    path: 'shared/types/navigation.ts',
    content: `/**
 * Types TypeScript pour la navigation
 * Générés automatiquement - Ne pas modifier manuellement
 */

// Types de base pour la navigation
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

export interface NavigationGroup {
  id: string;
  label: string;
  items: NavigationItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
  roles?: string[];
}

export interface NavigationStructure {
  items: NavigationItem[];
  groups: NavigationGroup[];
  footer?: NavigationFooter;
}

export interface NavigationFooter {
  items: NavigationItem[];
  copyright?: string;
  links?: { label: string; href: string }[];
}

// Types pour les layouts
export type LayoutType = 'sidebar' | 'header' | 'hybrid' | 'dashboard';

export interface LayoutConfig {
  type: LayoutType;
  responsive: boolean;
  stickyHeader: boolean;
  stickyFooter: boolean;
  maxWidth?: string;
  padding: 'none' | 'sm' | 'md' | 'lg';
}

// Types pour les fonctionnalités
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

// Types pour le style
export interface NavigationStyling {
  theme: 'light' | 'dark' | 'system';
  variant: 'default' | 'minimal' | 'modern' | 'classic';
  sidebarWidth: number;
  headerHeight: number;
  colors: NavigationColors;
  animations: boolean;
}

export interface NavigationColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
}

// Types pour les breadcrumbs
export interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: string;
}

export interface BreadcrumbConfig {
  separator?: string;
  maxItems?: number;
  showHome?: boolean;
  homeIcon?: string;
}

// Types pour la command palette
export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  action: () => void;
  keywords?: string[];
  group?: string;
}

export interface CommandGroup {
  id: string;
  label: string;
  items: CommandItem[];
}

// Types pour les notifications
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

// Types pour l'historique de navigation
export interface NavigationHistoryItem {
  path: string;
  title: string;
  timestamp: Date;
}

// Types pour les favoris
export interface FavoriteItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  order: number;
}`,
  };
}

/**
 * Génère les types pour les permissions
 */
function generatePermissionTypes(config: NavigationConfig): FileTemplate {
  return {
    path: 'shared/types/navigation-permissions.ts',
    content: `/**
 * Types pour les permissions de navigation
 */

// Types de base pour les permissions
export interface Role {
  name: string;
  label: string;
  description?: string;
  permissions: string[];
  inherits?: string[];
}

export interface Permission {
  name: string;
  label: string;
  description?: string;
  resource?: string;
  action?: string;
}

// Types pour la configuration de sécurité
export interface SecurityConfig {
  authentication: boolean;
  authorization: boolean;
  roles: Role[];
  permissions: Permission[];
  middleware: MiddlewareConfig;
  redirects: RedirectConfig;
}

export interface MiddlewareConfig {
  enabled: boolean;
  publicRoutes: string[];
  protectedRoutes: string[];
  adminRoutes: string[];
  redirectAfterLogin: string;
  redirectAfterLogout: string;
  unauthorizedRedirect: string;
}

export interface RedirectConfig {
  afterLogin: string;
  afterLogout: string;
  unauthorized: string;
  notFound: string;
}

// Types pour la vérification des permissions
export interface PermissionCheck {
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  canAccess: (item: NavigationItem) => boolean;
}

// Types pour l'utilisateur
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
}

// Types pour la session
export interface Session {
  user: User;
  expires: Date;
  accessToken?: string;
  refreshToken?: string;
}

// Types pour les actions d'authentification
export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<Session>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<Session>;
  refreshSession: () => Promise<Session>;
  checkPermission: (permission: string) => Promise<boolean>;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}`,
  };
}

/**
 * Génère les types pour les hooks de navigation
 */
function generateNavigationHookTypes(config: NavigationConfig): FileTemplate {
  return {
    path: 'shared/types/navigation-hooks.ts',
    content: `/**
 * Types pour les hooks de navigation
 */

import type { NavigationItem, BreadcrumbItem, CommandItem, NotificationItem } from './navigation';

// Hook de navigation principal
export interface UseNavigationReturn {
  pathname: string;
  isActive: (href: string) => boolean;
  navigate: (href: string) => void;
  goBack: () => void;
  goForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

// Hook de breadcrumbs
export interface UseBreadcrumbsReturn {
  items: BreadcrumbItem[];
  addItem: (item: BreadcrumbItem) => void;
  removeItem: (href: string) => void;
  clear: () => void;
}

// Hook de command palette
export interface UseCommandPaletteReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  search: string;
  setSearch: (search: string) => void;
  filteredItems: CommandItem[];
  executeCommand: (command: CommandItem) => void;
}

// Hook de notifications
export interface UseNotificationsReturn {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => void;
}

// Hook de sidebar
export interface UseSidebarReturn {
  isOpen: boolean;
  isCollapsed: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  collapse: () => void;
  expand: () => void;
}

// Hook de thème
export interface UseThemeReturn {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  resolvedTheme: 'light' | 'dark';
}

// Hook de permissions
export interface UsePermissionsReturn {
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  canAccess: (item: NavigationItem) => boolean;
  user: User | null;
  loading: boolean;
}

// Hook de favoris
export interface UseFavoritesReturn {
  favorites: FavoriteItem[];
  addFavorite: (item: Omit<FavoriteItem, 'id' | 'order'>) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (href: string) => boolean;
  reorderFavorites: (items: FavoriteItem[]) => void;
}`,
  };
}
