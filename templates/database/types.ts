/**
 * Générateur de types TypeScript pour la base de données
 * Types étendus et utilitaires
 */

import { FileTemplate } from "../types";
import { DatabaseConfig } from "./index";

/**
 * Génère les fichiers de types TypeScript
 */
export function generateTypeFiles(config: DatabaseConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Types de base de données
  files.push(generateDatabaseTypes(config));

  // Types Prisma étendus
  files.push(generatePrismaTypes(config));

  return files;
}

/**
 * Génère les types de base de données
 */
function generateDatabaseTypes(config: DatabaseConfig): FileTemplate {
  return {
    path: "shared/types/database.ts",
    content: `/**
 * Types de base de données et utilitaires
 */

// Types de base selon la base de données
${getBaseTypes(config)}

// Types de pagination
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Types de recherche
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface SearchResult<T> extends PaginatedResult<T> {
  query?: string;
  totalResults: number;
}

// Types de réponse API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  type: string;
  message: string;
  field?: string;
  code?: string;
}

// Types de filtres de date
export interface DateFilter {
  gte?: Date;
  lte?: Date;
  gt?: Date;
  lt?: Date;
}

export interface DateRange {
  start: Date;
  end: Date;
}

// Types d'audit${config.features.includes('audit-trail') ? `
export interface AuditFields {
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}` : ''}

// Types de soft delete${config.features.includes('soft-delete') ? `
export interface SoftDeleteFields {
  deletedAt?: Date | null;
}

export interface SoftDeleteOptions {
  includeDeleted?: boolean;
  onlyDeleted?: boolean;
}` : ''}

// Types d'énumération
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

// Types de configuration
export interface DatabaseConfig {
  provider: '${config.database}';
  url: string;
  features: {
    softDelete: ${config.features.includes('soft-delete')};
    auditTrail: ${config.features.includes('audit-trail')};
    fullTextSearch: ${config.database === 'postgresql'};
  };
}

// Types de requête
export interface QueryOptions {
  include?: Record<string, boolean | QueryOptions>;
  select?: Record<string, boolean>;
  where?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];
  skip?: number;
  take?: number;
}

// Types de transaction
export interface TransactionOptions {
  timeout?: number;
  maxRetries?: number;
  isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
}

// Types de cache${config.performance.caching ? `
export interface CacheOptions {
  ttl?: number; // Time to live en millisecondes
  key?: string;
  tags?: string[];
}

export interface CacheEntry<T> {
  data: T;
  expiry: number;
  tags: string[];
}` : ''}

// Types d'erreur de base de données
export interface DatabaseError {
  type: 'UNIQUE_CONSTRAINT' | 'NOT_FOUND' | 'FOREIGN_KEY_CONSTRAINT' | 'UNKNOWN';
  message: string;
  field?: string;
  originalError?: any;
}

// Types de validation
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

// Types utilitaires
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Types de modèle de base
export interface BaseModel {
  id: ${getIdType(config)};
  createdAt: Date;
  updatedAt: Date;${config.features.includes('soft-delete') ? `
  deletedAt?: Date | null;` : ''}${config.features.includes('audit-trail') ? `
  createdBy?: string | null;
  updatedBy?: string | null;` : ''}
}

// Types de service CRUD
export interface CrudService<T, CreateInput, UpdateInput> {
  findMany(options?: QueryOptions): Promise<T[]>;
  findUnique(id: ${getIdType(config)}): Promise<T | null>;
  create(data: CreateInput): Promise<T>;
  update(id: ${getIdType(config)}, data: UpdateInput): Promise<T>;
  delete(id: ${getIdType(config)}): Promise<T>;
  count(where?: Record<string, any>): Promise<number>;
}

// Types de service avec pagination
export interface PaginatedService<T> {
  findManyPaginated(
    params: PaginationParams,
    options?: QueryOptions
  ): Promise<PaginatedResult<T>>;
  
  search(
    searchParams: SearchParams,
    paginationParams: PaginationParams
  ): Promise<SearchResult<T>>;
}

// Types de hooks de cycle de vie
export interface LifecycleHooks<T> {
  beforeCreate?: (data: any) => Promise<any> | any;
  afterCreate?: (result: T) => Promise<void> | void;
  beforeUpdate?: (id: ${getIdType(config)}, data: any) => Promise<any> | any;
  afterUpdate?: (result: T) => Promise<void> | void;
  beforeDelete?: (id: ${getIdType(config)}) => Promise<void> | void;
  afterDelete?: (result: T) => Promise<void> | void;
}

// Types de middleware
export interface DatabaseMiddleware {
  name: string;
  before?: (operation: string, args: any) => Promise<any> | any;
  after?: (operation: string, result: any) => Promise<any> | any;
  error?: (operation: string, error: any) => Promise<void> | void;
}

// Types de métriques${config.performance.queryOptimization ? `
export interface QueryMetrics {
  operation: string;
  model: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}

export interface PerformanceMetrics {
  totalQueries: number;
  averageDuration: number;
  slowQueries: QueryMetrics[];
  errorRate: number;
}` : ''}`,
  };
}

