# Template de Génération CRUD Complet

Ce template génère des opérations CRUD complètes avec tables TanStack Table, formulaires shadcn/ui et Server Actions pour Next.js.

## 🚀 Fonctionnalités

- **TanStack Table** : Tables performantes avec tri, filtrage et pagination
- **shadcn/ui** : Composants UI modernes et accessibles
- **Server Actions** : Actions serveur Next.js avec validation Zod
- **Formulaires intégrés** : Création, édition et visualisation
- **Permissions** : Protection par rôles et permissions
- **Actions en lot** : Sélection multiple et opérations groupées
- **Export/Import** : Données CSV avec validation
- **TypeScript** : Types générés automatiquement

## 📦 Structure du template

```
templates/crud/
├── index.ts                      # Point d'entrée et exports
├── generator.ts                  # Générateur principal
├── types.ts                      # Génération des types TypeScript
├── schemas.ts                    # Génération des schémas Zod
├── utilities.ts                  # Génération des utilitaires
├── example.ts                    # Exemples d'utilisation
├── test.ts                       # Suite de tests
└── README.md                     # Documentation
```

## 📁 Fichiers générés

```
src/
├── components/{entity}/
│   └── {entity}-table.tsx        # Table principale avec TanStack
├── services/{entity}/
│   └── actions.ts                # Server Actions CRUD
├── lib/
│   ├── {entity}-utils.ts         # Utilitaires métier
│   ├── {entity}-formatters.ts    # Formatters d'affichage
│   └── {entity}-validators.ts    # Validateurs métier
shared/
├── types/
│   ├── {entity}.ts               # Types principaux
│   ├── {entity}-actions.ts       # Types d'actions
│   └── {entity}-hooks.ts         # Types de hooks
└── validation/
    ├── {entity}.ts               # Schémas principaux
    └── {entity}-filters.ts       # Schémas de filtres
```

## 🛠️ Utilisation

### Configuration de base

```typescript
import { CRUDGenerator, createCRUDConfig } from './templates/crud';

const userEntity = {
  name: 'User',
  displayName: 'Utilisateur',
  fields: [
    {
      name: 'firstName',
      type: 'string',
      displayName: 'Prénom',
      required: true,
      display: {
        showInTable: true,
        showInForm: true,
        showInDetail: true,
        formType: 'input',
      },
      searchable: true,
      sortable: true,
    },
    {
      name: 'email',
      type: 'email',
      displayName: 'Email',
      required: true,
      unique: true,
      display: {
        showInTable: true,
        showInForm: true,
        showInDetail: true,
        formType: 'input',
      },
      searchable: true,
      sortable: true,
    },
  ],
  relations: [],
  indexes: [],
  constraints: [],
};

const config = createCRUDConfig(userEntity);
const generator = new CRUDGenerator(config);
const files = generator.generate();
```

### Types de champs supportés

| Type | Description | Validation | Affichage |
|------|-------------|------------|-----------|
| `string` | Texte simple | minLength, maxLength, pattern | Input, Textarea |
| `number` | Nombre | min, max | Input numérique |
| `boolean` | Booléen | - | Checkbox, Switch |
| `date` | Date | - | Date picker |
| `datetime` | Date et heure | - | DateTime picker |
| `email` | Email | format email | Input email |
| `url` | URL | format URL | Input URL |
| `text` | Texte long | minLength, maxLength | Textarea |
| `json` | Données JSON | - | JSON editor |
| `enum` | Énumération | valeurs définies | Select |
| `file` | Fichier | taille, type | File upload |
| `image` | Image | taille, type | Image upload |
| `relation` | Relation | - | Select relationnel |

### Configuration avancée

```typescript
const config = createCRUDConfig(productEntity, {
  features: [
    'pagination',        // Pagination serveur/client
    'sorting',          // Tri multi-colonnes
    'filtering',        // Filtres avancés
    'search',           // Recherche globale
    'selection',        // Sélection multiple
    'bulk-actions',     // Actions en lot
    'export',           // Export CSV/Excel
    'import',           // Import CSV
    'inline-edit',      // Édition en ligne
    'soft-delete',      // Suppression logique
    'audit-trail',      // Historique des modifications
    'real-time',        // Mises à jour temps réel
    'optimistic-ui',    // Interface optimiste
  ],
  table: {
    pagination: {
      enabled: true,
      type: 'server',
      defaultPageSize: 20,
      pageSizeOptions: [10, 20, 50, 100],
    },
    sorting: {
      enabled: true,
      multiSort: true,
      defaultSort: [{ field: 'createdAt', direction: 'desc' }],
    },
    filtering: {
      enabled: true,
      globalSearch: true,
      columnFilters: true,
      advancedFilters: true,
      savedFilters: true,
    },
    actions: [
      { name: 'edit', label: 'Modifier', type: 'row', icon: 'Edit' },
      { name: 'delete', label: 'Supprimer', type: 'row', icon: 'Trash', variant: 'destructive' },
      { name: 'create', label: 'Créer', type: 'global', icon: 'Plus' },
      { name: 'export', label: 'Exporter', type: 'bulk', icon: 'Download' },
    ],
  },
  permissions: {
    enabled: true,
    roles: ['admin', 'manager', 'user'],
    permissions: [
      { action: 'create', roles: ['admin', 'manager'] },
      { action: 'read', roles: ['admin', 'manager', 'user'] },
      { action: 'update', roles: ['admin', 'manager'] },
      { action: 'delete', roles: ['admin'] },
    ],
  },
});
```

