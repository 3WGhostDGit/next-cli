/**
 * Tests pour le générateur Navigation
 * Valide la génération correcte des composants de navigation
 */

import { NavigationGenerator, createNavigationConfig, NAVIGATION_PRESETS } from './index';
import type { NavigationConfig, NavigationStructure } from './index';

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
 * Suite de tests pour le générateur Navigation
 */
export class NavigationTestSuite {
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
    console.log('🧪 Exécution des tests Navigation...');

    // Tests de base
    await this.testBasicGeneration();
    await this.testConfigValidation();
    await this.testLayoutGeneration();
    await this.testComponentGeneration();
    await this.testMiddlewareGeneration();
    await this.testTypesGeneration();
    await this.testUtilitiesGeneration();

    // Tests avancés
    await this.testPermissionsGeneration();
    await this.testBreadcrumbsGeneration();
    await this.testCommandPaletteGeneration();
    await this.testResponsiveGeneration();

    // Tests de presets
    await this.testPresets();

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
      const navigation: NavigationStructure = {
        items: [],
        groups: [
          {
            id: 'main',
            label: 'Principal',
            items: [
              {
                id: 'home',
                label: 'Accueil',
                href: '/',
                icon: 'Home',
                searchable: false,
                sortable: false,
                filterable: false,
              },
            ],
          },
        ],
      };

      const config = createNavigationConfig('Test App', navigation);
      const generator = new NavigationGenerator(config);
      const result = generator.generate();

      if (result.files.length === 0) {
        throw new Error('Aucun fichier généré');
      }

