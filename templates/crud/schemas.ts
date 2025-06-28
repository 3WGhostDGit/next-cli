/**
 * Générateur de schémas Zod pour le template CRUD
 * Crée des schémas de validation cohérents pour les entités
 */

import { CRUDConfig, EntityField } from "./index";
import { FileTemplate } from "../types";

/**
 * Génère les schémas Zod pour une entité CRUD
 */
export function generateCRUDSchemas(config: CRUDConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Schémas principaux de validation
  files.push(generateMainSchemas(config));

  // Schémas pour les filtres et recherche
  files.push(generateFilterSchemas(config));

  return files;
}

/**
 * Génère les schémas principaux de validation
 */
function generateMainSchemas(config: CRUDConfig): FileTemplate {
  const entityName = config.entity.name;
  const entityNameLower = entityName.toLowerCase();

  return {
    path: `shared/validation/${entityNameLower}.ts`,
    content: `/**
 * Schémas de validation Zod pour ${entityName}
 * Générés automatiquement - Ne pas modifier manuellement
 */

import { z } from "zod";

${generateFieldSchemas(config.entity.fields)}

// Schéma principal pour ${entityName}
export const ${entityNameLower}Schema = z.object({
${generateObjectSchema(config.entity.fields, false)}
});

// Schéma pour la création (sans id, createdAt, updatedAt)
export const ${entityNameLower}CreateSchema = ${entityNameLower}Schema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schéma pour la mise à jour (tous les champs optionnels sauf id)
export const ${entityNameLower}UpdateSchema = ${entityNameLower}CreateSchema.partial();

// Schéma pour les IDs
export const ${entityNameLower}IdSchema = z.object({
  id: z.string().uuid("ID invalide"),
});

// Schéma pour les paramètres de pagination
export const ${entityNameLower}PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

// Schéma pour les paramètres de tri
export const ${entityNameLower}SortSchema = z.object({
  field: z.enum([${getSortableFields(config.entity.fields).map(f => `"${f}"`).join(', ')}]),
  direction: z.enum(["asc", "desc"]).default("asc"),
});

// Types inférés des schémas
export type ${entityName}FormData = z.infer<typeof ${entityNameLower}Schema>;
export type ${entityName}CreateData = z.infer<typeof ${entityNameLower}CreateSchema>;
export type ${entityName}UpdateData = z.infer<typeof ${entityNameLower}UpdateSchema>;
export type ${entityName}PaginationParams = z.infer<typeof ${entityNameLower}PaginationSchema>;
export type ${entityName}SortParams = z.infer<typeof ${entityNameLower}SortSchema>;

// Schémas pour les actions en lot
export const ${entityNameLower}BulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "Au moins un élément doit être sélectionné"),
});

export const ${entityNameLower}BulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "Au moins un élément doit être sélectionné"),
  data: ${entityNameLower}UpdateSchema,
});

// Schémas pour l'export
export const ${entityNameLower}ExportSchema = z.object({
  format: z.enum(["csv", "excel", "json"]).default("csv"),
  fields: z.array(z.string()).optional(),
  filters: z.record(z.any()).optional(),
});

// Types pour les actions en lot
export type ${entityName}BulkDeleteData = z.infer<typeof ${entityNameLower}BulkDeleteSchema>;
export type ${entityName}BulkUpdateData = z.infer<typeof ${entityNameLower}BulkUpdateSchema>;
export type ${entityName}ExportData = z.infer<typeof ${entityNameLower}ExportSchema>;`,
  };
}

/**
 * Génère les schémas individuels pour chaque champ
 */
function generateFieldSchemas(fields: EntityField[]): string {
  const enumFields = fields.filter(field => field.type === 'enum');
  
  if (enumFields.length === 0) return '';

  return enumFields.map(field => {
    const enumName = `${field.name}Enum`;
    // TODO: Les valeurs d'enum devraient être configurables
    const enumValues = ['active', 'inactive'];

    return `// Enum pour ${field.displayName}
export const ${enumName} = z.enum([${enumValues.map(v => `"${v}"`).join(', ')}]);`;
  }).join('\n\n') + '\n\n';
}

/**
 * Génère le schéma d'objet principal
 */
function generateObjectSchema(fields: EntityField[], includeSystemFields: boolean = true): string {
  const schemaFields: string[] = [];

  // Champs système
  if (includeSystemFields) {
    schemaFields.push('  id: z.string().uuid(),');
    schemaFields.push('  createdAt: z.date(),');
    schemaFields.push('  updatedAt: z.date(),');
  }

  // Champs de l'entité
  fields.forEach(field => {
    const fieldSchema = generateFieldSchema(field);
    schemaFields.push(`  ${field.name}: ${fieldSchema},`);
  });

  return schemaFields.join('\n');
}

/**
 * Génère le schéma Zod pour un champ spécifique
 */
function generateFieldSchema(field: EntityField): string {
  let schema = getBaseSchema(field);

  // Ajouter les validations
  if (field.validation) {
    schema = addValidations(schema, field);
  }

  // Ajouter les messages personnalisés
  if (field.validation?.messages) {
    schema = addCustomMessages(schema, field.validation.messages);
  }

  // Rendre optionnel si nécessaire
  if (!field.required) {
    schema += '.optional()';
  }

  // Ajouter une valeur par défaut
  if (field.defaultValue !== undefined) {
    const defaultValue = typeof field.defaultValue === 'string' 
      ? `"${field.defaultValue}"` 
      : field.defaultValue;
    schema += `.default(${defaultValue})`;
  }

  return schema;
}

