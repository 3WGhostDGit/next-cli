/**
 * Cache Optimization Template Utilities
 * Helper functions and utility classes for cache optimization
 */

import { FileTemplate } from "../types";
import { CacheOptimizationConfig } from "./index";
import { CacheStrategy, CACHE_STRATEGIES } from "./types";

/**
 * Generate cache-related files
 */
export function generateCacheFiles(config: CacheOptimizationConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Main cache index
  files.push({
    path: "src/lib/cache/index.ts",
    content: generateCacheIndex(config),
  });

  // Data cache utilities
  if (config.caching.dataCache) {
    files.push({
      path: "src/lib/cache/data-cache.ts",
      content: generateDataCache(config),
    });
  }

  // Memory cache
  if (config.performance.memoryCache) {
    files.push({
      path: "src/lib/cache/memory-cache.ts",
      content: generateMemoryCache(config),
    });
  }

  // Redis cache
  if (config.performance.redis) {
    files.push({
      path: "src/lib/cache/redis-cache.ts",
      content: generateRedisCache(config),
    });
  }

  // Multi-level cache
  if (config.performance.multiLevelCache) {
    files.push({
      path: "src/lib/cache/multi-level-cache.ts",
      content: generateMultiLevelCache(config),
    });
  }

  return files;
}

/**
 * Generate optimization-related files
 */
export function generateOptimizationFiles(config: CacheOptimizationConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Optimization index
  files.push({
    path: "src/lib/optimization/index.ts",
    content: generateOptimizationIndex(config),
  });

  // Image optimization
  if (config.optimization.imageOptimization) {
    files.push({
      path: "src/lib/optimization/image-optimization.ts",
      content: generateImageOptimization(config),
    });
  }

  // Prefetch utilities
  if (config.optimization.prefetching) {
    files.push({
      path: "src/lib/optimization/prefetch-utils.ts",
      content: generatePrefetchUtils(config),
    });
  }

  // Streaming utilities
  if (config.optimization.streaming) {
    files.push({
      path: "src/lib/optimization/streaming-utils.ts",
      content: generateStreamingUtils(config),
    });
  }

  // Performance monitor
  if (config.performance.cacheMetrics) {
    files.push({
      path: "src/lib/optimization/performance-monitor.ts",
      content: generatePerformanceMonitor(config),
    });
  }

  return files;
}

/**
 * Generate API route files
 */
export function generateApiFiles(config: CacheOptimizationConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Cache management API
  files.push({
    path: "app/api/cache/route.ts",
    content: generateCacheApi(config),
  });

  // Cache stats API
  if (config.performance.cacheMetrics) {
    files.push({
      path: "app/api/cache/stats/route.ts",
      content: generateCacheStatsApi(config),
    });
  }

  // Revalidation API
  if (config.revalidation.webhookRevalidation) {
    files.push({
      path: "app/api/revalidate/route.ts",
      content: generateRevalidationApi(config),
    });
  }

  return files;
}

/**
 * Generate configuration files
 */
export function generateConfigFiles(config: CacheOptimizationConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Next.js configuration
  files.push({
    path: "next.config.js",
    content: generateNextConfig(config),
  });

  // Middleware
  files.push({
    path: "middleware.ts",
    content: generateMiddleware(config),
  });

  return files;
}

/**
 * Generate React components
 */
export function generateComponentFiles(config: CacheOptimizationConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Optimized Image component
  if (config.optimization.imageOptimization) {
    files.push({
      path: "components/optimization/optimized-image.tsx",
      content: generateOptimizedImageComponent(config),
    });
  }

  // Prefetch Link component
  if (config.optimization.prefetching) {
    files.push({
      path: "components/optimization/prefetch-link.tsx",
      content: generatePrefetchLinkComponent(config),
    });
  }

  // Performance Monitor component
  if (config.performance.cacheMetrics) {
    files.push({
      path: "components/optimization/performance-monitor.tsx",
      content: generatePerformanceMonitorComponent(config),
    });
  }

  return files;
}

/**
 * Generate React hooks
 */
