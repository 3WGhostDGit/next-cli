/**
 * Générateur de hooks personnalisés pour les formulaires
 * Crée des hooks React pour fonctionnalités avancées
 */

import { FormConfig, FormFeature } from './index';
import { FileTemplate } from '../types';

/**
 * Générateur de hooks personnalisés
 */
export class HooksGenerator {
  constructor(private config: FormConfig) {}

  /**
   * Génère tous les hooks nécessaires
   */
  generate(): FileTemplate[] {
    const files: FileTemplate[] = [];

    // Hook principal pour le formulaire
    files.push(this.generateMainHook());

    // Hooks pour fonctionnalités spécifiques
    if (this.config.features.includes('auto-save')) {
      files.push(this.generateAutoSaveHook());
    }

    if (this.config.features.includes('optimistic-ui')) {
      files.push(this.generateOptimisticHook());
    }

    if (this.config.features.includes('toast-notifications')) {
      files.push(this.generateNotificationHook());
    }

    if (this.config.features.includes('file-upload')) {
      files.push(this.generateFileUploadHook());
    }

    return files;
  }

  /**
   * Génère le hook principal du formulaire
   */
  private generateMainHook(): FileTemplate {
    const hookName = `use${this.config.name}Form`;
    
    return {
      path: `src/hooks/${this.config.name.toLowerCase()}/use-${this.config.name.toLowerCase()}-form.ts`,
      content: `"use client";

import { useActionState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ${this.config.name.toLowerCase()}Schema } from "@/shared/validation/${this.config.name.toLowerCase()}";
import { ${this.config.name.toLowerCase()}Action } from "@/services/${this.config.name.toLowerCase()}/actions";
import type { ${this.config.name}FormData } from "@/shared/validation/${this.config.name.toLowerCase()}";
import type { ActionResult } from "@/shared/types/actions";

export interface Use${this.config.name}FormOptions {
  defaultValues?: Partial<${this.config.name}FormData>;
  onSuccess?: (data: ${this.config.name}FormData) => void;
  onError?: (error: string) => void;
  mode?: "onChange" | "onBlur" | "onSubmit" | "onTouched" | "all";
}

export interface Use${this.config.name}FormReturn {
  // React Hook Form
  form: ReturnType<typeof useForm<${this.config.name}FormData>>;
  
  // Server Action State
  state: ActionResult<${this.config.name}FormData>;
  action: (formData: FormData) => void;
  isPending: boolean;
  
  // Handlers
  handleSubmit: (data: ${this.config.name}FormData) => Promise<void>;
  reset: () => void;
  
  // Status
  isValid: boolean;
  isDirty: boolean;
  hasErrors: boolean;
}

/**
 * Hook principal pour gérer le formulaire ${this.config.name}
 */
export function ${hookName}(options: Use${this.config.name}FormOptions = {}): Use${this.config.name}FormReturn {
  const {
    defaultValues,
    onSuccess,
    onError,
    mode = "onChange",
  } = options;

  // État du formulaire avec Server Action
  const [state, formAction, isPending] = useActionState(${this.config.name.toLowerCase()}Action, {
    success: false,
  });

  // Configuration react-hook-form
  const form = useForm<${this.config.name}FormData>({
    resolver: zodResolver(${this.config.name.toLowerCase()}Schema),
    defaultValues: {
      ${this.generateDefaultValues()}
      ...defaultValues,
    },
    mode,
  });

  const { formState: { isValid, isDirty, errors } } = form;

  // Gestionnaire de soumission hybride
  const handleSubmit = useCallback(async (data: ${this.config.name}FormData) => {
    try {
      // Préparer FormData pour Server Action
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (Array.isArray(value)) {
            formData.append(key, value.join(','));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // Exécuter l'action serveur
      await formAction(formData);
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      onError?.('Une erreur inattendue s\'est produite');
    }
  }, [formAction, onError]);

  // Fonction de reset
  const reset = useCallback(() => {
    form.reset();
  }, [form]);

  // Gestion des callbacks de succès/erreur
  useEffect(() => {
    if (state.success && state.data) {
      onSuccess?.(state.data);
    } else if (!state.success && state.error) {
      onError?.(state.error);
    }
  }, [state, onSuccess, onError]);

  // Synchronisation des erreurs serveur avec react-hook-form
  useEffect(() => {
    if (state.errors) {
      Object.entries(state.errors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          form.setError(field as keyof ${this.config.name}FormData, {
            type: "server",
            message: messages[0],
          });
        }
      });
    }
  }, [state.errors, form]);

  return {
    form,
    state,
    action: formAction,
    isPending,
    handleSubmit,
    reset,
    isValid,
    isDirty,
    hasErrors: Object.keys(errors).length > 0,
  };
}`,
    };
  }

