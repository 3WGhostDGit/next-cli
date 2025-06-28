/**
 * Extensions et plugins pour le middleware de sécurité
 */

import { SecurityConfig } from './index';
import { FileTemplate } from '../types';

/**
 * Extension pour l'intégration avec des services tiers
 */
export interface SecurityExtension {
  name: string;
  version: string;
  description: string;
  dependencies: string[];
  generate: (config: SecurityConfig) => FileTemplate[];
}

/**
 * Extension pour l'intégration Cloudflare
 */
export const cloudflareExtension: SecurityExtension = {
  name: 'cloudflare',
  version: '1.0.0',
  description: 'Intégration avec Cloudflare Workers et WAF',
  dependencies: ['@cloudflare/workers-types'],
  generate: (config: SecurityConfig) => [
    {
      path: 'src/lib/cloudflare-integration.ts',
      content: generateCloudflareIntegration(config),
    },
    {
      path: 'src/middleware/cloudflare-headers.ts',
      content: generateCloudflareHeaders(config),
    },
  ],
};

/**
 * Extension pour l'intégration Vercel
 */
export const vercelExtension: SecurityExtension = {
  name: 'vercel',
  version: '1.0.0',
  description: 'Intégration avec Vercel Edge Functions et KV',
  dependencies: ['@vercel/edge-config', '@vercel/kv'],
  generate: (config: SecurityConfig) => [
    {
      path: 'src/lib/vercel-integration.ts',
      content: generateVercelIntegration(config),
    },
    {
      path: 'src/middleware/vercel-edge.ts',
      content: generateVercelEdge(config),
    },
  ],
};

/**
 * Extension pour l'intégration AWS
 */
export const awsExtension: SecurityExtension = {
  name: 'aws',
  version: '1.0.0',
  description: 'Intégration avec AWS WAF et CloudFront',
  dependencies: ['aws-sdk', '@aws-sdk/client-wafv2'],
  generate: (config: SecurityConfig) => [
    {
      path: 'src/lib/aws-integration.ts',
      content: generateAWSIntegration(config),
    },
  ],
};

/**
 * Extension pour l'authentification avancée
 */
export const advancedAuthExtension: SecurityExtension = {
  name: 'advanced-auth',
  version: '1.0.0',
  description: 'Authentification avancée avec MFA et biométrie',
  dependencies: ['@simplewebauthn/server', 'speakeasy'],
  generate: (config: SecurityConfig) => [
    {
      path: 'src/lib/mfa.ts',
      content: generateMFAIntegration(config),
    },
    {
      path: 'src/lib/webauthn.ts',
      content: generateWebAuthnIntegration(config),
    },
  ],
};

/**
 * Extension pour l'analyse comportementale
 */
export const behavioralAnalysisExtension: SecurityExtension = {
  name: 'behavioral-analysis',
  version: '1.0.0',
  description: 'Analyse comportementale et détection d\'anomalies',
  dependencies: ['ml-matrix', 'simple-statistics'],
  generate: (config: SecurityConfig) => [
    {
      path: 'src/lib/behavioral-analysis.ts',
      content: generateBehavioralAnalysis(config),
    },
    {
      path: 'src/lib/anomaly-detection.ts',
      content: generateAnomalyDetection(config),
    },
  ],
};

// Générateurs pour les extensions

function generateCloudflareIntegration(config: SecurityConfig): string {
  return `/**
 * Intégration Cloudflare pour la sécurité
 */

export class CloudflareSecurityIntegration {
  static async getClientIP(request: Request): Promise<string> {
    return request.headers.get('CF-Connecting-IP') || 
           request.headers.get('X-Forwarded-For') || 
           'unknown';
  }

  static async getCountryCode(request: Request): Promise<string | null> {
    return request.headers.get('CF-IPCountry');
  }

  static async getThreatScore(request: Request): Promise<number | null> {
    const score = request.headers.get('CF-Threat-Score');
    return score ? parseInt(score, 10) : null;
  }

  static async isBot(request: Request): Promise<boolean> {
    const botScore = request.headers.get('CF-Bot-Score');
    return botScore ? parseInt(botScore, 10) < 30 : false;
  }

  static async getRayId(request: Request): Promise<string | null> {
    return request.headers.get('CF-Ray');
  }
}`;
}

function generateCloudflareHeaders(config: SecurityConfig): string {
  return `/**
 * Headers Cloudflare pour la sécurité
 */

import { NextRequest, NextResponse } from 'next/server';

export function addCloudflareSecurityHeaders(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  // Ajouter les headers de sécurité Cloudflare
  response.headers.set('CF-Cache-Status', 'DYNAMIC');
  response.headers.set('CF-Security-Level', 'high');
  
  // Headers personnalisés basés sur la configuration
  if (${config.advanced.geoBlocking.enabled}) {
    const country = request.headers.get('CF-IPCountry');
    if (country) {
      response.headers.set('X-Country-Code', country);
    }
  }

  return response;
}`;
}