export function generateHookFiles(config: CacheOptimizationConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Cache hook
  files.push({
    path: "hooks/use-cache.ts",
    content: generateUseCacheHook(config),
  });

  // Prefetch hook
  if (config.optimization.prefetching) {
    files.push({
      path: "hooks/use-prefetch.ts",
      content: generateUsePrefetchHook(config),
    });
  }

  // Performance hook
  if (config.performance.cacheMetrics) {
    files.push({
      path: "hooks/use-performance.ts",
      content: generateUsePerformanceHook(config),
    });
  }

  return files;
}

/**
 * Utility functions for generating file content
 */

function generateCacheIndex(config: CacheOptimizationConfig): string {
  const strategy = CACHE_STRATEGIES[config.caching.strategy];
  
  return `/**
 * Cache System Index
 * Main entry point for cache utilities
 */

export * from './data-cache';
${config.performance.memoryCache ? "export * from './memory-cache';" : ""}
${config.performance.redis ? "export * from './redis-cache';" : ""}
${config.performance.multiLevelCache ? "export * from './multi-level-cache';" : ""}

// Cache configuration
export const cacheConfig = {
  strategy: '${config.caching.strategy}',
  ttl: {
    default: ${strategy.ttl.default},
    static: ${strategy.ttl.static},
    dynamic: ${strategy.ttl.dynamic},
  },
  features: ${JSON.stringify(strategy.features, null, 2)},
} as const;`;
}

function generateDataCache(config: CacheOptimizationConfig): string {
  return `import { unstable_cache } from 'next/cache';

/**
 * Next.js Data Cache utilities
 */

interface CacheOptions {
  tags?: string[];
  revalidate?: number;
}

/**
 * Create a cached function with Next.js data cache
 */
export function dataCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyParts: string[],
  options: CacheOptions = {}
): T {
  const { tags = [], revalidate = ${CACHE_STRATEGIES[config.caching.strategy].ttl.default} } = options;
  
  return unstable_cache(fn, keyParts, {
    tags,
    revalidate,
  }) as T;
}

/**
 * Public cache for static data
 */
export const publicCache = {
  get: <T>(fn: () => Promise<T>, key: string[], options?: CacheOptions) => {
    return dataCache(fn, key, options)();
  },
};

/**
 * Private cache for user-specific data
 */
export const privateCache = {
  get: <T>(fn: () => Promise<T>, key: string[], userId: string, options?: CacheOptions) => {
    return dataCache(fn, [...key, userId], options)();
  },
};`;
}

function generateMemoryCache(config: CacheOptimizationConfig): string {
  return `/**
 * Memory Cache Implementation
 * LRU cache with TTL support
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  tags?: string[];
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 1000;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  };

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.value;
  }

  set<T>(key: string, value: T, ttl = 300, tags?: string[]): void {
    // Cleanup if at max size
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
      tags,
    });

    this.stats.sets++;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  deleteByTag(tag: string): number {
    let deleted = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.includes(tag)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    return deleted;
  }
}

export const memoryCache = new MemoryCache();`;
}

function generateRedisCache(config: CacheOptimizationConfig): string {
  return `import { Redis } from '@upstash/redis';

/**
 * Redis Cache Implementation
 */

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

class RedisCache {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value as T;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl = 300, tags?: string[]): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
      
      // Store tags for invalidation
      if (tags) {
        for (const tag of tags) {
          await redis.sadd(\`tag:\${tag}\`, key);
          await redis.expire(\`tag:\${tag}\`, ttl);
        }
      }
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const result = await redis.del(key);
      return result > 0;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      await redis.flushall();
    } catch (error) {
      console.error('Redis clear error:', error);
    }
  }

  async deleteByTag(tag: string): Promise<number> {
    try {
      const keys = await redis.smembers(\`tag:\${tag}\`);
      if (keys.length > 0) {
        await redis.del(...keys);
        await redis.del(\`tag:\${tag}\`);
      }
      return keys.length;
    } catch (error) {
      console.error('Redis deleteByTag error:', error);
      return 0;
    }
  }

  async getStats() {
    try {
      const info = await redis.info();
      // Parse Redis info for stats
      return {
        connected: true,
        memory: 0, // Parse from info
        keys: 0,   // Parse from info
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
      };
    }
  }
}

export const redisCache = new RedisCache();

function generateMultiLevelCache(config: CacheOptimizationConfig): string {
  return `/**
 * Multi-Level Cache Implementation
 * Memory cache with Redis fallback
 */

import { memoryCache } from './memory-cache';
import { redisCache } from './redis-cache';

class MultiLevelCache {
  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    let value = memoryCache.get<T>(key);
    if (value !== null) {
      return value;
    }

    // Fallback to Redis
    value = await redisCache.get<T>(key);
    if (value !== null) {
      // Populate memory cache
      memoryCache.set(key, value);
      return value;
    }

    return null;
  }

  async set<T>(key: string, value: T, ttl = 300, tags?: string[]): Promise<void> {
    // Set in both caches
    memoryCache.set(key, value, ttl, tags);
    await redisCache.set(key, value, ttl, tags);
  }

  async delete(key: string): Promise<boolean> {
    const memoryDeleted = memoryCache.delete(key);
    const redisDeleted = await redisCache.delete(key);
    return memoryDeleted || redisDeleted;
  }

  async clear(): Promise<void> {
    memoryCache.clear();
    await redisCache.clear();
  }
}

