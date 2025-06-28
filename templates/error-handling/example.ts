/**
 * Exemples d'utilisation et presets pour le template de gestion d'erreurs
 */

import { ErrorHandlingConfig, errorHandlingPresets } from './index';
import { generateErrorHandlingTemplate } from './generator';

// Exemple de configuration basique
export const basicErrorHandlingExample: ErrorHandlingConfig = {
  projectName: 'mon-app-errors',
  errorBoundaries: {
    enabled: true,
    globalBoundary: true,
    routeBoundaries: true,
    componentBoundaries: false,
    fallbackComponent: 'default',
    reportErrors: true,
    retryMechanism: true,
    maxRetries: 3,
  },
  errorPages: {
    custom404: true,
    custom500: true,
    customError: true,
    globalError: true,
    notFound: true,
    maintenance: false,
    offline: false,
    styles: 'default',
    animations: true,
    searchSuggestions: true,
    contactInfo: true,
  },
  logging: {
    enabled: true,
    level: 'error',
    destinations: ['console'],
    format: 'json',
    rotation: {
      enabled: false,
      maxSize: '10MB',
      maxFiles: 5,
      datePattern: 'YYYY-MM-DD',
    },
    filters: {
      excludePatterns: [],
      includePatterns: [],
      minLevel: 'error',
    },
  },
  monitoring: {
    enabled: false,
    services: [],
  },
  recovery: {
    enabled: true,
    autoRetry: false,
    retryAttempts: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    circuitBreaker: {
      enabled: false,
      failureThreshold: 5,
      resetTimeout: 60000,
    },
    fallbackStrategies: ['cache', 'static'],
    gracefulDegradation: true,
  },
  notifications: {
    enabled: false,
    channels: [],
    severity: ['high', 'critical'],
    throttling: {
      enabled: true,
      maxPerHour: 10,
      maxPerDay: 50,
    },
  },
  analytics: {
    enabled: false,
    trackUserActions: false,
    trackPerformance: false,
    trackCustomEvents: false,
    sessionRecording: false,
    heatmaps: false,
    errorGrouping: {
      enabled: true,
      groupBy: ['message', 'stack'],
      timeWindow: 60,
    },
    trends: {
      enabled: true,
      timeRanges: ['1h', '24h', '7d'],
      metrics: ['count', 'rate'],
    },
  },
  security: {
    sanitizeErrors: true,
    hideStackTraces: true,
    maskSensitiveData: true,
    sensitiveFields: ['password', 'token', 'key', 'secret', 'email'],
    allowedDomains: [],
    csrfProtection: true,
    rateLimit: {
      enabled: true,
      maxReports: 100,
      timeWindow: 60,
    },
  },
  environment: {
    development: {
      showDetailedErrors: true,
      enableSourceMaps: true,
      hotReload: true,
      debugMode: true,
    },
    staging: {
      showDetailedErrors: true,
      enableSourceMaps: true,
      mockExternalServices: false,
    },
    production: {
      showDetailedErrors: false,
      enableSourceMaps: false,
      compressionEnabled: true,
      cacheErrors: true,
    },
  },
};

