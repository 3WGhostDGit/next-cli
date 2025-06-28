/**
 * Extensions et plugins pour la gestion d'erreurs
 */

import { ErrorHandlingConfig } from './index';
import { FileTemplate } from '../types';

/**
 * Extension pour la gestion d'erreurs
 */
export interface ErrorHandlingExtension {
  name: string;
  version: string;
  description: string;
  dependencies: string[];
  generate: (config: ErrorHandlingConfig) => FileTemplate[];
}

/**
 * Extension pour l'intégration Sentry avancée
 */
export const sentryAdvancedExtension: ErrorHandlingExtension = {
  name: 'sentry-advanced',
  version: '1.0.0',
  description: 'Intégration Sentry avancée avec performance monitoring',
  dependencies: ['@sentry/nextjs', '@sentry/profiling-node'],
  generate: (config: ErrorHandlingConfig) => [
    {
      path: 'src/lib/sentry-advanced.ts',
      content: generateSentryAdvanced(config),
    },
    {
      path: 'sentry.client.config.ts',
      content: generateSentryClientConfig(config),
    },
    {
      path: 'sentry.server.config.ts',
      content: generateSentryServerConfig(config),
    },
    {
      path: 'sentry.edge.config.ts',
      content: generateSentryEdgeConfig(config),
    },
  ],
};

/**
 * Extension pour l'intégration LogRocket
 */
export const logRocketExtension: ErrorHandlingExtension = {
  name: 'logrocket',
  version: '1.0.0',
  description: 'Intégration LogRocket pour session replay',
  dependencies: ['logrocket', 'logrocket-react'],
  generate: (config: ErrorHandlingConfig) => [
    {
      path: 'src/lib/logrocket-integration.ts',
      content: generateLogRocketIntegration(config),
    },
    {
      path: 'src/components/logrocket-provider.tsx',
      content: generateLogRocketProvider(config),
    },
  ],
};

/**
 * Extension pour l'intégration Datadog RUM
 */
export const datadogRumExtension: ErrorHandlingExtension = {
  name: 'datadog-rum',
  version: '1.0.0',
  description: 'Intégration Datadog Real User Monitoring',
  dependencies: ['@datadog/browser-rum'],
  generate: (config: ErrorHandlingConfig) => [
    {
      path: 'src/lib/datadog-rum.ts',
      content: generateDatadogRUM(config),
    },
  ],
};

/**
 * Extension pour l'analyse d'erreurs avec IA
 */
export const aiErrorAnalysisExtension: ErrorHandlingExtension = {
  name: 'ai-error-analysis',
  version: '1.0.0',
  description: 'Analyse d\'erreurs avec intelligence artificielle',
  dependencies: ['openai', '@anthropic-ai/sdk'],
  generate: (config: ErrorHandlingConfig) => [
    {
      path: 'src/lib/ai-error-analysis.ts',
      content: generateAIErrorAnalysis(config),
    },
    {
      path: 'src/lib/error-classification.ts',
      content: generateErrorClassification(config),
    },
  ],
};

/**
 * Extension pour les notifications avancées
 */
export const advancedNotificationsExtension: ErrorHandlingExtension = {
  name: 'advanced-notifications',
  version: '1.0.0',
  description: 'Système de notifications avancé multi-canaux',
  dependencies: ['nodemailer', '@slack/web-api', 'discord.js', 'twilio'],
  generate: (config: ErrorHandlingConfig) => [
    {
      path: 'src/lib/notification-manager.ts',
      content: generateNotificationManager(config),
    },
    {
      path: 'src/lib/notification-channels.ts',
      content: generateNotificationChannels(config),
    },
  ],
};

/**
 * Extension pour le monitoring de performance
 */
export const performanceMonitoringExtension: ErrorHandlingExtension = {
  name: 'performance-monitoring',
  version: '1.0.0',
  description: 'Monitoring de performance et métriques avancées',
  dependencies: ['web-vitals', 'perfume.js'],
  generate: (config: ErrorHandlingConfig) => [
    {
      path: 'src/lib/performance-monitor.ts',
      content: generatePerformanceMonitor(config),
    },
    {
      path: 'src/hooks/use-performance.ts',
      content: generatePerformanceHooks(config),
    },
  ],
};

