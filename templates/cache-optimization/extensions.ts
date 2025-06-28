/**
 * Cache Optimization Extensions
 * Advanced features and extensions for cache optimization
 */

import { CacheOptimizationConfig } from "./index";
import { FileTemplate } from "../types";

/**
 * Advanced cache warming extension
 */
export function generateCacheWarmingExtension(config: CacheOptimizationConfig): FileTemplate[] {
  if (!config.features.includes("cache-metrics")) {
    return [];
  }

  return [
    {
      path: "src/lib/cache/cache-warming.ts",
      content: `/**
 * Cache Warming Utilities
 * Pre-populate cache with frequently accessed data
 */

interface WarmingStrategy {
  name: string;
  priority: number;
  urls: string[];
  data?: () => Promise<any>;
}

class CacheWarmer {
  private strategies: WarmingStrategy[] = [];

  addStrategy(strategy: WarmingStrategy) {
    this.strategies.push(strategy);
    this.strategies.sort((a, b) => b.priority - a.priority);
  }

  async warmCache() {
    console.log('🔥 Starting cache warming...');
    
    for (const strategy of this.strategies) {
      try {
        await this.executeStrategy(strategy);
        console.log(\`✅ Warmed cache for strategy: \${strategy.name}\`);
      } catch (error) {
        console.error(\`❌ Failed to warm cache for \${strategy.name}:\`, error);
      }
    }
    
    console.log('🎉 Cache warming completed');
  }

  private async executeStrategy(strategy: WarmingStrategy) {
    // Warm URLs
    if (strategy.urls.length > 0) {
      await Promise.all(
        strategy.urls.map(url => 
          fetch(url, { method: 'HEAD' }).catch(() => {})
        )
      );
    }

    // Warm data
    if (strategy.data) {
      await strategy.data();
    }
  }
}

export const cacheWarmer = new CacheWarmer();

// Default warming strategies
cacheWarmer.addStrategy({
  name: 'critical-pages',
  priority: 10,
  urls: ['/', '/about', '/contact'],
});

cacheWarmer.addStrategy({
  name: 'popular-content',
  priority: 8,
  urls: ['/blog', '/products'],
});`,
    },
    {
      path: "scripts/warm-cache.js",
      content: `#!/usr/bin/env node

/**
 * Cache warming script
 * Run this script to pre-populate cache
 */

const { cacheWarmer } = require('../src/lib/cache/cache-warming');

async function main() {
  try {
    await cacheWarmer.warmCache();
    process.exit(0);
  } catch (error) {
    console.error('Cache warming failed:', error);
    process.exit(1);
  }
}

main();`,
    },
  ];
}

/**
 * Cache analytics extension
 */
