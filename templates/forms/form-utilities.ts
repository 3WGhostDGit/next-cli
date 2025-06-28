/**
 * Utilitaires et hooks pour les formulaires
 */

import { FormConfig } from './index';
import { FileTemplate } from '../types';

/**
 * Génère les hooks personnalisés pour les formulaires
 */
export function generateFormHooks(config: FormConfig): FileTemplate {
  const { formName, features } = config;
  
  let content = `"use client";

import { useActionState, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/services/${formName}/${config.actions.submitAction}";

/**
 * Hook pour gérer les actions de formulaire avec toast
 */
export function useFormAction<T = any>(
  action: (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult<T>>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    showToast?: boolean;
    resetOnSuccess?: boolean;
  }
) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [hasShownToast, setHasShownToast] = useState(false);

  useEffect(() => {
    if (state && !hasShownToast) {
      if (state.success) {
        if (options?.showToast !== false) {
          toast.success(state.data?.message || "Action réussie");
        }
        options?.onSuccess?.(state.data);
      } else if (state.error) {
        if (options?.showToast !== false) {
          toast.error(state.error);
        }
        options?.onError?.(state.error);
      }
      setHasShownToast(true);
    }
  }, [state, hasShownToast, options]);

  // Reset toast flag when state changes
  useEffect(() => {
    setHasShownToast(false);
  }, [state?.timestamp]);

  const reset = useCallback(() => {
    setHasShownToast(false);
  }, []);

  return {
    state,
    action: formAction,
    isPending,
    reset,
  };
}`;

  // Ajouter le hook d'auto-save si nécessaire
  if (features.includes('auto-save')) {
    content += `

/**
 * Hook pour l'auto-sauvegarde
 */
export function useAutoSave<T = any>({
  data,
  onSave,
  interval = 5000,
  enabled = true,
}: {
  data: T;
  onSave: (data: T) => Promise<void>;
  interval?: number;
  enabled?: boolean;
}) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (!enabled || !data) return;

    const timeoutId = setTimeout(async () => {
      try {
        setSaveStatus('saving');
        await onSave(data);
        setSaveStatus('saved');
        setLastSaved(new Date());
        
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        setSaveStatus('error');
        console.error('Auto-save error:', error);
      }
    }, interval);

    return () => clearTimeout(timeoutId);
  }, [data, onSave, interval, enabled]);

  return {
    saveStatus,
    lastSaved,
  };
}`;
  }

  // Ajouter le hook pour les formulaires multi-étapes
  if (config.formType === 'multi-step') {
    content += `

/**
 * Hook pour gérer les formulaires multi-étapes
 */
export function useMultiStepForm(totalSteps: number) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [stepValidations, setStepValidations] = useState<boolean[]>(
    new Array(totalSteps).fill(false)
  );

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const updateStepData = useCallback((stepIndex: number, data: any) => {
    setFormData(prev => ({
      ...prev,
      [\`step_\${stepIndex}\`]: data,
    }));
  }, []);

  const updateStepValidation = useCallback((stepIndex: number, isValid: boolean) => {
    setStepValidations(prev => {
      const newValidations = [...prev];
      newValidations[stepIndex] = isValid;
      return newValidations;
    });
  }, []);

  const canProceed = stepValidations[currentStep] || false;
  const canGoBack = currentStep > 0;
  const isLastStep = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return {
    currentStep,
    formData,
    stepValidations,
    nextStep,
    prevStep,
    goToStep,
    updateStepData,
    updateStepValidation,
    canProceed,
    canGoBack,
    isLastStep,
    progress,
  };
}`;
  }

  return {
    path: `src/hooks/use-${formName}-form.ts`,
    content
  };
}

/**
 * Génère les utilitaires de validation côté client
 */
export function generateValidationUtils(config: FormConfig): FileTemplate {
  const { formName } = config;
  
  const content = `/**
 * Utilitaires de validation côté client pour ${formName}
 */

import { z } from "zod";

/**
 * Valide un champ en temps réel
 */
export function validateField<T>(
  schema: z.ZodSchema<T>,
  fieldName: string,
  value: unknown
): { isValid: boolean; error?: string } {
  try {
    // Extraire le schéma du champ spécifique
    const fieldSchema = (schema as any).shape?.[fieldName];
    if (!fieldSchema) {
      return { isValid: true };
    }
    
    fieldSchema.parse(value);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors[0]?.message || "Valeur invalide",
      };
    }
    return { isValid: false, error: "Erreur de validation" };
  }
}

/**
 * Valide un formulaire complet
 */
export async function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{
  isValid: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}> {
  try {
    const validData = await schema.parseAsync(data);
    return { isValid: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(err.message);
      });
      
      return { isValid: false, errors: fieldErrors };
    }
    throw error;
  }
}

/**
 * Formate les erreurs pour l'affichage
 */
export function formatValidationErrors(
  errors: Record<string, string[]>
): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  Object.entries(errors).forEach(([field, fieldErrors]) => {
    formatted[field] = fieldErrors[0] || "Erreur de validation";
  });
  
  return formatted;
}

/**
 * Vérifie si un formulaire a des erreurs
 */
export function hasFormErrors(errors?: Record<string, string[]>): boolean {
  if (!errors) return false;
  return Object.keys(errors).length > 0;
}

/**
 * Nettoie les données du formulaire
 */
export function sanitizeFormData(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (typeof value === "string") {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = value;
      }
    }
  });
  
  return sanitized;
}

/**
 * Convertit FormData en objet
 */
export function formDataToObject(formData: FormData): Record<string, any> {
  const obj: Record<string, any> = {};
  
  for (const [key, value] of formData.entries()) {
    if (obj[key]) {
      // Si la clé existe déjà, créer un tableau
      if (Array.isArray(obj[key])) {
        obj[key].push(value);
      } else {
        obj[key] = [obj[key], value];
      }
    } else {
      obj[key] = value;
    }
  }
  
  return obj;
}

/**
 * Convertit un objet en FormData
 */
export function objectToFormData(obj: Record<string, any>): FormData {
  const formData = new FormData();
  
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => formData.append(key, item));
      } else if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === "boolean") {
        formData.append(key, value ? "on" : "");
      } else {
        formData.append(key, value.toString());
      }
    }
  });
  
  return formData;
}`;

  return {
    path: `src/lib/${formName}-validation.ts`,
    content
  };
}