function generateVercelIntegration(config: SecurityConfig): string {
  return `/**
 * Intégration Vercel pour la sécurité
 */

import { kv } from '@vercel/kv';
import { get } from '@vercel/edge-config';

export class VercelSecurityIntegration {
  static async getRateLimitData(key: string): Promise<any> {
    try {
      return await kv.get(key);
    } catch (error) {
      console.error('Erreur KV:', error);
      return null;
    }
  }

  static async setRateLimitData(key: string, data: any, ttl: number): Promise<void> {
    try {
      await kv.set(key, data, { ex: ttl });
    } catch (error) {
      console.error('Erreur KV set:', error);
    }
  }

  static async getSecurityConfig(): Promise<any> {
    try {
      return await get('security');
    } catch (error) {
      console.error('Erreur Edge Config:', error);
      return null;
    }
  }

  static async isIPBlocked(ip: string): Promise<boolean> {
    try {
      const blockedIPs = await get('blocked-ips');
      return Array.isArray(blockedIPs) && blockedIPs.includes(ip);
    } catch (error) {
      console.error('Erreur vérification IP:', error);
      return false;
    }
  }
}`;
}

function generateVercelEdge(config: SecurityConfig): string {
  return `/**
 * Middleware Edge pour Vercel
 */

import { NextRequest, NextResponse } from 'next/server';
import { VercelSecurityIntegration } from '@/lib/vercel-integration';

export async function vercelEdgeMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  // Vérifier si l'IP est bloquée
  const isBlocked = await VercelSecurityIntegration.isIPBlocked(ip);
  if (isBlocked) {
    return new NextResponse('IP Blocked', { status: 403 });
  }

  // Récupérer la configuration de sécurité
  const securityConfig = await VercelSecurityIntegration.getSecurityConfig();
  if (securityConfig?.maintenanceMode) {
    return new NextResponse('Maintenance Mode', { status: 503 });
  }

  return null; // Continuer avec le middleware principal
}`;
}

function generateAWSIntegration(config: SecurityConfig): string {
  return `/**
 * Intégration AWS pour la sécurité
 */

import { WAFV2Client, GetIPSetCommand } from '@aws-sdk/client-wafv2';

export class AWSSecurityIntegration {
  private wafClient: WAFV2Client;

  constructor() {
    this.wafClient = new WAFV2Client({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  async isIPInBlocklist(ip: string): Promise<boolean> {
    try {
      const command = new GetIPSetCommand({
        Scope: 'CLOUDFRONT',
        Id: process.env.AWS_WAF_IP_SET_ID,
        Name: 'blocked-ips',
      });
      
      const response = await this.wafClient.send(command);
      return response.IPSet?.Addresses?.includes(ip) || false;
    } catch (error) {
      console.error('Erreur AWS WAF:', error);
      return false;
    }
  }
}`;
}

function generateMFAIntegration(config: SecurityConfig): string {
  return `/**
 * Authentification multi-facteurs (MFA)
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export class MFAService {
  static generateSecret(userEmail: string): {
    secret: string;
    qrCode: string;
    backupCodes: string[];
  } {
    const secret = speakeasy.generateSecret({
      name: userEmail,
      issuer: '${config.projectName}',
      length: 32,
    });

    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    return {
      secret: secret.base32,
      qrCode: secret.otpauth_url || '',
      backupCodes,
    };
  }

  static verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Tolérance de 2 périodes (60 secondes)
    });
  }

  static async generateQRCode(otpauthUrl: string): Promise<string> {
    try {
      return await QRCode.toDataURL(otpauthUrl);
    } catch (error) {
      throw new Error('Erreur génération QR Code');
    }
  }
}`;
}

function generateWebAuthnIntegration(config: SecurityConfig): string {
  return `/**
 * Authentification WebAuthn (biométrie)
 */

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

export class WebAuthnService {
  private static readonly RP_NAME = '${config.projectName}';
  private static readonly RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost';
  private static readonly ORIGIN = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';

  static async generateRegistrationOptions(userID: string, userName: string) {
    return await generateRegistrationOptions({
      rpName: this.RP_NAME,
      rpID: this.RP_ID,
      userID,
      userName,
      timeout: 60000,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'discouraged',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
    });
  }

  static async verifyRegistration(
    expectedChallenge: string,
    registrationResponse: any
  ) {
    return await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge,
      expectedOrigin: this.ORIGIN,
      expectedRPID: this.RP_ID,
    });
  }

  static async generateAuthenticationOptions() {
    return await generateAuthenticationOptions({
      timeout: 60000,
      userVerification: 'preferred',
      rpID: this.RP_ID,
    });
  }

  static async verifyAuthentication(
    expectedChallenge: string,
    authenticationResponse: any,
    authenticator: any
  ) {
    return await verifyAuthenticationResponse({
      response: authenticationResponse,
      expectedChallenge,
      expectedOrigin: this.ORIGIN,
      expectedRPID: this.RP_ID,
      authenticator,
    });
  }
}`;
}

