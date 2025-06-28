/**
 * Générateur de composants de formulaires avec shadcn/ui
 * Crée des composants React avec react-hook-form et intégration Server Actions
 */

import { FormConfig, FormField, FieldType, FormStyling } from './index';
import { FileTemplate } from '../types';

/**
 * Générateur de composants de formulaires
 */
export class ComponentGenerator {
  constructor(private config: FormConfig) {}

  /**
   * Génère le composant de formulaire principal
   */
  generate(): FileTemplate {
    return {
      path: `src/components/forms/${this.config.name.toLowerCase()}-form.tsx`,
      content: this.generateFormComponent(),
    };
  }

  /**
   * Génère le contenu du composant de formulaire
   */
  private generateFormComponent(): string {
    const imports = this.generateImports();
    const component = this.generateComponentContent();

    return `${imports}

${component}`;
  }

  /**
   * Génère les imports nécessaires
   */
  private generateImports(): string {
    const baseImports = [
      '"use client";',
      '',
      'import { useActionState } from "react";',
      'import { useForm } from "react-hook-form";',
      'import { zodResolver } from "@hookform/resolvers/zod";',
      `import { ${this.config.name.toLowerCase()}Schema } from "@/shared/validation/${this.config.name.toLowerCase()}";`,
      `import type { ${this.config.name}FormData } from "@/shared/validation/${this.config.name.toLowerCase()}";`,
      `import { ${this.config.name.toLowerCase()}Action } from "@/services/${this.config.name.toLowerCase()}/actions";`,
    ];

    // Imports shadcn/ui
    const uiImports = this.generateUIImports();

    // Imports pour fonctionnalités spéciales
    const featureImports = this.generateFeatureImports();

    return [...baseImports, ...uiImports, ...featureImports].join('\n');
  }

  /**
   * Génère les imports des composants shadcn/ui
   */
  private generateUIImports(): string[] {
    const components = new Set(['Form', 'FormControl', 'FormField', 'FormItem', 'FormLabel', 'FormMessage']);
    
    // Ajouter les composants selon les types de champs
    this.config.fields.forEach(field => {
      switch (field.type) {
        case 'text':
        case 'email':
        case 'password':
        case 'number':
          components.add('Input');
          break;
        case 'textarea':
          components.add('Textarea');
          break;
        case 'select':
          components.add('Select');
          components.add('SelectContent');
          components.add('SelectItem');
          components.add('SelectTrigger');
          components.add('SelectValue');
          break;
        case 'checkbox':
          components.add('Checkbox');
          break;
        case 'switch':
          components.add('Switch');
          break;
        case 'slider':
          components.add('Slider');
          break;
        case 'date':
        case 'datetime':
          components.add('Calendar');
          components.add('Popover');
          components.add('PopoverContent');
          components.add('PopoverTrigger');
          break;
        case 'combobox':
          components.add('Command');
          components.add('CommandEmpty');
          components.add('CommandGroup');
          components.add('CommandInput');
          components.add('CommandItem');
          break;
      }
    });

    components.add('Button');
    if (this.config.styling.variant === 'card') {
      components.add('Card');
      components.add('CardContent');
      components.add('CardDescription');
      components.add('CardHeader');
      components.add('CardTitle');
    }

    const formComponents = Array.from(components).filter(c => c.startsWith('Form'));
    const otherComponents = Array.from(components).filter(c => !c.startsWith('Form'));

    return [
      `import { ${formComponents.join(', ')} } from "@/components/ui/form";`,
      `import { ${otherComponents.join(', ')} } from "@/components/ui";`,
    ];
  }

  /**
   * Génère les imports pour les fonctionnalités spéciales
   */
  private generateFeatureImports(): string[] {
    const imports: string[] = [];

    if (this.config.features.includes('toast-notifications')) {
      imports.push('import { toast } from "sonner";');
    }

    if (this.config.features.includes('file-upload')) {
      imports.push('import { useState } from "react";');
    }

    if (this.config.features.includes('optimistic-ui')) {
      imports.push('import { useOptimistic } from "react";');
    }

    return imports;
  }

  /**
   * Génère le contenu du composant
   */
  private generateComponentContent(): string {
    const componentName = `${this.config.name}Form`;
    const props = this.generatePropsInterface();
    const hooks = this.generateHooks();
    const handlers = this.generateHandlers();
    const render = this.generateRender();

    return `${props}

export function ${componentName}({ 
  defaultValues,
  onSuccess,
  onError,
  className,
  ...props 
}: ${componentName}Props) {
${hooks}

${handlers}

${render}
}`;
  }

