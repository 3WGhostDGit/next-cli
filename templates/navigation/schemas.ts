/**
 * Générateur de schémas Zod pour le template Navigation
 * Crée des schémas de validation pour la navigation et les permissions
 */

import { NavigationConfig } from "./index";
import { FileTemplate } from "../types";

/**
 * Génère les schémas Zod pour la navigation
 */
export function generateNavigationSchemas(config: NavigationConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Schémas principaux de navigation
  files.push(generateMainNavigationSchemas(config));

  // Schémas pour les permissions
  if (config.security.authorization) {
    files.push(generatePermissionSchemas(config));
  }

  // Schémas pour les actions utilisateur
  files.push(generateUserActionSchemas(config));

  return files;
}

/**
 * Génère les schémas principaux de navigation
 */
function generateMainNavigationSchemas(config: NavigationConfig): FileTemplate {
  return {
    path: 'shared/validation/navigation.ts',
    content: `/**
 * Schémas de validation Zod pour la navigation
 * Générés automatiquement - Ne pas modifier manuellement
 */

import { z } from "zod";

// Schéma pour un élément de navigation
export const navigationItemSchema = z.object({
  id: z.string().min(1, "L'ID est requis"),
  label: z.string().min(1, "Le label est requis"),
  href: z.string().optional(),
  icon: z.string().optional(),
  badge: z.string().optional(),
  description: z.string().optional(),
  children: z.array(z.lazy(() => navigationItemSchema)).optional(),
  roles: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
  external: z.boolean().default(false),
  disabled: z.boolean().default(false),
  separator: z.boolean().default(false),
});

// Schéma pour un groupe de navigation
export const navigationGroupSchema = z.object({
  id: z.string().min(1, "L'ID est requis"),
  label: z.string().min(1, "Le label est requis"),
  items: z.array(navigationItemSchema),
  collapsible: z.boolean().default(false),
  defaultOpen: z.boolean().default(true),
  roles: z.array(z.string()).optional(),
});

// Schéma pour le pied de page de navigation
export const navigationFooterSchema = z.object({
  items: z.array(navigationItemSchema),
  copyright: z.string().optional(),
  links: z.array(z.object({
    label: z.string(),
    href: z.string().url("URL invalide"),
  })).optional(),
});

// Schéma pour la structure de navigation complète
export const navigationStructureSchema = z.object({
  items: z.array(navigationItemSchema),
  groups: z.array(navigationGroupSchema),
  footer: navigationFooterSchema.optional(),
});

// Schéma pour la configuration de layout
export const layoutConfigSchema = z.object({
  type: z.enum(['sidebar', 'header', 'hybrid', 'dashboard']),
  responsive: z.boolean().default(true),
  stickyHeader: z.boolean().default(true),
  stickyFooter: z.boolean().default(false),
  maxWidth: z.string().optional(),
  padding: z.enum(['none', 'sm', 'md', 'lg']).default('md'),
});

// Schéma pour les couleurs de navigation
export const navigationColorsSchema = z.object({
  primary: z.string().regex(/^hsl\\(/, "Format HSL requis"),
  secondary: z.string().regex(/^hsl\\(/, "Format HSL requis"),
  accent: z.string().regex(/^hsl\\(/, "Format HSL requis"),
  background: z.string().regex(/^hsl\\(/, "Format HSL requis"),
  foreground: z.string().regex(/^hsl\\(/, "Format HSL requis"),
  muted: z.string().regex(/^hsl\\(/, "Format HSL requis"),
});

// Schéma pour le style de navigation
export const navigationStylingSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  variant: z.enum(['default', 'minimal', 'modern', 'classic']).default('default'),
  sidebarWidth: z.number().min(200).max(400).default(280),
  headerHeight: z.number().min(48).max(80).default(64),
  colors: navigationColorsSchema,
  animations: z.boolean().default(true),
});

// Schéma pour les breadcrumbs
export const breadcrumbItemSchema = z.object({
  label: z.string().min(1, "Le label est requis"),
  href: z.string().min(1, "L'URL est requise"),
  icon: z.string().optional(),
});

export const breadcrumbConfigSchema = z.object({
  separator: z.string().default('/'),
  maxItems: z.number().min(1).max(10).default(5),
  showHome: z.boolean().default(true),
  homeIcon: z.string().default('Home'),
});

// Schéma pour les commandes
export const commandItemSchema = z.object({
  id: z.string().min(1, "L'ID est requis"),
  label: z.string().min(1, "Le label est requis"),
  description: z.string().optional(),
  icon: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  group: z.string().optional(),
});

export const commandGroupSchema = z.object({
  id: z.string().min(1, "L'ID est requis"),
  label: z.string().min(1, "Le label est requis"),
  items: z.array(commandItemSchema),
});

// Schéma pour les notifications
export const notificationItemSchema = z.object({
  id: z.string().min(1, "L'ID est requis"),
  title: z.string().min(1, "Le titre est requis"),
  message: z.string().min(1, "Le message est requis"),
  type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
  timestamp: z.date(),
  read: z.boolean().default(false),
  action: z.object({
    label: z.string(),
    href: z.string(),
  }).optional(),
});

// Schéma pour les favoris
export const favoriteItemSchema = z.object({
  id: z.string().min(1, "L'ID est requis"),
  label: z.string().min(1, "Le label est requis"),
  href: z.string().min(1, "L'URL est requise"),
  icon: z.string().optional(),
  order: z.number().min(0),
});

// Types inférés des schémas
export type NavigationItemData = z.infer<typeof navigationItemSchema>;
export type NavigationGroupData = z.infer<typeof navigationGroupSchema>;
export type NavigationStructureData = z.infer<typeof navigationStructureSchema>;
export type LayoutConfigData = z.infer<typeof layoutConfigSchema>;
export type NavigationStylingData = z.infer<typeof navigationStylingSchema>;
export type BreadcrumbItemData = z.infer<typeof breadcrumbItemSchema>;
export type CommandItemData = z.infer<typeof commandItemSchema>;
export type NotificationItemData = z.infer<typeof notificationItemSchema>;
export type FavoriteItemData = z.infer<typeof favoriteItemSchema>;`,
  };
}

