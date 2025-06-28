/**
 * Générateurs de Server Actions pour les formulaires
 */

import { FormConfig } from './index';
import { FileTemplate } from '../types';

/**
 * Génère une Server Action pour un formulaire simple
 */
export function generateFormAction(config: FormConfig): FileTemplate {
  const { formName, actions } = config;
  const actionName = actions.submitAction;
  const schemaName = `${formName}Schema`;
  
  const content = `"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ${schemaName}, validationUtils } from "@/shared/validation/${formName}";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  timestamp: string;
}

/**
 * Action serveur pour ${formName}
 * Compatible avec useActionState de React
 */
export async function ${actionName}(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Vérification de l'authentification si nécessaire
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Vous devez être connecté pour effectuer cette action",
        timestamp: new Date().toISOString(),
      };
    }

    // Extraction des données du formulaire
    const rawData = Object.fromEntries(formData.entries());
    
    // Traitement des champs spéciaux
    ${generateFieldProcessing(config)}

    // Validation avec Zod
    const validation = await validationUtils.validateForm(${schemaName}, rawData);
    
    if (!validation.success) {
      return {
        success: false,
        fieldErrors: validation.errors,
        timestamp: new Date().toISOString(),
      };
    }

    const validatedData = validation.data!;

    // Logique métier - à personnaliser selon vos besoins
    ${generateBusinessLogic(config)}

    // Revalidation du cache si nécessaire
    revalidatePath("/${formName}");
    
    ${actions.redirectAfterSubmit ? `
    // Redirection après succès
    redirect("${actions.redirectAfterSubmit}");` : ''}

    return {
      success: true,
      data: { message: "${actions.showSuccessMessage ? 'Formulaire soumis avec succès' : ''}" },
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    console.error("Erreur lors de la soumission du formulaire:", error);
    
    return {
      success: false,
      error: "Une erreur inattendue s'est produite. Veuillez réessayer.",
      timestamp: new Date().toISOString(),
    };
  }
}`;

  return {
    path: `src/services/${formName}/${actionName}.ts`,
    content
  };
}

/**
 * Génère le traitement des champs spéciaux
 */
function generateFieldProcessing(config: FormConfig): string {
  const { fields, features } = config;
  let processing = '';
  
  // Traitement des fichiers
  if (features.includes('file-upload')) {
    processing += `
    // Traitement des fichiers uploadés
    const files = formData.getAll('files') as File[];
    if (files.length > 0) {
      // TODO: Implémenter l'upload des fichiers
      // rawData.files = await uploadFiles(files);
    }`;
  }
  
  // Traitement des champs booléens
  const booleanFields = fields?.filter(f => f.type === 'boolean') || [];
  if (booleanFields.length > 0) {
    processing += `
    // Conversion des champs booléens
    ${booleanFields.map(field => 
      `rawData.${field.name} = formData.get('${field.name}') === 'on';`
    ).join('\n    ')}`;
  }
  
  // Traitement des champs numériques
  const numberFields = fields?.filter(f => f.type === 'number') || [];
  if (numberFields.length > 0) {
    processing += `
    // Conversion des champs numériques
    ${numberFields.map(field => 
      `if (rawData.${field.name}) rawData.${field.name} = Number(rawData.${field.name});`
    ).join('\n    ')}`;
  }
  
  return processing;
}

/**
 * Génère la logique métier de base
 */
function generateBusinessLogic(config: FormConfig): string {
  const { formName } = config;
  
  return `
    // Exemple de logique métier - à adapter selon vos besoins
    const result = await db.${formName}.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        createdAt: new Date(),
      },
    });

    console.log("${formName} créé avec succès:", result.id);`;
}

/**
 * Génère des actions pour formulaires multi-étapes
 */
