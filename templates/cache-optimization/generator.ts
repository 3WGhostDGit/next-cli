/**
 * Cache Optimization Template Generator
 * Main generator logic that orchestrates file creation and dependency management
 */

import { FileTemplate } from "../types";
import { CacheOptimizationConfig, CacheOptimizationTemplate, defaultCacheOptimizationConfig } from "./index";
import { 
  generateCacheFiles, 
  generateOptimizationFiles, 
  generateApiFiles, 
  generateConfigFiles,
  generateComponentFiles,
  generateHookFiles
} from "./utilities";
import { generateAllExtensions } from "./extensions";

export interface CacheOptimizationGenerationOptions {
  includeExamples?: boolean;
  includeMetrics?: boolean;
  includeAdvancedOptimizations?: boolean;
  includeRedis?: boolean;
}

/**
 * Generate complete cache optimization template
 */
export function generateCompleteCacheOptimization(
  config: CacheOptimizationConfig = defaultCacheOptimizationConfig,
  options: CacheOptimizationGenerationOptions = {}
): CacheOptimizationTemplate {
  const {
    includeExamples = true,
    includeMetrics = true,
    includeAdvancedOptimizations = false,
    includeRedis = false,
  } = options;

  // Adjust configuration based on options
  const finalConfig: CacheOptimizationConfig = {
    ...config,
    performance: {
      ...config.performance,
      redis: includeRedis || config.performance.redis,
      cacheMetrics: includeMetrics || config.performance.cacheMetrics,
    },
  };

  const files: FileTemplate[] = [];

  // Core files
  files.push(...generateCacheFiles(finalConfig));
  files.push(...generateOptimizationFiles(finalConfig));
  files.push(...generateApiFiles(finalConfig));
  files.push(...generateConfigFiles(finalConfig));

  // React components and hooks
  files.push(...generateComponentFiles(finalConfig));
  files.push(...generateHookFiles(finalConfig));

  // Extensions
  if (includeAdvancedOptimizations) {
    files.push(...generateAllExtensions(finalConfig));
  }

  // Examples
  if (includeExamples) {
    files.push(...generateExampleFiles(finalConfig));
  }

  // Package scripts
  const packageScripts = generatePackageScripts(finalConfig);

  // Dependencies
  const dependencies = generateDependencies(finalConfig);
  const devDependencies = generateDevDependencies(finalConfig);

  // Instructions
  const instructions = generateInstructions(finalConfig, options);

  const directoryStructure = {
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

/**
 * Generate example files
 */
function generateExampleFiles(config: CacheOptimizationConfig): FileTemplate[] {
  return [
    {
      path: "examples/cache-usage.tsx",
      content: generateCacheUsageExample(config),
    },
    {
      path: "examples/optimization-demo.tsx",
      content: generateOptimizationDemo(config),
    },
    {
      path: "examples/performance-monitoring.tsx",
      content: generatePerformanceMonitoringExample(config),
    },
  ];
}

function generateCacheUsageExample(config: CacheOptimizationConfig): string {
  return `/**
 * Cache usage example
 */

import { useCache } from '@/hooks/use-cache';
import { dataCache } from '@/lib/cache';

function BlogPost({ slug }: { slug: string }) {
  const { data, isLoading, error } = useCache(
    \`post-\${slug}\`,
    () => fetchPost(slug),
    { ttl: 3600 }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <article>
      <h1>{data.title}</h1>
      <p>{data.content}</p>
    </article>
  );
}

const getCachedPosts = dataCache(
  async () => {
    const response = await fetch('/api/posts');
    return response.json();
  },
  ['posts'],
  { tags: ['posts'], revalidate: 1800 }
);

async function fetchPost(slug: string) {
  const response = await fetch(\`/api/posts/\${slug}\`);
  return response.json();
}`;
}

function generateOptimizationDemo(config: CacheOptimizationConfig): string {
  return `/**
 * Optimization demo
 */

import { OptimizedImage } from '@/components/optimization/optimized-image';
import { PrefetchLink } from '@/components/optimization/prefetch-link';

export function OptimizationDemo() {
  return (
    <div className="space-y-8">
      <section>
        <h2>Image Optimization</h2>
        <OptimizedImage
          src="/hero.jpg"
          alt="Hero image"
          width={800}
          height={400}
          priority
          quality={85}
        />
      </section>

      <section>
        <h2>Smart Prefetching</h2>
        <nav className="space-x-4">
          <PrefetchLink 
            href="/blog" 
            prefetchStrategy="hover"
            className="text-blue-600 hover:underline"
          >
            Blog
          </PrefetchLink>
        </nav>
      </section>
    </div>
  );
}`;
}

function generatePerformanceMonitoringExample(config: CacheOptimizationConfig): string {
  if (!config.performance.cacheMetrics) {
    return "// Performance monitoring not enabled";
  }

  return `/**
 * Performance monitoring example
 */

import { PerformanceMonitor } from '@/components/optimization/performance-monitor';

export function PerformanceMonitoringExample() {
  return (
    <div className="space-y-6">
      <h1>Performance Dashboard</h1>
      <PerformanceMonitor 
        updateInterval={5000}
        showDetails={true}
      />
    </div>
  );
}`;
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

function generateInstructions(
  config: CacheOptimizationConfig, 
  options: CacheOptimizationGenerationOptions
): string[] {
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
