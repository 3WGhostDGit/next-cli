/**
 * Testing Template Examples
 * Usage examples showing different configuration presets and implementation patterns
 */

import { generateCompleteTesting, TestingGenerationOptions } from "./generator";
import { TestingConfig } from "./index";

/**
 * Example 1: Complete testing setup with all features
 */
export function exampleCompleteTesting(): TestingConfig {
  return {
    projectName: "fully-tested-app",
    framework: "jest",
    testingLibrary: {
      react: true,
      user: true,
      jest: true,
    },
    testTypes: {
      unit: true,
      integration: true,
      e2e: true,
      visual: true,
      performance: true,
      accessibility: true,
    },
    e2eFramework: "playwright",
    coverage: {
      enabled: true,
      threshold: 90,
      reports: ["text", "html", "lcov", "json"],
    },
    mocking: {
      nextjs: true,
      database: true,
      api: true,
      external: true,
    },
    automation: {
      githubActions: true,
      preCommitHooks: true,
      testGeneration: true,
      snapshotTesting: true,
    },
    features: [
      "unit-tests",
      "integration-tests",
      "e2e-tests",
      "visual-tests",
      "performance-tests",
      "accessibility-tests",
      "test-utils",
      "mocking",
      "coverage",
      "automation",
    ],
  };
}

/**
 * Example 2: Modern Vitest setup
 */
export function exampleVitestModern(): TestingConfig {
  return {
    projectName: "modern-vitest-app",
    framework: "vitest",
    testingLibrary: {
      react: true,
      user: true,
      jest: true,
    },
    testTypes: {
      unit: true,
      integration: true,
      e2e: true,
      visual: false,
      performance: false,
      accessibility: true,
    },
    e2eFramework: "playwright",
    coverage: {
      enabled: true,
      threshold: 85,
      reports: ["text", "html", "lcov"],
    },
    mocking: {
      nextjs: true,
      database: true,
      api: true,
      external: true,
    },
    automation: {
      githubActions: true,
      preCommitHooks: true,
      testGeneration: false,
      snapshotTesting: true,
    },
    features: [
      "unit-tests",
      "integration-tests",
      "e2e-tests",
      "accessibility-tests",
      "test-utils",
      "mocking",
      "coverage",
      "automation",
    ],
  };
}

/**
 * Example 3: Basic testing for quick start
 */
