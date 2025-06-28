/**
 * Générateur de middleware de sécurité pour Next.js
 * Crée un middleware complet avec authentification, autorisation et protection par rôles
 */

import { NavigationConfig } from './index';
import { FileTemplate } from '../types';

/**
 * Générateur de middleware de sécurité
 */
export class MiddlewareGenerator {
  constructor(private config: NavigationConfig) {}

  /**
   * Génère le fichier middleware.ts
   */
  generate(): FileTemplate {
    return {
      path: 'middleware.ts',
      content: this.generateMiddlewareContent(),
    };
  }

  /**
   * Génère le contenu du middleware
   */
  private generateMiddlewareContent(): string {
    const imports = this.generateImports();
    const helpers = this.generateHelpers();
    const mainFunction = this.generateMainFunction();
    const config = this.generateConfig();

    return `${imports}

${helpers}

${mainFunction}

${config}`;
  }

  /**
   * Génère les imports nécessaires
   */
  private generateImports(): string {
    const baseImports = [
      'import { NextRequest, NextResponse } from "next/server";',
    ];

    if (this.config.security.authentication) {
      baseImports.push('import { getSessionCookie } from "better-auth/cookies";');
      baseImports.push('import { auth } from "@/lib/auth";');
    }

    if (this.config.security.authorization) {
      baseImports.push('import { checkUserPermissions } from "@/lib/permissions";');
    }

    return baseImports.join('\n');
  }

  /**
   * Génère les fonctions helper
   */
  private generateHelpers(): string {
    const helpers: string[] = [];

    // Helper pour vérifier les routes publiques
    helpers.push(`/**
 * Vérifie si une route est publique
 */
function isPublicRoute(pathname: string): boolean {
  const publicRoutes = ${JSON.stringify(this.config.security.middleware.publicRoutes)};
  
  return publicRoutes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}`);

    // Helper pour vérifier les routes admin
    if (this.config.security.middleware.adminRoutes.length > 0) {
      helpers.push(`/**
 * Vérifie si une route nécessite des privilèges admin
 */
function isAdminRoute(pathname: string): boolean {
  const adminRoutes = ${JSON.stringify(this.config.security.middleware.adminRoutes)};
  
  return adminRoutes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}`);
    }

    // Helper pour vérifier les routes protégées
    helpers.push(`/**
 * Vérifie si une route est protégée
 */
function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = ${JSON.stringify(this.config.security.middleware.protectedRoutes)};
  
  return protectedRoutes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}`);

    // Helper pour logger les accès
    helpers.push(`/**
 * Log les tentatives d'accès pour audit
 */
function logAccess(request: NextRequest, action: string, details?: any) {
  const logData = {
    timestamp: new Date().toISOString(),
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    pathname: request.nextUrl.pathname,
    action,
    details,
  };
  
  // TODO: Implémenter le logging (base de données, service externe, etc.)
  console.log('[MIDDLEWARE]', JSON.stringify(logData));
}`);

    return helpers.join('\n\n');
  }

  /**
   * Génère la fonction principale du middleware
   */
  private generateMainFunction(): string {
    const authCheck = this.generateAuthenticationCheck();
    const roleCheck = this.generateAuthorizationCheck();

    return `/**
 * Middleware de sécurité Next.js
 * Gère l'authentification, l'autorisation et la protection des routes
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Ignorer les fichiers statiques et API internes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Log de la tentative d'accès
  logAccess(request, 'access_attempt', { pathname });

  // Vérifier si la route est publique
  if (isPublicRoute(pathname)) {
    ${this.config.security.authentication ? this.generatePublicRouteLogic() : 'return NextResponse.next();'}
  }

  ${authCheck}

  ${roleCheck}

  // Route autorisée
  logAccess(request, 'access_granted', { pathname });
  return NextResponse.next();
}`;
  }

  /**
   * Génère la logique pour les routes publiques
   */
  private generatePublicRouteLogic(): string {
    return `// Rediriger les utilisateurs authentifiés depuis les pages d'auth
    const sessionCookie = getSessionCookie(request);
    if (sessionCookie && ['/login', '/signup', '/auth'].some(route => pathname.startsWith(route))) {
      const redirectUrl = new URL('${this.config.security.redirects.afterLogin}', request.url);
      logAccess(request, 'redirect_authenticated_user', { from: pathname, to: redirectUrl.pathname });
      return NextResponse.redirect(redirectUrl);
    }
    
    return NextResponse.next();`;
  }

  /**
   * Génère la vérification d'authentification
   */
  private generateAuthenticationCheck(): string {
    if (!this.config.security.authentication) {
      return '';
    }

    return `  // Vérification de l'authentification
  const sessionCookie = getSessionCookie(request);
  
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    
    logAccess(request, 'redirect_unauthenticated', { 
      from: pathname, 
      to: loginUrl.pathname 
    });
    
    return NextResponse.redirect(loginUrl);
  }

  // Valider la session
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      
      logAccess(request, 'invalid_session', { pathname });
      return NextResponse.redirect(loginUrl);
    }

    // Ajouter les informations de session aux headers pour les composants
    const response = NextResponse.next();
    response.headers.set('x-user-id', session.user.id);
    response.headers.set('x-user-email', session.user.email);
    ${this.config.security.authorization ? `response.headers.set('x-user-roles', JSON.stringify(session.user.roles || []));` : ''}
    
    request.headers.set('x-session', JSON.stringify(session));
  } catch (error) {
    console.error('Erreur de validation de session:', error);
    
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    
    logAccess(request, 'session_validation_error', { pathname, error: error.message });
    return NextResponse.redirect(loginUrl);
  }`;
  }