export function generateCacheAnalyticsExtension(config: CacheOptimizationConfig): FileTemplate[] {
  if (!config.performance.cacheMetrics) {
    return [];
  }

  return [
    {
      path: "src/lib/cache/analytics.ts",
      content: `/**
 * Cache Analytics
 * Advanced analytics and insights for cache performance
 */

interface CacheAnalytics {
  hitRate: number;
  missRate: number;
  avgResponseTime: number;
  popularKeys: Array<{ key: string; hits: number }>;
  timeDistribution: Record<string, number>;
  errorRate: number;
}

class CacheAnalyticsCollector {
  private events: Array<{
    type: 'hit' | 'miss' | 'set' | 'error';
    key: string;
    timestamp: number;
    duration?: number;
  }> = [];

  recordHit(key: string, duration: number) {
    this.events.push({
      type: 'hit',
      key,
      timestamp: Date.now(),
      duration,
    });
  }

  recordMiss(key: string) {
    this.events.push({
      type: 'miss',
      key,
      timestamp: Date.now(),
    });
  }

  recordSet(key: string) {
    this.events.push({
      type: 'set',
      key,
      timestamp: Date.now(),
    });
  }

  recordError(key: string) {
    this.events.push({
      type: 'error',
      key,
      timestamp: Date.now(),
    });
  }

  getAnalytics(timeWindow = 3600000): CacheAnalytics {
    const now = Date.now();
    const recentEvents = this.events.filter(
      event => now - event.timestamp < timeWindow
    );

    const hits = recentEvents.filter(e => e.type === 'hit');
    const misses = recentEvents.filter(e => e.type === 'miss');
    const errors = recentEvents.filter(e => e.type === 'error');
    const total = hits.length + misses.length;

    // Calculate popular keys
    const keyHits = new Map<string, number>();
    hits.forEach(hit => {
      keyHits.set(hit.key, (keyHits.get(hit.key) || 0) + 1);
    });

    const popularKeys = Array.from(keyHits.entries())
      .map(([key, hits]) => ({ key, hits }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);

    // Calculate time distribution
    const timeDistribution: Record<string, number> = {};
    hits.forEach(hit => {
      if (hit.duration) {
        const bucket = Math.floor(hit.duration / 100) * 100;
        const key = \`\${bucket}-\${bucket + 100}ms\`;
        timeDistribution[key] = (timeDistribution[key] || 0) + 1;
      }
    });

    return {
      hitRate: total > 0 ? hits.length / total : 0,
      missRate: total > 0 ? misses.length / total : 0,
      avgResponseTime: hits.length > 0 
        ? hits.reduce((sum, hit) => sum + (hit.duration || 0), 0) / hits.length 
        : 0,
      popularKeys,
      timeDistribution,
      errorRate: total > 0 ? errors.length / total : 0,
    };
  }

  exportData() {
    return {
      events: this.events,
      analytics: this.getAnalytics(),
      timestamp: Date.now(),
    };
  }

  cleanup(maxAge = 86400000) {
    const cutoff = Date.now() - maxAge;
    this.events = this.events.filter(event => event.timestamp > cutoff);
  }
}

export const cacheAnalytics = new CacheAnalyticsCollector();`,
    },
  ];
}

/**
 * Smart revalidation extension
 */
export function generateSmartRevalidationExtension(config: CacheOptimizationConfig): FileTemplate[] {
  if (!config.revalidation.useRevalidateTag && !config.revalidation.useRevalidatePath) {
    return [];
  }

  return [
    {
      path: "src/lib/revalidation/smart-revalidation.ts",
      content: `/**
 * Smart Revalidation
 * Intelligent cache invalidation based on content relationships
 */

import { revalidatePath, revalidateTag } from 'next/cache';

interface ContentRelationship {
  type: 'parent' | 'child' | 'sibling' | 'dependency';
  source: string;
  target: string;
  weight: number;
}

class SmartRevalidator {
  private relationships: ContentRelationship[] = [];
  private revalidationHistory: Array<{
    trigger: string;
    targets: string[];
    timestamp: number;
    reason: string;
  }> = [];

  addRelationship(relationship: ContentRelationship) {
    this.relationships.push(relationship);
  }

  async revalidateWithDependencies(trigger: string, type: 'path' | 'tag' = 'tag') {
    const targets = this.findRelatedContent(trigger);
    const timestamp = Date.now();

    // Revalidate the trigger
    if (type === 'tag') {
      revalidateTag(trigger);
    } else {
      revalidatePath(trigger);
    }

    // Revalidate related content
    for (const target of targets) {
      if (target.startsWith('/')) {
        revalidatePath(target);
      } else {
        revalidateTag(target);
      }
    }

    // Record revalidation
    this.revalidationHistory.push({
      trigger,
      targets,
      timestamp,
      reason: 'smart-revalidation',
    });

    console.log(\`🔄 Smart revalidation: \${trigger} → [\${targets.join(', ')}]\`);
  }

  private findRelatedContent(source: string): string[] {
    const related = new Set<string>();
    
    // Find direct relationships
    this.relationships
      .filter(rel => rel.source === source)
      .forEach(rel => related.add(rel.target));

    // Find reverse relationships
    this.relationships
      .filter(rel => rel.target === source)
      .forEach(rel => related.add(rel.source));

    return Array.from(related);
  }

  getRevalidationStats() {
    const recent = this.revalidationHistory.filter(
      entry => Date.now() - entry.timestamp < 86400000 // 24 hours
    );

    return {
      total: recent.length,
      triggers: [...new Set(recent.map(entry => entry.trigger))],
      mostRevalidated: this.getMostRevalidated(recent),
      avgTargetsPerRevalidation: recent.length > 0 
        ? recent.reduce((sum, entry) => sum + entry.targets.length, 0) / recent.length 
        : 0,
    };
  }

  private getMostRevalidated(entries: typeof this.revalidationHistory) {
    const counts = new Map<string, number>();
    
    entries.forEach(entry => {
      entry.targets.forEach(target => {
        counts.set(target, (counts.get(target) || 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([target, count]) => ({ target, count }));
  }
}

export const smartRevalidator = new SmartRevalidator();

// Setup common relationships
smartRevalidator.addRelationship({
  type: 'parent',
  source: 'posts',
  target: 'blog',
  weight: 1,
});

smartRevalidator.addRelationship({
  type: 'dependency',
  source: 'user',
  target: 'profile',
  weight: 1,
});`,
    },
  ];
}

