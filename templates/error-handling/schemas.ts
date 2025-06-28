/**
 * Schémas de validation pour la gestion d'erreurs
 */

import { z } from 'zod';

// Schéma pour la configuration des Error Boundaries
export const errorBoundariesConfigSchema = z.object({
  enabled: z.boolean(),
  globalBoundary: z.boolean(),
  routeBoundaries: z.boolean(),
  componentBoundaries: z.boolean(),
  fallbackComponent: z.enum(['default', 'custom', 'minimal']),
  reportErrors: z.boolean(),
  retryMechanism: z.boolean(),
  maxRetries: z.number().min(0).max(10),
});

// Schéma pour la configuration des pages d'erreur
export const errorPagesConfigSchema = z.object({
  custom404: z.boolean(),
  custom500: z.boolean(),
  customError: z.boolean(),
  globalError: z.boolean(),
  notFound: z.boolean(),
  maintenance: z.boolean(),
  offline: z.boolean(),
  styles: z.enum(['default', 'branded', 'minimal']),
  animations: z.boolean(),
  searchSuggestions: z.boolean(),
  contactInfo: z.boolean(),
});

// Schéma pour la configuration du logging
export const loggingConfigSchema = z.object({
  enabled: z.boolean(),
  level: z.enum(['debug', 'info', 'warn', 'error']),
  destinations: z.array(z.enum(['console', 'file', 'database', 'external'])),
  format: z.enum(['json', 'text', 'structured']),
  rotation: z.object({
    enabled: z.boolean(),
    maxSize: z.string(),
    maxFiles: z.number().positive(),
    datePattern: z.string(),
  }),
  filters: z.object({
    excludePatterns: z.array(z.string()),
    includePatterns: z.array(z.string()),
    minLevel: z.enum(['debug', 'info', 'warn', 'error']),
  }),
});

// Schéma pour la configuration du monitoring
export const monitoringConfigSchema = z.object({
  enabled: z.boolean(),
  services: z.array(z.enum(['sentry', 'bugsnag', 'rollbar', 'datadog', 'newrelic', 'custom'])),
  sentry: z.object({
    dsn: z.string(),
    environment: z.string(),
    tracesSampleRate: z.number().min(0).max(1),
    profilesSampleRate: z.number().min(0).max(1),
    beforeSend: z.string().optional(),
  }).optional(),
  bugsnag: z.object({
    apiKey: z.string(),
    releaseStage: z.string(),
  }).optional(),
  rollbar: z.object({
    accessToken: z.string(),
    environment: z.string(),
  }).optional(),
  datadog: z.object({
    clientToken: z.string(),
    applicationId: z.string(),
    site: z.string(),
  }).optional(),
  customEndpoint: z.object({
    url: z.string().url(),
    headers: z.record(z.string()),
    method: z.enum(['POST', 'PUT']),
  }).optional(),
});

// Schéma pour la configuration de récupération
export const recoveryConfigSchema = z.object({
  enabled: z.boolean(),
  autoRetry: z.boolean(),
  retryAttempts: z.number().min(1).max(10),
  retryDelay: z.number().positive(),
  exponentialBackoff: z.boolean(),
  circuitBreaker: z.object({
    enabled: z.boolean(),
    failureThreshold: z.number().positive(),
    resetTimeout: z.number().positive(),
  }),
  fallbackStrategies: z.array(z.enum(['cache', 'static', 'offline', 'redirect'])),
  gracefulDegradation: z.boolean(),
});

// Schéma pour la configuration des notifications
export const notificationsConfigSchema = z.object({
  enabled: z.boolean(),
  channels: z.array(z.enum(['email', 'slack', 'discord', 'webhook', 'sms'])),
  severity: z.array(z.enum(['low', 'medium', 'high', 'critical'])),
  throttling: z.object({
    enabled: z.boolean(),
    maxPerHour: z.number().positive(),
    maxPerDay: z.number().positive(),
  }),
  email: z.object({
    smtp: z.object({
      host: z.string(),
      port: z.number().positive(),
      secure: z.boolean(),
      auth: z.object({
        user: z.string(),
        pass: z.string(),
      }),
    }),
    recipients: z.array(z.string().email()),
    template: z.string(),
  }).optional(),
  slack: z.object({
    webhookUrl: z.string().url(),
    channel: z.string(),
    username: z.string(),
  }).optional(),
  webhook: z.object({
    url: z.string().url(),
    headers: z.record(z.string()),
    method: z.enum(['POST', 'PUT']),
  }).optional(),
});

// Schéma pour la configuration de l'analyse
export const analyticsConfigSchema = z.object({
  enabled: z.boolean(),
  trackUserActions: z.boolean(),
  trackPerformance: z.boolean(),
  trackCustomEvents: z.boolean(),
  sessionRecording: z.boolean(),
  heatmaps: z.boolean(),
  errorGrouping: z.object({
    enabled: z.boolean(),
    groupBy: z.array(z.enum(['message', 'stack', 'component', 'user', 'browser'])),
    timeWindow: z.number().positive(),
  }),
  trends: z.object({
    enabled: z.boolean(),
    timeRanges: z.array(z.enum(['1h', '24h', '7d', '30d'])),
    metrics: z.array(z.enum(['count', 'rate', 'users', 'sessions'])),
  }),
});