  /**
   * Génère le hook d'auto-save
   */
  private generateAutoSaveHook(): FileTemplate {
    return {
      path: `src/hooks/${this.config.name.toLowerCase()}/use-${this.config.name.toLowerCase()}-auto-save.ts`,
      content: `"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { debounce } from "lodash";
import type { ${this.config.name}FormData } from "@/shared/validation/${this.config.name.toLowerCase()}";

export interface Use${this.config.name}AutoSaveOptions {
  delay?: number; // Délai en ms avant sauvegarde
  enabled?: boolean;
  onSave?: (data: ${this.config.name}FormData) => Promise<void>;
  onError?: (error: Error) => void;
}

export interface Use${this.config.name}AutoSaveReturn {
  isDirty: boolean;
  isSaving: boolean;
  lastSaved?: Date;
  save: () => Promise<void>;
  enableAutoSave: (enabled: boolean) => void;
}

/**
 * Hook pour l'auto-sauvegarde du formulaire
 */
export function use${this.config.name}AutoSave(
  form: UseFormReturn<${this.config.name}FormData>,
  options: Use${this.config.name}AutoSaveOptions = {}
): Use${this.config.name}AutoSaveReturn {
  const {
    delay = 2000,
    enabled: initialEnabled = true,
    onSave,
    onError,
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>();
  const [enabled, setEnabled] = useState(initialEnabled);
  
  const { watch, formState: { isDirty }, getValues } = form;
  const savedDataRef = useRef<string>();

  // Fonction de sauvegarde
  const save = useCallback(async () => {
    if (!onSave || !isDirty) return;

    try {
      setIsSaving(true);
      const data = getValues();
      await onSave(data);
      setLastSaved(new Date());
      savedDataRef.current = JSON.stringify(data);
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, isDirty, getValues, onError]);

  // Sauvegarde automatique avec debounce
  const debouncedSave = useCallback(
    debounce(save, delay),
    [save, delay]
  );

  // Observer les changements du formulaire
  useEffect(() => {
    if (!enabled || !onSave) return;

    const subscription = watch((data) => {
      const currentData = JSON.stringify(data);
      
      // Sauvegarder seulement si les données ont changé
      if (currentData !== savedDataRef.current) {
        debouncedSave();
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, enabled, onSave, debouncedSave]);

  // Nettoyage du debounce
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return {
    isDirty,
    isSaving,
    lastSaved,
    save,
    enableAutoSave: setEnabled,
  };
}`,
    };
  }

  /**
   * Génère le hook pour UI optimiste
   */
  private generateOptimisticHook(): FileTemplate {
    return {
      path: `src/hooks/${this.config.name.toLowerCase()}/use-${this.config.name.toLowerCase()}-optimistic.ts`,
      content: `"use client";

import { useOptimistic, useCallback } from "react";
import type { ${this.config.name} } from "@/shared/types/${this.config.name.toLowerCase()}";

export interface Use${this.config.name}OptimisticReturn {
  optimisticData: ${this.config.name}[];
  addOptimistic: (data: Omit<${this.config.name}, 'id'>) => void;
  updateOptimistic: (id: string, data: Partial<${this.config.name}>) => void;
  removeOptimistic: (id: string) => void;
}

/**
 * Hook pour la gestion optimiste des données
 */
export function use${this.config.name}Optimistic(
  initialData: ${this.config.name}[]
): Use${this.config.name}OptimisticReturn {
  const [optimisticData, setOptimisticData] = useOptimistic(
    initialData,
    (state: ${this.config.name}[], action: {
      type: 'add' | 'update' | 'remove';
      data?: Partial<${this.config.name}>;
      id?: string;
    }) => {
      switch (action.type) {
        case 'add':
          return [
            ...state,
            {
              ...action.data,
              id: \`temp-\${Date.now()}\`,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as ${this.config.name}
          ];
          
        case 'update':
          return state.map(item =>
            item.id === action.id
              ? { ...item, ...action.data, updatedAt: new Date() }
              : item
          );
          
        case 'remove':
          return state.filter(item => item.id !== action.id);
          
        default:
          return state;
      }
    }
  );

  const addOptimistic = useCallback((data: Omit<${this.config.name}, 'id'>) => {
    setOptimisticData({ type: 'add', data });
  }, [setOptimisticData]);

  const updateOptimistic = useCallback((id: string, data: Partial<${this.config.name}>) => {
    setOptimisticData({ type: 'update', id, data });
  }, [setOptimisticData]);

  const removeOptimistic = useCallback((id: string) => {
    setOptimisticData({ type: 'remove', id });
  }, [setOptimisticData]);

  return {
    optimisticData,
    addOptimistic,
    updateOptimistic,
    removeOptimistic,
  };
}`,
    };
  }

