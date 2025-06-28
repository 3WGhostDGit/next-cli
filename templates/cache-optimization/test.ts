/**
 * Cache Optimization Template Tests
 * Comprehensive test suite validating template generation and functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { generateCompleteCacheOptimization } from './generator';
import { defaultCacheOptimizationConfig, CacheOptimizationConfig } from './index';
import { validateCacheConfig, getRecommendedConfig } from './schemas';
import { exampleAggressiveCaching, exampleBalancedOptimization, exampleMinimalCaching } from './example';

describe('Cache Optimization Template', () => {
  describe('Template Generation', () => {
    it('should generate template with default configuration', () => {
      const template = generateCompleteCacheOptimization();
      
      expect(template).toBeDefined();
      expect(template.files).toBeInstanceOf(Array);
      expect(template.files.length).toBeGreaterThan(0);
      expect(template.packageScripts).toBeDefined();
      expect(template.dependencies).toBeDefined();
      expect(template.devDependencies).toBeDefined();
      expect(template.instructions).toBeInstanceOf(Array);
      expect(template.directoryStructure).toBeDefined();
    });

    it('should generate different files based on configuration', () => {
      const minimalConfig = exampleMinimalCaching();
      const aggressiveConfig = exampleAggressiveCaching();

      const minimalTemplate = generateCompleteCacheOptimization(minimalConfig);
      const aggressiveTemplate = generateCompleteCacheOptimization(aggressiveConfig);

      expect(aggressiveTemplate.files.length).toBeGreaterThan(minimalTemplate.files.length);
      expect(Object.keys(aggressiveTemplate.dependencies).length).toBeGreaterThan(
        Object.keys(minimalTemplate.dependencies).length
      );
    });

    it('should include Redis dependencies when Redis is enabled', () => {
      const config: CacheOptimizationConfig = {
        ...defaultCacheOptimizationConfig,
        performance: {
          ...defaultCacheOptimizationConfig.performance,
          redis: true,
        },
      };

      const template = generateCompleteCacheOptimization(config);
      
      expect(template.dependencies['@upstash/redis']).toBeDefined();
      expect(template.dependencies['ioredis']).toBeDefined();
    });

    it('should include bundle analyzer when enabled', () => {
      const config: CacheOptimizationConfig = {
        ...defaultCacheOptimizationConfig,
        optimization: {
          ...defaultCacheOptimizationConfig.optimization,
          bundleAnalyzer: true,
        },
      };

      const template = generateCompleteCacheOptimization(config);
      
      expect(template.devDependencies['@next/bundle-analyzer']).toBeDefined();
      expect(template.packageScripts['analyze']).toBeDefined();
    });
  });

  describe('Configuration Validation', () => {
    it('should validate valid configuration', () => {
      const config = defaultCacheOptimizationConfig;
      const validation = validateCacheConfig(config);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing Redis configuration', () => {
      const config: CacheOptimizationConfig = {
        ...defaultCacheOptimizationConfig,
        performance: {
          ...defaultCacheOptimizationConfig.performance,
          redis: true,
        },
      };

      // Mock missing environment variables
      const originalEnv = process.env;
      process.env = { ...originalEnv };
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;

      const validation = validateCacheConfig(config);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(error => 
        error.includes('UPSTASH_REDIS_REST_URL')
      )).toBe(true);

      process.env = originalEnv;
    });

    it('should detect missing revalidation secret', () => {
      const config: CacheOptimizationConfig = {
        ...defaultCacheOptimizationConfig,
        revalidation: {
          ...defaultCacheOptimizationConfig.revalidation,
          webhookRevalidation: true,
        },
      };

      const originalEnv = process.env;
      process.env = { ...originalEnv };
      delete process.env.REVALIDATION_SECRET;

      const validation = validateCacheConfig(config);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(error => 
        error.includes('REVALIDATION_SECRET')
      )).toBe(true);

      process.env = originalEnv;
    });

    it('should provide warnings for suboptimal configurations', () => {
      const config: CacheOptimizationConfig = {
        ...defaultCacheOptimizationConfig,
        performance: {
          ...defaultCacheOptimizationConfig.performance,
          multiLevelCache: true,
          redis: false, // This should trigger a warning
        },
      };

      const validation = validateCacheConfig(config);
      
      expect(validation.warnings.some(warning => 
        warning.includes('Multi-level cache requires Redis')
      )).toBe(true);
    });
  });

  describe('Configuration Presets', () => {
    it('should return recommended config for e-commerce', () => {
      const config = getRecommendedConfig('e-commerce');
      
      expect(config).toBeDefined();
      expect(config?.caching.strategy).toBe('aggressive');
      expect(config?.performance.redis).toBe(true);
      expect(config?.performance.multiLevelCache).toBe(true);
    });

    it('should return recommended config for blog', () => {
      const config = getRecommendedConfig('blog');
      
      expect(config).toBeDefined();
      expect(config?.caching.strategy).toBe('balanced');
      expect(config?.performance.redis).toBe(false);
    });

    it('should return recommended config for prototype', () => {
      const config = getRecommendedConfig('prototype');
      
      expect(config).toBeDefined();
      expect(config?.caching.strategy).toBe('minimal');
      expect(config?.performance.redis).toBe(false);
      expect(config?.performance.cacheMetrics).toBe(false);
    });

    it('should return null for unknown use case', () => {
      const config = getRecommendedConfig('unknown-use-case');
      
      expect(config).toBeNull();
    });
  });

  describe('Example Configurations', () => {
    it('should generate aggressive caching configuration', () => {
      const config = exampleAggressiveCaching();
      
      expect(config.caching.strategy).toBe('aggressive');
      expect(config.performance.redis).toBe(true);
      expect(config.performance.multiLevelCache).toBe(true);
      expect(config.revalidation.webhookRevalidation).toBe(true);
      expect(config.optimization.bundleAnalyzer).toBe(true);
    });

    it('should generate balanced optimization configuration', () => {
      const config = exampleBalancedOptimization();
      
      expect(config.caching.strategy).toBe('balanced');
      expect(config.performance.redis).toBe(false);
      expect(config.performance.memoryCache).toBe(true);
      expect(config.optimization.bundleAnalyzer).toBe(false);
    });

    it('should generate minimal caching configuration', () => {
      const config = exampleMinimalCaching();
      
      expect(config.caching.strategy).toBe('minimal');
      expect(config.performance.redis).toBe(false);
      expect(config.performance.memoryCache).toBe(false);
      expect(config.performance.cacheMetrics).toBe(false);
      expect(config.optimization.bundleAnalyzer).toBe(false);
    });
  });

  describe('File Generation', () => {
    it('should generate cache files when data cache is enabled', () => {
      const config: CacheOptimizationConfig = {
        ...defaultCacheOptimizationConfig,
        caching: {
          ...defaultCacheOptimizationConfig.caching,
          dataCache: true,
        },
      };

      const template = generateCompleteCacheOptimization(config);
      const cacheFiles = template.files.filter(file => 
        file.path.includes('src/lib/cache')
      );
      
      expect(cacheFiles.length).toBeGreaterThan(0);
      expect(cacheFiles.some(file => 
        file.path.includes('data-cache.ts')
      )).toBe(true);
    });

    it('should generate API files when metrics are enabled', () => {
      const config: CacheOptimizationConfig = {
        ...defaultCacheOptimizationConfig,
        performance: {
          ...defaultCacheOptimizationConfig.performance,
          cacheMetrics: true,
        },
      };

      const template = generateCompleteCacheOptimization(config);
      const apiFiles = template.files.filter(file => 
        file.path.includes('app/api')
      );
      
      expect(apiFiles.length).toBeGreaterThan(0);
      expect(apiFiles.some(file => 
        file.path.includes('cache/stats')
      )).toBe(true);
    });

    it('should generate optimization components when image optimization is enabled', () => {
      const config: CacheOptimizationConfig = {
        ...defaultCacheOptimizationConfig,
        optimization: {
          ...defaultCacheOptimizationConfig.optimization,
          imageOptimization: true,
        },
      };

      const template = generateCompleteCacheOptimization(config);
      const componentFiles = template.files.filter(file => 
        file.path.includes('components/optimization')
      );
      
      expect(componentFiles.length).toBeGreaterThan(0);
      expect(componentFiles.some(file => 
        file.path.includes('optimized-image.tsx')
      )).toBe(true);
    });
  });

  describe('Package Scripts', () => {
    it('should include cache management scripts', () => {
      const template = generateCompleteCacheOptimization();
      
      expect(template.packageScripts['cache:stats']).toBeDefined();
      expect(template.packageScripts['cache:clear']).toBeDefined();
    });

    it('should include analyze script when bundle analyzer is enabled', () => {
      const config: CacheOptimizationConfig = {
        ...defaultCacheOptimizationConfig,
        optimization: {
          ...defaultCacheOptimizationConfig.optimization,
          bundleAnalyzer: true,
        },
      };

      const template = generateCompleteCacheOptimization(config);
      
      expect(template.packageScripts['analyze']).toBeDefined();
      expect(template.packageScripts['analyze']).toContain('ANALYZE=true');
    });
  });

  describe('Instructions', () => {
    it('should provide basic setup instructions', () => {
      const template = generateCompleteCacheOptimization();
      
      expect(template.instructions.length).toBeGreaterThan(0);
      expect(template.instructions.some(instruction => 
        instruction.includes('environment variables')
      )).toBe(true);
    });

    it('should include Redis setup instructions when Redis is enabled', () => {
      const config: CacheOptimizationConfig = {
        ...defaultCacheOptimizationConfig,
        performance: {
          ...defaultCacheOptimizationConfig.performance,
          redis: true,
        },
      };

      const template = generateCompleteCacheOptimization(config);
      
      expect(template.instructions.some(instruction => 
        instruction.includes('Redis connection')
      )).toBe(true);
    });

    it('should include monitoring instructions when metrics are enabled', () => {
      const config: CacheOptimizationConfig = {
        ...defaultCacheOptimizationConfig,
        performance: {
          ...defaultCacheOptimizationConfig.performance,
          cacheMetrics: true,
        },
      };

      const template = generateCompleteCacheOptimization(config);
      
      expect(template.instructions.some(instruction => 
        instruction.includes('cache performance')
      )).toBe(true);
    });
  });
});
