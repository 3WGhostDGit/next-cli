/**
 * Testing Template Utilities
 * Helper functions and utility classes for testing setup
 */

import { FileTemplate } from "../types";
import { TestingConfig } from "./index";
import { TEST_FRAMEWORKS, E2E_FRAMEWORKS } from "./types";

/**
 * Generate test configuration files
 */
export function generateTestConfigFiles(config: TestingConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Main test framework configuration
  if (config.framework === "jest") {
    files.push({
      path: "jest.config.js",
      content: generateJestConfig(config),
    });
    files.push({
      path: "jest.setup.js",
      content: generateJestSetup(config),
    });
  } else {
    files.push({
      path: "vitest.config.ts",
      content: generateVitestConfig(config),
    });
    files.push({
      path: "vitest.setup.ts",
      content: generateVitestSetup(config),
    });
  }

  // E2E configuration
  if (config.testTypes.e2e && config.e2eFramework !== "none") {
    if (config.e2eFramework === "playwright") {
      files.push({
        path: "playwright.config.ts",
        content: generatePlaywrightConfig(config),
      });
    } else if (config.e2eFramework === "cypress") {
      files.push({
        path: "cypress.config.ts",
        content: generateCypressConfig(config),
      });
    }
  }

  return files;
}

/**
 * Generate test utility files
 */
export function generateTestUtilFiles(config: TestingConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Test utilities
  files.push({
    path: "tests/utils/test-utils.tsx",
    content: generateTestUtils(config),
  });

  // Custom matchers
  if (config.testingLibrary.jest) {
    files.push({
      path: "tests/utils/custom-matchers.ts",
      content: generateCustomMatchers(config),
    });
  }

  // Test helpers
  files.push({
    path: "tests/utils/test-helpers.ts",
    content: generateTestHelpers(config),
  });

  return files;
}

/**
 * Generate mock files
 */
export function generateMockFiles(config: TestingConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  if (!config.mocking.nextjs && !config.mocking.api && !config.mocking.database) {
    return files;
  }

  // Next.js mocks
  if (config.mocking.nextjs) {
    files.push({
      path: "tests/mocks/next-mocks.ts",
      content: generateNextJSMocks(config),
    });
  }

  // API mocks
  if (config.mocking.api) {
    files.push({
      path: "tests/mocks/api-mocks.ts",
      content: generateAPIMocks(config),
    });
  }

  // Database mocks
  if (config.mocking.database) {
    files.push({
      path: "tests/mocks/database-mocks.ts",
      content: generateDatabaseMocks(config),
    });
  }

  return files;
}

/**
 * Generate example test files
 */
export function generateExampleTestFiles(config: TestingConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Unit test examples
  if (config.testTypes.unit) {
    files.push({
      path: "__tests__/components/example.test.tsx",
      content: generateComponentTest(config),
    });
    files.push({
      path: "__tests__/utils/example.test.ts",
      content: generateUtilTest(config),
    });
  }

  // Integration test examples
  if (config.testTypes.integration) {
    files.push({
      path: "__tests__/integration/api.test.ts",
      content: generateIntegrationTest(config),
    });
  }

  // E2E test examples
  if (config.testTypes.e2e && config.e2eFramework !== "none") {
    if (config.e2eFramework === "playwright") {
      files.push({
        path: "e2e/example.spec.ts",
        content: generatePlaywrightTest(config),
      });
    } else if (config.e2eFramework === "cypress") {
      files.push({
        path: "cypress/e2e/example.cy.ts",
        content: generateCypressTest(config),
      });
    }
  }

  return files;
}

/**
 * Generate Jest configuration
 */
function generateJestConfig(config: TestingConfig): string {
  return `const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)',
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/shared/(.*)$': '<rootDir>/shared/$1',
  },
  ${config.coverage.enabled ? `
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: ${config.coverage.threshold},
      functions: ${config.coverage.threshold},
      lines: ${config.coverage.threshold},
      statements: ${config.coverage.threshold},
    },
  },
  coverageReporters: ${JSON.stringify(config.coverage.reports)},` : ''}
  testTimeout: 10000,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);`;
}

/**
 * Generate Jest setup file
 */
function generateJestSetup(config: TestingConfig): string {
  return `import '@testing-library/jest-dom';
${config.mocking.nextjs ? "import './tests/mocks/next-mocks';" : ""}
${config.testingLibrary.jest ? "import './tests/utils/custom-matchers';" : ""}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});`;
}

/**
 * Generate Vitest configuration
 */
function generateVitestConfig(config: TestingConfig): string {
  return `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)'],
    ${config.coverage.enabled ? `
    coverage: {
      provider: 'v8',
      reporter: ${JSON.stringify(config.coverage.reports)},
      thresholds: {
        lines: ${config.coverage.threshold},
        functions: ${config.coverage.threshold},
        branches: ${config.coverage.threshold},
        statements: ${config.coverage.threshold},
      },
      include: [
        'src/**/*.{js,jsx,ts,tsx}',
        'app/**/*.{js,jsx,ts,tsx}',
        'components/**/*.{js,jsx,ts,tsx}',
        'lib/**/*.{js,jsx,ts,tsx}',
      ],
      exclude: [
        '**/*.d.ts',
        '**/node_modules/**',
        '**/.next/**',
      ],
    },` : ''}
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/app': path.resolve(__dirname, './app'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/shared': path.resolve(__dirname, './shared'),
    },
  },
});`;
}

/**
 * Generate Vitest setup file
 */
function generateVitestSetup(config: TestingConfig): string {
  return `import '@testing-library/jest-dom/vitest';
${config.mocking.nextjs ? "import './tests/mocks/next-mocks';" : ""}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});`;
}

/**
 * Generate test utilities
 */
function generateTestUtils(config: TestingConfig): string {
  return `import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
${config.testingLibrary.user ? "import userEvent from '@testing-library/user-event';" : ""}

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {/* Add your providers here (Theme, Router, etc.) */}
      {children}
    </div>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
${config.testingLibrary.user ? "export { userEvent };" : ""}

// Common test utilities
export const createMockRouter = (router: Partial<any> = {}) => ({
  basePath: '',
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
  ...router,
});

export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0));

// Placeholder implementations for remaining functions
function generateCustomMatchers(config: TestingConfig): string {
  return `// Custom Jest matchers implementation`;
}

function generateTestHelpers(config: TestingConfig): string {
  return `// Test helpers implementation`;
}

function generateNextJSMocks(config: TestingConfig): string {
  return `// Next.js mocks implementation`;
}

function generateAPIMocks(config: TestingConfig): string {
  return `// API mocks implementation`;
}

function generateDatabaseMocks(config: TestingConfig): string {
  return `// Database mocks implementation`;
}

function generateComponentTest(config: TestingConfig): string {
  return `// Component test example`;
}

function generateUtilTest(config: TestingConfig): string {
  return `// Utility test example`;
}

function generateIntegrationTest(config: TestingConfig): string {
  return `// Integration test example`;
}

function generatePlaywrightConfig(config: TestingConfig): string {
  return `// Playwright configuration`;
}

function generateCypressConfig(config: TestingConfig): string {
  return `// Cypress configuration`;
}

function generatePlaywrightTest(config: TestingConfig): string {
  return `// Playwright test example`;
}

function generateCypressTest(config: TestingConfig): string {
  return `// Cypress test example`;
}`;
}
