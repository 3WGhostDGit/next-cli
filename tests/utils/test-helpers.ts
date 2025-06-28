/**
 * Test helper utilities for template testing
 */

import { join } from 'path';
import { writeFile, mkdir, readFile, access } from 'fs/promises';
import { constants } from 'fs';
import type { FileTemplate } from '../../templates/types';

export interface TestProject {
  name: string;
  path: string;
  files: FileTemplate[];
}

/**
 * Create a test project in the filesystem
 */
export async function createTestProject(
  baseDir: string,
  projectName: string,
  files: FileTemplate[]
): Promise<TestProject> {
  const projectPath = join(baseDir, projectName);
  
  // Create project directory
  await mkdir(projectPath, { recursive: true });
  
  // Write all files
  for (const file of files) {
    const filePath = join(projectPath, file.path);
    const fileDir = join(filePath, '..');
    
    // Create directory if it doesn't exist
    await mkdir(fileDir, { recursive: true });
    
    // Write file content
    await writeFile(filePath, file.content, 'utf-8');
  }
  
  return {
    name: projectName,
    path: projectPath,
    files
  };
}

/**
 * Verify that a file exists and has expected content
 */
export async function verifyFileContent(
  filePath: string,
  expectedContent: string | RegExp | ((content: string) => boolean)
): Promise<void> {
  // Check if file exists
  await access(filePath, constants.F_OK);
  
  // Read file content
  const content = await readFile(filePath, 'utf-8');
  
  if (typeof expectedContent === 'string') {
    if (!content.includes(expectedContent)) {
      throw new Error(`File ${filePath} does not contain expected content: ${expectedContent}`);
    }
  } else if (expectedContent instanceof RegExp) {
    if (!expectedContent.test(content)) {
      throw new Error(`File ${filePath} does not match expected pattern: ${expectedContent}`);
    }
  } else if (typeof expectedContent === 'function') {
    if (!expectedContent(content)) {
      throw new Error(`File ${filePath} does not pass content validation function`);
    }
  }
}

/**
 * Verify that multiple files exist
 */
export async function verifyFilesExist(
  baseDir: string,
  filePaths: string[]
): Promise<void> {
  for (const filePath of filePaths) {
    const fullPath = join(baseDir, filePath);
    await access(fullPath, constants.F_OK);
  }
}

/**
 * Parse and validate JSON file
 */
export async function parseJsonFile<T = any>(filePath: string): Promise<T> {
  const content = await readFile(filePath, 'utf-8');
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON file ${filePath}: ${error}`);
  }
}

/**
 * Validate package.json structure
 */
export async function validatePackageJson(
  filePath: string,
  expectedFields: Partial<{
    name: string;
    version: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    scripts: Record<string, string>;
  }>
): Promise<void> {
  const packageJson = await parseJsonFile(filePath);
  
  if (expectedFields.name && packageJson.name !== expectedFields.name) {
    throw new Error(`Expected package name ${expectedFields.name}, got ${packageJson.name}`);
  }
  
  if (expectedFields.dependencies) {
    for (const [dep, version] of Object.entries(expectedFields.dependencies)) {
      if (!packageJson.dependencies?.[dep]) {
        throw new Error(`Missing dependency: ${dep}`);
      }
      if (version !== 'latest' && !packageJson.dependencies[dep].includes(version)) {
        throw new Error(`Dependency ${dep} version mismatch. Expected: ${version}, Got: ${packageJson.dependencies[dep]}`);
      }
    }
  }
  
  if (expectedFields.devDependencies) {
    for (const [dep, version] of Object.entries(expectedFields.devDependencies)) {
      if (!packageJson.devDependencies?.[dep]) {
        throw new Error(`Missing dev dependency: ${dep}`);
      }
      if (version !== 'latest' && !packageJson.devDependencies[dep].includes(version)) {
        throw new Error(`Dev dependency ${dep} version mismatch. Expected: ${version}, Got: ${packageJson.devDependencies[dep]}`);
      }
    }
  }
  
  if (expectedFields.scripts) {
    for (const [script, command] of Object.entries(expectedFields.scripts)) {
      if (!packageJson.scripts?.[script]) {
        throw new Error(`Missing script: ${script}`);
      }
      if (packageJson.scripts[script] !== command) {
        throw new Error(`Script ${script} mismatch. Expected: ${command}, Got: ${packageJson.scripts[script]}`);
      }
    }
  }
}

/**
 * Validate TypeScript configuration
 */
export async function validateTsConfig(
  filePath: string,
  expectedOptions: Partial<{
    target: string;
    module: string;
    strict: boolean;
    baseUrl: string;
    paths: Record<string, string[]>;
  }>
): Promise<void> {
  const tsConfig = await parseJsonFile(filePath);
  const compilerOptions = tsConfig.compilerOptions;
  
  if (!compilerOptions) {
    throw new Error('Missing compilerOptions in tsconfig.json');
  }
  
  for (const [option, expectedValue] of Object.entries(expectedOptions)) {
    if (compilerOptions[option] !== expectedValue) {
      throw new Error(`TypeScript option ${option} mismatch. Expected: ${expectedValue}, Got: ${compilerOptions[option]}`);
    }
  }
}

/**
 * Validate React component syntax
 */
export function validateReactComponent(content: string): void {
  // Basic checks for React component structure
  if (!content.includes('export default function')) {
    throw new Error('Component does not export a default function');
  }
  
  if (!content.includes('return')) {
    throw new Error('Component does not have a return statement');
  }
  
  // Check for JSX syntax
  if (!content.includes('<') || !content.includes('>')) {
    throw new Error('Component does not contain JSX');
  }
}

/**
 * Validate CSS file syntax
 */
export function validateCssFile(content: string, expectedFeatures: string[]): void {
  for (const feature of expectedFeatures) {
    if (!content.includes(feature)) {
      throw new Error(`CSS file does not contain expected feature: ${feature}`);
    }
  }
}

/**
 * Validate Tailwind v4 configuration
 */
export function validateTailwindV4Config(content: string): void {
  // Check for v4 syntax
  if (!content.includes('@import "tailwindcss"')) {
    throw new Error('Missing Tailwind v4 import syntax');
  }
  
  if (!content.includes('@theme {')) {
    throw new Error('Missing @theme directive');
  }
  
  // Check that old v3 syntax is not present
  if (content.includes('@tailwind base') || 
      content.includes('@tailwind components') || 
      content.includes('@tailwind utilities')) {
    throw new Error('Contains old Tailwind v3 syntax');
  }
}

/**
 * Mock console for testing
 */
export function mockConsole() {
  const originalConsole = { ...console };
  const logs: string[] = [];
  const errors: string[] = [];
  const warns: string[] = [];

  console.log = (...args) => logs.push(args.join(' '));
  console.error = (...args) => errors.push(args.join(' '));
  console.warn = (...args) => warns.push(args.join(' '));

  return {
    logs,
    errors,
    warns,
    restore: () => Object.assign(console, originalConsole)
  };
}

/**
 * Wait for a specified amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a random test name
 */
export function generateTestName(prefix = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}
