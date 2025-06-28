/**
 * Cache Optimization Template Types
 * TypeScript type definitions and interfaces for cache optimization
 */

export interface CacheStrategy {
  name: "aggressive" | "balanced" | "minimal";
  description: string;
  ttl: {
    default: number;
    static: number;
    dynamic: number;
  };
  features: string[];
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  avgResponseTime: number;
  totalRequests: number;
  memoryUsage?: number;
  redisConnections?: number;
}

export interface RevalidationOptions {
  type: "tag" | "path" | "smart";
  target: string;
  contentType?: string;
  contentId?: string;
  options?: {
    layout?: boolean;
    tags?: string[];
    paths?: string[];
  };
}

export interface PrefetchOptions {
  priority?: boolean;
  delay?: number;
  condition?: () => boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface StreamingOptions {
  priority?: boolean;
  fallback?: React.ReactNode;
  timeout?: number;
  retryCount?: number;
}

export interface OptimizationMetrics {
  bundleSize: number;
  loadTime: number;
  cacheHitRate: number;
  imageOptimization: {
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
  };
  prefetchStats: {
    totalPrefetches: number;
    successfulPrefetches: number;
    failedPrefetches: number;
  };
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface CacheProvider {
  name: string;
  get<T>(key: string): Promise<T | null> | T | null;
  set<T>(key: string, value: T, ttl?: number, tags?: string[]): Promise<void> | void;
  delete(key: string): Promise<boolean> | boolean;
  clear(): Promise<void> | void;
  getStats(): CacheMetrics;
  deleteByTag?(tag: string): Promise<number> | number;
}

export interface PerformanceMonitorConfig {
  enabled: boolean;
  updateInterval: number;
  metricsRetention: number;
  alertThresholds: {
    cacheHitRate: number;
    responseTime: number;
    memoryUsage: number;
  };
}

export interface ImageOptimizationConfig {
  formats: string[];
  quality: number;
  sizes: string[];
  placeholder: "blur" | "empty";
  priority: boolean;
}

export interface BundleAnalysisConfig {
  enabled: boolean;
  outputPath: string;
  analyzeServer: boolean;
  analyzeBrowser: boolean;
  thresholds: {
    maxBundleSize: number;
    maxChunkSize: number;
  };
}

export interface CompressionConfig {
  enabled: boolean;
  algorithms: ("gzip" | "br" | "deflate")[];
  threshold: number;
  level: number;
}

export interface RedisConfig {
  url: string;
  token?: string;
  maxRetries: number;
  retryDelay: number;
  connectionTimeout: number;
  commandTimeout: number;
}

export interface MemoryCacheConfig {
  maxSize: number;
  maxAge: number;
  updateAgeOnGet: boolean;
  checkPeriod: number;
}

export interface WebhookRevalidationConfig {
  enabled: boolean;
  secret: string;
  endpoints: string[];
  retryAttempts: number;
  timeout: number;
}

export interface CacheConfigurationPreset {
  name: string;
  description: string;
  config: {
    strategy: "aggressive" | "balanced" | "minimal";
    redis: boolean;
    memoryCache: boolean;
    multiLevel: boolean;
    metrics: boolean;
    webhooks: boolean;
  };
  useCases: string[];
  performance: {
    expectedHitRate: number;
    expectedResponseTime: number;
    memoryFootprint: "low" | "medium" | "high";
  };
}

// Cache strategies definitions
export const CACHE_STRATEGIES: Record<string, CacheStrategy> = {
  aggressive: {
    name: "aggressive",
    description: "Maximum performance for high-traffic sites",
    ttl: {
      default: 3600, // 1 hour
      static: 86400, // 24 hours
      dynamic: 300,  // 5 minutes
    },
    features: [
      "multi-level-cache",
      "redis-cache",
      "memory-cache",
      "prefetch",
      "streaming",
      "image-optimization",
      "bundle-analysis",
      "compression",
    ],
  },
  balanced: {
    name: "balanced",
    description: "Balance between performance and simplicity",
    ttl: {
      default: 1800, // 30 minutes
      static: 43200, // 12 hours
      dynamic: 60,   // 1 minute
    },
    features: [
      "memory-cache",
      "prefetch",
      "image-optimization",
      "compression",
    ],
  },
  minimal: {
    name: "minimal",
    description: "Lightweight configuration for prototyping",
    ttl: {
      default: 300,  // 5 minutes
      static: 3600,  // 1 hour
      dynamic: 0,    // No cache
    },
    features: [
      "image-optimization",
    ],
  },
};

// Configuration presets
export const CACHE_PRESETS: CacheConfigurationPreset[] = [
  {
    name: "E-commerce",
    description: "Optimized for online stores with dynamic content",
    config: {
      strategy: "aggressive",
      redis: true,
      memoryCache: true,
      multiLevel: true,
      metrics: true,
      webhooks: true,
    },
    useCases: ["Product catalogs", "Shopping carts", "User sessions"],
    performance: {
      expectedHitRate: 0.85,
      expectedResponseTime: 100,
      memoryFootprint: "high",
    },
  },
  {
    name: "Blog/CMS",
    description: "Content-focused sites with occasional updates",
    config: {
      strategy: "balanced",
      redis: false,
      memoryCache: true,
      multiLevel: false,
      metrics: true,
      webhooks: false,
    },
    useCases: ["Blog posts", "Static pages", "Media content"],
    performance: {
      expectedHitRate: 0.90,
      expectedResponseTime: 150,
      memoryFootprint: "medium",
    },
  },
  {
    name: "SaaS Dashboard",
    description: "Real-time dashboards with user-specific data",
    config: {
      strategy: "balanced",
      redis: true,
      memoryCache: true,
      multiLevel: true,
      metrics: true,
      webhooks: false,
    },
    useCases: ["User dashboards", "Analytics", "Real-time data"],
    performance: {
      expectedHitRate: 0.70,
      expectedResponseTime: 200,
      memoryFootprint: "medium",
    },
  },
  {
    name: "Prototype",
    description: "Quick setup for development and testing",
    config: {
      strategy: "minimal",
      redis: false,
      memoryCache: false,
      multiLevel: false,
      metrics: false,
      webhooks: false,
    },
    useCases: ["Development", "Testing", "MVP"],
    performance: {
      expectedHitRate: 0.50,
      expectedResponseTime: 500,
      memoryFootprint: "low",
    },
  },
];

export type CacheEventType = 
  | "cache-hit"
  | "cache-miss"
  | "cache-set"
  | "cache-delete"
  | "cache-clear"
  | "revalidation-triggered"
  | "prefetch-started"
  | "prefetch-completed"
  | "optimization-applied";

export interface CacheEvent {
  type: CacheEventType;
  timestamp: number;
  key?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface CacheAnalytics {
  events: CacheEvent[];
  metrics: CacheMetrics;
  performance: OptimizationMetrics;
  recommendations: string[];
}
