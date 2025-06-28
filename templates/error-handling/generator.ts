/**
 * Générateur principal pour le template de gestion d'erreurs
 */

import { ErrorHandlingConfig, defaultErrorHandlingConfig } from './index';
import { FileTemplate, GenerationResult } from '../types';
import { 
  generateGlobalErrorBoundary, 
  generateRouteErrorBoundary, 
  generateComponentErrorBoundary 
} from './error-boundaries';

/**
 * Génère tous les fichiers pour la gestion d'erreurs
 */
export function generateErrorHandlingTemplate(config: ErrorHandlingConfig): GenerationResult {
  try {
    // Fusionner avec la configuration par défaut
    const fullConfig = { ...defaultErrorHandlingConfig, ...config };
    
    // Validation de la configuration
    const validation = validateErrorHandlingConfig(fullConfig);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const files: FileTemplate[] = [];

    // 1. Génération des Error Boundaries
    if (fullConfig.errorBoundaries.enabled) {
      if (fullConfig.errorBoundaries.globalBoundary) {
        files.push(generateGlobalErrorBoundary(fullConfig));
        files.push(generateGlobalErrorFallback(fullConfig));
      }
      
      if (fullConfig.errorBoundaries.routeBoundaries) {
        files.push(generateRouteErrorBoundary(fullConfig));
        files.push(generateRouteErrorFallback(fullConfig));
      }
      
      if (fullConfig.errorBoundaries.componentBoundaries) {
        files.push(generateComponentErrorBoundary(fullConfig));
        files.push(generateComponentErrorFallback(fullConfig));
      }
    }

    // 2. Génération des pages d'erreur
    files.push(...generateErrorPages(fullConfig));

    // 3. Génération du système de logging
    if (fullConfig.logging.enabled) {
      files.push(generateErrorLogger(fullConfig));
    }

    // 4. Génération du système de monitoring
    if (fullConfig.monitoring.enabled) {
      files.push(generateErrorReporter(fullConfig));
    }

    // 5. Génération des utilitaires de récupération
    if (fullConfig.recovery.enabled) {
      files.push(generateRecoveryUtilities(fullConfig));
    }

    // 6. Génération des hooks d'erreur
    files.push(generateErrorHooks(fullConfig));

    // 7. Génération des types TypeScript
    files.push(generateErrorTypes(fullConfig));

    // 8. Génération de la configuration
    files.push(generateErrorConfig(fullConfig));

    // 9. Génération des tests
    files.push(...generateErrorTests(fullConfig));

    // 10. Génération de la documentation
    files.push(generateErrorDocumentation(fullConfig));

    return {
      success: true,
      files,
      summary: generateErrorSummary(fullConfig, files),
    };

  } catch (error) {
    return {
      success: false,
      errors: [`Erreur lors de la génération: ${error instanceof Error ? error.message : 'Erreur inconnue'}`],
    };
  }
}

/**
 * Valide la configuration de gestion d'erreurs
 */
