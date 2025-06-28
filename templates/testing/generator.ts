/**
 * Testing Template Generator
 * Main generator logic that orchestrates file creation and dependency management
 */

import { FileTemplate } from "../types";
import { TestingConfig, TestingTemplate, defaultTestingConfig } from "./index";
import { 
  generateTestConfigFiles, 
  generateTestUtilFiles, 
  generateMockFiles, 
  generateExampleTestFiles 
} from "./utilities";
import { generateAllExtensions } from "./extensions";

export interface TestingGenerationOptions {
  includeExamples?: boolean;
  includeE2E?: boolean;
  includeVisualTests?: boolean;
  includePerformanceTests?: boolean;
  includeAccessibilityTests?: boolean;
  includeAutomation?: boolean;
}

/**
 * Generate complete testing template
 */
export function generateCompleteTesting(
  config: TestingConfig = defaultTestingConfig,
  options: TestingGenerationOptions = {}
): TestingTemplate {
  const {
    includeExamples = true,
    includeE2E = false,
    includeVisualTests = false,
    includePerformanceTests = false,
    includeAccessibilityTests = false,
    includeAutomation = false,
  } = options;

  // Adjust configuration based on options
  const finalConfig: TestingConfig = {
    ...config,
    testTypes: {
      ...config.testTypes,
      e2e: includeE2E || config.testTypes.e2e,
      visual: includeVisualTests || config.testTypes.visual,
      performance: includePerformanceTests || config.testTypes.performance,
      accessibility: includeAccessibilityTests || config.testTypes.accessibility,
    },
    automation: {
      ...config.automation,
      githubActions: includeAutomation || config.automation.githubActions,
      preCommitHooks: includeAutomation || config.automation.preCommitHooks,
    },
  };

  const files: FileTemplate[] = [];

  // Core test configuration files
  files.push(...generateTestConfigFiles(finalConfig));
  
  // Test utilities and helpers
  files.push(...generateTestUtilFiles(finalConfig));
  
  // Mock implementations
  files.push(...generateMockFiles(finalConfig));

  // Example test files
  if (includeExamples) {
    files.push(...generateExampleTestFiles(finalConfig));
  }

  // Advanced testing extensions
  files.push(...generateAllExtensions(finalConfig));

  // Automation files
  if (finalConfig.automation.githubActions) {
    files.push(...generateAutomationFiles(finalConfig));
  }

  // Package scripts
  const packageScripts = generatePackageScripts(finalConfig);

  // Dependencies
  const dependencies = generateDependencies(finalConfig);
  const devDependencies = generateDevDependencies(finalConfig);

  // Instructions
  const instructions = generateInstructions(finalConfig, options);

  const directoryStructure = {
    "__tests__": "Test files organized by type",
    "tests/utils": "Testing utilities and helpers",
    "tests/mocks": "Mock implementations",
    "tests/fixtures": "Test data and fixtures",
    "e2e": "End-to-end tests (if enabled)",
    ".github/workflows": "CI/CD workflows (if enabled)",
  };

  return {
    files,
    packageScripts,
    dependencies,
    devDependencies,
    instructions,
    directoryStructure,
  };
}

/**
 * Generate automation files
 */
function generateAutomationFiles(config: TestingConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // GitHub Actions workflow
  if (config.automation.githubActions) {
    files.push({
      path: ".github/workflows/test.yml",
      content: generateGitHubActionsWorkflow(config),
    });
  }

  // Pre-commit hooks
  if (config.automation.preCommitHooks) {
    files.push({
      path: ".husky/pre-commit",
      content: generatePreCommitHook(config),
    });
    files.push({
      path: ".lintstagedrc.js",
      content: generateLintStagedConfig(config),
    });
  }

  return files;
}

function generateGitHubActionsWorkflow(config: TestingConfig): string {
  return `name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run linting
        run: pnpm lint
      
      - name: Run type checking
        run: pnpm type-check
      
      - name: Run unit tests
        run: pnpm test:ci
      
      ${config.testTypes.e2e ? `
      - name: Install Playwright browsers
        run: pnpm playwright install --with-deps
        if: matrix.node-version == '20.x'
      
      - name: Run E2E tests
        run: pnpm test:e2e
        if: matrix.node-version == '20.x'
      ` : ''}
      
      ${config.coverage.enabled ? `
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
        if: matrix.node-version == '20.x'
      ` : ''}`;
}

