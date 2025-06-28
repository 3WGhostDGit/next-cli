/**
 * Générateur de Server Actions CRUD complètes
 * Crée des actions serveur avec validation, pagination et gestion d'erreurs
 */

import { CRUDConfig, EntityField } from './index';
import { FileTemplate } from '../types';

/**
 * Générateur de Server Actions CRUD
 */
export class CRUDActionsGenerator {
  constructor(private config: CRUDConfig) {}

  /**
   * Génère tous les fichiers d'actions CRUD
   */
  generate(): FileTemplate[] {
    const files: FileTemplate[] = [];

    // Actions CRUD principales
    files.push(this.generateMainActions());

    // Actions de recherche et filtrage
    if (this.config.features.includes('search') || this.config.features.includes('filtering')) {
      files.push(this.generateSearchActions());
    }

    // Actions en lot
    if (this.config.features.includes('bulk-actions')) {
      files.push(this.generateBulkActions());
    }

    // Actions d'export/import
    if (this.config.features.includes('export') || this.config.features.includes('import')) {
      files.push(this.generateDataActions());
    }

    return files;
  }

  /**
   * Génère les actions CRUD principales
   */
  private generateMainActions(): FileTemplate {
    const entityName = this.config.entity.name;
    const entityNameLower = entityName.toLowerCase();

    return {
      path: `src/services/${entityNameLower}/actions.ts`,
      content: `"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ${entityNameLower}Schema, ${entityNameLower}UpdateSchema } from "@/shared/validation/${entityNameLower}";
import type { ${entityName}, ${entityName}Create, ${entityName}Update } from "@/shared/types/${entityNameLower}";
import type { ActionResult, PaginatedResult } from "@/shared/types/actions";
${this.config.permissions.enabled ? `import { checkPermission } from "@/lib/permissions";` : ''}

/**
 * Récupère une liste paginée de ${entityName}
 */
export async function get${entityName}List(
  page: number = 1,
  limit: number = 10,
  search?: string,
  filters?: Record<string, any>,
  sort?: { field: string; direction: 'asc' | 'desc' }[]
): Promise<PaginatedResult<${entityName}>> {
  try {
    ${this.config.permissions.enabled ? `
    await checkPermission('${entityNameLower}', 'read');
    ` : ''}

    // TODO: Implémenter la récupération depuis la base de données
    // const where = buildWhereClause(search, filters);
    // const orderBy = buildOrderByClause(sort);
    
    // const [items, total] = await Promise.all([
    //   db.${entityNameLower}.findMany({
    //     where,
    //     orderBy,
    //     skip: (page - 1) * limit,
    //     take: limit,
    //   }),
    //   db.${entityNameLower}.count({ where }),
    // ]);

    // Données de test
    const items: ${entityName}[] = [];
    const total = 0;

    return {
      success: true,
      data: {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };

  } catch (error) {
    console.error("Erreur lors de la récupération:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des données",
    };
  }
}

/**
 * Récupère un ${entityName} par ID
 */
export async function get${entityName}ById(id: string): Promise<ActionResult<${entityName}>> {
  try {
    ${this.config.permissions.enabled ? `
    await checkPermission('${entityNameLower}', 'read');
    ` : ''}

    // TODO: Implémenter la récupération depuis la base de données
    // const item = await db.${entityNameLower}.findUnique({
    //   where: { id },
    // });

    // if (!item) {
    //   return {
    //     success: false,
    //     error: "${entityName} non trouvé",
    //   };
    // }

    // return {
    //   success: true,
    //   data: item,
    // };

    return {
      success: false,
      error: "Non implémenté",
    };

  } catch (error) {
    console.error("Erreur lors de la récupération:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération",
    };
  }
}

/**
 * Crée un nouveau ${entityName}
 */
export async function create${entityName}(
  prevState: ActionResult<${entityName}>,
  formData: FormData
): Promise<ActionResult<${entityName}>> {
  try {
    ${this.config.permissions.enabled ? `
    await checkPermission('${entityNameLower}', 'create');
    ` : ''}

    // Extraction et traitement des données
    const rawData = Object.fromEntries(formData.entries());
    const processedData = processFormData(rawData);

    // Validation avec Zod
    const validationResult = ${entityNameLower}Schema.safeParse(processedData);

    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
        message: "Données invalides",
      };
    }

    const validatedData = validationResult.data;

    // TODO: Implémenter la création en base de données
    // const newItem = await db.${entityNameLower}.create({
    //   data: validatedData,
    // });

    console.log("Données validées pour création:", validatedData);

    // Revalidation du cache
    revalidatePath("/${entityNameLower}");

    return {
      success: true,
      data: validatedData as ${entityName},
      message: "${entityName} créé avec succès",
    };

  } catch (error) {
    console.error("Erreur lors de la création:", error);
    return {
      success: false,
      error: "Erreur lors de la création",
    };
  }
}

/**
 * Met à jour un ${entityName} existant
 */
export async function update${entityName}(
  id: string,
  prevState: ActionResult<${entityName}>,
  formData: FormData
): Promise<ActionResult<${entityName}>> {
  try {
    ${this.config.permissions.enabled ? `
    await checkPermission('${entityNameLower}', 'update');
    ` : ''}

    // Extraction et traitement des données
    const rawData = Object.fromEntries(formData.entries());
    const processedData = processFormData(rawData);

    // Validation avec Zod
    const validationResult = ${entityNameLower}UpdateSchema.safeParse(processedData);

    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
        message: "Données invalides",
      };
    }

    const validatedData = validationResult.data;

    // TODO: Vérifier l'existence et implémenter la mise à jour
    // const existingItem = await db.${entityNameLower}.findUnique({
    //   where: { id },
    // });

    // if (!existingItem) {
    //   return {
    //     success: false,
    //     error: "${entityName} non trouvé",
    //   };
    // }

    // const updatedItem = await db.${entityNameLower}.update({
    //   where: { id },
    //   data: validatedData,
    // });

    console.log("Données validées pour mise à jour:", validatedData);

    // Revalidation du cache
    revalidatePath("/${entityNameLower}");
    revalidatePath(\`/${entityNameLower}/\${id}\`);

    return {
      success: true,
      data: validatedData as ${entityName},
      message: "${entityName} mis à jour avec succès",
    };

  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour",
    };
  }
}

/**
 * Supprime un ${entityName}
 */
export async function delete${entityName}(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    ${this.config.permissions.enabled ? `
    await checkPermission('${entityNameLower}', 'delete');
    ` : ''}

    // TODO: Vérifier l'existence et implémenter la suppression
    // const existingItem = await db.${entityNameLower}.findUnique({
    //   where: { id },
    // });

    // if (!existingItem) {
    //   return {
    //     success: false,
    //     error: "${entityName} non trouvé",
    //   };
    // }

    ${this.config.features.includes('soft-delete') ? `
    // Suppression logique
    // await db.${entityNameLower}.update({
    //   where: { id },
    //   data: { deletedAt: new Date() },
    // });
    ` : `
    // Suppression physique
    // await db.${entityNameLower}.delete({
    //   where: { id },
    // });
    `}

    console.log("Suppression de l'élément:", id);

    // Revalidation du cache
    revalidatePath("/${entityNameLower}");

    return {
      success: true,
      data: { id },
      message: "${entityName} supprimé avec succès",
    };

  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression",
    };
  }
}

/**
 * Traite les données du formulaire pour les convertir aux bons types
 */
function processFormData(rawData: Record<string, any>): Record<string, any> {
  const processed = { ...rawData };

  ${this.generateDataProcessing()}

  return processed;
}

/**
 * Construit la clause WHERE pour les requêtes
 */
function buildWhereClause(search?: string, filters?: Record<string, any>) {
  const where: any = {};

  ${this.config.features.includes('soft-delete') ? `
  // Exclure les éléments supprimés logiquement
  where.deletedAt = null;
  ` : ''}

  // Recherche globale
  if (search) {
    const searchFields = [${this.getSearchableFields().map(f => `"${f}"`).join(', ')}];
    where.OR = searchFields.map(field => ({
      [field]: {
        contains: search,
        mode: 'insensitive',
      },
    }));
  }

  // Filtres spécifiques
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        where[key] = value;
      }
    });
  }

  return where;
}

/**
 * Construit la clause ORDER BY pour les requêtes
 */
function buildOrderByClause(sort?: { field: string; direction: 'asc' | 'desc' }[]) {
  if (!sort || sort.length === 0) {
    return { createdAt: 'desc' };
  }

  return sort.map(({ field, direction }) => ({
    [field]: direction,
  }));
}`,
    };
  }

