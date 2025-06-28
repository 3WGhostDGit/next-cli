/**
 * Tests pour le template de formulaires
 * Valide la génération correcte de tous les composants et patterns de formulaires
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { testUtils } from '../setup';

// Import the actual template functions
import { FormGenerator, createFormConfig, FORM_PRESETS } from '../../templates/forms/index';
import { ValidationGenerator } from '../../templates/forms/validation-generator';
import { ComponentGenerator } from '../../templates/forms/component-generator';
import { ActionsGenerator } from '../../templates/forms/actions-generator';
import { TypesGenerator } from '../../templates/forms/types-generator';
import { HooksGenerator } from '../../templates/forms/hooks-generator';
import type { FormField, FormConfig } from '../../templates/forms/index';

describe('Forms Template', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await testUtils.createTempDir('forms-');
  });

  describe('Basic Form Generation', () => {
    it('should generate a simple form', () => {
      const fields: FormField[] = [
        {
          name: 'name',
          type: 'text',
          label: 'Nom',
          required: true,
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email',
          required: true,
        },
      ];

      const config = createFormConfig('Test', fields);
      const generator = new FormGenerator(config);
      const files = generator.generate();

      expect(files.length).toBeGreaterThan(0);

      const expectedPaths = [
        'shared/validation/',
        'shared/types/',
        'src/services/',
        'src/components/forms/',
      ];

      expectedPaths.forEach(expectedPath => {
        const found = files.some(f => f.path.includes(expectedPath));
        expect(found, `Path missing: ${expectedPath}`).toBe(true);
      });

      files.forEach(file => {
        expect(file.content.trim(), `Empty content for: ${file.path}`).not.toBe('');
      });
    });
  });

  describe('Zod Schema Generation', () => {
    it('should generate correct Zod schemas with validation', () => {
      const fields: FormField[] = [
        {
          name: 'username',
          type: 'text',
          label: 'Nom d\'utilisateur',
          required: true,
          validation: {
            minLength: 3,
            maxLength: 20,
            pattern: '^[a-zA-Z0-9_]+$',
          },
        },
        {
          name: 'age',
          type: 'number',
          label: 'Âge',
          required: true,
          validation: {
            min: 18,
            max: 99,
          },
        },
      ];

      const config = createFormConfig('ValidationTest', fields);
      const generator = new ValidationGenerator(config);
      const file = generator.generate();

      const content = file.content;
      
      expect(content).toContain('import { z } from "zod"');
      expect(content).toContain('Schema = z.object({');
      expect(content).toContain('export type');
    });
  });

  describe('Component Generation', () => {
    it('should generate React components with proper imports', () => {
      const fields: FormField[] = [
        {
          name: 'title',
          type: 'text',
          label: 'Titre',
          required: true,
        },
        {
          name: 'category',
          type: 'select',
          label: 'Catégorie',
          required: true,
          options: [
            { value: 'tech', label: 'Technologie' },
            { value: 'design', label: 'Design' },
          ],
        },
        {
          name: 'published',
          type: 'switch',
          label: 'Publié',
        },
      ];

      const config = createFormConfig('ComponentTest', fields);
      const generator = new ComponentGenerator(config);
      const file = generator.generate();

      const content = file.content;

      expect(content).toContain('"use client"');
      expect(content).toContain('import');
      expect(content).toContain('export function');
      expect(content).toContain('Form');
    });
  });

  describe('Server Actions Generation', () => {
    it('should generate Server Actions with validation', () => {
      const config = createFormConfig('ActionTest', [
        { name: 'data', type: 'text', label: 'Data', required: true },
      ], {
        actions: [
          { name: 'create', type: 'create', redirect: '/test' },
          { name: 'update', type: 'update' },
        ],
      });

      const generator = new ActionsGenerator(config);
      const files = generator.generate();

      expect(files.length).toBeGreaterThan(0);

      const mainAction = files.find(f => f.path.includes('actions.ts'));
      expect(mainAction).toBeDefined();

      const content = mainAction!.content;
      expect(content).toContain('"use server"');
      expect(content).toContain('export async function');
      expect(content).toContain('safeParse');
    });
  });

  describe('TypeScript Types Generation', () => {
    it('should generate proper TypeScript interfaces and enums', () => {
      const fields: FormField[] = [
        {
          name: 'status',
          type: 'select',
          label: 'Statut',
          required: true,
          options: [
            { value: 'draft', label: 'Brouillon' },
            { value: 'published', label: 'Publié' },
          ],
        },
        {
          name: 'tags',
          type: 'multiselect',
          label: 'Tags',
          options: [
            { value: 'urgent', label: 'Urgent' },
            { value: 'important', label: 'Important' },
          ],
        },
      ];

      const config = createFormConfig('TypeTest', fields);
      const generator = new TypesGenerator(config);
      const file = generator.generate();

      const content = file.content;

      expect(content).toContain('export interface');
      expect(content).toContain('export type');
      expect(content.length).toBeGreaterThan(0);
    });
  });

  describe('Custom Hooks Generation', () => {
    it('should generate custom hooks with features', () => {
      const config = createFormConfig('HookTest', [
        { name: 'field', type: 'text', label: 'Field', required: true },
      ], {
        features: ['auto-save', 'optimistic-ui', 'toast-notifications'],
      });

      const generator = new HooksGenerator(config);
      const files = generator.generate();

      expect(files.length).toBeGreaterThan(0);

      const mainHook = files.find(f => f.path.includes('use-'));
      expect(mainHook).toBeDefined();
      expect(mainHook!.content).toContain('export function use');
    });
  });

  describe('Form Presets', () => {
    it('should validate all predefined presets', () => {
      Object.entries(FORM_PRESETS).forEach(([name, config]) => {
        const generator = new FormGenerator(config);
        const files = generator.generate();

        expect(files.length, `Preset ${name}: No files generated`).toBeGreaterThan(0);

        files.forEach(file => {
          expect(file.content.trim(), `Preset ${name}: Empty content for ${file.path}`).not.toBe('');
        });
      });
    });

    it('should generate contact form preset correctly', () => {
      const config = FORM_PRESETS.contact;
      const generator = new FormGenerator(config);
      const files = generator.generate();

      expect(files.length).toBeGreaterThan(0);
      
      const validationFile = files.find(f => f.path.includes('validation'));
      expect(validationFile?.content).toContain('name');
      expect(validationFile?.content).toContain('email');
      expect(validationFile?.content).toContain('message');
    });
  });

  describe('Performance Tests', () => {
    it('should handle complex forms efficiently', () => {
      const startTime = Date.now();

      const complexFields: FormField[] = Array.from({ length: 20 }, (_, i) => ({
        name: `field${i}`,
        type: i % 2 === 0 ? 'text' : 'select',
        label: `Field ${i}`,
        required: i % 3 === 0,
        options: i % 2 === 1 ? [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
        ] : undefined,
        validation: {
          minLength: 2,
          maxLength: 100,
        },
      }));

      const config = createFormConfig('PerformanceTest', complexFields, {
        features: ['auto-save', 'optimistic-ui', 'toast-notifications', 'file-upload'],
      });

      const generator = new FormGenerator(config);
      const files = generator.generate();

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(files.length).toBeGreaterThan(0);
      expect(duration, 'Generation too slow (>5s)').toBeLessThan(5000);
    });
  });

  describe('Field Type Support', () => {
    const fieldTypes: FormField['type'][] = [
      'text', 'email', 'number', 'select', 'multiselect', 
      'checkbox', 'radio', 'date', 'datetime', 'file', 'switch', 'textarea'
    ];

    fieldTypes.forEach(type => {
      it(`should support ${type} field type`, () => {
        const field: FormField = {
          name: 'testField',
          type,
          label: `Test ${type}`,
          required: true,
          ...(type === 'select' || type === 'multiselect' || type === 'radio' ? {
            options: [
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
            ]
          } : {}),
        };

        const config = createFormConfig('FieldTest', [field]);
        const generator = new FormGenerator(config);
        const files = generator.generate();

        expect(files.length).toBeGreaterThan(0);
        
        const componentFile = files.find(f => f.path.includes('form.tsx'));
        expect(componentFile).toBeDefined();
      });
    });
  });

  describe('Configuration Creation', () => {
    it('should create valid form configurations', () => {
      const fields: FormField[] = [
        { name: 'test', type: 'text', label: 'Test', required: true },
      ];

      const config = createFormConfig('TestForm', fields);

      expect(config.projectName).toBe('TestForm');
      expect(config.fields).toEqual(fields);
      expect(config.formLibrary).toBe('react-hook-form');
      expect(config.validation).toBe('zod');
      expect(config.uiLibrary).toBe('shadcn-ui');
    });

    it('should handle custom options', () => {
      const fields: FormField[] = [
        { name: 'test', type: 'text', label: 'Test', required: true },
      ];

      const config = createFormConfig('TestForm', fields, {
        features: ['auto-save', 'file-upload'],
        actions: [
          { name: 'create', type: 'create', redirect: '/success' },
        ],
      });

      expect(config.features).toContain('auto-save');
      expect(config.features).toContain('file-upload');
      expect(config.actions[0].redirect).toBe('/success');
    });
  });
});