function generatePreCommitHook(config: TestingConfig): string {
  return `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged`;
}

function generateLintStagedConfig(config: TestingConfig): string {
  return `module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    ${config.testTypes.unit ? "'pnpm test:related'," : ""}
  ],
  '*.{css,scss,sass}': [
    'stylelint --fix',
    'prettier --write',
  ],
  '*.{md,mdx}': [
    'prettier --write',
  ],
  '*.json': [
    'prettier --write',
  ],
};`;
}

function generatePackageScripts(config: TestingConfig): Record<string, string> {
  const scripts: Record<string, string> = {
    "test": config.framework === "jest" ? "jest" : "vitest",
    "test:watch": config.framework === "jest" ? "jest --watch" : "vitest --watch",
    "test:ci": config.framework === "jest" ? "jest --ci --coverage" : "vitest --run --coverage",
  };

  if (config.coverage.enabled) {
    scripts["test:coverage"] = config.framework === "jest" 
      ? "jest --coverage" 
      : "vitest --coverage";
  }

  if (config.testTypes.e2e && config.e2eFramework !== "none") {
    scripts["test:e2e"] = config.e2eFramework === "playwright" 
      ? "playwright test" 
      : "cypress run";
    scripts["test:e2e:ui"] = config.e2eFramework === "playwright" 
      ? "playwright test --ui" 
      : "cypress open";
  }

  if (config.automation.preCommitHooks) {
    scripts["prepare"] = "husky install";
  }

  return scripts;
}

function generateDependencies(config: TestingConfig): Record<string, string> {
  const deps: Record<string, string> = {};

  if (config.testTypes.accessibility) {
    deps["@axe-core/react"] = "^4.8.0";
  }

  return deps;
}

function generateDevDependencies(config: TestingConfig): Record<string, string> {
  const devDeps: Record<string, string> = {
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
  };

  if (config.testingLibrary.user) {
    devDeps["@testing-library/user-event"] = "^14.5.0";
  }

  if (config.framework === "jest") {
    devDeps["jest"] = "^29.7.0";
    devDeps["jest-environment-jsdom"] = "^29.7.0";
    devDeps["@types/jest"] = "^29.5.0";
  } else {
    devDeps["vitest"] = "^1.0.0";
    devDeps["@vitest/ui"] = "^1.0.0";
    devDeps["jsdom"] = "^23.0.0";
  }

  if (config.testTypes.e2e) {
    if (config.e2eFramework === "playwright") {
      devDeps["@playwright/test"] = "^1.40.0";
      if (config.testTypes.accessibility) {
        devDeps["@axe-core/playwright"] = "^4.8.0";
      }
    } else if (config.e2eFramework === "cypress") {
      devDeps["cypress"] = "^13.6.0";
      if (config.testTypes.accessibility) {
        devDeps["cypress-axe"] = "^1.5.0";
      }
    }
  }

  if (config.testTypes.performance) {
    devDeps["lighthouse"] = "^11.4.0";
    devDeps["chrome-launcher"] = "^1.1.0";
  }

  if (config.automation.preCommitHooks) {
    devDeps["husky"] = "^8.0.0";
    devDeps["lint-staged"] = "^15.0.0";
  }

  return devDeps;
}

function generateInstructions(
  config: TestingConfig, 
  options: TestingGenerationOptions
): string[] {
  const instructions = [
    "1. Install dependencies with your package manager",
    "2. Run tests with npm test or yarn test",
    "3. Configure test environment variables if needed",
  ];

  if (config.testTypes.e2e && config.e2eFramework === "playwright") {
    instructions.push("4. Install Playwright browsers: npx playwright install");
  }

  if (config.automation.preCommitHooks) {
    instructions.push("5. Setup pre-commit hooks: npx husky install");
  }

  if (config.coverage.enabled) {
    instructions.push("6. View coverage reports in the coverage/ directory");
  }

  return instructions;
}
