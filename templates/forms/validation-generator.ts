/**
 * Générateur de schémas de validation Zod pour les formulaires
 * Crée des schémas de validation robustes basés sur la configuration des champs
 */

import { FormConfig, FormField, FieldValidation, FieldType } from './index';
import { FileTemplate } from '../types';

/**
 * Générateur de schémas de validation Zod
 */
export class ValidationGenerator {
  constructor(private config: FormConfig) {}

  /**
   * Génère le fichier de schémas de validation
   */
  generate(): FileTemplate {
    const schemaContent = this.generateSchemaContent();
    
    return {
      path: `shared/validation/${this.config.name.toLowerCase()}.ts`,
      content: `import { z } from "zod";

/**
 * Schémas de validation pour ${this.config.name}
 * Générés automatiquement - Ne pas modifier manuellement
 */

${schemaContent}

// Types inférés des schémas
export type ${this.config.name}FormData = z.infer<typeof ${this.config.name.toLowerCase()}Schema>;
export type ${this.config.name}FormErrors = z.ZodFormattedError<${this.config.name}FormData>;

// Schémas partiels pour les mises à jour
export const ${this.config.name.toLowerCase()}UpdateSchema = ${this.config.name.toLowerCase()}Schema.partial();
export type ${this.config.name}UpdateData = z.infer<typeof ${this.config.name.toLowerCase()}UpdateSchema>;

// Validation des champs individuels
${this.generateFieldValidators()}

// Utilitaires de validation
export const validate${this.config.name} = (data: unknown) => {
  return ${this.config.name.toLowerCase()}Schema.safeParse(data);
};

export const validate${this.config.name}Update = (data: unknown) => {
  return ${this.config.name.toLowerCase()}UpdateSchema.safeParse(data);
};`,
    };
  }

  /**
   * Génère le contenu principal du schéma
   */
  private generateSchemaContent(): string {
    const fields = this.config.fields.map(field => this.generateFieldSchema(field));
    const conditionalValidation = this.generateConditionalValidation();

    return `export const ${this.config.name.toLowerCase()}Schema = z.object({
${fields.join(',\n')}
})${conditionalValidation};`;
  }

  /**
   * Génère le schéma pour un champ spécifique
   */
  private generateFieldSchema(field: FormField): string {
    const baseSchema = this.getBaseSchema(field.type);
    const validation = this.applyValidation(baseSchema, field.validation);
    const finalSchema = field.required ? validation : `${validation}.optional()`;

    return `  ${field.name}: ${finalSchema}`;
  }

  /**
   * Retourne le schéma de base selon le type de champ
   */
  private getBaseSchema(type: FieldType): string {
    switch (type) {
      case 'text':
      case 'textarea':
        return 'z.string()';
      
      case 'email':
        return 'z.string().email("Format d\'email invalide")';
      
      case 'password':
        return 'z.string()';
      
      case 'number':
        return 'z.number({ invalid_type_error: "Doit être un nombre" })';
      
      case 'date':
        return 'z.string().refine((val) => !isNaN(Date.parse(val)), "Date invalide")';
      
      case 'datetime':
        return 'z.string().datetime("Format de date/heure invalide")';
      
      case 'checkbox':
      case 'switch':
        return 'z.boolean()';
      
      case 'select':
      case 'radio':
        return 'z.string()';
      
      case 'multiselect':
        return 'z.array(z.string())';
      
      case 'file':
        return 'z.instanceof(File, { message: "Fichier requis" })';
      
      case 'slider':
        return 'z.number()';
      
      case 'combobox':
        return 'z.string()';
      
      default:
        return 'z.string()';
    }
  }

  /**
   * Applique les règles de validation à un schéma de base
   */
  private applyValidation(baseSchema: string, validation?: FieldValidation): string {
    if (!validation) return baseSchema;

    let schema = baseSchema;

    // Validation de longueur pour les chaînes
    if (validation.minLength !== undefined) {
      const message = validation.messages?.minLength || `Minimum ${validation.minLength} caractères`;
      schema += `.min(${validation.minLength}, "${message}")`;
    }

    if (validation.maxLength !== undefined) {
      const message = validation.messages?.maxLength || `Maximum ${validation.maxLength} caractères`;
      schema += `.max(${validation.maxLength}, "${message}")`;
    }

    // Validation de valeur pour les nombres
    if (validation.min !== undefined) {
      const message = validation.messages?.min || `Minimum ${validation.min}`;
      schema += `.min(${validation.min}, "${message}")`;
    }

    if (validation.max !== undefined) {
      const message = validation.messages?.max || `Maximum ${validation.max}`;
      schema += `.max(${validation.max}, "${message}")`;
    }

    // Validation par pattern regex
    if (validation.pattern) {
      const message = validation.messages?.pattern || "Format invalide";
      schema += `.regex(/${validation.pattern}/, "${message}")`;
    }

    // Validation personnalisée
    if (validation.custom) {
      schema += `.refine(${validation.custom})`;
    }

    return schema;
  }