### Relations entre entités

```typescript
const productEntity = {
  name: 'Product',
  fields: [
    {
      name: 'categoryId',
      type: 'relation',
      displayName: 'Catégorie',
      required: true,
      display: {
        showInTable: true,
        showInForm: true,
        formType: 'select',
      },
    },
  ],
  relations: [
    {
      name: 'category',
      type: 'one-to-many',
      target: 'Category',
      foreignKey: 'categoryId',
      display: {
        showInTable: true,
        showInForm: true,
        displayField: 'name',
        searchable: true,
      },
    },
  ],
};
```

## 📋 Exemples prêts à l'emploi

### CRUD Utilisateurs

```typescript
import { generateUserCRUD } from './templates/crud/examples';
const userFiles = generateUserCRUD();
```

### CRUD Produits avec relations

```typescript
import { generateProductCRUD } from './templates/crud/examples';
const productFiles = generateProductCRUD();
```

### CRUD Articles de blog

```typescript
import { generateBlogCRUD } from './templates/crud/examples';
const blogFiles = generateBlogCRUD();
```

## 🔧 Intégration dans le projet

### 1. Installation des dépendances

```bash
pnpm add @tanstack/react-table
pnpm add lucide-react
npx shadcn@latest add table checkbox button input select
```

### 2. Utilisation du composant généré

```tsx
import { UserTable } from '@/components/user/user-table';
import { UserForm } from '@/components/user/user-form';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <Button onClick={() => setShowForm(true)}>
          Ajouter un utilisateur
        </Button>
      </div>

      <UserTable
        data={users}
        onEdit={(user) => {/* Logique d'édition */}}
        onCreate={() => setShowForm(true)}
        onDelete={(id) => {/* Logique de suppression */}}
      />

      {showForm && (
        <UserForm
          onSuccess={() => {
            setShowForm(false);
            // Recharger les données
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
```

### 3. Utilisation des Server Actions

```tsx
import { getUserList, createUser, updateUser, deleteUser } from '@/services/user/actions';

// Dans un composant serveur
export default async function UsersPage() {
  const result = await getUserList(1, 10);
  
  if (!result.success) {
    return <div>Erreur: {result.error}</div>;
  }

  return <UserTable data={result.data.items} />;
}
```

## 🎯 Fonctionnalités avancées

### Actions en lot

```typescript
import { bulkDeleteUser, bulkUpdateUser } from '@/services/user/bulk-actions';

// Suppression en lot
const selectedIds = ['1', '2', '3'];
const result = await bulkDeleteUser(selectedIds);

// Mise à jour en lot
const updates = { isActive: false };
const result = await bulkUpdateUser(selectedIds, updates);
```

### Export/Import

```typescript
import { exportUserCSV, importUserCSV } from '@/services/user/data-actions';

// Export
const result = await exportUserCSV({ role: 'admin' });
if (result.success) {
  window.open(result.data.url);
}

// Import
const formData = new FormData();
formData.append('file', csvFile);
const result = await importUserCSV(formData);
```

### Recherche et filtrage

```typescript
import { searchUser, getUserFilterOptions } from '@/services/user/search-actions';

// Recherche
const results = await searchUser('john doe', 10);

// Options de filtrage
const options = await getUserFilterOptions();
```

## 🔍 Débogage

### Erreurs courantes

1. **Table vide** : Vérifiez que les données sont bien passées au composant
2. **Actions ne fonctionnent pas** : Vérifiez les permissions et l'authentification
3. **Tri/Filtrage ne fonctionne pas** : Vérifiez la configuration de la table

### Logs utiles

```typescript
// Dans les Server Actions
console.log('Données reçues:', formData);
console.log('Résultat validation:', validationResult);

// Dans les composants
console.log('État de la table:', table.getState());
console.log('Données filtrées:', table.getFilteredRowModel());
```

## 📚 Ressources

- [TanStack Table](https://tanstack.com/table/latest)
- [shadcn/ui Table](https://ui.shadcn.com/docs/components/table)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Zod Validation](https://zod.dev/)