// Générateurs pour les extensions

function generateSentryAdvanced(config: ErrorHandlingConfig): string {
  return `/**
 * Configuration Sentry avancée
 */

import * as Sentry from '@sentry/nextjs';
import { ProfilingIntegration } from '@sentry/profiling-node';

export class SentryAdvanced {
  static init() {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: ${config.monitoring.sentry?.tracesSampleRate || 0.1},
      profilesSampleRate: ${config.monitoring.sentry?.profilesSampleRate || 0.1},
      
      integrations: [
        new ProfilingIntegration(),
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app: undefined }),
      ],
      
      beforeSend(event, hint) {
        // Filtrage personnalisé des erreurs
        if (event.exception) {
          const error = hint.originalException;
          
          // Ignorer certaines erreurs
          if (error instanceof Error) {
            if (error.message.includes('Network Error')) {
              return null;
            }
          }
        }
        
        return event;
      },
      
      beforeSendTransaction(event) {
        // Filtrage des transactions
        if (event.transaction === 'GET /health') {
          return null;
        }
        
        return event;
      },
    });
  }

  static captureUserFeedback(feedback: {
    name: string;
    email: string;
    comments: string;
  }) {
    Sentry.captureUserFeedback({
      event_id: Sentry.lastEventId(),
      ...feedback,
    });
  }

  static setUserContext(user: {
    id: string;
    email?: string;
    username?: string;
  }) {
    Sentry.setUser(user);
  }

  static addBreadcrumb(message: string, category: string, data?: any) {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    });
  }
}`;
}

function generateSentryClientConfig(config: ErrorHandlingConfig): string {
  return `import { init } from '@sentry/nextjs';

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: ${config.monitoring.sentry?.tracesSampleRate || 0.1},
  debug: process.env.NODE_ENV === 'development',
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});`;
}

function generateSentryServerConfig(config: ErrorHandlingConfig): string {
  return `import { init } from '@sentry/nextjs';

init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: ${config.monitoring.sentry?.tracesSampleRate || 0.1},
  debug: process.env.NODE_ENV === 'development',
});`;
}

function generateSentryEdgeConfig(config: ErrorHandlingConfig): string {
  return `import { init } from '@sentry/nextjs';

init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: ${config.monitoring.sentry?.tracesSampleRate || 0.1},
});`;
}

function generateLogRocketIntegration(config: ErrorHandlingConfig): string {
  return `/**
 * Intégration LogRocket
 */

import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';

export class LogRocketIntegration {
  private static initialized = false;

  static init() {
    if (this.initialized || typeof window === 'undefined') return;
    
    LogRocket.init('${config.projectName}/production');
    setupLogRocketReact(LogRocket);
    
    this.initialized = true;
  }

  static identify(userId: string, userInfo?: {
    name?: string;
    email?: string;
    [key: string]: any;
  }) {
    LogRocket.identify(userId, userInfo);
  }

  static captureException(error: Error) {
    LogRocket.captureException(error);
  }

  static track(event: string, properties?: Record<string, any>) {
    LogRocket.track(event, properties);
  }

  static getSessionURL(): string | null {
    return LogRocket.sessionURL;
  }
}`;
}

function generateLogRocketProvider(config: ErrorHandlingConfig): string {
  return `/**
 * Provider LogRocket
 */

'use client';

import { useEffect } from 'react';
import { LogRocketIntegration } from '@/lib/logrocket-integration';

interface LogRocketProviderProps {
  children: React.ReactNode;
  userId?: string;
  userInfo?: Record<string, any>;
}

export function LogRocketProvider({ 
  children, 
  userId, 
  userInfo 
}: LogRocketProviderProps) {
  useEffect(() => {
    LogRocketIntegration.init();
    
    if (userId) {
      LogRocketIntegration.identify(userId, userInfo);
    }
  }, [userId, userInfo]);

  return <>{children}</>;
}`;
}

