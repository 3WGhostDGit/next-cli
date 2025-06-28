/**
 * Cache Optimization Template Examples
 * Usage examples showing different configuration presets and implementation patterns
 */

import { generateCompleteCacheOptimization, CacheOptimizationGenerationOptions } from "./generator";
import { CacheOptimizationConfig } from "./index";

/**
 * Example 1: Aggressive caching for high-traffic sites
 */
export function exampleAggressiveCaching(): CacheOptimizationConfig {
  return {
    projectName: "high-traffic-site",
    caching: {
      strategy: "aggressive",
      dataCache: true,
      routerCache: true,
      staticGeneration: true,
      incrementalStaticRegeneration: true,
    },
    revalidation: {
      useRevalidatePath: true,
      useRevalidateTag: true,
      webhookRevalidation: true,
      timeBasedRevalidation: true,
    },
    optimization: {
      imageOptimization: true,
      bundleAnalyzer: true,
      compression: true,
      prefetching: true,
      streaming: true,
      suspense: true,
    },
    performance: {
      redis: true,
      memoryCache: true,
      multiLevelCache: true,
      cacheMetrics: true,
    },
    features: [
      "data-cache",
      "router-cache",
      "isr",
      "streaming",
      "prefetch",
      "image-optimization",
      "bundle-analysis",
      "cache-metrics",
      "redis-cache",
      "memory-cache",
      "webhook-revalidation",
    ],
  };
}

/**
 * Exemple 2: Configuration équilibrée pour application standard
 */