// Exemple de configuration enterprise
export const enterpriseErrorHandlingExample: ErrorHandlingConfig = {
  ...basicErrorHandlingExample,
  projectName: 'enterprise-app-errors',
  errorBoundaries: {
    ...basicErrorHandlingExample.errorBoundaries,
    componentBoundaries: true,
    fallbackComponent: 'custom',
  },
  logging: {
    enabled: true,
    level: 'info',
    destinations: ['console', 'file', 'external'],
    format: 'structured',
    rotation: {
      enabled: true,
      maxSize: '50MB',
      maxFiles: 10,
      datePattern: 'YYYY-MM-DD-HH',
    },
    filters: {
      excludePatterns: ['health-check', 'metrics'],
      includePatterns: [],
      minLevel: 'info',
    },
  },
  monitoring: {
    enabled: true,
    services: ['sentry'],
    sentry: {
      dsn: 'https://your-sentry-dsn@sentry.io/project',
      environment: 'production',
      tracesSampleRate: 0.1,
      profilesSampleRate: 0.1,
    },
  },
  notifications: {
    enabled: true,
    channels: ['email', 'slack'],
    severity: ['medium', 'high', 'critical'],
    throttling: {
      enabled: true,
      maxPerHour: 20,
      maxPerDay: 100,
    },
    email: {
      smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'your-email@gmail.com',
          pass: 'your-app-password',
        },
      },
      recipients: ['admin@company.com', 'dev-team@company.com'],
      template: 'error-notification',
    },
    slack: {
      webhookUrl: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
      channel: '#alerts',
      username: 'ErrorBot',
    },
  },
  analytics: {
    enabled: true,
    trackUserActions: true,
    trackPerformance: true,
    trackCustomEvents: true,
    sessionRecording: false,
    heatmaps: false,
    errorGrouping: {
      enabled: true,
      groupBy: ['message', 'stack', 'component', 'user'],
      timeWindow: 30,
    },
    trends: {
      enabled: true,
      timeRanges: ['1h', '24h', '7d', '30d'],
      metrics: ['count', 'rate', 'users', 'sessions'],
    },
  },
  recovery: {
    enabled: true,
    autoRetry: true,
    retryAttempts: 5,
    retryDelay: 500,
    exponentialBackoff: true,
    circuitBreaker: {
      enabled: true,
      failureThreshold: 3,
      resetTimeout: 30000,
    },
    fallbackStrategies: ['cache', 'static', 'offline'],
    gracefulDegradation: true,
  },
};

// Exemples d'utilisation des presets
export const presetExamples = {
  // Utilisation du preset basic
  basic: () => {
    const config = {
      ...errorHandlingPresets.basic,
      projectName: 'my-basic-app',
    };
    
    return generateErrorHandlingTemplate(config);
  },

  // Utilisation du preset standard avec personnalisation
  standard: () => {
    const config = {
      ...errorHandlingPresets.standard,
      projectName: 'my-standard-app',
      monitoring: {
        ...errorHandlingPresets.standard.monitoring,
        sentry: {
          dsn: process.env.SENTRY_DSN || '',
          environment: process.env.NODE_ENV || 'development',
          tracesSampleRate: 0.1,
          profilesSampleRate: 0.1,
        },
      },
    };
    
    return generateErrorHandlingTemplate(config);
  },

  // Utilisation du preset enterprise avec toutes les fonctionnalités
  enterprise: () => {
    const config = {
      ...errorHandlingPresets.enterprise,
      projectName: 'my-enterprise-app',
      notifications: {
        ...errorHandlingPresets.enterprise.notifications,
        email: {
          smtp: {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
              user: process.env.SMTP_USER || '',
              pass: process.env.SMTP_PASS || '',
            },
          },
          recipients: ['admin@company.com'],
          template: 'error-notification',
        },
      },
    };
    
    return generateErrorHandlingTemplate(config);
  },
};

