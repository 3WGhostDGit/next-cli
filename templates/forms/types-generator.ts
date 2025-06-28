/**
 * Générateur de types TypeScript pour les formulaires
 * Crée des types cohérents pour les formulaires, actions et états
 */

import { FormConfig, FormField, FieldType } from './index';
import { FileTemplate } from '../types';

/**
 * Générateur de types TypeScript
 */
export class TypesGenerator {
  constructor(private config: FormConfig) {}

  /**
   * Génère le fichier de types
   */
  generate(): FileTemplate {
    return {
      path: `shared/types/${this.config.name.toLowerCase()}.ts`,
      content: this.generateTypesContent(),
    };
  }

  /**
   * Génère le contenu des types
   */
  private generateTypesContent(): string {
    const baseTypes = this.generateBaseTypes();
    const formTypes = this.generateFormTypes();
    const actionTypes = this.generateActionTypes();
    const utilityTypes = this.generateUtilityTypes();

    return `/**
 * Types TypeScript pour ${this.config.name}
 * Générés automatiquement - Ne pas modifier manuellement
 */

${baseTypes}

${formTypes}

${actionTypes}

${utilityTypes}`;
  }

  /**
   * Génère les types de base
   */
  private generateBaseTypes(): string {
    const entityInterface = this.generateEntityInterface();
    const fieldEnums = this.generateFieldEnums();

    return `// Types de base pour ${this.config.name}
${entityInterface}

${fieldEnums}`;
  }

  /**
   * Génère l'interface principale de l'entité
   */
  private generateEntityInterface(): string {
    const fields = this.config.fields.map(field => this.generateFieldType(field)).join('\n');

    return `export interface ${this.config.name} {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
${fields}
}`;
  }

  /**
   * Génère le type pour un champ spécifique
   */
  private generateFieldType(field: FormField): string {
    const type = this.getTypeScriptType(field.type, field);
    const optional = field.required ? '' : '?';
    const comment = field.description ? ` // ${field.description}` : '';

    return `  ${field.name}${optional}: ${type};${comment}`;
  }

  /**
   * Convertit un FieldType en type TypeScript
   */
  private getTypeScriptType(fieldType: FieldType, field: FormField): string {
    switch (fieldType) {
      case 'text':
      case 'email':
      case 'password':
      case 'textarea':
      case 'date':
      case 'datetime':
        return 'string';
      
      case 'number':
      case 'slider':
        return 'number';
      
      case 'checkbox':
      case 'switch':
        return 'boolean';
      
      case 'select':
      case 'radio':
        if (field.options) {
          const values = field.options.map(opt => `"${opt.value}"`).join(' | ');
          return values;
        }
        return 'string';
      
      case 'multiselect':
        if (field.options) {
          const values = field.options.map(opt => `"${opt.value}"`).join(' | ');
          return `(${values})[]`;
        }
        return 'string[]';
      
      case 'file':
        return 'File | null';
      
      case 'combobox':
        return 'string';
      
      default:
        return 'string';
    }
  }

  /**
   * Génère les enums pour les champs avec options
   */
  private generateFieldEnums(): string {
    const enums = this.config.fields
      .filter(field => field.options && ['select', 'radio', 'multiselect'].includes(field.type))
      .map(field => this.generateFieldEnum(field))
      .join('\n\n');

    return enums ? `// Enums pour les champs avec options\n${enums}` : '';
  }

  /**
   * Génère un enum pour un champ avec options
   */
  private generateFieldEnum(field: FormField): string {
    if (!field.options) return '';

    const enumName = `${this.config.name}${this.capitalize(field.name)}`;
    const values = field.options.map(option => 
      `  ${option.value.toUpperCase().replace(/[^A-Z0-9]/g, '_')} = "${option.value}",`
    ).join('\n');

    return `export enum ${enumName} {
${values}
}

export const ${enumName}Labels = {
${field.options.map(option => 
  `  [${enumName}.${option.value.toUpperCase().replace(/[^A-Z0-9]/g, '_')}]: "${option.label}",`
).join('\n')}
} as const;`;
  }

  /**
   * Génère les types liés aux formulaires
   */
  private generateFormTypes(): string {
    return `// Types pour les formulaires
export interface ${this.config.name}FormProps {
  defaultValues?: Partial<${this.config.name}>;
  onSuccess?: (data: ${this.config.name}) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

export interface ${this.config.name}FormState {
  isSubmitting: boolean;
  errors: Record<string, string[]>;
  success: boolean;
  message?: string;
}

export interface ${this.config.name}FormContext {
  form: any; // UseFormReturn type
  state: ${this.config.name}FormState;
  isPending: boolean;
}`;
  }