function generateDatadogRUM(config: ErrorHandlingConfig): string {
  return `/**
 * Intégration Datadog RUM
 */

import { datadogRum } from '@datadog/browser-rum';

export class DatadogRUMIntegration {
  private static initialized = false;

  static init() {
    if (this.initialized || typeof window === 'undefined') return;
    
    datadogRum.init({
      applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID!,
      clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN!,
      site: '${config.monitoring.datadog?.site || 'datadoghq.com'}',
      service: '${config.projectName}',
      env: process.env.NODE_ENV,
      version: process.env.NEXT_PUBLIC_APP_VERSION,
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'mask-user-input',
    });
    
    datadogRum.startSessionReplayRecording();
    this.initialized = true;
  }

  static setUser(user: {
    id: string;
    name?: string;
    email?: string;
    [key: string]: any;
  }) {
    datadogRum.setUser(user);
  }

  static addError(error: Error, context?: Record<string, any>) {
    datadogRum.addError(error, context);
  }

  static addAction(name: string, context?: Record<string, any>) {
    datadogRum.addAction(name, context);
  }
}`;
}

function generateAIErrorAnalysis(config: ErrorHandlingConfig): string {
  return `/**
 * Analyse d'erreurs avec IA
 */

import OpenAI from 'openai';

export class AIErrorAnalysis {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeError(error: {
    message: string;
    stack?: string;
    context?: Record<string, any>;
  }): Promise<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    suggestedFix: string;
    confidence: number;
  }> {
    const prompt = \`
Analyze this JavaScript/TypeScript error and provide:
1. Severity level (low/medium/high/critical)
2. Error category
3. Suggested fix
4. Confidence level (0-1)

Error: \${error.message}
Stack: \${error.stack || 'N/A'}
Context: \${JSON.stringify(error.context || {}, null, 2)}

Respond in JSON format.
\`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      return analysis;
    } catch (error) {
      return {
        severity: 'medium',
        category: 'unknown',
        suggestedFix: 'Unable to analyze error automatically',
        confidence: 0,
      };
    }
  }

  async generateErrorReport(errors: any[]): Promise<string> {
    const prompt = \`
Generate a comprehensive error report for these errors:
\${JSON.stringify(errors, null, 2)}

Include:
- Summary of error patterns
- Root cause analysis
- Recommendations for fixes
- Priority order for addressing issues
\`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });

      return response.choices[0].message.content || 'Unable to generate report';
    } catch (error) {
      return 'Error generating AI report';
    }
  }
}`;
}

function generateErrorClassification(config: ErrorHandlingConfig): string {
  return `/**
 * Classification automatique des erreurs
 */

export class ErrorClassification {
  private static patterns = {
    network: [
      /network error/i,
      /fetch.*failed/i,
      /connection.*refused/i,
      /timeout/i,
    ],
    validation: [
      /validation.*failed/i,
      /invalid.*input/i,
      /required.*field/i,
      /schema.*error/i,
    ],
    authentication: [
      /unauthorized/i,
      /authentication.*failed/i,
      /invalid.*token/i,
      /session.*expired/i,
    ],
    authorization: [
      /forbidden/i,
      /access.*denied/i,
      /permission.*denied/i,
      /insufficient.*privileges/i,
    ],
    server: [
      /internal.*server.*error/i,
      /500/,
      /database.*error/i,
      /server.*unavailable/i,
    ],
    client: [
      /400/,
      /bad.*request/i,
      /malformed/i,
      /syntax.*error/i,
    ],
  };

  static classify(error: Error): {
    category: string;
    confidence: number;
    tags: string[];
  } {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    
    let bestMatch = { category: 'unknown', confidence: 0 };
    const tags: string[] = [];

    for (const [category, patterns] of Object.entries(this.patterns)) {
      let matches = 0;
      
      for (const pattern of patterns) {
        if (pattern.test(message) || pattern.test(stack)) {
          matches++;
        }
      }
      
      const confidence = matches / patterns.length;
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { category, confidence };
      }
      
      if (confidence > 0) {
        tags.push(category);
      }
    }

    return {
      category: bestMatch.category,
      confidence: bestMatch.confidence,
      tags,
    };
  }

  static getSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const message = error.message.toLowerCase();
    
    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical';
    }
    
    if (message.includes('error') || message.includes('failed')) {
      return 'high';
    }
    
    if (message.includes('warning') || message.includes('deprecated')) {
      return 'medium';
    }
    
    return 'low';
  }
}`;
}

