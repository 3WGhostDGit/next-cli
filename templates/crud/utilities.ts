/**
 * Utilitaires pour le template CRUD
 * Fonctions helper et utilitaires réutilisables
 */

import { CRUDConfig, EntityField } from "./index";
import { FileTemplate } from "../types";

/**
 * Génère les utilitaires pour une entité CRUD
 */
export function generateCRUDUtilities(config: CRUDConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Utilitaires principaux
  files.push(generateMainUtilities(config));

  // Utilitaires de formatage
  files.push(generateFormattingUtilities(config));

  // Utilitaires de validation
  files.push(generateValidationUtilities(config));

  return files;
}

/**
 * Génère les utilitaires principaux
 */
function generateMainUtilities(config: CRUDConfig): FileTemplate {
  const entityName = config.entity.name;
  const entityNameLower = entityName.toLowerCase();

  return {
    path: `src/lib/${entityNameLower}-utils.ts`,
    content: `/**
 * Utilitaires pour ${entityName}
 * Fonctions helper pour les opérations CRUD
 */

import type { ${entityName}, ${entityName}Filter, ${entityName}SearchParams } from "@/shared/types/${entityNameLower}";

/**
 * Construit la clause WHERE pour les requêtes Prisma
 */
export function build${entityName}WhereClause(
  search?: string,
  filters?: ${entityName}Filter
): Record<string, any> {
  const where: any = {};

  ${config.features.includes('soft-delete') ? `
  // Exclure les éléments supprimés logiquement
  where.deletedAt = null;
  ` : ''}

  // Recherche globale
  if (search && search.trim()) {
    const searchFields = [${getSearchableFields(config.entity.fields).map(f => `"${f}"`).join(', ')}];
    where.OR = searchFields.map(field => ({
      [field]: {
        contains: search.trim(),
        mode: 'insensitive',
      },
    }));
  }

  // Filtres spécifiques
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object' && !Array.isArray(value)) {
          // Filtres complexes (range, contains, etc.)
          where[key] = value;
        } else {
          // Filtres simples
          where[key] = value;
        }
      }
    });
  }

  return where;
}

/**
 * Construit la clause ORDER BY pour les requêtes Prisma
 */
export function build${entityName}OrderByClause(
  sort?: { field: string; direction: 'asc' | 'desc' }[]
): Record<string, any>[] {
  if (!sort || sort.length === 0) {
    return [{ createdAt: 'desc' }];
  }

  return sort.map(({ field, direction }) => ({
    [field]: direction,
  }));
}

/**
 * Traite les données du formulaire pour les convertir aux bons types
 */
export function process${entityName}FormData(rawData: Record<string, any>): Record<string, any> {
  const processed = { ...rawData };

  ${generateDataProcessing(config.entity.fields)}

  return processed;
}

/**
 * Valide les permissions pour une action sur ${entityName}
 */
export function validate${entityName}Permission(
  action: 'create' | 'read' | 'update' | 'delete',
  userRoles: string[],
  item?: ${entityName}
): boolean {
  ${generatePermissionValidation(config)}
}

/**
 * Génère un slug unique pour ${entityName}
 */
export function generate${entityName}Slug(title: string, existingSlugs: string[] = []): string {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = \`\${baseSlug}-\${counter}\`;
    counter++;
  }

  return slug;
}

/**
 * Calcule les statistiques pour ${entityName}
 */
export function calculate${entityName}Stats(items: ${entityName}[]): {
  total: number;
  ${generateStatsFields(config.entity.fields)}
} {
  return {
    total: items.length,
    ${generateStatsCalculations(config.entity.fields)}
  };
}

/**
 * Exporte ${entityName} au format CSV
 */
export function export${entityName}ToCSV(items: ${entityName}[]): string {
  if (items.length === 0) return '';

  const headers = [${getExportableFields(config.entity.fields).map(f => `"${f.displayName}"`).join(', ')}];
  const rows = items.map(item => [
    ${getExportableFields(config.entity.fields).map(f => `format${entityName}FieldForExport(item.${f.name}, "${f.type}")`).join(',\n    ')}
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => \`"\${String(cell).replace(/"/g, '""')}"\`).join(','))
    .join('\\n');
}

/**
 * Formate un champ pour l'export
 */
function format${entityName}FieldForExport(value: any, type: string): string {
  if (value === null || value === undefined) return '';

  switch (type) {
    case 'date':
    case 'datetime':
      return value instanceof Date ? value.toISOString() : String(value);
    case 'boolean':
      return value ? 'Oui' : 'Non';
    case 'json':
      return JSON.stringify(value);
    default:
      return String(value);
  }
}

/**
 * Parse un fichier CSV pour l'import de ${entityName}
 */
export function parse${entityName}CSV(csvContent: string): {
  data: Partial<${entityName}>[];
  errors: Array<{ row: number; field?: string; message: string }>;
} {
  const lines = csvContent.split('\\n').filter(line => line.trim());
  const errors: Array<{ row: number; field?: string; message: string }> = [];
  const data: Partial<${entityName}>[] = [];

  if (lines.length === 0) {
    errors.push({ row: 0, message: 'Fichier CSV vide' });
    return { data, errors };
  }

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const expectedHeaders = [${getImportableFields(config.entity.fields).map(f => `"${f.name}"`).join(', ')}];

  // Valider les headers
  const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    errors.push({ 
      row: 0, 
      message: \`Colonnes manquantes: \${missingHeaders.join(', ')}\` 
    });
  }

  // Parser les données
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
    const rowData: Partial<${entityName}> = {};

    headers.forEach((header, index) => {
      if (expectedHeaders.includes(header) && values[index] !== undefined) {
        try {
          rowData[header as keyof ${entityName}] = parse${entityName}FieldFromCSV(
            values[index], 
            getFieldType(header)
          );
        } catch (error) {
          errors.push({
            row: i + 1,
            field: header,
            message: \`Erreur de parsing: \${error.message}\`
          });
        }
      }
    });

    if (Object.keys(rowData).length > 0) {
      data.push(rowData);
    }
  }

  return { data, errors };
}

/**
 * Parse un champ depuis CSV
 */
function parse${entityName}FieldFromCSV(value: string, type: string): any {
  if (!value || value.trim() === '') return null;

  switch (type) {
    case 'number':
      const num = Number(value);
      if (isNaN(num)) throw new Error('Nombre invalide');
      return num;
    case 'boolean':
      return ['true', '1', 'oui', 'yes'].includes(value.toLowerCase());
    case 'date':
    case 'datetime':
      const date = new Date(value);
      if (isNaN(date.getTime())) throw new Error('Date invalide');
      return date;
    case 'json':
      return JSON.parse(value);
    default:
      return value;
  }
}

/**
 * Retourne le type d'un champ
 */
function getFieldType(fieldName: string): string {
  const fieldTypes: Record<string, string> = {
    ${config.entity.fields.map(f => `"${f.name}": "${f.type}"`).join(',\n    ')}
  };
  return fieldTypes[fieldName] || 'string';
}`,
  };
}

