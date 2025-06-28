/**
 * Types TypeScript pour le template CRUD
 * Génère tous les types nécessaires pour les entités CRUD
 */

import { CRUDConfig, EntityField } from "./index";
import { FileTemplate } from "../types";

/**
 * Génère les types TypeScript pour une entité CRUD
 */
export function generateCRUDTypes(config: CRUDConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Types principaux de l'entité
  files.push(generateEntityTypes(config));

  // Types pour les actions
  files.push(generateActionTypes(config));

  // Types pour les hooks
  files.push(generateHookTypes(config));

  return files;
}

/**
 * Génère les types principaux de l'entité
 */
function generateEntityTypes(config: CRUDConfig): FileTemplate {
  const entityName = config.entity.name;
  const entityNameLower = entityName.toLowerCase();

  return {
    path: `shared/types/${entityNameLower}.ts`,
    content: `/**
 * Types TypeScript pour ${entityName}
 * Générés automatiquement - Ne pas modifier manuellement
 */

// Types de base pour ${entityName}
export interface ${entityName} {
  id: string;
  createdAt: Date;
  updatedAt: Date;
${generateFieldTypes(config.entity.fields)}
}

${generateFieldEnums(config)}

// Types pour les opérations CRUD
export type ${entityName}Create = Omit<${entityName}, 'id' | 'createdAt' | 'updatedAt'>;
export type ${entityName}Update = Partial<${entityName}Create>;
export type ${entityName}Keys = keyof ${entityName};
export type ${entityName}Values = ${entityName}[${entityName}Keys];

// Types pour les filtres et recherche
export interface ${entityName}Filter {
${generateFilterTypes(config.entity.fields)}
}

export interface ${entityName}SearchParams {
  query?: string;
  filters?: ${entityName}Filter;
  sort?: {
    field: ${entityName}Keys;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

// Types pour les réponses paginées
export interface ${entityName}ListResponse {
  data: ${entityName}[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Types pour les validations
export interface ${entityName}ValidationError {
  field: ${entityName}Keys;
  message: string;
  code: string;
}

export interface ${entityName}ValidationResult {
  isValid: boolean;
  errors: ${entityName}ValidationError[];
  data?: ${entityName};
}

// Types pour les permissions
export interface ${entityName}Permission {
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'import';
  resource: '${entityNameLower}';
  conditions?: Record<string, any>;
}

// Types pour les relations
${generateRelationTypes(config)}`,
  };
}

/**
 * Génère les types des champs
 */
function generateFieldTypes(fields: EntityField[]): string {
  return fields.map(field => {
    const type = getTypeScriptType(field);
    const optional = field.required ? '' : '?';
    const comment = field.description ? ` // ${field.description}` : '';

    return `  ${field.name}${optional}: ${type};${comment}`;
  }).join('\n');
}

/**
 * Convertit un type de champ en type TypeScript
 */
function getTypeScriptType(field: EntityField): string {
  switch (field.type) {
    case 'string':
    case 'email':
    case 'url':
    case 'text':
      return 'string';
    
    case 'number':
      return 'number';
    
    case 'boolean':
      return 'boolean';
    
    case 'date':
    case 'datetime':
      return 'Date';
    
    case 'json':
      return 'Record<string, any>';
    
    case 'enum':
      return `${field.name.charAt(0).toUpperCase() + field.name.slice(1)}Enum`;
    
    case 'file':
    case 'image':
      return 'string | null'; // URL du fichier
    
    case 'relation':
      return 'string'; // ID de la relation
    
    default:
      return 'string';
  }
}

/**
 * Génère les enums pour les champs enum
 */
function generateFieldEnums(config: CRUDConfig): string {
  const enumFields = config.entity.fields.filter(field => field.type === 'enum');
  
  if (enumFields.length === 0) return '';

  return enumFields.map(field => {
    const enumName = `${field.name.charAt(0).toUpperCase() + field.name.slice(1)}Enum`;
    
    // TODO: Les valeurs d'enum devraient être configurables
    const enumValues = [
      'ACTIVE = "active"',
      'INACTIVE = "inactive"',
    ];

    return `
export enum ${enumName} {
  ${enumValues.join(',\n  ')}
}

export const ${enumName}Labels = {
  [${enumName}.ACTIVE]: "Actif",
  [${enumName}.INACTIVE]: "Inactif",
} as const;`;
  }).join('\n');
}

/**
 * Génère les types de filtres
 */
function generateFilterTypes(fields: EntityField[]): string {
  return fields.filter(field => field.filterable).map(field => {
    const type = getFilterType(field);
    return `  ${field.name}?: ${type};`;
  }).join('\n');
}

/**
 * Détermine le type de filtre pour un champ
 */
function getFilterType(field: EntityField): string {
  switch (field.type) {
    case 'string':
    case 'email':
    case 'text':
      return 'string | { contains?: string; startsWith?: string; endsWith?: string }';
    
    case 'number':
      return 'number | { min?: number; max?: number; equals?: number }';
    
    case 'date':
    case 'datetime':
      return 'Date | { from?: Date; to?: Date }';
    
    case 'boolean':
      return 'boolean';
    
    case 'enum':
      const enumName = `${field.name.charAt(0).toUpperCase() + field.name.slice(1)}Enum`;
      return `${enumName} | ${enumName}[]`;
    
    default:
      return 'string';
  }
}

