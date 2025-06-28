/**
 * Générateur principal pour le template de middleware de sécurité
 */

import { SecurityConfig } from './index';
import { FileTemplate } from '../types';

/**
 * Génère le fichier middleware.ts principal
 */
export function generateSecurityMiddleware(config: SecurityConfig): FileTemplate {
  const {
    authentication,
    authorization,
    rateLimit,
    securityHeaders,
    cors,
    csrf,
    logging,
    publicRoutes,
    publicApiRoutes,
    advanced,
  } = config;

  const imports = generateImports(config);
  const middlewareFunction = generateMiddlewareFunction(config);
  const helperFunctions = generateHelperFunctions(config);
  const middlewareConfig = generateMiddlewareConfig(config);

  const content = `${imports}

${middlewareFunction}

${helperFunctions}

${middlewareConfig}`;

  return {
    path: 'middleware.ts',
    content,
  };
}

/**
 * Génère les imports nécessaires
 */
function generateImports(config: SecurityConfig): string {
  const imports = [
    'import { NextRequest, NextResponse } from "next/server";',
    'import { headers } from "next/headers";',
  ];

  if (config.authentication.enabled) {
    imports.push('import { auth } from "@/lib/auth";');
  }

  if (config.rateLimit.enabled) {
    imports.push('import { createRateLimiter } from "@/lib/rate-limit";');
  }

  if (config.csrf.enabled) {
    imports.push('import { validateCSRFToken } from "@/lib/csrf";');
  }

  if (config.logging.enabled) {
    imports.push('import { SecurityLogger } from "@/lib/security-logger";');
  }

  if (config.advanced.injectionProtection.enabled) {
    imports.push('import { scanForInjections } from "@/lib/injection-protection";');
  }

  if (config.advanced.geoBlocking.enabled) {
    imports.push('import { getGeoLocation, isGeoBlocked } from "@/lib/geo-blocking";');
  }

  if (config.advanced.botProtection.enabled) {
    imports.push('import { detectBot } from "@/lib/bot-detection";');
  }

  return imports.join('\n');
}

/**
 * Génère la fonction middleware principale
 */
function generateMiddlewareFunction(config: SecurityConfig): string {
  return `export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname, searchParams } = request.nextUrl;
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  ${config.logging.enabled ? `
  const logger = SecurityLogger.getInstance();` : ''}

  try {
    // 1. Vérifications préliminaires
    ${generatePreChecks(config)}

    // 2. Protection contre les injections
    ${generateInjectionProtection(config)}

    // 3. Géo-blocage
    ${generateGeoBlocking(config)}

    // 4. Détection de bots
    ${generateBotDetection(config)}

    // 5. Rate limiting
    ${generateRateLimit(config)}

    // 6. Authentification
    ${generateAuthentication(config)}

    // 7. Autorisation
    ${generateAuthorization(config)}

    // 8. Protection CSRF
    ${generateCSRFProtection(config)}

    // 9. Headers de sécurité et réponse
    ${generateSecurityHeaders(config)}

  } catch (error) {
    ${config.logging.enabled ? `
    await logger.log({
      type: 'middleware_error',
      severity: 'high',
      timestamp: new Date(),
      ip,
      userAgent,
      resource: pathname,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
    });` : ''}

    console.error('Security middleware error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}`;
}

/**
 * Génère les vérifications préliminaires
 */
function generatePreChecks(config: SecurityConfig): string {
  let checks = '';

  // Vérification des IP blacklistées
  if (config.advanced.ipBlacklist.length > 0) {
    checks += `
    // Vérification IP blacklist
    if (${JSON.stringify(config.advanced.ipBlacklist)}.includes(ip)) {
      ${config.logging.enabled ? `
      await logger.log({
        type: 'ip_blocked',
        severity: 'high',
        timestamp: new Date(),
        ip,
        userAgent,
        resource: pathname,
        details: { reason: 'blacklisted_ip' },
      });` : ''}
      return new Response('Forbidden', { status: 403 });
    }`;
  }

  // Vérification des routes publiques
  checks += `
    // Vérification des routes publiques
    const publicRoutes = ${JSON.stringify(config.publicRoutes)};
    const publicApiRoutes = ${JSON.stringify(config.publicApiRoutes)};
    
    const isPublicRoute = publicRoutes.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    
    const isPublicApiRoute = publicApiRoutes.some(route => 
      pathname.startsWith(route)
    );`;

  return checks;
}

/**
 * Génère la protection contre les injections
 */
