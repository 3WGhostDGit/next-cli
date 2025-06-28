# Cache Optimization Template

A comprehensive Next.js template for implementing multi-level caching, performance optimizations, and intelligent revalidation strategies.

## Features

### 🚀 Multi-Level Caching
- **Data Cache**: Next.js `unstable_cache` with tags and revalidation
- **Memory Cache**: LRU cache with TTL support and metrics
- **Redis Cache**: Upstash Redis integration for distributed caching
- **Router Cache**: Optimized page-level caching strategies

### ⚡ Performance Optimizations
- **Image Optimization**: Next.js Image component with smart defaults
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Compression**: Gzip and Brotli compression
- **Prefetching**: Intelligent link prefetching based on user behavior
- **Streaming**: SSR streaming with Suspense boundaries

### 🔄 Smart Revalidation
- **Path Revalidation**: Targeted page invalidation
- **Tag Revalidation**: Content-based cache invalidation
- **Webhook Revalidation**: External trigger support
- **Time-based Revalidation**: Automatic cache refresh

### 📊 Performance Monitoring
- **Real-time Metrics**: Cache hit rates, response times, memory usage
- **Analytics Dashboard**: Performance insights and trends
- **Alert System**: Configurable performance thresholds
- **Export Capabilities**: Metrics data export for analysis

## Configuration Strategies

### Aggressive
Perfect for high-traffic e-commerce sites and applications requiring maximum performance.

```typescript
{
  strategy: "aggressive",
  redis: true,
  multiLevelCache: true,
  bundleAnalyzer: true,
  webhookRevalidation: true
}
```

**Features:**
- Multi-level caching (Memory + Redis)
- Advanced bundle optimization
- Webhook-based revalidation
- Comprehensive monitoring

### Balanced
Ideal for most applications, balancing performance with simplicity.

```typescript
{
  strategy: "balanced",
  redis: false,
  memoryCache: true,
  compression: true,
  prefetching: true
}
```

**Features:**
- Memory caching only
- Image optimization
- Smart prefetching
- Basic monitoring

### Minimal
Lightweight setup for prototypes and development.

```typescript
{
  strategy: "minimal",
  redis: false,
  memoryCache: false,
  imageOptimization: true
}
```

**Features:**
- Basic image optimization
- No complex caching
- Minimal dependencies

## Usage

### Basic Setup

```typescript
import { generateCompleteCacheOptimization } from './generator';
import { exampleBalancedOptimization } from './example';

// Generate template with balanced configuration
const config = exampleBalancedOptimization();
const template = generateCompleteCacheOptimization(config);
```

### Custom Configuration

```typescript
import { CacheOptimizationConfig } from './index';

const customConfig: CacheOptimizationConfig = {
  projectName: "my-app",
  caching: {
    strategy: "aggressive",
    dataCache: true,
    routerCache: true,
    staticGeneration: true,
    incrementalStaticRegeneration: true,
  },
  performance: {
    redis: true,
    memoryCache: true,
    multiLevelCache: true,
    cacheMetrics: true,
  },
  // ... other options
};

const template = generateCompleteCacheOptimization(customConfig, {
  includeRedis: true,
  includeMetrics: true,
  includeAdvancedOptimizations: true,
});
```

### Environment Variables

```env
# Redis (optional)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Revalidation
REVALIDATION_SECRET=your_secret_key

# Analytics
VERCEL_ANALYTICS_ID=your_analytics_id
```

## Generated Files

### Core Cache System
- `src/lib/cache/index.ts` - Main cache utilities
- `src/lib/cache/data-cache.ts` - Next.js data cache wrapper
- `src/lib/cache/memory-cache.ts` - LRU memory cache implementation
- `src/lib/cache/redis-cache.ts` - Redis cache integration
- `src/lib/cache/multi-level-cache.ts` - Multi-level cache orchestration

### Optimization Utilities
- `src/lib/optimization/image-optimization.ts` - Image optimization helpers
- `src/lib/optimization/prefetch-utils.ts` - Smart prefetching utilities
- `src/lib/optimization/streaming-utils.ts` - SSR streaming helpers
- `src/lib/optimization/performance-monitor.ts` - Performance monitoring

### React Components
- `components/optimization/optimized-image.tsx` - Enhanced Image component
- `components/optimization/prefetch-link.tsx` - Smart Link component
- `components/optimization/performance-monitor.tsx` - Monitoring dashboard

### API Routes
- `app/api/cache/route.ts` - Cache management API
- `app/api/cache/stats/route.ts` - Performance metrics API
- `app/api/revalidate/route.ts` - Revalidation webhook API

### Configuration
- `next.config.js` - Next.js configuration with optimizations
- `middleware.ts` - Performance middleware

## API Reference

### Cache Utilities

```typescript
import { dataCache, memoryCache, redisCache } from '@/lib/cache';

// Data cache with Next.js
const getCachedPosts = dataCache(
  async () => fetchPosts(),
  ['posts'],
  { tags: ['posts'], revalidate: 3600 }
);

// Memory cache
memoryCache.set('key', data, 300); // 5 minutes TTL
const data = memoryCache.get('key');

// Redis cache
await redisCache.set('key', data, 3600);
const data = await redisCache.get('key');
```

### React Hooks

```typescript
import { useCache, usePrefetch, usePerformance } from '@/hooks';

// Cache hook
const { data, isLoading, error } = useCache(
  'posts',
  fetchPosts,
  { ttl: 3600 }
);

// Prefetch hook
const { prefetch } = usePrefetch();
prefetch('/blog', { priority: true });

// Performance metrics
const { metrics, history } = usePerformance();
```

### Components

```typescript
import { OptimizedImage, PrefetchLink, PerformanceMonitor } from '@/components/optimization';

// Optimized image
<OptimizedImage
  src="/hero.jpg"
  alt="Hero"
  width={800}
  height={400}
  priority
/>

// Smart prefetch link
<PrefetchLink href="/blog" prefetchStrategy="hover">
  Blog
</PrefetchLink>

// Performance monitoring
<PerformanceMonitor updateInterval={5000} showDetails />
```

## Performance Metrics

The template includes comprehensive performance monitoring:

- **Cache Hit Rate**: Percentage of requests served from cache
- **Response Time**: Average API response times
- **Memory Usage**: Current memory consumption
- **Bundle Size**: JavaScript bundle analysis
- **Core Web Vitals**: LCP, FID, CLS tracking

## Best Practices

1. **Choose the Right Strategy**: Use aggressive for high-traffic sites, balanced for most apps, minimal for prototypes
2. **Monitor Performance**: Enable metrics to track cache effectiveness
3. **Use Tags Wisely**: Implement content-based tagging for smart invalidation
4. **Optimize Images**: Always use the OptimizedImage component
5. **Prefetch Strategically**: Use intersection-based prefetching for better UX
6. **Cache Hierarchically**: Leverage multi-level caching for optimal performance

## Testing

Run the test suite to validate template generation:

```bash
npm test templates/cache-optimization/test.ts
```

The tests cover:
- Template generation with different configurations
- Configuration validation
- File generation based on features
- Package script generation
- Dependency management

## Contributing

When adding new features:

1. Update the configuration interface in `index.ts`
2. Add generation logic in `utilities.ts`
3. Include examples in `example.ts`
4. Add tests in `test.ts`
5. Update this README

## License

MIT License - see LICENSE file for details.
