/**
 * Utilitaires et helpers pour le middleware de sécurité
 */

import { SecurityConfig } from './index';
import { FileTemplate } from '../types';

/**
 * Génère le système de rate limiting
 */
export function generateRateLimitUtility(config: SecurityConfig): FileTemplate {
  const provider = config.rateLimit.provider;
  
  let content = '';
  
  if (provider === 'redis' || provider === 'upstash') {
    content = generateRedisRateLimit(config);
  } else {
    content = generateMemoryRateLimit(config);
  }
  
  return {
    path: 'src/lib/rate-limit.ts',
    content,
  };
}

function generateRedisRateLimit(config: SecurityConfig): string {
  return `/**
 * Rate limiting avec Redis/Upstash
 */

import { Redis } from '@upstash/redis';
import type { RateLimitResult, RateLimitConfig } from '@/types/security';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export class RateLimiter {
  constructor(private config: RateLimitConfig) {}

  async check(identifier: string): Promise<RateLimitResult> {
    const key = \`rate_limit:\${identifier}\`;
    const now = Math.floor(Date.now() / 1000);
    const window = this.config.window;
    const limit = this.config.requests;

    // Utiliser une fenêtre glissante avec Redis sorted sets
    const pipeline = redis.pipeline();
    
    // Supprimer les entrées expirées
    pipeline.zremrangebyscore(key, 0, now - window);
    
    // Compter les requêtes actuelles
    pipeline.zcard(key);
    
    // Ajouter la requête actuelle
    pipeline.zadd(key, { score: now, member: \`\${now}-\${Math.random()}\` });
    
    // Définir l'expiration
    pipeline.expire(key, window);
    
    const results = await pipeline.exec();
    const current = results[1] as number;

    if (current >= limit) {
      return {
        success: false,
        remaining: 0,
        reset: now + window,
        total: current,
        retryAfter: window,
      };
    }

    return {
      success: true,
      remaining: limit - current - 1,
      reset: now + window,
      total: current + 1,
    };
  }

  async reset(identifier: string): Promise<void> {
    const key = \`rate_limit:\${identifier}\`;
    await redis.del(key);
  }

  async getStats(identifier: string) {
    const key = \`rate_limit:\${identifier}\`;
    const now = Math.floor(Date.now() / 1000);
    const window = this.config.window;
    
    // Nettoyer les entrées expirées
    await redis.zremrangebyscore(key, 0, now - window);
    
    const requests = await redis.zcard(key);
    const remaining = Math.max(0, this.config.requests - requests);
    
    return {
      requests,
      remaining,
      resetTime: now + window,
    };
  }
}

export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config);
}

// Rate limiters prédéfinis
export const authLimiter = new RateLimiter({
  requests: 5,
  window: 900, // 15 minutes
});

export const apiLimiter = new RateLimiter({
  requests: 100,
  window: 60, // 1 minute
});

export const uploadLimiter = new RateLimiter({
  requests: 10,
  window: 3600, // 1 heure
});`;
}

function generateMemoryRateLimit(config: SecurityConfig): string {
  return `/**
 * Rate limiting en mémoire (pour développement)
 */

import type { RateLimitResult, RateLimitConfig } from '@/types/security';

interface RateLimitEntry {
  requests: number[];
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export class RateLimiter {
  constructor(private config: RateLimitConfig) {}

  async check(identifier: string): Promise<RateLimitResult> {
    const now = Math.floor(Date.now() / 1000);
    const window = this.config.window;
    const limit = this.config.requests;
    const key = identifier;

    let entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetTime <= now) {
      entry = {
        requests: [],
        resetTime: now + window,
      };
    }

    // Filtrer les requêtes dans la fenêtre actuelle
    entry.requests = entry.requests.filter(timestamp => timestamp > now - window);

    if (entry.requests.length >= limit) {
      rateLimitStore.set(key, entry);
      return {
        success: false,
        remaining: 0,
        reset: entry.resetTime,
        total: entry.requests.length,
        retryAfter: window,
      };
    }

    // Ajouter la requête actuelle
    entry.requests.push(now);
    rateLimitStore.set(key, entry);

    return {
      success: true,
      remaining: limit - entry.requests.length,
      reset: entry.resetTime,
      total: entry.requests.length,
    };
  }

  async reset(identifier: string): Promise<void> {
    rateLimitStore.delete(identifier);
  }

  async getStats(identifier: string) {
    const entry = rateLimitStore.get(identifier);
    const now = Math.floor(Date.now() / 1000);
    
    if (!entry) {
      return {
        requests: 0,
        remaining: this.config.requests,
        resetTime: now + this.config.window,
      };
    }

    const validRequests = entry.requests.filter(timestamp => timestamp > now - this.config.window);
    
    return {
      requests: validRequests.length,
      remaining: Math.max(0, this.config.requests - validRequests.length),
      resetTime: entry.resetTime,
    };
  }
}

export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config);
}

// Nettoyage périodique du cache mémoire
setInterval(() => {
  const now = Math.floor(Date.now() / 1000);
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime <= now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Nettoyer toutes les minutes`;
}