/**
 * Génère les schémas pour les permissions
 */
function generatePermissionSchemas(config: NavigationConfig): FileTemplate {
  return {
    path: 'shared/validation/navigation-permissions.ts',
    content: `/**
 * Schémas de validation pour les permissions de navigation
 */

import { z } from "zod";

// Schéma pour un rôle
export const roleSchema = z.object({
  name: z.string().min(1, "Le nom est requis").regex(/^[a-z][a-z0-9_]*$/, "Format invalide"),
  label: z.string().min(1, "Le label est requis"),
  description: z.string().optional(),
  permissions: z.array(z.string()),
  inherits: z.array(z.string()).optional(),
});

// Schéma pour une permission
export const permissionSchema = z.object({
  name: z.string().min(1, "Le nom est requis").regex(/^[a-z][a-z0-9_:]*$/, "Format invalide"),
  label: z.string().min(1, "Le label est requis"),
  description: z.string().optional(),
  resource: z.string().optional(),
  action: z.string().optional(),
});

// Schéma pour la configuration du middleware
export const middlewareConfigSchema = z.object({
  enabled: z.boolean().default(true),
  publicRoutes: z.array(z.string()),
  protectedRoutes: z.array(z.string()),
  adminRoutes: z.array(z.string()),
  redirectAfterLogin: z.string().min(1, "URL de redirection requise"),
  redirectAfterLogout: z.string().min(1, "URL de redirection requise"),
  unauthorizedRedirect: z.string().min(1, "URL de redirection requise"),
});

// Schéma pour la configuration des redirections
export const redirectConfigSchema = z.object({
  afterLogin: z.string().min(1, "URL requise"),
  afterLogout: z.string().min(1, "URL requise"),
  unauthorized: z.string().min(1, "URL requise"),
  notFound: z.string().min(1, "URL requise"),
});

// Schéma pour la configuration de sécurité
export const securityConfigSchema = z.object({
  authentication: z.boolean().default(true),
  authorization: z.boolean().default(true),
  roles: z.array(roleSchema),
  permissions: z.array(permissionSchema),
  middleware: middlewareConfigSchema,
  redirects: redirectConfigSchema,
});

// Schéma pour un utilisateur
export const userSchema = z.object({
  id: z.string().uuid("ID utilisateur invalide"),
  email: z.string().email("Email invalide"),
  name: z.string().optional(),
  avatar: z.string().url("URL d'avatar invalide").optional(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
});

// Schéma pour une session
export const sessionSchema = z.object({
  user: userSchema,
  expires: z.date(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
});

// Schéma pour les identifiants de connexion
export const loginCredentialsSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe trop court"),
  remember: z.boolean().default(false),
});

// Schéma pour les données d'inscription
export const registerDataSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe trop court"),
  name: z.string().min(2, "Nom trop court").optional(),
});

// Types inférés des schémas
export type RoleData = z.infer<typeof roleSchema>;
export type PermissionData = z.infer<typeof permissionSchema>;
export type SecurityConfigData = z.infer<typeof securityConfigSchema>;
export type UserData = z.infer<typeof userSchema>;
export type SessionData = z.infer<typeof sessionSchema>;
export type LoginCredentialsData = z.infer<typeof loginCredentialsSchema>;
export type RegisterDataData = z.infer<typeof registerDataSchema>;`,
  };
}

