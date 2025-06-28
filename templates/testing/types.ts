/**
 * Testing Template Types
 * TypeScript type definitions and interfaces for testing configurations
 */

export interface TestFrameworkConfig {
  name: "jest" | "vitest";
  configFile: string;
  setupFile: string;
  testMatch: string[];
  environment: "jsdom" | "node";
}

export interface E2EFrameworkConfig {
  name: "playwright" | "cypress" | "none";
  configFile: string;
  testDir: string;
  supportedBrowsers: string[];
}

export interface CoverageConfig {
  enabled: boolean;
  threshold: {
    global: number;
    functions: number;
    lines: number;
    statements: number;
    branches: number;
  };
  reports: ("text" | "html" | "lcov" | "json" | "clover")[];
  collectFrom: string[];
  exclude: string[];
}

export interface MockConfig {
  nextjs: {
    router: boolean;
    image: boolean;
    link: boolean;
    head: boolean;
  };
  database: {
    prisma: boolean;
    mongoose: boolean;
    drizzle: boolean;
  };
  api: {
    fetch: boolean;
    axios: boolean;
    serverActions: boolean;
  };
  external: {
    stripe: boolean;
    auth0: boolean;
    firebase: boolean;
  };
}

export interface TestUtilsConfig {
  renderUtils: boolean;
  customMatchers: boolean;
  testHelpers: boolean;
  dataFactories: boolean;
  setupHelpers: boolean;
}

export interface AutomationConfig {
  githubActions: {
    enabled: boolean;
    nodeVersions: string[];
    runOn: string[];
    cacheStrategy: "npm" | "yarn" | "pnpm";
  };
  preCommitHooks: {
    enabled: boolean;
    linting: boolean;
    testing: boolean;
    typeChecking: boolean;
  };
  testGeneration: {
    enabled: boolean;
    templates: string[];
    autoUpdate: boolean;
  };
}

export interface TestMetrics {
  coverage: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
  performance: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    duration: number;
  };
  e2e: {
    totalSpecs: number;
    passedSpecs: number;
    failedSpecs: number;
    duration: number;
  };
}

export interface TestSuite {
  name: string;
  type: "unit" | "integration" | "e2e" | "visual" | "performance" | "accessibility";
  files: string[];
  setup?: string;
  teardown?: string;
  timeout?: number;
  retries?: number;
}

export interface TestFixture<T = any> {
  name: string;
  data: T;
  factory?: () => T;
  cleanup?: () => void;
}

export interface MockFactory<T = any> {
  name: string;
  create: (...args: any[]) => T;
  reset: () => void;
  restore: () => void;
}

export interface TestEnvironment {
  name: string;
  setup: () => Promise<void> | void;
  teardown: () => Promise<void> | void;
  globals?: Record<string, any>;
}

export interface VisualTestConfig {
  enabled: boolean;
  threshold: number;
  updateSnapshots: boolean;
  diffThreshold: number;
  browsers: string[];
  viewports: Array<{ width: number; height: number; name: string }>;
}

export interface PerformanceTestConfig {
  enabled: boolean;
  lighthouse: {
    enabled: boolean;
    thresholds: {
      performance: number;
      accessibility: number;
      bestPractices: number;
      seo: number;
    };
  };
  webVitals: {
    enabled: boolean;
    thresholds: {
      lcp: number; // Largest Contentful Paint
      fid: number; // First Input Delay
      cls: number; // Cumulative Layout Shift
    };
  };
}

export interface AccessibilityTestConfig {
  enabled: boolean;
  axeCore: {
    enabled: boolean;
    rules: Record<string, "error" | "warn" | "off">;
    tags: string[];
  };
  lighthouse: {
    enabled: boolean;
    threshold: number;
  };
}

// Test framework configurations
export const TEST_FRAMEWORKS: Record<string, TestFrameworkConfig> = {
  jest: {
    name: "jest",
    configFile: "jest.config.js",
    setupFile: "jest.setup.js",
    testMatch: ["**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)"],
    environment: "jsdom",
  },
  vitest: {
    name: "vitest",
    configFile: "vitest.config.ts",
    setupFile: "vitest.setup.ts",
    testMatch: ["**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)"],
    environment: "jsdom",
  },
};

// E2E framework configurations
export const E2E_FRAMEWORKS: Record<string, E2EFrameworkConfig> = {
  playwright: {
    name: "playwright",
    configFile: "playwright.config.ts",
    testDir: "e2e",
    supportedBrowsers: ["chromium", "firefox", "webkit"],
  },
  cypress: {
    name: "cypress",
    configFile: "cypress.config.ts",
    testDir: "cypress",
    supportedBrowsers: ["chrome", "firefox", "edge"],
  },
  none: {
    name: "none",
    configFile: "",
    testDir: "",
    supportedBrowsers: [],
  },
};

// Default configurations
export const DEFAULT_COVERAGE_CONFIG: CoverageConfig = {
  enabled: true,
  threshold: {
    global: 80,
    functions: 80,
    lines: 80,
    statements: 80,
    branches: 70,
  },
  reports: ["text", "html", "lcov"],
  collectFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
  ],
  exclude: [
    "**/*.d.ts",
    "**/*.config.{js,ts}",
    "**/node_modules/**",
    "**/.next/**",
    "**/coverage/**",
  ],
};

export const DEFAULT_MOCK_CONFIG: MockConfig = {
  nextjs: {
    router: true,
    image: true,
    link: true,
    head: true,
  },
  database: {
    prisma: false,
    mongoose: false,
    drizzle: false,
  },
  api: {
    fetch: true,
    axios: false,
    serverActions: true,
  },
  external: {
    stripe: false,
    auth0: false,
    firebase: false,
  },
};

export const DEFAULT_VISUAL_TEST_CONFIG: VisualTestConfig = {
  enabled: false,
  threshold: 0.2,
  updateSnapshots: false,
  diffThreshold: 0.1,
  browsers: ["chromium"],
  viewports: [
    { width: 1920, height: 1080, name: "desktop" },
    { width: 768, height: 1024, name: "tablet" },
    { width: 375, height: 667, name: "mobile" },
  ],
};

export const DEFAULT_PERFORMANCE_TEST_CONFIG: PerformanceTestConfig = {
  enabled: false,
  lighthouse: {
    enabled: false,
    thresholds: {
      performance: 90,
      accessibility: 90,
      bestPractices: 90,
      seo: 90,
    },
  },
  webVitals: {
    enabled: false,
    thresholds: {
      lcp: 2500, // 2.5 seconds
      fid: 100,  // 100 milliseconds
      cls: 0.1,  // 0.1
    },
  },
};

export const DEFAULT_ACCESSIBILITY_TEST_CONFIG: AccessibilityTestConfig = {
  enabled: false,
  axeCore: {
    enabled: false,
    rules: {
      "color-contrast": "error",
      "keyboard-navigation": "error",
      "aria-labels": "error",
      "heading-order": "warn",
    },
    tags: ["wcag2a", "wcag2aa"],
  },
  lighthouse: {
    enabled: false,
    threshold: 90,
  },
};

export type TestEventType = 
  | "test-started"
  | "test-completed"
  | "test-failed"
  | "suite-started"
  | "suite-completed"
  | "coverage-generated"
  | "snapshot-updated";

export interface TestEvent {
  type: TestEventType;
  timestamp: number;
  testName?: string;
  suiteName?: string;
  duration?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface TestReport {
  summary: TestMetrics;
  suites: TestSuite[];
  events: TestEvent[];
  coverage?: CoverageConfig;
  timestamp: number;
  duration: number;
}