function generateNotificationManager(config: ErrorHandlingConfig): string {
  return `/**
 * Gestionnaire de notifications avancé
 */

export interface NotificationChannel {
  name: string;
  type: 'email' | 'slack' | 'discord' | 'webhook' | 'sms';
  config: Record<string, any>;
  enabled: boolean;
}

export class NotificationManager {
  private channels: Map<string, NotificationChannel> = new Map();
  private throttle: Map<string, number> = new Map();

  addChannel(channel: NotificationChannel) {
    this.channels.set(channel.name, channel);
  }

  async sendNotification(
    channelName: string,
    message: {
      title: string;
      body: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      metadata?: Record<string, any>;
    }
  ): Promise<boolean> {
    const channel = this.channels.get(channelName);
    if (!channel || !channel.enabled) {
      return false;
    }

    // Vérifier le throttling
    if (this.isThrottled(channelName, message.severity)) {
      return false;
    }

    try {
      switch (channel.type) {
        case 'email':
          return await this.sendEmail(channel, message);
        case 'slack':
          return await this.sendSlack(channel, message);
        case 'discord':
          return await this.sendDiscord(channel, message);
        case 'webhook':
          return await this.sendWebhook(channel, message);
        case 'sms':
          return await this.sendSMS(channel, message);
        default:
          return false;
      }
    } catch (error) {
      console.error(\`Failed to send notification via \${channelName}:\`, error);
      return false;
    }
  }

  private isThrottled(channelName: string, severity: string): boolean {
    const key = \`\${channelName}:\${severity}\`;
    const lastSent = this.throttle.get(key) || 0;
    const now = Date.now();
    
    // Throttling basé sur la sévérité
    const throttleTime = severity === 'critical' ? 5 * 60 * 1000 : 60 * 60 * 1000;
    
    if (now - lastSent < throttleTime) {
      return true;
    }
    
    this.throttle.set(key, now);
    return false;
  }

  private async sendEmail(channel: NotificationChannel, message: any): Promise<boolean> {
    // Implémentation email avec nodemailer
    return true;
  }

  private async sendSlack(channel: NotificationChannel, message: any): Promise<boolean> {
    // Implémentation Slack
    return true;
  }

  private async sendDiscord(channel: NotificationChannel, message: any): Promise<boolean> {
    // Implémentation Discord
    return true;
  }

  private async sendWebhook(channel: NotificationChannel, message: any): Promise<boolean> {
    // Implémentation webhook générique
    return true;
  }

  private async sendSMS(channel: NotificationChannel, message: any): Promise<boolean> {
    // Implémentation SMS avec Twilio
    return true;
  }
}`;
}

function generateNotificationChannels(config: ErrorHandlingConfig): string {
  return `/**
 * Canaux de notification spécialisés
 */

import nodemailer from 'nodemailer';
import { WebClient } from '@slack/web-api';
import { Client as DiscordClient } from 'discord.js';
import twilio from 'twilio';

export class EmailChannel {
  private transporter: nodemailer.Transporter;

  constructor(config: any) {
    this.transporter = nodemailer.createTransporter(config.smtp);
  }

  async send(message: any): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: message.recipients,
        subject: \`[${config.projectName}] \${message.title}\`,
        html: this.formatEmailHTML(message),
      });
      return true;
    } catch (error) {
      console.error('Email send failed:', error);
      return false;
    }
  }

  private formatEmailHTML(message: any): string {
    return \`
      <h2>\${message.title}</h2>
      <p><strong>Sévérité:</strong> \${message.severity}</p>
      <p>\${message.body}</p>
      \${message.metadata ? \`<pre>\${JSON.stringify(message.metadata, null, 2)}</pre>\` : ''}
    \`;
  }
}

export class SlackChannel {
  private client: WebClient;

  constructor(config: any) {
    this.client = new WebClient(config.token);
  }

  async send(message: any): Promise<boolean> {
    try {
      await this.client.chat.postMessage({
        channel: message.channel,
        text: message.title,
        blocks: this.formatSlackBlocks(message),
      });
      return true;
    } catch (error) {
      console.error('Slack send failed:', error);
      return false;
    }
  }

  private formatSlackBlocks(message: any) {
    return [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: message.title,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: \`*Sévérité:* \${message.severity}\`,
          },
          {
            type: 'mrkdwn',
            text: \`*Projet:* ${config.projectName}\`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message.body,
        },
      },
    ];
  }
}`;
}

