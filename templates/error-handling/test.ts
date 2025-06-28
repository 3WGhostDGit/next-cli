/**
 * Tests pour le template de gestion d'erreurs
 */

import { generateErrorHandlingTemplate } from './generator';
import { errorHandlingPresets, ErrorHandlingConfig } from './index';
import { validateErrorHandlingConfig } from './schemas';
import { testExamples } from './example';

/**
 * Test de génération basique
 */
export function testBasicGeneration() {
  console.log('🧪 Test: Génération basique de la gestion d\'erreurs...');
  
  const config: ErrorHandlingConfig = {
    ...errorHandlingPresets.basic,
    projectName: 'test-error-app',
  };

  const result = generateErrorHandlingTemplate(config);
  
  if (!result.success) {
    console.error('❌ Échec:', result.errors);
    return false;
  }

  console.log('✅ Gestion d\'erreurs générée avec succès');
  console.log(`📁 ${result.files.length} fichiers générés`);
  
  // Vérifier les fichiers essentiels
  const expectedFiles = [
    'src/components/error-boundary/global-error-boundary.tsx',
    'src/app/not-found.tsx',
    'src/app/error.tsx',
    'src/lib/error-logger.ts',
    'src/hooks/use-error-handler.ts',
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
  console.log('🧪 Test: Génération enterprise de la gestion d\'erreurs...');
  
  const config: ErrorHandlingConfig = {
    ...errorHandlingPresets.enterprise,
    projectName: 'test-enterprise-error-app',
    monitoring: {
      ...errorHandlingPresets.enterprise.monitoring,
      sentry: {
        dsn: 'https://test@sentry.io/123',
        environment: 'test',
        tracesSampleRate: 0.1,
        profilesSampleRate: 0.1,
      },
    },
  };

  const result = generateErrorHandlingTemplate(config);
  
  if (!result.success) {
    console.error('❌ Échec:', result.errors);
    return false;
  }

  console.log('✅ Configuration enterprise générée avec succès');
  
  // Vérifier les fichiers spécifiques à enterprise
  const enterpriseFiles = [
    'src/lib/error-reporter.ts',
    'src/lib/error-recovery.ts',
    'src/components/error-boundary/component-error-boundary.tsx',
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
    ...errorHandlingPresets.basic,
    projectName: 'test-app',
  };

  const validResult = validateErrorHandlingConfig(validConfig);
  if (!validResult.success) {
    console.error('❌ Configuration valide rejetée:', validResult.errors);
    return false;
  }

  // Test avec configuration invalide
  const invalidConfig = {
    projectName: '', // Nom vide
    errorBoundaries: {
      enabled: true,
      maxRetries: -1, // Nombre négatif
    },
    logging: {
      enabled: true,
      level: 'invalid-level', // Niveau invalide
      destinations: ['invalid-destination'], // Destination invalide
    },
    monitoring: {
      enabled: true,
      services: ['invalid-service'], // Service invalide
    },
  };

  const invalidResult = validateErrorHandlingConfig(invalidConfig);
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
  
  const config: ErrorHandlingConfig = {
    ...errorHandlingPresets.standard,
    projectName: 'test-content-app',
  };

  const result = generateErrorHandlingTemplate(config);
  
  if (!result.success) {
    console.error('❌ Échec de génération');
    return false;
  }

  // Vérifier le contenu de l'Error Boundary global
  const globalBoundaryFile = result.files.find(f => 
    f.path.includes('global-error-boundary.tsx')
  );
  if (!globalBoundaryFile) {
    console.error('❌ Fichier global error boundary manquant');
    return false;
  }

  const boundaryContent = globalBoundaryFile.content;
  const requiredElements = [
    'class GlobalErrorBoundary',
    'componentDidCatch',
    'getDerivedStateFromError',
    'ErrorBoundaryState',
    'handleReset',
  ];

  const missingElements = requiredElements.filter(element => 
    !boundaryContent.includes(element)
  );

  if (missingElements.length > 0) {
    console.error('❌ Éléments manquants dans l\'Error Boundary:', missingElements);
    return false;
  }

  // Vérifier le contenu du logger
  const loggerFile = result.files.find(f => f.path.includes('error-logger.ts'));
  if (!loggerFile) {
    console.error('❌ Fichier error-logger manquant');
    return false;
  }

  const loggerContent = loggerFile.content;
  const requiredLoggerElements = [
    'class ErrorLogger',
    'getInstance',
    'error',
    'warn',
    'info',
  ];

  const missingLoggerElements = requiredLoggerElements.filter(element => 
    !loggerContent.includes(element)
  );

  if (missingLoggerElements.length > 0) {
    console.error('❌ Éléments manquants dans le logger:', missingLoggerElements);
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
    const preset = errorHandlingPresets[presetName];
    const config = {
      ...preset,
      projectName: `test-${presetName}-app`,
    };

    const result = generateErrorHandlingTemplate(config);
    
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
  const fullConfig: ErrorHandlingConfig = {
    ...errorHandlingPresets.enterprise,
    projectName: 'test-full-features',
    errorBoundaries: {
      enabled: true,
      globalBoundary: true,
      routeBoundaries: true,
      componentBoundaries: true,
      fallbackComponent: 'custom',
      reportErrors: true,
      retryMechanism: true,
      maxRetries: 5,
    },
    monitoring: {
      enabled: true,
      services: ['sentry', 'datadog'],
      sentry: {
        dsn: 'https://test@sentry.io/123',
        environment: 'test',
        tracesSampleRate: 0.1,
        profilesSampleRate: 0.1,
      },
      datadog: {
        clientToken: 'test-token',
        applicationId: 'test-app-id',
        site: 'datadoghq.com',
      },
    },
    notifications: {
      enabled: true,
      channels: ['email', 'slack'],
      severity: ['high', 'critical'],
      throttling: {
        enabled: true,
        maxPerHour: 10,
        maxPerDay: 50,
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
        groupBy: ['message', 'stack', 'component'],
        timeWindow: 30,
      },
      trends: {
        enabled: true,
        timeRanges: ['1h', '24h', '7d'],
        metrics: ['count', 'rate'],
      },
    },
  };

  const result = generateErrorHandlingTemplate(fullConfig);
  
  if (!result.success) {
    console.error('❌ Configuration complète échouée:', result.errors);
    return false;
  }

  // Vérifier que toutes les fonctionnalités génèrent du code
  const expectedFeatureFiles = [
    'src/components/error-boundary/global-error-boundary.tsx',
    'src/components/error-boundary/route-error-boundary.tsx',
    'src/components/error-boundary/component-error-boundary.tsx',
    'src/lib/error-reporter.ts',
    'src/lib/error-recovery.ts',
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
      ...errorHandlingPresets.enterprise,
      projectName: `test-perf-${i}`,
    };
    
    const result = generateErrorHandlingTemplate(config);
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
 * Test des Error Boundaries
 */
export function testErrorBoundaries() {
  console.log('🧪 Test: Error Boundaries...');
  
  const config: ErrorHandlingConfig = {
    ...errorHandlingPresets.standard,
    projectName: 'test-boundaries',
    errorBoundaries: {
      enabled: true,
      globalBoundary: true,
      routeBoundaries: true,
      componentBoundaries: true,
      fallbackComponent: 'custom',
      reportErrors: true,
      retryMechanism: true,
      maxRetries: 3,
    },
  };

  const result = generateErrorHandlingTemplate(config);
  
  if (!result.success) {
    console.error('❌ Échec génération Error Boundaries');
    return false;
  }

  // Vérifier que tous les types d'Error Boundaries sont générés
  const boundaryFiles = [
    'global-error-boundary.tsx',
    'route-error-boundary.tsx',
    'component-error-boundary.tsx',
  ];

  const generatedPaths = result.files.map(f => f.path);
  const missingBoundaries = boundaryFiles.filter(file => 
    !generatedPaths.some(path => path.includes(file))
  );

  if (missingBoundaries.length > 0) {
    console.error('❌ Error Boundaries manquants:', missingBoundaries);
    return false;
  }

  console.log('✅ Tous les Error Boundaries générés');
  return true;
}

/**
 * Exécute tous les tests
 */
export function runAllErrorHandlingTests() {
  console.log('🚀 Démarrage des tests de gestion d\'erreurs...\n');
  
  const tests = [
    { name: 'Génération basique', fn: testBasicGeneration },
    { name: 'Génération enterprise', fn: testEnterpriseGeneration },
    { name: 'Validation de configuration', fn: testConfigValidation },
    { name: 'Contenu généré', fn: testContentGeneration },
    { name: 'Presets', fn: testPresets },
    { name: 'Fonctionnalités spécifiques', fn: testSpecificFeatures },
    { name: 'Performance', fn: testPerformance },
    { name: 'Error Boundaries', fn: testErrorBoundaries },
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

  console.log('📊 Résultats des tests de gestion d\'erreurs:');
  console.log(`✅ Réussis: ${passed}`);
  console.log(`❌ Échoués: ${failed}`);
  console.log(`📈 Taux de réussite: ${Math.round((passed / tests.length) * 100)}%`);

  return failed === 0;
}

// Exporter les fonctions de test individuelles
export const errorHandlingTests = {
  basic: testBasicGeneration,
  enterprise: testEnterpriseGeneration,
  validation: testConfigValidation,
  content: testContentGeneration,
  presets: testPresets,
  features: testSpecificFeatures,
  performance: testPerformance,
  boundaries: testErrorBoundaries,
  all: runAllErrorHandlingTests,
};
