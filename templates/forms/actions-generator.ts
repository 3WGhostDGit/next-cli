/**
 * Générateur de Server Actions pour les formulaires
 * Crée des actions serveur avec validation Zod et gestion d'erreurs
 */

import { FormConfig, FormAction, ActionResult, FormState } from './index';
import { FileTemplate } from '../types';

/**
 * Générateur de Server Actions
 */
export class ActionsGenerator {
  constructor(private config: FormConfig) {}

  /**
   * Génère tous les fichiers d'actions nécessaires
   */
  generate(): FileTemplate[] {
    const files: FileTemplate[] = [];

    // Action principale du formulaire
    files.push(this.generateMainAction());

    // Actions CRUD si nécessaire
    if (this.config.actions.some(action => ['create', 'update', 'delete'].includes(action.type))) {
      files.push(this.generateCrudActions());
    }

    // Actions personnalisées
    const customActions = this.config.actions.filter(action => action.type === 'custom');
    if (customActions.length > 0) {
      files.push(this.generateCustomActions(customActions));
    }

    return files;
  }

  /**
   * Génère l'action principale du formulaire
   */
  private generateMainAction(): FileTemplate {
    const actionName = `${this.config.name.toLowerCase()}Action`;
    const schemaImport = `${this.config.name.toLowerCase()}Schema`;
    
    return {
      path: `src/services/${this.config.name.toLowerCase()}/actions.ts`,
      content: `"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ${schemaImport} } from "@/shared/validation/${this.config.name.toLowerCase()}";
import type { ${this.config.name}FormData } from "@/shared/validation/${this.config.name.toLowerCase()}";
import type { ActionResult } from "@/shared/types/actions";

/**
 * Action principale pour le formulaire ${this.config.name}
 */
export async function ${actionName}(
  prevState: ActionResult<${this.config.name}FormData>,
  formData: FormData
): Promise<ActionResult<${this.config.name}FormData>> {
  try {
    // Extraction des données du formulaire
    const rawData = Object.fromEntries(formData.entries());
    
    // Conversion des types pour les champs spéciaux
    const processedData = processFormData(rawData);
    
    // Validation avec Zod
    const validationResult = ${schemaImport}.safeParse(processedData);
    
    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
        message: "Données invalides",
      };
    }

    const validatedData = validationResult.data;

    // TODO: Implémenter la logique métier
    // Exemple: await db.${this.config.name.toLowerCase()}.create({ data: validatedData });
    
    console.log("Données validées:", validatedData);

    // Revalidation du cache si nécessaire
    ${this.generateRevalidation()}

    // Redirection si configurée
    ${this.generateRedirection()}

    return {
      success: true,
      data: validatedData,
      message: "${this.config.name} créé avec succès",
    };

  } catch (error) {
    console.error("Erreur dans ${actionName}:", error);
    
    return {
      success: false,
      error: "Une erreur inattendue s'est produite",
      message: "Échec de l'opération",
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

${this.generateUtilityFunctions()}`,
    };
  }

  /**
   * Génère les actions CRUD complètes
   */
  private generateCrudActions(): FileTemplate {
    const entityName = this.config.name.toLowerCase();
    
    return {
      path: `src/services/${entityName}/crud-actions.ts`,
      content: `"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ${entityName}Schema, ${entityName}UpdateSchema } from "@/shared/validation/${entityName}";
import type { ${this.config.name}FormData, ${this.config.name}UpdateData } from "@/shared/validation/${entityName}";
import type { ActionResult } from "@/shared/types/actions";

/**
 * Crée un nouveau ${this.config.name}
 */
export async function create${this.config.name}(
  prevState: ActionResult<${this.config.name}FormData>,
  formData: FormData
): Promise<ActionResult<${this.config.name}FormData>> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const processedData = processFormData(rawData);
    
    const validationResult = ${entityName}Schema.safeParse(processedData);
    
    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
        message: "Données invalides",
      };
    }

    // TODO: Implémenter la création en base de données
    // const result = await db.${entityName}.create({ data: validationResult.data });
    
    revalidatePath("/${entityName}");
    
    return {
      success: true,
      data: validationResult.data,
      message: "${this.config.name} créé avec succès",
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
 * Met à jour un ${this.config.name} existant
 */
export async function update${this.config.name}(
  id: string,
  prevState: ActionResult<${this.config.name}UpdateData>,
  formData: FormData
): Promise<ActionResult<${this.config.name}UpdateData>> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const processedData = processFormData(rawData);
    
    const validationResult = ${entityName}UpdateSchema.safeParse(processedData);
    
    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
        message: "Données invalides",
      };
    }

    // TODO: Vérifier l'existence et les permissions
    // const existing = await db.${entityName}.findUnique({ where: { id } });
    // if (!existing) throw new Error("${this.config.name} non trouvé");

    // TODO: Implémenter la mise à jour
    // const result = await db.${entityName}.update({
    //   where: { id },
    //   data: validationResult.data
    // });
    
    revalidatePath("/${entityName}");
    revalidatePath(\`/${entityName}/\${id}\`);
    
    return {
      success: true,
      data: validationResult.data,
      message: "${this.config.name} mis à jour avec succès",
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
 * Supprime un ${this.config.name}
 */
export async function delete${this.config.name}(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    // TODO: Vérifier l'existence et les permissions
    // const existing = await db.${entityName}.findUnique({ where: { id } });
    // if (!existing) throw new Error("${this.config.name} non trouvé");

    // TODO: Implémenter la suppression
    // await db.${entityName}.delete({ where: { id } });
    
    revalidatePath("/${entityName}");
    
    return {
      success: true,
      data: { id },
      message: "${this.config.name} supprimé avec succès",
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
 * Traite les données du formulaire
 */
function processFormData(rawData: Record<string, any>): Record<string, any> {
  const processed = { ...rawData };
  
  ${this.generateDataProcessing()}
  
  return processed;
}`,
    };
  }

