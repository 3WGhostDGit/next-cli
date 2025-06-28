/**
 * Tests pour le générateur de formulaires
 * Valide la génération correcte des différents composants
 */

import { FormGenerator, createFormConfig, FORM_PRESETS } from './index';
import { ValidationGenerator } from './validation-generator';
import { ComponentGenerator } from './component-generator';
import { ActionsGenerator } from './actions-generator';
import { TypesGenerator } from './types-generator';
import { HooksGenerator } from './hooks-generator';
import type { FormField } from './index';

/**
 * Tests de base pour la génération
 */
export function runBasicTests() {
  console.log('🧪 Exécution des tests de base...');

  // Test 1: Génération d'un formulaire simple
  testSimpleFormGeneration();

  // Test 2: Validation des schémas Zod
  testZodSchemaGeneration();

  // Test 3: Génération des composants
  testComponentGeneration();

  // Test 4: Génération des Server Actions
  testServerActionsGeneration();

  // Test 5: Génération des types
  testTypesGeneration();

  // Test 6: Génération des hooks
  testHooksGeneration();

  console.log('✅ Tous les tests de base sont passés !');
}

/**
 * Test 1: Génération d'un formulaire simple
 */
function testSimpleFormGeneration() {
  console.log('  📝 Test: Génération formulaire simple');

  const fields: FormField[] = [
    {
      name: 'name',
      type: 'text',
      label: 'Nom',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      required: true,
    },
  ];

  const config = createFormConfig('Test', fields);
  const generator = new FormGenerator(config);
  const files = generator.generate();

  // Vérifications
  if (files.length === 0) {
    throw new Error('Aucun fichier généré');
  }

  const expectedFiles = [
    'shared/validation/test.ts',
    'shared/types/test.ts',
    'src/services/test/actions.ts',
    'src/components/forms/test-form.tsx',
    'src/components/forms/test-submit-button.tsx',
  ];

  expectedFiles.forEach(expectedPath => {
    const file = files.find(f => f.path === expectedPath);
    if (!file) {
      throw new Error(`Fichier manquant: ${expectedPath}`);
    }
    if (!file.content || file.content.trim() === '') {
      throw new Error(`Contenu vide pour: ${expectedPath}`);
    }
  });

  console.log('    ✅ Génération formulaire simple OK');
}

/**
 * Test 2: Validation des schémas Zod
 */
function testZodSchemaGeneration() {
  console.log('  🔍 Test: Génération schémas Zod');

  const fields: FormField[] = [
    {
      name: 'username',
      type: 'text',
      label: 'Nom d\'utilisateur',
      required: true,
      validation: {
        minLength: 3,
        maxLength: 20,
        pattern: '^[a-zA-Z0-9_]+$',
      },
    },
    {
      name: 'age',
      type: 'number',
      label: 'Âge',
      required: true,
      validation: {
        min: 18,
        max: 99,
      },
    },
    {
      name: 'newsletter',
      type: 'checkbox',
      label: 'Newsletter',
      required: false,
    },
  ];

  const config = createFormConfig('ValidationTest', fields);
  const generator = new ValidationGenerator(config);
  const file = generator.generate();

  // Vérifications du contenu
  const content = file.content;
  
  // Doit contenir les imports Zod
  if (!content.includes('import { z } from "zod"')) {
    throw new Error('Import Zod manquant');
  }

  // Doit contenir le schéma principal
  if (!content.includes('export const validationtestSchema = z.object({')) {
    throw new Error('Schéma principal manquant');
  }

  // Doit contenir les validations
  if (!content.includes('.min(3,') || !content.includes('.max(20,')) {
    throw new Error('Validations de longueur manquantes');
  }

  if (!content.includes('.min(18,') || !content.includes('.max(99,')) {
    throw new Error('Validations numériques manquantes');
  }

  // Doit contenir les types inférés
  if (!content.includes('export type ValidationTestFormData')) {
    throw new Error('Types inférés manquants');
  }

  console.log('    ✅ Génération schémas Zod OK');
}

