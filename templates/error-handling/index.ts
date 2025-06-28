/**
 * Template de Gestion d'Erreurs
 * Point d'entrée principal avec exports et configuration
 */

import { ProjectConfig } from '../types';

// Re-exports des modules principaux
export * from './types';
export * from './generator';
export * from './schemas';
export * from './utilities';
export * from './extensions';

export interface ErrorHandlingConfig extends ProjectConfig {
  // Configuration des Error Boundaries
  errorBoundaries: {
    enabled: boolean;
    globalBoundary: boolean;
    routeBoundaries: boolean;
    componentBoundaries: boolean;
    fallbackComponent: 'default' | 'custom' | 'minimal';
    reportErrors: boolean;
    retryMechanism: boolean;
    maxRetries: number;
  };

  // Configuration des pages d'erreur
  errorPages: {
    custom404: boolean;
    custom500: boolean;
    customError: boolean;
    globalError: boolean;
    notFound: boolean;
    maintenance: boolean;
    offline: boolean;
    styles: 'default' | 'branded' | 'minimal';
    animations: boolean;
    searchSuggestions: boolean;
    contactInfo: boolean;
  };

  // Configuration du logging
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    destinations: Array<'console' | 'file' | 'database' | 'external'>;
    format: 'json' | 'text' | 'structured';
    rotation: {
      enabled: boolean;
      maxSize: string; // '10MB'
      maxFiles: number;
      datePattern: string; // 'YYYY-MM-DD'
    };
    filters: {
      excludePatterns: string[];
      includePatterns: string[];
      minLevel: 'debug' | 'info' | 'warn' | 'error';
    };
  };

  // Configuration du monitoring
  monitoring: {
    enabled: boolean;
    services: Array<'sentry' | 'bugsnag' | 'rollbar' | 'datadog' | 'newrelic' | 'custom'>;
    sentry?: {
      dsn: string;
      environment: string;
      tracesSampleRate: number;
      profilesSampleRate: number;
      beforeSend?: string; // Fonction personnalisée
    };
    bugsnag?: {
      apiKey: string;
      releaseStage: string;
    };
    rollbar?: {
      accessToken: string;
      environment: string;
    };
    datadog?: {
      clientToken: string;
      applicationId: string;
      site: string;
    };
    customEndpoint?: {
      url: string;
      headers: Record<string, string>;
      method: 'POST' | 'PUT';
    };
  };

  // Configuration de la récupération d'erreurs
  recovery: {
    enabled: boolean;
    autoRetry: boolean;
    retryAttempts: number;
    retryDelay: number; // en millisecondes
    exponentialBackoff: boolean;
    circuitBreaker: {
      enabled: boolean;
      failureThreshold: number;
      resetTimeout: number; // en millisecondes
    };
    fallbackStrategies: Array<'cache' | 'static' | 'offline' | 'redirect'>;
    gracefulDegradation: boolean;
  };

  // Configuration des notifications
  notifications: {
    enabled: boolean;
    channels: Array<'email' | 'slack' | 'discord' | 'webhook' | 'sms'>;
    severity: Array<'low' | 'medium' | 'high' | 'critical'>;
    throttling: {
      enabled: boolean;
      maxPerHour: number;
      maxPerDay: number;
    };
    email?: {
      smtp: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
          user: string;
          pass: string;
        };
      };
      recipients: string[];
      template: string;
    };
    slack?: {
      webhookUrl: string;
      channel: string;
      username: string;
    };
    webhook?: {
      url: string;
      headers: Record<string, string>;
      method: 'POST' | 'PUT';
    };
  };

  // Configuration de l'analyse d'erreurs
  analytics: {
    enabled: boolean;
    trackUserActions: boolean;
    trackPerformance: boolean;
    trackCustomEvents: boolean;
    sessionRecording: boolean;
    heatmaps: boolean;
    errorGrouping: {
      enabled: boolean;
      groupBy: Array<'message' | 'stack' | 'component' | 'user' | 'browser'>;
      timeWindow: number; // en minutes
    };
    trends: {
      enabled: boolean;
      timeRanges: Array<'1h' | '24h' | '7d' | '30d'>;
      metrics: Array<'count' | 'rate' | 'users' | 'sessions'>;
    };
  };

  // Configuration de la sécurité
  security: {
    sanitizeErrors: boolean;
    hideStackTraces: boolean;
    maskSensitiveData: boolean;
    sensitiveFields: string[];
    allowedDomains: string[];
    csrfProtection: boolean;
    rateLimit: {
      enabled: boolean;
      maxReports: number;
      timeWindow: number; // en minutes
    };
  };

  // Configuration de l'environnement
  environment: {
    development: {
      showDetailedErrors: boolean;
      enableSourceMaps: boolean;
      hotReload: boolean;
      debugMode: boolean;
    };
    staging: {
      showDetailedErrors: boolean;
      enableSourceMaps: boolean;
      mockExternalServices: boolean;
    };
    production: {
      showDetailedErrors: boolean;
      enableSourceMaps: boolean;
      compressionEnabled: boolean;
      cacheErrors: boolean;
    };
  };
}

// Configuration par défaut
export const defaultErrorHandlingConfig: Partial<ErrorHandlingConfig> = {
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

// Presets de configuration
export const errorHandlingPresets = {
  basic: {
    ...defaultErrorHandlingConfig,
    monitoring: {
      enabled: false,
      services: [],
    },
    notifications: {
      enabled: false,
      channels: [],
      severity: ['critical'],
      throttling: {
        enabled: true,
        maxPerHour: 5,
        maxPerDay: 20,
      },
    },
  },

  standard: defaultErrorHandlingConfig,

  enterprise: {
    ...defaultErrorHandlingConfig,
    errorBoundaries: {
      ...defaultErrorHandlingConfig.errorBoundaries,
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
  },
};

export * from './types';
export * from './generator';
export * from './schemas';
export * from './utilities';
export * from './extensions';