// Exemples de configurations spécialisées
export const specializedExamples = {
  // Configuration pour une application SaaS
  saasApp: {
    ...enterpriseErrorHandlingExample,
    projectName: 'saas-platform-errors',
    errorBoundaries: {
      ...enterpriseErrorHandlingExample.errorBoundaries,
      componentBoundaries: true,
      fallbackComponent: 'custom',
    },
    analytics: {
      ...enterpriseErrorHandlingExample.analytics,
      trackUserActions: true,
      trackPerformance: true,
      sessionRecording: true,
      errorGrouping: {
        enabled: true,
        groupBy: ['message', 'stack', 'user', 'browser'],
        timeWindow: 15,
      },
    },
    notifications: {
      ...enterpriseErrorHandlingExample.notifications,
      channels: ['email', 'slack', 'webhook'],
      severity: ['medium', 'high', 'critical'],
    },
  },

  // Configuration pour une API
  apiService: {
    ...basicErrorHandlingExample,
    projectName: 'api-service-errors',
    errorBoundaries: {
      enabled: false, // Pas d'Error Boundaries pour une API
      globalBoundary: false,
      routeBoundaries: false,
      componentBoundaries: false,
      fallbackComponent: 'minimal',
      reportErrors: true,
      retryMechanism: false,
      maxRetries: 0,
    },
    errorPages: {
      custom404: false,
      custom500: false,
      customError: false,
      globalError: false,
      notFound: false,
      maintenance: false,
      offline: false,
      styles: 'minimal',
      animations: false,
      searchSuggestions: false,
      contactInfo: false,
    },
    logging: {
      enabled: true,
      level: 'info',
      destinations: ['console', 'file'],
      format: 'structured',
      rotation: {
        enabled: true,
        maxSize: '100MB',
        maxFiles: 30,
        datePattern: 'YYYY-MM-DD',
      },
      filters: {
        excludePatterns: ['health', 'metrics'],
        includePatterns: [],
        minLevel: 'info',
      },
    },
    recovery: {
      enabled: true,
      autoRetry: true,
      retryAttempts: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
      circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        resetTimeout: 60000,
      },
      fallbackStrategies: ['cache'],
      gracefulDegradation: true,
    },
  },

  // Configuration pour une application e-commerce
  ecommerce: {
    ...enterpriseErrorHandlingExample,
    projectName: 'ecommerce-store-errors',
    errorBoundaries: {
      ...enterpriseErrorHandlingExample.errorBoundaries,
      componentBoundaries: true,
      maxRetries: 5, // Plus de tentatives pour l'e-commerce
    },
    analytics: {
      ...enterpriseErrorHandlingExample.analytics,
      trackUserActions: true,
      trackPerformance: true,
      sessionRecording: true,
      errorGrouping: {
        enabled: true,
        groupBy: ['message', 'stack', 'user', 'browser'],
        timeWindow: 10, // Fenêtre plus courte pour l'e-commerce
      },
    },
    notifications: {
      ...enterpriseErrorHandlingExample.notifications,
      severity: ['high', 'critical'], // Seulement les erreurs critiques
      throttling: {
        enabled: true,
        maxPerHour: 50, // Plus de notifications pour l'e-commerce
        maxPerDay: 200,
      },
    },
    recovery: {
      ...enterpriseErrorHandlingExample.recovery,
      retryAttempts: 5,
      retryDelay: 500,
      fallbackStrategies: ['cache', 'static', 'offline'],
    },
  },
};

// Fonction d'aide pour générer rapidement un template
export function quickGenerate(preset: 'basic' | 'standard' | 'enterprise', projectName: string) {
  const config = {
    ...errorHandlingPresets[preset],
    projectName,
  };
  
  return generateErrorHandlingTemplate(config);
}

// Fonction pour personnaliser un preset
export function customizePreset(
  preset: 'basic' | 'standard' | 'enterprise',
  customizations: Partial<ErrorHandlingConfig>
) {
  const baseConfig = errorHandlingPresets[preset];
  const mergedConfig = {
    ...baseConfig,
    ...customizations,
    // Merge profond pour les objets imbriqués
    errorBoundaries: {
      ...baseConfig.errorBoundaries,
      ...customizations.errorBoundaries,
    },
    logging: {
      ...baseConfig.logging,
      ...customizations.logging,
    },
    monitoring: {
      ...baseConfig.monitoring,
      ...customizations.monitoring,
    },
    recovery: {
      ...baseConfig.recovery,
      ...customizations.recovery,
    },
    analytics: {
      ...baseConfig.analytics,
      ...customizations.analytics,
    },
  };
  
  return generateErrorHandlingTemplate(mergedConfig);
}

// Export des exemples pour les tests
export const testExamples = {
  minimal: {
    projectName: 'test-app',
    errorBoundaries: { enabled: false },
    errorPages: { custom404: false, custom500: false },
    logging: { enabled: false },
    monitoring: { enabled: false },
    recovery: { enabled: false },
    notifications: { enabled: false },
    analytics: { enabled: false },
    security: {
      sanitizeErrors: false,
      hideStackTraces: false,
      maskSensitiveData: false,
      sensitiveFields: [],
      allowedDomains: [],
      csrfProtection: false,
      rateLimit: { enabled: false },
    },
    environment: {
      development: { showDetailedErrors: true },
      staging: { showDetailedErrors: true },
      production: { showDetailedErrors: false },
    },
  },
  
  maximal: enterpriseErrorHandlingExample,
};
