/**
 * Schémas de validation pour le middleware de sécurité
 */

import { z } from 'zod';

// Schéma pour la configuration d'authentification
export const authenticationConfigSchema = z.object({
  enabled: z.boolean(),
  provider: z.enum(['better-auth', 'next-auth', 'custom']),
  sessionStrategy: z.enum(['jwt', 'database']),
  redirects: z.object({
    login: z.string().url(),
    logout: z.string().url(),
    unauthorized: z.string().url(),
  }),
});

// Schéma pour la configuration d'autorisation
export const authorizationConfigSchema = z.object({
  enabled: z.boolean(),
  strategy: z.enum(['rbac', 'abac', 'custom']),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
  routeProtection: z.record(z.object({
    roles: z.array(z.string()).optional(),
    permissions: z.array(z.string()).optional(),
    public: z.boolean().optional(),
  })),
});

// Schéma pour la configuration du rate limiting
export const rateLimitConfigSchema = z.object({
  enabled: z.boolean(),
  provider: z.enum(['redis', 'memory', 'upstash']),
  rules: z.record(z.object({
    requests: z.number().positive(),
    window: z.number().positive(),
    skipSuccessfulRequests: z.boolean().optional(),
    skipFailedRequests: z.boolean().optional(),
  })),
  defaultRule: z.object({
    requests: z.number().positive(),
    window: z.number().positive(),
  }),
});

// Schéma pour les directives CSP
export const cspDirectivesSchema = z.object({
  defaultSrc: z.array(z.string()),
  scriptSrc: z.array(z.string()),
  styleSrc: z.array(z.string()),
  imgSrc: z.array(z.string()),
  fontSrc: z.array(z.string()),
  connectSrc: z.array(z.string()),
  objectSrc: z.array(z.string()),
  mediaSrc: z.array(z.string()),
  frameSrc: z.array(z.string()),
  workerSrc: z.array(z.string()),
  childSrc: z.array(z.string()),
  formAction: z.array(z.string()),
  frameAncestors: z.array(z.string()),
  baseUri: z.array(z.string()),
  manifestSrc: z.array(z.string()),
  upgradeInsecureRequests: z.boolean(),
});

// Schéma pour les headers de sécurité
export const securityHeadersSchema = z.object({
  csp: z.object({
    enabled: z.boolean(),
    directives: cspDirectivesSchema,
    reportUri: z.string().url().optional(),
    reportOnly: z.boolean().optional(),
  }),
  hsts: z.object({
    enabled: z.boolean(),
    maxAge: z.number().positive(),
    includeSubDomains: z.boolean(),
    preload: z.boolean(),
  }),
  frameOptions: z.enum(['DENY', 'SAMEORIGIN', 'ALLOW-FROM']),
  contentTypeOptions: z.boolean(),
  referrerPolicy: z.string(),
  permissionsPolicy: z.record(z.array(z.string())),
  xssProtection: z.boolean(),
});

// Schéma pour la configuration CORS
export const corsConfigSchema = z.object({
  enabled: z.boolean(),
  allowedOrigins: z.array(z.string()),
  allowedMethods: z.array(z.string()),
  allowedHeaders: z.array(z.string()),
  exposedHeaders: z.array(z.string()),
  credentials: z.boolean(),
  maxAge: z.number().positive(),
  preflightContinue: z.boolean(),
});

// Schéma pour la configuration CSRF
export const csrfConfigSchema = z.object({
  enabled: z.boolean(),
  tokenName: z.string(),
  cookieName: z.string(),
  headerName: z.string(),
  excludePaths: z.array(z.string()),
  sameSite: z.enum(['strict', 'lax', 'none']),
  secure: z.boolean(),
});

// Schéma pour la configuration du logging
export const loggingConfigSchema = z.object({
  enabled: z.boolean(),
  level: z.enum(['debug', 'info', 'warn', 'error']),
  destinations: z.array(z.enum(['console', 'file', 'external'])),
  externalServices: z.object({
    sentry: z.object({
      dsn: z.string(),
      environment: z.string(),
    }).optional(),
    datadog: z.object({
      apiKey: z.string(),
      service: z.string(),
    }).optional(),
    logflare: z.object({
      apiKey: z.string(),
      sourceToken: z.string(),
    }).optional(),
  }),
  events: z.object({
    authFailures: z.boolean(),
    rateLimitExceeded: z.boolean(),
    suspiciousActivity: z.boolean(),
    csrfViolations: z.boolean(),
    injectionAttempts: z.boolean(),
  }),
});