      // Vérifier que les fichiers essentiels sont présents
      const expectedPaths = [
        'shared/types/navigation.ts',
        'shared/validation/navigation.ts',
        'app/layout.tsx',
        'src/components/navigation/header.tsx',
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
   * Test de validation de configuration
   */
  private async testConfigValidation(): Promise<void> {
    await this.runTest('Validation de configuration', () => {
      // Test avec configuration invalide (nom manquant)
      try {
        const invalidNavigation = {
          items: [],
          groups: [],
        } as NavigationStructure;

        createNavigationConfig('', invalidNavigation);
        throw new Error('La validation aurait dû échouer');
      } catch (error) {
        // C'est attendu
      }

      // Test avec groupe invalide
      try {
        const invalidNavigation: NavigationStructure = {
          items: [],
          groups: [
            {
              id: '',
              label: 'Test',
              items: [],
            },
          ],
        };

        createNavigationConfig('Test', invalidNavigation);
        throw new Error('La validation aurait dû échouer');
      } catch (error) {
        // C'est attendu
      }
    });
  }

  /**
   * Test de génération de layouts
   */
  private async testLayoutGeneration(): Promise<void> {
    await this.runTest('Génération de layouts', () => {
      const navigation: NavigationStructure = {
        items: [],
        groups: [
          {
            id: 'main',
            label: 'Principal',
            items: [
              {
                id: 'dashboard',
                label: 'Tableau de bord',
                href: '/dashboard',
                icon: 'LayoutDashboard',
                searchable: false,
                sortable: false,
                filterable: false,
              },
            ],
          },
        ],
      };

      // Test layout sidebar
      const sidebarConfig = createNavigationConfig('Sidebar App', navigation, {
        layout: { type: 'sidebar', responsive: true, stickyHeader: true, stickyFooter: false, padding: 'md' },
      });

      const sidebarGenerator = new NavigationGenerator(sidebarConfig);
      const sidebarResult = sidebarGenerator.generate();

      const sidebarLayout = sidebarResult.files.find(f => f.path.includes('(dashboard)/layout.tsx'));
      if (!sidebarLayout) {
        throw new Error('Layout sidebar manquant');
      }

      if (!sidebarLayout.content.includes('SidebarProvider')) {
        throw new Error('Composant SidebarProvider manquant');
      }

      // Test layout header
      const headerConfig = createNavigationConfig('Header App', navigation, {
        layout: { type: 'header', responsive: true, stickyHeader: true, stickyFooter: false, padding: 'md' },
      });

      const headerGenerator = new NavigationGenerator(headerConfig);
      const headerResult = headerGenerator.generate();

      const headerLayout = headerResult.files.find(f => f.path.includes('(main)/layout.tsx'));
      if (!headerLayout) {
        throw new Error('Layout header manquant');
      }
    });
  }

  /**
   * Test de génération de composants
   */
  private async testComponentGeneration(): Promise<void> {
    await this.runTest('Génération de composants', () => {
      const navigation: NavigationStructure = {
        items: [],
        groups: [
          {
            id: 'main',
            label: 'Principal',
            items: [
              {
                id: 'home',
                label: 'Accueil',
                href: '/',
                icon: 'Home',
                searchable: false,
                sortable: false,
                filterable: false,
              },
            ],
          },
        ],
      };

      const config = createNavigationConfig('Component Test', navigation, {
        features: ['sidebar', 'breadcrumbs', 'mobile-menu'],
      });

      const generator = new NavigationGenerator(config);
      const result = generator.generate();

      // Vérifier la sidebar
      const sidebarFile = result.files.find(f => f.path === 'src/components/navigation/app-sidebar.tsx');
      if (!sidebarFile) {
        throw new Error('Composant sidebar manquant');
      }

      if (!sidebarFile.content.includes('export function AppSidebar')) {
        throw new Error('Fonction AppSidebar manquante');
      }

      // Vérifier les breadcrumbs
      const breadcrumbsFile = result.files.find(f => f.path === 'src/components/navigation/breadcrumbs.tsx');
      if (!breadcrumbsFile) {
        throw new Error('Composant breadcrumbs manquant');
      }

      if (!breadcrumbsFile.content.includes('export function Breadcrumbs')) {
        throw new Error('Fonction Breadcrumbs manquante');
      }

      // Vérifier le menu mobile
      const mobileMenuFile = result.files.find(f => f.path === 'src/components/navigation/mobile-menu.tsx');
      if (!mobileMenuFile) {
        throw new Error('Composant menu mobile manquant');
      }
    });
  }

  /**
   * Test de génération de middleware
   */
  private async testMiddlewareGeneration(): Promise<void> {
    await this.runTest('Génération de middleware', () => {
      const navigation: NavigationStructure = {
        items: [],
        groups: [],
      };

      const config = createNavigationConfig('Middleware Test', navigation, {
        security: {
          authentication: true,
          authorization: true,
          roles: [
            { name: 'user', label: 'Utilisateur', permissions: ['read'] },
            { name: 'admin', label: 'Admin', permissions: ['read', 'write'] },
          ],
          permissions: [
            { name: 'read', label: 'Lecture' },
            { name: 'write', label: 'Écriture' },
          ],
          middleware: {
            enabled: true,
            publicRoutes: ['/'],
            protectedRoutes: ['/dashboard'],
            adminRoutes: ['/admin'],
            redirectAfterLogin: '/dashboard',
            redirectAfterLogout: '/',
            unauthorizedRedirect: '/unauthorized',
          },
          redirects: {
            afterLogin: '/dashboard',
            afterLogout: '/',
            unauthorized: '/unauthorized',
            notFound: '/404',
          },
        },
      });

      const generator = new NavigationGenerator(config);
      const result = generator.generate({ includeMiddleware: true });

      const middlewareFile = result.files.find(f => f.path === 'middleware.ts');
      if (!middlewareFile) {
        throw new Error('Fichier middleware manquant');
      }

      const content = middlewareFile.content;

      // Vérifier les imports
      if (!content.includes('NextRequest') || !content.includes('NextResponse')) {
        throw new Error('Imports Next.js manquants');
      }

      // Vérifier la fonction middleware
      if (!content.includes('export async function middleware(')) {
        throw new Error('Fonction middleware manquante');
      }

      // Vérifier la configuration
      if (!content.includes('export const config')) {
        throw new Error('Configuration middleware manquante');
      }
    });
  }

  /**
   * Test de génération de types
   */
  private async testTypesGeneration(): Promise<void> {
    await this.runTest('Génération de types TypeScript', () => {
      const navigation: NavigationStructure = {
        items: [],
        groups: [
          {
            id: 'main',
            label: 'Principal',
            items: [
              {
                id: 'home',
                label: 'Accueil',
                href: '/',
                searchable: false,
                sortable: false,
                filterable: false,
              },
            ],
          },
        ],
      };

      const config = createNavigationConfig('Types Test', navigation);
      const generator = new NavigationGenerator(config);
      const result = generator.generate();

      const typesFile = result.files.find(f => f.path === 'shared/types/navigation.ts');
      if (!typesFile) {
        throw new Error('Fichier de types manquant');
      }

      const content = typesFile.content;

      // Vérifier les interfaces principales
      const expectedInterfaces = [
        'NavigationItem',
        'NavigationGroup',
        'NavigationStructure',
        'LayoutConfig',
        'NavigationStyling',
      ];

      expectedInterfaces.forEach(interfaceName => {
        if (!content.includes(`export interface ${interfaceName}`)) {
          throw new Error(`Interface ${interfaceName} manquante`);
        }
      });
    });
  }

  /**
   * Test de génération d'utilitaires
   */
  private async testUtilitiesGeneration(): Promise<void> {
    await this.runTest('Génération d\'utilitaires', () => {
      const navigation: NavigationStructure = {
        items: [],
        groups: [
          {
            id: 'main',
            label: 'Principal',
            items: [
              {
                id: 'home',
                label: 'Accueil',
                href: '/',
                searchable: false,
                sortable: false,
                filterable: false,
              },
            ],
          },
        ],
      };

      const config = createNavigationConfig('Utils Test', navigation);
      const generator = new NavigationGenerator(config);
      const result = generator.generate();

      const utilsFile = result.files.find(f => f.path === 'src/lib/navigation-utils.ts');
      if (!utilsFile) {
        throw new Error('Fichier d\'utilitaires manquant');
      }

      const content = utilsFile.content;

      // Vérifier les fonctions utilitaires
      const expectedFunctions = [
        'filterNavigationByRoles',
        'canAccessNavigationItem',
        'generateBreadcrumbs',
        'isPathActive',
      ];

      expectedFunctions.forEach(func => {
        if (!content.includes(`export function ${func}(`)) {
          throw new Error(`Fonction ${func} manquante`);
        }
      });
    });
  }

  /**
   * Test de génération avec permissions
   */
  private async testPermissionsGeneration(): Promise<void> {
    await this.runTest('Génération avec permissions', () => {
      const navigation: NavigationStructure = {
        items: [],
        groups: [
          {
            id: 'admin',
            label: 'Administration',
            items: [
              {
                id: 'users',
                label: 'Utilisateurs',
                href: '/admin/users',
                roles: ['admin'],
                searchable: false,
                sortable: false,
                filterable: false,
              },
            ],
            roles: ['admin'],
          },
        ],
      };

      const config = createNavigationConfig('Permissions Test', navigation, {
        security: {
          authentication: true,
          authorization: true,
          roles: [
            { name: 'admin', label: 'Admin', permissions: ['admin:read', 'admin:write'] },
          ],
          permissions: [
            { name: 'admin:read', label: 'Lecture admin' },
            { name: 'admin:write', label: 'Écriture admin' },
          ],
          middleware: {
            enabled: true,
            publicRoutes: ['/'],
            protectedRoutes: ['/dashboard'],
            adminRoutes: ['/admin'],
            redirectAfterLogin: '/dashboard',
            redirectAfterLogout: '/',
            unauthorizedRedirect: '/unauthorized',
          },
          redirects: {
            afterLogin: '/dashboard',
            afterLogout: '/',
            unauthorized: '/unauthorized',
            notFound: '/404',
          },
        },
      });

      const generator = new NavigationGenerator(config);
      const result = generator.generate();

      const permissionsFile = result.files.find(f => f.path === 'src/lib/navigation-permissions.ts');
      if (!permissionsFile) {
        throw new Error('Fichier de permissions manquant');
      }

      if (!permissionsFile.content.includes('hasPermission')) {
        throw new Error('Fonction hasPermission manquante');
      }
    });
  }

  /**
   * Test de génération de breadcrumbs
   */
  private async testBreadcrumbsGeneration(): Promise<void> {
    await this.runTest('Génération de breadcrumbs', () => {
      const navigation: NavigationStructure = {
        items: [],
        groups: [
          {
            id: 'main',
            label: 'Principal',
            items: [
              {
                id: 'products',
                label: 'Produits',
                href: '/products',
                searchable: false,
                sortable: false,
                filterable: false,
              },
            ],
          },
        ],
      };

      const config = createNavigationConfig('Breadcrumbs Test', navigation, {
        features: ['breadcrumbs'],
      });

      const generator = new NavigationGenerator(config);
      const result = generator.generate();

      const breadcrumbsFile = result.files.find(f => f.path === 'src/components/navigation/breadcrumbs.tsx');
      if (!breadcrumbsFile) {
        throw new Error('Composant breadcrumbs manquant');
      }

      const content = breadcrumbsFile.content;

      if (!content.includes('usePathname')) {
        throw new Error('Hook usePathname manquant');
      }

      if (!content.includes('Breadcrumb')) {
        throw new Error('Composant Breadcrumb manquant');
      }
    });
  }

  /**
   * Test de génération de command palette
   */
  private async testCommandPaletteGeneration(): Promise<void> {
    await this.runTest('Génération de command palette', () => {
      const navigation: NavigationStructure = {
        items: [],
        groups: [],
      };

      const config = createNavigationConfig('Command Test', navigation, {
        features: ['command-palette'],
      });

      const generator = new NavigationGenerator(config);
      const result = generator.generate({ includeCommandPalette: true });

      const commandFile = result.files.find(f => f.path === 'src/components/navigation/command-palette.tsx');
      if (!commandFile) {
        throw new Error('Composant command palette manquant');
      }

      if (!commandFile.content.includes('CommandDialog')) {
        throw new Error('Composant CommandDialog manquant');
      }
    });
  }

  /**
   * Test de génération responsive
   */
  private async testResponsiveGeneration(): Promise<void> {
    await this.runTest('Génération responsive', () => {
      const navigation: NavigationStructure = {
        items: [],
        groups: [],
      };

      const config = createNavigationConfig('Responsive Test', navigation, {
        layout: { type: 'hybrid', responsive: true, stickyHeader: true, stickyFooter: false, padding: 'md' },
        features: ['mobile-menu'],
      });

      const generator = new NavigationGenerator(config);
      const result = generator.generate();

      const hybridLayout = result.files.find(f => f.path === 'app/(app)/layout.tsx');
      if (!hybridLayout) {
        throw new Error('Layout hybride manquant');
      }

      if (!hybridLayout.content.includes('useMediaQuery')) {
        throw new Error('Hook useMediaQuery manquant pour responsive');
      }
    });
  }

  /**
   * Test des presets
   */
  private async testPresets(): Promise<void> {
    await this.runTest('Test des presets', () => {
      // Test preset simple
      const simpleGenerator = new NavigationGenerator(NAVIGATION_PRESETS.simple);
      const simpleResult = simpleGenerator.generate();

      if (simpleResult.files.length === 0) {
        throw new Error('Preset simple ne génère aucun fichier');
      }

      // Test preset dashboard
      const dashboardGenerator = new NavigationGenerator(NAVIGATION_PRESETS.dashboard);
      const dashboardResult = dashboardGenerator.generate();

      if (dashboardResult.files.length === 0) {
        throw new Error('Preset dashboard ne génère aucun fichier');
      }

      // Test preset admin
      const adminGenerator = new NavigationGenerator(NAVIGATION_PRESETS.admin);
      const adminResult = adminGenerator.generate();

      if (adminResult.files.length === 0) {
        throw new Error('Preset admin ne génère aucun fichier');
      }
    });
  }

  /**
   * Test de performance
   */
  private async testPerformance(): Promise<void> {
    await this.runTest('Performance de génération', () => {
      const startTime = Date.now();

      // Générer une navigation complexe
      const complexNavigation: NavigationStructure = {
        items: [],
        groups: Array.from({ length: 10 }, (_, i) => ({
          id: `group${i}`,
          label: `Groupe ${i}`,
          items: Array.from({ length: 10 }, (_, j) => ({
            id: `item${i}-${j}`,
            label: `Élément ${i}-${j}`,
            href: `/group${i}/item${j}`,
            icon: 'Circle',
            searchable: false,
            sortable: false,
            filterable: false,
          })),
        })),
      };

      const config = createNavigationConfig('Complex Navigation', complexNavigation, {
        features: ['breadcrumbs', 'sidebar', 'mobile-menu', 'command-palette', 'user-menu'],
      });

      const generator = new NavigationGenerator(config);
      const result = generator.generate();

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`  ⏱️  Génération de ${complexNavigation.groups.length * 10} éléments: ${duration}ms`);
      console.log(`  📁 Fichiers générés: ${result.files.length}`);

      if (duration > 3000) {
        throw new Error('Génération trop lente (>3s)');
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
 * Exécute tous les tests Navigation
 */
export async function runNavigationTests(): Promise<boolean> {
  const testSuite = new NavigationTestSuite();
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
  runNavigationTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}