/**
 * Génère les types pour les relations
 */
function generateRelationTypes(config: CRUDConfig): string {
  if (config.entity.relations.length === 0) return '';

  return config.entity.relations.map(relation => {
    const relationName = relation.name;
    const targetName = relation.target;

    switch (relation.type) {
      case 'one-to-one':
        return `
// Relation one-to-one avec ${targetName}
export interface ${config.entity.name}With${targetName} extends ${config.entity.name} {
  ${relationName}: ${targetName} | null;
}`;

      case 'one-to-many':
        return `
// Relation one-to-many avec ${targetName}
export interface ${config.entity.name}With${targetName} extends ${config.entity.name} {
  ${relationName}: ${targetName} | null;
}`;

      case 'many-to-many':
        return `
// Relation many-to-many avec ${targetName}
export interface ${config.entity.name}With${targetName}s extends ${config.entity.name} {
  ${relationName}s: ${targetName}[];
}`;

      default:
        return '';
    }
  }).join('\n');
}

/**
 * Génère les types pour les actions
 */
function generateActionTypes(config: CRUDConfig): FileTemplate {
  const entityName = config.entity.name;
  const entityNameLower = entityName.toLowerCase();

  return {
    path: `shared/types/${entityNameLower}-actions.ts`,
    content: `/**
 * Types pour les actions ${entityName}
 */

import type { ${entityName}, ${entityName}Create, ${entityName}Update } from './${entityNameLower}';

// Types de base pour les actions
export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
  timestamp?: number;
}

export interface PaginatedResult<T = any> extends ActionResult<{
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}> {}

// Types spécifiques aux actions ${entityName}
export type Create${entityName}Result = ActionResult<${entityName}>;
export type Update${entityName}Result = ActionResult<${entityName}>;
export type Delete${entityName}Result = ActionResult<{ id: string }>;
export type Get${entityName}ListResult = PaginatedResult<${entityName}>;
export type Get${entityName}ByIdResult = ActionResult<${entityName}>;

// Types pour les actions en lot
export interface Bulk${entityName}Action {
  ids: string[];
  action: 'delete' | 'update' | 'export';
  data?: Partial<${entityName}Update>;
}

export type Bulk${entityName}Result = ActionResult<{
  processed: number;
  errors: Array<{ id: string; error: string }>;
}>;

// Types pour l'export/import
export interface ${entityName}ExportOptions {
  format: 'csv' | 'excel' | 'json';
  fields?: (keyof ${entityName})[];
  filters?: Record<string, any>;
}

export type ${entityName}ExportResult = ActionResult<{
  url: string;
  filename: string;
  count: number;
}>;

export interface ${entityName}ImportResult {
  imported: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
}

export type ${entityName}ImportActionResult = ActionResult<${entityName}ImportResult>;`,
  };
}

/**
 * Génère les types pour les hooks
 */
function generateHookTypes(config: CRUDConfig): FileTemplate {
  const entityName = config.entity.name;
  const entityNameLower = entityName.toLowerCase();

  return {
    path: `shared/types/${entityNameLower}-hooks.ts`,
    content: `/**
 * Types pour les hooks ${entityName}
 */

import type { ${entityName}, ${entityName}Filter, ${entityName}SearchParams } from './${entityNameLower}';
import type { ActionResult, PaginatedResult } from './${entityNameLower}-actions';

// Hook pour la table
export interface Use${entityName}TableOptions {
  initialData?: ${entityName}[];
  pageSize?: number;
  enableSelection?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
}

export interface Use${entityName}TableReturn {
  data: ${entityName}[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  sorting: {
    field: string | null;
    direction: 'asc' | 'desc' | null;
  };
  filters: ${entityName}Filter;
  selection: {
    selectedIds: string[];
    selectedItems: ${entityName}[];
    isAllSelected: boolean;
  };
  actions: {
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    setSorting: (field: string, direction: 'asc' | 'desc') => void;
    setFilters: (filters: ${entityName}Filter) => void;
    setSelection: (ids: string[]) => void;
    toggleSelection: (id: string) => void;
    selectAll: () => void;
    clearSelection: () => void;
    refresh: () => Promise<void>;
  };
}

// Hook pour les formulaires
export interface Use${entityName}FormOptions {
  mode: 'create' | 'edit';
  initialData?: Partial<${entityName}>;
  onSuccess?: (data: ${entityName}) => void;
  onError?: (error: string) => void;
}

export interface Use${entityName}FormReturn {
  form: any; // React Hook Form instance
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  errors: Record<string, string[]>;
  submit: () => Promise<void>;
  reset: () => void;
}

// Hook pour les actions
export interface Use${entityName}ActionsReturn {
  create: (data: Partial<${entityName}>) => Promise<ActionResult<${entityName}>>;
  update: (id: string, data: Partial<${entityName}>) => Promise<ActionResult<${entityName}>>;
  delete: (id: string) => Promise<ActionResult<{ id: string }>>;
  bulkDelete: (ids: string[]) => Promise<ActionResult<{ count: number }>>;
  export: (options?: any) => Promise<ActionResult<{ url: string }>>;
  import: (file: File) => Promise<ActionResult<{ imported: number }>>;
}`,
  };
}