export function exampleBasicTesting(): TestingConfig {
  return {
    projectName: "basic-tested-app",
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
      threshold: 70,
      reports: ["text", "html"],
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
}

/**
 * Example 4: E2E focused with Cypress
 */
export function exampleCypressE2E(): TestingConfig {
  return {
    projectName: "cypress-e2e-app",
    framework: "jest",
    testingLibrary: {
      react: true,
      user: true,
      jest: true,
    },
    testTypes: {
      unit: true,
      integration: true,
      e2e: true,
      visual: false,
      performance: false,
      accessibility: true,
    },
    e2eFramework: "cypress",
    coverage: {
      enabled: true,
      threshold: 80,
      reports: ["text", "html", "lcov"],
    },
    mocking: {
      nextjs: true,
      database: true,
      api: true,
      external: true,
    },
    automation: {
      githubActions: true,
      preCommitHooks: true,
      testGeneration: false,
      snapshotTesting: true,
    },
    features: [
      "unit-tests",
      "integration-tests",
      "e2e-tests",
      "accessibility-tests",
      "test-utils",
      "mocking",
      "coverage",
      "automation",
    ],
  };
}

/**
 * Example 5: Library testing setup
 */
export function exampleLibraryTesting(): TestingConfig {
  return {
    projectName: "library-package",
    framework: "vitest",
    testingLibrary: {
      react: true,
      user: false,
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
      threshold: 95,
      reports: ["text", "html", "lcov", "json"],
    },
    mocking: {
      nextjs: false,
      database: false,
      api: false,
      external: true,
    },
    automation: {
      githubActions: true,
      preCommitHooks: true,
      testGeneration: false,
      snapshotTesting: true,
    },
    features: [
      "unit-tests",
      "test-utils",
      "mocking",
      "coverage",
      "automation",
    ],
  };
}

/**
 * Complete demonstration function
 */
export function demonstrateTestingUsage() {
  console.log("🧪 Testing Template Demonstration\n");

  // Example 1: Complete testing setup
  console.log("🎯 Example 1: Complete testing with all features");
  const completeConfig = exampleCompleteTesting();
  const completeOptions: TestingGenerationOptions = {
    includeExamples: true,
    includeE2E: true,
    includeVisualTests: true,
    includePerformanceTests: true,
    includeAccessibilityTests: true,
    includeAutomation: true,
  };

  const completeTemplate = generateCompleteTesting(completeConfig, completeOptions);
  console.log(`- Files generated: ${completeTemplate.files.length}`);
  console.log(`- Framework: ${completeConfig.framework}`);
  console.log(`- E2E Framework: ${completeConfig.e2eFramework}`);
  console.log(`- Coverage threshold: ${completeConfig.coverage.threshold}%`);
  console.log(`- Test types: ${Object.entries(completeConfig.testTypes).filter(([_, enabled]) => enabled).map(([type]) => type).join(', ')}\n`);

  // Example 2: Vitest modern setup
  console.log("⚡ Example 2: Modern Vitest configuration");
  const vitestConfig = exampleVitestModern();
  const vitestOptions: TestingGenerationOptions = {
    includeExamples: true,
    includeE2E: true,
    includeAccessibilityTests: true,
    includeAutomation: true,
  };

  const vitestTemplate = generateCompleteTesting(vitestConfig, vitestOptions);
  console.log(`- Modern framework with Vitest`);
  console.log(`- Playwright for E2E testing`);
  console.log(`- GitHub Actions automation included\n`);

  // Example 3: Basic setup
  console.log("🪶 Example 3: Basic testing for quick start");
  const basicConfig = exampleBasicTesting();
  const basicOptions: TestingGenerationOptions = {
    includeExamples: false,
    includeE2E: false,
    includeAutomation: false,
  };

  const basicTemplate = generateCompleteTesting(basicConfig, basicOptions);
  console.log(`- Minimal configuration for getting started`);
  console.log(`- Unit tests only`);
  console.log(`- No complex automation\n`);

  // Example 4: Cypress E2E
  console.log("🌲 Example 4: E2E testing with Cypress");
  const cypressConfig = exampleCypressE2E();
  const cypressOptions: TestingGenerationOptions = {
    includeExamples: true,
    includeE2E: true,
    includeAccessibilityTests: true,
    includeAutomation: true,
  };

  const cypressTemplate = generateCompleteTesting(cypressConfig, cypressOptions);
  console.log(`- Cypress for E2E testing`);
  console.log(`- Accessibility tests included`);
  console.log(`- Complete automation setup\n`);

  // Example 5: Library testing
  console.log("📦 Example 5: Library testing setup");
  const libraryConfig = exampleLibraryTesting();
  const libraryOptions: TestingGenerationOptions = {
    includeExamples: true,
    includeAutomation: true,
  };

  const libraryTemplate = generateCompleteTesting(libraryConfig, libraryOptions);
  console.log(`- High coverage requirements (95%)`);
  console.log(`- Vitest for modern testing`);
  console.log(`- Focused on unit testing\n`);

  return {
    complete: { config: completeConfig, template: completeTemplate },
    vitest: { config: vitestConfig, template: vitestTemplate },
    basic: { config: basicConfig, template: basicTemplate },
    cypress: { config: cypressConfig, template: cypressTemplate },
    library: { config: libraryConfig, template: libraryTemplate },
  };
}

/**
 * CLI generation helper
 */
export function generateForCLI(
  framework: "jest" | "vitest" = "jest",
  testTypes: string[] = ["unit"],
  e2eFramework: "playwright" | "cypress" | "none" = "none",
  includeAutomation: boolean = false
) {
  const baseConfig: TestingConfig = {
    projectName: "cli-generated-app",
    framework,
    testingLibrary: {
      react: true,
      user: true,
      jest: true,
    },
    testTypes: {
      unit: testTypes.includes("unit"),
      integration: testTypes.includes("integration"),
      e2e: testTypes.includes("e2e"),
      visual: testTypes.includes("visual"),
      performance: testTypes.includes("performance"),
      accessibility: testTypes.includes("accessibility"),
    },
    e2eFramework,
    coverage: {
      enabled: true,
      threshold: 80,
      reports: ["text", "html", "lcov"],
    },
    mocking: {
      nextjs: true,
      database: testTypes.includes("integration"),
      api: true,
      external: testTypes.includes("integration"),
    },
    automation: {
      githubActions: includeAutomation,
      preCommitHooks: includeAutomation,
      testGeneration: false,
      snapshotTesting: testTypes.includes("unit"),
    },
    features: [
      ...(testTypes.includes("unit") ? ["unit-tests"] : []),
      ...(testTypes.includes("integration") ? ["integration-tests"] : []),
      ...(testTypes.includes("e2e") ? ["e2e-tests"] : []),
      ...(testTypes.includes("visual") ? ["visual-tests"] : []),
      ...(testTypes.includes("performance") ? ["performance-tests"] : []),
      ...(testTypes.includes("accessibility") ? ["accessibility-tests"] : []),
      "test-utils",
      "mocking",
      "coverage",
      ...(includeAutomation ? ["automation"] : []),
    ] as any,
  };

  const options: TestingGenerationOptions = {
    includeExamples: true,
    includeE2E: testTypes.includes("e2e"),
    includeVisualTests: testTypes.includes("visual"),
    includePerformanceTests: testTypes.includes("performance"),
    includeAccessibilityTests: testTypes.includes("accessibility"),
    includeAutomation,
  };

  return generateCompleteTesting(baseConfig, options);
}

// Export examples for usage
export const examples = {
  complete: exampleCompleteTesting,
  vitest: exampleVitestModern,
  basic: exampleBasicTesting,
  cypress: exampleCypressE2E,
  library: exampleLibraryTesting,
  demonstrate: demonstrateTestingUsage,
  generateForCLI,
};
