/**
 * Générateur principal pour les templates de formulaires
 */

import { FormConfig, defaultFormConfig } from './index';
import { FileTemplate, GenerationResult } from '../types';
import { generateFormSchema, generateSpecialSchemas } from './form-schemas';
import { generateFormAction, generateMultiStepActions, generateAdvancedActions } from './form-actions';
import { generateFormComponent } from './form-components';
import { generateFormHooks, generateValidationUtils } from './form-utilities';

/**
 * Génère tous les fichiers pour un formulaire
 */
export function generateFormTemplate(config: FormConfig): GenerationResult {
  try {
    // Fusionner avec la configuration par défaut
    const fullConfig = { ...defaultFormConfig, ...config };
    
    // Validation de la configuration
    const validation = validateFormConfig(fullConfig);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const files: FileTemplate[] = [];

    // 1. Génération du schéma Zod
    files.push(generateFormSchema(fullConfig));
    
    // 2. Génération des schémas spéciaux
    files.push(...generateSpecialSchemas(fullConfig));

    // 3. Génération des Server Actions
    files.push(generateFormAction(fullConfig));
    
    // 4. Actions multi-étapes si nécessaire
    if (fullConfig.formType === 'multi-step') {
      files.push(...generateMultiStepActions(fullConfig));
    }
    
    // 5. Actions avancées selon les fonctionnalités
    files.push(...generateAdvancedActions(fullConfig));

    // 6. Génération du composant principal
    files.push(generateFormComponent(fullConfig));

    // 7. Génération des hooks personnalisés
    files.push(generateFormHooks(fullConfig));

    // 8. Génération des utilitaires de validation
    files.push(generateValidationUtils(fullConfig));

    // 9. Génération des tests si demandé
    if (fullConfig.generateTests) {
      files.push(...generateFormTests(fullConfig));
    }

    // 10. Génération des stories Storybook si demandé
    if (fullConfig.generateStorybook) {
      files.push(generateFormStories(fullConfig));
    }

    // 11. Génération des types TypeScript
    files.push(generateFormTypes(fullConfig));

    // 12. Génération de la documentation
    files.push(generateFormDocumentation(fullConfig));

    return {
      success: true,
      files,
      summary: generateSummary(fullConfig, files),
    };

  } catch (error) {
    return {
      success: false,
      errors: [`Erreur lors de la génération: ${error instanceof Error ? error.message : 'Erreur inconnue'}`],
    };
  }
}

/**
 * Valide la configuration du formulaire
 */
