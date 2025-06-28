# Template de Génération de Formulaires

Ce template génère des formulaires complets avec shadcn/ui, validation Zod et Server Actions pour Next.js.

## 🚀 Fonctionnalités

- **shadcn/ui** : Composants UI modernes et accessibles
- **React Hook Form** : Gestion d'état côté client performante
- **Validation Zod** : Validation côté client et serveur
- **Server Actions** : Actions serveur Next.js avec gestion d'erreurs
- **TypeScript** : Types générés automatiquement
- **Hooks personnalisés** : Fonctionnalités avancées (auto-save, optimistic UI, etc.)

## 📦 Structure générée

```
src/
├── components/forms/
│   ├── {name}-form.tsx           # Composant principal
│   ├── {name}-submit-button.tsx  # Bouton avec useFormStatus
│   └── fields/                   # Composants de champs personnalisés
├── hooks/{name}/
│   ├── use-{name}-form.ts        # Hook principal
│   ├── use-{name}-auto-save.ts   # Auto-sauvegarde
│   ├── use-{name}-optimistic.ts  # UI optimiste
│   └── use-{name}-notifications.ts # Notifications
├── services/{name}/
│   ├── actions.ts                # Server Actions principales
│   ├── crud-actions.ts           # Actions CRUD
│   └── custom-actions.ts         # Actions personnalisées
shared/
├── types/{name}.ts               # Types TypeScript
└── validation/{name}.ts          # Schémas Zod
```

## 🛠️ Utilisation

### Configuration de base

```typescript
import { FormGenerator, createFormConfig } from './templates/forms';

const fields = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    required: true,
  },
  {
    name: 'password',
    type: 'password',
    label: 'Mot de passe',
    required: true,
    validation: {
      minLength: 8,
    },
  },
];

const config = createFormConfig('Login', fields);
const generator = new FormGenerator(config);
const files = generator.generate();
```

### Types de champs supportés

| Type | Description | Props spéciales |
|------|-------------|----------------|
| `text` | Champ texte simple | - |
| `email` | Email avec validation | - |
| `password` | Mot de passe masqué | - |
| `number` | Nombre avec validation | `min`, `max` |
| `textarea` | Zone de texte multi-lignes | - |
| `select` | Liste déroulante | `options` |
| `multiselect` | Sélection multiple | `options` |
| `checkbox` | Case à cocher | - |
| `radio` | Boutons radio | `options` |
| `switch` | Interrupteur | - |
| `slider` | Curseur de valeur | `min`, `max` |
| `date` | Sélecteur de date | - |
| `datetime` | Date et heure | - |
| `file` | Upload de fichier | - |
| `combobox` | Recherche avec suggestions | `options` |

### Validation avancée

```typescript
const field = {
  name: 'username',
  type: 'text',
  label: 'Nom d\'utilisateur',
  required: true,
  validation: {
    minLength: 3,
    maxLength: 20,
    pattern: '^[a-zA-Z0-9_]+$',
    messages: {
      minLength: 'Minimum 3 caractères',
      maxLength: 'Maximum 20 caractères',
      pattern: 'Lettres, chiffres et underscore uniquement',
    },
  },
};
```

### Champs conditionnels

```typescript
const field = {
  name: 'shippingAddress',
  type: 'textarea',
  label: 'Adresse de livraison',
  required: true,
  conditional: {
    dependsOn: 'deliveryType',
    condition: 'equals',
    value: 'home',
  },
};
```

### Fonctionnalités avancées

```typescript
const config = createFormConfig('User', fields, {
  features: [
    'file-upload',        // Upload de fichiers
    'multi-step',         // Formulaire multi-étapes
    'auto-save',          // Sauvegarde automatique
    'optimistic-ui',      // Interface optimiste
    'toast-notifications', // Notifications toast
    'conditional-fields', // Champs conditionnels
    'dynamic-fields',     // Champs dynamiques
  ],
});
```

### Actions personnalisées

```typescript
const config = createFormConfig('Product', fields, {
  actions: [
    {
      name: 'create',
      type: 'create',
      redirect: '/products',
      revalidate: ['/products'],
    },
    {
      name: 'duplicate',
      type: 'custom',
      endpoint: '/api/products/duplicate',
    },
  ],
});
```

### Styles et mise en page

```typescript
const config = createFormConfig('Contact', fields, {
  styling: {
    layout: 'two-column',     // single-column, two-column, grid
    spacing: 'relaxed',       // compact, normal, relaxed
    variant: 'card',          // default, card, modal, inline
    submitButton: {
      text: 'Envoyer',
      loadingText: 'Envoi...',
      variant: 'default',
      size: 'lg',
      fullWidth: true,
    },
  },
});
```

## 📋 Exemples prêts à l'emploi

### Formulaire de contact

```typescript
import { FORM_PRESETS } from './templates/forms';

const contactForm = new FormGenerator(FORM_PRESETS.contact);
```

### Formulaire utilisateur

```typescript
const userForm = new FormGenerator(FORM_PRESETS.user);
```

### Formulaire de profil

```typescript
const profileForm = new FormGenerator(FORM_PRESETS.profile);
```

## 🔧 Intégration dans le projet

### 1. Installation des dépendances

```bash
pnpm add react-hook-form @hookform/resolvers zod
pnpm add @radix-ui/react-form @radix-ui/react-select
pnpm add sonner # pour les notifications
```

### 2. Configuration shadcn/ui

```bash
npx shadcn@latest add form input textarea select button
npx shadcn@latest add checkbox switch slider
npx shadcn@latest add card dialog popover
```

### 3. Utilisation du composant généré

```tsx
import { UserForm } from '@/components/forms/user-form';

export default function CreateUserPage() {
  return (
    <div className="container mx-auto py-8">
      <UserForm
        onSuccess={(data) => {
          console.log('Utilisateur créé:', data);
        }}
        onError={(error) => {
          console.error('Erreur:', error);
        }}
      />
    </div>
  );
}
```

### 4. Utilisation des hooks

```tsx
import { useUserForm } from '@/hooks/user/use-user-form';

export function CustomUserForm() {
  const {
    form,
    handleSubmit,
    isPending,
    isValid,
  } = useUserForm({
    onSuccess: (data) => {
      // Logique de succès
    },
  });

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* Champs personnalisés */}
    </form>
  );
}
```

## 🎯 Bonnes pratiques

1. **Validation** : Utilisez la même validation côté client et serveur
2. **Accessibilité** : Les composants shadcn/ui sont accessibles par défaut
3. **Performance** : React Hook Form optimise les re-rendus
4. **UX** : Utilisez les états de loading et les notifications
5. **Sécurité** : Validez toujours côté serveur avec Zod

## 🔍 Débogage

### Erreurs courantes

1. **Validation échoue** : Vérifiez que les schémas Zod correspondent
2. **Server Action ne fonctionne pas** : Vérifiez la directive `"use server"`
3. **Types incorrects** : Régénérez les types après modification des champs

### Logs utiles

```typescript
// Dans le composant
console.log('Form state:', form.formState);
console.log('Server state:', state);

// Dans la Server Action
console.log('Form data:', Object.fromEntries(formData.entries()));
```

## 📚 Ressources

- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
