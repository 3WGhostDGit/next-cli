/**
 * Générateurs de schémas Zod pour les formulaires
 * Utilise z.email(), z.string(), z.number(), etc.
 */

import { FormField, FormConfig, FormStep } from './index';
import { FileTemplate } from '../types';

/**
 * Génère un schéma Zod pour un champ de formulaire
 */
export function generateFieldSchema(field: FormField): string {
  let schema = '';
  
  switch (field.type) {
    case 'string':
      schema = 'z.string()';
      if (field.validation?.min) {
        schema += `.min(${field.validation.min}, "${field.label} doit contenir au moins ${field.validation.min} caractères")`;
      }
      if (field.validation?.max) {
        schema += `.max(${field.validation.max}, "${field.label} ne peut pas dépasser ${field.validation.max} caractères")`;
      }
      if (field.validation?.pattern) {
        schema += `.regex(/${field.validation.pattern}/, "${field.label} n'est pas au bon format")`;
      }
      break;
      
    case 'email':
      // Utilise z.email() pour la validation d'email
      schema = 'z.string().email("Format d\'email invalide")';
      break;
      
    case 'password':
      schema = 'z.string()';
      const minLength = field.validation?.min || 8;
      schema += `.min(${minLength}, "Le mot de passe doit contenir au moins ${minLength} caractères")`;
      if (field.name === 'password') {
        schema += `.regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")`;
        schema += `.regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")`;
        schema += `.regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")`;
        schema += `.regex(/[^a-zA-Z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial")`;
      }
      break;
      
    case 'number':
      schema = 'z.number()';
      if (field.validation?.min !== undefined) {
        schema += `.min(${field.validation.min}, "${field.label} doit être supérieur ou égal à ${field.validation.min}")`;
      }
      if (field.validation?.max !== undefined) {
        schema += `.max(${field.validation.max}, "${field.label} doit être inférieur ou égal à ${field.validation.max}")`;
      }
      break;
      
    case 'boolean':
      schema = 'z.boolean()';
      break;
      
    case 'date':
      schema = 'z.date()';
      break;
      
    case 'select':
      if (field.options) {
        const values = field.options.map(opt => `"${opt.value}"`).join(', ');
        schema = `z.enum([${values}])`;
      } else {
        schema = 'z.string()';
      }
      if (field.multiple) {
        schema = `z.array(${schema})`;
      }
      break;
      
    case 'textarea':
      schema = 'z.string()';
      if (field.validation?.min) {
        schema += `.min(${field.validation.min}, "${field.label} doit contenir au moins ${field.validation.min} caractères")`;
      }
      if (field.validation?.max) {
        schema += `.max(${field.validation.max}, "${field.label} ne peut pas dépasser ${field.validation.max} caractères")`;
      }
      break;
      
    case 'file':
      schema = 'z.instanceof(File)';
      if (field.multiple) {
        schema = `z.array(${schema})`;
      }
      break;
      
    default:
      schema = 'z.string()';
  }
  
  // Ajouter la validation personnalisée
  if (field.validation?.custom) {
    schema += `.refine(${field.validation.custom})`;
  }
  
  // Rendre optionnel si nécessaire
  if (!field.required) {
    schema += '.optional()';
  }
  
  return schema;
}

/**
 * Génère un schéma Zod complet pour un formulaire
 */