  /**
   * Génère les actions de recherche et filtrage
   */
  private generateSearchActions(): FileTemplate {
    const entityName = this.config.entity.name;
    const entityNameLower = entityName.toLowerCase();

    return {
      path: `src/services/${entityNameLower}/search-actions.ts`,
      content: `"use server";

import type { ${entityName} } from "@/shared/types/${entityNameLower}";
import type { ActionResult } from "@/shared/types/actions";

/**
 * Recherche de ${entityName} avec suggestions
 */
export async function search${entityName}(
  query: string,
  limit: number = 10
): Promise<ActionResult<${entityName}[]>> {
  try {
    // TODO: Implémenter la recherche avec full-text search
    // const results = await db.${entityNameLower}.findMany({
    //   where: {
    //     OR: [
    //       ${this.getSearchableFields().map(field => `{ ${field}: { contains: query, mode: 'insensitive' } }`).join(',\n    //       ')}
    //     ],
    //   },
    //   take: limit,
    //   orderBy: { createdAt: 'desc' },
    // });

    const results: ${entityName}[] = [];

    return {
      success: true,
      data: results,
    };

  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    return {
      success: false,
      error: "Erreur lors de la recherche",
    };
  }
}

/**
 * Obtient les options de filtrage disponibles
 */
export async function get${entityName}FilterOptions(): Promise<ActionResult<Record<string, any[]>>> {
  try {
    // TODO: Implémenter la récupération des options de filtrage
    const options: Record<string, any[]> = {};

    ${this.getFilterableFields().map(field => {
      if (field.type === 'enum') {
        return `// options.${field.name} = Object.values(${field.name}Enum);`;
      } else if (field.type === 'boolean') {
        return `options.${field.name} = [{ value: true, label: 'Oui' }, { value: false, label: 'Non' }];`;
      }
      return `// options.${field.name} = await getDistinct${field.name}Values();`;
    }).join('\n    ')}

    return {
      success: true,
      data: options,
    };

  } catch (error) {
    console.error("Erreur lors de la récupération des options:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des options",
    };
  }
}`,
    };
  }

  /**
   * Génère les actions en lot
   */
  private generateBulkActions(): FileTemplate {
    const entityName = this.config.entity.name;
    const entityNameLower = entityName.toLowerCase();

    return {
      path: `src/services/${entityNameLower}/bulk-actions.ts`,
      content: `"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/shared/types/actions";