  /**
   * Génère les types liés aux actions
   */
  private generateActionTypes(): string {
    const actionTypes = this.config.actions.map(action => {
      const actionName = `${this.capitalize(action.name)}${this.config.name}Action`;
      
      return `export type ${actionName}Result = {
  success: boolean;
  data?: ${this.config.name};
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
};

export type ${actionName}Input = ${action.type === 'update' ? 'Partial<' : ''}${this.config.name}${action.type === 'update' ? '>' : ''};`;
    }).join('\n\n');

    return `// Types pour les Server Actions
export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
  timestamp?: number;
}

${actionTypes}`;
  }

  /**
   * Génère les types utilitaires
   */
  private generateUtilityTypes(): string {
    return `// Types utilitaires
export type ${this.config.name}Keys = keyof ${this.config.name};

export type ${this.config.name}Values = ${this.config.name}[${this.config.name}Keys];

export type Partial${this.config.name} = Partial<${this.config.name}>;

export type Required${this.config.name} = Required<${this.config.name}>;

export type ${this.config.name}Create = Omit<${this.config.name}, 'id' | 'createdAt' | 'updatedAt'>;

export type ${this.config.name}Update = Partial<${this.config.name}Create>;

// Types pour les validations
export interface ${this.config.name}ValidationError {
  field: ${this.config.name}Keys;
  message: string;
  code: string;
}

export interface ${this.config.name}ValidationResult {
  isValid: boolean;
  errors: ${this.config.name}ValidationError[];
  data?: ${this.config.name};
}

// Types pour les filtres et recherche
export interface ${this.config.name}Filter {
${this.generateFilterFields()}
}

export interface ${this.config.name}SearchParams {
  query?: string;
  filters?: ${this.config.name}Filter;
  sort?: {
    field: ${this.config.name}Keys;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

// Types pour les réponses API
export interface ${this.config.name}ListResponse {
  data: ${this.config.name}[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ${this.config.name}Response {
  data: ${this.config.name};
  message?: string;
}`;
  }

  /**
   * Génère les champs de filtre
   */
  private generateFilterFields(): string {
    return this.config.fields.map(field => {
      const type = this.getFilterType(field);
      return `  ${field.name}?: ${type};`;
    }).join('\n');
  }

  /**
   * Détermine le type de filtre pour un champ
   */
  private getFilterType(field: FormField): string {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'textarea':
        return 'string | { contains?: string; startsWith?: string; endsWith?: string }';
      
      case 'number':
      case 'slider':
        return 'number | { min?: number; max?: number; equals?: number }';
      
      case 'date':
      case 'datetime':
        return 'string | { from?: string; to?: string }';
      
      case 'checkbox':
      case 'switch':
        return 'boolean';
      
      case 'select':
      case 'radio':
        if (field.options) {
          const values = field.options.map(opt => `"${opt.value}"`).join(' | ');
          return `${values} | (${values})[]`;
        }
        return 'string | string[]';
      
      case 'multiselect':
        return 'string[]';
      
      default:
        return 'string';
    }
  }

  /**
   * Capitalise la première lettre d'une chaîne
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Générateur de types pour les hooks personnalisés
 */
export class HookTypesGenerator {
  constructor(private config: FormConfig) {}

  /**
   * Génère les types pour les hooks personnalisés
   */
  generate(): FileTemplate {
    return {
      path: `shared/types/${this.config.name.toLowerCase()}-hooks.ts`,
      content: `/**
 * Types pour les hooks personnalisés de ${this.config.name}
 */

import type { ${this.config.name}, ActionResult } from './${this.config.name.toLowerCase()}';

// Hook useActionState personnalisé
export interface Use${this.config.name}ActionState {
  state: ActionResult<${this.config.name}>;
  action: (formData: FormData) => void;
  isPending: boolean;
  reset: () => void;
}

// Hook pour gestion optimiste
export interface Use${this.config.name}Optimistic {
  optimisticData: ${this.config.name}[];
  addOptimistic: (data: ${this.config.name}) => void;
  removeOptimistic: (id: string) => void;
  updateOptimistic: (id: string, data: Partial<${this.config.name}>) => void;
}

// Hook pour auto-save
export interface Use${this.config.name}AutoSave {
  isDirty: boolean;
  isSaving: boolean;
  lastSaved?: Date;
  save: () => Promise<void>;
  enableAutoSave: (enabled: boolean) => void;
}

// Hook pour validation en temps réel
export interface Use${this.config.name}Validation {
  errors: Record<string, string[]>;
  isValid: boolean;
  validateField: (field: string, value: any) => Promise<boolean>;
  validateAll: () => Promise<boolean>;
  clearErrors: (field?: string) => void;
}`,
    };
  }
}
