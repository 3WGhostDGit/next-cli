/**
 * Exemples d'utilisation du générateur CRUD
 * Démontre les différents cas d'usage et configurations
 */

import { CRUDGenerator, createCRUDConfig } from './index';
import type { EntityDefinition, EntityField } from './index';

/**
 * Exemple 1: CRUD simple pour les utilisateurs
 */
export function generateUserCRUD() {
  const userEntity: EntityDefinition = {
    name: 'User',
    displayName: 'Utilisateur',
    description: 'Gestion des utilisateurs de l\'application',
    fields: [
      {
        name: 'firstName',
        type: 'string',
        displayName: 'Prénom',
        required: true,
        validation: { minLength: 2, maxLength: 50 },
        display: {
          showInTable: true,
          showInForm: true,
          showInDetail: true,
          tableWidth: 150,
          formType: 'input',
          placeholder: 'Entrez le prénom',
        },
        searchable: true,
        sortable: true,
        filterable: false,
      },
      {
        name: 'lastName',
        type: 'string',
        displayName: 'Nom',
        required: true,
        validation: { minLength: 2, maxLength: 50 },
        display: {
          showInTable: true,
          showInForm: true,
          showInDetail: true,
          tableWidth: 150,
          formType: 'input',
          placeholder: 'Entrez le nom',
        },
        searchable: true,
        sortable: true,
        filterable: false,
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
          tableWidth: 200,
          formType: 'input',
          placeholder: 'nom@exemple.com',
        },
        searchable: true,
        sortable: true,
        filterable: false,
      },
      {
        name: 'role',
        type: 'enum',
        displayName: 'Rôle',
        required: true,
        defaultValue: 'user',
        display: {
          showInTable: true,
          showInForm: true,
          showInDetail: true,
          tableWidth: 100,
          formType: 'select',
        },
        searchable: false,
        sortable: true,
        filterable: true,
      },
      {
        name: 'isActive',
        type: 'boolean',
        displayName: 'Actif',
        required: true,
        defaultValue: true,
        display: {
          showInTable: true,
          showInForm: true,
          showInDetail: true,
          tableWidth: 80,
          formType: 'checkbox',
        },
        searchable: false,
        sortable: true,
        filterable: true,
      },
      {
        name: 'createdAt',
        type: 'datetime',
        displayName: 'Créé le',
        required: true,
        display: {
          showInTable: true,
          showInForm: false,
          showInDetail: true,
          tableWidth: 150,
        },
        searchable: false,
        sortable: true,
        filterable: true,
      },
    ],
    relations: [],
    indexes: [
      { name: 'idx_user_email', fields: ['email'], unique: true },
      { name: 'idx_user_role', fields: ['role'] },
    ],
    constraints: [
      { name: 'unique_email', type: 'unique', fields: ['email'] },
    ],
  };

  const config = createCRUDConfig(userEntity, {
    features: ['pagination', 'sorting', 'filtering', 'search', 'selection', 'bulk-actions', 'export'],
    permissions: {
      enabled: true,
      roles: ['admin', 'manager'],
      permissions: [
        { action: 'create', roles: ['admin', 'manager'] },
        { action: 'read', roles: ['admin', 'manager', 'user'] },
        { action: 'update', roles: ['admin', 'manager'] },
        { action: 'delete', roles: ['admin'] },
        { action: 'export', roles: ['admin', 'manager'] },
      ],
      fieldLevelSecurity: false,
      rowLevelSecurity: false,
    },
  });

  const generator = new CRUDGenerator(config);
  return generator.generate();
}

/**
 * Exemple 2: CRUD avancé pour les produits avec relations
 */