function generateInjectionProtection(config: SecurityConfig): string {
  if (!config.advanced.injectionProtection.enabled) {
    return '';
  }

  return `
    // Protection contre les injections
    const injectionScan = await scanForInjections(request.url, {
      sqlInjection: ${config.advanced.injectionProtection.sqlInjection},
      xssProtection: ${config.advanced.injectionProtection.xssProtection},
      pathTraversal: ${config.advanced.injectionProtection.pathTraversal},
      commandInjection: ${config.advanced.injectionProtection.commandInjection},
    });

    if (!injectionScan.isValid) {
      ${config.logging.enabled ? `
      await logger.log({
        type: 'injection_attempt',
        severity: 'high',
        timestamp: new Date(),
        ip,
        userAgent,
        resource: pathname,
        details: {
          threats: injectionScan.threats,
          url: request.url,
        },
      });` : ''}

      return new Response('Malicious input detected', { status: 400 });
    }`;
}

/**
 * Génère le géo-blocage
 */
function generateGeoBlocking(config: SecurityConfig): string {
  if (!config.advanced.geoBlocking.enabled) {
    return '';
  }

  return `
    // Géo-blocage
    const geoLocation = await getGeoLocation(ip);
    const geoBlocked = isGeoBlocked(geoLocation, {
      allowedCountries: ${JSON.stringify(config.advanced.geoBlocking.allowedCountries)},
      blockedCountries: ${JSON.stringify(config.advanced.geoBlocking.blockedCountries)},
    });

    if (geoBlocked.blocked) {
      ${config.logging.enabled ? `
      await logger.log({
        type: 'geo_blocked',
        severity: 'medium',
        timestamp: new Date(),
        ip,
        userAgent,
        resource: pathname,
        details: {
          country: geoLocation?.country,
          reason: geoBlocked.reason,
        },
        metadata: {
          country: geoLocation?.country,
          city: geoLocation?.city,
        },
      });` : ''}

      return new Response('Access denied from your location', { status: 403 });
    }`;
}

/**
 * Génère la détection de bots
 */
function generateBotDetection(config: SecurityConfig): string {
  if (!config.advanced.botProtection.enabled) {
    return '';
  }

  return `
    // Détection de bots
    const botDetection = await detectBot(userAgent, {
      blacklist: ${JSON.stringify(config.advanced.botProtection.userAgentBlacklist)},
      challengeUnknown: ${config.advanced.botProtection.challengeUnknownBots},
    });

    if (botDetection.isBot && botDetection.botType === 'malicious') {
      ${config.logging.enabled ? `
      await logger.log({
        type: 'bot_detected',
        severity: 'medium',
        timestamp: new Date(),
        ip,
        userAgent,
        resource: pathname,
        details: {
          botType: botDetection.botType,
          confidence: botDetection.confidence,
        },
      });` : ''}

      return new Response('Bot access denied', { status: 403 });
    }`;
}

/**
 * Génère le rate limiting
 */
function generateRateLimit(config: SecurityConfig): string {
  if (!config.rateLimit.enabled) {
    return '';
  }

  return `
    // Rate limiting
    if (!isPublicRoute || pathname.startsWith('/api/')) {
      const rateLimitKey = getRateLimitKey(pathname, ip);
      const rateLimitConfig = getRateLimitConfig(pathname);
      const rateLimiter = createRateLimiter(rateLimitConfig);
      
      const rateLimitResult = await rateLimiter.check(rateLimitKey);
      
      if (!rateLimitResult.success) {
        ${config.logging.enabled ? `
        await logger.log({
          type: 'rate_limit_exceeded',
          severity: 'medium',
          timestamp: new Date(),
          ip,
          userAgent,
          resource: pathname,
          details: {
            limit: rateLimitConfig.requests,
            window: rateLimitConfig.window,
            remaining: rateLimitResult.remaining,
          },
        });` : ''}

        return new Response('Too Many Requests', {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitConfig.requests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
          },
        });
      }
    }`;
}

/**
 * Génère l'authentification
 */
