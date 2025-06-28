/**
 * Testing Extensions
 * Advanced features and extensions for testing setup
 */

import { TestingConfig } from "./index";
import { FileTemplate } from "../types";

/**
 * Visual testing extension
 */
export function generateVisualTestingExtension(config: TestingConfig): FileTemplate[] {
  if (!config.testTypes.visual) {
    return [];
  }

  return [
    {
      path: "tests/visual/visual-test-utils.ts",
      content: `/**
 * Visual Testing Utilities
 * Screenshot comparison and visual regression testing
 */

import { Page } from '@playwright/test';

interface VisualTestOptions {
  threshold?: number;
  maxDiffPixels?: number;
  animations?: 'disabled' | 'allow';
  clip?: { x: number; y: number; width: number; height: number };
}

export class VisualTester {
  constructor(private page: Page) {}

  async compareScreenshot(
    name: string,
    options: VisualTestOptions = {}
  ) {
    const {
      threshold = 0.2,
      maxDiffPixels = 100,
      animations = 'disabled',
      clip,
    } = options;

    // Disable animations for consistent screenshots
    if (animations === 'disabled') {
      await this.page.addStyleTag({
        content: \`
          *, *::before, *::after {
            animation-delay: -1ms !important;
            animation-duration: 1ms !important;
            animation-iteration-count: 1 !important;
            background-attachment: initial !important;
            scroll-behavior: auto !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        \`,
      });
    }

    // Wait for fonts to load
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForFunction(() => document.fonts.ready);

    return this.page.screenshot({
      fullPage: true,
      clip,
      threshold,
      maxDiffPixels,
    });
  }

  async compareElement(
    selector: string,
    name: string,
    options: VisualTestOptions = {}
  ) {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible' });

    return element.screenshot({
      threshold: options.threshold || 0.2,
      maxDiffPixels: options.maxDiffPixels || 100,
    });
  }

  async waitForStableLayout(timeout = 5000) {
    let previousHeight = 0;
    let stableCount = 0;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const currentHeight = await this.page.evaluate(() => document.body.scrollHeight);
      
      if (currentHeight === previousHeight) {
        stableCount++;
        if (stableCount >= 3) break;
      } else {
        stableCount = 0;
      }
      
      previousHeight = currentHeight;
      await this.page.waitForTimeout(100);
    }
  }
}

export const visualTestConfig = {
  threshold: 0.2,
  maxDiffPixels: 100,
  updateSnapshots: process.env.UPDATE_SNAPSHOTS === 'true',
  browsers: ['chromium', 'firefox', 'webkit'],
  viewports: [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' },
  ],
};`,
    },
    {
      path: "e2e/visual/homepage.spec.ts",
      content: `import { test, expect } from '@playwright/test';
import { VisualTester } from '../tests/visual/visual-test-utils';

test.describe('Homepage Visual Tests', () => {
  test('homepage should match screenshot', async ({ page }) => {
    const visualTester = new VisualTester(page);
    
    await page.goto('/');
    await visualTester.waitForStableLayout();
    
    await expect(page).toHaveScreenshot('homepage.png', {
      threshold: 0.2,
      maxDiffPixels: 100,
    });
  });

  test('homepage mobile view should match screenshot', async ({ page }) => {
    const visualTester = new VisualTester(page);
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await visualTester.waitForStableLayout();
    
    await expect(page).toHaveScreenshot('homepage-mobile.png');
  });
});`,
    },
  ];
}

/**
 * Performance testing extension
 */
export function generatePerformanceTestingExtension(config: TestingConfig): FileTemplate[] {
  if (!config.testTypes.performance) {
    return [];
  }

  return [
    {
      path: "tests/performance/lighthouse-utils.ts",
      content: `/**
 * Lighthouse Performance Testing
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

interface LighthouseOptions {
  url: string;
  thresholds: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
}

export class LighthouseRunner {
  async runAudit(options: LighthouseOptions) {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    
    try {
      const runnerResult = await lighthouse(options.url, {
        logLevel: 'info',
        output: 'json',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        port: chrome.port,
      });

      if (!runnerResult) {
        throw new Error('Lighthouse audit failed');
      }

      const scores = {
        performance: runnerResult.lhr.categories.performance?.score * 100 || 0,
        accessibility: runnerResult.lhr.categories.accessibility?.score * 100 || 0,
        bestPractices: runnerResult.lhr.categories['best-practices']?.score * 100 || 0,
        seo: runnerResult.lhr.categories.seo?.score * 100 || 0,
      };

      return {
        scores,
        passed: this.checkThresholds(scores, options.thresholds),
        report: runnerResult.report,
      };
    } finally {
      await chrome.kill();
    }
  }

  private checkThresholds(
    scores: Record<string, number>,
    thresholds: Record<string, number>
  ): boolean {
    return Object.entries(thresholds).every(
      ([category, threshold]) => scores[category] >= threshold
    );
  }
}

export const performanceConfig = {
  thresholds: {
    performance: 90,
    accessibility: 90,
    bestPractices: 90,
    seo: 90,
  },
  webVitals: {
    lcp: 2500, // Largest Contentful Paint
    fid: 100,  // First Input Delay
    cls: 0.1,  // Cumulative Layout Shift
  },
};`,
    },
    {
      path: "e2e/performance/core-web-vitals.spec.ts",
      content: `import { test, expect } from '@playwright/test';

test.describe('Core Web Vitals', () => {
  test('should meet Core Web Vitals thresholds', async ({ page }) => {
    await page.goto('/');

    // Measure Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {};
        
        // LCP - Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // FID - First Input Delay
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            vitals.fid = entry.processingStart - entry.startTime;
          });
        }).observe({ entryTypes: ['first-input'] });

        // CLS - Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          vitals.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });

        setTimeout(() => resolve(vitals), 5000);
      });
    });

    // Assert thresholds
    expect(webVitals.lcp).toBeLessThan(2500); // 2.5 seconds
    expect(webVitals.fid).toBeLessThan(100);  // 100 milliseconds
    expect(webVitals.cls).toBeLessThan(0.1);  // 0.1
  });
});`,
    },
  ];
}

