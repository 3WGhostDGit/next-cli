/**
 * Exemples d'utilisation et presets pour le template de sécurité
 */

import { SecurityConfig, securityPresets } from './index';
import { generateSecurityTemplate } from './generator';

// Exemple de configuration basique
export const basicSecurityExample: SecurityConfig = {
  projectName: 'mon-app-secure',
  authentication: {
    enabled: true,
    provider: 'better-auth',
    sessionStrategy: 'jwt',
    redirects: {
      login: '/login',
      logout: '/',
      unauthorized: '/unauthorized',
    },
  },
  authorization: {
    enabled: true,
    strategy: 'rbac',
    roles: ['user', 'admin'],
    permissions: ['read', 'write', 'delete'],
    routeProtection: {
      '/admin': { roles: ['admin'] },
      '/dashboard': { roles: ['user', 'admin'] },
      '/api/admin': { roles: ['admin'] },
    },
  },
  rateLimit: {
    enabled: true,
    provider: 'memory',
    rules: {
      '/api/auth/login': { requests: 5, window: 900 },
      '/api/auth/register': { requests: 3, window: 3600 },
    },
    defaultRule: { requests: 100, window: 60 },
  },
  securityHeaders: {
    csp: {
      enabled: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", 'https:', 'wss:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
        workerSrc: ["'self'", 'blob:'],
        childSrc: ["'self'", 'blob:'],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        manifestSrc: ["'self'"],
        upgradeInsecureRequests: true,
      },
    },
    hsts: {
      enabled: true,
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameOptions: 'DENY',
    contentTypeOptions: true,
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
    },
    xssProtection: true,
  },
  cors: {
    enabled: true,
    allowedOrigins: ['http://localhost:3000'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: [],
    credentials: true,
    maxAge: 86400,
    preflightContinue: false,
  },
  csrf: {
    enabled: true,
    tokenName: 'csrfToken',
    cookieName: '__csrf',
    headerName: 'x-csrf-token',
    excludePaths: ['/api/auth', '/api/webhook'],
    sameSite: 'strict',
    secure: true,
  },
  logging: {
    enabled: true,
    level: 'info',
    destinations: ['console'],
    externalServices: {},
    events: {
      authFailures: true,
      rateLimitExceeded: true,
      suspiciousActivity: true,
      csrfViolations: true,
      injectionAttempts: true,
    },
  },
  publicRoutes: [
    '/',
    '/about',
    '/contact',
    '/login',
    '/register',
  ],
  publicApiRoutes: [
    '/api/auth',
    '/api/health',
    '/api/public',
  ],
  advanced: {
    ipWhitelist: [],
    ipBlacklist: [],
    geoBlocking: {
      enabled: false,
      allowedCountries: [],
      blockedCountries: [],
    },
    botProtection: {
      enabled: false,
      userAgentBlacklist: [],
      challengeUnknownBots: false,
    },
    injectionProtection: {
      enabled: true,
      sqlInjection: true,
      xssProtection: true,
      pathTraversal: true,
      commandInjection: true,
    },
  },
};

// Exemple de configuration enterprise
export const enterpriseSecurityExample: SecurityConfig = {
  ...basicSecurityExample,
  projectName: 'enterprise-app',
  rateLimit: {
    enabled: true,
    provider: 'redis',
    rules: {
      '/api/auth/login': { requests: 3, window: 1800 },
      '/api/auth/register': { requests: 2, window: 7200 },
      '/api/upload': { requests: 5, window: 3600 },
      '/api/admin': { requests: 50, window: 60 },
    },
    defaultRule: { requests: 200, window: 60 },
  },
  logging: {
    enabled: true,
    level: 'debug',
    destinations: ['console', 'file', 'external'],
    externalServices: {
      sentry: {
        dsn: 'https://your-sentry-dsn@sentry.io/project',
        environment: 'production',
      },
      datadog: {
        apiKey: 'your-datadog-api-key',
        service: 'enterprise-app',
      },
    },
    events: {
      authFailures: true,
      rateLimitExceeded: true,
      suspiciousActivity: true,
      csrfViolations: true,
      injectionAttempts: true,
    },
  },
  advanced: {
    ipWhitelist: [],
    ipBlacklist: ['192.168.1.100', '10.0.0.50'],
    geoBlocking: {
      enabled: true,
      allowedCountries: ['US', 'CA', 'GB', 'FR', 'DE'],
      blockedCountries: [],
    },
    botProtection: {
      enabled: true,
      userAgentBlacklist: ['bot', 'crawler', 'spider'],
      challengeUnknownBots: true,
    },
    injectionProtection: {
      enabled: true,
      sqlInjection: true,
      xssProtection: true,
      pathTraversal: true,
      commandInjection: true,
    },
  },
};