  /**
   * Génère la vérification d'autorisation
   */
  private generateAuthorizationCheck(): string {
    if (!this.config.security.authorization || this.config.security.middleware.adminRoutes.length === 0) {
      return '';
    }

    return `  // Vérification des autorisations pour les routes admin
  if (isAdminRoute(pathname)) {
    try {
      const session = JSON.parse(request.headers.get('x-session') || '{}');
      const userRoles = session.user?.roles || [];
      
      // Vérifier si l'utilisateur a un rôle admin
      const hasAdminRole = userRoles.some((role: string) => 
        ['admin', 'superAdmin'].includes(role)
      );
      
      if (!hasAdminRole) {
        const unauthorizedUrl = new URL('${this.config.security.redirects.unauthorized}', request.url);
        
        logAccess(request, 'access_denied_insufficient_permissions', {
          pathname,
          userRoles,
          requiredRoles: ['admin', 'superAdmin']
        });
        
        return NextResponse.redirect(unauthorizedUrl);
      }
      
      // Vérification des permissions spécifiques (optionnel)
      const hasPermission = await checkUserPermissions(
        session.user.id,
        pathname
      );
      
      if (!hasPermission) {
        const unauthorizedUrl = new URL('${this.config.security.redirects.unauthorized}', request.url);
        
        logAccess(request, 'access_denied_insufficient_permissions', {
          pathname,
          userId: session.user.id
        });
        
        return NextResponse.redirect(unauthorizedUrl);
      }
      
    } catch (error) {
      console.error('Erreur de vérification des autorisations:', error);
      
      const unauthorizedUrl = new URL('${this.config.security.redirects.unauthorized}', request.url);
      
      logAccess(request, 'authorization_check_error', {
        pathname,
        error: error.message
      });
      
      return NextResponse.redirect(unauthorizedUrl);
    }
  }`;
  }

  /**
   * Génère la configuration du matcher
   */
  private generateConfig(): string {
    return `export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};`;
  }
}

/**
 * Générateur de helpers de permissions
 */
export class PermissionsGenerator {
  constructor(private config: NavigationConfig) {}

  /**
   * Génère le fichier de gestion des permissions
   */
  generate(): FileTemplate {
    return {
      path: 'src/lib/permissions.ts',
      content: this.generatePermissionsContent(),
    };
  }

  /**
   * Génère le contenu du fichier permissions
   */
  private generatePermissionsContent(): string {
    return `/**
 * Système de gestion des permissions
 * Vérifie les autorisations utilisateur pour les routes et actions
 */

import { auth } from "@/lib/auth";

/**
 * Définition des rôles et permissions
 */
export const ROLES = {
${this.config.security.roles.map(role => `  ${role.name.toUpperCase()}: '${role.name}',`).join('\n')}
} as const;

export const PERMISSIONS = {
${this.config.security.permissions.map(perm => `  ${perm.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}: '${perm.name}',`).join('\n')}
} as const;

/**
 * Mapping des rôles vers les permissions
 */
export const ROLE_PERMISSIONS = {
${this.config.security.roles.map(role => `  [ROLES.${role.name.toUpperCase()}]: [${role.permissions.map(p => `PERMISSIONS.${p.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`).join(', ')}],`).join('\n')}
} as const;

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export async function checkUserPermissions(
  userId: string,
  pathname: string
): Promise<boolean> {
  try {
    // TODO: Implémenter la vérification des permissions
    // const user = await getUserWithRoles(userId);
    // const requiredPermissions = getRequiredPermissions(pathname);
    // return hasPermissions(user.roles, requiredPermissions);
    
    return true; // Temporaire
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions:', error);
    return false;
  }
}

/**
 * Vérifie si un utilisateur a un rôle spécifique
 */
export async function hasRole(userId: string, role: string): Promise<boolean> {
  try {
    // TODO: Implémenter la vérification des rôles
    // const user = await getUserWithRoles(userId);
    // return user.roles.includes(role);
    
    return true; // Temporaire
  } catch (error) {
    console.error('Erreur lors de la vérification du rôle:', error);
    return false;
  }
}

/**
 * Obtient les permissions d'un utilisateur
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    // TODO: Implémenter la récupération des permissions
    // const user = await getUserWithRoles(userId);
    // return user.roles.flatMap(role => ROLE_PERMISSIONS[role] || []);
    
    return []; // Temporaire
  } catch (error) {
    console.error('Erreur lors de la récupération des permissions:', error);
    return [];
  }
}

/**
 * Middleware de vérification des permissions pour les Server Actions
 */
export async function checkPermission(
  resource: string,
  action: string
): Promise<void> {
  try {
    const session = await auth.api.getSession();
    
    if (!session) {
      throw new Error('Non authentifié');
    }

    const permission = \`\${resource}:\${action}\`;
    const userPermissions = await getUserPermissions(session.user.id);
    
    if (!userPermissions.includes(permission)) {
      throw new Error('Permission insuffisante');
    }
  } catch (error) {
    throw new Error(\`Erreur de permission: \${error.message}\`);
  }
}

/**
 * Hook pour vérifier les permissions côté client
 */
export function usePermissions() {
  // TODO: Implémenter le hook de permissions
  return {
    hasPermission: (permission: string) => true,
    hasRole: (role: string) => true,
    permissions: [],
    roles: [],
  };
}`;
  }
}