/**
 * Accessibility testing extension
 */
export function generateAccessibilityTestingExtension(config: TestingConfig): FileTemplate[] {
  if (!config.testTypes.accessibility) {
    return [];
  }

  return [
    {
      path: "tests/accessibility/axe-utils.ts",
      content: `/**
 * Accessibility Testing with axe-core
 */

import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

interface AxeOptions {
  tags?: string[];
  rules?: Record<string, { enabled: boolean }>;
  exclude?: string[];
}

export class AccessibilityTester {
  constructor(private page: Page) {}

  async runAxeAudit(options: AxeOptions = {}) {
    const {
      tags = ['wcag2a', 'wcag2aa'],
      rules = {},
      exclude = [],
    } = options;

    const axeBuilder = new AxeBuilder({ page: this.page })
      .withTags(tags)
      .exclude(exclude);

    // Configure rules
    Object.entries(rules).forEach(([ruleId, config]) => {
      if (config.enabled) {
        axeBuilder.enableRules([ruleId]);
      } else {
        axeBuilder.disableRules([ruleId]);
      }
    });

    const results = await axeBuilder.analyze();
    
    return {
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
      inapplicable: results.inapplicable,
      passed: results.violations.length === 0,
    };
  }

  async checkColorContrast() {
    return this.runAxeAudit({
      tags: ['cat.color'],
      rules: {
        'color-contrast': { enabled: true },
        'color-contrast-enhanced': { enabled: true },
      },
    });
  }

  async checkKeyboardNavigation() {
    return this.runAxeAudit({
      tags: ['cat.keyboard'],
      rules: {
        'keyboard': { enabled: true },
        'focus-order-semantics': { enabled: true },
      },
    });
  }

  async checkAriaLabels() {
    return this.runAxeAudit({
      tags: ['cat.aria'],
      rules: {
        'aria-allowed-attr': { enabled: true },
        'aria-required-attr': { enabled: true },
        'aria-valid-attr-value': { enabled: true },
      },
    });
  }
}

export const accessibilityConfig = {
  rules: {
    'color-contrast': 'error',
    'keyboard-navigation': 'error',
    'aria-labels': 'error',
    'heading-order': 'warn',
    'landmark-one-main': 'error',
    'page-has-heading-one': 'error',
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  exclude: [
    '[data-testid="skip-accessibility"]',
    '.third-party-widget',
  ],
};`,
    },
    {
      path: "e2e/accessibility/homepage.spec.ts",
      content: `import { test, expect } from '@playwright/test';
import { AccessibilityTester } from '../tests/accessibility/axe-utils';

test.describe('Homepage Accessibility', () => {
  test('should have no accessibility violations', async ({ page }) => {
    const a11yTester = new AccessibilityTester(page);
    
    await page.goto('/');
    
    const results = await a11yTester.runAxeAudit();
    
    expect(results.violations).toHaveLength(0);
  });

  test('should have proper color contrast', async ({ page }) => {
    const a11yTester = new AccessibilityTester(page);
    
    await page.goto('/');
    
    const results = await a11yTester.checkColorContrast();
    
    expect(results.passed).toBe(true);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    const firstFocusable = await page.locator(':focus');
    expect(firstFocusable).toBeVisible();
    
    // Test skip link
    await page.keyboard.press('Tab');
    const skipLink = page.locator('[href="#main-content"]');
    if (await skipLink.isVisible()) {
      await skipLink.click();
      const mainContent = page.locator('#main-content');
      expect(mainContent).toBeFocused();
    }
  });
});`,
    },
  ];
}

/**
 * Generate all extensions
 */
export function generateAllExtensions(config: TestingConfig): FileTemplate[] {
  return [
    ...generateVisualTestingExtension(config),
    ...generatePerformanceTestingExtension(config),
    ...generateAccessibilityTestingExtension(config),
  ];
}