// Exemples d'utilisation des presets
export const presetExamples = {
  // Utilisation du preset basic
  basic: () => {
    const config = {
      ...securityPresets.basic,
      projectName: 'my-basic-app',
    };
    
    return generateSecurityTemplate(config);
  },

  // Utilisation du preset standard avec personnalisation
  standard: () => {
    const config = {
      ...securityPresets.standard,
      projectName: 'my-standard-app',
      rateLimit: {
        ...securityPresets.standard.rateLimit,
        rules: {
          ...securityPresets.standard.rateLimit?.rules,
          '/api/custom': { requests: 20, window: 300 },
        },
      },
    };
    
    return generateSecurityTemplate(config);
  },

  // Utilisation du preset enterprise avec monitoring
  enterprise: () => {
    const config = {
      ...securityPresets.enterprise,
      projectName: 'my-enterprise-app',
      logging: {
        ...securityPresets.enterprise.logging,
        externalServices: {
          sentry: {
            dsn: process.env.SENTRY_DSN || '',
            environment: process.env.NODE_ENV || 'development',
          },
        },
      },
    };
    
    return generateSecurityTemplate(config);
  },
};

// Exemples de configurations spécialisées
export const specializedExamples = {
  // Configuration pour une API publique
  publicAPI: {
    ...basicSecurityExample,
    projectName: 'public-api',
    authentication: {
      ...basicSecurityExample.authentication,
      enabled: false, // API publique
    },
    rateLimit: {
      enabled: true,
      provider: 'redis',
      rules: {
        '/api/v1': { requests: 1000, window: 3600 },
        '/api/v1/search': { requests: 100, window: 60 },
      },
      defaultRule: { requests: 50, window: 60 },
    },
    cors: {
      ...basicSecurityExample.cors,
      allowedOrigins: ['*'], // API publique
      credentials: false,
    },
  },

  // Configuration pour une application SaaS
  saasApp: {
    ...enterpriseSecurityExample,
    projectName: 'saas-platform',
    authorization: {
      enabled: true,
      strategy: 'rbac' as const,
      roles: ['free', 'pro', 'enterprise', 'admin'],
      permissions: ['read', 'write', 'delete', 'admin', 'billing'],
      routeProtection: {
        '/dashboard': { roles: ['free', 'pro', 'enterprise'] },
        '/admin': { roles: ['admin'] },
        '/billing': { permissions: ['billing'] },
        '/api/admin': { roles: ['admin'] },
        '/api/billing': { permissions: ['billing'] },
      },
    },
    rateLimit: {
      enabled: true,
      provider: 'redis',
      rules: {
        '/api/free': { requests: 100, window: 3600 },
        '/api/pro': { requests: 1000, window: 3600 },
        '/api/enterprise': { requests: 10000, window: 3600 },
      },
      defaultRule: { requests: 50, window: 60 },
    },
  },

  // Configuration pour une application e-commerce
  ecommerce: {
    ...enterpriseSecurityExample,
    projectName: 'ecommerce-store',
    rateLimit: {
      enabled: true,
      provider: 'redis',
      rules: {
        '/api/auth/login': { requests: 5, window: 900 },
        '/api/cart': { requests: 100, window: 300 },
        '/api/checkout': { requests: 10, window: 600 },
        '/api/payment': { requests: 3, window: 300 },
      },
      defaultRule: { requests: 200, window: 60 },
    },
    csrf: {
      ...enterpriseSecurityExample.csrf,
      excludePaths: [
        '/api/auth',
        '/api/webhook/stripe',
        '/api/webhook/paypal',
      ],
    },
    advanced: {
      ...enterpriseSecurityExample.advanced,
      geoBlocking: {
        enabled: true,
        allowedCountries: ['US', 'CA', 'GB', 'FR', 'DE', 'AU'],
        blockedCountries: [],
      },
    },
  },
};

// Fonction d'aide pour générer rapidement un template
export function quickGenerate(preset: 'basic' | 'standard' | 'enterprise', projectName: string) {
  const config = {
    ...securityPresets[preset],
    projectName,
  };
  
  return generateSecurityTemplate(config);
}

// Fonction pour personnaliser un preset
export function customizePreset(
  preset: 'basic' | 'standard' | 'enterprise',
  customizations: Partial<SecurityConfig>
) {
  const baseConfig = securityPresets[preset];
  const mergedConfig = {
    ...baseConfig,
    ...customizations,
    // Merge profond pour les objets imbriqués
    authentication: {
      ...baseConfig.authentication,
      ...customizations.authentication,
    },
    rateLimit: {
      ...baseConfig.rateLimit,
      ...customizations.rateLimit,
      rules: {
        ...baseConfig.rateLimit?.rules,
        ...customizations.rateLimit?.rules,
      },
    },
    securityHeaders: {
      ...baseConfig.securityHeaders,
      ...customizations.securityHeaders,
    },
    advanced: {
      ...baseConfig.advanced,
      ...customizations.advanced,
    },
  };
  
  return generateSecurityTemplate(mergedConfig);
}

// Export des exemples pour les tests
export const testExamples = {
  minimal: {
    projectName: 'test-app',
    authentication: { enabled: false },
    rateLimit: { enabled: false },
    securityHeaders: { csp: { enabled: false } },
    cors: { enabled: false },
    csrf: { enabled: false },
    logging: { enabled: false },
    publicRoutes: ['/'],
    publicApiRoutes: ['/api/health'],
    advanced: {
      injectionProtection: { enabled: false },
      geoBlocking: { enabled: false },
      botProtection: { enabled: false },
    },
  },
  
  maximal: enterpriseSecurityExample,
};
