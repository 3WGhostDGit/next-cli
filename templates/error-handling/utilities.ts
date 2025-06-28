/**
 * Utilitaires et helpers pour la gestion d'erreurs
 */

import { ErrorHandlingConfig } from './index';
import { FileTemplate } from '../types';

/**
 * Génère l'Error Boundary global
 */
export function generateGlobalErrorBoundary(config: ErrorHandlingConfig): FileTemplate {
  return {
    path: 'src/components/error-boundary/global-error-boundary.tsx',
    content: `"use client";

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { ErrorBoundaryState, ErrorBoundaryProps } from '@/types/error-handling';
import { ErrorLogger } from '@/lib/error-logger';
import { ErrorReporter } from '@/lib/error-reporter';
import { GlobalErrorFallback } from './global-error-fallback';

interface GlobalErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void, errorId: string) => ReactNode;
}

export class GlobalErrorBoundary extends Component<
  GlobalErrorBoundaryProps,
  ErrorBoundaryState
> {
  private errorLogger: ErrorLogger;
  private errorReporter: ErrorReporter;

  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
    this.errorLogger = ErrorLogger.getInstance();
    this.errorReporter = ErrorReporter.getInstance();
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = \`global-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { errorId } = this.state;
    
    // Log l'erreur
    await this.errorLogger.error('Global Error Boundary caught an error', error, {
      errorId,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'global',
      retryCount: this.state.retryCount,
    });

    ${config.monitoring.enabled ? `
    // Reporter l'erreur aux services de monitoring
    await this.errorReporter.captureException(error, {
      userId: undefined, // À récupérer du contexte utilisateur
      sessionId: undefined, // À récupérer du contexte de session
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date(),
      environment: process.env.NODE_ENV as any,
      component: 'GlobalErrorBoundary',
      metadata: {
        errorId,
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount,
      },
    });` : ''}

    // Mettre à jour l'état avec les informations d'erreur
    this.setState({ errorInfo });
  }

  handleReset = () => {
    const newRetryCount = (this.state.retryCount || 0) + 1;
    
    ${config.errorBoundaries.maxRetries ? `
    if (newRetryCount > ${config.errorBoundaries.maxRetries}) {
      this.errorLogger.warn('Max retry attempts reached for global error boundary', undefined, {
        errorId: this.state.errorId,
        maxRetries: ${config.errorBoundaries.maxRetries},
      });
      return;
    }` : ''}

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
      retryCount: newRetryCount,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Utiliser le fallback personnalisé si fourni
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.handleReset,
          this.state.errorId || 'unknown'
        );
      }

      // Utiliser le fallback par défaut
      return (
        <GlobalErrorFallback
          error={this.state.error}
          errorId={this.state.errorId || 'unknown'}
          reset={this.handleReset}
          retryCount={this.state.retryCount || 0}
          maxRetries={${config.errorBoundaries.maxRetries}}
        />
      );
    }

    return this.props.children;
  }
}`,
  };
}

/**
 * Génère l'Error Boundary pour les routes
 */
