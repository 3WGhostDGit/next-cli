/**
 * Testing Template Tests
 * Comprehensive test suite validating template generation and functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { generateCompleteTesting } from './generator';
import { defaultTestingConfig, TestingConfig } from './index';
import { validateTestingConfig, getRecommendedTestConfig } from './schemas';
import { 
  exampleCompleteTesting, 
  exampleVitestModern, 
  exampleBasicTesting,
  exampleCypressE2E,
  exampleLibraryTesting 
} from './example';

describe('Testing Template', () => {
  describe('Template Generation', () => {
    it('should generate template with default configuration', () => {
      const template = generateCompleteTesting();
      
      expect(template).toBeDefined();
      expect(template.files).toBeInstanceOf(Array);
      expect(template.files.length).toBeGreaterThan(0);
      expect(template.packageScripts).toBeDefined();
      expect(template.dependencies).toBeDefined();
      expect(template.devDependencies).toBeDefined();
      expect(template.instructions).toBeInstanceOf(Array);
      expect(template.directoryStructure).toBeDefined();
    });

    it('should generate different files based on framework', () => {
      const jestConfig: TestingConfig = {
        ...defaultTestingConfig,
        framework: "jest",
      };
      const vitestConfig: TestingConfig = {
        ...defaultTestingConfig,
        framework: "vitest",
      };

      const jestTemplate = generateCompleteTesting(jestConfig);
      const vitestTemplate = generateCompleteTesting(vitestConfig);

      const jestConfigFile = jestTemplate.files.find(f => f.path.includes('jest.config'));
      const vitestConfigFile = vitestTemplate.files.find(f => f.path.includes('vitest.config'));

      expect(jestConfigFile).toBeDefined();
      expect(vitestConfigFile).toBeDefined();
    });

    it('should include E2E files when E2E is enabled', () => {
      const config: TestingConfig = {
        ...defaultTestingConfig,
        testTypes: {
          ...defaultTestingConfig.testTypes,
          e2e: true,
        },
        e2eFramework: "playwright",
      };

      const template = generateCompleteTesting(config);
      const playwrightConfig = template.files.find(f => f.path.includes('playwright.config'));
      
      expect(playwrightConfig).toBeDefined();
      expect(template.devDependencies['@playwright/test']).toBeDefined();
    });

    it('should include correct dependencies for Cypress', () => {
      const config: TestingConfig = {
        ...defaultTestingConfig,
        testTypes: {
          ...defaultTestingConfig.testTypes,
          e2e: true,
        },
        e2eFramework: "cypress",
      };

      const template = generateCompleteTesting(config);
      
      expect(template.devDependencies['cypress']).toBeDefined();
      expect(template.packageScripts['test:e2e']).toContain('cypress');
    });

    it('should include automation files when enabled', () => {
      const config: TestingConfig = {
        ...defaultTestingConfig,
        automation: {
          ...defaultTestingConfig.automation,
          githubActions: true,
          preCommitHooks: true,
        },
      };

      const template = generateCompleteTesting(config);
      const githubWorkflow = template.files.find(f => f.path.includes('.github/workflows'));
      const huskyHook = template.files.find(f => f.path.includes('.husky'));
      
      expect(githubWorkflow).toBeDefined();
      expect(huskyHook).toBeDefined();
      expect(template.devDependencies['husky']).toBeDefined();
      expect(template.devDependencies['lint-staged']).toBeDefined();
    });
  });

  describe('Configuration Validation', () => {
    it('should validate valid configuration', () => {
      const config = defaultTestingConfig;
      const validation = validateTestingConfig(config);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid framework', () => {
      const config: TestingConfig = {
        ...defaultTestingConfig,
        framework: "invalid" as any,
      };

      const validation = validateTestingConfig(config);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(error => 
        error.includes('Unsupported test framework')
      )).toBe(true);
    });

    it('should detect invalid E2E framework', () => {
      const config: TestingConfig = {
        ...defaultTestingConfig,
        testTypes: {
          ...defaultTestingConfig.testTypes,
          e2e: true,
        },
        e2eFramework: "invalid" as any,
      };

      const validation = validateTestingConfig(config);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(error => 
        error.includes('Unsupported E2E framework')
      )).toBe(true);
    });

    it('should detect invalid coverage threshold', () => {
      const config: TestingConfig = {
        ...defaultTestingConfig,
        coverage: {
          ...defaultTestingConfig.coverage,
          threshold: 150, // Invalid threshold
        },
      };

      const validation = validateTestingConfig(config);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(error => 
        error.includes('Coverage threshold must be between 0 and 100')
      )).toBe(true);
    });

    it('should warn about E2E configuration mismatch', () => {
      const config: TestingConfig = {
        ...defaultTestingConfig,
        testTypes: {
          ...defaultTestingConfig.testTypes,
          e2e: true,
        },
        e2eFramework: "none",
      };

      const validation = validateTestingConfig(config);
      
      expect(validation.warnings.some(warning => 
        warning.includes('E2E tests are enabled but no E2E framework')
      )).toBe(true);
    });
  });

  describe('Configuration Presets', () => {
    it('should return recommended config for web app', () => {
      const config = getRecommendedTestConfig('web-app');
      
      expect(config).toBeDefined();
      expect(config?.testTypes.unit).toBe(true);
      expect(config?.testTypes.integration).toBe(true);
      expect(config?.testTypes.e2e).toBe(true);
      expect(config?.e2eFramework).toBe('playwright');
    });

    it('should return recommended config for library', () => {
      const config = getRecommendedTestConfig('library');
      
      expect(config).toBeDefined();
      expect(config?.framework).toBe('vitest');
      expect(config?.testTypes.unit).toBe(true);
      expect(config?.testTypes.e2e).toBe(false);
      expect(config?.coverage.threshold).toBe(90);
    });

    it('should return recommended config for e-commerce', () => {
      const config = getRecommendedTestConfig('e-commerce');
      
      expect(config).toBeDefined();
      expect(config?.testTypes.visual).toBe(true);
      expect(config?.testTypes.performance).toBe(true);
      expect(config?.testTypes.accessibility).toBe(true);
      expect(config?.coverage.threshold).toBe(85);
    });

    it('should return null for unknown project type', () => {
      const config = getRecommendedTestConfig('unknown-type');
      
      expect(config).toBeNull();
    });
  });

  describe('Example Configurations', () => {
    it('should generate complete testing configuration', () => {
      const config = exampleCompleteTesting();
      
      expect(config.framework).toBe('jest');
      expect(config.testTypes.unit).toBe(true);
      expect(config.testTypes.e2e).toBe(true);
      expect(config.testTypes.visual).toBe(true);
      expect(config.testTypes.performance).toBe(true);
      expect(config.testTypes.accessibility).toBe(true);
      expect(config.e2eFramework).toBe('playwright');
      expect(config.coverage.threshold).toBe(90);
    });

    it('should generate Vitest modern configuration', () => {
      const config = exampleVitestModern();
      
      expect(config.framework).toBe('vitest');
      expect(config.testTypes.unit).toBe(true);
      expect(config.testTypes.e2e).toBe(true);
      expect(config.testTypes.visual).toBe(false);
      expect(config.e2eFramework).toBe('playwright');
      expect(config.coverage.threshold).toBe(85);
    });

    it('should generate basic testing configuration', () => {
      const config = exampleBasicTesting();
      
      expect(config.framework).toBe('jest');
      expect(config.testTypes.unit).toBe(true);
      expect(config.testTypes.e2e).toBe(false);
      expect(config.testTypes.visual).toBe(false);
      expect(config.e2eFramework).toBe('none');
      expect(config.coverage.threshold).toBe(70);
      expect(config.automation.githubActions).toBe(false);
    });

    it('should generate Cypress E2E configuration', () => {
      const config = exampleCypressE2E();
      
      expect(config.framework).toBe('jest');
      expect(config.testTypes.e2e).toBe(true);
      expect(config.e2eFramework).toBe('cypress');
      expect(config.testTypes.accessibility).toBe(true);
      expect(config.automation.githubActions).toBe(true);
    });

    it('should generate library testing configuration', () => {
      const config = exampleLibraryTesting();
      
      expect(config.framework).toBe('vitest');
      expect(config.testTypes.unit).toBe(true);
      expect(config.testTypes.e2e).toBe(false);
      expect(config.coverage.threshold).toBe(95);
      expect(config.mocking.nextjs).toBe(false);
    });
  });

  describe('Package Scripts', () => {
    it('should include basic test scripts for Jest', () => {
      const config: TestingConfig = {
        ...defaultTestingConfig,
        framework: "jest",
      };

      const template = generateCompleteTesting(config);
      
      expect(template.packageScripts['test']).toBe('jest');
      expect(template.packageScripts['test:watch']).toBe('jest --watch');
      expect(template.packageScripts['test:ci']).toBe('jest --ci --coverage');
    });

    it('should include basic test scripts for Vitest', () => {
      const config: TestingConfig = {
        ...defaultTestingConfig,
        framework: "vitest",
      };

      const template = generateCompleteTesting(config);
      
      expect(template.packageScripts['test']).toBe('vitest');
      expect(template.packageScripts['test:watch']).toBe('vitest --watch');
      expect(template.packageScripts['test:ci']).toBe('vitest --run --coverage');
    });

    it('should include E2E scripts when enabled', () => {
      const config: TestingConfig = {
        ...defaultTestingConfig,
        testTypes: {
          ...defaultTestingConfig.testTypes,
          e2e: true,
        },
        e2eFramework: "playwright",
      };

      const template = generateCompleteTesting(config);
      
      expect(template.packageScripts['test:e2e']).toBe('playwright test');
      expect(template.packageScripts['test:e2e:ui']).toBe('playwright test --ui');
    });

    it('should include prepare script when pre-commit hooks are enabled', () => {
      const config: TestingConfig = {
        ...defaultTestingConfig,
        automation: {
          ...defaultTestingConfig.automation,
          preCommitHooks: true,
        },
      };

      const template = generateCompleteTesting(config);
      
      expect(template.packageScripts['prepare']).toBe('husky install');
    });
  });

  describe('Dependencies', () => {
    it('should include correct testing library dependencies', () => {
      const template = generateCompleteTesting();
      
      expect(template.devDependencies['@testing-library/react']).toBeDefined();
      expect(template.devDependencies['@testing-library/jest-dom']).toBeDefined();
    });

    it('should include user-event when enabled', () => {
      const config: TestingConfig = {
        ...defaultTestingConfig,
        testingLibrary: {
          ...defaultTestingConfig.testingLibrary,
          user: true,
        },
      };

      const template = generateCompleteTesting(config);
      
      expect(template.devDependencies['@testing-library/user-event']).toBeDefined();
    });

    it('should include accessibility dependencies when enabled', () => {
      const config: TestingConfig = {
        ...defaultTestingConfig,
        testTypes: {
          ...defaultTestingConfig.testTypes,
          accessibility: true,
        },
      };

      const template = generateCompleteTesting(config);
      
      expect(template.dependencies['@axe-core/react']).toBeDefined();
    });

    it('should include performance testing dependencies when enabled', () => {
      const config: TestingConfig = {
        ...defaultTestingConfig,
        testTypes: {
          ...defaultTestingConfig.testTypes,
          performance: true,
        },
      };

      const template = generateCompleteTesting(config);
      
      expect(template.devDependencies['lighthouse']).toBeDefined();
      expect(template.devDependencies['chrome-launcher']).toBeDefined();
    });
  });
});
