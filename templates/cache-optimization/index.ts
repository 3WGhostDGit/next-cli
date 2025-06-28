/**
 * Cache Optimization Template
 * Multi-level caching, revalidation, and performance optimizations for Next.js
 */

import { DirectoryStructure, FileTemplate, ProjectConfig } from "../types";

export interface CacheOptimizationConfig extends ProjectConfig {
  caching: {
    strategy: "aggressive" | "balanced" | "minimal";
    dataCache: boolean;
    routerCache: boolean;
    staticGeneration: boolean;
    incrementalStaticRegeneration: boolean;
  };
  revalidation: {
    useRevalidatePath: boolean;
    useRevalidateTag: boolean;
    webhookRevalidation: boolean;
    timeBasedRevalidation: boolean;
  };
  optimization: {
    imageOptimization: boolean;
    bundleAnalyzer: boolean;
    compression: boolean;
    prefetching: boolean;
    streaming: boolean;
    suspense: boolean;
  };
  performance: {
    redis: boolean;
    memoryCache: boolean;
    multiLevelCache: boolean;
    cacheMetrics: boolean;
  };
  features: (
    | "data-cache"
    | "router-cache"
    | "isr"
    | "streaming"
    | "prefetch"
    | "image-optimization"
    | "bundle-analysis"
    | "cache-metrics"
    | "redis-cache"
    | "memory-cache"
    | "webhook-revalidation"
  )[];
}

export interface CacheOptimizationTemplate {
  files: FileTemplate[];
  packageScripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  instructions: string[];
  directoryStructure: DirectoryStructure;
}

/**
 * Default cache optimization configuration
 */
export const defaultCacheOptimizationConfig: CacheOptimizationConfig = {
  projectName: "cache-optimized-app",
  caching: {
    strategy: "balanced",
    dataCache: true,
    routerCache: true,
    staticGeneration: true,
    incrementalStaticRegeneration: true,
  },
  revalidation: {
    useRevalidatePath: true,
    useRevalidateTag: true,
    webhookRevalidation: false,
    timeBasedRevalidation: true,
  },
  optimization: {
    imageOptimization: true,
    bundleAnalyzer: false,
    compression: true,
    prefetching: true,
    streaming: true,
    suspense: true,
  },
  performance: {
    redis: false,
    memoryCache: true,
    multiLevelCache: false,
    cacheMetrics: true,
  },
  features: [
    "data-cache",
    "router-cache",
    "isr",
    "streaming",
    "prefetch",
    "image-optimization",
    "cache-metrics",
    "memory-cache",
  ],
};

/**
 * Generate cache optimization template
 */
export function generateCacheOptimizationTemplate(
  config: CacheOptimizationConfig = defaultCacheOptimizationConfig
): CacheOptimizationTemplate {
  const files: FileTemplate[] = [];
  const packageScripts: Record<string, string> = {};
  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};
  const instructions: string[] = [];

  // Generate files using utilities
  files.push(...generateCacheFiles(config));
  files.push(...generateOptimizationFiles(config));
  files.push(...generateApiFiles(config));
  files.push(...generateConfigFiles(config));

  // Package scripts
  Object.assign(packageScripts, generatePackageScripts(config));
  
  // Dependencies
  Object.assign(dependencies, generateDependencies(config));
  Object.assign(devDependencies, generateDevDependencies(config));
  
  // Instructions
  instructions.push(...generateInstructions(config));

  const directoryStructure: DirectoryStructure = {
    "src/lib/cache": "Cache utilities and configurations",
    "src/lib/optimization": "Performance optimization utilities",
    "src/hooks": "React hooks for caching and performance",
    "components/optimization": "Optimized React components",
    "app/api/cache": "Cache management API routes",
    "app/api/revalidate": "Revalidation API routes",
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
function generateCacheFiles(config: CacheOptimizationConfig): FileTemplate[] {
  // Implementation moved to utilities.ts
  return [];
}

function generateOptimizationFiles(config: CacheOptimizationConfig): FileTemplate[] {
  // Implementation moved to utilities.ts
  return [];
}

function generateApiFiles(config: CacheOptimizationConfig): FileTemplate[] {
  // Implementation moved to utilities.ts
  return [];
}

function generateConfigFiles(config: CacheOptimizationConfig): FileTemplate[] {
  // Implementation moved to utilities.ts
  return [];
}

function generatePackageScripts(config: CacheOptimizationConfig): Record<string, string> {
  const scripts: Record<string, string> = {
    "cache:stats": "node scripts/cache-stats.js",
    "cache:clear": "node scripts/cache-clear.js",
  };

  if (config.optimization.bundleAnalyzer) {
    scripts["analyze"] = "ANALYZE=true npm run build";
  }

  if (config.performance.cacheMetrics) {
    scripts["metrics:cache"] = "node scripts/metrics-cache.js";
  }

  return scripts;
}

function generateDependencies(config: CacheOptimizationConfig): Record<string, string> {
  const deps: Record<string, string> = {
    "@vercel/analytics": "^1.3.0",
    "@vercel/speed-insights": "^1.0.0",
  };

  if (config.performance.redis) {
    deps["@upstash/redis"] = "^1.34.0";
    deps["ioredis"] = "^5.4.0";
  }

  return deps;
}

function generateDevDependencies(config: CacheOptimizationConfig): Record<string, string> {
  const devDeps: Record<string, string> = {};

  if (config.optimization.bundleAnalyzer) {
    devDeps["@next/bundle-analyzer"] = "^14.2.0";
  }

  if (config.optimization.compression) {
    devDeps["compression"] = "^1.7.0";
  }

  return devDeps;
}

function generateInstructions(config: CacheOptimizationConfig): string[] {
  const instructions = [
    "1. Configure environment variables in .env.local",
    "2. Set up cache configuration according to your strategy",
    "3. Configure revalidation endpoints if using webhooks",
  ];

  if (config.performance.redis) {
    instructions.push("4. Set up Redis connection with UPSTASH_REDIS_* variables");
  }

  if (config.performance.cacheMetrics) {
    instructions.push("5. Monitor cache performance with /api/cache/stats");
  }

  return instructions;
}

export * from "./types";
export * from "./utilities";
export * from "./extensions";