  /**
   * Génère l'interface des props
   */
  private generatePropsInterface(): string {
    return `interface ${this.config.name}FormProps {
  defaultValues?: Partial<${this.config.name}FormData>;
  onSuccess?: (data: ${this.config.name}FormData) => void;
  onError?: (error: string) => void;
  className?: string;
}`;
  }

  /**
   * Génère les hooks du composant
   */
  private generateHooks(): string {
    const hooks = [
      `  // État du formulaire avec Server Action
  const [state, formAction, isPending] = useActionState(${this.config.name.toLowerCase()}Action, {
    success: false,
  });`,
      '',
      `  // Configuration react-hook-form
  const form = useForm<${this.config.name}FormData>({
    resolver: zodResolver(${this.config.name.toLowerCase()}Schema),
    defaultValues: {
      ${this.generateDefaultValues()}
      ...defaultValues,
    },
    mode: "onChange",
  });`,
    ];

    // Hooks pour fonctionnalités spéciales
    if (this.config.features.includes('file-upload')) {
      hooks.push('', '  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});');
    }

    if (this.config.features.includes('optimistic-ui')) {
      hooks.push('', '  const [optimisticData, addOptimistic] = useOptimistic(state.data);');
    }

    return hooks.join('\n');
  }

  /**
   * Génère les valeurs par défaut
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

  /**
   * Génère les gestionnaires d'événements
   */
  private generateHandlers(): string {
    const handlers = [
      `  // Gestionnaire de soumission hybride
  const handleSubmit = async (data: ${this.config.name}FormData) => {
    try {
      // Validation côté client réussie, préparer FormData pour Server Action
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
  };`,
    ];

    // Gestionnaires pour fonctionnalités spéciales
    if (this.config.features.includes('toast-notifications')) {
      handlers.push('', `  // Gestion des notifications
  React.useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message);
      onSuccess?.(state.data);
    } else if (!state.success && state.error) {
      toast.error(state.error);
      onError?.(state.error);
    }
  }, [state, onSuccess, onError]);`);
    }

    return handlers.join('\n');
  }

  /**
   * Génère le rendu du composant
   */
  private generateRender(): string {
    const formContent = this.generateFormContent();
    const wrapper = this.generateWrapper(formContent);

    return `  return (
${wrapper}
  );`;
  }

  /**
   * Génère le contenu du formulaire
   */
  private generateFormContent(): string {
    const fields = this.config.fields.map(field => this.generateFormField(field)).join('\n\n');
    const submitButton = this.generateSubmitButton();

    return `        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
${fields}

${submitButton}
          </form>
        </Form>`;
  }

  /**
   * Génère un champ de formulaire
   */
  private generateFormField(field: FormField): string {
    const fieldComponent = this.generateFieldComponent(field);

    return `            <FormField
              control={form.control}
              name="${field.name}"
              render={({ field: fieldProps }) => (
                <FormItem>
                  <FormLabel>${field.label}${field.required ? ' *' : ''}</FormLabel>
                  <FormControl>
${fieldComponent}
                  </FormControl>
                  ${field.description ? `<FormDescription>${field.description}</FormDescription>` : ''}
                  <FormMessage />
                </FormItem>
              )}
            />`;
  }