/**
 * Génère les schémas pour les actions utilisateur
 */
function generateUserActionSchemas(config: NavigationConfig): FileTemplate {
  return {
    path: 'shared/validation/navigation-actions.ts',
    content: `/**
 * Schémas de validation pour les actions utilisateur de navigation
 */

import { z } from "zod";

// Schéma pour ajouter un favori
export const addFavoriteSchema = z.object({
  label: z.string().min(1, "Le label est requis"),
  href: z.string().min(1, "L'URL est requise"),
  icon: z.string().optional(),
});

// Schéma pour réorganiser les favoris
export const reorderFavoritesSchema = z.object({
  favorites: z.array(z.object({
    id: z.string(),
    order: z.number().min(0),
  })),
});

// Schéma pour marquer une notification comme lue
export const markNotificationReadSchema = z.object({
  notificationId: z.string().uuid("ID de notification invalide"),
});

// Schéma pour ajouter une notification
export const addNotificationSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  message: z.string().min(1, "Le message est requis"),
  type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
  action: z.object({
    label: z.string(),
    href: z.string(),
  }).optional(),
});

// Schéma pour exécuter une commande
export const executeCommandSchema = z.object({
  commandId: z.string().min(1, "L'ID de commande est requis"),
  context: z.record(z.any()).optional(),
});

// Schéma pour la recherche dans la command palette
export const commandSearchSchema = z.object({
  query: z.string().max(100, "Requête trop longue"),
  limit: z.number().min(1).max(50).default(10),
});

// Schéma pour mettre à jour les préférences de navigation
export const updateNavigationPreferencesSchema = z.object({
  sidebarCollapsed: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  compactMode: z.boolean().optional(),
  showBreadcrumbs: z.boolean().optional(),
  showNotifications: z.boolean().optional(),
});

// Types inférés des schémas
export type AddFavoriteData = z.infer<typeof addFavoriteSchema>;
export type ReorderFavoritesData = z.infer<typeof reorderFavoritesSchema>;
export type MarkNotificationReadData = z.infer<typeof markNotificationReadSchema>;
export type AddNotificationData = z.infer<typeof addNotificationSchema>;
export type ExecuteCommandData = z.infer<typeof executeCommandSchema>;
export type CommandSearchData = z.infer<typeof commandSearchSchema>;
export type UpdateNavigationPreferencesData = z.infer<typeof updateNavigationPreferencesSchema>;`,
  };
}
