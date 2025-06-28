/**
 * Types TypeScript pour les formulaires
 */

import { z } from 'zod';

// Types de base pour les formulaires
export interface FormState {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: any;
}

export interface FormActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  timestamp?: string;
}

// Types pour les hooks de formulaire
export interface UseFormActionOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  showToast?: boolean;
  resetOnSuccess?: boolean;
}

export interface UseFormActionReturn<T> {
  state: FormActionResult<T>;
  action: (formData: FormData) => void;
  isPending: boolean;
  reset: () => void;
}

// Types pour la validation
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'custom';
  value?: any;
  message: string;
}

export interface FieldValidation {
  rules: ValidationRule[];
  dependencies?: string[]; // Champs dont dépend cette validation
}

// Types pour les champs dynamiques
export interface DynamicFieldConfig {
  name: string;
  condition: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  };
  action: 'show' | 'hide' | 'require' | 'disable';
}

// Types pour les formulaires multi-étapes
export interface StepValidation {
  stepIndex: number;
  isValid: boolean;
  errors: Record<string, string[]>;
}

export interface MultiStepFormState {
  currentStep: number;
  totalSteps: number;
  stepValidations: StepValidation[];
  formData: Record<string, any>;
  canProceed: boolean;
  canGoBack: boolean;
}

// Types pour l'upload de fichiers
export interface FileUploadConfig {
  maxSize: number; // en bytes
  allowedTypes: string[];
  multiple: boolean;
  uploadEndpoint?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

// Types pour l'auto-save
export interface AutoSaveConfig {
  enabled: boolean;
  interval: number; // en millisecondes
  storageKey: string;
  excludeFields?: string[];
}

export interface DraftData {
  formData: Record<string, any>;
  savedAt: Date;
  version: number;
}

// Types pour les notifications
export interface FormNotification {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Types pour les schémas Zod générés
export type ZodFieldType = 
  | z.ZodString
  | z.ZodNumber
  | z.ZodBoolean
  | z.ZodDate
  | z.ZodEnum<any>
  | z.ZodArray<any>
  | z.ZodOptional<any>
  | z.ZodNullable<any>;

export interface ZodSchemaConfig {
  fieldName: string;
  zodType: string;
  validations: string[];
  isOptional: boolean;
  isArray: boolean;
}

// Types pour la génération de code
export interface GeneratedFormFiles {
  schema: string; // Fichier de schéma Zod
  action: string; // Server Action
  component: string; // Composant React
  types: string; // Types TypeScript
  hooks?: string; // Hooks personnalisés
  utils?: string; // Utilitaires
  tests?: string; // Tests
  stories?: string; // Storybook
}

// Types pour les templates
export interface FormTemplate {
  name: string;
  description: string;
  category: 'basic' | 'advanced' | 'specialized';
  config: Partial<import('./index').FormConfig>;
  preview?: string;
  tags: string[];
}

// Types pour les erreurs de validation
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}

// Types pour les événements de formulaire
export interface FormEvent {
  type: 'submit' | 'change' | 'blur' | 'focus' | 'reset' | 'step_change';
  field?: string;
  value?: any;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface FormAnalytics {
  formId: string;
  events: FormEvent[];
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  abandonedAt?: {
    step: number;
    field: string;
  };
}

// Types pour l'accessibilité
export interface AccessibilityConfig {
  announceErrors: boolean;
  focusFirstError: boolean;
  ariaDescriptions: boolean;
  keyboardNavigation: boolean;
  screenReaderOptimized: boolean;
}

// Types pour la personnalisation du thème
export interface FormThemeConfig {
  colors: {
    primary: string;
    error: string;
    success: string;
    warning: string;
    background: string;
    border: string;
  };
  spacing: {
    fieldGap: string;
    sectionGap: string;
    padding: string;
  };
  typography: {
    labelSize: string;
    inputSize: string;
    errorSize: string;
    helpSize: string;
  };
  borderRadius: string;
  shadows: {
    input: string;
    button: string;
  };
}

// Export des types utilitaires
export type FormFieldValue = string | number | boolean | Date | File | File[] | null | undefined;
export type FormData = Record<string, FormFieldValue>;
export type FormErrors = Record<string, string | string[]>;
export type FormTouched = Record<string, boolean>;
export type FormDirty = Record<string, boolean>;
