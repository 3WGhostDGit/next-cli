/**
 * Cache Optimization Schemas
 * Core cache configurations and optimization schemas
 */

import { CacheOptimizationConfig } from "./index";
import { CACHE_STRATEGIES, CACHE_PRESETS } from "./types";

/**
 * Cache configuration schema
 */
export const cacheConfigSchema = {
  // Data cache configuration
  dataCache: {
    enabled: true,
    defaultTTL: 3600,
    tags: {
      posts: ["posts", "content"],
      users: ["users", "auth"],
      products: ["products", "catalog"],
      static: ["static", "layout"],
    },
    revalidation: {
      onDemand: true,
      webhook: false,
      scheduled: false,
    },
  },

  // Router cache configuration
  routerCache: {
    enabled: true,
    staticPages: {
      ttl: 86400, // 24 hours
      paths: ["/", "/about", "/contact"],
    },
    dynamicPages: {
      ttl: 3600, // 1 hour
      patterns: ["/blog/[slug]", "/products/[id]"],
    },
  },

  // ISR configuration
  isr: {
    enabled: true,
    fallback: "blocking",
    revalidate: 3600,
    paths: {
      "/blog": { revalidate: 1800 },
      "/products": { revalidate: 3600 },
      "/": { revalidate: 86400 },
    },
  },

  // Memory cache configuration
  memoryCache: {
    enabled: true,
    maxSize: 1000,
    maxAge: 300,
    checkPeriod: 60,
    algorithms: {
      eviction: "lru",
      compression: false,
    },
  },

  // Redis cache configuration
  redisCache: {
    enabled: false,
    connection: {
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
      maxRetries: 3,
      retryDelay: 1000,
    },
    keyPrefix: "cache:",
    serialization: "json",
    compression: false,
  },
};

/**
 * Image optimization schema
 */
export const imageOptimizationSchema = {
  formats: ["image/webp", "image/avif"],
  quality: {
    default: 75,
    high: 90,
    low: 60,
  },
  sizes: {
    mobile: [320, 640, 750],
    tablet: [768, 1024],
    desktop: [1200, 1920, 2048],
  },
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  domains: [],
  remotePatterns: [
    {
      protocol: "https",
      hostname: "**",
    },
  ],
  minimumCacheTTL: 31536000, // 1 year
  dangerouslyAllowSVG: true,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
};

/**
 * Performance monitoring schema
 */
export const performanceMonitoringSchema = {
  metrics: {
    enabled: true,
    retention: 86400, // 24 hours
    sampling: {
      rate: 1.0, // 100% sampling
      maxEvents: 10000,
    },
    thresholds: {
      cacheHitRate: 0.8,
      responseTime: 200,
      memoryUsage: 0.8,
      errorRate: 0.01,
    },
  },
  alerts: {
    enabled: false,
    channels: ["email", "webhook"],
    conditions: {
      lowCacheHitRate: {
        threshold: 0.5,
        duration: 300, // 5 minutes
      },
      highResponseTime: {
        threshold: 1000, // 1 second
        duration: 180, // 3 minutes
      },
      highMemoryUsage: {
        threshold: 0.9,
        duration: 60, // 1 minute
      },
    },
  },
  reporting: {
    enabled: true,
    interval: 3600, // 1 hour
    format: "json",
    destinations: ["console", "file"],
  },
};

/**
 * Bundle optimization schema
 */
export const bundleOptimizationSchema = {
  analyzer: {
    enabled: false,
    openAnalyzer: false,
    analyzerMode: "static",
    reportFilename: "bundle-report.html",
    thresholds: {
      maxBundleSize: 500000, // 500KB
      maxChunkSize: 200000,  // 200KB
    },
  },
  compression: {
    enabled: true,
    algorithms: ["gzip", "br"],
    threshold: 1024, // 1KB
    level: 6,
  },
  splitting: {
    chunks: "all",
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: "vendors",
        chunks: "all",
      },
      common: {
        name: "common",
        minChunks: 2,
        chunks: "all",
        enforce: true,
      },
    },
  },
};

/**
 * Prefetch optimization schema
 */
export const prefetchOptimizationSchema = {
  strategies: {
    hover: {
      enabled: true,
      delay: 100,
      threshold: 0.1,
    },
    intersection: {
      enabled: true,
      rootMargin: "50px",
      threshold: 0.1,
    },
    immediate: {
      enabled: false,
      priority: true,
    },
    smart: {
      enabled: true,
      userBehavior: true,
      networkAware: true,
    },
  },
  limits: {
    concurrent: 3,
    maxAge: 300, // 5 minutes
    maxSize: 50, // 50 prefetched resources
  },
  conditions: {
    networkSpeed: ["4g", "3g"],
    saveData: false,
    battery: {
      level: 0.2, // 20%
      charging: false,
    },
  },
};

