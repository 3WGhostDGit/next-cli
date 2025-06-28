/**
 * Types partagés pour tous les templates CLI
 * Définit les interfaces communes utilisées dans la génération de templates
 */

export interface ProjectConfig {
  projectName: string;
  useTypeScript: boolean;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
}

export interface FileTemplate {
  path: string;
  content: string;
  executable?: boolean;
  description?: string;
}

export interface DirectoryNode {
  type: 'file' | 'directory';
  description?: string;
  children?: Record<string, DirectoryNode>;
}

export interface DirectoryStructure {
  [key: string]: DirectoryNode;
}

export interface TemplateMetadata {
  name: string;
  description: string;
  version: string;
  author: string;
  dependencies: string[];
  devDependencies: string[];
  tags: string[];
}

export interface GenerationContext {
  projectRoot: string;
  config: ProjectConfig;
  existingFiles: string[];
  skipExisting: boolean;
  dryRun: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TemplateGenerator<T extends ProjectConfig = ProjectConfig> {
  name: string;
  description: string;
  validate: (config: Partial<T>) => ValidationResult;
  generate: (config: T, context: GenerationContext) => Promise<GenerationResult>;
  dependencies?: string[];
}

export interface GenerationResult {
  success: boolean;
  files: FileTemplate[];
  directories: string[];
  instructions: string[];
  errors?: string[];
  warnings?: string[];
}

// Types spécifiques pour les différents templates

export interface AuthConfig extends ProjectConfig {
  authProvider: 'better-auth' | 'next-auth' | 'clerk' | 'supabase';
  providers: ('google' | 'github' | 'discord' | 'email')[];
  features: ('2fa' | 'email-verification' | 'password-reset' | 'social-login')[];
}

export interface DatabaseConfig extends ProjectConfig {
  database: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb';
  orm: 'prisma' | 'drizzle' | 'typeorm';
  features: ('migrations' | 'seeding' | 'relations' | 'soft-delete')[];
}

export interface UIConfig extends ProjectConfig {
  uiLibrary: 'shadcn-ui' | 'mantine' | 'chakra-ui' | 'material-ui';
  theme: 'light' | 'dark' | 'system';
  components: string[];
  customization: {
    colors?: Record<string, string>;
    fonts?: string[];
    spacing?: Record<string, string>;
  };
}

export interface FormConfig extends ProjectConfig {
  formLibrary: 'react-hook-form' | 'formik' | 'react-final-form';
  validation: 'zod' | 'yup' | 'joi';
  features: ('file-upload' | 'multi-step' | 'dynamic-fields' | 'auto-save')[];
}

export interface CRUDConfig extends ProjectConfig {
  entities: EntityDefinition[];
  features: ('pagination' | 'sorting' | 'filtering' | 'search' | 'export')[];
  permissions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface EntityDefinition {
  name: string;
  fields: FieldDefinition[];
  relations: RelationDefinition[];
  permissions: Record<string, string[]>;
}

export interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'url' | 'text' | 'json';
  required: boolean;
  unique?: boolean;
  defaultValue?: any;
  validation?: ValidationRule[];
}

export interface RelationDefinition {
  name: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  target: string;
  foreignKey?: string;
}

export interface ValidationRule {
  type: 'min' | 'max' | 'pattern' | 'custom';
  value: any;
  message: string;
}

export interface NavigationConfig extends ProjectConfig {
  layout: 'sidebar' | 'header' | 'both';
  features: ('breadcrumbs' | 'search' | 'notifications' | 'user-menu')[];
  menuItems: MenuItem[];
}

export interface MenuItem {
  label: string;
  href: string;
  icon?: string;
  children?: MenuItem[];
  permissions?: string[];
}

export interface MiddlewareConfig extends ProjectConfig {
  features: ('auth' | 'cors' | 'rate-limiting' | 'logging' | 'compression')[];
  security: {
    csp?: boolean;
    csrf?: boolean;
    headers?: Record<string, string>;
  };
}

export interface CacheConfig extends ProjectConfig {
  strategy: 'isr' | 'ssg' | 'ssr' | 'spa';
  revalidation: {
    time?: number;
    tags?: string[];
    paths?: string[];
  };
  optimization: ('images' | 'fonts' | 'scripts' | 'css')[];
}

export interface ErrorHandlingConfig extends ProjectConfig {
  monitoring: 'sentry' | 'bugsnag' | 'rollbar' | 'custom';
  features: ('error-boundaries' | 'custom-pages' | 'logging' | 'notifications')[];
  errorPages: ('404' | '500' | 'offline' | 'maintenance')[];
}

export interface TestConfig extends ProjectConfig {
  testFramework: 'jest' | 'vitest' | 'playwright' | 'cypress';
  testTypes: ('unit' | 'integration' | 'e2e' | 'visual')[];
  coverage: boolean;
  ci: boolean;
}

export interface DeploymentConfig extends ProjectConfig {
  platform: 'vercel' | 'netlify' | 'aws' | 'docker' | 'custom';
  features: ('ci-cd' | 'monitoring' | 'analytics' | 'cdn')[];
  environment: ('development' | 'staging' | 'production')[];
}

// Utilitaires de type

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type ConfigWithDefaults<T extends ProjectConfig> = RequiredKeys<T, keyof ProjectConfig>;

// Types pour la CLI

export interface CLICommand {
  name: string;
  description: string;
  options: CLIOption[];
  action: (args: any, options: any) => Promise<void>;
}

export interface CLIOption {
  name: string;
  description: string;
  type: 'string' | 'boolean' | 'number' | 'array';
  required?: boolean;
  default?: any;
  choices?: string[];
}

export interface CLIContext {
  cwd: string;
  args: string[];
  options: Record<string, any>;
  logger: Logger;
}

export interface Logger {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
  success: (message: string) => void;
  debug: (message: string) => void;
}