  /**
   * Génère les actions personnalisées
   */
  private generateCustomActions(customActions: FormAction[]): FileTemplate {
    const actionsContent = customActions.map(action => this.generateCustomAction(action)).join('\n\n');
    
    return {
      path: `src/services/${this.config.name.toLowerCase()}/custom-actions.ts`,
      content: `"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/shared/types/actions";

${actionsContent}`,
    };
  }

  /**
   * Génère une action personnalisée
   */
  private generateCustomAction(action: FormAction): string {
    return `/**
 * Action personnalisée: ${action.name}
 */
export async function ${action.name}Action(
  formData: FormData
): Promise<ActionResult<any>> {
  try {
    // TODO: Implémenter la logique personnalisée pour ${action.name}
    
    ${action.revalidate ? `revalidatePath("${action.revalidate[0]}");` : ''}
    ${action.redirect ? `redirect("${action.redirect}");` : ''}
    
    return {
      success: true,
      message: "Action ${action.name} exécutée avec succès",
    };

  } catch (error) {
    console.error("Erreur dans ${action.name}Action:", error);
    return {
      success: false,
      error: "Erreur lors de l'exécution de ${action.name}",
    };
  }
}`;
  }

  /**
   * Génère le code de revalidation
   */
  private generateRevalidation(): string {
    const revalidatePaths = this.config.actions
      .filter(action => action.revalidate)
      .flatMap(action => action.revalidate!);

    if (revalidatePaths.length === 0) return '';

    return revalidatePaths
      .map(path => `revalidatePath("${path}");`)
      .join('\n    ');
  }

  /**
   * Génère le code de redirection
   */
  private generateRedirection(): string {
    const redirectAction = this.config.actions.find(action => action.redirect);
    
    if (!redirectAction) return '';

    return `redirect("${redirectAction.redirect}");`;
  }

  /**
   * Génère le traitement des données selon les types de champs
   */
  private generateDataProcessing(): string {
    const processing: string[] = [];

    this.config.fields.forEach(field => {
      switch (field.type) {
        case 'number':
        case 'slider':
          processing.push(`  // Conversion en nombre pour ${field.name}
  if (processed.${field.name}) {
    processed.${field.name} = Number(processed.${field.name});
  }`);
          break;

        case 'checkbox':
        case 'switch':
          processing.push(`  // Conversion en booléen pour ${field.name}
  processed.${field.name} = processed.${field.name} === 'on' || processed.${field.name} === 'true';`);
          break;

        case 'multiselect':
          processing.push(`  // Conversion en tableau pour ${field.name}
  if (processed.${field.name} && typeof processed.${field.name} === 'string') {
    processed.${field.name} = processed.${field.name}.split(',');
  }`);
          break;

        case 'file':
          processing.push(`  // Traitement du fichier pour ${field.name}
  if (processed.${field.name} instanceof File && processed.${field.name}.size === 0) {
    delete processed.${field.name};
  }`);
          break;
      }
    });

    return processing.join('\n\n');
  }

  /**
   * Génère les fonctions utilitaires
   */
  private generateUtilityFunctions(): string {
    return `
/**
 * Valide les permissions pour l'action
 */
async function validatePermissions(action: string): Promise<boolean> {
  // TODO: Implémenter la validation des permissions
  // const session = await getServerSession();
  // return session?.user?.role === 'admin';
  return true;
}

/**
 * Log des actions pour audit
 */
async function logAction(action: string, data: any, userId?: string): Promise<void> {
  // TODO: Implémenter le logging des actions
  console.log(\`Action: \${action}\`, { data, userId, timestamp: new Date() });
}`;
  }
}
