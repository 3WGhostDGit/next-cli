/**
 * Template de génération CRUD complet avec tables, formulaires et API
 * Génère des opérations CRUD complètes avec TanStack Table, shadcn/ui et Server Actions
 */

import { ProjectConfig, FileTemplate } from '../types';

/**
 * Configuration pour la génération CRUD
 */
export interface CRUDConfig extends ProjectConfig {
  entity: EntityDefinition;
  features: CRUDFeature[];
  table: TableConfig;
  forms: FormIntegration;
  api: APIConfig;
  permissions: PermissionConfig;
}

/**
 * Fonctionnalités CRUD disponibles
 */
export type CRUDFeature = 
  | 'pagination'
  | 'sorting'
  | 'filtering'
  | 'search'
  | 'selection'
  | 'bulk-actions'
  | 'export'
  | 'import'
  | 'inline-edit'
  | 'soft-delete'
  | 'audit-trail'
  | 'real-time'
  | 'optimistic-ui';

/**
 * Définition d'une entité
 */
export interface EntityDefinition {
  name: string;
  displayName: string;
  description?: string;
  fields: EntityField[];
  relations: EntityRelation[];
  indexes: EntityIndex[];
  constraints: EntityConstraint[];
}

/**
 * Champ d'entité
 */
export interface EntityField {
  name: string;
  type: FieldType;
  displayName: string;
  description?: string;
  required: boolean;
  unique?: boolean;
  defaultValue?: any;
  validation?: FieldValidation;
  display: FieldDisplay;
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
}

/**
 * Types de champs supportés
 */
export type FieldType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'email'
  | 'url'
  | 'text'
  | 'json'
  | 'enum'
  | 'file'
  | 'image'
  | 'relation';

/**
 * Configuration d'affichage d'un champ
 */
export interface FieldDisplay {
  showInTable: boolean;
  showInForm: boolean;
  showInDetail: boolean;
  tableWidth?: number;
  tableAlign?: 'left' | 'center' | 'right';
  formType?: 'input' | 'textarea' | 'select' | 'checkbox' | 'file' | 'date';
  placeholder?: string;
  helpText?: string;
}

/**
 * Validation d'un champ
 */
export interface FieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: string;
  messages?: Record<string, string>;
}

/**
 * Relation entre entités
 */
export interface EntityRelation {
  name: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  target: string;
  foreignKey?: string;
  onDelete?: 'cascade' | 'restrict' | 'set-null';
  display: RelationDisplay;
}

/**
 * Configuration d'affichage d'une relation
 */
export interface RelationDisplay {
  showInTable: boolean;
  showInForm: boolean;
  displayField: string;
  searchable?: boolean;
  inline?: boolean;
}

/**
 * Index de base de données
 */
export interface EntityIndex {
  name: string;
  fields: string[];
  unique?: boolean;
  type?: 'btree' | 'hash' | 'gin' | 'gist';
}

/**
 * Contrainte de base de données
 */
export interface EntityConstraint {
  name: string;
  type: 'check' | 'unique' | 'foreign-key';
  fields: string[];
  condition?: string;
}

/**
 * Configuration de la table
 */
export interface TableConfig {
  pagination: PaginationConfig;
  sorting: SortingConfig;
  filtering: FilteringConfig;
  selection: SelectionConfig;
  actions: TableAction[];
  styling: TableStyling;
}

/**
 * Configuration de pagination
 */
export interface PaginationConfig {
  enabled: boolean;
  type: 'client' | 'server';
  defaultPageSize: number;
  pageSizeOptions: number[];
  showInfo: boolean;
}

/**
 * Configuration de tri
 */
export interface SortingConfig {
  enabled: boolean;
  multiSort: boolean;
  defaultSort?: { field: string; direction: 'asc' | 'desc' }[];
}

/**
 * Configuration de filtrage
 */
export interface FilteringConfig {
  enabled: boolean;
  globalSearch: boolean;
  columnFilters: boolean;
  advancedFilters: boolean;
  savedFilters: boolean;
}

/**
 * Configuration de sélection
 */
export interface SelectionConfig {
  enabled: boolean;
  type: 'single' | 'multiple';
  showSelectAll: boolean;
  persistSelection: boolean;
}

/**
 * Action de table
 */
export interface TableAction {
  name: string;
  label: string;
  type: 'row' | 'bulk' | 'global';
  icon?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  confirmation?: string;
  permission?: string;
}

/**
 * Style de table
 */
export interface TableStyling {
  variant: 'default' | 'striped' | 'bordered' | 'compact';
  size: 'sm' | 'md' | 'lg';
  stickyHeader: boolean;
  stickyColumns?: string[];
  responsive: boolean;
}

/**
 * Intégration avec les formulaires
 */
export interface FormIntegration {
  createForm: boolean;
  editForm: boolean;
  viewForm: boolean;
  inlineEdit: boolean;
  modalForms: boolean;
  formValidation: boolean;
}

/**
 * Configuration API
 */
export interface APIConfig {
  generateRoutes: boolean;
  authentication: boolean;
  rateLimit: boolean;
  caching: boolean;
  documentation: boolean;
  versioning?: string;
}