/**
 * Test 3: Génération des composants
 */
function testComponentGeneration() {
  console.log('  🎨 Test: Génération composants');

  const fields: FormField[] = [
    {
      name: 'title',
      type: 'text',
      label: 'Titre',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      label: 'Catégorie',
      required: true,
      options: [
        { value: 'tech', label: 'Technologie' },
        { value: 'design', label: 'Design' },
      ],
    },
    {
      name: 'published',
      type: 'switch',
      label: 'Publié',
    },
  ];

  const config = createFormConfig('ComponentTest', fields);
  const generator = new ComponentGenerator(config);
  const file = generator.generate();

  const content = file.content;

  // Vérifications des imports
  if (!content.includes('"use client"')) {
    throw new Error('Directive "use client" manquante');
  }

  if (!content.includes('import { useActionState }')) {
    throw new Error('Import useActionState manquant');
  }

  if (!content.includes('import { useForm }')) {
    throw new Error('Import useForm manquant');
  }

  // Vérifications du composant
  if (!content.includes('export function ComponentTestForm(')) {
    throw new Error('Fonction composant manquante');
  }

  if (!content.includes('FormField')) {
    throw new Error('Composants FormField manquants');
  }

  // Vérifications des champs spécifiques
  if (!content.includes('Select') && fields.some(f => f.type === 'select')) {
    throw new Error('Composant Select manquant');
  }

  if (!content.includes('Switch') && fields.some(f => f.type === 'switch')) {
    throw new Error('Composant Switch manquant');
  }

  console.log('    ✅ Génération composants OK');
}

/**
 * Test 4: Génération des Server Actions
 */
function testServerActionsGeneration() {
  console.log('  ⚡ Test: Génération Server Actions');

  const config = createFormConfig('ActionTest', [
    { name: 'data', type: 'text', label: 'Data', required: true },
  ], {
    actions: [
      { name: 'create', type: 'create', redirect: '/test' },
      { name: 'update', type: 'update' },
    ],
  });

  const generator = new ActionsGenerator(config);
  const files = generator.generate();

  if (files.length === 0) {
    throw new Error('Aucune action générée');
  }

  const mainAction = files.find(f => f.path.includes('actions.ts'));
  if (!mainAction) {
    throw new Error('Action principale manquante');
  }

  const content = mainAction.content;

  // Vérifications
  if (!content.includes('"use server"')) {
    throw new Error('Directive "use server" manquante');
  }

  if (!content.includes('export async function actiontestAction(')) {
    throw new Error('Fonction d\'action manquante');
  }

  if (!content.includes('safeParse')) {
    throw new Error('Validation Zod manquante');
  }

  if (!content.includes('revalidatePath') || !content.includes('redirect')) {
    throw new Error('Imports Next.js manquants');
  }

  console.log('    ✅ Génération Server Actions OK');
}

/**
 * Test 5: Génération des types
 */
function testTypesGeneration() {
  console.log('  📋 Test: Génération types TypeScript');

  const fields: FormField[] = [
    {
      name: 'status',
      type: 'select',
      label: 'Statut',
      required: true,
      options: [
        { value: 'draft', label: 'Brouillon' },
        { value: 'published', label: 'Publié' },
      ],
    },
    {
      name: 'tags',
      type: 'multiselect',
      label: 'Tags',
      options: [
        { value: 'urgent', label: 'Urgent' },
        { value: 'important', label: 'Important' },
      ],
    },
  ];

  const config = createFormConfig('TypeTest', fields);
  const generator = new TypesGenerator(config);
  const file = generator.generate();

  const content = file.content;

  // Vérifications des interfaces
  if (!content.includes('export interface TypeTest {')) {
    throw new Error('Interface principale manquante');
  }

  // Vérifications des enums
  if (!content.includes('export enum TypeTestStatus')) {
    throw new Error('Enum pour select manquant');
  }

  // Vérifications des types utilitaires
  if (!content.includes('export type TypeTestKeys')) {
    throw new Error('Types utilitaires manquants');
  }

  if (!content.includes('export interface TypeTestFormProps')) {
    throw new Error('Types de props manquants');
  }

  console.log('    ✅ Génération types TypeScript OK');
}