/**
 * Performance optimization extension
 */
export function generatePerformanceOptimizationExtension(config: CacheOptimizationConfig): FileTemplate[] {
  return [
    {
      path: "src/lib/optimization/performance-optimizer.ts",
      content: `/**
 * Performance Optimizer
 * Automatic performance optimizations based on metrics
 */

interface OptimizationRule {
  name: string;
  condition: (metrics: any) => boolean;
  action: () => Promise<void>;
  cooldown: number;
  lastExecuted?: number;
}

class PerformanceOptimizer {
  private rules: OptimizationRule[] = [];
  private isRunning = false;

  addRule(rule: OptimizationRule) {
    this.rules.push(rule);
  }

  async optimize(metrics: any) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    const now = Date.now();

    try {
      for (const rule of this.rules) {
        // Check cooldown
        if (rule.lastExecuted && now - rule.lastExecuted < rule.cooldown) {
          continue;
        }

        // Check condition
        if (rule.condition(metrics)) {
          console.log(\`🚀 Applying optimization: \${rule.name}\`);
          await rule.action();
          rule.lastExecuted = now;
        }
      }
    } finally {
      this.isRunning = false;
    }
  }
}

export const performanceOptimizer = new PerformanceOptimizer();

// Default optimization rules
${config.performance.memoryCache ? `
performanceOptimizer.addRule({
  name: 'clear-memory-cache-on-high-usage',
  condition: (metrics) => metrics.memoryUsage > 0.9,
  action: async () => {
    const { memoryCache } = await import('../cache/memory-cache');
    memoryCache.clear();
  },
  cooldown: 300000, // 5 minutes
});` : ''}

${config.performance.cacheMetrics ? `
performanceOptimizer.addRule({
  name: 'increase-cache-ttl-on-high-hit-rate',
  condition: (metrics) => metrics.cacheHitRate > 0.95,
  action: async () => {
    // Increase TTL for popular content
    console.log('📈 Increasing cache TTL for high-performing content');
  },
  cooldown: 3600000, // 1 hour
});` : ''}`,
    },
  ];
}

/**
 * Generate all extensions
 */
export function generateAllExtensions(config: CacheOptimizationConfig): FileTemplate[] {
  return [
    ...generateCacheWarmingExtension(config),
    ...generateCacheAnalyticsExtension(config),
    ...generateSmartRevalidationExtension(config),
    ...generatePerformanceOptimizationExtension(config),
  ];
}
