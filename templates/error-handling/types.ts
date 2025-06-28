/**
 * Types TypeScript pour la gestion d'erreurs
 */

import { ReactNode, ErrorInfo } from 'react';

// Types pour les Error Boundaries
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
  retryCount?: number;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void, errorId: string) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

// Types pour les erreurs
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 
  | 'network'
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'server'
  | 'client'
  | 'external'
  | 'unknown';

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  userAgent: string;
  url: string;
  timestamp: Date;
  buildId?: string;
  version?: string;
  environment: 'development' | 'staging' | 'production';
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: ErrorContext;
  fingerprint: string;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  tags: string[];
  breadcrumbs: Breadcrumb[];
}

export interface Breadcrumb {
  timestamp: Date;
  message: string;
  category: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

// Types pour le logging
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  user?: {
    id: string;
    email?: string;
  };
  request?: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: any;
  };
  response?: {
    status: number;
    headers: Record<string, string>;
    body?: any;
  };
  performance?: {
    duration: number;
    memory?: number;
    cpu?: number;
  };
}

export interface Logger {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
  child(context: Record<string, any>): Logger;
}

// Types pour le monitoring
export interface MonitoringService {
  captureException(error: Error, context?: ErrorContext): Promise<string>;
  captureMessage(message: string, level: ErrorSeverity, context?: ErrorContext): Promise<string>;
  setUser(user: { id: string; email?: string; username?: string }): void;
  setTag(key: string, value: string): void;
  setContext(key: string, context: Record<string, any>): void;
  addBreadcrumb(breadcrumb: Breadcrumb): void;
}

// Types pour la récupération d'erreurs
export interface RetryOptions {
  attempts: number;
  delay: number;
  exponentialBackoff: boolean;
  maxDelay?: number;
  retryCondition?: (error: Error) => boolean;
}

export interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime?: Date;
  nextAttemptTime?: Date;
}

export interface CircuitBreaker {
  execute<T>(fn: () => Promise<T>): Promise<T>;
  getState(): CircuitBreakerState;
  reset(): void;
}

// Types pour les notifications
export interface NotificationChannel {
  name: string;
  type: 'email' | 'slack' | 'discord' | 'webhook' | 'sms';
  config: Record<string, any>;
  enabled: boolean;
}

export interface NotificationRule {
  id: string;
  name: string;
  conditions: {
    severity: ErrorSeverity[];
    category: ErrorCategory[];
    frequency: 'immediate' | 'hourly' | 'daily';
    threshold?: number;
  };
  channels: string[];
  template: string;
  enabled: boolean;
}

export interface Notification {
  id: string;
  ruleId: string;
  channelId: string;
  error: ErrorReport;
  sentAt: Date;
  status: 'pending' | 'sent' | 'failed';
  retryCount: number;
}

// Types pour l'analyse d'erreurs
export interface ErrorMetrics {
  total: number;
  byCategory: Record<ErrorCategory, number>;
  bySeverity: Record<ErrorSeverity, number>;
  byComponent: Record<string, number>;
  byUser: Record<string, number>;
  byBrowser: Record<string, number>;
  byOS: Record<string, number>;
  trends: {
    hourly: number[];
    daily: number[];
    weekly: number[];
  };
}

export interface ErrorAnalytics {
  getMetrics(timeRange: { start: Date; end: Date }): Promise<ErrorMetrics>;
  getTopErrors(limit: number, timeRange: { start: Date; end: Date }): Promise<ErrorReport[]>;
  getErrorTrends(errorId: string, timeRange: { start: Date; end: Date }): Promise<number[]>;
  getUserImpact(errorId: string): Promise<{
    affectedUsers: number;
    totalUsers: number;
    percentage: number;
  }>;
}

// Types pour les pages d'erreur
export interface ErrorPageProps {
  error?: Error;
  statusCode?: number;
  hasGetInitialProps?: boolean;
  err?: Error;
  reset?: () => void;
}

export interface ErrorPageConfig {
  title: string;
  description: string;
  showDetails: boolean;
  showRetry: boolean;
  showHome: boolean;
  showBack: boolean;
  showContact: boolean;
  customActions?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
  }>;
}

// Types pour les hooks d'erreur
export interface UseErrorHandlerOptions {
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean;
  fallback?: ReactNode;
  resetKeys?: Array<string | number>;
}

export interface UseErrorHandlerReturn {
  error: Error | null;
  hasError: boolean;
  reset: () => void;
  captureError: (error: Error) => void;
}

export interface UseRetryOptions extends RetryOptions {
  onRetry?: (attempt: number, error: Error) => void;
  onSuccess?: (result: any, attempts: number) => void;
  onFailure?: (error: Error, attempts: number) => void;
}

export interface UseRetryReturn<T> {
  execute: () => Promise<T>;
  isLoading: boolean;
  error: Error | null;
  attempt: number;
  canRetry: boolean;
  reset: () => void;
}

// Types pour la configuration
export interface ErrorHandlerConfig {
  enabled: boolean;
  reportToService: boolean;
  showErrorBoundary: boolean;
  logToConsole: boolean;
  maxRetries: number;
  retryDelay: number;
  enableCircuitBreaker: boolean;
  sanitizeErrors: boolean;
  excludePatterns: RegExp[];
  includePatterns: RegExp[];
}

// Types pour les événements d'erreur
export interface ErrorEvent {
  type: 'error' | 'unhandledrejection' | 'boundary';
  error: Error;
  context: ErrorContext;
  handled: boolean;
  timestamp: Date;
}

export interface ErrorEventListener {
  (event: ErrorEvent): void | Promise<void>;
}

// Types pour les filtres d'erreur
export interface ErrorFilter {
  name: string;
  condition: (error: Error, context: ErrorContext) => boolean;
  action: 'ignore' | 'report' | 'transform';
  transform?: (error: Error, context: ErrorContext) => Error;
}

// Types pour les transformateurs d'erreur
export interface ErrorTransformer {
  name: string;
  transform: (error: Error, context: ErrorContext) => Error;
  condition?: (error: Error, context: ErrorContext) => boolean;
}

// Types pour les rapports d'erreur
export interface ErrorReportSummary {
  period: {
    start: Date;
    end: Date;
  };
  totalErrors: number;
  newErrors: number;
  resolvedErrors: number;
  topErrors: Array<{
    id: string;
    message: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  affectedUsers: number;
  errorRate: number;
  availability: number;
  meanTimeToResolution: number;
}

// Export des types utilitaires
export type ErrorHandlingConfigKey = keyof import('./index').ErrorHandlingConfig;
export type ErrorHandlingPreset = keyof typeof import('./index').errorHandlingPresets;
