/**
 * Template de génération de formulaires avec shadcn/ui, validation Zod et Server Actions
 * Génère des formulaires complets avec validation côté client et serveur
 */

import { ProjectConfig, FileTemplate } from '../types';

/**
 * Configuration pour la génération de formulaires
 */
export interface FormConfig extends ProjectConfig {
  formLibrary: 'react-hook-form';
  validation: 'zod';
  uiLibrary: 'shadcn-ui';
  features: FormFeature[];
  fields: FormField[];
  actions: FormAction[];
  styling: FormStyling;
}

/**
 * Fonctionnalités disponibles pour les formulaires
 */
export type FormFeature = 
  | 'file-upload'
  | 'multi-step'
  | 'dynamic-fields'
  | 'auto-save'
  | 'conditional-fields'
  | 'field-arrays'
  | 'optimistic-ui'
  | 'toast-notifications';

/**
 * Types de champs supportés
 */
export type FieldType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'datetime'
  | 'file'
  | 'switch'
  | 'slider'
  | 'combobox';

/**
 * Définition d'un champ de formulaire
 */
export interface FormField {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  validation?: FieldValidation;
  options?: SelectOption[];
  conditional?: ConditionalField;
  defaultValue?: any;
  props?: Record<string, any>;
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
 * Options pour les champs select/radio
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Champ conditionnel
 */
export interface ConditionalField {
  dependsOn: string;
  condition: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than';
  value: any;
}

/**
 * Actions de formulaire
 */
export interface FormAction {
  name: string;
  type: 'create' | 'update' | 'delete' | 'custom';
  endpoint?: string;
  redirect?: string;
  revalidate?: string[];
  optimistic?: boolean;
}

/**
 * Configuration de style
 */
export interface FormStyling {
  layout: 'single-column' | 'two-column' | 'grid' | 'custom';
  spacing: 'compact' | 'normal' | 'relaxed';
  variant: 'default' | 'card' | 'modal' | 'inline';
  submitButton: ButtonConfig;
}

/**
 * Configuration du bouton de soumission
 */
export interface ButtonConfig {
  text: string;
  loadingText: string;
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size: 'default' | 'sm' | 'lg' | 'icon';
  fullWidth?: boolean;
}

/**
 * Résultat d'une Server Action
 */
export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
}

/**
 * État d'un formulaire avec useActionState
 */
export interface FormState<T = any> extends ActionResult<T> {
  timestamp?: number;
}

/**
 * Générateur principal de formulaires
 */
export class FormGenerator {
  constructor(private config: FormConfig) {}

  /**
   * Génère tous les fichiers nécessaires pour un formulaire
   */
  generate(): FileTemplate[] {
    const files: FileTemplate[] = [];

    // 1. Schémas de validation Zod
    files.push(this.generateValidationSchema());

    // 2. Types TypeScript
    files.push(this.generateTypes());

    // 3. Server Actions
    files.push(...this.generateServerActions());

    // 4. Composant de formulaire
    files.push(this.generateFormComponent());

    // 5. Hooks personnalisés (si nécessaire)
    if (this.needsCustomHooks()) {
      files.push(...this.generateCustomHooks());
    }

    // 6. Composants utilitaires
    files.push(...this.generateUtilityComponents());

    return files;
  }

  /**
   * Génère le schéma de validation Zod
   */
  private generateValidationSchema(): FileTemplate {
    const { ValidationGenerator } = require('./validation-generator');
    const generator = new ValidationGenerator(this.config);
    return generator.generate();
  }

  /**
   * Génère les types TypeScript
   */
  private generateTypes(): FileTemplate {
    const { TypesGenerator } = require('./types-generator');
    const generator = new TypesGenerator(this.config);
    return generator.generate();
  }

  /**
   * Génère les Server Actions
   */
  private generateServerActions(): FileTemplate[] {
    const { ActionsGenerator } = require('./actions-generator');
    const generator = new ActionsGenerator(this.config);
    return generator.generate();
  }

  /**
   * Génère le composant de formulaire principal
   */
  private generateFormComponent(): FileTemplate {
    const { ComponentGenerator } = require('./component-generator');
    const generator = new ComponentGenerator(this.config);
    return generator.generate();
  }

  /**
   * Détermine si des hooks personnalisés sont nécessaires
   */
  private needsCustomHooks(): boolean {
    return this.config.features.some(feature => 
      ['auto-save', 'optimistic-ui', 'toast-notifications'].includes(feature)
    );
  }

  /**
   * Génère les hooks personnalisés
   */
  private generateCustomHooks(): FileTemplate[] {
    const { HooksGenerator } = require('./hooks-generator');
    const generator = new HooksGenerator(this.config);
    return generator.generate();
  }

  /**
   * Génère les composants utilitaires
   */
  private generateUtilityComponents(): FileTemplate[] {
    const { UtilityComponentGenerator } = require('./component-generator');
    const generator = new UtilityComponentGenerator(this.config);

    const files: FileTemplate[] = [];

    // Bouton de soumission avec useFormStatus
    files.push(generator.generateSubmitButton());

    // Composants de champs personnalisés si nécessaire
    if (this.config.features.includes('dynamic-fields')) {
      this.config.fields.forEach(field => {
        files.push(generator.generateCustomField(field));
      });
    }

    return files;
  }
}

/**
 * Fonction utilitaire pour créer une configuration de formulaire
 */
export function createFormConfig(
  name: string,
  fields: FormField[],
  options: Partial<FormConfig> = {}
): FormConfig {
  return {
    name,
    description: options.description || `Formulaire ${name}`,
    version: options.version || '1.0.0',
    formLibrary: 'react-hook-form',
    validation: 'zod',
    uiLibrary: 'shadcn-ui',
    features: options.features || [],
    fields,
    actions: options.actions || [
      {
        name: 'submit',
        type: 'create',
      }
    ],
    styling: options.styling || {
      layout: 'single-column',
      spacing: 'normal',
      variant: 'default',
      submitButton: {
        text: 'Soumettre',
        loadingText: 'Soumission...',
        variant: 'default',
        size: 'default',
      },
    },
    ...options,
  };
}

/**
 * Exemples de configurations prédéfinies
 */
export const FORM_PRESETS = {
  contact: createFormConfig('Contact', [
    { name: 'name', type: 'text', label: 'Nom', required: true },
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'subject', type: 'text', label: 'Sujet', required: true },
    { name: 'message', type: 'textarea', label: 'Message', required: true },
  ]),

  user: createFormConfig('User', [
    { name: 'firstName', type: 'text', label: 'Prénom', required: true },
    { name: 'lastName', type: 'text', label: 'Nom', required: true },
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'role', type: 'select', label: 'Rôle', required: true, options: [
      { value: 'user', label: 'Utilisateur' },
      { value: 'admin', label: 'Administrateur' },
    ]},
  ]),

  profile: createFormConfig('Profile', [
    { name: 'avatar', type: 'file', label: 'Photo de profil' },
    { name: 'bio', type: 'textarea', label: 'Biographie' },
    { name: 'website', type: 'text', label: 'Site web' },
    { name: 'notifications', type: 'checkbox', label: 'Recevoir les notifications' },
  ], {
    features: ['file-upload'],
  }),
} as const;