/**
 * Retourne le schéma de base selon le type de champ
 */
function getBaseSchema(field: EntityField): string {
  switch (field.type) {
    case 'string':
      return 'z.string()';
    
    case 'email':
      return 'z.string().email("Email invalide")';
    
    case 'url':
      return 'z.string().url("URL invalide")';
    
    case 'text':
      return 'z.string()';
    
    case 'number':
      return 'z.number()';
    
    case 'boolean':
      return 'z.boolean()';
    
    case 'date':
      return 'z.date()';
    
    case 'datetime':
      return 'z.date()';
    
    case 'json':
      return 'z.record(z.any())';
    
    case 'enum':
      return `${field.name}Enum`;
    
    case 'file':
    case 'image':
      return 'z.string().url("URL de fichier invalide")';
    
    case 'relation':
      return 'z.string().uuid("ID de relation invalide")';
    
    default:
      return 'z.string()';
  }
}

/**
 * Ajoute les validations au schéma
 */
function addValidations(schema: string, field: EntityField): string {
  const validation = field.validation!;

  switch (field.type) {
    case 'string':
    case 'email':
    case 'text':
      if (validation.minLength) {
        schema += `.min(${validation.minLength}, "Minimum ${validation.minLength} caractères")`;
      }
      if (validation.maxLength) {
        schema += `.max(${validation.maxLength}, "Maximum ${validation.maxLength} caractères")`;
      }
      if (validation.pattern) {
        schema += `.regex(/${validation.pattern}/, "Format invalide")`;
      }
      break;

    case 'number':
      if (validation.min !== undefined) {
        schema += `.min(${validation.min}, "Minimum ${validation.min}")`;
      }
      if (validation.max !== undefined) {
        schema += `.max(${validation.max}, "Maximum ${validation.max}")`;
      }
      break;
  }

  return schema;
}

/**
 * Ajoute les messages personnalisés
 */
function addCustomMessages(schema: string, messages: Record<string, string>): string {
  // Pour l'instant, les messages sont intégrés dans les validations
  // TODO: Implémenter un système de messages personnalisés plus avancé
  return schema;
}

/**
 * Retourne les champs triables
 */
function getSortableFields(fields: EntityField[]): string[] {
  const sortableFields = fields.filter(field => field.sortable).map(field => field.name);
  
  // Ajouter les champs système
  sortableFields.push('createdAt', 'updatedAt');
  
  return sortableFields;
}

/**
 * Génère les schémas pour les filtres et recherche
 */
function generateFilterSchemas(config: CRUDConfig): FileTemplate {
  const entityName = config.entity.name;
  const entityNameLower = entityName.toLowerCase();

  return {
    path: `shared/validation/${entityNameLower}-filters.ts`,
    content: `/**
 * Schémas de validation pour les filtres ${entityName}
 */

import { z } from "zod";

// Schéma pour les filtres de base
export const ${entityNameLower}FilterSchema = z.object({
${generateFilterSchema(config.entity.fields)}
}).partial();

// Schéma pour la recherche globale
export const ${entityNameLower}SearchSchema = z.object({
  query: z.string().optional(),
  filters: ${entityNameLower}FilterSchema.optional(),
  sort: z.array(z.object({
    field: z.string(),
    direction: z.enum(["asc", "desc"]),
  })).optional(),
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
  }).optional(),
});

// Schéma pour les filtres avancés
export const ${entityNameLower}AdvancedFilterSchema = z.object({
  // Filtres par date
  dateRange: z.object({
    field: z.enum(["createdAt", "updatedAt"]),
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
  
  // Filtres par valeurs multiples
  multiSelect: z.record(z.array(z.string())).optional(),
  
  // Filtres par plage numérique
  numberRange: z.record(z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  })).optional(),
});

// Types inférés
export type ${entityName}FilterData = z.infer<typeof ${entityNameLower}FilterSchema>;
export type ${entityName}SearchData = z.infer<typeof ${entityNameLower}SearchSchema>;
export type ${entityName}AdvancedFilterData = z.infer<typeof ${entityNameLower}AdvancedFilterSchema>;`,
  };
}

/**
 * Génère le schéma pour les filtres
 */
function generateFilterSchema(fields: EntityField[]): string {
  const filterableFields = fields.filter(field => field.filterable);

  return filterableFields.map(field => {
    let filterSchema = '';

    switch (field.type) {
      case 'string':
      case 'email':
      case 'text':
        filterSchema = 'z.union([z.string(), z.object({ contains: z.string().optional(), startsWith: z.string().optional(), endsWith: z.string().optional() })])';
        break;

      case 'number':
        filterSchema = 'z.union([z.number(), z.object({ min: z.number().optional(), max: z.number().optional(), equals: z.number().optional() })])';
        break;

      case 'boolean':
        filterSchema = 'z.boolean()';
        break;

      case 'date':
      case 'datetime':
        filterSchema = 'z.union([z.date(), z.object({ from: z.date().optional(), to: z.date().optional() })])';
        break;

      case 'enum':
        filterSchema = `z.union([${field.name}Enum, z.array(${field.name}Enum)])`;
        break;

      default:
        filterSchema = 'z.string()';
    }

    return `  ${field.name}: ${filterSchema},`;
  }).join('\n');
}
