/**
 * Tests pour les templates de formulaires
 */

import { generateFormTemplate } from './generator';
import { FormConfig, formPresets } from './index';

/**
 * Test de génération d'un formulaire simple
 */
export function testBasicFormGeneration() {
  console.log('🧪 Test: Génération formulaire simple...');
  
  const config: FormConfig = {
    ...formPresets.contact,
    projectName: 'test-project',
    generateTests: true,
    generateStorybook: true,
  };

  const result = generateFormTemplate(config);
  
  if (!result.success) {
    console.error('❌ Échec:', result.errors);
    return false;
  }

  console.log('✅ Formulaire simple généré avec succès');
  console.log(`📁 ${result.files.length} fichiers générés`);
  
  // Vérifier les fichiers essentiels
  const expectedFiles = [
    'shared/validation/contact.ts',
    'src/services/contact/submitForm.ts',
    'src/components/forms/contact-form.tsx',
    'src/hooks/use-contact-form.ts',
    'src/lib/contact-validation.ts',
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
 * Test de génération d'un formulaire multi-étapes
 */
export function testMultiStepFormGeneration() {
  console.log('🧪 Test: Génération formulaire multi-étapes...');
  
  const config: FormConfig = {
    ...formPresets.registration,
    projectName: 'test-project',
    generateTests: true,
    ui: {
      layout: 'vertical',
      submitButtonText: 'Terminer',
      loadingText: 'Traitement...',
      showProgress: true,
      theme: 'card',
    },
  };

  const result = generateFormTemplate(config);
  
  if (!result.success) {
    console.error('❌ Échec:', result.errors);
    return false;
  }

  console.log('✅ Formulaire multi-étapes généré avec succès');
  
  // Vérifier les fichiers spécifiques aux multi-étapes
  const multiStepFiles = [
    'src/services/registration/saveStep.ts',
    'src/services/registration/submitComplete.ts',
  ];

  const generatedPaths = result.files.map(f => f.path);
  const missingFiles = multiStepFiles.filter(path => !generatedPaths.includes(path));
  
  if (missingFiles.length > 0) {
    console.error('❌ Fichiers multi-étapes manquants:', missingFiles);
    return false;
  }

  console.log('✅ Fichiers multi-étapes générés correctement');
  return true;
}

/**
 * Test de génération avec fonctionnalités avancées
 */
export function testAdvancedFeaturesGeneration() {
  console.log('🧪 Test: Génération avec fonctionnalités avancées...');
  
  const config: FormConfig = {
    ...formPresets.profile,
    projectName: 'test-project',
    features: ['file-upload', 'auto-save', 'dynamic-fields'],
    generateTests: true,
    generateStorybook: true,
  };

  const result = generateFormTemplate(config);
  
  if (!result.success) {
    console.error('❌ Échec:', result.errors);
    return false;
  }

  console.log('✅ Formulaire avec fonctionnalités avancées généré');
  
  // Vérifier les fichiers des fonctionnalités avancées
  const advancedFiles = [
    'src/services/profile/autoSave.ts',
    'src/services/profile/uploadFiles.ts',
    'shared/validation/profile-upload.ts',
  ];

  const generatedPaths = result.files.map(f => f.path);
  const presentFiles = advancedFiles.filter(path => generatedPaths.includes(path));
  
  console.log(`✅ ${presentFiles.length}/${advancedFiles.length} fichiers avancés générés`);
  return true;
}

/**
 * Test de validation de configuration
 */
export function testConfigValidation() {
  console.log('🧪 Test: Validation de configuration...');
  
  // Test avec configuration invalide
  const invalidConfig: FormConfig = {
    formName: '', // Nom vide
    formType: 'basic',
    fields: [], // Pas de champs
    projectName: 'test',
    validation: {
      library: 'zod',
      realTimeValidation: true,
      customMessages: true,
    },
    actions: {
      submitAction: 'submit',
      showSuccessMessage: true,
      optimisticUpdates: false,
    },
    ui: {
      layout: 'vertical',
      submitButtonText: 'Submit',
      loadingText: 'Loading...',
      theme: 'default',
    },
    features: [],
  };

  const result = generateFormTemplate(invalidConfig);
  
  if (result.success) {
    console.error('❌ La validation aurait dû échouer');
    return false;
  }

  console.log('✅ Validation de configuration fonctionne correctement');
  console.log('📝 Erreurs détectées:', result.errors);
  return true;
}

/**
 * Test de génération de contenu
 */
export function testContentGeneration() {
  console.log('🧪 Test: Validation du contenu généré...');
  
  const config: FormConfig = {
    ...formPresets.contact,
    projectName: 'test-project',
  };

  const result = generateFormTemplate(config);
  
  if (!result.success) {
    console.error('❌ Échec de génération');
    return false;
  }

  // Vérifier le contenu du schéma Zod
  const schemaFile = result.files.find(f => f.path.includes('validation/contact.ts'));
  if (!schemaFile) {
    console.error('❌ Fichier de schéma manquant');
    return false;
  }

  const schemaContent = schemaFile.content;
  const requiredElements = [
    'import { z } from "zod"',
    'export const contactSchema',
    'z.string().email',
    'validationUtils',
  ];

  const missingElements = requiredElements.filter(element => 
    !schemaContent.includes(element)
  );

  if (missingElements.length > 0) {
    console.error('❌ Éléments manquants dans le schéma:', missingElements);
    return false;
  }

  // Vérifier le contenu du composant
  const componentFile = result.files.find(f => f.path.includes('components/forms/contact-form.tsx'));
  if (!componentFile) {
    console.error('❌ Fichier de composant manquant');
    return false;
  }

  const componentContent = componentFile.content;
  const requiredComponentElements = [
    'useActionState',
    'useForm',
    'zodResolver',
    'FormField',
    'Button',
  ];

  const missingComponentElements = requiredComponentElements.filter(element => 
    !componentContent.includes(element)
  );

  if (missingComponentElements.length > 0) {
    console.error('❌ Éléments manquants dans le composant:', missingComponentElements);
    return false;
  }

  console.log('✅ Contenu généré valide');
  return true;
}

/**
 * Exécute tous les tests
 */
export function runAllFormTests() {
  console.log('🚀 Démarrage des tests de formulaires...\n');
  
  const tests = [
    { name: 'Formulaire simple', fn: testBasicFormGeneration },
    { name: 'Formulaire multi-étapes', fn: testMultiStepFormGeneration },
    { name: 'Fonctionnalités avancées', fn: testAdvancedFeaturesGeneration },
    { name: 'Validation de configuration', fn: testConfigValidation },
    { name: 'Contenu généré', fn: testContentGeneration },
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

  console.log('📊 Résultats des tests:');
  console.log(`✅ Réussis: ${passed}`);
  console.log(`❌ Échoués: ${failed}`);
  console.log(`📈 Taux de réussite: ${Math.round((passed / tests.length) * 100)}%`);

  return failed === 0;
}

// Exporter les fonctions de test individuelles
export const formTests = {
  basic: testBasicFormGeneration,
  multiStep: testMultiStepFormGeneration,
  advanced: testAdvancedFeaturesGeneration,
  validation: testConfigValidation,
  content: testContentGeneration,
  all: runAllFormTests,
};