function validateErrorHandlingConfig(config: ErrorHandlingConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validation du monitoring
  if (config.monitoring.enabled) {
    if (config.monitoring.services.length === 0) {
      errors.push('Au moins un service de monitoring doit être configuré');
    }
    
    if (config.monitoring.services.includes('sentry') && !config.monitoring.sentry?.dsn) {
      errors.push('Le DSN Sentry est requis');
    }
  }

  // Validation des notifications
  if (config.notifications.enabled) {
    if (config.notifications.channels.length === 0) {
      errors.push('Au moins un canal de notification doit être configuré');
    }
  }

  // Validation du logging
  if (config.logging.enabled) {
    if (config.logging.destinations.length === 0) {
      errors.push('Au moins une destination de log doit être configurée');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Génère les composants de fallback pour les erreurs
 */
function generateGlobalErrorFallback(config: ErrorHandlingConfig): FileTemplate {
  return {
    path: 'src/components/error-boundary/global-error-fallback.tsx',
    content: `"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

interface GlobalErrorFallbackProps {
  error: Error;
  errorId: string;
  reset: () => void;
  retryCount: number;
  maxRetries: number;
}

export function GlobalErrorFallback({
  error,
  errorId,
  reset,
  retryCount,
  maxRetries,
}: GlobalErrorFallbackProps) {
  const canRetry = retryCount < maxRetries;
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Une erreur inattendue s'est produite
          </CardTitle>
          <CardDescription>
            Nous nous excusons pour ce désagrément. Notre équipe a été notifiée.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isDevelopment && (
            <div className="rounded-md bg-red-50 p-4">
              <h4 className="text-sm font-medium text-red-800">Détails de l'erreur (développement)</h4>
              <p className="mt-1 text-sm text-red-700">{error.message}</p>
              <p className="mt-1 text-xs text-red-600">ID: {errorId}</p>
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            {canRetry && (
              <Button onClick={reset} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer ({maxRetries - retryCount} tentatives restantes)
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
            
            ${config.errorPages.contactInfo ? `
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/contact'}
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" />
              Contacter le support
            </Button>` : ''}
          </div>
          
          <p className="text-center text-xs text-gray-500">
            Référence d'erreur: {errorId}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}`,
  };
}

function generateRouteErrorFallback(config: ErrorHandlingConfig): FileTemplate {
  return {
    path: 'src/components/error-boundary/route-error-fallback.tsx',
    content: `"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface RouteErrorFallbackProps {
  error: Error;
  errorId: string;
  route: string;
  reset: () => void;
  retryCount: number;
  maxRetries: number;
}

export function RouteErrorFallback({
  error,
  errorId,
  route,
  reset,
  retryCount,
  maxRetries,
}: RouteErrorFallbackProps) {
  const canRetry = retryCount < maxRetries;
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="container mx-auto px-4 py-8">
      <Alert className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="ml-2">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Erreur sur la page {route}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Cette page a rencontré un problème. Vous pouvez essayer de la recharger.
              </p>
            </div>
            
            ${isDevelopment ? `
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-800">{error.message}</p>
              <p className="text-xs text-red-600 mt-1">ID: {errorId}</p>
            </div>` : ''}
            
            <div className="flex space-x-2">
              {canRetry && (
                <Button onClick={reset} size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Réessayer
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}`,
  };
}

function generateComponentErrorFallback(config: ErrorHandlingConfig): FileTemplate {
  return {
    path: 'src/components/error-boundary/component-error-fallback.tsx',
    content: `"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ComponentErrorFallbackProps {
  error: Error;
  errorId: string;
  componentName: string;
  reset: () => void;
  retryCount: number;
  maxRetries: number;
  isolate?: boolean;
}

export function ComponentErrorFallback({
  error,
  errorId,
  componentName,
  reset,
  retryCount,
  maxRetries,
  isolate,
}: ComponentErrorFallbackProps) {
  const canRetry = retryCount < maxRetries;
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Fallback minimal pour les composants isolés
  if (isolate) {
    return (
      <div className="p-4 border border-red-200 rounded-md bg-red-50">
        <p className="text-sm text-red-800">
          Le composant {componentName} a rencontré une erreur.
        </p>
        {canRetry && (
          <Button 
            onClick={reset} 
            size="sm" 
            variant="outline" 
            className="mt-2"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Réessayer
          </Button>
        )}
      </div>
    );
  }

  return (
    <Alert className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="ml-2">
        <div className="space-y-2">
          <div>
            <p className="font-medium">Erreur dans le composant {componentName}</p>
            {isDevelopment && (
              <p className="text-sm text-muted-foreground">{error.message}</p>
            )}
          </div>
          
          {canRetry && (
            <Button onClick={reset} size="sm" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer ({maxRetries - retryCount} restantes)
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}`,
  };
}

/**
 * Génère les pages d'erreur Next.js
 */
function generateErrorPages(config: ErrorHandlingConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Page 404
  if (config.errorPages.custom404) {
    files.push({
      path: 'src/app/not-found.tsx',
      content: generateNotFoundPage(config),
    });
  }

  // Page d'erreur globale
  if (config.errorPages.globalError) {
    files.push({
      path: 'src/app/global-error.tsx',
      content: generateGlobalErrorPage(config),
    });
  }

  // Page d'erreur personnalisée
  if (config.errorPages.customError) {
    files.push({
      path: 'src/app/error.tsx',
      content: generateCustomErrorPage(config),
    });
  }

  return files;
}

function generateNotFoundPage(config: ErrorHandlingConfig): string {
  return `import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 text-6xl font-bold text-gray-400">404</div>
          <CardTitle>Page non trouvée</CardTitle>
          <CardDescription>
            La page que vous recherchez n'existe pas ou a été déplacée.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          ${config.errorPages.searchSuggestions ? `
          <div className="text-sm text-gray-600">
            <p>Suggestions :</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• Vérifiez l'URL dans la barre d'adresse</li>
              <li>• Retournez à la page précédente</li>
              <li>• Visitez notre page d'accueil</li>
            </ul>
          </div>` : ''}
          
          <div className="flex flex-col space-y-2">
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Link>
            </Button>
            
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Page précédente
            </Button>
            
            ${config.errorPages.searchSuggestions ? `
            <Button variant="outline" asChild>
              <Link href="/search">
                <Search className="mr-2 h-4 w-4" />
                Rechercher
              </Link>
            </Button>` : ''}
          </div>
          
          ${config.errorPages.contactInfo ? `
          <p className="text-sm text-gray-500">
            Besoin d'aide ? <Link href="/contact" className="text-blue-600 hover:underline">Contactez-nous</Link>
          </p>` : ''}
        </CardContent>
      </Card>
    </div>
  );
}`;
}

function generateGlobalErrorPage(config: ErrorHandlingConfig): string {
  return `"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  React.useEffect(() => {
    // Log l'erreur globale
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Erreur critique</CardTitle>
              <CardDescription>
                L'application a rencontré une erreur critique. Veuillez réessayer.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              ${config.environment.development.showDetailedErrors ? `
              {process.env.NODE_ENV === 'development' && (
                <div className="text-left rounded-md bg-red-50 p-4">
                  <h4 className="text-sm font-medium text-red-800">Détails de l'erreur</h4>
                  <p className="mt-1 text-sm text-red-700">{error.message}</p>
                  {error.digest && (
                    <p className="mt-1 text-xs text-red-600">Digest: {error.digest}</p>
                  )}
                </div>
              )}` : ''}
              
              <Button onClick={reset} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}`;
}

function generateCustomErrorPage(config: ErrorHandlingConfig): string {
  return `"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    // Log l'erreur
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Alert className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="ml-2">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Une erreur s'est produite</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Cette page a rencontré un problème. Vous pouvez essayer de la recharger.
              </p>
            </div>

            ${config.environment.development.showDetailedErrors ? `
            {process.env.NODE_ENV === 'development' && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{error.message}</p>
                {error.digest && (
                  <p className="text-xs text-red-600 mt-1">Digest: {error.digest}</p>
                )}
              </div>
            )}` : ''}

            <div className="flex space-x-2">
              <Button onClick={reset} size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/'}
              >
                <Home className="mr-2 h-4 w-4" />
                Accueil
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}`;

/**
 * Génère le système de logging d'erreurs
 */
function generateErrorLogger(config: ErrorHandlingConfig): FileTemplate {
  return {
    path: 'src/lib/error-logger.ts',
    content: `/**
 * Système de logging d'erreurs
 */

import type { LogEntry, Logger } from '@/types/error-handling';

export class ErrorLogger implements Logger {
  private static instance: ErrorLogger;
  private context: Record<string, any> = {};

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  debug(message: string, context?: Record<string, any>): void {
    if ('${config.logging.level}' === 'debug') {
      this.log('debug', message, undefined, context);
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (['debug', 'info'].includes('${config.logging.level}')) {
      this.log('info', message, undefined, context);
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    if (['debug', 'info', 'warn'].includes('${config.logging.level}')) {
      this.log('warn', message, undefined, context);
    }
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, error, context);
  }

  child(context: Record<string, any>): Logger {
    const childLogger = new ErrorLogger();
    childLogger.context = { ...this.context, ...context };
    return childLogger;
  }

  private async log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    error?: Error,
    context?: Record<string, any>
  ): Promise<void> {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context: { ...this.context, ...context },
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    };

    // Filtrage des logs
    if (!this.shouldLog(entry)) {
      return;
    }

    // Destinations de logging
    const destinations = ${JSON.stringify(config.logging.destinations)};

    if (destinations.includes('console')) {
      this.logToConsole(entry);
    }

    if (destinations.includes('file')) {
      await this.logToFile(entry);
    }

    if (destinations.includes('database')) {
      await this.logToDatabase(entry);
    }

    if (destinations.includes('external')) {
      await this.logToExternal(entry);
    }
  }

  private shouldLog(entry: LogEntry): boolean {
    const { filters } = ${JSON.stringify(config.logging.filters)};

    // Vérifier le niveau minimum
    const levels = ['debug', 'info', 'warn', 'error'];
    const minLevelIndex = levels.indexOf(filters.minLevel);
    const entryLevelIndex = levels.indexOf(entry.level);

    if (entryLevelIndex < minLevelIndex) {
      return false;
    }

    // Vérifier les patterns d'exclusion
    for (const pattern of filters.excludePatterns) {
      if (entry.message.includes(pattern)) {
        return false;
      }
    }

    // Vérifier les patterns d'inclusion
    if (filters.includePatterns.length > 0) {
      const matches = filters.includePatterns.some(pattern =>
        entry.message.includes(pattern)
      );
      if (!matches) {
        return false;
      }
    }

    return true;
  }

  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const prefix = \`[\${timestamp}] [\${entry.level.toUpperCase()}]\`;

    switch (entry.level) {
      case 'debug':
        console.debug(prefix, entry.message, entry.context);
        break;
      case 'info':
        console.info(prefix, entry.message, entry.context);
        break;
      case 'warn':
        console.warn(prefix, entry.message, entry.context);
        break;
      case 'error':
        console.error(prefix, entry.message, entry.error, entry.context);
        break;
    }
  }

  private async logToFile(entry: LogEntry): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');

      const logDir = path.join(process.cwd(), 'logs');
      const logFile = path.join(logDir, \`error-\${new Date().toISOString().split('T')[0]}.log\`);

      // Créer le dossier logs s'il n'existe pas
      await fs.mkdir(logDir, { recursive: true });

      const logLine = JSON.stringify(entry) + '\\n';
      await fs.appendFile(logFile, logLine);
    } catch (error) {
      console.error('Failed to log to file:', error);
    }
  }

  private async logToDatabase(entry: LogEntry): Promise<void> {
    // Implémentation pour base de données
    // À adapter selon votre ORM (Prisma, Drizzle, etc.)
    try {
      // Exemple avec Prisma
      // await prisma.logEntry.create({ data: entry });
    } catch (error) {
      console.error('Failed to log to database:', error);
    }
  }

  private async logToExternal(entry: LogEntry): Promise<void> {
    // Implémentation pour services externes
    try {
      // Exemple d'envoi vers un service de logging
      if (process.env.LOG_ENDPOINT) {
        await fetch(process.env.LOG_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${process.env.LOG_API_KEY}\`,
          },
          body: JSON.stringify(entry),
        });
      }
    } catch (error) {
      console.error('Failed to log to external service:', error);
    }
  }
}

/**
 * Génère le système de monitoring d'erreurs
 */
function generateErrorReporter(config: ErrorHandlingConfig): FileTemplate {
  return {
    path: 'src/lib/error-reporter.ts',
    content: `/**
 * Système de reporting d'erreurs vers les services de monitoring
 */

import type { MonitoringService, ErrorContext } from '@/types/error-handling';

export class ErrorReporter implements MonitoringService {
  private static instance: ErrorReporter;

  static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  async captureException(error: Error, context?: ErrorContext): Promise<string> {
    const errorId = \`error-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

    const services = ${JSON.stringify(config.monitoring.services)};

    // Envoyer vers tous les services configurés
    const promises = services.map(service => {
      switch (service) {
        case 'sentry':
          return this.sendToSentry(error, context, errorId);
        case 'bugsnag':
          return this.sendToBugsnag(error, context, errorId);
        case 'rollbar':
          return this.sendToRollbar(error, context, errorId);
        case 'datadog':
          return this.sendToDatadog(error, context, errorId);
        default:
          return Promise.resolve();
      }
    });

    await Promise.allSettled(promises);
    return errorId;
  }

  async captureMessage(message: string, level: any, context?: ErrorContext): Promise<string> {
    const messageId = \`msg-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

    // Implémentation similaire pour les messages
    return messageId;
  }

  setUser(user: { id: string; email?: string; username?: string }): void {
    // Implémentation pour définir l'utilisateur
  }

  setTag(key: string, value: string): void {
    // Implémentation pour définir des tags
  }

  setContext(key: string, context: Record<string, any>): void {
    // Implémentation pour définir le contexte
  }

  addBreadcrumb(breadcrumb: any): void {
    // Implémentation pour ajouter des breadcrumbs
  }

  private async sendToSentry(error: Error, context?: ErrorContext, errorId?: string): Promise<void> {
    try {
      if (!process.env.SENTRY_DSN) return;

      const { captureException, setContext, setTag } = await import('@sentry/nextjs');

      if (context) {
        setContext('error_context', context);
        setTag('error_id', errorId || 'unknown');
      }

      captureException(error);
    } catch (err) {
      console.error('Failed to send to Sentry:', err);
    }
  }

  private async sendToBugsnag(error: Error, context?: ErrorContext, errorId?: string): Promise<void> {
    try {
      // Implémentation Bugsnag
    } catch (err) {
      console.error('Failed to send to Bugsnag:', err);
    }
  }

  private async sendToRollbar(error: Error, context?: ErrorContext, errorId?: string): Promise<void> {
    try {
      // Implémentation Rollbar
    } catch (err) {
      console.error('Failed to send to Rollbar:', err);
    }
  }

  private async sendToDatadog(error: Error, context?: ErrorContext, errorId?: string): Promise<void> {
    try {
      // Implémentation DataDog
    } catch (err) {
      console.error('Failed to send to DataDog:', err);
    }
  }
}`,
  };
}

/**
 * Génère les utilitaires de récupération d'erreurs
 */
function generateRecoveryUtilities(config: ErrorHandlingConfig): FileTemplate {
  return {
    path: 'src/lib/error-recovery.ts',
    content: `/**
 * Utilitaires de récupération d'erreurs
 */

import type { RetryOptions, CircuitBreaker, CircuitBreakerState } from '@/types/error-handling';

export class RetryManager {
  static async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= options.attempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Vérifier si on doit réessayer
        if (options.retryCondition && !options.retryCondition(lastError)) {
          throw lastError;
        }

        // Dernier essai
        if (attempt === options.attempts) {
          throw lastError;
        }

        // Calculer le délai
        let delay = options.delay;
        if (options.exponentialBackoff) {
          delay = options.delay * Math.pow(2, attempt - 1);
          if (options.maxDelay) {
            delay = Math.min(delay, options.maxDelay);
          }
        }

        // Attendre avant le prochain essai
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}

export class CircuitBreakerImpl implements CircuitBreaker {
  private state: CircuitBreakerState = {
    state: 'closed',
    failureCount: 0,
  };

  constructor(
    private failureThreshold: number = ${config.recovery.circuitBreaker.failureThreshold},
    private resetTimeout: number = ${config.recovery.circuitBreaker.resetTimeout}
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.state.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      state: 'closed',
      failureCount: 0,
    };
  }

  private onSuccess(): void {
    this.reset();
  }

  private onFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = new Date();

    if (this.state.failureCount >= this.failureThreshold) {
      this.state.state = 'open';
      this.state.nextAttemptTime = new Date(Date.now() + this.resetTimeout);
    }
  }

  private shouldAttemptReset(): boolean {
    return this.state.nextAttemptTime ?
      new Date() >= this.state.nextAttemptTime : false;
  }
}

export function createCircuitBreaker(
  failureThreshold?: number,
  resetTimeout?: number
): CircuitBreaker {
  return new CircuitBreakerImpl(failureThreshold, resetTimeout);
}`,
  };
}

/**
 * Génère les hooks d'erreur
 */
function generateErrorHooks(config: ErrorHandlingConfig): FileTemplate {
  return {
    path: 'src/hooks/use-error-handler.ts',
    content: `/**
 * Hooks pour la gestion d'erreurs
 */

import { useState, useCallback, useEffect } from 'react';
import type {
  UseErrorHandlerOptions,
  UseErrorHandlerReturn,
  UseRetryOptions,
  UseRetryReturn
} from '@/types/error-handling';
import { ErrorLogger } from '@/lib/error-logger';
import { ErrorReporter } from '@/lib/error-reporter';
import { RetryManager } from '@/lib/error-recovery';

export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const [error, setError] = useState<Error | null>(null);
  const [hasError, setHasError] = useState(false);

  const captureError = useCallback(async (error: Error) => {
    setError(error);
    setHasError(true);

    // Log l'erreur
    const logger = ErrorLogger.getInstance();
    await logger.error('Error captured by useErrorHandler', error);

    // Reporter l'erreur si configuré
    ${config.monitoring.enabled ? `
    const reporter = ErrorReporter.getInstance();
    await reporter.captureException(error);` : ''}

    // Callback personnalisé
    options.onError?.(error, { componentStack: '' });
  }, [options]);

  const reset = useCallback(() => {
    setError(null);
    setHasError(false);
  }, []);

  return {
    error,
    hasError,
    reset,
    captureError,
  };
}

export function useRetry<T>(
  fn: () => Promise<T>,
  options: UseRetryOptions
): UseRetryReturn<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  const canRetry = attempt < options.attempts;

  const execute = useCallback(async (): Promise<T> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await RetryManager.retry(fn, {
        attempts: options.attempts,
        delay: options.delay,
        exponentialBackoff: options.exponentialBackoff,
        maxDelay: options.maxDelay,
        retryCondition: options.retryCondition,
      });

      options.onSuccess?.(result, attempt + 1);
      setAttempt(0);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setAttempt(prev => prev + 1);
      options.onFailure?.(error, attempt + 1);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fn, options, attempt]);

  const reset = useCallback(() => {
    setError(null);
    setAttempt(0);
    setIsLoading(false);
  }, []);

  return {
    execute,
    isLoading,
    error,
    attempt,
    canRetry,
    reset,
  };
}

export function useErrorBoundary() {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback((error: Error) => {
    setError(error);
  }, []);

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return {
    resetError,
    captureError,
  };
}`,
  };
}

/**
 * Génère les types TypeScript pour les erreurs
 */
function generateErrorTypes(config: ErrorHandlingConfig): FileTemplate {
  return {
    path: 'src/types/error-handling.ts',
    content: `// Types générés automatiquement pour la gestion d'erreurs
export * from '@/templates/error-handling/types';

// Types spécifiques à la configuration
export interface AppErrorConfig {
  errorBoundaries: ${JSON.stringify(config.errorBoundaries, null, 2)};
  logging: ${JSON.stringify(config.logging, null, 2)};
  monitoring: ${JSON.stringify(config.monitoring, null, 2)};
}`,
  };
}

/**
 * Génère la configuration d'erreurs
 */
function generateErrorConfig(config: ErrorHandlingConfig): FileTemplate {
  return {
    path: 'src/config/error-handling.ts',
    content: `/**
 * Configuration de gestion d'erreurs de l'application
 */

export const errorHandlingConfig = ${JSON.stringify(config, null, 2)};

export default errorHandlingConfig;`,
  };
}

/**
 * Génère les tests pour la gestion d'erreurs
 */
function generateErrorTests(config: ErrorHandlingConfig): FileTemplate[] {
  return [
    {
      path: 'src/__tests__/error-handling/error-boundary.test.tsx',
      content: `import { render, screen } from '@testing-library/react';
import { GlobalErrorBoundary } from '@/components/error-boundary/global-error-boundary';

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('GlobalErrorBoundary', () => {
  it('should catch and display errors', () => {
    render(
      <GlobalErrorBoundary>
        <ThrowError shouldThrow={true} />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText(/une erreur inattendue/i)).toBeInTheDocument();
  });

  it('should render children when no error', () => {
    render(
      <GlobalErrorBoundary>
        <ThrowError shouldThrow={false} />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });
});`,
    },
  ];
}

/**
 * Génère la documentation pour la gestion d'erreurs
 */
function generateErrorDocumentation(config: ErrorHandlingConfig): FileTemplate {
  return {
    path: 'docs/error-handling.md',
    content: `# Gestion d'Erreurs

## Vue d'ensemble

Ce document décrit le système de gestion d'erreurs mis en place pour l'application.

## Fonctionnalités activées

- **Error Boundaries**: ${config.errorBoundaries.enabled ? '✅' : '❌'}
- **Pages d'erreur personnalisées**: ${config.errorPages.custom404 ? '✅' : '❌'}
- **Logging**: ${config.logging.enabled ? '✅' : '❌'}
- **Monitoring**: ${config.monitoring.enabled ? '✅' : '❌'}
- **Récupération automatique**: ${config.recovery.enabled ? '✅' : '❌'}

## Variables d'environnement

${config.monitoring.services.includes('sentry') ? '- `SENTRY_DSN`: DSN Sentry pour le monitoring' : ''}
${config.logging.destinations.includes('external') ? '- `LOG_ENDPOINT`: Endpoint pour les logs externes' : ''}

Fichiers générés: Error Boundaries, pages d'erreur, logging, monitoring, hooks et utilitaires.
`,
  };
}

/**
 * Génère un résumé de la génération
 */
function generateErrorSummary(config: ErrorHandlingConfig, files: FileTemplate[]): string {
  return `Template de gestion d'erreurs généré avec succès !

Fonctionnalités activées:
- Error Boundaries: ${config.errorBoundaries.enabled ? '✅' : '❌'}
- Pages d'erreur: ${config.errorPages.custom404 ? '✅' : '❌'}
- Logging: ${config.logging.enabled ? '✅' : '❌'}
- Monitoring: ${config.monitoring.enabled ? '✅' : '❌'}
- Récupération: ${config.recovery.enabled ? '✅' : '❌'}

Fichiers générés: ${files.length}

Prochaines étapes:
1. Intégrer les Error Boundaries dans votre layout
2. Configurer les services de monitoring si activés
3. Tester les mécanismes de récupération d'erreurs`;
}
