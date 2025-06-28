/**
 * Tests pour le template de middleware de sécurité
 */

import { generateSecurityTemplate } from './generator';
import { securityPresets, SecurityConfig } from './index';
import { validateSecurityConfig } from './schemas';
import { testExamples } from './example';

/**
 * Test de génération basique
 */
export function testBasicGeneration() {
  console.log('🧪 Test: Génération basique du middleware de sécurité...');
  
  const config: SecurityConfig = {
    ...securityPresets.basic,
    projectName: 'test-security-app',
  };

  const result = generateSecurityTemplate(config);
  
  if (!result.success) {
    console.error('❌ Échec:', result.errors);
    return false;
  }

  console.log('✅ Middleware de sécurité généré avec succès');
  console.log(`📁 ${result.files.length} fichiers générés`);
  
  // Vérifier les fichiers essentiels
  const expectedFiles = [
    'middleware.ts',
    'src/lib/rate-limit.ts',
    'src/lib/security-logger.ts',
    'src/lib/injection-protection.ts',
    'src/config/security.ts',
  ];

  const generatedPaths = result.files.map(f => f.path);
  const missingFiles = expectedFiles.filter(path => !generatedPaths.includes(path));
  
  if (missingFiles.length > 0) {
    console.error('❌ Fichiers manquants:', missingFiles);
    return false;
  }

  console.log('✅ Tous les fichiers essentiels sont présents');
  return true;
}

/**
 * Test de génération enterprise
 */
export function testEnterpriseGeneration() {
  console.log('🧪 Test: Génération enterprise du middleware de sécurité...');
  
  const config: SecurityConfig = {
    ...securityPresets.enterprise,
    projectName: 'test-enterprise-app',
    logging: {
      ...securityPresets.enterprise.logging,
      externalServices: {
        sentry: {
          dsn: 'https://test@sentry.io/123',
          environment: 'test',
        },
      },
    },
  };

  const result = generateSecurityTemplate(config);
  
  if (!result.success) {
    console.error('❌ Échec:', result.errors);
    return false;
  }

  console.log('✅ Configuration enterprise générée avec succès');
  
  // Vérifier les fichiers spécifiques à enterprise
  const enterpriseFiles = [
    'src/lib/csrf.ts',
    'src/lib/geo-blocking.ts',
    'src/lib/bot-detection.ts',
  ];

  const generatedPaths = result.files.map(f => f.path);
  const presentFiles = enterpriseFiles.filter(path => generatedPaths.includes(path));
  
  console.log(`✅ ${presentFiles.length}/${enterpriseFiles.length} fichiers enterprise générés`);
  return true;
}

/**
 * Test de validation de configuration
 */
export function testConfigValidation() {
  console.log('🧪 Test: Validation de configuration...');
  
  // Test avec configuration valide
  const validConfig = {
    ...securityPresets.basic,
    projectName: 'test-app',
  };

  const validResult = validateSecurityConfig(validConfig);
  if (!validResult.success) {
    console.error('❌ Configuration valide rejetée:', validResult.errors);
    return false;
  }

  // Test avec configuration invalide
  const invalidConfig = {
    projectName: '', // Nom vide
    authentication: {
      enabled: true,
      provider: 'invalid-provider', // Provider invalide
    },
    rateLimit: {
      enabled: true,
      provider: 'redis',
      rules: {
        '/api/test': {
          requests: -5, // Nombre négatif
          window: 0, // Fenêtre nulle
        },
      },
    },
  };

  const invalidResult = validateSecurityConfig(invalidConfig);
  if (invalidResult.success) {
    console.error('❌ Configuration invalide acceptée');
    return false;
  }

  console.log('✅ Validation de configuration fonctionne correctement');
  console.log('📝 Erreurs détectées:', invalidResult.errors?.slice(0, 3));
  return true;
}

/**
 * Test de génération de contenu
 */
export function testContentGeneration() {
  console.log('🧪 Test: Validation du contenu généré...');
  
  const config: SecurityConfig = {
    ...securityPresets.standard,
    projectName: 'test-content-app',
  };

  const result = generateSecurityTemplate(config);
  
  if (!result.success) {
    console.error('❌ Échec de génération');
    return false;
  }

  // Vérifier le contenu du middleware
  const middlewareFile = result.files.find(f => f.path === 'middleware.ts');
  if (!middlewareFile) {
    console.error('❌ Fichier middleware manquant');
    return false;
  }

  const middlewareContent = middlewareFile.content;
  const requiredElements = [
    'export async function middleware',
    'NextRequest',
    'NextResponse',
    'rate limiting',
    'security headers',
  ];

  const missingElements = requiredElements.filter(element => 
    !middlewareContent.toLowerCase().includes(element.toLowerCase())
  );

  if (missingElements.length > 0) {
    console.error('❌ Éléments manquants dans le middleware:', missingElements);
    return false;
  }

  // Vérifier le contenu du rate limiter
  const rateLimitFile = result.files.find(f => f.path.includes('rate-limit.ts'));
  if (!rateLimitFile) {
    console.error('❌ Fichier rate-limit manquant');
    return false;
  }

  const rateLimitContent = rateLimitFile.content;
  const requiredRateLimitElements = [
    'class RateLimiter',
    'async check',
    'RateLimitResult',
    'createRateLimiter',
  ];

  const missingRateLimitElements = requiredRateLimitElements.filter(element => 
    !rateLimitContent.includes(element)
  );

  if (missingRateLimitElements.length > 0) {
    console.error('❌ Éléments manquants dans rate-limit:', missingRateLimitElements);
    return false;
  }

  console.log('✅ Contenu généré valide');
  return true;
}