export function generateMultiStepActions(config: FormConfig): FileTemplate[] {
  if (config.formType !== 'multi-step' || !config.steps) {
    return [];
  }

  const files: FileTemplate[] = [];
  const { formName, steps } = config;

  // Action pour sauvegarder une étape
  files.push({
    path: `src/services/${formName}/saveStep.ts`,
    content: `"use server";

import { ${steps.map(step => `${step.name}Schema`).join(', ')} } from "@/shared/validation/${formName}";
import { validationUtils } from "@/shared/validation/${formName}";

export interface StepResult {
  success: boolean;
  errors?: Record<string, string[]>;
  canProceed: boolean;
}

/**
 * Sauvegarde et valide une étape du formulaire
 */
export async function saveStep(
  stepIndex: number,
  formData: FormData
): Promise<StepResult> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    
    // Sélectionner le bon schéma selon l'étape
    let schema;
    switch (stepIndex) {
      ${steps.map((step, index) => `
      case ${index}:
        schema = ${step.name}Schema;
        break;`).join('')}
      default:
        throw new Error("Étape invalide");
    }

    const validation = await validationUtils.validateForm(schema, rawData);
    
    if (!validation.success) {
      return {
        success: false,
        errors: validation.errors,
        canProceed: false,
      };
    }

    // Sauvegarder temporairement les données (session, localStorage, etc.)
    // TODO: Implémenter la sauvegarde temporaire

    return {
      success: true,
      canProceed: true,
    };

  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'étape:", error);
    return {
      success: false,
      errors: { general: ["Erreur lors de la sauvegarde"] },
      canProceed: false,
    };
  }
}`
  });

  // Action finale pour soumettre tout le formulaire
  files.push({
    path: `src/services/${formName}/submitComplete.ts`,
    content: `"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ${formName}Schema } from "@/shared/validation/${formName}";
import { validationUtils } from "@/shared/validation/${formName}";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Soumission finale du formulaire multi-étapes
 */
export async function submitComplete(completeData: any) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Non authentifié");
    }

    // Validation finale de toutes les données
    const validation = await validationUtils.validateForm(${formName}Schema, completeData);
    
    if (!validation.success) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    // Sauvegarde en base de données
    const result = await db.${formName}.create({
      data: {
        ...validation.data,
        userId: session.user.id,
        completedAt: new Date(),
      },
    });

    // Nettoyage des données temporaires
    // TODO: Supprimer les données de session/localStorage

    revalidatePath("/${formName}");
    
    return {
      success: true,
      data: result,
    };

  } catch (error) {
    console.error("Erreur lors de la soumission finale:", error);
    return {
      success: false,
      error: "Erreur lors de la soumission",
    };
  }
}`
  });

  return files;
}

/**
 * Génère des actions pour les fonctionnalités avancées
 */
export function generateAdvancedActions(config: FormConfig): FileTemplate[] {
  const files: FileTemplate[] = [];
  const { formName, features } = config;

  // Action pour l'auto-save
  if (features.includes('auto-save')) {
    files.push({
      path: `src/services/${formName}/autoSave.ts`,
      content: `"use server";

import { auth } from "@/lib/auth";

/**
 * Sauvegarde automatique du brouillon
 */
export async function autoSave(formData: Record<string, any>) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Non authentifié" };
    }

    // Sauvegarder en tant que brouillon
    // TODO: Implémenter la sauvegarde de brouillon
    
    return {
      success: true,
      savedAt: new Date().toISOString(),
    };

  } catch (error) {
    console.error("Erreur lors de l'auto-save:", error);
    return {
      success: false,
      error: "Erreur de sauvegarde",
    };
  }
}`
    });
  }

  // Action pour l'upload de fichiers
  if (features.includes('file-upload')) {
    files.push({
      path: `src/services/${formName}/uploadFiles.ts`,
      content: `"use server";

import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

/**
 * Upload de fichiers
 */
export async function uploadFiles(files: File[]) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Non authentifié");
    }

    const uploadPromises = files.map(async (file) => {
      const blob = await put(file.name, file, {
        access: 'public',
      });
      
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        url: blob.url,
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    
    return {
      success: true,
      files: uploadedFiles,
    };

  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    return {
      success: false,
      error: "Erreur lors de l'upload des fichiers",
    };
  }
}`
    });
  }

  return files;
}