${this.config.permissions.enabled ? `import { checkPermission } from "@/lib/permissions";` : ''}

/**
 * Supprime plusieurs ${entityName} en lot
 */
export async function bulkDelete${entityName}(ids: string[]): Promise<ActionResult<{ count: number }>> {
  try {
    ${this.config.permissions.enabled ? `
    await checkPermission('${entityNameLower}', 'delete');
    ` : ''}

    if (ids.length === 0) {
      return {
        success: false,
        error: "Aucun élément sélectionné",
      };
    }

    // TODO: Implémenter la suppression en lot
    ${this.config.features.includes('soft-delete') ? `
    // const result = await db.${entityNameLower}.updateMany({
    //   where: { id: { in: ids } },
    //   data: { deletedAt: new Date() },
    // });
    ` : `
    // const result = await db.${entityNameLower}.deleteMany({
    //   where: { id: { in: ids } },
    // });
    `}

    const count = ids.length; // result.count

    revalidatePath("/${entityNameLower}");

    return {
      success: true,
      data: { count },
      message: \`\${count} élément(s) supprimé(s) avec succès\`,
    };

  } catch (error) {
    console.error("Erreur lors de la suppression en lot:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression en lot",
    };
  }
}

/**
 * Met à jour plusieurs ${entityName} en lot
 */
export async function bulkUpdate${entityName}(
  ids: string[],
  updates: Partial<${entityName}>
): Promise<ActionResult<{ count: number }>> {
  try {
    ${this.config.permissions.enabled ? `
    await checkPermission('${entityNameLower}', 'update');
    ` : ''}

    if (ids.length === 0) {
      return {
        success: false,
        error: "Aucun élément sélectionné",
      };
    }

    // TODO: Implémenter la mise à jour en lot
    // const result = await db.${entityNameLower}.updateMany({
    //   where: { id: { in: ids } },
    //   data: updates,
    // });

    const count = ids.length; // result.count

    revalidatePath("/${entityNameLower}");

    return {
      success: true,
      data: { count },
      message: \`\${count} élément(s) mis à jour avec succès\`,
    };

  } catch (error) {
    console.error("Erreur lors de la mise à jour en lot:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour en lot",
    };
  }
}`,
    };
  }

  /**
   * Génère les actions d'export/import
   */
  private generateDataActions(): FileTemplate {
    const entityName = this.config.entity.name;
    const entityNameLower = entityName.toLowerCase();

    return {
      path: `src/services/${entityNameLower}/data-actions.ts`,
      content: `"use server";

import type { ActionResult } from "@/shared/types/actions";
${this.config.permissions.enabled ? `import { checkPermission } from "@/lib/permissions";` : ''}

/**
 * Exporte les données en CSV
 */
export async function export${entityName}CSV(
  filters?: Record<string, any>
): Promise<ActionResult<{ url: string }>> {
  try {
    ${this.config.permissions.enabled ? `
    await checkPermission('${entityNameLower}', 'export');
    ` : ''}

    // TODO: Implémenter l'export CSV
    // const data = await db.${entityNameLower}.findMany({
    //   where: buildWhereClause(undefined, filters),
    // });

    // const csv = generateCSV(data);
    // const filename = \`${entityNameLower}-\${new Date().toISOString().split('T')[0]}.csv\`;
    // const url = await uploadFile(csv, filename);

    return {
      success: true,
      data: { url: "/exports/sample.csv" },
      message: "Export terminé avec succès",
    };

  } catch (error) {
    console.error("Erreur lors de l'export:", error);
    return {
      success: false,
      error: "Erreur lors de l'export",
    };
  }
}

/**
 * Importe des données depuis un fichier CSV
 */
export async function import${entityName}CSV(
  formData: FormData
): Promise<ActionResult<{ imported: number; errors: string[] }>> {
  try {
    ${this.config.permissions.enabled ? `
    await checkPermission('${entityNameLower}', 'import');
    ` : ''}

    const file = formData.get('file') as File;
    
    if (!file) {
      return {
        success: false,
        error: "Aucun fichier fourni",
      };
    }

    // TODO: Implémenter l'import CSV
    // const csvContent = await file.text();
    // const { data, errors } = parseCSV(csvContent);
    // const imported = await bulkCreate${entityName}(data);

    return {
      success: true,
      data: { imported: 0, errors: [] },
      message: "Import terminé avec succès",
    };

  } catch (error) {
    console.error("Erreur lors de l'import:", error);
    return {
      success: false,
      error: "Erreur lors de l'import",
    };
  }
}`,
    };
  }

  /**
   * Génère le traitement des données selon les types de champs
   */
  private generateDataProcessing(): string {
    const processing: string[] = [];

    this.config.entity.fields.forEach(field => {
      switch (field.type) {
        case 'number':
          processing.push(`  // Conversion en nombre pour ${field.name}
  if (processed.${field.name}) {
    processed.${field.name} = Number(processed.${field.name});
  }`);
          break;

        case 'boolean':
          processing.push(`  // Conversion en booléen pour ${field.name}
  processed.${field.name} = processed.${field.name} === 'on' || processed.${field.name} === 'true';`);
          break;

        case 'date':
        case 'datetime':
          processing.push(`  // Conversion en date pour ${field.name}
  if (processed.${field.name}) {
    processed.${field.name} = new Date(processed.${field.name});
  }`);
          break;

        case 'json':
          processing.push(`  // Parsing JSON pour ${field.name}
  if (processed.${field.name} && typeof processed.${field.name} === 'string') {
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

  /**
   * Retourne les champs recherchables
   */
  private getSearchableFields(): EntityField[] {
    return this.config.entity.fields.filter(field => 
      field.searchable && ['string', 'text', 'email'].includes(field.type)
    );
  }

  /**
   * Retourne les champs filtrables
   */
  private getFilterableFields(): EntityField[] {
    return this.config.entity.fields.filter(field => field.filterable);
  }
}
