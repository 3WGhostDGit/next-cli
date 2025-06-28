/**
 * Testing Schemas
 * Core testing configurations and framework schemas
 */

import { TestingConfig } from "./index";
import { TEST_FRAMEWORKS, E2E_FRAMEWORKS, DEFAULT_COVERAGE_CONFIG } from "./types";

/**
 * Jest configuration schema
 */
export const jestConfigSchema = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: [
    "**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)",
    "**/*.(test|spec).(js|jsx|ts|tsx)",
  ],
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/app/(.*)$": "<rootDir>/app/$1",
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/shared/(.*)$": "<rootDir>/shared/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 10000,
  maxWorkers: "50%",
};

/**
 * Vitest configuration schema
 */
export const vitestConfigSchema = {
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      include: [
        "src/**/*.{js,jsx,ts,tsx}",
        "app/**/*.{js,jsx,ts,tsx}",
        "components/**/*.{js,jsx,ts,tsx}",
        "lib/**/*.{js,jsx,ts,tsx}",
      ],
      exclude: [
        "**/*.d.ts",
        "**/node_modules/**",
        "**/.next/**",
      ],
    },
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": "./src",
      "@/app": "./app",
      "@/components": "./components",
      "@/lib": "./lib",
      "@/shared": "./shared",
    },
  },
};

/**
 * Playwright configuration schema
 */
export const playwrightConfigSchema = {
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: true,
  retries: 2,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
    {
      name: "firefox",
      use: { browserName: "firefox" },
    },
    {
      name: "webkit",
      use: { browserName: "webkit" },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
};

/**
 * Cypress configuration schema
 */
export const cypressConfigSchema = {
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    specPattern: "**/*.cy.{js,jsx,ts,tsx}",
  },
};

/**
 * GitHub Actions workflow schema
 */
export const githubActionsSchema = {
  name: "Tests",
  on: {
    push: {
      branches: ["main", "develop"],
    },
    pull_request: {
      branches: ["main", "develop"],
    },
  },
  jobs: {
    test: {
      "runs-on": "ubuntu-latest",
      strategy: {
        matrix: {
          "node-version": ["18.x", "20.x"],
        },
      },
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "Setup Node.js",
          uses: "actions/setup-node@v4",
          with: {
            "node-version": "${{ matrix.node-version }}",
            cache: "pnpm",
          },
        },
        {
          name: "Install dependencies",
          run: "pnpm install --frozen-lockfile",
        },
        {
          name: "Run linting",
          run: "pnpm lint",
        },
        {
          name: "Run type checking",
          run: "pnpm type-check",
        },
        {
          name: "Run unit tests",
          run: "pnpm test:ci",
        },
      ],
    },
  },
};

/**
 * Lint-staged configuration schema
 */
export const lintStagedSchema = {
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write",
    "pnpm test:related",
  ],
  "*.{css,scss,sass}": [
    "stylelint --fix",
    "prettier --write",
  ],
  "*.{md,mdx}": [
    "prettier --write",
  ],
  "*.json": [
    "prettier --write",
  ],
};

/**
 * Generate test configuration based on framework
 */
export function generateTestConfig(framework: keyof typeof TEST_FRAMEWORKS): any {
  const frameworkConfig = TEST_FRAMEWORKS[framework];
  
  if (framework === "jest") {
    return jestConfigSchema;
  } else {
    return vitestConfigSchema;
  }
}

/**
 * Validate testing configuration
 */
export function validateTestingConfig(config: TestingConfig): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate framework
  if (!TEST_FRAMEWORKS[config.framework]) {
    errors.push(`Unsupported test framework: ${config.framework}`);
  }

  // Validate E2E framework
  if (config.testTypes.e2e && !E2E_FRAMEWORKS[config.e2eFramework]) {
    errors.push(`Unsupported E2E framework: ${config.e2eFramework}`);
  }

  // Validate coverage threshold
  if (config.coverage.enabled && (config.coverage.threshold < 0 || config.coverage.threshold > 100)) {
    errors.push("Coverage threshold must be between 0 and 100");
  }

  // Validate test types
  const hasAnyTestType = Object.values(config.testTypes).some(enabled => enabled);
  if (!hasAnyTestType) {
    warnings.push("No test types are enabled");
  }

  // Validate E2E setup
  if (config.testTypes.e2e && config.e2eFramework === "none") {
    warnings.push("E2E tests are enabled but no E2E framework is selected");
  }

  // Validate automation setup
  if (config.automation.preCommitHooks && !config.testTypes.unit) {
    warnings.push("Pre-commit hooks are enabled but unit tests are disabled");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get recommended configuration for project type
 */
export function getRecommendedTestConfig(projectType: string): TestingConfig | null {
  const configs: Record<string, Partial<TestingConfig>> = {
    "library": {
      framework: "vitest",
      testTypes: {
        unit: true,
        integration: false,
        e2e: false,
        visual: false,
        performance: false,
        accessibility: false,
      },
      coverage: {
        enabled: true,
        threshold: 90,
        reports: ["text", "html", "lcov"],
      },
    },
    "web-app": {
      framework: "jest",
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
        threshold: 80,
        reports: ["text", "html", "lcov"],
      },
    },
    "e-commerce": {
      framework: "jest",
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
        threshold: 85,
        reports: ["text", "html", "lcov", "json"],
      },
    },
    "prototype": {
      framework: "vitest",
      testTypes: {
        unit: true,
        integration: false,
        e2e: false,
        visual: false,
        performance: false,
        accessibility: false,
      },
      coverage: {
        enabled: false,
        threshold: 70,
        reports: ["text"],
      },
    },
  };

  const baseConfig = configs[projectType.toLowerCase()];
  if (!baseConfig) return null;

  return {
    projectName: `${projectType}-app`,
    framework: baseConfig.framework || "jest",
    testingLibrary: {
      react: true,
      user: true,
      jest: true,
    },
    testTypes: baseConfig.testTypes || {
      unit: true,
      integration: false,
      e2e: false,
      visual: false,
      performance: false,
      accessibility: false,
    },
    e2eFramework: baseConfig.e2eFramework || "none",
    coverage: baseConfig.coverage || DEFAULT_COVERAGE_CONFIG,
    mocking: {
      nextjs: true,
      database: baseConfig.testTypes?.integration || false,
      api: true,
      external: false,
    },
    automation: {
      githubActions: projectType !== "prototype",
      preCommitHooks: projectType !== "prototype",
      testGeneration: false,
      snapshotTesting: baseConfig.testTypes?.unit || false,
    },
    features: [
      "unit-tests",
      ...(baseConfig.testTypes?.integration ? ["integration-tests"] : []),
      ...(baseConfig.testTypes?.e2e ? ["e2e-tests"] : []),
      ...(baseConfig.testTypes?.visual ? ["visual-tests"] : []),
      ...(baseConfig.testTypes?.performance ? ["performance-tests"] : []),
      ...(baseConfig.testTypes?.accessibility ? ["accessibility-tests"] : []),
      "test-utils",
      "mocking",
      ...(baseConfig.coverage?.enabled ? ["coverage"] : []),
      ...(projectType !== "prototype" ? ["automation"] : []),
    ] as any,
  };
}