export const multiLevelCache = new MultiLevelCache();`;
}

function generateOptimizationIndex(config: CacheOptimizationConfig): string {
  const exports: string[] = [];

  if (config.optimization.imageOptimization) {
    exports.push("export * from './image-optimization';");
  }
  if (config.optimization.prefetching) {
    exports.push("export * from './prefetch-utils';");
  }
  if (config.optimization.streaming) {
    exports.push("export * from './streaming-utils';");
  }
  if (config.performance.cacheMetrics) {
    exports.push("export * from './performance-monitor';");
  }

  return `/**
 * Optimization utilities index
 */

${exports.join('\n')}

export const optimizationConfig = {
  imageOptimization: ${config.optimization.imageOptimization},
  bundleAnalyzer: ${config.optimization.bundleAnalyzer},
  compression: ${config.optimization.compression},
  prefetching: ${config.optimization.prefetching},
  streaming: ${config.optimization.streaming},
  suspense: ${config.optimization.suspense},
} as const;`;
}

function generateImageOptimization(config: CacheOptimizationConfig): string {
  return `import Image from 'next/image';
import { ComponentProps } from 'react';

/**
 * Image optimization utilities
 */

interface OptimizedImageProps extends Omit<ComponentProps<typeof Image>, 'src'> {
  src: string;
  alt: string;
  priority?: boolean;
  quality?: number;
}

export function OptimizedImage({
  src,
  alt,
  priority = false,
  quality = 75,
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      priority={priority}
      quality={quality}
      {...props}
    />
  );
}

export const imageSizes = {
  mobile: '(max-width: 768px) 100vw',
  tablet: '(max-width: 1024px) 50vw',
  desktop: '33vw',
  hero: '(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw',
};

// Placeholder implementations for remaining functions
function generatePrefetchUtils(config: CacheOptimizationConfig): string {
  return `// Prefetch utilities implementation`;
}

function generateStreamingUtils(config: CacheOptimizationConfig): string {
  return `// Streaming utilities implementation`;
}

function generatePerformanceMonitor(config: CacheOptimizationConfig): string {
  return `// Performance monitor implementation`;
}

function generateCacheApi(config: CacheOptimizationConfig): string {
  return `// Cache API implementation`;
}

function generateCacheStatsApi(config: CacheOptimizationConfig): string {
  return `// Cache stats API implementation`;
}

function generateRevalidationApi(config: CacheOptimizationConfig): string {
  return `// Revalidation API implementation`;
}

function generateNextConfig(config: CacheOptimizationConfig): string {
  return `// Next.js configuration`;
}

function generateMiddleware(config: CacheOptimizationConfig): string {
  return `// Middleware implementation`;
}

function generateOptimizedImageComponent(config: CacheOptimizationConfig): string {
  return `// Optimized Image component`;
}

function generatePrefetchLinkComponent(config: CacheOptimizationConfig): string {
  return `// Prefetch Link component`;
}

function generatePerformanceMonitorComponent(config: CacheOptimizationConfig): string {
  return `// Performance Monitor component`;
}

function generateUseCacheHook(config: CacheOptimizationConfig): string {
  return `// useCache hook implementation`;
}

function generateUsePrefetchHook(config: CacheOptimizationConfig): string {
  return `// usePrefetch hook implementation`;
}

function generateUsePerformanceHook(config: CacheOptimizationConfig): string {
  return `// usePerformance hook implementation`;
}`;
}
}`;
}