  /**
   * Génère la validation conditionnelle si nécessaire
   */
  private generateConditionalValidation(): string {
    const conditionalFields = this.config.fields.filter(field => field.conditional);
    
    if (conditionalFields.length === 0) return '';

    const refinements = conditionalFields.map(field => {
      const condition = field.conditional!;
      const conditionCheck = this.generateConditionCheck(condition);
      
      return `.refine((data) => {
  if (${conditionCheck}) {
    return data.${field.name} !== undefined && data.${field.name} !== '';
  }
  return true;
}, {
  message: "${field.label} est requis",
  path: ["${field.name}"],
})`;
    });

    return refinements.join('');
  }

  /**
   * Génère la condition pour un champ conditionnel
   */
  private generateConditionCheck(condition: any): string {
    const { dependsOn, condition: condType, value } = condition;
    
    switch (condType) {
      case 'equals':
        return `data.${dependsOn} === "${value}"`;
      case 'not-equals':
        return `data.${dependsOn} !== "${value}"`;
      case 'contains':
        return `data.${dependsOn}?.includes("${value}")`;
      case 'greater-than':
        return `data.${dependsOn} > ${value}`;
      case 'less-than':
        return `data.${dependsOn} < ${value}`;
      default:
        return 'false';
    }
  }

  /**
   * Génère les validateurs pour champs individuels
   */
  private generateFieldValidators(): string {
    return this.config.fields.map(field => {
      const fieldSchema = this.generateFieldSchema(field).replace(`  ${field.name}: `, '');
      
      return `export const ${field.name}Validator = ${fieldSchema};`;
    }).join('\n');
  }
}

/**
 * Messages d'erreur par défaut pour différents types de validation
 */
export const DEFAULT_ERROR_MESSAGES = {
  required: "Ce champ est requis",
  email: "Format d'email invalide",
  minLength: (min: number) => `Minimum ${min} caractères`,
  maxLength: (max: number) => `Maximum ${max} caractères`,
  min: (min: number) => `Valeur minimum: ${min}`,
  max: (max: number) => `Valeur maximum: ${max}`,
  pattern: "Format invalide",
  file: "Fichier requis",
  number: "Doit être un nombre",
  date: "Date invalide",
  datetime: "Format de date/heure invalide",
} as const;

/**
 * Schémas de validation prédéfinis pour des cas d'usage courants
 */
export const COMMON_VALIDATION_SCHEMAS = {
  email: 'z.string().email("Format d\'email invalide")',
  password: 'z.string().min(8, "Minimum 8 caractères").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/, "Doit contenir au moins une minuscule, une majuscule et un chiffre")',
  phone: 'z.string().regex(/^[\\+]?[1-9][\\d]{0,15}$/, "Numéro de téléphone invalide")',
  url: 'z.string().url("URL invalide")',
  slug: 'z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (lettres minuscules, chiffres et tirets uniquement)")',
  postalCode: 'z.string().regex(/^\\d{5}$/, "Code postal invalide")',
  age: 'z.number().min(0, "L\'âge ne peut pas être négatif").max(150, "Âge invalide")',
} as const;

/**
 * Générateur de schémas pour des patterns complexes
 */
export class ComplexValidationGenerator {
  /**
   * Génère un schéma pour confirmation de mot de passe
   */
  static generatePasswordConfirmation(): string {
    return `.refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})`;
  }

  /**
   * Génère un schéma pour validation de fichier avec contraintes
   */
  static generateFileValidation(maxSize: number, allowedTypes: string[]): string {
    return `.refine((file) => file.size <= ${maxSize}, "Fichier trop volumineux")
.refine((file) => [${allowedTypes.map(type => `"${type}"`).join(', ')}].includes(file.type), "Type de fichier non autorisé")`;
  }

  /**
   * Génère un schéma pour validation de plage de dates
   */
  static generateDateRange(): string {
    return `.refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["endDate"],
})`;
  }
}