/**
 * Test 6: Génération des hooks
 */
function testHooksGeneration() {
  console.log('  🪝 Test: Génération hooks personnalisés');

  const config = createFormConfig('HookTest', [
    { name: 'field', type: 'text', label: 'Field', required: true },
  ], {
    features: ['auto-save', 'optimistic-ui', 'toast-notifications'],
  });

  const generator = new HooksGenerator(config);
  const files = generator.generate();

  if (files.length === 0) {
    throw new Error('Aucun hook généré');
  }

  // Vérifier le hook principal
  const mainHook = files.find(f => f.path.includes('use-hooktest-form.ts'));
  if (!mainHook) {
    throw new Error('Hook principal manquant');
  }

  if (!mainHook.content.includes('export function useHookTestForm(')) {
    throw new Error('Fonction hook principale manquante');
  }

  // Vérifier les hooks de fonctionnalités
  const autoSaveHook = files.find(f => f.path.includes('auto-save.ts'));
  if (!autoSaveHook) {
    throw new Error('Hook auto-save manquant');
  }

  const optimisticHook = files.find(f => f.path.includes('optimistic.ts'));
  if (!optimisticHook) {
    throw new Error('Hook optimistic manquant');
  }

  console.log('    ✅ Génération hooks personnalisés OK');
}

/**
 * Tests d'intégration avec les presets
 */
export function runPresetTests() {
  console.log('🎯 Test des presets prédéfinis...');

  Object.entries(FORM_PRESETS).forEach(([name, config]) => {
    console.log(`  📋 Test preset: ${name}`);
    
    const generator = new FormGenerator(config);
    const files = generator.generate();

    if (files.length === 0) {
      throw new Error(`Preset ${name}: Aucun fichier généré`);
    }

    // Vérifier que tous les fichiers ont du contenu
    files.forEach(file => {
      if (!file.content || file.content.trim() === '') {
        throw new Error(`Preset ${name}: Contenu vide pour ${file.path}`);
      }
    });

    console.log(`    ✅ Preset ${name} OK`);
  });

  console.log('✅ Tous les presets sont valides !');
}

/**
 * Tests de performance
 */
export function runPerformanceTests() {
  console.log('⚡ Tests de performance...');

  const startTime = Date.now();

  // Générer un formulaire complexe
  const complexFields: FormField[] = Array.from({ length: 20 }, (_, i) => ({
    name: `field${i}`,
    type: i % 2 === 0 ? 'text' : 'select',
    label: `Field ${i}`,
    required: i % 3 === 0,
    options: i % 2 === 1 ? [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ] : undefined,
    validation: {
      minLength: 2,
      maxLength: 100,
    },
  }));

  const config = createFormConfig('PerformanceTest', complexFields, {
    features: ['auto-save', 'optimistic-ui', 'toast-notifications', 'file-upload'],
  });

  const generator = new FormGenerator(config);
  const files = generator.generate();

  const endTime = Date.now();
  const duration = endTime - startTime;

  console.log(`  ⏱️  Génération de ${complexFields.length} champs: ${duration}ms`);
  console.log(`  📁 Fichiers générés: ${files.length}`);

  if (duration > 5000) {
    console.warn('⚠️  Génération lente (>5s)');
  } else {
    console.log('✅ Performance acceptable');
  }
}

/**
 * Exécuter tous les tests
 */
export function runAllTests() {
  try {
    runBasicTests();
    runPresetTests();
    runPerformanceTests();
    
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    return true;
  } catch (error) {
    console.error('\n❌ Échec des tests:', error);
    return false;
  }
}

// Exécution automatique si le fichier est appelé directement
if (require.main === module) {
  runAllTests();
}