function generatePerformanceMonitor(config: ErrorHandlingConfig): string {
  return `/**
 * Monitoring de performance
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export class PerformanceMonitor {
  private static metrics: Map<string, number> = new Map();

  static init() {
    if (typeof window === 'undefined') return;

    // Core Web Vitals
    getCLS(this.handleMetric.bind(this));
    getFID(this.handleMetric.bind(this));
    getFCP(this.handleMetric.bind(this));
    getLCP(this.handleMetric.bind(this));
    getTTFB(this.handleMetric.bind(this));

    // Custom metrics
    this.measureCustomMetrics();
  }

  private static handleMetric(metric: any) {
    this.metrics.set(metric.name, metric.value);
    
    // Envoyer vers le monitoring
    if (${config.analytics.trackPerformance}) {
      this.sendMetric(metric);
    }
  }

  private static sendMetric(metric: any) {
    // Envoyer vers Datadog, Sentry, etc.
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta,
      });
    }
  }

  private static measureCustomMetrics() {
    // Mesurer le temps de chargement des composants
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          this.metrics.set(entry.name, entry.duration);
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });
  }

  static startMeasure(name: string) {
    performance.mark(\`\${name}-start\`);
  }

  static endMeasure(name: string) {
    performance.mark(\`\${name}-end\`);
    performance.measure(name, \`\${name}-start\`, \`\${name}-end\`);
  }

  static getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}`;
}

function generatePerformanceHooks(config: ErrorHandlingConfig): string {
  return `/**
 * Hooks de performance
 */

import { useEffect, useRef } from 'react';
import { PerformanceMonitor } from '@/lib/performance-monitor';

export function usePerformanceMonitor(componentName: string) {
  const startTime = useRef<number>();

  useEffect(() => {
    startTime.current = performance.now();
    PerformanceMonitor.startMeasure(\`component-\${componentName}\`);

    return () => {
      PerformanceMonitor.endMeasure(\`component-\${componentName}\`);
    };
  }, [componentName]);
}

export function useRenderTime(componentName: string) {
  const renderCount = useRef(0);
  const totalTime = useRef(0);

  useEffect(() => {
    const start = performance.now();
    renderCount.current++;

    return () => {
      const end = performance.now();
      const renderTime = end - start;
      totalTime.current += renderTime;

      console.log(\`\${componentName} render #\${renderCount.current}: \${renderTime.toFixed(2)}ms\`);
      console.log(\`\${componentName} average: \${(totalTime.current / renderCount.current).toFixed(2)}ms\`);
    };
  });
}`;
}

// Registry des extensions disponibles
export const availableExtensions: ErrorHandlingExtension[] = [
  sentryAdvancedExtension,
  logRocketExtension,
  datadogRumExtension,
  aiErrorAnalysisExtension,
  advancedNotificationsExtension,
  performanceMonitoringExtension,
];

/**
 * Génère les fichiers pour les extensions sélectionnées
 */
export function generateExtensions(
  config: ErrorHandlingConfig,
  selectedExtensions: string[]
): FileTemplate[] {
  const files: FileTemplate[] = [];

  for (const extensionName of selectedExtensions) {
    const extension = availableExtensions.find(ext => ext.name === extensionName);
    if (extension) {
      files.push(...extension.generate(config));
    }
  }

  return files;
}
