/**
 * Testing Template
 * Comprehensive testing setup for Next.js applications with multiple frameworks and strategies
 */

import { DirectoryStructure, FileTemplate, ProjectConfig } from "../types";

export interface TestingConfig extends ProjectConfig {
  framework: "jest" | "vitest";
  testingLibrary: {
    react: boolean;
    user: boolean;
    jest: boolean;
  };
  testTypes: {
    unit: boolean;
    integration: boolean;
    e2e: boolean;
    visual: boolean;
    performance: boolean;
    accessibility: boolean;
  };
  e2eFramework: "playwright" | "cypress" | "none";
  coverage: {
    enabled: boolean;
    threshold: number;
    reports: ("text" | "html" | "lcov" | "json")[];
  };
  mocking: {
    nextjs: boolean;
    database: boolean;
    api: boolean;
    external: boolean;
  };
  automation: {
    githubActions: boolean;
    preCommitHooks: boolean;
    testGeneration: boolean;
    snapshotTesting: boolean;
  };
  features: (
    | "unit-tests"
    | "integration-tests"
    | "e2e-tests"
    | "visual-tests"
    | "performance-tests"
    | "accessibility-tests"
    | "test-utils"
    | "mocking"
    | "coverage"
    | "automation"
  )[];
}

export interface TestingTemplate {
  files: FileTemplate[];
  packageScripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  instructions: string[];
  directoryStructure: DirectoryStructure;
}

/**
 * Default testing configuration
 */
export const defaultTestingConfig: TestingConfig = {
  projectName: "tested-app",
  framework: "jest",
  testingLibrary: {
    react: true,
    user: true,
    jest: true,
  },
  testTypes: {
    unit: true,
    integration: false,
    e2e: false,
    visual: false,
    performance: false,
    accessibility: false,
  },
  e2eFramework: "none",
  coverage: {
    enabled: true,
    threshold: 80,
    reports: ["text", "html", "lcov"],
  },
  mocking: {
    nextjs: true,
    database: false,
    api: true,
    external: false,
  },
  automation: {
    githubActions: false,
    preCommitHooks: false,
    testGeneration: false,
    snapshotTesting: false,
  },
  features: [
    "unit-tests",
    "test-utils",
    "mocking",
    "coverage",
  ],
};

/**
 * Generate testing template
 */
export function generateTestingTemplate(
  config: TestingConfig = defaultTestingConfig
): TestingTemplate {
  const files: FileTemplate[] = [];
  const packageScripts: Record<string, string> = {};
  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};
  const instructions: string[] = [];

  // Generate files using utilities
  files.push(...generateTestConfigFiles(config));
  files.push(...generateTestUtilFiles(config));
  files.push(...generateMockFiles(config));
  files.push(...generateExampleTestFiles(config));

  // Package scripts
  Object.assign(packageScripts, generatePackageScripts(config));
  
  // Dependencies
  Object.assign(dependencies, generateDependencies(config));
  Object.assign(devDependencies, generateDevDependencies(config));
  
  // Instructions
  instructions.push(...generateInstructions(config));

  const directoryStructure: DirectoryStructure = {
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

// Helper functions (implemented in utilities.ts)
function generateTestConfigFiles(config: TestingConfig): FileTemplate[] {
  // Implementation moved to utilities.ts
  return [];
}

function generateTestUtilFiles(config: TestingConfig): FileTemplate[] {
  // Implementation moved to utilities.ts
  return [];
}

function generateMockFiles(config: TestingConfig): FileTemplate[] {
  // Implementation moved to utilities.ts
  return [];
}

function generateExampleTestFiles(config: TestingConfig): FileTemplate[] {
  // Implementation moved to utilities.ts
  return [];
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
    } else if (config.e2eFramework === "cypress") {
      devDeps["cypress"] = "^13.6.0";
    }
  }

  if (config.automation.preCommitHooks) {
    devDeps["husky"] = "^8.0.0";
    devDeps["lint-staged"] = "^15.0.0";
  }

  return devDeps;
}

function generateInstructions(config: TestingConfig): string[] {
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

  return instructions;
}

export * from "./types";
export * from "./utilities";
export * from "./extensions";
