/**
 * Integration tests for template generation
 * Tests the complete workflow from configuration to file generation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { join } from 'path';
import { writeFile, readFile, mkdir, access } from 'fs/promises';
import { testUtils } from '../setup';
import { generateValidatedBaseProject } from '../../templates/base-project-structure/generator';

describe('Template Generation Integration', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await testUtils.createTempDir('integration-');
  });

  describe('Complete Project Generation', () => {
    it('should generate a complete Next.js project with Tailwind v4', async () => {
      const config = {
        projectName: 'integration-test-app',
        useTypeScript: true,
        useSrcDirectory: true,
        useAppRouter: true,
        packageManager: 'pnpm' as const,
      };

      const result = generateValidatedBaseProject(config);

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      // Create project directory
      const projectDir = join(tempDir, config.projectName);
      await mkdir(projectDir, { recursive: true });

      // Write all generated files
      for (const file of result.files) {
        const filePath = join(projectDir, file.path);
        const fileDir = join(filePath, '..');
        
        await mkdir(fileDir, { recursive: true });
        await writeFile(filePath, file.content, 'utf-8');
      }

      // Verify essential files exist
      const essentialFiles = [
        'package.json',
        'tsconfig.json',
        'next.config.ts',
        'postcss.config.ts',
        'app/globals.css',
        'app/layout.tsx',
        'app/page.tsx',
      ];

      for (const file of essentialFiles) {
        const filePath = join(projectDir, file);
        await expect(access(filePath)).resolves.not.toThrow();
      }

      // Verify package.json content
      const packageJsonPath = join(projectDir, 'package.json');
      const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);

      expect(packageJson.name).toBe(config.projectName);
      expect(packageJson.dependencies.next).toContain('^15.1.0');
      expect(packageJson.dependencies.react).toContain('^19.0.0');
      expect(packageJson.dependencies.tailwindcss).toBe('latest');

      // Verify Tailwind v4 configuration
      const postcssConfigPath = join(projectDir, 'postcss.config.ts');
      const postcssConfig = await readFile(postcssConfigPath, 'utf-8');
      expect(postcssConfig).toContain('@tailwindcss/postcss');

      // Verify globals.css uses v4 syntax
      const globalsCssPath = join(projectDir, 'app/globals.css');
      const globalsCss = await readFile(globalsCssPath, 'utf-8');
      expect(globalsCss).toContain('@import "tailwindcss"');
      expect(globalsCss).toContain('@theme {');
    });

    it('should generate valid TypeScript configuration', async () => {
      const result = generateValidatedBaseProject({
        projectName: 'ts-test-app',
        useSrcDirectory: true,
      });

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const tsConfigFile = result.files.find(f => f.path === 'tsconfig.json');
      expect(tsConfigFile).toBeDefined();

      // Parse and validate TypeScript configuration
      const tsConfig = JSON.parse(tsConfigFile!.content);
      
      expect(tsConfig.compilerOptions.target).toBe('ES2020');
      expect(tsConfig.compilerOptions.module).toBe('esnext');
      expect(tsConfig.compilerOptions.strict).toBe(true);
      expect(tsConfig.compilerOptions.baseUrl).toBe('.');
      
      // Check path aliases
      expect(tsConfig.compilerOptions.paths['@/*']).toEqual(['./src/*']);
      expect(tsConfig.compilerOptions.paths['@/app/*']).toEqual(['./app/*']);
      expect(tsConfig.compilerOptions.paths['@/shared/*']).toEqual(['./shared/*']);
    });

    it('should generate valid Next.js configuration', async () => {
      const result = generateValidatedBaseProject({
        projectName: 'nextjs-test-app',
      });

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const nextConfigFile = result.files.find(f => f.path === 'next.config.ts');
      expect(nextConfigFile).toBeDefined();

      const content = nextConfigFile!.content;
      expect(content).toContain('import type { NextConfig } from \'next\'');
      expect(content).toContain('output: \'standalone\'');
      expect(content).toContain('compress: true');
      expect(content).toContain('poweredByHeader: false');
    });

    it('should generate valid Prisma schema', async () => {
      const result = generateValidatedBaseProject({
        projectName: 'prisma-test-app',
      });

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const prismaSchemaFile = result.files.find(f => f.path === 'prisma/schema.prisma');
      expect(prismaSchemaFile).toBeDefined();

      const content = prismaSchemaFile!.content;
      expect(content).toContain('generator client');
      expect(content).toContain('datasource db');
      expect(content).toContain('model User');
      expect(content).toContain('model Session');
    });
  });

  describe('File Content Validation', () => {
    it('should generate syntactically correct React components', async () => {
      const result = generateValidatedBaseProject({
        projectName: 'react-test-app',
      });

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      // Check layout.tsx
      const layoutFile = result.files.find(f => f.path === 'app/layout.tsx');
      expect(layoutFile).toBeDefined();
      
      const layoutContent = layoutFile!.content;
      expect(layoutContent).toContain('export default function RootLayout');
      expect(layoutContent).toContain('children: React.ReactNode');
      expect(layoutContent).toContain('export const metadata');

      // Check page.tsx
      const pageFile = result.files.find(f => f.path === 'app/page.tsx');
      expect(pageFile).toBeDefined();
      
      const pageContent = pageFile!.content;
      expect(pageContent).toContain('export default function HomePage');
      expect(pageContent).toContain('react-test-app');
    });

    it('should generate valid utility functions', async () => {
      const result = generateValidatedBaseProject({
        projectName: 'utils-test-app',
      });

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const utilsFile = result.files.find(f => f.path === 'src/lib/utils.ts');
      expect(utilsFile).toBeDefined();

      const content = utilsFile!.content;
      expect(content).toContain('export function cn(');
      expect(content).toContain('export function formatDate(');
      expect(content).toContain('export function slugify(');
      expect(content).toContain('twMerge(clsx(inputs))');
    });

    it('should generate valid environment configuration', async () => {
      const result = generateValidatedBaseProject({
        projectName: 'env-test-app',
      });

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const envFile = result.files.find(f => f.path === '.env.example');
      expect(envFile).toBeDefined();

      const content = envFile!.content;
      expect(content).toContain('NEXT_PUBLIC_APP_URL=');
      expect(content).toContain('DATABASE_URL=');
      expect(content).toContain('BETTER_AUTH_SECRET=');
    });
  });

  describe('Package Manager Compatibility', () => {
    const packageManagers = ['npm', 'yarn', 'pnpm', 'bun'] as const;

    packageManagers.forEach(pm => {
      it(`should generate compatible project for ${pm}`, async () => {
        const result = generateValidatedBaseProject({
          projectName: `${pm}-test-app`,
          packageManager: pm,
        });

        if ('errors' in result) {
          throw new Error(`Generation failed: ${result.errors.join(', ')}`);
        }

        // Check that instructions use the correct package manager
        const instructions = result.instructions.join(' ');
        expect(instructions).toContain(`${pm} install`);
        expect(instructions).toContain(`${pm} run dev`);
        expect(instructions).toContain(`${pm} run db:push`);
      });
    });
  });

  describe('Configuration Variations', () => {
    it('should handle project without src directory', async () => {
      const result = generateValidatedBaseProject({
        projectName: 'no-src-app',
        useSrcDirectory: false,
      });

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      // Check that utils file is in the right location
      const utilsFile = result.files.find(f => f.path === 'lib/utils.ts');
      expect(utilsFile).toBeDefined();

      // Check TypeScript configuration
      const tsConfigFile = result.files.find(f => f.path === 'tsconfig.json');
      const tsConfig = JSON.parse(tsConfigFile!.content);
      expect(tsConfig.compilerOptions.paths['@/*']).toEqual(['./*']);
    });

    it('should generate comprehensive README', async () => {
      const projectName = 'readme-test-app';
      const result = generateValidatedBaseProject({
        projectName,
        packageManager: 'pnpm',
      });

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const readmeFile = result.files.find(f => f.path === 'README.md');
      expect(readmeFile).toBeDefined();

      const content = readmeFile!.content;
      expect(content).toContain(`# ${projectName}`);
      expect(content).toContain('Next.js 15');
      expect(content).toContain('Tailwind CSS');
      expect(content).toContain('shadcn/ui');
      expect(content).toContain('Prisma');
      expect(content).toContain('Better Auth');
      expect(content).toContain('pnpm install');
    });
  });
});
