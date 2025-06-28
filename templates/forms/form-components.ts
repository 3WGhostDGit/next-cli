/**
 * Générateurs de composants shadcn/ui pour les formulaires
 */

import { FormConfig, FormField } from './index';
import { FileTemplate } from '../types';

/**
 * Génère le composant principal du formulaire
 */
export function generateFormComponent(config: FormConfig): FileTemplate {
  const { formName, formType, ui } = config;
  const componentName = `${formName.charAt(0).toUpperCase() + formName.slice(1)}Form`;
  
  let content = '';
  
  if (formType === 'multi-step') {
    content = generateMultiStepFormComponent(config);
  } else {
    content = generateBasicFormComponent(config);
  }
  
  return {
    path: `src/components/forms/${formName}-form.tsx`,
    content
  };
}

/**
 * Génère un composant de formulaire simple
 */
function generateBasicFormComponent(config: FormConfig): string {
  const { formName, fields, actions, ui, features } = config;
  const componentName = `${formName.charAt(0).toUpperCase() + formName.slice(1)}Form`;
  const schemaName = `${formName}Schema`;
  const actionName = actions.submitAction;
  
  const imports = `"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ${actionName} } from "@/services/${formName}/${actionName}";
import { ${schemaName}, type ${formName.charAt(0).toUpperCase() + formName.slice(1)}Data } from "@/shared/validation/${formName}";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { toast } from "sonner";
${features.includes('file-upload') ? 'import { FileUpload } from "@/components/ui/file-upload";' : ''}
${features.includes('auto-save') ? 'import { useAutoSave } from "@/hooks/use-auto-save";' : ''}`;

  const formFields = fields?.map(field => generateFormField(field)).join('\n\n        ') || '';
  
  const component = `
interface ${componentName}Props {
  initialData?: Partial<${formName.charAt(0).toUpperCase() + formName.slice(1)}Data>;
  onSuccess?: (data: any) => void;
  className?: string;
}

export function ${componentName}({ 
  initialData, 
  onSuccess,
  className 
}: ${componentName}Props) {
  const [state, formAction, isPending] = useActionState(${actionName}, null);
  
  const form = useForm<${formName.charAt(0).toUpperCase() + formName.slice(1)}Data>({
    resolver: zodResolver(${schemaName}),
    defaultValues: {
      ${generateDefaultValues(fields || [])}
      ...initialData,
    },
  });

  ${features.includes('auto-save') ? `
  // Auto-save functionality
  const { saveStatus } = useAutoSave({
    data: form.watch(),
    onSave: async (data) => {
      // Implement auto-save logic
      console.log('Auto-saving:', data);
    },
    interval: 5000, // 5 seconds
  });` : ''}

  // Handle form submission
  async function onSubmit(values: ${formName.charAt(0).toUpperCase() + formName.slice(1)}Data) {
    const formData = new FormData();
    
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'boolean') {
          formData.append(key, value ? 'on' : '');
        } else if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach(item => formData.append(key, item.toString()));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    formAction(formData);
  }

  // Handle action state changes
  React.useEffect(() => {
    if (state?.success) {
      toast.success(state.data?.message || "Formulaire soumis avec succès");
      form.reset();
      onSuccess?.(state.data);
    } else if (state?.error) {
      toast.error(state.error);
    } else if (state?.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([field, errors]) => {
        form.setError(field as any, {
          type: "server",
          message: errors[0],
        });
      });
    }
  }, [state, form, onSuccess]);

  const FormWrapper = ${ui.theme === 'card' ? 'Card' : 'div'};
  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        ${formFields}
        
        <div className="flex items-center justify-between">
          ${features.includes('auto-save') ? `
          <div className="text-sm text-muted-foreground">
            {saveStatus === 'saving' && 'Sauvegarde...'}
            {saveStatus === 'saved' && 'Sauvegardé'}
            {saveStatus === 'error' && 'Erreur de sauvegarde'}
          </div>` : '<div />'}
          
          <Button type="submit" disabled={isPending}>
            {isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "${ui.loadingText}" : "${ui.submitButtonText}"}
          </Button>
        </div>
      </form>
    </Form>
  );

  ${ui.theme === 'card' ? `
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>${formName.charAt(0).toUpperCase() + formName.slice(1)}</CardTitle>
        <CardDescription>
          Remplissez le formulaire ci-dessous
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );` : `
  return (
    <div className={className}>
      {formContent}
    </div>
  );`}
}`;

  return imports + component;
}

/**
 * Génère un champ de formulaire shadcn/ui
 */
