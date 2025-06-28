# Changelog - Template de Base Next.js

## Version 2.0.0 - Migration vers Tailwind CSS v4 et Dernières Versions

### 🚀 **Mises à jour majeures des dépendances**

#### **Framework et Runtime**
- **Next.js**: `^14.0.0` → `^15.1.0` (dernière version stable)
- **React**: `^18.0.0` → `^19.0.0` (dernière version stable avec nouvelles fonctionnalités)
- **React DOM**: `^18.0.0` → `^19.0.0`

#### **TypeScript et Outils de développement**
- **TypeScript**: `^5.0.0` → `^5.7.0` (dernière version avec améliorations de performance)
- **Node.js Types**: `^20.0.0` → `^22.0.0`
- **React Types**: `^18.0.0` → `^19.0.0`
- **ESLint**: `^8.0.0` → `^9.0.0` (nouvelle configuration flat config)
- **ESLint Config Next**: `^14.0.0` → `^15.1.0`

#### **Tailwind CSS v4 - Migration complète**
- **Tailwind CSS**: `^3.4.0` → `latest` (v4 beta/stable)
- **Nouveau**: `@tailwindcss/postcss@latest` (remplace autoprefixer et postcss)
- **Supprimé**: `autoprefixer` et `postcss` (intégrés dans Tailwind v4)
- **Tailwind Merge**: `^2.0.0` → `^2.5.0`
- **CLSX**: `^2.0.0` → `^2.1.0`

#### **Validation et Formulaires**
- **Zod**: `^3.22.0` → `^3.24.0` (dernières améliorations de performance)
- **React Hook Form**: `^7.47.0` → `^7.53.0`
- **Hookform Resolvers**: `^3.3.0` → `^3.9.0`

#### **Base de données**
- **Prisma**: `^5.6.0` → `^6.0.0` (nouvelle version majeure)
- **Prisma Client**: `^5.6.0` → `^6.0.0`

#### **UI et Icônes**
- **Lucide React**: `^0.400.0` → `^0.460.0` (nouvelles icônes)
- **Tailwindcss Animate**: Ajouté `^1.0.7` (pour les animations)

### 🎨 **Changements de configuration Tailwind CSS v4**

#### **Nouvelle approche CSS-first**
- **Supprimé**: `tailwind.config.ts` (configuration JavaScript)
- **Ajouté**: `postcss.config.ts` avec `@tailwindcss/postcss`
- **Nouveau**: Configuration via `@theme` dans `app/globals.css`

#### **Syntaxe mise à jour**
```css
/* Ancien (v3) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Nouveau (v4) */
@import "tailwindcss";

@theme {
  --color-primary: hsl(221.2 83.2% 53.3%);
  --breakpoint-3xl: 1920px;
}
```

#### **Utilitaires personnalisés**
```css
/* Nouveau système @utility */
@utility container {
  max-width: 1400px;
  margin-inline: auto;
  padding-inline: 2rem;
}
```

### 🔧 **Améliorations de configuration**

#### **PostCSS Configuration**
- Nouvelle configuration simplifiée avec `@tailwindcss/postcss`
- Suppression de `autoprefixer` (intégré dans Tailwind v4)
- Support natif des imports CSS

#### **Components.json**
- Mise à jour pour pointer vers `postcss.config.ts`
- Compatibilité maintenue avec shadcn/ui

#### **Dark Mode**
- Support amélioré avec CSS variables natives
- Configuration via `@media (prefers-color-scheme: dark)`
- Classe `.dark` pour contrôle manuel

### 📦 **Nouvelles fonctionnalités**

#### **Performance**
- Moteur Tailwind v4 plus rapide (jusqu'à 10x)
- Taille de bundle réduite
- Compilation plus rapide en développement

#### **CSS Variables natives**
- Toutes les couleurs shadcn/ui converties en CSS variables
- Meilleure intégration avec JavaScript
- Support des animations personnalisées

#### **Breakpoints personnalisés**
- Nouveau breakpoint `3xl: 1920px`
- Configuration flexible via `@theme`

### 🛠️ **Instructions de migration**

#### **Pour les projets existants**
1. Mettre à jour les dépendances:
   ```bash
   npm install next@^15.1.0 react@^19.0.0 react-dom@^19.0.0
   npm install tailwindcss@latest @tailwindcss/postcss@latest
   npm uninstall autoprefixer postcss
   ```

2. Remplacer `tailwind.config.ts` par `postcss.config.ts`:
   ```typescript
   export default {
     plugins: {
       "@tailwindcss/postcss": {},
     },
   };
   ```

3. Mettre à jour `app/globals.css`:
   ```css
   @import "tailwindcss";
   
   @theme {
     /* Vos variables personnalisées */
   }
   ```

#### **Compatibilité**
- ✅ shadcn/ui: Compatible avec configuration mise à jour
- ✅ Next.js App Router: Entièrement supporté
- ✅ TypeScript: Types mis à jour
- ✅ ESLint: Configuration flat config supportée

### 📚 **Documentation mise à jour**

#### **Nouvelles ressources**
- Guide de migration Tailwind CSS v4
- Exemples d'utilisation des CSS variables
- Documentation des nouveaux utilitaires

#### **Liens utiles**
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Features](https://react.dev/blog/2024/12/05/react-19)

### ⚠️ **Breaking Changes**

#### **Tailwind CSS**
- Configuration JavaScript non supportée par défaut
- Syntaxe `@tailwind` remplacée par `@import`
- Certains plugins peuvent nécessiter une mise à jour

#### **React 19**
- Nouvelles APIs de concurrence
- Changements dans les hooks (useActionState, etc.)
- Compatibilité avec les anciennes versions à vérifier

#### **Next.js 15**
- Nouvelles optimisations du compilateur
- Changements dans les API Routes
- Turbopack en développement par défaut

### 🎯 **Prochaines étapes**

1. **Tests complets** avec les nouvelles versions
2. **Migration des templates** d'authentification et de base de données
3. **Optimisation** des performances avec Tailwind v4
4. **Documentation** des nouveaux patterns

---

**Note**: Cette mise à jour représente une migration majeure vers les dernières technologies. Testez soigneusement avant de déployer en production.
