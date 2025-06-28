/**
 * Template de Middleware de Sécurité
 * Point d'entrée principal avec exports et configuration
 */

import { ProjectConfig } from '../types';

// Re-exports des modules principaux
export * from './types';
export * from './generator';
export * from './schemas';
export * from './utilities';
export * from './extensions';

export interface SecurityConfig extends ProjectConfig {
  // Configuration d'authentification
  authentication: {
    enabled: boolean;
    provider: 'better-auth' | 'next-auth' | 'custom';
    sessionStrategy: 'jwt' | 'database';
    redirects: {
      login: string;
      logout: string;
      unauthorized: string;
    };
  };

  // Configuration d'autorisation
  authorization: {
    enabled: boolean;
    strategy: 'rbac' | 'abac' | 'custom';
    roles: string[];
    permissions: string[];
    routeProtection: {
      [route: string]: {
        roles?: string[];
        permissions?: string[];
        public?: boolean;
      };
    };
  };

  // Configuration du rate limiting
  rateLimit: {
    enabled: boolean;
    provider: 'redis' | 'memory' | 'upstash';
    rules: {
      [endpoint: string]: {
        requests: number;
        window: number; // en secondes
        skipSuccessfulRequests?: boolean;
        skipFailedRequests?: boolean;
      };
    };
    defaultRule: {
      requests: number;
      window: number;
    };
  };

  // Configuration des headers de sécurité
  securityHeaders: {
    csp: {
      enabled: boolean;
      directives: {
        defaultSrc: string[];
        scriptSrc: string[];
        styleSrc: string[];
        imgSrc: string[];
        fontSrc: string[];
        connectSrc: string[];
        objectSrc: string[];
        mediaSrc: string[];
        frameSrc: string[];
        workerSrc: string[];
        childSrc: string[];
        formAction: string[];
        frameAncestors: string[];
        baseUri: string[];
        manifestSrc: string[];
        upgradeInsecureRequests: boolean;
      };
      reportUri?: string;
      reportOnly?: boolean;
    };
    hsts: {
      enabled: boolean;
      maxAge: number;
      includeSubDomains: boolean;
      preload: boolean;
    };
    frameOptions: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
    contentTypeOptions: boolean;
    referrerPolicy: string;
    permissionsPolicy: Record<string, string[]>;
    xssProtection: boolean;
  };

  // Configuration CORS
  cors: {
    enabled: boolean;
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    credentials: boolean;
    maxAge: number;
    preflightContinue: boolean;
  };

  // Configuration CSRF
  csrf: {
    enabled: boolean;
    tokenName: string;
    cookieName: string;
    headerName: string;
    excludePaths: string[];
    sameSite: 'strict' | 'lax' | 'none';
    secure: boolean;
  };

  // Configuration du logging de sécurité
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    destinations: Array<'console' | 'file' | 'external'>;
    externalServices: {
      sentry?: {
        dsn: string;
        environment: string;
      };
      datadog?: {
        apiKey: string;
        service: string;
      };
      logflare?: {
        apiKey: string;
        sourceToken: string;
      };
    };
    events: {
      authFailures: boolean;
      rateLimitExceeded: boolean;
      suspiciousActivity: boolean;
      csrfViolations: boolean;
      injectionAttempts: boolean;
    };
  };

  // Routes publiques (non protégées)
  publicRoutes: string[];

  // Routes d'API publiques
  publicApiRoutes: string[];

  // Configuration avancée
  advanced: {
    ipWhitelist: string[];
    ipBlacklist: string[];
    geoBlocking: {
      enabled: boolean;
      allowedCountries: string[];
      blockedCountries: string[];
    };
    botProtection: {
      enabled: boolean;
      userAgentBlacklist: string[];
      challengeUnknownBots: boolean;
    };
    injectionProtection: {
      enabled: boolean;
      sqlInjection: boolean;
      xssProtection: boolean;
      pathTraversal: boolean;
      commandInjection: boolean;
    };
  };
}

// Configuration par défaut
export const defaultSecurityConfig: Partial<SecurityConfig> = {
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
    routeProtection: {},
  },
  rateLimit: {
    enabled: true,
    provider: 'memory',
    rules: {
      '/api/auth/login': { requests: 5, window: 900 }, // 5 tentatives par 15 min
      '/api/auth/register': { requests: 3, window: 3600 }, // 3 tentatives par heure
      '/api/auth/forgot-password': { requests: 3, window: 3600 },
      '/api/upload': { requests: 10, window: 3600 },
    },
    defaultRule: { requests: 100, window: 60 }, // 100 req/min par défaut
  },
  securityHeaders: {
    csp: {
      enabled: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
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
      reportOnly: false,
    },
    hsts: {
      enabled: true,
      maxAge: 31536000, // 1 an
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
      payment: [],
    },
    xssProtection: true,
  },
  cors: {
    enabled: true,
    allowedOrigins: ['http://localhost:3000'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: [],
    credentials: true,
    maxAge: 86400, // 24h
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
    '/forgot-password',
    '/reset-password',
    '/verify-email',
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

// Presets de configuration
export const securityPresets = {
  basic: {
    ...defaultSecurityConfig,
    rateLimit: {
      enabled: true,
      provider: 'memory' as const,
      rules: {
        '/api/auth/login': { requests: 5, window: 900 },
      },
      defaultRule: { requests: 100, window: 60 },
    },
    advanced: {
      ...defaultSecurityConfig.advanced,
      injectionProtection: {
        enabled: false,
        sqlInjection: false,
        xssProtection: false,
        pathTraversal: false,
        commandInjection: false,
      },
    },
  },
  
  standard: defaultSecurityConfig,
  
  enterprise: {
    ...defaultSecurityConfig,
    rateLimit: {
      enabled: true,
      provider: 'redis' as const,
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
      level: 'debug' as const,
      destinations: ['console', 'file', 'external'] as const,
      externalServices: {},
      events: {
        authFailures: true,
        rateLimitExceeded: true,
        suspiciousActivity: true,
        csrfViolations: true,
        injectionAttempts: true,
      },
    },
    advanced: {
      ...defaultSecurityConfig.advanced,
      botProtection: {
        enabled: true,
        userAgentBlacklist: ['bot', 'crawler', 'spider'],
        challengeUnknownBots: true,
      },
      geoBlocking: {
        enabled: true,
        allowedCountries: ['US', 'CA', 'GB', 'FR', 'DE'],
        blockedCountries: [],
      },
    },
  },
};

export * from './types';
export * from './generator';
export * from './schemas';
export * from './utilities';
export * from './extensions';