export function generateFormSchema(config: FormConfig): FileTemplate {
  const { formName, fields, steps } = config;
  
  let schemaContent = '';
  let imports = `import { z } from "zod";\n\n`;
  
  if (config.formType === 'multi-step' && steps) {
    // Générer des schémas pour chaque étape
    const stepSchemas = steps.map((step, index) => {
      const stepFields = step.fields.map(field => 
        `  ${field.name}: ${generateFieldSchema(field)}`
      ).join(',\n');
      
      return `export const ${step.name}Schema = z.object({
${stepFields}
});

export type ${step.name.charAt(0).toUpperCase() + step.name.slice(1)}Data = z.infer<typeof ${step.name}Schema>;`;
    });
    
    schemaContent = stepSchemas.join('\n\n');
    
    // Schéma complet combiné
    const combinedSchema = steps.map(step => `${step.name}Schema`).join('.merge(');
    const closingParens = ')'.repeat(steps.length - 1);
    
    schemaContent += `\n\n// Schéma complet du formulaire
export const ${formName}Schema = ${combinedSchema}${closingParens};

export type ${formName.charAt(0).toUpperCase() + formName.slice(1)}Data = z.infer<typeof ${formName}Schema>;`;
    
  } else if (fields) {
    // Formulaire simple
    const fieldSchemas = fields.map(field => 
      `  ${field.name}: ${generateFieldSchema(field)}`
    ).join(',\n');
    
    schemaContent = `export const ${formName}Schema = z.object({
${fieldSchemas}
});

export type ${formName.charAt(0).toUpperCase() + formName.slice(1)}Data = z.infer<typeof ${formName}Schema>;`;
  }
  
  // Ajouter des schémas de validation spéciaux si nécessaire
  if (config.features.includes('confirmation-step')) {
    schemaContent += `\n\n// Schéma pour l'étape de confirmation
export const confirmationSchema = z.object({
  confirmed: z.boolean().refine(val => val === true, {
    message: "Vous devez confirmer pour continuer"
  })
});`;
  }
  
  // Ajouter des utilitaires de validation
  const validationUtils = `
// Utilitaires de validation
export const validationUtils = {
  /**
   * Valide les données du formulaire
   */
  async validateForm<T>(schema: z.ZodSchema<T>, data: unknown): Promise<{
    success: boolean;
    data?: T;
    errors?: Record<string, string[]>;
  }> {
    try {
      const validData = await schema.parseAsync(data);
      return { success: true, data: validData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!fieldErrors[path]) {
            fieldErrors[path] = [];
          }
          fieldErrors[path].push(err.message);
        });
        return { success: false, errors: fieldErrors };
      }
      throw error;
    }
  },

  /**
   * Valide un champ spécifique
   */
  validateField<T>(schema: z.ZodSchema<T>, fieldName: string, value: unknown): {
    isValid: boolean;
    error?: string;
  } {
    try {
      // Créer un schéma partiel pour le champ
      const fieldSchema = schema.shape?.[fieldName];
      if (!fieldSchema) {
        return { isValid: true };
      }
      
      fieldSchema.parse(value);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          isValid: false, 
          error: error.errors[0]?.message || 'Valeur invalide' 
        };
      }
      return { isValid: false, error: 'Erreur de validation' };
    }
  }
};`;
  
  const fullContent = imports + schemaContent + validationUtils;
  
  return {
    path: `shared/validation/${formName}.ts`,
    content: fullContent
  };
}

/**
 * Génère des schémas de validation pour des cas d'usage spécifiques
 */
export function generateSpecialSchemas(config: FormConfig): FileTemplate[] {
  const files: FileTemplate[] = [];
  
  // Schéma pour la recherche/filtrage
  if (config.features.includes('dynamic-fields')) {
    files.push({
      path: `shared/validation/${config.formName}-search.ts`,
      content: `import { z } from "zod";

// Schéma pour la recherche et le filtrage
export const searchSchema = z.object({
  query: z.string().optional(),
  filters: z.record(z.string(), z.any()).optional(),
  sort: z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc'])
  }).optional(),
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10)
  }).optional()
});

export type SearchParams = z.infer<typeof searchSchema>;`
    });
  }
  
  // Schéma pour l'upload de fichiers
  if (config.features.includes('file-upload')) {
    files.push({
      path: `shared/validation/${config.formName}-upload.ts`,
      content: `import { z } from "zod";

// Configuration pour l'upload de fichiers
export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= 5 * 1024 * 1024, "Le fichier ne doit pas dépasser 5MB")
    .refine(
      file => ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type),
      "Format de fichier non supporté"
    ),
  description: z.string().optional()
});

export const multipleFileUploadSchema = z.object({
  files: z.array(z.instanceof(File))
    .min(1, "Au moins un fichier est requis")
    .max(10, "Maximum 10 fichiers autorisés")
    .refine(
      files => files.every(file => file.size <= 5 * 1024 * 1024),
      "Chaque fichier ne doit pas dépasser 5MB"
    )
});

export type FileUploadData = z.infer<typeof fileUploadSchema>;
export type MultipleFileUploadData = z.infer<typeof multipleFileUploadSchema>;`
    });
  }
  
  return files;
}
