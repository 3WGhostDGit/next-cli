/**
 * Test setup file for Vitest
 * Configures global test environment and utilities
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

// Global test configuration
declare global {
  var testTempDir: string;
  var cleanupFunctions: (() => Promise<void> | void)[];
}

// Setup global test environment
beforeAll(async () => {
  // Create a temporary directory for tests
  global.testTempDir = await mkdtemp(join(tmpdir(), 'next-cli-test-'));
  global.cleanupFunctions = [];
  
  console.log(`🧪 Test environment initialized`);
  console.log(`📁 Temp directory: ${global.testTempDir}`);
});

// Cleanup after each test
afterEach(async () => {
  // Run any cleanup functions registered during the test
  for (const cleanup of global.cleanupFunctions) {
    try {
      await cleanup();
    } catch (error) {
      console.warn('Cleanup function failed:', error);
    }
  }
  global.cleanupFunctions = [];
});

// Global cleanup
afterAll(async () => {
  try {
    // Remove temporary directory
    if (global.testTempDir) {
      await rm(global.testTempDir, { recursive: true, force: true });
      console.log(`🧹 Cleaned up temp directory: ${global.testTempDir}`);
    }
  } catch (error) {
    console.warn('Failed to cleanup temp directory:', error);
  }
});

// Utility functions for tests
export const testUtils = {
  /**
   * Create a temporary directory for a specific test
   */
  async createTempDir(prefix = 'test-'): Promise<string> {
    const tempDir = await mkdtemp(join(global.testTempDir, prefix));
    
    // Register cleanup
    global.cleanupFunctions.push(async () => {
      await rm(tempDir, { recursive: true, force: true });
    });
    
    return tempDir;
  },

  /**
   * Register a cleanup function to run after the test
   */
  registerCleanup(cleanup: () => Promise<void> | void): void {
    global.cleanupFunctions.push(cleanup);
  },

  /**
   * Wait for a specified amount of time
   */
  async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Mock console methods for testing
   */
  mockConsole() {
    const originalConsole = { ...console };
    const logs: string[] = [];
    const errors: string[] = [];
    const warns: string[] = [];

    console.log = (...args) => logs.push(args.join(' '));
    console.error = (...args) => errors.push(args.join(' '));
    console.warn = (...args) => warns.push(args.join(' '));

    // Register cleanup to restore console
    global.cleanupFunctions.push(() => {
      Object.assign(console, originalConsole);
    });

    return {
      logs,
      errors,
      warns,
      restore: () => Object.assign(console, originalConsole)
    };
  }
};

// Export for use in tests
export { beforeAll, afterAll, beforeEach, afterEach };
