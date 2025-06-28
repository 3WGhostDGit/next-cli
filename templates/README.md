# Templates Next.js CLI

This directory contains templates for generating optimized Next.js applications with different configurations and features.

## 📁 Template Structure

Each template follows a consistent structure pattern:

- `index.ts` - Entry point with TypeScript interfaces and main exports
- `generator.ts` - Main generator logic that orchestrates file creation
- `types.ts` - TypeScript type definitions and interfaces
- `utilities.ts` - Helper functions and utility classes
- `schemas.ts` - Core schema definitions and configurations
- `extensions.ts` - Additional extensions and advanced features
- `example.ts` - Usage examples and configuration presets
- `test.ts` - Comprehensive test suite validating functionality
- `README.md` - Complete documentation with features and usage

## 🚀 Cache & Optimization (`cache-optimization/`)

Comprehensive template for performance optimization and cache management in Next.js.

**Key Features:**
- Multi-level caching (Memory + Redis)
- Smart revalidation with webhooks
- Image optimization and prefetching
- SSR streaming and progressive rendering
- Real-time performance monitoring
- Bundle analysis and compression

**Available Strategies:**
- `aggressive` - Maximum performance for high-traffic sites
- `balanced` - Balance between performance and simplicity
- `minimal` - Lightweight configuration for prototyping

**Generated Files:**
- Core cache system with data, memory, and Redis implementations
- Optimization utilities for images, prefetching, and streaming
- React components and hooks for performance
- API routes for cache management and metrics
- Next.js configuration with middleware

### 🧪 Testing (`testing/`)

Comprehensive testing template for Next.js applications with multiple frameworks and strategies.

**Key Features:**
- Multiple test frameworks (Jest, Vitest)
- Complete test type coverage (unit, integration, E2E, visual, performance, accessibility)
- E2E testing with Playwright or Cypress
- Automated CI/CD workflows
- Pre-commit hooks and quality gates
- Mock implementations for Next.js, APIs, and databases

**Available Frameworks:**
- Jest with Testing Library (traditional, stable)
- Vitest with Testing Library (modern, fast)
- Playwright for E2E (cross-browser)
- Cypress for E2E (developer-friendly)

**Generated Files:**
- Test framework configurations and setup files
- Testing utilities and custom matchers
- Mock implementations for Next.js, APIs, and databases
- Example tests for components, utilities, and E2E scenarios
- Automation workflows and pre-commit hooks

## 🛠 Usage

### Cache & Optimization

```typescript
import { generateCompleteCacheOptimization } from './cache-optimization/generator';
import { examples } from './cache-optimization/example';

// Aggressive configuration for e-commerce sites
const config = examples.exampleAggressiveCaching();
const template = generateCompleteCacheOptimization(config, {
  includeRedis: true,
  includeMetrics: true,
  includeAdvancedOptimizations: true,
});

// CLI generation
const cliTemplate = examples.generateForCLI('aggressive', ['bundle-analyzer'], true);
```

### Testing

```typescript
import { generateCompleteTesting } from './testing/generator';
import { examples } from './testing/example';

// Complete configuration with all test types
const config = examples.exampleCompleteTesting();
const template = generateCompleteTesting(config, {
  includeE2E: true,
  includeVisualTests: true,
  includePerformanceTests: true,
});

// CLI generation
const cliTemplate = examples.generateForCLI('vitest', ['unit', 'e2e'], 'playwright', true);
```

## 📊 Monitoring & Metrics

### Cache & Performance

The templates include comprehensive monitoring systems:

- **Cache Metrics**: Hit rate, miss rate, response times
- **Performance Metrics**: Memory usage, render times
- **Statistics API**: `/api/cache/stats` for external monitoring
- **Real-time Dashboard**: React components for visualization

### Testing

The templates include detailed reporting:

- **Coverage**: Configurable thresholds per file type
- **E2E Reports**: Screenshots, videos, Playwright traces
- **CI/CD Metrics**: Execution times, success rates
- **Automation**: Pre-commit hooks, GitHub Actions

## 🔧 Configuration

### Variables d'environnement

**Cache & Optimisation :**
```env
# Redis (optionnel)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Revalidation
REVALIDATION_SECRET=your-secret-key

# Analytics
VERCEL_ANALYTICS_ID=
```

**Tests :**
```env
# Base de données de test
DATABASE_URL=file:./test.db

# API de test
API_BASE_URL=http://localhost:3001

# E2E
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

## 📚 Exemples d'intégration

### Dans un projet Next.js

1. **Installer les dépendances** selon le template choisi
2. **Configurer les variables d'environnement**
3. **Intégrer les composants et hooks** dans votre application
4. **Configurer le monitoring** pour la production

### Avec le CLI

```bash
# Générer avec cache agressif
npx next-cli create my-app --template cache-optimization --strategy aggressive --redis

# Générer avec tests complets
npx next-cli create my-app --template testing --framework vitest --e2e playwright
```

## 🚀 Roadmap

- [ ] Template d'authentification avec Better Auth
- [ ] Template de base de données avec Prisma
- [ ] Template d'API avec validation Zod
- [ ] Template de composants avec shadcn/ui
- [ ] Template de déploiement avec Vercel
- [ ] Template de monitoring avec Sentry

## 📄 Licence

MIT - Voir le fichier LICENSE pour plus de détails.