  /**
   * Génère le hook de notifications
   */
  private generateNotificationHook(): FileTemplate {
    return {
      path: `src/hooks/${this.config.name.toLowerCase()}/use-${this.config.name.toLowerCase()}-notifications.ts`,
      content: `"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/shared/types/actions";

export interface Use${this.config.name}NotificationsOptions {
  successMessage?: string;
  errorMessage?: string;
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
  duration?: number;
}

/**
 * Hook pour gérer les notifications du formulaire
 */
export function use${this.config.name}Notifications(
  state: ActionResult,
  options: Use${this.config.name}NotificationsOptions = {}
) {
  const {
    successMessage = "Opération réussie",
    errorMessage = "Une erreur s'est produite",
    duration = 4000,
  } = options;

  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message || successMessage, {
        duration,
      });
    } else if (!state.success && state.error) {
      toast.error(state.error || errorMessage, {
        duration,
      });
    }
  }, [state, successMessage, errorMessage, duration]);
}`,
    };
  }

  /**
   * Génère le hook d'upload de fichiers
   */
  private generateFileUploadHook(): FileTemplate {
    return {
      path: `src/hooks/${this.config.name.toLowerCase()}/use-${this.config.name.toLowerCase()}-file-upload.ts`,
      content: `"use client";

import { useState, useCallback } from "react";

export interface FileUploadProgress {
  [fieldName: string]: number;
}

export interface Use${this.config.name}FileUploadReturn {
  uploadProgress: FileUploadProgress;
  isUploading: boolean;
  uploadFile: (fieldName: string, file: File) => Promise<string>;
  removeFile: (fieldName: string) => void;
  resetProgress: () => void;
}

/**
 * Hook pour gérer l'upload de fichiers
 */
export function use${this.config.name}FileUpload(): Use${this.config.name}FileUploadReturn {
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress>({});
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(async (fieldName: string, file: File): Promise<string> => {
    setIsUploading(true);
    
    try {
      // Simuler l'upload avec progression
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Simulation de progression
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(prev => ({
            ...prev,
            [fieldName]: progress
          }));
          
          if (progress >= 100) {
            clearInterval(interval);
            // TODO: Remplacer par un vrai appel API
            resolve(\`/uploads/\${file.name}\`);
          }
        }, 100);
      });
    } catch (error) {
      console.error('Erreur upload:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const removeFile = useCallback((fieldName: string) => {
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fieldName];
      return newProgress;
    });
  }, []);

  const resetProgress = useCallback(() => {
    setUploadProgress({});
    setIsUploading(false);
  }, []);

  return {
    uploadProgress,
    isUploading,
    uploadFile,
    removeFile,
    resetProgress,
  };
}`,
    };
  }

  /**
   * Génère les valeurs par défaut pour le hook principal
   */
  private generateDefaultValues(): string {
    return this.config.fields.map(field => {
      let defaultValue = field.defaultValue;
      
      if (defaultValue === undefined) {
        switch (field.type) {
          case 'text':
          case 'email':
          case 'password':
          case 'textarea':
          case 'select':
          case 'combobox':
            defaultValue = '""';
            break;
          case 'number':
          case 'slider':
            defaultValue = '0';
            break;
          case 'checkbox':
          case 'switch':
            defaultValue = 'false';
            break;
          case 'multiselect':
            defaultValue = '[]';
            break;
          case 'date':
          case 'datetime':
            defaultValue = 'undefined';
            break;
          default:
            defaultValue = 'undefined';
        }
      } else if (typeof defaultValue === 'string') {
        defaultValue = `"${defaultValue}"`;
      }

      return `      ${field.name}: ${defaultValue},`;
    }).join('\n');
  }
}