function validateFormConfig(config: FormConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validation du nom
  if (!config.formName || config.formName.trim() === '') {
    errors.push('Le nom du formulaire est requis');
  }

  // Validation des champs pour formulaire simple
  if (config.formType === 'basic' && (!config.fields || config.fields.length === 0)) {
    errors.push('Au moins un champ est requis pour un formulaire simple');
  }

  // Validation des étapes pour formulaire multi-étapes
  if (config.formType === 'multi-step') {
    if (!config.steps || config.steps.length === 0) {
      errors.push('Au moins une étape est requise pour un formulaire multi-étapes');
    } else {
      config.steps.forEach((step, index) => {
        if (!step.name || step.name.trim() === '') {
          errors.push(`Le nom de l'étape ${index + 1} est requis`);
        }
        if (!step.fields || step.fields.length === 0) {
          errors.push(`L'étape "${step.name}" doit contenir au moins un champ`);
        }
      });
    }
  }

  // Validation des champs
  const allFields = config.formType === 'multi-step' 
    ? config.steps?.flatMap(step => step.fields) || []
    : config.fields || [];

  allFields.forEach((field, index) => {
    if (!field.name || field.name.trim() === '') {
      errors.push(`Le nom du champ ${index + 1} est requis`);
    }
    if (!field.label || field.label.trim() === '') {
      errors.push(`Le label du champ "${field.name}" est requis`);
    }
    if (field.type === 'select' && (!field.options || field.options.length === 0)) {
      errors.push(`Le champ select "${field.name}" doit avoir des options`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Génère les tests pour le formulaire
 */
function generateFormTests(config: FormConfig): FileTemplate[] {
  const { formName } = config;
  const componentName = `${formName.charAt(0).toUpperCase() + formName.slice(1)}Form`;

  return [
    {
      path: `src/components/forms/__tests__/${formName}-form.test.tsx`,
      content: `import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ${componentName} } from '../${formName}-form';

// Mock des dépendances
jest.mock('@/services/${formName}/${config.actions.submitAction}', () => ({
  ${config.actions.submitAction}: jest.fn(),
}));

describe('${componentName}', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form fields', () => {
    render(<${componentName} />);
    
    // Vérifier que les champs sont présents
    ${config.fields?.map(field => 
      `expect(screen.getByLabelText('${field.label}')).toBeInTheDocument();`
    ).join('\n    ') || ''}
  });

  it('should show validation errors for required fields', async () => {
    render(<${componentName} />);
    
    const submitButton = screen.getByRole('button', { name: /soumettre/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Vérifier les messages d'erreur
      ${config.fields?.filter(f => f.required).map(field => 
        `expect(screen.getByText(/requis/i)).toBeInTheDocument();`
      ).join('\n      ') || ''}
    });
  });

  it('should submit form with valid data', async () => {
    const mockSubmit = require('@/services/${formName}/${config.actions.submitAction}').${config.actions.submitAction};
    mockSubmit.mockResolvedValue({ success: true });

    render(<${componentName} />);
    
    // Remplir les champs
    ${config.fields?.map(field => {
      if (field.type === 'string' || field.type === 'email') {
        return `fireEvent.change(screen.getByLabelText('${field.label}'), { target: { value: 'test value' } });`;
      }
      return '';
    }).filter(Boolean).join('\n    ') || ''}

    const submitButton = screen.getByRole('button', { name: /soumettre/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });
});`
    }
  ];
}

/**
 * Génère les stories Storybook
 */
function generateFormStories(config: FormConfig): FileTemplate {
  const { formName } = config;
  const componentName = `${formName.charAt(0).toUpperCase() + formName.slice(1)}Form`;

  return {
    path: `src/components/forms/${formName}-form.stories.tsx`,
    content: `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${formName}-form';

const meta: Meta<typeof ${componentName}> = {
  title: 'Forms/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithInitialData: Story = {
  args: {
    initialData: {
      ${config.fields?.map(field => {
        switch (field.type) {
          case 'string':
          case 'email':
            return `${field.name}: 'Valeur exemple'`;
          case 'boolean':
            return `${field.name}: true`;
          case 'number':
            return `${field.name}: 42`;
          default:
            return `${field.name}: ''`;
        }
      }).join(',\n      ') || ''}
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    mockData: [
      {
        url: '/api/submit',
        method: 'POST',
        status: 200,
        delay: 2000,
        response: { success: true },
      },
    ],
  },
};`
  };
}

/**
 * Génère les types TypeScript
 */
function generateFormTypes(config: FormConfig): FileTemplate {
  const { formName } = config;

  return {
    path: `src/types/${formName}.ts`,
    content: `/**
 * Types TypeScript pour ${formName}
 */

export interface ${formName.charAt(0).toUpperCase() + formName.slice(1)}FormProps {
  initialData?: Partial<${formName.charAt(0).toUpperCase() + formName.slice(1)}Data>;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

export interface ${formName.charAt(0).toUpperCase() + formName.slice(1)}FormState {
  isSubmitting: boolean;
  errors: Record<string, string[]>;
  isDirty: boolean;
  isValid: boolean;
}

export interface ${formName.charAt(0).toUpperCase() + formName.slice(1)}ActionResult {
  success: boolean;
  data?: any;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  timestamp: string;
}

// Re-export des types de validation
export type { ${formName.charAt(0).toUpperCase() + formName.slice(1)}Data } from '@/shared/validation/${formName}';`
  };
}

/**
 * Génère la documentation
 */
function generateFormDocumentation(config: FormConfig): FileTemplate {
  const { formName, formType, features } = config;

  return {
    path: `docs/forms/${formName}.md`,
    content: `# ${formName.charAt(0).toUpperCase() + formName.slice(1)} Form

## Description

Formulaire ${formType === 'multi-step' ? 'multi-étapes' : 'simple'} généré automatiquement avec shadcn/ui, validation Zod et Server Actions.

## Fonctionnalités

- ✅ Validation Zod côté client et serveur
- ✅ Intégration shadcn/ui
- ✅ Server Actions Next.js
- ✅ Gestion d'erreurs complète
${features.includes('auto-save') ? '- ✅ Sauvegarde automatique' : ''}
${features.includes('file-upload') ? '- ✅ Upload de fichiers' : ''}
${features.includes('multi-step') ? '- ✅ Navigation multi-étapes' : ''}

## Utilisation

\`\`\`tsx
import { ${formName.charAt(0).toUpperCase() + formName.slice(1)}Form } from '@/components/forms/${formName}-form';

export default function Page() {
  return (
    <${formName.charAt(0).toUpperCase() + formName.slice(1)}Form
      onSuccess={(data) => console.log('Succès:', data)}
      onError={(error) => console.error('Erreur:', error)}
    />
  );
}
\`\`\`

## Configuration

Le formulaire est configuré avec les options suivantes :

- **Type**: ${formType}
- **Fonctionnalités**: ${features.join(', ') || 'Aucune'}
- **Validation**: Zod avec messages personnalisés
- **Actions**: Server Actions avec useActionState

## Fichiers générés

- \`shared/validation/${formName}.ts\` - Schémas Zod
- \`src/services/${formName}/\` - Server Actions
- \`src/components/forms/${formName}-form.tsx\` - Composant principal
- \`src/hooks/use-${formName}-form.ts\` - Hooks personnalisés
- \`src/lib/${formName}-validation.ts\` - Utilitaires de validation

## Tests

Les tests sont disponibles dans \`src/components/forms/__tests__/${formName}-form.test.tsx\`.

Pour exécuter les tests :

\`\`\`bash
npm test ${formName}-form
\`\`\`
`
  };
}

/**
 * Génère un résumé de la génération
 */
function generateSummary(config: FormConfig, files: FileTemplate[]): string {
  const { formName, formType, features } = config;
  
  return `Formulaire "${formName}" généré avec succès !

Type: ${formType}
Fichiers générés: ${files.length}
Fonctionnalités: ${features.join(', ') || 'Aucune'}

Prochaines étapes:
1. Vérifier les schémas Zod générés
2. Adapter la logique métier dans les Server Actions
3. Personnaliser le style du composant si nécessaire
4. Exécuter les tests générés`;
}