function generateBehavioralAnalysis(config: SecurityConfig): string {
  return `/**
 * Analyse comportementale des utilisateurs
 */

export interface UserBehavior {
  userId: string;
  sessionId: string;
  actions: BehaviorAction[];
  patterns: BehaviorPattern[];
  riskScore: number;
}

export interface BehaviorAction {
  type: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface BehaviorPattern {
  name: string;
  frequency: number;
  lastSeen: Date;
  confidence: number;
}

export class BehavioralAnalysisService {
  private static readonly RISK_THRESHOLD = 0.7;

  static analyzeUserBehavior(behavior: UserBehavior): {
    isAnomalous: boolean;
    riskScore: number;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let riskScore = 0;

    // Analyser la fréquence des actions
    const actionFrequency = this.calculateActionFrequency(behavior.actions);
    if (actionFrequency > 10) { // Plus de 10 actions par minute
      riskScore += 0.3;
      reasons.push('Fréquence d\'actions élevée');
    }

    // Analyser les patterns inhabituels
    const unusualPatterns = this.detectUnusualPatterns(behavior.patterns);
    if (unusualPatterns.length > 0) {
      riskScore += 0.4;
      reasons.push('Patterns comportementaux inhabituels');
    }

    // Analyser les heures d'activité
    const isUnusualTime = this.isUnusualActivityTime(behavior.actions);
    if (isUnusualTime) {
      riskScore += 0.2;
      reasons.push('Activité à des heures inhabituelles');
    }

    return {
      isAnomalous: riskScore >= this.RISK_THRESHOLD,
      riskScore,
      reasons,
    };
  }

  private static calculateActionFrequency(actions: BehaviorAction[]): number {
    if (actions.length < 2) return 0;
    
    const timeSpan = actions[actions.length - 1].timestamp.getTime() - actions[0].timestamp.getTime();
    const minutes = timeSpan / (1000 * 60);
    
    return actions.length / Math.max(minutes, 1);
  }

  private static detectUnusualPatterns(patterns: BehaviorPattern[]): BehaviorPattern[] {
    return patterns.filter(pattern => pattern.confidence < 0.5);
  }

  private static isUnusualActivityTime(actions: BehaviorAction[]): boolean {
    const now = new Date();
    const hour = now.getHours();
    
    // Considérer 22h-6h comme inhabituel
    return hour >= 22 || hour <= 6;
  }
}`;
}

function generateAnomalyDetection(config: SecurityConfig): string {
  return `/**
 * Détection d'anomalies de sécurité
 */

export interface SecurityAnomaly {
  id: string;
  type: 'behavioral' | 'network' | 'authentication' | 'access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  metadata: Record<string, any>;
  confidence: number;
}

export class AnomalyDetectionService {
  private static readonly CONFIDENCE_THRESHOLD = 0.8;

  static detectAnomalies(events: any[]): SecurityAnomaly[] {
    const anomalies: SecurityAnomaly[] = [];

    // Détecter les tentatives de brute force
    const bruteForceAnomaly = this.detectBruteForce(events);
    if (bruteForceAnomaly) {
      anomalies.push(bruteForceAnomaly);
    }

    // Détecter les accès géographiques suspects
    const geoAnomaly = this.detectGeographicalAnomaly(events);
    if (geoAnomaly) {
      anomalies.push(geoAnomaly);
    }

    // Détecter les patterns d'accès inhabituels
    const accessAnomaly = this.detectAccessPatternAnomaly(events);
    if (accessAnomaly) {
      anomalies.push(accessAnomaly);
    }

    return anomalies.filter(anomaly => 
      anomaly.confidence >= this.CONFIDENCE_THRESHOLD
    );
  }

  private static detectBruteForce(events: any[]): SecurityAnomaly | null {
    const failedLogins = events.filter(e => 
      e.type === 'auth_failure' && 
      Date.now() - e.timestamp.getTime() < 300000 // 5 minutes
    );

    if (failedLogins.length >= 5) {
      return {
        id: \`bf-\${Date.now()}\`,
        type: 'authentication',
        severity: 'high',
        description: 'Tentative de brute force détectée',
        timestamp: new Date(),
        metadata: {
          failedAttempts: failedLogins.length,
          timeWindow: '5 minutes',
        },
        confidence: Math.min(failedLogins.length / 10, 1),
      };
    }

    return null;
  }

  private static detectGeographicalAnomaly(events: any[]): SecurityAnomaly | null {
    // Logique de détection géographique
    return null;
  }

  private static detectAccessPatternAnomaly(events: any[]): SecurityAnomaly | null {
    // Logique de détection de patterns d'accès
    return null;
  }
}`;
}

// Registry des extensions disponibles
export const availableExtensions: SecurityExtension[] = [
  cloudflareExtension,
  vercelExtension,
  awsExtension,
  advancedAuthExtension,
  behavioralAnalysisExtension,
];

/**
 * Génère les fichiers pour les extensions sélectionnées
 */
export function generateExtensions(
  config: SecurityConfig,
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
