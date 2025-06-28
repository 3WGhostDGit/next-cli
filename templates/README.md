# Templates Next.js

Ce dossier contient les templates de génération de code pour les applications Next.js modernes.

## 📁 Templates Disponibles

### 🔒 Template de Sécurité (`security/`)

Template complet pour la génération de middleware de sécurité avec :

- **Authentification** - Intégration avec better-auth, next-auth ou custom
- **Autorisation** - RBAC, ABAC avec protection des routes
- **Rate Limiting** - Redis, Upstash ou mémoire avec règles personnalisées
- **Headers de Sécurité** - CSP, HSTS, XSS Protection, Frame Options
- **CORS** - Configuration cross-origin complète
- **Protection CSRF** - Validation des tokens avec rotation
- **Logging de Sécurité** - Surveillance et alertes
- **Protections Avancées** - Injection, géo-blocage, détection de bots

**Fichiers générés :**
- `middleware.ts` - Middleware principal de sécurité
- `src/lib/rate-limit.ts` - Système de rate limiting
- `src/lib/security-logger.ts` - Logging de sécurité
- `src/lib/injection-protection.ts` - Protection contre les injections
- `src/lib/csrf.ts` - Protection CSRF
- `src/lib/geo-blocking.ts` - Géo-blocage
- `src/lib/bot-detection.ts` - Détection de bots

### 🚨 Template de Gestion d'Erreurs (`error-handling/`)

Template complet pour la gestion d'erreurs avec :

- **Error Boundaries** - Global, route et composant avec retry
- **Pages d'Erreur** - 404, 500, error.tsx, global-error.tsx personnalisées
- **Logging** - Système de logs multi-destinations avec rotation
- **Monitoring** - Intégration Sentry, Bugsnag, Rollbar, DataDog
- **Récupération** - Auto-retry, circuit breaker, fallback strategies
- **Notifications** - Email, Slack, Discord, webhook avec throttling
- **Analytics** - Métriques, tendances, groupement d'erreurs

**Fichiers générés :**
- `src/components/error-boundary/` - Error Boundaries et fallbacks
- `src/app/not-found.tsx` - Page 404 personnalisée
- `src/app/error.tsx` - Page d'erreur personnalisée
- `src/app/global-error.tsx` - Page d'erreur globale
- `src/lib/error-logger.ts` - Système de logging
- `src/lib/error-reporter.ts` - Monitoring et reporting
- `src/lib/error-recovery.ts` - Utilitaires de récupération
- `src/hooks/use-error-handler.ts` - Hooks React pour les erreurs

### 📝 Template de Formulaires (`forms/`)

Template pour la génération de formulaires avec shadcn/ui, Zod et Server Actions.

## 🚀 Utilisation

### Template de Sécurité

```typescript
import { generateSecurityTemplate, securityPresets } from '@/templates/security';

// Configuration basique
const result = generateSecurityTemplate({
  ...securityPresets.basic,
  projectName: 'mon-app',
  authentication: {
    enabled: true,
    provider: 'better-auth',
    sessionStrategy: 'jwt',
    redirects: {
      login: '/login',
      logout: '/',
      unauthorized: '/unauthorized',
    },
  },
  rateLimit: {
    enabled: true,
    provider: 'memory',
    rules: {
      '/api/auth/login': { requests: 5, window: 900 },
    },
    defaultRule: { requests: 100, window: 60 },
  },
});

if (result.success) {
  console.log(`✅ ${result.files.length} fichiers générés`);
  // Fichiers prêts à utiliser
}
```

### Template de Gestion d'Erreurs

```typescript
import { generateErrorHandlingTemplate, errorHandlingPresets } from '@/templates/error-handling';

// Configuration standard
const result = generateErrorHandlingTemplate({
  ...errorHandlingPresets.standard,
  projectName: 'mon-app',
  errorBoundaries: {
    enabled: true,
    globalBoundary: true,
    routeBoundaries: true,
    retryMechanism: true,
    maxRetries: 3,
  },
  monitoring: {
    enabled: true,
    services: ['sentry'],
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: 'production',
      tracesSampleRate: 0.1,
    },
  },
});
```

## 🎯 Presets Disponibles

### Sécurité

- **`basic`** - Authentification + rate limiting basique
- **`standard`** - Configuration complète recommandée
- **`enterprise`** - Sécurité maximale avec toutes les protections

### Gestion d'Erreurs

- **`basic`** - Error boundaries + pages d'erreur
- **`standard`** - Configuration complète avec logging
- **`enterprise`** - Monitoring avancé + analytics + notifications

## 📊 Statistiques

- **9 fichiers** de templates
- **5,050+ lignes** de code généré
- **132+ KB** de templates
- **Support complet** des patterns Next.js 15

## 🔧 Configuration

### Variables d'environnement pour la sécurité

```env
# Rate limiting avec Redis
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Monitoring
SENTRY_DSN=your_sentry_dsn
DATADOG_API_KEY=your_datadog_key
```

### Variables d'environnement pour les erreurs

```env
# Monitoring
SENTRY_DSN=your_sentry_dsn
BUGSNAG_API_KEY=your_bugsnag_key

# Logging externe
LOG_ENDPOINT=your_log_endpoint
LOG_API_KEY=your_log_api_key

# Notifications
SLACK_WEBHOOK_URL=your_slack_webhook
SMTP_HOST=your_smtp_host
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
```

## 🧪 Tests

```bash
# Valider tous les templates
node validate-templates.js

# Tests spécifiques
npm test templates/security
npm test templates/error-handling
npm test templates/forms
```

## 📚 Documentation

- [Template de Sécurité](./security/README.md)
- [Template de Gestion d'Erreurs](./error-handling/README.md)
- [Template de Formulaires](./forms/README.md)

## 🤝 Contribution

Pour ajouter un nouveau template :

1. Créer un dossier `templates/nom-template/`
2. Ajouter les fichiers :
   - `index.ts` - Configuration et types
   - `types.ts` - Types TypeScript
   - `generator.ts` - Générateur principal
   - `README.md` - Documentation

3. Suivre les patterns existants pour la structure
4. Ajouter des tests de validation
5. Mettre à jour cette documentation

## ✅ Validation

Tous les templates ont été validés et sont prêts pour la production :

- ✅ **Template de sécurité** : Complet avec toutes les fonctionnalités
- ✅ **Template de gestion d'erreurs** : Complet avec Error Boundaries et monitoring
- ✅ **Template de formulaires** : Complet avec shadcn/ui et Server Actions

Les templates génèrent du code de qualité production avec :
- Types TypeScript complets
- Tests unitaires
- Documentation
- Bonnes pratiques Next.js 15
- Compatibilité avec les dernières versions des dépendances