export function generateRouteErrorBoundary(config: ErrorHandlingConfig): FileTemplate {
  return {
    path: 'src/components/error-boundary/route-error-boundary.tsx',
    content: `"use client";

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorBoundaryState, ErrorBoundaryProps } from '@/types/error-handling';
import { ErrorLogger } from '@/lib/error-logger';
import { ErrorReporter } from '@/lib/error-reporter';
import { RouteErrorFallback } from './route-error-fallback';

interface RouteErrorBoundaryProps extends ErrorBoundaryProps {
  route: string;
}

export class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  ErrorBoundaryState
> {
  private errorLogger: ErrorLogger;
  private errorReporter: ErrorReporter;

  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
    this.errorLogger = ErrorLogger.getInstance();
    this.errorReporter = ErrorReporter.getInstance();
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = \`route-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { errorId } = this.state;
    const { route } = this.props;
    
    // Log l'erreur
    await this.errorLogger.error(\`Route Error Boundary caught an error in \${route}\`, error, {
      errorId,
      route,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'route',
      retryCount: this.state.retryCount,
    });

    ${config.monitoring.enabled ? `
    // Reporter l'erreur
    await this.errorReporter.captureException(error, {
      userId: undefined,
      sessionId: undefined,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date(),
      environment: process.env.NODE_ENV as any,
      component: \`RouteErrorBoundary(\${route})\`,
      metadata: {
        errorId,
        route,
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount,
      },
    });` : ''}

    // Callback personnalisé
    this.props.onError?.(error, errorInfo, errorId || 'unknown');

    this.setState({ errorInfo });
  }

  componentDidUpdate(prevProps: RouteErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.route !== this.props.route) {
      // Reset automatique lors du changement de route
      this.handleReset();
    }

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.handleReset();
    }

    if (hasError && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevResetKeys[index]
      );
      
      if (hasResetKeyChanged) {
        this.handleReset();
      }
    }
  }

  handleReset = () => {
    const newRetryCount = (this.state.retryCount || 0) + 1;
    
    if (newRetryCount > ${config.errorBoundaries.maxRetries}) {
      this.errorLogger.warn(\`Max retry attempts reached for route \${this.props.route}\`, undefined, {
        errorId: this.state.errorId,
        route: this.props.route,
        maxRetries: ${config.errorBoundaries.maxRetries},
      });
      return;
    }

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
      retryCount: newRetryCount,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.handleReset,
          this.state.errorId || 'unknown'
        );
      }

      return (
        <RouteErrorFallback
          error={this.state.error}
          errorId={this.state.errorId || 'unknown'}
          route={this.props.route}
          reset={this.handleReset}
          retryCount={this.state.retryCount || 0}
          maxRetries={${config.errorBoundaries.maxRetries}}
        />
      );
    }

    return this.props.children;
  }
}

// Hook pour utiliser RouteErrorBoundary avec le router
export function withRouteErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<RouteErrorBoundaryProps>
) {
  return function WrappedComponent(props: P) {
    const router = useRouter();
    const route = typeof window !== 'undefined' ? window.location.pathname : '/';

    return (
      <RouteErrorBoundary
        route={route}
        {...errorBoundaryProps}
      >
        <Component {...props} />
      </RouteErrorBoundary>
    );
  };
}`,
  };
}

/**
 * Génère l'Error Boundary pour les composants
 */
export function generateComponentErrorBoundary(config: ErrorHandlingConfig): FileTemplate {
  return {
    path: 'src/components/error-boundary/component-error-boundary.tsx',
    content: `"use client";

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { ErrorBoundaryState, ErrorBoundaryProps } from '@/types/error-handling';
import { ErrorLogger } from '@/lib/error-logger';
import { ErrorReporter } from '@/lib/error-reporter';
import { ComponentErrorFallback } from './component-error-fallback';

interface ComponentErrorBoundaryProps extends ErrorBoundaryProps {
  name: string;
  isolate?: boolean;
}

export class ComponentErrorBoundary extends Component<
  ComponentErrorBoundaryProps,
  ErrorBoundaryState
> {
  private errorLogger: ErrorLogger;
  private errorReporter: ErrorReporter;

  constructor(props: ComponentErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
    this.errorLogger = ErrorLogger.getInstance();
    this.errorReporter = ErrorReporter.getInstance();
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = \`component-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { errorId } = this.state;
    const { name, isolate } = this.props;
    
    // Log l'erreur
    await this.errorLogger.error(\`Component Error Boundary caught an error in \${name}\`, error, {
      errorId,
      componentName: name,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'component',
      isolated: isolate,
      retryCount: this.state.retryCount,
    });

    ${config.monitoring.enabled ? `
    // Reporter l'erreur seulement si pas isolé ou si c'est critique
    if (!isolate || error.name === 'ChunkLoadError') {
      await this.errorReporter.captureException(error, {
        userId: undefined,
        sessionId: undefined,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date(),
        environment: process.env.NODE_ENV as any,
        component: \`ComponentErrorBoundary(\${name})\`,
        metadata: {
          errorId,
          componentName: name,
          componentStack: errorInfo.componentStack,
          isolated: isolate,
          retryCount: this.state.retryCount,
        },
      });
    }` : ''}

    // Callback personnalisé
    this.props.onError?.(error, errorInfo, errorId || 'unknown');

    this.setState({ errorInfo });
  }

  componentDidUpdate(prevProps: ComponentErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.handleReset();
    }

    if (hasError && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevResetKeys[index]
      );
      
      if (hasResetKeyChanged) {
        this.handleReset();
      }
    }
  }

  handleReset = () => {
    const newRetryCount = (this.state.retryCount || 0) + 1;
    
    if (newRetryCount > ${config.errorBoundaries.maxRetries}) {
      this.errorLogger.warn(\`Max retry attempts reached for component \${this.props.name}\`, undefined, {
        errorId: this.state.errorId,
        componentName: this.props.name,
        maxRetries: ${config.errorBoundaries.maxRetries},
      });
      return;
    }

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
      retryCount: newRetryCount,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.handleReset,
          this.state.errorId || 'unknown'
        );
      }

      return (
        <ComponentErrorFallback
          error={this.state.error}
          errorId={this.state.errorId || 'unknown'}
          componentName={this.props.name}
          reset={this.handleReset}
          retryCount={this.state.retryCount || 0}
          maxRetries={${config.errorBoundaries.maxRetries}}
          isolate={this.props.isolate}
        />
      );
    }

    return this.props.children;
  }
}

// HOC pour wrapper automatiquement les composants
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    name?: string;
    isolate?: boolean;
    fallback?: ComponentErrorBoundaryProps['fallback'];
    onError?: ComponentErrorBoundaryProps['onError'];
  } = {}
) {
  const componentName = options.name || Component.displayName || Component.name || 'Unknown';
  
  function WrappedComponent(props: P) {
    return (
      <ComponentErrorBoundary
        name={componentName}
        isolate={options.isolate}
        fallback={options.fallback}
        onError={options.onError}
      >
        <Component {...props} />
      </ComponentErrorBoundary>
    );
  }

  WrappedComponent.displayName = \`withErrorBoundary(\${componentName})\`;
  
  return WrappedComponent;
}`,
  };
}
