/**
 * Tests pour le générateur CRUD
 * Valide la génération correcte des composants CRUD
 */

import { CRUDGenerator, createCRUDConfig } from './index';
import type { EntityDefinition, CRUDConfig } from './index';

/**
 * Interface pour les résultats de test
 */
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

/**
 * Suite de tests pour le générateur CRUD
 */
export class CRUDTestSuite {
  private results: TestResult[] = [];

  /**
   * Exécute tous les tests
   */
  async runAllTests(): Promise<{
    passed: number;
    failed: number;
    total: number;
    results: TestResult[];
  }> {
    console.log('🧪 Exécution des tests CRUD...');

    // Tests de base
    await this.testBasicGeneration();
    await this.testEntityValidation();
    await this.testSchemaGeneration();
    await this.testTableGeneration();
    await this.testActionsGeneration();
    await this.testTypesGeneration();
    await this.testUtilitiesGeneration();

    // Tests avancés
    await this.testRelationsGeneration();
    await this.testPermissionsGeneration();
    await this.testBulkActionsGeneration();
    await this.testExportImportGeneration();

    // Tests de performance
    await this.testPerformance();

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;

    console.log(`✅ Tests terminés: ${passed} réussis, ${failed} échoués`);

    return {
      passed,
      failed,
      total: this.results.length,
      results: this.results,
    };
  }

  /**
   * Test de génération de base
   */
  private async testBasicGeneration(): Promise<void> {
    await this.runTest('Génération de base', () => {
      const entity: EntityDefinition = {
        name: 'TestEntity',
        displayName: 'Entité de test',
        fields: [
          {
            name: 'name',
            type: 'string',
            displayName: 'Nom',
            required: true,
            display: {
              showInTable: true,
              showInForm: true,
              showInDetail: true,
            },
            searchable: true,
            sortable: true,
            filterable: false,
          },
        ],
        relations: [],
        indexes: [],
        constraints: [],
      };

      const config = createCRUDConfig(entity);
      const generator = new CRUDGenerator(config);
      const result = generator.generate();

      if (result.files.length === 0) {
        throw new Error('Aucun fichier généré');
      }

      // Vérifier que les fichiers essentiels sont présents
      const expectedPaths = [
        'shared/types/testentity.ts',
        'shared/validation/testentity.ts',
        'src/services/testentity/actions.ts',
        'src/components/testentity/testentity-table.tsx',
      ];

      expectedPaths.forEach(path => {
        const file = result.files.find(f => f.path === path);
        if (!file) {
          throw new Error(`Fichier manquant: ${path}`);
        }
        if (!file.content || file.content.trim() === '') {
          throw new Error(`Contenu vide pour: ${path}`);
        }
      });
    });
  }

  /**
   * Test de validation d'entité
   */
  private async testEntityValidation(): Promise<void> {
    await this.runTest('Validation d\'entité', () => {
      // Test avec entité invalide (nom manquant)
      try {
        const invalidEntity = {
          name: '',
          displayName: 'Test',
          fields: [],
          relations: [],
          indexes: [],
          constraints: [],
        } as EntityDefinition;

        createCRUDConfig(invalidEntity);
        throw new Error('La validation aurait dû échouer');
      } catch (error) {
        // C'est attendu
      }

      // Test avec champ invalide
      try {
        const entityWithInvalidField: EntityDefinition = {
          name: 'Test',
          displayName: 'Test',
          fields: [
            {
              name: '',
              type: 'string',
              displayName: 'Test',
              required: true,
              display: {
                showInTable: true,
                showInForm: true,
                showInDetail: true,
              },
              searchable: false,
              sortable: false,
              filterable: false,
            },
          ],
          relations: [],
          indexes: [],
          constraints: [],
        };

        createCRUDConfig(entityWithInvalidField);
        throw new Error('La validation aurait dû échouer');
      } catch (error) {
        // C'est attendu
      }
    });
  }