function generateAuthentication(config: SecurityConfig): string {
  if (!config.authentication.enabled) {
    return '';
  }

  return `
    // Authentification
    let session = null;
    
    if (!isPublicRoute && !isPublicApiRoute) {
      try {
        session = await auth.api.getSession({
          headers: request.headers,
        });

        if (!session) {
          ${config.logging.enabled ? `
          await logger.log({
            type: 'auth_failure',
            severity: 'medium',
            timestamp: new Date(),
            ip,
            userAgent,
            resource: pathname,
            details: { reason: 'no_session' },
          });` : ''}

          const loginUrl = new URL('${config.authentication.redirects.login}', request.url);
          loginUrl.searchParams.set('callbackUrl', pathname);
          return NextResponse.redirect(loginUrl);
        }

        ${config.logging.enabled ? `
        await logger.log({
          type: 'auth_success',
          severity: 'low',
          timestamp: new Date(),
          ip,
          userAgent,
          resource: pathname,
          details: { userId: session.user.id },
        });` : ''}

      } catch (error) {
        ${config.logging.enabled ? `
        await logger.log({
          type: 'auth_failure',
          severity: 'high',
          timestamp: new Date(),
          ip,
          userAgent,
          resource: pathname,
          details: { 
            reason: 'auth_error',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });` : ''}

        return NextResponse.redirect(new URL('${config.authentication.redirects.login}', request.url));
      }
    }`;
}

/**
 * Génère l'autorisation
 */
function generateAuthorization(config: SecurityConfig): string {
  if (!config.authorization.enabled) {
    return '';
  }

  return `
    // Autorisation basée sur les rôles
    if (session && Object.keys(${JSON.stringify(config.authorization.routeProtection)}).length > 0) {
      const routeConfig = getRouteConfig(pathname);
      
      if (routeConfig && !isAuthorized(session.user, routeConfig)) {
        ${config.logging.enabled ? `
        await logger.log({
          type: 'unauthorized_access',
          severity: 'high',
          timestamp: new Date(),
          ip,
          userAgent,
          resource: pathname,
          details: {
            userId: session.user.id,
            userRoles: session.user.roles,
            requiredRoles: routeConfig.roles,
            requiredPermissions: routeConfig.permissions,
          },
        });` : ''}

        return NextResponse.redirect(new URL('${config.authentication.redirects.unauthorized}', request.url));
      }
    }`;
}

/**
 * Génère la protection CSRF
 */
function generateCSRFProtection(config: SecurityConfig): string {
  if (!config.csrf.enabled) {
    return '';
  }

  return `
    // Protection CSRF pour les requêtes POST/PUT/DELETE
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method) && 
        !isPublicApiRoute && 
        !${JSON.stringify(config.csrf.excludePaths)}.some(path => pathname.startsWith(path))) {
      
      const csrfToken = request.headers.get('${config.csrf.headerName}') || 
                       request.cookies.get('${config.csrf.cookieName}')?.value;
      
      const csrfValidation = await validateCSRFToken(csrfToken, session?.sessionId);
      
      if (!csrfValidation.valid) {
        ${config.logging.enabled ? `
        await logger.log({
          type: 'csrf_violation',
          severity: 'high',
          timestamp: new Date(),
          ip,
          userAgent,
          resource: pathname,
          details: {
            method: request.method,
            error: csrfValidation.error,
            userId: session?.user.id,
          },
        });` : ''}

        return new Response('CSRF token validation failed', { status: 403 });
      }
    }`;
}

/**
 * Génère les headers de sécurité
 */
function generateSecurityHeaders(config: SecurityConfig): string {
  return `
    // Application des headers de sécurité
    const response = NextResponse.next();

    ${generateCSPHeader(config)}
    ${generateOtherSecurityHeaders(config)}
    ${generateCORSHeaders(config)}

    // Ajout des informations de session aux headers pour les API
    if (session && pathname.startsWith('/api/')) {
      response.headers.set('x-user-id', session.user.id);
      response.headers.set('x-user-roles', JSON.stringify(session.user.roles));
    }

    // Métriques de performance
    const processingTime = Date.now() - startTime;
    response.headers.set('x-processing-time', processingTime.toString());

    return response;`;
}

/**
 * Génère le header CSP
 */
function generateCSPHeader(config: SecurityConfig): string {
  if (!config.securityHeaders.csp.enabled) {
    return '';
  }

  const { directives } = config.securityHeaders.csp;
  
  return `
    // Content Security Policy
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    const cspDirectives = [
      \`default-src \${${JSON.stringify(directives.defaultSrc)}.join(' ')}\`,
      \`script-src \${${JSON.stringify(directives.scriptSrc)}.join(' ')} 'nonce-\${nonce}'\`,
      \`style-src \${${JSON.stringify(directives.styleSrc)}.join(' ')} 'nonce-\${nonce}'\`,
      \`img-src \${${JSON.stringify(directives.imgSrc)}.join(' ')}\`,
      \`font-src \${${JSON.stringify(directives.fontSrc)}.join(' ')}\`,
      \`connect-src \${${JSON.stringify(directives.connectSrc)}.join(' ')}\`,
      \`object-src \${${JSON.stringify(directives.objectSrc)}.join(' ')}\`,
      \`media-src \${${JSON.stringify(directives.mediaSrc)}.join(' ')}\`,
      \`frame-src \${${JSON.stringify(directives.frameSrc)}.join(' ')}\`,
      \`worker-src \${${JSON.stringify(directives.workerSrc)}.join(' ')}\`,
      \`child-src \${${JSON.stringify(directives.childSrc)}.join(' ')}\`,
      \`form-action \${${JSON.stringify(directives.formAction)}.join(' ')}\`,
      \`frame-ancestors \${${JSON.stringify(directives.frameAncestors)}.join(' ')}\`,
      \`base-uri \${${JSON.stringify(directives.baseUri)}.join(' ')}\`,
      \`manifest-src \${${JSON.stringify(directives.manifestSrc)}.join(' ')}\`,
      ${directives.upgradeInsecureRequests ? "'upgrade-insecure-requests'" : ''}
    ].filter(Boolean).join('; ');

    response.headers.set('Content-Security-Policy', cspDirectives);
    response.headers.set('x-nonce', nonce);`;
}

/**
 * Génère les autres headers de sécurité
 */
function generateOtherSecurityHeaders(config: SecurityConfig): string {
  const { securityHeaders } = config;
  
  let headers = '';

  // HSTS
  if (securityHeaders.hsts.enabled) {
    headers += `
    // HSTS
    if (request.nextUrl.protocol === 'https:') {
      const hstsValue = 'max-age=${securityHeaders.hsts.maxAge}' +
        '${securityHeaders.hsts.includeSubDomains ? '; includeSubDomains' : ''}' +
        '${securityHeaders.hsts.preload ? '; preload' : ''}';
      response.headers.set('Strict-Transport-Security', hstsValue);
    }`;
  }

  // Autres headers
  headers += `
    // Autres headers de sécurité
    response.headers.set('X-Frame-Options', '${securityHeaders.frameOptions}');
    ${securityHeaders.contentTypeOptions ? `response.headers.set('X-Content-Type-Options', 'nosniff');` : ''}
    response.headers.set('Referrer-Policy', '${securityHeaders.referrerPolicy}');
    ${securityHeaders.xssProtection ? `response.headers.set('X-XSS-Protection', '1; mode=block');` : ''}
    
    // Permissions Policy
    const permissionsPolicy = Object.entries(${JSON.stringify(securityHeaders.permissionsPolicy)})
      .map(([directive, allowlist]) => \`\${directive}=(\${allowlist.join(' ')})\`)
      .join(', ');
    response.headers.set('Permissions-Policy', permissionsPolicy);`;

  return headers;
}

/**
 * Génère les headers CORS
 */
function generateCORSHeaders(config: SecurityConfig): string {
  if (!config.cors.enabled) {
    return '';
  }

  return `
    // CORS
    const origin = request.headers.get('origin');
    const allowedOrigins = ${JSON.stringify(config.cors.allowedOrigins)};
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    
    response.headers.set('Access-Control-Allow-Methods', '${config.cors.allowedMethods.join(', ')}');
    response.headers.set('Access-Control-Allow-Headers', '${config.cors.allowedHeaders.join(', ')}');
    ${config.cors.credentials ? `response.headers.set('Access-Control-Allow-Credentials', 'true');` : ''}
    response.headers.set('Access-Control-Max-Age', '${config.cors.maxAge}');
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers });
    }`;
}

/**
 * Génère les fonctions helper
 */
function generateHelperFunctions(config: SecurityConfig): string {
  return `
// Fonctions utilitaires

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  return cfConnectingIP || realIP || (forwarded ? forwarded.split(',')[0].trim() : 'unknown');
}

function getRateLimitKey(pathname: string, ip: string): string {
  return \`rate_limit:\${ip}:\${pathname}\`;
}

function getRateLimitConfig(pathname: string) {
  const rules = ${JSON.stringify(config.rateLimit.rules)};
  
  for (const [route, config] of Object.entries(rules)) {
    if (pathname.startsWith(route)) {
      return config;
    }
  }
  
  return ${JSON.stringify(config.rateLimit.defaultRule)};
}

${config.authorization.enabled ? `
function getRouteConfig(pathname: string) {
  const routeProtection = ${JSON.stringify(config.authorization.routeProtection)};
  
  for (const [route, config] of Object.entries(routeProtection)) {
    if (pathname.startsWith(route)) {
      return config;
    }
  }
  
  return null;
}

function isAuthorized(user: any, routeConfig: any): boolean {
  if (routeConfig.public) return true;
  
  if (routeConfig.roles && routeConfig.roles.length > 0) {
    const hasRole = routeConfig.roles.some((role: string) => user.roles.includes(role));
    if (!hasRole) return false;
  }
  
  if (routeConfig.permissions && routeConfig.permissions.length > 0) {
    const hasPermission = routeConfig.permissions.some((permission: string) => 
      user.permissions.includes(permission)
    );
    if (!hasPermission) return false;
  }
  
  return true;
}` : ''}`;
}

/**
 * Génère la configuration du matcher
 */
function generateMiddlewareConfig(config: SecurityConfig): string {
  return `
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};`;
}
