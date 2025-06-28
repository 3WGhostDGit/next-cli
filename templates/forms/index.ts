/**
 * Configuration et types pour la génération de formulaires
 * Intègre shadcn/ui, Zod validation et Server Actions
 */

import { ProjectConfig } from '../types';

export interface FormField {
  name: string;
  type: 'string' | 'email' | 'password' | 'number' | 'boolean' | 'date' | 'select' | 'textarea' | 'file';
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
  options?: Array<{ label: string; value: string }>; // Pour les select
  multiple?: boolean; // Pour les select multiples
}

export interface FormStep {
  name: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormConfig extends ProjectConfig {
  formName: string;
  formType: 'basic' | 'multi-step' | 'dynamic';
  
  // Configuration des champs
  fields?: FormField[];
  steps?: FormStep[]; // Pour les formulaires multi-étapes
  
  // Configuration de validation
  validation: {
    library: 'zod';
    realTimeValidation: boolean;
    customMessages: boolean;
  };
  
  // Configuration des actions
  actions: {
    submitAction: string; // Nom de l'action serveur
    redirectAfterSubmit?: string;
    showSuccessMessage: boolean;
    optimisticUpdates: boolean;
  };
  
  // Configuration UI
  ui: {
    layout: 'vertical' | 'horizontal' | 'grid';
    submitButtonText: string;
    loadingText: string;
    showProgress?: boolean; // Pour multi-step
    theme: 'default' | 'card' | 'inline';
  };
  
  // Fonctionnalités avancées
  features: Array<
    | 'file-upload'
    | 'auto-save'
    | 'field-dependencies'
    | 'dynamic-fields'
    | 'confirmation-step'
    | 'draft-mode'
  >;
}

// Types pour la génération
export interface FormGenerationOptions {
  includeTests: boolean;
  includeStorybook: boolean;
  generateTypes: boolean;
  generateHooks: boolean;
}

// Configuration par défaut
export const defaultFormConfig: Partial<FormConfig> = {
  validation: {
    library: 'zod',
    realTimeValidation: true,
    customMessages: true,
  },
  actions: {
    submitAction: 'submitForm',
    showSuccessMessage: true,
    optimisticUpdates: false,
  },
  ui: {
    layout: 'vertical',
    submitButtonText: 'Soumettre',
    loadingText: 'Envoi en cours...',
    theme: 'default',
  },
  features: [],
};

// Exemples de configurations prédéfinies
export const formPresets = {
  contact: {
    formName: 'contact',
    formType: 'basic' as const,
    fields: [
      {
        name: 'name',
        type: 'string' as const,
        label: 'Nom complet',
        placeholder: 'Votre nom',
        required: true,
        validation: { min: 2, max: 50 },
      },
      {
        name: 'email',
        type: 'email' as const,
        label: 'Email',
        placeholder: 'votre@email.com',
        required: true,
      },
      {
        name: 'subject',
        type: 'string' as const,
        label: 'Sujet',
        placeholder: 'Sujet de votre message',
        required: true,
        validation: { min: 5, max: 100 },
      },
      {
        name: 'message',
        type: 'textarea' as const,
        label: 'Message',
        placeholder: 'Votre message...',
        required: true,
        validation: { min: 10, max: 1000 },
      },
    ],
  },
  
  registration: {
    formName: 'registration',
    formType: 'multi-step' as const,
    steps: [
      {
        name: 'personal',
        title: 'Informations personnelles',
        fields: [
          {
            name: 'firstName',
            type: 'string' as const,
            label: 'Prénom',
            required: true,
            validation: { min: 2, max: 30 },
          },
          {
            name: 'lastName',
            type: 'string' as const,
            label: 'Nom',
            required: true,
            validation: { min: 2, max: 30 },
          },
          {
            name: 'email',
            type: 'email' as const,
            label: 'Email',
            required: true,
          },
        ],
      },
      {
        name: 'account',
        title: 'Compte utilisateur',
        fields: [
          {
            name: 'username',
            type: 'string' as const,
            label: "Nom d'utilisateur",
            required: true,
            validation: { min: 3, max: 20, pattern: '^[a-zA-Z0-9_]+$' },
          },
          {
            name: 'password',
            type: 'password' as const,
            label: 'Mot de passe',
            required: true,
            validation: { min: 8 },
          },
          {
            name: 'confirmPassword',
            type: 'password' as const,
            label: 'Confirmer le mot de passe',
            required: true,
          },
        ],
      },
    ],
  },
  
  profile: {
    formName: 'profile',
    formType: 'basic' as const,
    fields: [
      {
        name: 'avatar',
        type: 'file' as const,
        label: 'Photo de profil',
        description: 'Formats acceptés: JPG, PNG (max 2MB)',
      },
      {
        name: 'displayName',
        type: 'string' as const,
        label: 'Nom affiché',
        required: true,
        validation: { min: 2, max: 50 },
      },
      {
        name: 'bio',
        type: 'textarea' as const,
        label: 'Biographie',
        placeholder: 'Parlez-nous de vous...',
        validation: { max: 500 },
      },
      {
        name: 'website',
        type: 'string' as const,
        label: 'Site web',
        placeholder: 'https://...',
        validation: { pattern: '^https?://.+' },
      },
      {
        name: 'notifications',
        type: 'boolean' as const,
        label: 'Recevoir les notifications par email',
      },
    ],
    features: ['auto-save'],
  },
};

export * from './types';
export * from './generator';