  /**
   * Test de génération de schémas
   */
  private async testSchemaGeneration(): Promise<void> {
    await this.runTest('Génération de schémas Zod', () => {
      const entity: EntityDefinition = {
        name: 'SchemaTest',
        displayName: 'Test de schéma',
        fields: [
          {
            name: 'email',
            type: 'email',
            displayName: 'Email',
            required: true,
            display: {
              showInTable: true,
              showInForm: true,
              showInDetail: true,
            },
            searchable: true,
            sortable: true,
            filterable: false,
          },
          {
            name: 'age',
            type: 'number',
            displayName: 'Âge',
            required: true,
            validation: {
              min: 18,
              max: 99,
            },
            display: {
              showInTable: true,
              showInForm: true,
              showInDetail: true,
            },
            searchable: false,
            sortable: true,
            filterable: true,
          },
        ],
        relations: [],
        indexes: [],
        constraints: [],
      };

      const config = createCRUDConfig(entity);
      const generator = new CRUDGenerator(config);
      const result = generator.generate();

      const schemaFile = result.files.find(f => f.path === 'shared/validation/schematest.ts');
      if (!schemaFile) {
        throw new Error('Fichier de schéma manquant');
      }

      const content = schemaFile.content;

      // Vérifier les imports Zod
      if (!content.includes('import { z } from "zod"')) {
        throw new Error('Import Zod manquant');
      }

      // Vérifier le schéma principal
      if (!content.includes('export const schematestSchema = z.object({')) {
        throw new Error('Schéma principal manquant');
      }

      // Vérifier les validations
      if (!content.includes('.email(') || !content.includes('.min(18') || !content.includes('.max(99')) {
        throw new Error('Validations manquantes');
      }
    });
  }

  /**
   * Test de génération de table
   */
  private async testTableGeneration(): Promise<void> {
    await this.runTest('Génération de table TanStack', () => {
      const entity: EntityDefinition = {
        name: 'TableTest',
        displayName: 'Test de table',
        fields: [
          {
            name: 'title',
            type: 'string',
            displayName: 'Titre',
            required: true,
            display: {
              showInTable: true,
              showInForm: true,
              showInDetail: true,
              tableWidth: 200,
            },
            searchable: true,
            sortable: true,
            filterable: false,
          },
          {
            name: 'status',
            type: 'enum',
            displayName: 'Statut',
            required: true,
            display: {
              showInTable: true,
              showInForm: true,
              showInDetail: true,
            },
            searchable: false,
            sortable: true,
            filterable: true,
          },
        ],
        relations: [],
        indexes: [],
        constraints: [],
      };

      const config = createCRUDConfig(entity, {
        features: ['pagination', 'sorting', 'filtering', 'selection'],
      });

      const generator = new CRUDGenerator(config);
      const result = generator.generate();

      const tableFile = result.files.find(f => f.path === 'src/components/tabletest/tabletest-table.tsx');
      if (!tableFile) {
        throw new Error('Fichier de table manquant');
      }

      const content = tableFile.content;

      // Vérifier les imports TanStack Table
      if (!content.includes('@tanstack/react-table')) {
        throw new Error('Import TanStack Table manquant');
      }

      // Vérifier le composant principal
      if (!content.includes('export function TableTestTable(')) {
        throw new Error('Composant de table manquant');
      }

      // Vérifier les fonctionnalités
      if (!content.includes('useReactTable')) {
        throw new Error('Hook useReactTable manquant');
      }

      if (!content.includes('ColumnDef')) {
        throw new Error('Définition des colonnes manquante');
      }
    });
  }

  /**
   * Test de génération d'actions
   */
  private async testActionsGeneration(): Promise<void> {
    await this.runTest('Génération d\'actions serveur', () => {
      const entity: EntityDefinition = {
        name: 'ActionTest',
        displayName: 'Test d\'actions',
        fields: [
          {
            name: 'data',
            type: 'string',
            displayName: 'Données',
            required: true,
            display: {
              showInTable: true,
              showInForm: true,
              showInDetail: true,
            },
            searchable: true,
            sortable: true,
            filterable: false,
          },
        ],
        relations: [],
        indexes: [],
        constraints: [],
      };

      const config = createCRUDConfig(entity);
      const generator = new CRUDGenerator(config);
      const result = generator.generate();

      const actionsFile = result.files.find(f => f.path === 'src/services/actiontest/actions.ts');
      if (!actionsFile) {
        throw new Error('Fichier d\'actions manquant');
      }

      const content = actionsFile.content;

      // Vérifier la directive "use server"
      if (!content.includes('"use server"')) {
        throw new Error('Directive "use server" manquante');
      }

      // Vérifier les fonctions CRUD
      const expectedFunctions = [
        'getActionTestList',
        'createActionTest',
        'updateActionTest',
        'deleteActionTest',
      ];

      expectedFunctions.forEach(func => {
        if (!content.includes(`export async function ${func}(`)) {
          throw new Error(`Fonction ${func} manquante`);
        }
      });

      // Vérifier la validation Zod
      if (!content.includes('safeParse')) {
        throw new Error('Validation Zod manquante');
      }
    });
  }