/**
 * Génère les utilitaires de formatage
 */
function generateFormattingUtilities(config: CRUDConfig): FileTemplate {
  const entityName = config.entity.name;
  const entityNameLower = entityName.toLowerCase();

  return {
    path: `src/lib/${entityNameLower}-formatters.ts`,
    content: `/**
 * Formatters pour ${entityName}
 * Fonctions de formatage et d'affichage
 */

import type { ${entityName} } from "@/shared/types/${entityNameLower}";

/**
 * Formate un ${entityName} pour l'affichage
 */
export function format${entityName}(item: ${entityName}): {
  ${generateFormatterFields(config.entity.fields)}
} {
  return {
    ${generateFormatterImplementations(config.entity.fields)}
  };
}

/**
 * Formate une date pour l'affichage
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return '-';
  
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formate une date et heure pour l'affichage
 */
export function formatDateTime(date: Date | string | null): string {
  if (!date) return '-';
  
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formate un nombre pour l'affichage
 */
export function formatNumber(value: number | null): string {
  if (value === null || value === undefined) return '-';
  return value.toLocaleString('fr-FR');
}

/**
 * Formate un booléen pour l'affichage
 */
export function formatBoolean(value: boolean | null): string {
  if (value === null || value === undefined) return '-';
  return value ? 'Oui' : 'Non';
}

/**
 * Formate une énumération pour l'affichage
 */
export function formatEnum(value: string | null, labels: Record<string, string>): string {
  if (!value) return '-';
  return labels[value] || value;
}

/**
 * Tronque un texte avec ellipses
 */
export function truncateText(text: string | null, maxLength: number = 50): string {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Formate une URL pour l'affichage
 */
export function formatUrl(url: string | null): string {
  if (!url) return '-';
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}`,
  };
}

/**
 * Génère les utilitaires de validation
 */
function generateValidationUtilities(config: CRUDConfig): FileTemplate {
  const entityName = config.entity.name;
  const entityNameLower = entityName.toLowerCase();

  return {
    path: `src/lib/${entityNameLower}-validators.ts`,
    content: `/**
 * Validateurs pour ${entityName}
 * Fonctions de validation métier
 */

import type { ${entityName} } from "@/shared/types/${entityNameLower}";

/**
 * Valide l'unicité d'un champ
 */
export async function validate${entityName}Uniqueness(
  field: string,
  value: string,
  excludeId?: string
): Promise<boolean> {
  // TODO: Implémenter la vérification d'unicité en base
  return true;
}

/**
 * Valide les règles métier pour ${entityName}
 */
export function validate${entityName}BusinessRules(data: Partial<${entityName}>): {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
} {
  const errors: Array<{ field: string; message: string }> = [];

  ${generateBusinessRuleValidations(config.entity.fields)}

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valide les dépendances entre champs
 */
export function validate${entityName}Dependencies(data: Partial<${entityName}>): {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
} {
  const errors: Array<{ field: string; message: string }> = [];

  ${generateDependencyValidations(config.entity.fields)}

  return {
    isValid: errors.length === 0,
    errors,
  };
}`,
  };
}

