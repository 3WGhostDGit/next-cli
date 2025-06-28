/**
 * Types TypeScript pour le middleware de sécurité
 */

// Types pour le rate limiting
export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  total: number;
  retryAfter?: number;
}

export interface RateLimitConfig {
  requests: number;
  window: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimiter {
  check(identifier: string): Promise<RateLimitResult>;
  reset(identifier: string): Promise<void>;
  getStats(identifier: string): Promise<{
    requests: number;
    remaining: number;
    resetTime: number;
  }>;
}

// Types pour l'authentification
export interface AuthSession {
  user: {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
  sessionId: string;
  expiresAt: Date;
}

export interface AuthResult {
  success: boolean;
  session?: AuthSession;
  error?: string;
  redirectTo?: string;
}

// Types pour l'autorisation
export interface AuthorizationContext {
  user: AuthSession['user'];
  resource: string;
  action: string;
  environment: {
    ip: string;
    userAgent: string;
    timestamp: Date;
  };
}

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
  requiredRoles?: string[];
  requiredPermissions?: string[];
}

// Types pour les headers de sécurité
export interface CSPDirectives {
  [directive: string]: string[] | boolean;
}

export interface SecurityHeaders {
  'Content-Security-Policy'?: string;
  'Strict-Transport-Security'?: string;
  'X-Frame-Options'?: string;
  'X-Content-Type-Options'?: string;
  'Referrer-Policy'?: string;
  'Permissions-Policy'?: string;
  'X-XSS-Protection'?: string;
  [key: string]: string | undefined;
}

// Types pour CORS
export interface CORSOptions {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
  preflightContinue: boolean;
}

export interface CORSResult {
  allowed: boolean;
  headers: Record<string, string>;
}

// Types pour CSRF
export interface CSRFToken {
  token: string;
  expiresAt: Date;
  sessionId: string;
}

export interface CSRFValidationResult {
  valid: boolean;
  error?: string;
  newToken?: string;
}

// Types pour le logging de sécurité
export type SecurityEventType = 
  | 'auth_success'
  | 'auth_failure'
  | 'auth_logout'
  | 'rate_limit_exceeded'
  | 'suspicious_activity'
  | 'csrf_violation'
  | 'injection_attempt'
  | 'unauthorized_access'
  | 'bot_detected'
  | 'geo_blocked'
  | 'ip_blocked';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityEvent {
  type: SecurityEventType;
  severity: SecuritySeverity;
  timestamp: Date;
  ip: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  resource: string;
  details: Record<string, any>;
  metadata?: {
    country?: string;
    city?: string;
    isp?: string;
    threat_score?: number;
  };
}

export interface SecurityLogger {
  log(event: SecurityEvent): Promise<void>;
  query(filters: {
    type?: SecurityEventType;
    severity?: SecuritySeverity;
    userId?: string;
    ip?: string;
    timeRange?: {
      start: Date;
      end: Date;
    };
  }): Promise<SecurityEvent[]>;
  getStats(timeRange: { start: Date; end: Date }): Promise<{
    totalEvents: number;
    eventsByType: Record<SecurityEventType, number>;
    eventsBySeverity: Record<SecuritySeverity, number>;
    topIPs: Array<{ ip: string; count: number }>;
    topUserAgents: Array<{ userAgent: string; count: number }>;
  }>;
}

// Types pour la protection contre les injections
export interface InjectionThreat {
  type: 'sql' | 'xss' | 'path_traversal' | 'command_injection' | 'ldap' | 'xpath';
  pattern: string;
  severity: SecuritySeverity;
  description: string;
}

export interface InjectionScanResult {
  isValid: boolean;
  threats: InjectionThreat[];
  sanitizedInput?: string;
}

// Types pour la géolocalisation
export interface GeoLocation {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  isp: string;
  organization: string;
  timezone: string;
}

export interface GeoBlockingResult {
  allowed: boolean;
  location?: GeoLocation;
  reason?: string;
}

// Types pour la détection de bots
export interface BotDetectionResult {
  isBot: boolean;
  confidence: number;
  botType?: 'search_engine' | 'social_media' | 'monitoring' | 'malicious' | 'unknown';
  userAgent: string;
  fingerprint?: string;
}

// Types pour les métriques de sécurité
export interface SecurityMetrics {
  requests: {
    total: number;
    blocked: number;
    allowed: number;
  };
  authentication: {
    attempts: number;
    successes: number;
    failures: number;
  };
  rateLimit: {
    triggered: number;
    byEndpoint: Record<string, number>;
  };
  threats: {
    total: number;
    bySeverity: Record<SecuritySeverity, number>;
    byType: Record<SecurityEventType, number>;
  };
  performance: {
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
}

// Types pour la configuration du middleware
export interface MiddlewareContext {
  request: Request;
  pathname: string;
  searchParams: URLSearchParams;
  ip: string;
  userAgent: string;
  country?: string;
  session?: AuthSession;
  startTime: number;
}

export interface MiddlewareResult {
  action: 'allow' | 'block' | 'redirect' | 'challenge';
  response?: Response;
  redirectTo?: string;
  headers?: Record<string, string>;
  reason?: string;
  metadata?: Record<string, any>;
}

// Types pour les hooks de middleware
export interface MiddlewareHook {
  name: string;
  priority: number;
  execute(context: MiddlewareContext): Promise<MiddlewareResult | null>;
}

export interface MiddlewareHooks {
  beforeAuth: MiddlewareHook[];
  afterAuth: MiddlewareHook[];
  beforeRateLimit: MiddlewareHook[];
  afterRateLimit: MiddlewareHook[];
  beforeResponse: MiddlewareHook[];
  onError: MiddlewareHook[];
}

// Types pour la validation des entrées
export interface InputValidationRule {
  field: string;
  type: 'string' | 'number' | 'email' | 'url' | 'json' | 'custom';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  sanitize?: boolean;
  customValidator?: (value: any) => boolean | string;
}

export interface InputValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    value: any;
  }>;
  sanitizedData?: Record<string, any>;
}

// Types pour les alertes de sécurité
export interface SecurityAlert {
  id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  title: string;
  description: string;
  timestamp: Date;
  source: {
    ip: string;
    userAgent: string;
    country?: string;
  };
  target: {
    resource: string;
    userId?: string;
  };
  evidence: Record<string, any>;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  resolvedAt?: Date;
  resolution?: string;
}

// Types pour les rapports de sécurité
export interface SecurityReport {
  id: string;
  title: string;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalRequests: number;
    blockedRequests: number;
    securityEvents: number;
    criticalAlerts: number;
  };
  sections: {
    authentication: SecurityMetrics['authentication'];
    rateLimit: SecurityMetrics['rateLimit'];
    threats: SecurityMetrics['threats'];
    topThreats: Array<{
      type: SecurityEventType;
      count: number;
      trend: 'up' | 'down' | 'stable';
    }>;
    recommendations: Array<{
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      action: string;
    }>;
  };
  generatedAt: Date;
  generatedBy: string;
}

// Export des types utilitaires
export type SecurityConfigKey = keyof import('./index').SecurityConfig;
export type SecurityPreset = keyof typeof import('./index').securityPresets;