/**
 * Génère le système de logging de sécurité
 */
export function generateSecurityLogger(config: SecurityConfig): FileTemplate {
  return {
    path: 'src/lib/security-logger.ts',
    content: `/**
 * Système de logging de sécurité
 */

import type { SecurityEvent, SecurityLogger as ISecurityLogger } from '@/types/security';

export class SecurityLogger implements ISecurityLogger {
  private static instance: SecurityLogger;
  private isDevelopment = process.env.NODE_ENV === 'development';

  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  async log(event: SecurityEvent): Promise<void> {
    // Log en console pour le développement
    if (this.isDevelopment) {
      console.log(\`[SECURITY] \${event.severity.toUpperCase()}: \${event.type}\`, event);
    }

    // Envoyer vers les services externes en production
    if (!this.isDevelopment) {
      await this.sendToExternalServices(event);
    }

    // Sauvegarder localement si configuré
    ${config.logging.destinations.includes('file') ? `
    await this.saveToFile(event);` : ''}
  }

  private async sendToExternalServices(event: SecurityEvent): Promise<void> {
    const promises: Promise<void>[] = [];

    ${config.logging.externalServices.sentry ? `
    // Sentry
    if (process.env.SENTRY_DSN) {
      promises.push(this.sendToSentry(event));
    }` : ''}

    ${config.logging.externalServices.datadog ? `
    // DataDog
    if (process.env.DATADOG_API_KEY) {
      promises.push(this.sendToDatadog(event));
    }` : ''}

    ${config.logging.externalServices.logflare ? `
    // Logflare
    if (process.env.LOGFLARE_API_KEY) {
      promises.push(this.sendToLogflare(event));
    }` : ''}

    // Attendre tous les envois (sans bloquer en cas d'erreur)
    await Promise.allSettled(promises);
  }

  private async sendToSentry(event: SecurityEvent): Promise<void> {
    try {
      // Intégration Sentry
      const { captureMessage, captureException, setContext } = await import('@sentry/nextjs');
      
      setContext('security_event', {
        type: event.type,
        severity: event.severity,
        ip: event.ip,
        userAgent: event.userAgent,
        resource: event.resource,
        details: event.details,
      });

      if (event.severity === 'critical' || event.severity === 'high') {
        captureException(new Error(\`Security Event: \${event.type}\`));
      } else {
        captureMessage(\`Security Event: \${event.type}\`, event.severity as any);
      }
    } catch (error) {
      console.error('Failed to send to Sentry:', error);
    }
  }

  private async sendToDatadog(event: SecurityEvent): Promise<void> {
    try {
      await fetch('https://http-intake.logs.datadoghq.com/v1/input/' + process.env.DATADOG_API_KEY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ddsource: 'nextjs-security',
          ddtags: \`env:\${process.env.NODE_ENV},severity:\${event.severity},type:\${event.type}\`,
          hostname: process.env.VERCEL_URL || 'localhost',
          message: \`Security event: \${event.type}\`,
          timestamp: event.timestamp.toISOString(),
          ...event,
        }),
      });
    } catch (error) {
      console.error('Failed to send to DataDog:', error);
    }
  }

  private async sendToLogflare(event: SecurityEvent): Promise<void> {
    try {
      await fetch('https://api.logflare.app/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.LOGFLARE_API_KEY!,
        },
        body: JSON.stringify({
          source_token: process.env.LOGFLARE_SOURCE_TOKEN,
          log_entry: {
            message: \`Security event: \${event.type}\`,
            metadata: event,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to send to Logflare:', error);
    }
  }

  private async saveToFile(event: SecurityEvent): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const logDir = path.join(process.cwd(), 'logs');
      const logFile = path.join(logDir, \`security-\${new Date().toISOString().split('T')[0]}.log\`);
      
      // Créer le dossier logs s'il n'existe pas
      await fs.mkdir(logDir, { recursive: true });
      
      const logLine = JSON.stringify(event) + '\\n';
      await fs.appendFile(logFile, logLine);
    } catch (error) {
      console.error('Failed to save to file:', error);
    }
  }

  async query(filters: any): Promise<SecurityEvent[]> {
    // Implémentation basique pour les logs en fichier
    // En production, utiliser une base de données ou un service de logs
    return [];
  }

  async getStats(timeRange: any): Promise<any> {
    // Implémentation basique
    return {
      totalEvents: 0,
      eventsByType: {},
      eventsBySeverity: {},
      topIPs: [],
      topUserAgents: [],
    };
  }
}`,
  };
}