/**
 * Fonctions helper pour la génération
 */

function getSearchableFields(fields: EntityField[]): string[] {
  return fields.filter(field => field.searchable).map(field => field.name);
}

function getExportableFields(fields: EntityField[]): EntityField[] {
  return fields.filter(field => field.display.showInTable);
}

function getImportableFields(fields: EntityField[]): EntityField[] {
  return fields.filter(field => field.display.showInForm && field.name !== 'id');
}

function generateDataProcessing(fields: EntityField[]): string {
  const processing: string[] = [];

  fields.forEach(field => {
    switch (field.type) {
      case 'number':
        processing.push(`  if (processed.${field.name}) {
    processed.${field.name} = Number(processed.${field.name});
  }`);
        break;

      case 'boolean':
        processing.push(`  processed.${field.name} = processed.${field.name} === 'on' || processed.${field.name} === 'true';`);
        break;

      case 'date':
      case 'datetime':
        processing.push(`  if (processed.${field.name}) {
    processed.${field.name} = new Date(processed.${field.name});
  }`);
        break;

      case 'json':
        processing.push(`  if (processed.${field.name} && typeof processed.${field.name} === 'string') {
    try {
      processed.${field.name} = JSON.parse(processed.${field.name});
    } catch (e) {
      // Garder la valeur string si le parsing échoue
    }
  }`);
        break;
    }
  });

  return processing.join('\n\n');
}

function generatePermissionValidation(config: CRUDConfig): string {
  if (!config.permissions.enabled) {
    return 'return true; // Permissions désactivées';
  }

  return `const allowedRoles = {
    create: [${config.permissions.permissions.filter(p => p.action === 'create').flatMap(p => p.roles).map(r => `"${r}"`).join(', ')}],
    read: [${config.permissions.permissions.filter(p => p.action === 'read').flatMap(p => p.roles).map(r => `"${r}"`).join(', ')}],
    update: [${config.permissions.permissions.filter(p => p.action === 'update').flatMap(p => p.roles).map(r => `"${r}"`).join(', ')}],
    delete: [${config.permissions.permissions.filter(p => p.action === 'delete').flatMap(p => p.roles).map(r => `"${r}"`).join(', ')}],
  };

  return userRoles.some(role => allowedRoles[action].includes(role));`;
}

function generateStatsFields(fields: EntityField[]): string {
  const numericFields = fields.filter(field => field.type === 'number');
  const booleanFields = fields.filter(field => field.type === 'boolean');

  const stats: string[] = [];

  numericFields.forEach(field => {
    stats.push(`${field.name}Average: number;`);
    stats.push(`${field.name}Total: number;`);
  });

  booleanFields.forEach(field => {
    stats.push(`${field.name}Count: number;`);
  });

  return stats.join('\n  ');
}

function generateStatsCalculations(fields: EntityField[]): string {
  const numericFields = fields.filter(field => field.type === 'number');
  const booleanFields = fields.filter(field => field.type === 'boolean');

  const calculations: string[] = [];

  numericFields.forEach(field => {
    calculations.push(`${field.name}Average: items.reduce((sum, item) => sum + (item.${field.name} || 0), 0) / items.length || 0,`);
    calculations.push(`${field.name}Total: items.reduce((sum, item) => sum + (item.${field.name} || 0), 0),`);
  });

  booleanFields.forEach(field => {
    calculations.push(`${field.name}Count: items.filter(item => item.${field.name}).length,`);
  });

  return calculations.join('\n    ');
}

function generateFormatterFields(fields: EntityField[]): string {
  return fields.map(field => `${field.name}: string;`).join('\n  ');
}

function generateFormatterImplementations(fields: EntityField[]): string {
  return fields.map(field => {
    switch (field.type) {
      case 'date':
        return `${field.name}: formatDate(item.${field.name}),`;
      case 'datetime':
        return `${field.name}: formatDateTime(item.${field.name}),`;
      case 'number':
        return `${field.name}: formatNumber(item.${field.name}),`;
      case 'boolean':
        return `${field.name}: formatBoolean(item.${field.name}),`;
      case 'url':
        return `${field.name}: formatUrl(item.${field.name}),`;
      case 'text':
        return `${field.name}: truncateText(item.${field.name}, 100),`;
      default:
        return `${field.name}: item.${field.name} || '-',`;
    }
  }).join('\n    ');
}

function generateBusinessRuleValidations(fields: EntityField[]): string {
  // Exemple de validations métier
  return `// Exemple: valider que le prix est positif
  // if (data.price !== undefined && data.price <= 0) {
  //   errors.push({ field: 'price', message: 'Le prix doit être positif' });
  // }

  // TODO: Implémenter les règles métier spécifiques`;
}

function generateDependencyValidations(fields: EntityField[]): string {
  // Exemple de validations de dépendances
  return `// Exemple: valider que la date de fin est après la date de début
  // if (data.startDate && data.endDate && data.endDate <= data.startDate) {
  //   errors.push({ field: 'endDate', message: 'La date de fin doit être après la date de début' });
  // }

  // TODO: Implémenter les validations de dépendances`;
}