/**
 * Streaming optimization schema
 */
export const streamingOptimizationSchema = {
  ssr: {
    enabled: true,
    suspense: true,
    streaming: true,
    selectiveHydration: true,
  },
  components: {
    priority: {
      above_fold: ["header", "hero", "navigation"],
      below_fold: ["footer", "sidebar", "comments"],
    },
    lazy: {
      threshold: 0.1,
      rootMargin: "100px",
    },
  },
  chunks: {
    size: 10,
    timeout: 5000,
    retries: 3,
  },
};

/**
 * Generate cache configuration based on strategy
 */
export function generateCacheConfig(strategy: keyof typeof CACHE_STRATEGIES): typeof cacheConfigSchema {
  const strategyConfig = CACHE_STRATEGIES[strategy];
  
  return {
    ...cacheConfigSchema,
    dataCache: {
      ...cacheConfigSchema.dataCache,
      defaultTTL: strategyConfig.ttl.default,
    },
    routerCache: {
      ...cacheConfigSchema.routerCache,
      staticPages: {
        ...cacheConfigSchema.routerCache.staticPages,
        ttl: strategyConfig.ttl.static,
      },
      dynamicPages: {
        ...cacheConfigSchema.routerCache.dynamicPages,
        ttl: strategyConfig.ttl.dynamic,
      },
    },
    isr: {
      ...cacheConfigSchema.isr,
      revalidate: strategyConfig.ttl.default,
    },
  };
}

/**
 * Validate cache configuration
 */
export function validateCacheConfig(config: CacheOptimizationConfig): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate Redis configuration
  if (config.performance.redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      errors.push("UPSTASH_REDIS_REST_URL is required when Redis is enabled");
    }
    if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
      errors.push("UPSTASH_REDIS_REST_TOKEN is required when Redis is enabled");
    }
  }

  // Validate multi-level cache
  if (config.performance.multiLevelCache && !config.performance.redis) {
    warnings.push("Multi-level cache requires Redis to be effective");
  }

  // Validate webhook revalidation
  if (config.revalidation.webhookRevalidation && !process.env.REVALIDATION_SECRET) {
    errors.push("REVALIDATION_SECRET is required for webhook revalidation");
  }

  // Validate bundle analyzer
  if (config.optimization.bundleAnalyzer && config.caching.strategy === "minimal") {
    warnings.push("Bundle analyzer may not be necessary for minimal strategy");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get recommended configuration for use case
 */
export function getRecommendedConfig(useCase: string): CacheOptimizationConfig | null {
  const preset = CACHE_PRESETS.find(p => 
    p.useCases.some(uc => uc.toLowerCase().includes(useCase.toLowerCase()))
  );

  if (!preset) return null;

  return {
    projectName: `${useCase}-app`,
    caching: {
      strategy: preset.config.strategy,
      dataCache: true,
      routerCache: true,
      staticGeneration: true,
      incrementalStaticRegeneration: preset.config.strategy !== "minimal",
    },
    revalidation: {
      useRevalidatePath: true,
      useRevalidateTag: preset.config.strategy !== "minimal",
      webhookRevalidation: preset.config.webhooks,
      timeBasedRevalidation: true,
    },
    optimization: {
      imageOptimization: true,
      bundleAnalyzer: preset.config.strategy === "aggressive",
      compression: preset.config.strategy !== "minimal",
      prefetching: preset.config.strategy !== "minimal",
      streaming: preset.config.strategy !== "minimal",
      suspense: preset.config.strategy !== "minimal",
    },
    performance: {
      redis: preset.config.redis,
      memoryCache: preset.config.memoryCache,
      multiLevelCache: preset.config.multiLevel,
      cacheMetrics: preset.config.metrics,
    },
    features: [
      "data-cache",
      ...(preset.config.strategy !== "minimal" ? ["router-cache"] : []),
      ...(preset.config.strategy === "aggressive" ? ["isr"] : []),
      "image-optimization",
      ...(preset.config.metrics ? ["cache-metrics"] : []),
      ...(preset.config.redis ? ["redis-cache"] : []),
      ...(preset.config.memoryCache ? ["memory-cache"] : []),
    ] as any,
  };
}
