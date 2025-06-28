# Template de Formulaires

Ce template génère des formulaires complets avec shadcn/ui, validation Zod et Server Actions pour Next.js.

## 🚀 Fonctionnalités

- ✅ **shadcn/ui** - Composants UI modernes et accessibles
- ✅ **Validation Zod** - Validation côté client et serveur
- ✅ **Server Actions** - Actions serveur Next.js avec useActionState
- ✅ **TypeScript** - Types complets et sécurisés
- ✅ **Tests** - Tests unitaires avec Jest et Testing Library
- ✅ **Storybook** - Documentation interactive des composants
- ✅ **Multi-étapes** - Support des formulaires complexes
- ✅ **Upload de fichiers** - Gestion des fichiers avec validation
- ✅ **Auto-save** - Sauvegarde automatique des brouillons
- ✅ **Accessibilité** - Conforme aux standards WCAG

## 📁 Structure générée

```
src/
├── components/forms/
│   ├── {form-name}-form.tsx          # Composant principal
│   ├── __tests__/
│   │   └── {form-name}-form.test.tsx # Tests unitaires
│   └── {form-name}-form.stories.tsx  # Stories Storybook
├── services/{form-name}/
│   ├── {action-name}.ts              # Server Action principale
│   ├── saveStep.ts                   # Action multi-étapes
│   ├── submitComplete.ts             # Soumission finale
│   ├── autoSave.ts                   # Auto-sauvegarde
│   └── uploadFiles.ts                # Upload de fichiers
├── hooks/
│   └── use-{form-name}-form.ts       # Hooks personnalisés
├── lib/
│   └── {form-name}-validation.ts     # Utilitaires validation
└── types/
    └── {form-name}.ts                # Types TypeScript

shared/validation/
├── {form-name}.ts                    # Schémas Zod principaux
├── {form-name}-search.ts             # Schémas de recherche
└── {form-name}-upload.ts             # Schémas d'upload

docs/forms/
└── {form-name}.md                    # Documentation
```

## 🛠️ Utilisation

### Configuration de base

```typescript
import { FormConfig } from '@/templates/forms';

const config: FormConfig = {
  formName: 'contact',
  formType: 'basic',
  fields: [
    {
      name: 'name',
      type: 'string',
      label: 'Nom complet',
      required: true,
      validation: { min: 2, max: 50 }
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      required: true
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Message',
      required: true,
      validation: { min: 10, max: 1000 }
    }
  ],
  validation: {
    library: 'zod',
    realTimeValidation: true,
    customMessages: true
  },
  actions: {
    submitAction: 'submitContact',
    showSuccessMessage: true
  },
  ui: {
    layout: 'vertical',
    submitButtonText: 'Envoyer',
    theme: 'card'
  }
};
```

### Génération

```typescript
import { generateFormTemplate } from '@/templates/forms/generator';

const result = generateFormTemplate(config);

if (result.success) {
  console.log(`✅ ${result.files.length} fichiers générés`);
  console.log(result.summary);
} else {
  console.error('❌ Erreurs:', result.errors);
}
```

## 📋 Types de formulaires

### Formulaire simple

```typescript
const basicForm: FormConfig = {
  formName: 'newsletter',
  formType: 'basic',
  fields: [
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'consent', type: 'boolean', label: 'J\'accepte les conditions' }
  ]
};
```

### Formulaire multi-étapes

```typescript
const multiStepForm: FormConfig = {
  formName: 'registration',
  formType: 'multi-step',
  steps: [
    {
      name: 'personal',
      title: 'Informations personnelles',
      fields: [
        { name: 'firstName', type: 'string', label: 'Prénom', required: true },
        { name: 'lastName', type: 'string', label: 'Nom', required: true }
      ]
    },
    {
      name: 'account',
      title: 'Compte utilisateur',
      fields: [
        { name: 'username', type: 'string', label: 'Nom d\'utilisateur', required: true },
        { name: 'password', type: 'password', label: 'Mot de passe', required: true }
      ]
    }
  ],
  ui: { showProgress: true }
};
```

## 🎨 Personnalisation

### Thèmes disponibles

- `default` - Style minimal
- `card` - Formulaire dans une carte
- `inline` - Disposition horizontale

### Layouts

- `vertical` - Champs empilés verticalement
- `horizontal` - Labels à côté des champs
- `grid` - Disposition en grille

### Fonctionnalités avancées

```typescript
const advancedForm: FormConfig = {
  // ... configuration de base
  features: [
    'file-upload',    // Upload de fichiers
    'auto-save',      // Sauvegarde automatique
    'dynamic-fields', // Champs conditionnels
    'confirmation-step' // Étape de confirmation
  ]
};
```

## 🧪 Tests

### Exécution des tests

```bash
# Tests du template
npm test templates/forms

# Tests des formulaires générés
npm test src/components/forms
```

### Tests personnalisés

```typescript
import { formTests } from '@/templates/forms/test';

// Test d'un formulaire spécifique
formTests.basic();
formTests.multiStep();
formTests.advanced();

// Tous les tests
formTests.all();
```

## 📖 Exemples

### Formulaire de contact

```typescript
import { formPresets } from '@/templates/forms';

const contactForm = generateFormTemplate(formPresets.contact);
```

### Formulaire d'inscription

```typescript
const registrationForm = generateFormTemplate(formPresets.registration);
```

### Formulaire de profil

```typescript
const profileForm = generateFormTemplate(formPresets.profile);
```

## 🔧 Configuration avancée

### Validation personnalisée

```typescript
const customValidation: FormField = {
  name: 'username',
  type: 'string',
  label: 'Nom d\'utilisateur',
  validation: {
    min: 3,
    max: 20,
    pattern: '^[a-zA-Z0-9_]+$',
    custom: '(value) => value !== "admin" || "Nom réservé"'
  }
};
```

### Actions personnalisées

```typescript
const customActions = {
  submitAction: 'createUser',
  redirectAfterSubmit: '/dashboard',
  optimisticUpdates: true
};
```

## 🚀 Intégration

### Dans un projet Next.js

1. Générer le formulaire avec le CLI
2. Importer le composant dans votre page
3. Personnaliser les Server Actions selon vos besoins
4. Adapter les schémas Zod si nécessaire

### Avec une base de données

```typescript
// Dans votre Server Action
export async function submitForm(formData: FormData) {
  // Validation
  const result = await validateForm(schema, formData);
  
  // Sauvegarde en base
  const record = await db.table.create({
    data: result.data
  });
  
  return { success: true, data: record };
}
```

## 📚 Ressources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Zod Documentation](https://zod.dev)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React Hook Form](https://react-hook-form.com)

## 🤝 Contribution

Pour contribuer au template :

1. Ajouter de nouveaux types de champs dans `form-schemas.ts`
2. Étendre les fonctionnalités dans `form-components.ts`
3. Ajouter des tests dans `test.ts`
4. Mettre à jour la documentation