/**
 * Génère la protection contre les injections
 */
export function generateInjectionProtection(config: SecurityConfig): FileTemplate {
  return {
    path: 'src/lib/injection-protection.ts',
    content: `/**
 * Protection contre les injections
 */

import type { InjectionScanResult, InjectionThreat } from '@/types/security';

// Patterns de détection d'injections
const SQL_INJECTION_PATTERNS = [
  /('|(\\-\\-)|(;)|(\\||\\|)|(\\*|\\*))/i,
  /(union|select|insert|delete|update|drop|create|alter|exec|execute)/i,
  /(script|javascript|vbscript|onload|onerror|onclick)/i,
];

const XSS_PATTERNS = [
  /<script[^>]*>.*?<\\/script>/gi,
  /<iframe[^>]*>.*?<\\/iframe>/gi,
  /javascript:/gi,
  /on\\w+\\s*=/gi,
  /<img[^>]*src[^>]*=.*?>/gi,
];

const PATH_TRAVERSAL_PATTERNS = [
  /\\.\\.\\/|\\.\\.\\\\/g,
  /\\.\\.%2f|\\.\\.%5c/gi,
  /%2e%2e%2f|%2e%2e%5c/gi,
];

const COMMAND_INJECTION_PATTERNS = [
  /[;&|`$(){}\\[\\]]/,
  /(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig)/i,
  /(rm|mv|cp|chmod|chown|kill|sudo)/i,
];

export async function scanForInjections(
  input: string,
  options: {
    sqlInjection?: boolean;
    xssProtection?: boolean;
    pathTraversal?: boolean;
    commandInjection?: boolean;
  } = {}
): Promise<InjectionScanResult> {
  const threats: InjectionThreat[] = [];
  
  // Décoder l'URL pour détecter les tentatives d'évasion
  const decodedInput = decodeURIComponent(input);
  
  // SQL Injection
  if (options.sqlInjection !== false) {
    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(decodedInput)) {
        threats.push({
          type: 'sql',
          pattern: pattern.source,
          severity: 'high',
          description: 'Potential SQL injection attempt detected',
        });
      }
    }
  }
  
  // XSS Protection
  if (options.xssProtection !== false) {
    for (const pattern of XSS_PATTERNS) {
      if (pattern.test(decodedInput)) {
        threats.push({
          type: 'xss',
          pattern: pattern.source,
          severity: 'high',
          description: 'Potential XSS attack detected',
        });
      }
    }
  }
  
  // Path Traversal
  if (options.pathTraversal !== false) {
    for (const pattern of PATH_TRAVERSAL_PATTERNS) {
      if (pattern.test(decodedInput)) {
        threats.push({
          type: 'path_traversal',
          pattern: pattern.source,
          severity: 'medium',
          description: 'Potential path traversal attempt detected',
        });
      }
    }
  }
  
  // Command Injection
  if (options.commandInjection !== false) {
    for (const pattern of COMMAND_INJECTION_PATTERNS) {
      if (pattern.test(decodedInput)) {
        threats.push({
          type: 'command_injection',
          pattern: pattern.source,
          severity: 'high',
          description: 'Potential command injection attempt detected',
        });
      }
    }
  }
  
  return {
    isValid: threats.length === 0,
    threats,
    sanitizedInput: threats.length > 0 ? sanitizeInput(input) : input,
  };
}

function sanitizeInput(input: string): string {
  return input
    .replace(/[<>\"']/g, '') // Supprimer les caractères dangereux
    .replace(/javascript:/gi, '') // Supprimer javascript:
    .replace(/on\\w+=/gi, '') // Supprimer les event handlers
    .trim();
}

export function validateInput(input: string): { isValid: boolean; sanitized: string } {
  const sanitized = sanitizeInput(input);
  return {
    isValid: sanitized === input,
    sanitized,
  };
}`,
  };
}