function generateFormField(field: FormField): string {
  const { name, type, label, placeholder, description, required, options } = field;
  
  let fieldComponent = '';
  
  switch (type) {
    case 'string':
    case 'email':
      fieldComponent = `
        <FormField
          control={form.control}
          name="${name}"
          render={({ field }) => (
            <FormItem>
              <FormLabel>${label}${required ? ' *' : ''}</FormLabel>
              <FormControl>
                <Input 
                  type="${type === 'email' ? 'email' : 'text'}"
                  placeholder="${placeholder || ''}" 
                  {...field} 
                />
              </FormControl>
              ${description ? `<FormDescription>${description}</FormDescription>` : ''}
              <FormMessage />
            </FormItem>
          )}
        />`;
      break;
      
    case 'password':
      fieldComponent = `
        <FormField
          control={form.control}
          name="${name}"
          render={({ field }) => (
            <FormItem>
              <FormLabel>${label}${required ? ' *' : ''}</FormLabel>
              <FormControl>
                <Input 
                  type="password"
                  placeholder="${placeholder || ''}" 
                  {...field} 
                />
              </FormControl>
              ${description ? `<FormDescription>${description}</FormDescription>` : ''}
              <FormMessage />
            </FormItem>
          )}
        />`;
      break;
      
    case 'textarea':
      fieldComponent = `
        <FormField
          control={form.control}
          name="${name}"
          render={({ field }) => (
            <FormItem>
              <FormLabel>${label}${required ? ' *' : ''}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="${placeholder || ''}"
                  className="resize-none"
                  {...field} 
                />
              </FormControl>
              ${description ? `<FormDescription>${description}</FormDescription>` : ''}
              <FormMessage />
            </FormItem>
          )}
        />`;
      break;
      
    case 'boolean':
      fieldComponent = `
        <FormField
          control={form.control}
          name="${name}"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>${label}</FormLabel>
                ${description ? `<FormDescription>${description}</FormDescription>` : ''}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />`;
      break;
      
    case 'select':
      fieldComponent = `
        <FormField
          control={form.control}
          name="${name}"
          render={({ field }) => (
            <FormItem>
              <FormLabel>${label}${required ? ' *' : ''}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="${placeholder || 'Sélectionnez une option'}" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  ${options?.map(option => 
                    `<SelectItem value="${option.value}">${option.label}</SelectItem>`
                  ).join('\n                  ') || ''}
                </SelectContent>
              </Select>
              ${description ? `<FormDescription>${description}</FormDescription>` : ''}
              <FormMessage />
            </FormItem>
          )}
        />`;
      break;
      
    case 'file':
      fieldComponent = `
        <FormField
          control={form.control}
          name="${name}"
          render={({ field }) => (
            <FormItem>
              <FormLabel>${label}${required ? ' *' : ''}</FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value}
                  onChange={field.onChange}
                  multiple={${field.multiple || false}}
                  accept="image/*,application/pdf"
                />
              </FormControl>
              ${description ? `<FormDescription>${description}</FormDescription>` : ''}
              <FormMessage />
            </FormItem>
          )}
        />`;
      break;
      
    default:
      fieldComponent = `
        <FormField
          control={form.control}
          name="${name}"
          render={({ field }) => (
            <FormItem>
              <FormLabel>${label}${required ? ' *' : ''}</FormLabel>
              <FormControl>
                <Input placeholder="${placeholder || ''}" {...field} />
              </FormControl>
              ${description ? `<FormDescription>${description}</FormDescription>` : ''}
              <FormMessage />
            </FormItem>
          )}
        />`;
  }
  
  return fieldComponent;
}

/**
 * Génère les valeurs par défaut du formulaire
 */
function generateDefaultValues(fields: FormField[]): string {
  return fields.map(field => {
    let defaultValue = '';
    
    switch (field.type) {
      case 'boolean':
        defaultValue = 'false';
        break;
      case 'number':
        defaultValue = '0';
        break;
      case 'select':
        if (field.multiple) {
          defaultValue = '[]';
        } else {
          defaultValue = '""';
        }
        break;
      default:
        defaultValue = '""';
    }
    
    return `      ${field.name}: ${defaultValue},`;
  }).join('\n');
}

/**
 * Génère un composant de formulaire multi-étapes
 */
function generateMultiStepFormComponent(config: FormConfig): string {
  const { formName, steps, ui } = config;
  const componentName = `${formName.charAt(0).toUpperCase() + formName.slice(1)}Form`;

  if (!steps) return '';

  const imports = `"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ${steps.map(step => `${step.name}Schema`).join(', ')}, ${formName}Schema } from "@/shared/validation/${formName}";
import { saveStep, submitComplete } from "@/services/${formName}";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { toast } from "sonner";`;

  const component = `
export function ${componentName}() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = ${steps.length};
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Configuration des schémas par étape
  const stepSchemas = [${steps.map(step => `${step.name}Schema`).join(', ')}];
  const currentSchema = stepSchemas[currentStep];

  const form = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: formData,
  });

  // Navigation entre les étapes
  const nextStep = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const stepData = form.getValues();
    const newFormData = { ...formData, ...stepData };
    setFormData(newFormData);

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      form.reset(newFormData);
    } else {
      await handleFinalSubmit(newFormData);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      form.reset(formData);
    }
  };

  // Soumission finale
  const handleFinalSubmit = async (completeData: any) => {
    setIsSubmitting(true);
    try {
      const result = await submitComplete(completeData);
      if (result.success) {
        toast.success("Formulaire soumis avec succès!");
        // Reset form
        setCurrentStep(0);
        setFormData({});
        form.reset();
      } else {
        toast.error(result.error || "Erreur lors de la soumission");
      }
    } catch (error) {
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rendu des étapes
  const renderStep = () => {
    const step = ${JSON.stringify(steps)}[currentStep];
    if (!step) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{step.title}</h2>
          {step.description && (
            <p className="text-muted-foreground mt-2">{step.description}</p>
          )}
        </div>

        <Form {...form}>
          <div className="space-y-4">
            ${steps.map((step, stepIndex) => `
            {currentStep === ${stepIndex} && (
              <>
                ${step.fields.map(field => generateFormField(field)).join('\n                ')}
              </>
            )}`).join('\n            ')}
          </div>
        </Form>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>${formName.charAt(0).toUpperCase() + formName.slice(1)}</CardTitle>
        <CardDescription>
          Étape {currentStep + 1} sur {totalSteps}
        </CardDescription>
        ${ui.showProgress ? `
        <Progress value={progress} className="w-full" />` : ''}
      </CardHeader>

      <CardContent>
        {renderStep()}

        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <Icons.chevronLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>

          <Button
            type="button"
            onClick={nextStep}
            disabled={isSubmitting}
          >
            {isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            {currentStep === totalSteps - 1 ? "Terminer" : "Suivant"}
            {currentStep < totalSteps - 1 && <Icons.chevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}`;

  return imports + component;
}