/**
 * Génère les types Prisma étendus
 */
function generatePrismaTypes(config: DatabaseConfig): FileTemplate {
  return {
    path: "shared/types/prisma.ts",
    content: `import type { Prisma } from '@prisma/client';

/**
 * Types Prisma étendus et utilitaires
 */

// Types de payload étendus${config.models.user ? `
export type UserWithRelations = Prisma.UserGetPayload<{
  include: {${config.models.session ? `
    sessions: true;` : ''}${config.models.post ? `
    posts: true;` : ''}${config.models.profile ? `
    profile: true;` : ''}
  };
}>;

export type UserSelect = Prisma.UserSelect;
export type UserInclude = Prisma.UserInclude;
export type UserCreateInput = Prisma.UserCreateInput;
export type UserUpdateInput = Prisma.UserUpdateInput;
export type UserWhereInput = Prisma.UserWhereInput;
export type UserWhereUniqueInput = Prisma.UserWhereUniqueInput;
export type UserOrderByWithRelationInput = Prisma.UserOrderByWithRelationInput;` : ''}

${config.models.post ? `export type PostWithAuthor = Prisma.PostGetPayload<{
  include: {
    author: true;
  };
}>;

export type PostSelect = Prisma.PostSelect;
export type PostInclude = Prisma.PostInclude;
export type PostCreateInput = Prisma.PostCreateInput;
export type PostUpdateInput = Prisma.PostUpdateInput;
export type PostWhereInput = Prisma.PostWhereInput;
export type PostWhereUniqueInput = Prisma.PostWhereUniqueInput;
export type PostOrderByWithRelationInput = Prisma.PostOrderByWithRelationInput;` : ''}

${config.models.session ? `export type SessionWithUser = Prisma.SessionGetPayload<{
  include: {
    user: true;
  };
}>;

export type SessionSelect = Prisma.SessionSelect;
export type SessionInclude = Prisma.SessionInclude;
export type SessionCreateInput = Prisma.SessionCreateInput;
export type SessionUpdateInput = Prisma.SessionUpdateInput;
export type SessionWhereInput = Prisma.SessionWhereInput;
export type SessionWhereUniqueInput = Prisma.SessionWhereUniqueInput;` : ''}

// Types de client étendu
export type ExtendedPrismaClient = Prisma.DefaultPrismaClient${config.features.some(f => ['soft-delete', 'audit-trail', 'extensions'].includes(f)) ? ` & {
  // Extensions personnalisées ajoutées ici
}` : ''};

// Types de transaction
export type TransactionClient = Prisma.TransactionClient;

// Types d'erreur Prisma
export type PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError;
export type PrismaClientUnknownRequestError = Prisma.PrismaClientUnknownRequestError;
export type PrismaClientRustPanicError = Prisma.PrismaClientRustPanicError;
export type PrismaClientInitializationError = Prisma.PrismaClientInitializationError;
export type PrismaClientValidationError = Prisma.PrismaClientValidationError;

// Types de requête avancés
export interface FindManyArgs<T> {
  select?: T;
  include?: any;
  where?: any;
  orderBy?: any;
  cursor?: any;
  take?: number;
  skip?: number;
  distinct?: any;
}

export interface FindUniqueArgs<T> {
  select?: T;
  include?: any;
  where: any;
}

export interface CreateArgs<T> {
  select?: T;
  include?: any;
  data: any;
}

export interface UpdateArgs<T> {
  select?: T;
  include?: any;
  where: any;
  data: any;
}

export interface DeleteArgs<T> {
  select?: T;
  include?: any;
  where: any;
}

// Types de middleware Prisma
export type PrismaMiddleware = Prisma.Middleware;

// Types de log
export type LogLevel = Prisma.LogLevel;
export type LogDefinition = Prisma.LogDefinition;

// Types de métrique
export type Metrics = Prisma.Metrics;
export type MetricHistogram = Prisma.MetricHistogram;
export type MetricHistogramBucket = Prisma.MetricHistogramBucket;

// Types JSON
export type JsonValue = Prisma.JsonValue;
export type JsonObject = Prisma.JsonObject;
export type JsonArray = Prisma.JsonArray;
export type InputJsonValue = Prisma.InputJsonValue;
export type InputJsonObject = Prisma.InputJsonObject;
export type InputJsonArray = Prisma.InputJsonArray;

// Types Decimal
export type Decimal = Prisma.Decimal;
export type DecimalJsLike = Prisma.DecimalJsLike;

// Types de configuration
export type PrismaClientOptions = Prisma.PrismaClientOptions;
export type Datasource = Prisma.Datasource;
export type Generator = Prisma.Generator;

// Types utilitaires pour les requêtes
export type WhereCondition<T> = {
  [K in keyof T]?: T[K] | {
    equals?: T[K];
    not?: T[K] | WhereCondition<T[K]>;
    in?: T[K][];
    notIn?: T[K][];
    lt?: T[K];
    lte?: T[K];
    gt?: T[K];
    gte?: T[K];
    contains?: T[K];
    startsWith?: T[K];
    endsWith?: T[K];
    mode?: 'default' | 'insensitive';
  };
} & {
  AND?: WhereCondition<T>[];
  OR?: WhereCondition<T>[];
  NOT?: WhereCondition<T>[];
};

// Types pour les relations
export type RelationFilter<T> = {
  is?: T | null;
  isNot?: T | null;
  some?: T;
  every?: T;
  none?: T;
};

// Types pour l'ordre
export type OrderByDirection = 'asc' | 'desc';
export type OrderBy<T> = {
  [K in keyof T]?: OrderByDirection | {
    sort: OrderByDirection;
    nulls?: 'first' | 'last';
  };
};`,
  };
}

/**
 * Retourne les types de base selon la base de données
 */
function getBaseTypes(config: DatabaseConfig): string {
  switch (config.database) {
    case "mongodb":
      return `// Types MongoDB
export type ObjectId = string;
export type DatabaseId = ObjectId;`;
    
    case "mysql":
    case "sqlite":
      return `// Types ${config.database.toUpperCase()}
export type DatabaseId = number;`;
    
    case "postgresql":
    default:
      return `// Types PostgreSQL
export type DatabaseId = string; // CUID`;
  }
}

/**
 * Retourne le type d'ID selon la base de données
 */
function getIdType(config: DatabaseConfig): string {
  switch (config.database) {
    case "mongodb":
      return "string";
    case "mysql":
    case "sqlite":
      return "number";
    case "postgresql":
    default:
      return "string";
  }
}