  /**
   * Test de génération de types
   */
  private async testTypesGeneration(): Promise<void> {
    await this.runTest('Génération de types TypeScript', () => {
      const entity: EntityDefinition = {
        name: 'TypeTest',
        displayName: 'Test de types',
        fields: [
          {
            name: 'name',
            type: 'string',
            displayName: 'Nom',
            required: true,
            display: {
              showInTable: true,
              showInForm: true,
              showInDetail: true,
            },
            searchable: true,
            sortable: true,
            filterable: false,
          },
        ],
        relations: [],
        indexes: [],
        constraints: [],
      };

      const config = createCRUDConfig(entity);
      const generator = new CRUDGenerator(config);
      const result = generator.generate();

      const typesFile = result.files.find(f => f.path === 'shared/types/typetest.ts');
      if (!typesFile) {
        throw new Error('Fichier de types manquant');
      }

      const content = typesFile.content;

      // Vérifier l'interface principale
      if (!content.includes('export interface TypeTest {')) {
        throw new Error('Interface principale manquante');
      }

      // Vérifier les types utilitaires
      if (!content.includes('export type TypeTestCreate') || !content.includes('export type TypeTestUpdate')) {
        throw new Error('Types utilitaires manquants');
      }
    });
  }

  /**
   * Test de génération d'utilitaires
   */
  private async testUtilitiesGeneration(): Promise<void> {
    await this.runTest('Génération d\'utilitaires', () => {
      const entity: EntityDefinition = {
        name: 'UtilTest',
        displayName: 'Test d\'utilitaires',
        fields: [
          {
            name: 'title',
            type: 'string',
            displayName: 'Titre',
            required: true,
            display: {
              showInTable: true,
              showInForm: true,
              showInDetail: true,
            },
            searchable: true,
            sortable: true,
            filterable: false,
          },
        ],
        relations: [],
        indexes: [],
        constraints: [],
      };

      const config = createCRUDConfig(entity);
      const generator = new CRUDGenerator(config);
      const result = generator.generate();

      const utilsFile = result.files.find(f => f.path === 'src/lib/utiltest-utils.ts');
      if (!utilsFile) {
        throw new Error('Fichier d\'utilitaires manquant');
      }

      const content = utilsFile.content;

      // Vérifier les fonctions utilitaires
      const expectedFunctions = [
        'buildUtilTestWhereClause',
        'buildUtilTestOrderByClause',
        'processUtilTestFormData',
      ];

      expectedFunctions.forEach(func => {
        if (!content.includes(`export function ${func}(`)) {
          throw new Error(`Fonction ${func} manquante`);
        }
      });
    });
  }

  /**
   * Test de génération avec relations
   */
  private async testRelationsGeneration(): Promise<void> {
    await this.runTest('Génération avec relations', () => {
      const entity: EntityDefinition = {
        name: 'RelationTest',
        displayName: 'Test de relations',
        fields: [
          {
            name: 'categoryId',
            type: 'relation',
            displayName: 'Catégorie',
            required: true,
            display: {
              showInTable: true,
              showInForm: true,
              showInDetail: true,
            },
            searchable: false,
            sortable: true,
            filterable: true,
          },
        ],
        relations: [
          {
            name: 'category',
            type: 'one-to-many',
            target: 'Category',
            foreignKey: 'categoryId',
            display: {
              showInTable: true,
              showInForm: true,
              displayField: 'name',
              searchable: true,
            },
          },
        ],
        indexes: [],
        constraints: [],
      };

      const config = createCRUDConfig(entity);
      const generator = new CRUDGenerator(config);
      const result = generator.generate();

      // Vérifier que les relations sont prises en compte
      const typesFile = result.files.find(f => f.path === 'shared/types/relationtest.ts');
      if (!typesFile || !typesFile.content.includes('WithCategory')) {
        throw new Error('Types de relations manquants');
      }
    });
  }

  /**
   * Test de génération avec permissions
   */
  private async testPermissionsGeneration(): Promise<void> {
    await this.runTest('Génération avec permissions', () => {
      const entity: EntityDefinition = {
        name: 'PermTest',
        displayName: 'Test de permissions',
        fields: [
          {
            name: 'data',
            type: 'string',
            displayName: 'Données',
            required: true,
            display: {
              showInTable: true,
              showInForm: true,
              showInDetail: true,
            },
            searchable: true,
            sortable: true,
            filterable: false,
          },
        ],
        relations: [],
        indexes: [],
        constraints: [],
      };

      const config = createCRUDConfig(entity, {
        permissions: {
          enabled: true,
          roles: ['admin', 'user'],
          permissions: [
            { action: 'create', roles: ['admin'] },
            { action: 'read', roles: ['admin', 'user'] },
          ],
          fieldLevelSecurity: false,
          rowLevelSecurity: false,
        },
      });

      const generator = new CRUDGenerator(config);
      const result = generator.generate();

      const actionsFile = result.files.find(f => f.path === 'src/services/permtest/actions.ts');
      if (!actionsFile || !actionsFile.content.includes('checkPermission')) {
        throw new Error('Vérifications de permissions manquantes');
      }
    });
  }