  /**
   * Génère le composant pour un type de champ spécifique
   */
  private generateFieldComponent(field: FormField): string {
    const placeholder = field.placeholder ? ` placeholder="${field.placeholder}"` : '';
    const disabled = 'disabled={isPending}';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return `                    <Input
                      type="${field.type}"${placeholder}
                      {...fieldProps}
                      ${disabled}
                    />`;

      case 'password':
        return `                    <Input
                      type="password"${placeholder}
                      {...fieldProps}
                      ${disabled}
                    />`;

      case 'textarea':
        return `                    <Textarea${placeholder}
                      {...fieldProps}
                      ${disabled}
                    />`;

      case 'select':
        return this.generateSelectField(field);

      case 'checkbox':
        return `                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={fieldProps.value}
                        onCheckedChange={fieldProps.onChange}
                        ${disabled}
                      />
                    </div>`;

      case 'switch':
        return `                    <Switch
                      checked={fieldProps.value}
                      onCheckedChange={fieldProps.onChange}
                      ${disabled}
                    />`;

      case 'slider':
        return `                    <Slider
                      value={[fieldProps.value]}
                      onValueChange={(value) => fieldProps.onChange(value[0])}
                      max={${field.validation?.max || 100}}
                      min={${field.validation?.min || 0}}
                      step={1}
                      ${disabled}
                    />`;

      case 'file':
        return `                    <Input
                      type="file"
                      onChange={(e) => fieldProps.onChange(e.target.files?.[0])}
                      ${disabled}
                    />`;

      default:
        return `                    <Input${placeholder}
                      {...fieldProps}
                      ${disabled}
                    />`;
    }
  }

  /**
   * Génère un champ select
   */
  private generateSelectField(field: FormField): string {
    if (!field.options) return '';

    const options = field.options.map(option => 
      `                        <SelectItem value="${option.value}"${option.disabled ? ' disabled' : ''}>
                          ${option.label}
                        </SelectItem>`
    ).join('\n');

    return `                    <Select
                      value={fieldProps.value}
                      onValueChange={fieldProps.onChange}
                      disabled={isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="${field.placeholder || 'Sélectionner...'}" />
                      </SelectTrigger>
                      <SelectContent>
${options}
                      </SelectContent>
                    </Select>`;
  }

  /**
   * Génère le bouton de soumission
   */
  private generateSubmitButton(): string {
    const { submitButton } = this.config.styling;
    
    return `            <Button
              type="submit"
              variant="${submitButton.variant}"
              size="${submitButton.size}"
              disabled={isPending}
              className="${submitButton.fullWidth ? 'w-full' : ''}"
            >
              {isPending ? "${submitButton.loadingText}" : "${submitButton.text}"}
            </Button>`;
  }

  /**
   * Génère le wrapper selon le variant
   */
  private generateWrapper(content: string): string {
    switch (this.config.styling.variant) {
      case 'card':
        return `    <Card className={className}>
      <CardHeader>
        <CardTitle>${this.config.name}</CardTitle>
        <CardDescription>${this.config.description}</CardDescription>
      </CardHeader>
      <CardContent>
${content}
      </CardContent>
    </Card>`;

      case 'modal':
        return `    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">${this.config.name}</h2>
        <p className="text-sm text-muted-foreground">${this.config.description}</p>
      </div>
${content}
    </div>`;

      default:
        return `    <div className={cn("space-y-6", className)}>
${content}
    </div>`;
    }
  }
}

/**
 * Générateur de composants utilitaires
 */
export class UtilityComponentGenerator {
  constructor(private config: FormConfig) {}

  /**
   * Génère le composant de bouton de soumission avec useFormStatus
   */
  generateSubmitButton(): FileTemplate {
    return {
      path: `src/components/forms/${this.config.name.toLowerCase()}-submit-button.tsx`,
      content: `"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ${this.config.name}SubmitButtonProps {
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ${this.config.name}SubmitButton({
  children,
  variant = "default",
  size = "default",
  className,
}: ${this.config.name}SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={pending}
      className={className}
    >
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}`,
    };
  }

  /**
   * Génère un composant de champ personnalisé
   */
  generateCustomField(field: FormField): FileTemplate {
    return {
      path: `src/components/forms/fields/${field.name}-field.tsx`,
      content: `"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ${this.getFieldComponent(field.type)} } from "@/components/ui";

interface ${field.name}FieldProps {
  control: Control<any>;
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ${field.name}Field({
  control,
  name,
  label = "${field.label}",
  description = "${field.description || ''}",
  placeholder = "${field.placeholder || ''}",
  disabled = false,
}: ${field.name}FieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            ${this.generateFieldJSX(field)}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}`,
    };
  }

  private getFieldComponent(type: FieldType): string {
    switch (type) {
      case 'textarea': return 'Textarea';
      case 'select': return 'Select, SelectContent, SelectItem, SelectTrigger, SelectValue';
      case 'checkbox': return 'Checkbox';
      case 'switch': return 'Switch';
      case 'slider': return 'Slider';
      default: return 'Input';
    }
  }

  private generateFieldJSX(field: FormField): string {
    switch (field.type) {
      case 'textarea':
        return `<Textarea
              placeholder={placeholder}
              disabled={disabled}
              {...field}
            />`;
      case 'select':
        return `<Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {/* Options à définir */}
              </SelectContent>
            </Select>`;
      default:
        return `<Input
              type="${field.type}"
              placeholder={placeholder}
              disabled={disabled}
              {...field}
            />`;
    }
  }
}