// Schéma pour la configuration de sécurité
export const securityConfigSchema = z.object({
  sanitizeErrors: z.boolean(),
  hideStackTraces: z.boolean(),
  maskSensitiveData: z.boolean(),
  sensitiveFields: z.array(z.string()),
  allowedDomains: z.array(z.string()),
  csrfProtection: z.boolean(),
  rateLimit: z.object({
    enabled: z.boolean(),
    maxReports: z.number().positive(),
    timeWindow: z.number().positive(),
  }),
});

// Schéma pour la configuration d'environnement
export const environmentConfigSchema = z.object({
  development: z.object({
    showDetailedErrors: z.boolean(),
    enableSourceMaps: z.boolean(),
    hotReload: z.boolean(),
    debugMode: z.boolean(),
  }),
  staging: z.object({
    showDetailedErrors: z.boolean(),
    enableSourceMaps: z.boolean(),
    mockExternalServices: z.boolean(),
  }),
  production: z.object({
    showDetailedErrors: z.boolean(),
    enableSourceMaps: z.boolean(),
    compressionEnabled: z.boolean(),
    cacheErrors: z.boolean(),
  }),
});

// Schéma principal de configuration de gestion d'erreurs
export const errorHandlingConfigSchema = z.object({
  projectName: z.string().min(1),
  errorBoundaries: errorBoundariesConfigSchema,
  errorPages: errorPagesConfigSchema,
  logging: loggingConfigSchema,
  monitoring: monitoringConfigSchema,
  recovery: recoveryConfigSchema,
  notifications: notificationsConfigSchema,
  analytics: analyticsConfigSchema,
  security: securityConfigSchema,
  environment: environmentConfigSchema,
});

// Types inférés des schémas
export type ErrorBoundariesConfig = z.infer<typeof errorBoundariesConfigSchema>;
export type ErrorPagesConfig = z.infer<typeof errorPagesConfigSchema>;
export type LoggingConfig = z.infer<typeof loggingConfigSchema>;
export type MonitoringConfig = z.infer<typeof monitoringConfigSchema>;
export type RecoveryConfig = z.infer<typeof recoveryConfigSchema>;
export type NotificationsConfig = z.infer<typeof notificationsConfigSchema>;
export type AnalyticsConfig = z.infer<typeof analyticsConfigSchema>;
export type SecurityConfig = z.infer<typeof securityConfigSchema>;
export type EnvironmentConfig = z.infer<typeof environmentConfigSchema>;
export type ErrorHandlingConfigSchema = z.infer<typeof errorHandlingConfigSchema>;

// Fonctions de validation
export function validateErrorHandlingConfig(config: unknown): {
  success: boolean;
  data?: ErrorHandlingConfigSchema;
  errors?: string[];
} {
  try {
    const validatedConfig = errorHandlingConfigSchema.parse(config);
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
export function validateErrorHandlingPreset(preset: string, config: unknown): {
  success: boolean;
  data?: Partial<ErrorHandlingConfigSchema>;
  errors?: string[];
} {
  try {
    const partialSchema = errorHandlingConfigSchema.partial();
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

// Schémas pour les événements d'erreur
export const errorEventSchema = z.object({
  type: z.enum(['error', 'unhandledrejection', 'boundary']),
  error: z.object({
    name: z.string(),
    message: z.string(),
    stack: z.string().optional(),
  }),
  context: z.object({
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    userAgent: z.string(),
    url: z.string(),
    timestamp: z.date(),
    buildId: z.string().optional(),
    version: z.string().optional(),
    environment: z.enum(['development', 'staging', 'production']),
    component: z.string().optional(),
    action: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
  handled: z.boolean(),
  timestamp: z.date(),
});

export const breadcrumbSchema = z.object({
  timestamp: z.date(),
  message: z.string(),
  category: z.string(),
  level: z.enum(['debug', 'info', 'warning', 'error']),
  data: z.record(z.any()).optional(),
});

export const errorReportSchema = z.object({
  id: z.string(),
  message: z.string(),
  stack: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum([
    'network',
    'validation',
    'authentication',
    'authorization',
    'server',
    'client',
    'external',
    'unknown'
  ]),
  context: z.object({
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    userAgent: z.string(),
    url: z.string(),
    timestamp: z.date(),
    environment: z.enum(['development', 'staging', 'production']),
    component: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
  fingerprint: z.string(),
  count: z.number().positive(),
  firstSeen: z.date(),
  lastSeen: z.date(),
  resolved: z.boolean(),
  resolvedAt: z.date().optional(),
  resolvedBy: z.string().optional(),
  tags: z.array(z.string()),
  breadcrumbs: z.array(breadcrumbSchema),
});

export type ErrorEvent = z.infer<typeof errorEventSchema>;
export type Breadcrumb = z.infer<typeof breadcrumbSchema>;
export type ErrorReport = z.infer<typeof errorReportSchema>;