/**
 * Configuration des permissions
 */
export interface PermissionConfig {
  enabled: boolean;
  roles: string[];
  permissions: Permission[];
  fieldLevelSecurity: boolean;
  rowLevelSecurity: boolean;
}

/**
 * Permission spécifique
 */
export interface Permission {
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'import';
  roles: string[];
  conditions?: string[];
}

/**
 * Générateur principal CRUD
 */
export class CRUDGenerator {
  constructor(private config: CRUDConfig) {}

  /**
   * Génère tous les fichiers nécessaires pour le CRUD
   */
  generate(): FileTemplate[] {
    const files: FileTemplate[] = [];

    // 1. Types et interfaces
    files.push(this.generateTypes());

    // 2. Schémas de validation
    files.push(this.generateValidationSchemas());

    // 3. Server Actions CRUD
    files.push(...this.generateServerActions());

    // 4. Composant de table
    files.push(this.generateTableComponent());

    // 5. Composants de formulaires
    if (this.config.forms.createForm || this.config.forms.editForm) {
      files.push(...this.generateFormComponents());
    }

    // 6. API Routes (optionnel)
    if (this.config.api.generateRoutes) {
      files.push(...this.generateAPIRoutes());
    }

    // 7. Hooks personnalisés
    files.push(...this.generateCustomHooks());

    // 8. Composants utilitaires
    files.push(...this.generateUtilityComponents());

    return files;
  }

  /**
   * Génère les types TypeScript
   */
  private generateTypes(): FileTemplate {
    // Implémentation dans types-generator.ts
    return {
      path: `shared/types/${this.config.entity.name.toLowerCase()}.ts`,
      content: '', // Sera implémenté
    };
  }

  /**
   * Génère les schémas de validation
   */
  private generateValidationSchemas(): FileTemplate {
    // Implémentation dans validation-generator.ts
    return {
      path: `shared/validation/${this.config.entity.name.toLowerCase()}.ts`,
      content: '', // Sera implémenté
    };
  }

  /**
   * Génère les Server Actions
   */
  private generateServerActions(): FileTemplate[] {
    // Implémentation dans actions-generator.ts
    return []; // Sera implémenté
  }

  /**
   * Génère le composant de table
   */
  private generateTableComponent(): FileTemplate {
    // Implémentation dans table-generator.ts
    return {
      path: `src/components/${this.config.entity.name.toLowerCase()}/${this.config.entity.name.toLowerCase()}-table.tsx`,
      content: '', // Sera implémenté
    };
  }

  /**
   * Génère les composants de formulaires
   */
  private generateFormComponents(): FileTemplate[] {
    // Implémentation dans form-generator.ts
    return []; // Sera implémenté
  }

  /**
   * Génère les API Routes
   */
  private generateAPIRoutes(): FileTemplate[] {
    // Implémentation dans api-generator.ts
    return []; // Sera implémenté
  }

  /**
   * Génère les hooks personnalisés
   */
  private generateCustomHooks(): FileTemplate[] {
    // Implémentation dans hooks-generator.ts
    return []; // Sera implémenté
  }

  /**
   * Génère les composants utilitaires
   */
  private generateUtilityComponents(): FileTemplate[] {
    // Implémentation dans utility-generator.ts
    return []; // Sera implémenté
  }
}

/**
 * Fonction utilitaire pour créer une configuration CRUD
 */
export function createCRUDConfig(
  entity: EntityDefinition,
  options: Partial<CRUDConfig> = {}
): CRUDConfig {
  return {
    name: entity.name,
    description: options.description || `CRUD pour ${entity.displayName}`,
    version: options.version || '1.0.0',
    entity,
    features: options.features || ['pagination', 'sorting', 'filtering', 'search'],
    table: options.table || {
      pagination: {
        enabled: true,
        type: 'server',
        defaultPageSize: 10,
        pageSizeOptions: [5, 10, 20, 50],
        showInfo: true,
      },
      sorting: {
        enabled: true,
        multiSort: false,
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
        { name: 'edit', label: 'Modifier', type: 'row', icon: 'Edit' },
        { name: 'delete', label: 'Supprimer', type: 'row', icon: 'Trash', variant: 'destructive', confirmation: 'Êtes-vous sûr de vouloir supprimer cet élément ?' },
        { name: 'create', label: 'Créer', type: 'global', icon: 'Plus' },
      ],
      styling: {
        variant: 'default',
        size: 'md',
        stickyHeader: true,
        responsive: true,
      },
    },
    forms: options.forms || {
      createForm: true,
      editForm: true,
      viewForm: true,
      inlineEdit: false,
      modalForms: true,
      formValidation: true,
    },
    api: options.api || {
      generateRoutes: true,
      authentication: true,
      rateLimit: true,
      caching: false,
      documentation: false,
    },
    permissions: options.permissions || {
      enabled: false,
      roles: [],
      permissions: [],
      fieldLevelSecurity: false,
      rowLevelSecurity: false,
    },
    ...options,
  };
}