// Schéma pour les fonctionnalités avancées
export const advancedConfigSchema = z.object({
  ipWhitelist: z.array(z.string()),
  ipBlacklist: z.array(z.string()),
  geoBlocking: z.object({
    enabled: z.boolean(),
    allowedCountries: z.array(z.string()),
    blockedCountries: z.array(z.string()),
  }),
  botProtection: z.object({
    enabled: z.boolean(),
    userAgentBlacklist: z.array(z.string()),
    challengeUnknownBots: z.boolean(),
  }),
  injectionProtection: z.object({
    enabled: z.boolean(),
    sqlInjection: z.boolean(),
    xssProtection: z.boolean(),
    pathTraversal: z.boolean(),
    commandInjection: z.boolean(),
  }),
});

// Schéma principal de configuration de sécurité
export const securityConfigSchema = z.object({
  projectName: z.string(),
  authentication: authenticationConfigSchema,
  authorization: authorizationConfigSchema,
  rateLimit: rateLimitConfigSchema,
  securityHeaders: securityHeadersSchema,
  cors: corsConfigSchema,
  csrf: csrfConfigSchema,
  logging: loggingConfigSchema,
  publicRoutes: z.array(z.string()),
  publicApiRoutes: z.array(z.string()),
  advanced: advancedConfigSchema,
});

// Types inférés des schémas
export type AuthenticationConfig = z.infer<typeof authenticationConfigSchema>;
export type AuthorizationConfig = z.infer<typeof authorizationConfigSchema>;
export type RateLimitConfig = z.infer<typeof rateLimitConfigSchema>;
export type SecurityHeadersConfig = z.infer<typeof securityHeadersSchema>;
export type CorsConfig = z.infer<typeof corsConfigSchema>;
export type CsrfConfig = z.infer<typeof csrfConfigSchema>;
export type LoggingConfig = z.infer<typeof loggingConfigSchema>;
export type AdvancedConfig = z.infer<typeof advancedConfigSchema>;
export type SecurityConfigSchema = z.infer<typeof securityConfigSchema>;

// Fonctions de validation
export function validateSecurityConfig(config: unknown): {
  success: boolean;
  data?: SecurityConfigSchema;
  errors?: string[];
} {
  try {
    const validatedConfig = securityConfigSchema.parse(config);
    return { success: true, data: validatedConfig };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      };
    }
    return {
      success: false,
      errors: ['Erreur de validation inconnue'],
    };
  }
}

// Validation partielle pour les presets
export function validateSecurityPreset(preset: string, config: unknown): {
  success: boolean;
  data?: Partial<SecurityConfigSchema>;
  errors?: string[];
} {
  try {
    const partialSchema = securityConfigSchema.partial();
    const validatedConfig = partialSchema.parse(config);
    return { success: true, data: validatedConfig };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      };
    }
    return {
      success: false,
      errors: ['Erreur de validation du preset'],
    };
  }
}

// Schémas pour les événements de sécurité
export const securityEventSchema = z.object({
  type: z.enum([
    'auth_success',
    'auth_failure',
    'auth_logout',
    'rate_limit_exceeded',
    'suspicious_activity',
    'csrf_violation',
    'injection_attempt',
    'unauthorized_access',
    'bot_detected',
    'geo_blocked',
    'ip_blocked'
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  timestamp: z.date(),
  ip: z.string(),
  userAgent: z.string(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  resource: z.string(),
  details: z.record(z.any()),
  metadata: z.object({
    country: z.string().optional(),
    city: z.string().optional(),
    isp: z.string().optional(),
    threat_score: z.number().optional(),
  }).optional(),
});

export type SecurityEvent = z.infer<typeof securityEventSchema>;