export function exampleBalancedOptimization(): CacheOptimizationConfig {
  return {
    projectName: "standard-app",
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
}

/**
 * Exemple 3: Configuration minimale pour prototypage
 */
export function exampleMinimalCaching(): CacheOptimizationConfig {
  return {
    projectName: "prototype-app",
    caching: {
      strategy: "minimal",
      dataCache: true,
      routerCache: false,
      staticGeneration: true,
      incrementalStaticRegeneration: false,
    },
    revalidation: {
      useRevalidatePath: true,
      useRevalidateTag: false,
      webhookRevalidation: false,
      timeBasedRevalidation: false,
    },
    optimization: {
      imageOptimization: true,
      bundleAnalyzer: false,
      compression: false,
      prefetching: false,
      streaming: false,
      suspense: false,
    },
    performance: {
      redis: false,
      memoryCache: false,
      multiLevelCache: false,
      cacheMetrics: false,
    },
    features: [
      "data-cache",
      "image-optimization",
    ],
  };
}

/**
 * Exemple 4: Configuration e-commerce avec optimisations avancées
 */
export function exampleEcommerceCaching(): CacheOptimizationConfig {
  return {
    projectName: "ecommerce-platform",
    caching: {
      strategy: "aggressive",
      dataCache: true,
      routerCache: true,
      staticGeneration: true,
      incrementalStaticRegeneration: true,
    },
    revalidation: {
      useRevalidatePath: true,
      useRevalidateTag: true,
      webhookRevalidation: true,
      timeBasedRevalidation: true,
    },
    optimization: {
      imageOptimization: true,
      bundleAnalyzer: true,
      compression: true,
      prefetching: true,
      streaming: true,
      suspense: true,
    },
    performance: {
      redis: true,
      memoryCache: true,
      multiLevelCache: true,
      cacheMetrics: true,
    },
    features: [
      "data-cache",
      "router-cache",
      "isr",
      "streaming",
      "prefetch",
      "image-optimization",
      "bundle-analysis",
      "cache-metrics",
      "redis-cache",
      "memory-cache",
      "webhook-revalidation",
    ],
  };
}

/**
 * Fonction de démonstration complète
 */
export function demonstrateCacheOptimizationUsage() {
  console.log("⚡ Démonstration du template de cache et optimisation\n");

  // Exemple 1: Configuration agressive
  console.log("🚀 Exemple 1: Configuration agressive pour site à fort trafic");
  const aggressiveConfig = exampleAggressiveCaching();
  const aggressiveOptions: CacheOptimizationGenerationOptions = {
    includeExamples: true,
    includeMetrics: true,
    includeAdvancedOptimizations: true,
    includeRedis: true,
  };

  const aggressiveTemplate = generateCompleteCacheOptimization(aggressiveConfig, aggressiveOptions);
  console.log(`- Fichiers générés: ${aggressiveTemplate.files.length}`);
  console.log(`- Scripts package.json: ${Object.keys(aggressiveTemplate.packageScripts).length}`);
  console.log(`- Stratégie: ${aggressiveConfig.caching.strategy}`);
  console.log(`- Redis activé: ${aggressiveConfig.performance.redis}`);
  console.log(`- Cache multi-niveaux: ${aggressiveConfig.performance.multiLevelCache}\n`);

  // Exemple 2: Configuration équilibrée
  console.log("⚖️ Exemple 2: Configuration équilibrée pour application standard");
  const balancedConfig = exampleBalancedOptimization();
  const balancedOptions: CacheOptimizationGenerationOptions = {
    includeExamples: true,
    includeMetrics: true,
    includeAdvancedOptimizations: false,
    includeRedis: false,
  };

  const balancedTemplate = generateCompleteCacheOptimization(balancedConfig, balancedOptions);
  console.log(`- Fichiers générés: ${balancedTemplate.files.length}`);
  console.log(`- Configuration équilibrée entre performance et simplicité\n`);

  // Exemple 3: Configuration minimale
  console.log("🪶 Exemple 3: Configuration minimale pour prototypage");
  const minimalConfig = exampleMinimalCaching();
  const minimalOptions: CacheOptimizationGenerationOptions = {
    includeExamples: false,
    includeMetrics: false,
    includeAdvancedOptimizations: false,
    includeRedis: false,
  };

  const minimalTemplate = generateCompleteCacheOptimization(minimalConfig, minimalOptions);
  console.log(`- Fichiers générés: ${minimalTemplate.files.length}`);
  console.log(`- Configuration minimale pour démarrage rapide\n`);

  // Exemple 4: Configuration e-commerce
  console.log("🛒 Exemple 4: Configuration e-commerce avec optimisations avancées");
  const ecommerceConfig = exampleEcommerceCaching();
  const ecommerceOptions: CacheOptimizationGenerationOptions = {
    includeExamples: true,
    includeMetrics: true,
    includeAdvancedOptimizations: true,
    includeRedis: true,
  };

  const ecommerceTemplate = generateCompleteCacheOptimization(ecommerceConfig, ecommerceOptions);
  console.log(`- Optimisé pour les performances e-commerce`);
  console.log(`- Cache multi-niveaux avec Redis`);
  console.log(`- Métriques de performance intégrées\n`);

  return {
    aggressive: { config: aggressiveConfig, template: aggressiveTemplate },
    balanced: { config: balancedConfig, template: balancedTemplate },
    minimal: { config: minimalConfig, template: minimalTemplate },
    ecommerce: { config: ecommerceConfig, template: ecommerceTemplate },
  };
}

/**
 * Exemple d'utilisation avec CLI
 */
export function generateForCLI(
  strategy: "aggressive" | "balanced" | "minimal" = "balanced",
  features: string[] = [],
  includeRedis: boolean = false
) {
  const baseConfig: CacheOptimizationConfig = {
    projectName: "cli-generated-app",
    caching: {
      strategy,
      dataCache: true,
      routerCache: strategy !== "minimal",
      staticGeneration: true,
      incrementalStaticRegeneration: strategy === "aggressive",
    },
    revalidation: {
      useRevalidatePath: true,
      useRevalidateTag: strategy !== "minimal",
      webhookRevalidation: strategy === "aggressive",
      timeBasedRevalidation: strategy !== "minimal",
    },
    optimization: {
      imageOptimization: true,
      bundleAnalyzer: features.includes("bundle-analyzer"),
      compression: strategy !== "minimal",
      prefetching: strategy !== "minimal",
      streaming: strategy !== "minimal",
      suspense: strategy !== "minimal",
    },
    performance: {
      redis: includeRedis,
      memoryCache: strategy !== "minimal",
      multiLevelCache: strategy === "aggressive" && includeRedis,
      cacheMetrics: strategy !== "minimal",
    },
    features: [
      "data-cache",
      ...(strategy !== "minimal" ? ["router-cache"] : []),
      ...(strategy === "aggressive" ? ["isr"] : []),
      "image-optimization",
      ...(features.includes("bundle-analyzer") ? ["bundle-analysis"] : []),
      ...(strategy !== "minimal" ? ["cache-metrics"] : []),
      ...(includeRedis ? ["redis-cache"] : []),
      ...(strategy !== "minimal" ? ["memory-cache"] : []),
    ] as any,
  };

  const options: CacheOptimizationGenerationOptions = {
    includeExamples: features.includes("examples"),
    includeMetrics: strategy !== "minimal",
    includeAdvancedOptimizations: strategy === "aggressive",
    includeRedis,
  };

  return generateCompleteCacheOptimization(baseConfig, options);
}

// Exporter les exemples pour utilisation
export const examples = {
  aggressive: exampleAggressiveCaching,
  balanced: exampleBalancedOptimization,
  minimal: exampleMinimalCaching,
  ecommerce: exampleEcommerceCaching,
  demonstrate: demonstrateCacheOptimizationUsage,
  generateForCLI,
};