export function generateProductCRUD() {
  const productEntity: EntityDefinition = {
    name: 'Product',
    displayName: 'Produit',
    description: 'Gestion du catalogue de produits',
    fields: [
      {
        name: 'name',
        type: 'string',
        displayName: 'Nom',
        required: true,
        validation: { minLength: 3, maxLength: 100 },
        display: {
          showInTable: true,
          showInForm: true,
          showInDetail: true,
          tableWidth: 200,
          formType: 'input',
        },
        searchable: true,
        sortable: true,
        filterable: false,
      },
      {
        name: 'description',
        type: 'text',
        displayName: 'Description',
        required: true,
        validation: { minLength: 10, maxLength: 1000 },
        display: {
          showInTable: false,
          showInForm: true,
          showInDetail: true,
          formType: 'textarea',
          placeholder: 'Description détaillée du produit',
        },
        searchable: true,
        sortable: false,
        filterable: false,
      },
      {
        name: 'price',
        type: 'number',
        displayName: 'Prix (€)',
        required: true,
        validation: { min: 0.01, max: 99999.99 },
        display: {
          showInTable: true,
          showInForm: true,
          showInDetail: true,
          tableWidth: 100,
          tableAlign: 'right',
          formType: 'input',
        },
        searchable: false,
        sortable: true,
        filterable: true,
      },
      {
        name: 'categoryId',
        type: 'relation',
        displayName: 'Catégorie',
        required: true,
        display: {
          showInTable: true,
          showInForm: true,
          showInDetail: true,
          tableWidth: 150,
          formType: 'select',
        },
        searchable: false,
        sortable: true,
        filterable: true,
      },
      {
        name: 'stock',
        type: 'number',
        displayName: 'Stock',
        required: true,
        validation: { min: 0 },
        display: {
          showInTable: true,
          showInForm: true,
          showInDetail: true,
          tableWidth: 80,
          tableAlign: 'center',
          formType: 'input',
        },
        searchable: false,
        sortable: true,
        filterable: true,
      },
      {
        name: 'isActive',
        type: 'boolean',
        displayName: 'Actif',
        required: true,
        defaultValue: true,
        display: {
          showInTable: true,
          showInForm: true,
          showInDetail: true,
          tableWidth: 80,
          formType: 'checkbox',
        },
        searchable: false,
        sortable: true,
        filterable: true,
      },
      {
        name: 'images',
        type: 'json',
        displayName: 'Images',
        required: false,
        display: {
          showInTable: false,
          showInForm: true,
          showInDetail: true,
          formType: 'file',
          helpText: 'Sélectionnez plusieurs images (JPG, PNG)',
        },
        searchable: false,
        sortable: false,
        filterable: false,
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
    indexes: [
      { name: 'idx_product_category', fields: ['categoryId'] },
      { name: 'idx_product_price', fields: ['price'] },
      { name: 'idx_product_stock', fields: ['stock'] },
    ],
    constraints: [],
  };

  const config = createCRUDConfig(productEntity, {
    features: [
      'pagination',
      'sorting',
      'filtering',
      'search',
      'selection',
      'bulk-actions',
      'export',
      'import',
      'inline-edit',
      'optimistic-ui',
    ],
    table: {
      pagination: {
        enabled: true,
        type: 'server',
        defaultPageSize: 20,
        pageSizeOptions: [10, 20, 50, 100],
        showInfo: true,
      },
      sorting: {
        enabled: true,
        multiSort: true,
        defaultSort: [{ field: 'name', direction: 'asc' }],
      },
      filtering: {
        enabled: true,
        globalSearch: true,
        columnFilters: true,
        advancedFilters: true,
        savedFilters: true,
      },
      selection: {
        enabled: true,
        type: 'multiple',
        showSelectAll: true,
        persistSelection: true,
      },
      actions: [
        { name: 'view', label: 'Voir', type: 'row', icon: 'Eye' },
        { name: 'edit', label: 'Modifier', type: 'row', icon: 'Edit' },
        { name: 'duplicate', label: 'Dupliquer', type: 'row', icon: 'Copy' },
        { name: 'delete', label: 'Supprimer', type: 'row', icon: 'Trash', variant: 'destructive', confirmation: 'Supprimer ce produit ?' },
        { name: 'create', label: 'Nouveau produit', type: 'global', icon: 'Plus' },
        { name: 'import', label: 'Importer', type: 'global', icon: 'Upload', variant: 'outline' },
        { name: 'export', label: 'Exporter', type: 'bulk', icon: 'Download', variant: 'outline' },
        { name: 'bulkDelete', label: 'Supprimer', type: 'bulk', icon: 'Trash', variant: 'destructive', confirmation: 'Supprimer les produits sélectionnés ?' },
      ],
      styling: {
        variant: 'default',
        size: 'md',
        stickyHeader: true,
        stickyColumns: ['name'],
        responsive: true,
      },
    },
    forms: {
      createForm: true,
      editForm: true,
      viewForm: true,
      inlineEdit: true,
      modalForms: true,
      formValidation: true,
    },
    api: {
      generateRoutes: true,
      authentication: true,
      rateLimit: true,
      caching: true,
      documentation: true,
      versioning: 'v1',
    },
  });

  const generator = new CRUDGenerator(config);
  return generator.generate();
}

/**
 * Exemple 3: CRUD simple pour les articles de blog
 */
export function generateBlogCRUD() {
  const blogEntity: EntityDefinition = {
    name: 'Post',
    displayName: 'Article',
    description: 'Gestion des articles de blog',
    fields: [
      {
        name: 'title',
        type: 'string',
        displayName: 'Titre',
        required: true,
        validation: { minLength: 5, maxLength: 200 },
        display: {
          showInTable: true,
          showInForm: true,
          showInDetail: true,
          tableWidth: 300,
          formType: 'input',
        },
        searchable: true,
        sortable: true,
        filterable: false,
      },
      {
        name: 'slug',
        type: 'string',
        displayName: 'Slug',
        required: true,
        unique: true,
        validation: { pattern: '^[a-z0-9-]+$' },
        display: {
          showInTable: false,
          showInForm: true,
          showInDetail: true,
          formType: 'input',
          helpText: 'URL-friendly version du titre',
        },
        searchable: false,
        sortable: false,
        filterable: false,
      },
      {
        name: 'content',
        type: 'text',
        displayName: 'Contenu',
        required: true,
        display: {
          showInTable: false,
          showInForm: true,
          showInDetail: true,
          formType: 'textarea',
        },
        searchable: true,
        sortable: false,
        filterable: false,
      },
      {
        name: 'status',
        type: 'enum',
        displayName: 'Statut',
        required: true,
        defaultValue: 'draft',
        display: {
          showInTable: true,
          showInForm: true,
          showInDetail: true,
          tableWidth: 100,
          formType: 'select',
        },
        searchable: false,
        sortable: true,
        filterable: true,
      },
      {
        name: 'publishedAt',
        type: 'datetime',
        displayName: 'Publié le',
        required: false,
        display: {
          showInTable: true,
          showInForm: true,
          showInDetail: true,
          tableWidth: 150,
          formType: 'date',
        },
        searchable: false,
        sortable: true,
        filterable: true,
      },
    ],
    relations: [],
    indexes: [
      { name: 'idx_post_slug', fields: ['slug'], unique: true },
      { name: 'idx_post_status', fields: ['status'] },
      { name: 'idx_post_published', fields: ['publishedAt'] },
    ],
    constraints: [
      { name: 'unique_slug', type: 'unique', fields: ['slug'] },
    ],
  };

  const config = createCRUDConfig(blogEntity, {
    features: ['pagination', 'sorting', 'filtering', 'search', 'soft-delete', 'audit-trail'],
    table: {
      pagination: {
        enabled: true,
        type: 'server',
        defaultPageSize: 15,
        pageSizeOptions: [5, 15, 30],
        showInfo: true,
      },
      sorting: {
        enabled: true,
        multiSort: false,
        defaultSort: [{ field: 'publishedAt', direction: 'desc' }],
      },
      filtering: {
        enabled: true,
        globalSearch: true,
        columnFilters: true,
        advancedFilters: false,
        savedFilters: false,
      },
      selection: {
        enabled: true,
        type: 'multiple',
        showSelectAll: true,
        persistSelection: false,
      },
      actions: [
        { name: 'view', label: 'Voir', type: 'row', icon: 'Eye' },
        { name: 'edit', label: 'Modifier', type: 'row', icon: 'Edit' },
        { name: 'publish', label: 'Publier', type: 'row', icon: 'Send', permission: 'publish' },
        { name: 'delete', label: 'Supprimer', type: 'row', icon: 'Trash', variant: 'destructive' },
        { name: 'create', label: 'Nouvel article', type: 'global', icon: 'Plus' },
      ],
      styling: {
        variant: 'default',
        size: 'md',
        stickyHeader: true,
        responsive: true,
      },
    },
  });

  const generator = new CRUDGenerator(config);
  return generator.generate();
}

/**
 * Utilitaire pour tester la génération de tous les exemples CRUD
 */
export function generateAllCRUDExamples() {
  return {
    user: generateUserCRUD(),
    product: generateProductCRUD(),
    blog: generateBlogCRUD(),
  };
}
