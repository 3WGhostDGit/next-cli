/**
 * Tests for the base project structure template
 * Validates Tailwind CSS v4 integration and latest dependencies
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { testUtils } from '../setup';

// Import the template functions
import { 
  generateValidatedBaseProject, 
  validateProjectConfig,
  defaultBaseProjectConfig 
} from '../../templates/base-project-structure/generator';
import type { BaseProjectConfig } from '../../templates/base-project-structure/index';

describe('Base Project Structure Template', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await testUtils.createTempDir('base-project-');
  });

  describe('Configuration Validation', () => {
    it('should validate correct configuration', () => {
      const config: Partial<BaseProjectConfig> = {
        projectName: 'my-nextjs-app',
        packageManager: 'pnpm',
        useTypeScript: true,
        useSrcDirectory: true,
        useAppRouter: true
      };

      const errors = validateProjectConfig(config);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid project names', () => {
      const config: Partial<BaseProjectConfig> = {
        projectName: 'My Invalid Project Name!',
      };

      const errors = validateProjectConfig(config);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('lettres minuscules');
    });

    it('should reject invalid package managers', () => {
      const config: Partial<BaseProjectConfig> = {
        packageManager: 'invalid' as any,
      };

      const errors = validateProjectConfig(config);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('npm, yarn, pnpm ou bun');
    });
  });

  describe('Project Generation', () => {
    it('should generate a complete project structure', () => {
      const config: Partial<BaseProjectConfig> = {
        projectName: 'test-app',
        useTypeScript: true,
        useSrcDirectory: true,
        useAppRouter: true,
        packageManager: 'pnpm',
      };

      const result = generateValidatedBaseProject(config);

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      expect(result.files.length).toBeGreaterThan(15);
      expect(result.instructions.length).toBeGreaterThan(10);
      expect(result.config.projectName).toBe('test-app');
    });

    it('should include all essential files', () => {
      const result = generateValidatedBaseProject();

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const essentialFiles = [
        'package.json',
        'tsconfig.json',
        'next.config.ts',
        'postcss.config.ts', // Tailwind v4
        'components.json',
        'app/layout.tsx',
        'app/page.tsx',
        'app/globals.css',
        'src/lib/utils.ts',
        'src/lib/constants.ts',
        'shared/types/index.ts',
        'prisma/schema.prisma',
        '.env.example',
        '.gitignore',
        'README.md',
      ];

      for (const file of essentialFiles) {
        const found = result.files.find(f => f.path === file);
        expect(found, `Essential file missing: ${file}`).toBeDefined();
      }
    });
  });

  describe('Tailwind CSS v4 Integration', () => {
    it('should generate PostCSS config instead of Tailwind config', () => {
      const result = generateValidatedBaseProject();

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      // Should have PostCSS config
      const postcssConfig = result.files.find(f => f.path === 'postcss.config.ts');
      expect(postcssConfig).toBeDefined();
      expect(postcssConfig?.content).toContain('@tailwindcss/postcss');

      // Should NOT have old Tailwind config
      const tailwindConfig = result.files.find(f => f.path === 'tailwind.config.ts');
      expect(tailwindConfig).toBeUndefined();
    });

    it('should use new CSS import syntax in globals.css', () => {
      const result = generateValidatedBaseProject();

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const globalsCss = result.files.find(f => f.path === 'app/globals.css');
      expect(globalsCss).toBeDefined();
      
      // Should use new v4 syntax
      expect(globalsCss?.content).toContain('@import "tailwindcss"');
      expect(globalsCss?.content).toContain('@theme {');
      expect(globalsCss?.content).toContain('@utility container {');
      
      // Should NOT use old v3 syntax
      expect(globalsCss?.content).not.toContain('@tailwind base');
      expect(globalsCss?.content).not.toContain('@tailwind components');
      expect(globalsCss?.content).not.toContain('@tailwind utilities');
    });

    it('should configure components.json for Tailwind v4', () => {
      const result = generateValidatedBaseProject();

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const componentsJson = result.files.find(f => f.path === 'components.json');
      expect(componentsJson).toBeDefined();

      const config = JSON.parse(componentsJson!.content);
      expect(config.tailwind.config).toBe('postcss.config.ts');
      expect(config.tailwind.css).toBe('app/globals.css');
      expect(config.tailwind.cssVariables).toBe(true);
    });
  });

  describe('Latest Dependencies', () => {
    it('should use latest versions of core dependencies', () => {
      const result = generateValidatedBaseProject();

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const packageJson = result.files.find(f => f.path === 'package.json');
      expect(packageJson).toBeDefined();

      const pkg = JSON.parse(packageJson!.content);
      
      // Check core dependencies versions
      expect(pkg.dependencies.next).toContain('^15.1.0');
      expect(pkg.dependencies.react).toContain('^19.0.0');
      expect(pkg.dependencies['react-dom']).toContain('^19.0.0');
      
      // Check Tailwind v4
      expect(pkg.dependencies.tailwindcss).toBe('latest');
      expect(pkg.dependencies['@tailwindcss/postcss']).toBe('latest');
      
      // Should NOT have old dependencies
      expect(pkg.dependencies.autoprefixer).toBeUndefined();
      expect(pkg.dependencies.postcss).toBeUndefined();
    });

    it('should use updated dev dependencies', () => {
      const result = generateValidatedBaseProject();

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const packageJson = result.files.find(f => f.path === 'package.json');
      const pkg = JSON.parse(packageJson!.content);
      
      expect(pkg.devDependencies.typescript).toContain('^5.7.0');
      expect(pkg.devDependencies['@types/node']).toContain('^22.0.0');
      expect(pkg.devDependencies['@types/react']).toContain('^19.0.0');
      expect(pkg.devDependencies.eslint).toContain('^9.0.0');
    });
  });

  describe('Package Manager Support', () => {
    const packageManagers = ['npm', 'yarn', 'pnpm', 'bun'] as const;

    packageManagers.forEach(pm => {
      it(`should generate correct instructions for ${pm}`, () => {
        const result = generateValidatedBaseProject({ packageManager: pm });

        if ('errors' in result) {
          throw new Error(`Generation failed: ${result.errors.join(', ')}`);
        }

        const hasCorrectInstructions = result.instructions.some(
          instruction => instruction.includes(`${pm} install`)
        );
        expect(hasCorrectInstructions).toBe(true);
      });
    });
  });

  describe('Directory Structure', () => {
    it('should generate correct structure with src directory', () => {
      const result = generateValidatedBaseProject({ useSrcDirectory: true });

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      expect(result.structure['app/']).toBeDefined();
      expect(result.structure['src/']).toBeDefined();
      expect(result.structure['shared/']).toBeDefined();
      expect(result.structure['prisma/']).toBeDefined();
    });

    it('should generate correct structure without src directory', () => {
      const result = generateValidatedBaseProject({ useSrcDirectory: false });

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      // Should still have main directories
      expect(result.structure['app/']).toBeDefined();
      expect(result.structure['shared/']).toBeDefined();
      expect(result.structure['prisma/']).toBeDefined();

      // Check that paths are adjusted in tsconfig
      const tsConfig = result.files.find(f => f.path === 'tsconfig.json');
      const ts = JSON.parse(tsConfig!.content);
      expect(ts.compilerOptions.paths['@/*'][0]).toBe('./*');
    });
  });

  describe('Content Validation', () => {
    it('should include project name in generated files', () => {
      const projectName = 'my-awesome-app';
      const result = generateValidatedBaseProject({ projectName });

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      // Check package.json
      const packageJson = result.files.find(f => f.path === 'package.json');
      const pkg = JSON.parse(packageJson!.content);
      expect(pkg.name).toBe(projectName);

      // Check layout.tsx
      const layout = result.files.find(f => f.path === 'app/layout.tsx');
      expect(layout?.content).toContain(projectName);

      // Check README.md
      const readme = result.files.find(f => f.path === 'README.md');
      expect(readme?.content).toContain(projectName);
    });

    it('should include Tailwind v4 information in instructions', () => {
      const result = generateValidatedBaseProject();

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const instructions = result.instructions.join(' ');
      expect(instructions).toContain('Tailwind CSS v4');
      expect(instructions).toContain('postcss.config.ts');
      expect(instructions).toContain('@theme');
    });
  });

  describe('Error Handling', () => {
    it('should return errors for invalid configuration', () => {
      const result = generateValidatedBaseProject({
        projectName: 'Invalid Name!',
        packageManager: 'invalid' as any
      });

      expect('errors' in result).toBe(true);
      if ('errors' in result) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });
});