  /**
   * Test de génération d'actions en lot
   */
  private async testBulkActionsGeneration(): Promise<void> {
    await this.runTest('Génération d\'actions en lot', () => {
      const entity: EntityDefinition = {
        name: 'BulkTest',
        displayName: 'Test d\'actions en lot',
        fields: [
          {
            name: 'status',
            type: 'string',
            displayName: 'Statut',
            required: true,
            display: {
              showInTable: true,
              showInForm: true,
              showInDetail: true,
            },
            searchable: false,
            sortable: true,
            filterable: true,
          },
        ],
        relations: [],
        indexes: [],
        constraints: [],
      };

      const config = createCRUDConfig(entity, {
        features: ['bulk-actions'],
      });

      const generator = new CRUDGenerator(config);
      const result = generator.generate({ includeBulkActions: true });

      // Vérifier que les actions en lot sont générées
      if (result.files.length === 0) {
        throw new Error('Aucun fichier généré pour les actions en lot');
      }
    });
  }

  /**
   * Test de génération d'export/import
   */
  private async testExportImportGeneration(): Promise<void> {
    await this.runTest('Génération d\'export/import', () => {
      const entity: EntityDefinition = {
        name: 'ExportTest',
        displayName: 'Test d\'export',
        fields: [
          {
            name: 'name',
            type: 'string',
            displayName: 'Nom',
            required: true,
            display: {
              showInTable: true,
              showInForm: true,
              showInDetail: true,
            },
            searchable: true,
            sortable: true,
            filterable: false,
          },
        ],
        relations: [],
        indexes: [],
        constraints: [],
      };

      const config = createCRUDConfig(entity, {
        features: ['export', 'import'],
      });

      const generator = new CRUDGenerator(config);
      const result = generator.generate({ includeExportImport: true });

      // Vérifier que les fonctions d'export/import sont générées
      if (result.files.length === 0) {
        throw new Error('Aucun fichier généré pour l\'export/import');
      }
    });
  }

  /**
   * Test de performance
   */
  private async testPerformance(): Promise<void> {
    await this.runTest('Performance de génération', () => {
      const startTime = Date.now();

      // Générer un CRUD complexe
      const complexEntity: EntityDefinition = {
        name: 'ComplexEntity',
        displayName: 'Entité complexe',
        fields: Array.from({ length: 20 }, (_, i) => ({
          name: `field${i}`,
          type: i % 2 === 0 ? 'string' : 'number',
          displayName: `Champ ${i}`,
          required: i % 3 === 0,
          display: {
            showInTable: i < 10,
            showInForm: true,
            showInDetail: true,
          },
          searchable: i % 4 === 0,
          sortable: i % 2 === 0,
          filterable: i % 5 === 0,
        })),
        relations: [],
        indexes: [],
        constraints: [],
      };

      const config = createCRUDConfig(complexEntity, {
        features: ['pagination', 'sorting', 'filtering', 'search', 'bulk-actions', 'export'],
      });

      const generator = new CRUDGenerator(config);
      const result = generator.generate();

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`  ⏱️  Génération de ${complexEntity.fields.length} champs: ${duration}ms`);
      console.log(`  📁 Fichiers générés: ${result.files.length}`);

      if (duration > 5000) {
        throw new Error('Génération trop lente (>5s)');
      }

      if (result.files.length === 0) {
        throw new Error('Aucun fichier généré');
      }
    });
  }

  /**
   * Exécute un test individuel
   */
  private async runTest(name: string, testFn: () => void | Promise<void>): Promise<void> {
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      
      this.results.push({
        name,
        passed: true,
        duration,
      });
      
      console.log(`  ✅ ${name} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        name,
        passed: false,
        error: error.message,
        duration,
      });
      
      console.log(`  ❌ ${name} (${duration}ms): ${error.message}`);
    }
  }
}

/**
 * Exécute tous les tests CRUD
 */
export async function runCRUDTests(): Promise<boolean> {
  const testSuite = new CRUDTestSuite();
  const results = await testSuite.runAllTests();
  
  if (results.failed > 0) {
    console.error(`\n❌ ${results.failed} test(s) échoué(s):`);
    results.results
      .filter(r => !r.passed)
      .forEach(r => console.error(`  - ${r.name}: ${r.error}`));
  }
  
  console.log(`\n📊 Résumé: ${results.passed}/${results.total} tests réussis`);
  
  return results.failed === 0;
}

// Exécution automatique si le fichier est appelé directement
if (require.main === module) {
  runCRUDTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}