/**
 * Test des presets
 */
export function testPresets() {
  console.log('🧪 Test: Validation des presets...');
  
  const presets = ['basic', 'standard', 'enterprise'] as const;
  let allValid = true;

  presets.forEach(presetName => {
    const preset = securityPresets[presetName];
    const config = {
      ...preset,
      projectName: `test-${presetName}-app`,
    };

    const result = generateSecurityTemplate(config);
    
    if (!result.success) {
      console.error(`❌ Preset ${presetName} invalide:`, result.errors);
      allValid = false;
    } else {
      console.log(`✅ Preset ${presetName}: ${result.files.length} fichiers`);
    }
  });

  return allValid;
}

/**
 * Test des fonctionnalités spécifiques
 */
export function testSpecificFeatures() {
  console.log('🧪 Test: Fonctionnalités spécifiques...');
  
  // Test avec toutes les fonctionnalités activées
  const fullConfig: SecurityConfig = {
    ...securityPresets.enterprise,
    projectName: 'test-full-features',
    authentication: {
      enabled: true,
      provider: 'better-auth',
      sessionStrategy: 'jwt',
      redirects: {
        login: '/login',
        logout: '/',
        unauthorized: '/unauthorized',
      },
    },
    rateLimit: {
      enabled: true,
      provider: 'redis',
      rules: {
        '/api/test': { requests: 10, window: 60 },
      },
      defaultRule: { requests: 100, window: 60 },
    },
    csrf: {
      enabled: true,
      tokenName: 'csrfToken',
      cookieName: '__csrf',
      headerName: 'x-csrf-token',
      excludePaths: ['/api/webhook'],
      sameSite: 'strict',
      secure: true,
    },
    advanced: {
      ipWhitelist: [],
      ipBlacklist: ['192.168.1.1'],
      geoBlocking: {
        enabled: true,
        allowedCountries: ['US', 'FR'],
        blockedCountries: [],
      },
      botProtection: {
        enabled: true,
        userAgentBlacklist: ['bot'],
        challengeUnknownBots: true,
      },
      injectionProtection: {
        enabled: true,
        sqlInjection: true,
        xssProtection: true,
        pathTraversal: true,
        commandInjection: true,
      },
    },
  };

  const result = generateSecurityTemplate(fullConfig);
  
  if (!result.success) {
    console.error('❌ Configuration complète échouée:', result.errors);
    return false;
  }

  // Vérifier que toutes les fonctionnalités génèrent du code
  const expectedFeatureFiles = [
    'src/lib/csrf.ts',
    'src/lib/geo-blocking.ts',
    'src/lib/bot-detection.ts',
    'src/lib/injection-protection.ts',
  ];

  const generatedPaths = result.files.map(f => f.path);
  const missingFeatures = expectedFeatureFiles.filter(path => !generatedPaths.includes(path));
  
  if (missingFeatures.length > 0) {
    console.error('❌ Fonctionnalités manquantes:', missingFeatures);
    return false;
  }

  console.log('✅ Toutes les fonctionnalités générées correctement');
  return true;
}

/**
 * Test de performance
 */
export function testPerformance() {
  console.log('🧪 Test: Performance de génération...');
  
  const startTime = Date.now();
  const iterations = 10;
  
  for (let i = 0; i < iterations; i++) {
    const config = {
      ...securityPresets.enterprise,
      projectName: `test-perf-${i}`,
    };
    
    const result = generateSecurityTemplate(config);
    if (!result.success) {
      console.error(`❌ Échec itération ${i}`);
      return false;
    }
  }
  
  const endTime = Date.now();
  const avgTime = (endTime - startTime) / iterations;
  
  console.log(`✅ Performance: ${avgTime.toFixed(2)}ms par génération`);
  
  // Vérifier que la génération est raisonnablement rapide (< 1 seconde)
  if (avgTime > 1000) {
    console.warn('⚠️ Génération lente (> 1s)');
    return false;
  }
  
  return true;
}

/**
 * Exécute tous les tests
 */
export function runAllSecurityTests() {
  console.log('🚀 Démarrage des tests de sécurité...\n');
  
  const tests = [
    { name: 'Génération basique', fn: testBasicGeneration },
    { name: 'Génération enterprise', fn: testEnterpriseGeneration },
    { name: 'Validation de configuration', fn: testConfigValidation },
    { name: 'Contenu généré', fn: testContentGeneration },
    { name: 'Presets', fn: testPresets },
    { name: 'Fonctionnalités spécifiques', fn: testSpecificFeatures },
    { name: 'Performance', fn: testPerformance },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    try {
      if (test.fn()) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ Erreur dans ${test.name}:`, error);
      failed++;
    }
    console.log(''); // Ligne vide entre les tests
  });

  console.log('📊 Résultats des tests de sécurité:');
  console.log(`✅ Réussis: ${passed}`);
  console.log(`❌ Échoués: ${failed}`);
  console.log(`📈 Taux de réussite: ${Math.round((passed / tests.length) * 100)}%`);

  return failed === 0;
}

// Exporter les fonctions de test individuelles
export const securityTests = {
  basic: testBasicGeneration,
  enterprise: testEnterpriseGeneration,
  validation: testConfigValidation,
  content: testContentGeneration,
  presets: testPresets,
  features: testSpecificFeatures,
  performance: testPerformance,
  all: runAllSecurityTests,
};
