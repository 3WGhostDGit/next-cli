/**
 * Générateur d'utilitaires base de données
 * Client Prisma configuré et helpers
 */

import { FileTemplate } from "../types";
import { DatabaseConfig } from "./index";

/**
 * Génère les utilitaires de base de données
 */
export function generateDatabaseUtilities(config: DatabaseConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Client Prisma configuré
  files.push(generateDbClient(config));

  // Utilitaires base de données
  files.push(generateDbUtils(config));

  return files;
}

/**
 * Génère le client Prisma configuré avec extensions
 */
function generateDbClient(config: DatabaseConfig): FileTemplate {
  const hasExtensions = config.features.some(f => 
    ['soft-delete', 'audit-trail', 'extensions'].includes(f)
  );

  return {
    path: "src/lib/db.ts",
    content: `import { PrismaClient } from '@prisma/client';${hasExtensions ? `
import { createPrismaExtensions } from '../../prisma/extensions';` : ''}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],${config.performance.connectionPooling ? `
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },` : ''}
  });${hasExtensions ? `

  // Appliquer les extensions
  return client.$extends(createPrismaExtensions());` : `

  return client;`}
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

/**
 * Utilitaires pour les requêtes Prisma
 */
export const dbUtils = {
  /**
   * Pagination helper
   */
  paginate: <T>(page: number, pageSize: number = 10) => ({
    skip: (page - 1) * pageSize,
    take: pageSize,
  }),

  /**
   * Recherche avec pagination
   */
  paginatedQuery: async <T>(
    query: (args: { skip: number; take: number }) => Promise<T[]>,
    countQuery: () => Promise<number>,
    page: number = 1,
    pageSize: number = 10
  ) => {
    const pagination = dbUtils.paginate(page, pageSize);
    const [data, total] = await Promise.all([
      query(pagination),
      countQuery(),
    ]);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: page * pageSize < total,
        hasPreviousPage: page > 1,
      },
    };
  },

  /**
   * Recherche full-text (PostgreSQL)
   */
  ${config.database === 'postgresql' ? `fullTextSearch: (query: string, fields: string[]) => ({
    OR: fields.map(field => ({
      [field]: {
        search: query,
      },
    })),
  }),` : `// Full-text search non disponible pour ${config.database}`}

  /**
   * Filtres de date
   */
  dateFilters: {
    today: () => ({
      gte: new Date(new Date().setHours(0, 0, 0, 0)),
      lt: new Date(new Date().setHours(23, 59, 59, 999)),
    }),
    thisWeek: () => {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      return {
        gte: startOfWeek,
        lte: endOfWeek,
      };
    },
    thisMonth: () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    },
  },${config.features.includes('soft-delete') ? `

  /**
   * Soft delete helpers
   */
  softDelete: {
    exclude: { deletedAt: null },
    includeDeleted: {},
    onlyDeleted: { deletedAt: { not: null } },
  },` : ''}
};

/**
 * Types utilitaires pour Prisma
 */
export type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type DateFilter = {
  gte?: Date;
  lte?: Date;
  gt?: Date;
  lt?: Date;
};

/**
 * Gestion des erreurs Prisma
 */
export const handlePrismaError = (error: any) => {
  if (error.code === 'P2002') {
    return {
      type: 'UNIQUE_CONSTRAINT',
      message: 'Cette valeur existe déjà',
      field: error.meta?.target?.[0],
    };
  }

  if (error.code === 'P2025') {
    return {
      type: 'NOT_FOUND',
      message: 'Enregistrement non trouvé',
    };
  }

  if (error.code === 'P2003') {
    return {
      type: 'FOREIGN_KEY_CONSTRAINT',
      message: 'Référence invalide',
      field: error.meta?.field_name,
    };
  }

  return {
    type: 'UNKNOWN',
    message: 'Erreur de base de données',
    originalError: error,
  };
};

/**
 * Middleware de logging des requêtes
 */
export const queryLogger = (query: string, params: any[], duration: number) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(\`🔍 Query: \${query}\`);
    console.log(\`📊 Params: \${JSON.stringify(params)}\`);
    console.log(\`⏱️  Duration: \${duration}ms\`);
  }
};`,
  };
}

/**
 * Génère les utilitaires avancés de base de données
 */
function generateDbUtils(config: DatabaseConfig): FileTemplate {
  return {
    path: "src/lib/db-utils.ts",
    content: `import { db } from './db';
import type { Prisma } from '@prisma/client';

/**
 * Service de base pour les opérations CRUD
 */
export abstract class BaseService<T, CreateInput, UpdateInput> {
  protected abstract model: any;

  async findMany(args?: any): Promise<T[]> {
    return this.model.findMany(args);
  }

  async findUnique(where: any): Promise<T | null> {
    return this.model.findUnique({ where });
  }

  async create(data: CreateInput): Promise<T> {
    return this.model.create({ data });
  }

  async update(where: any, data: UpdateInput): Promise<T> {
    return this.model.update({ where, data });
  }

  async delete(where: any): Promise<T> {
    return this.model.delete({ where });
  }

  async count(where?: any): Promise<number> {
    return this.model.count({ where });
  }
}

${config.models.user ? `/**
 * Service utilisateur
 */
export class UserService extends BaseService<
  Prisma.UserGetPayload<{}>,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  protected model = db.user;

  async findByEmail(email: string) {
    return this.model.findUnique({
      where: { email },${config.models.profile ? `
      include: { profile: true },` : ''}
    });
  }

  async createWithProfile(userData: Prisma.UserCreateInput & { bio?: string }) {
    const { bio, ...userFields } = userData;
    
    return this.model.create({
      data: {
        ...userFields,${config.models.profile ? `
        profile: bio ? {
          create: { bio }
        } : undefined,` : ''}
      },${config.models.profile ? `
      include: { profile: true },` : ''}
    });
  }${config.features.includes('soft-delete') ? `

  async softDelete(id: string) {
    return this.model.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    return this.model.update({
      where: { id },
      data: { deletedAt: null },
    });
  }` : ''}
}

export const userService = new UserService();` : ''}

${config.models.post ? `/**
 * Service post
 */
export class PostService extends BaseService<
  Prisma.PostGetPayload<{}>,
  Prisma.PostCreateInput,
  Prisma.PostUpdateInput
> {
  protected model = db.post;

  async findPublished() {
    return this.model.findMany({
      where: { 
        published: true,${config.features.includes('soft-delete') ? `
        deletedAt: null,` : ''}
      },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByAuthor(authorId: string) {
    return this.model.findMany({
      where: { 
        authorId,${config.features.includes('soft-delete') ? `
        deletedAt: null,` : ''}
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async publish(id: string) {
    return this.model.update({
      where: { id },
      data: { published: true },
    });
  }

  async unpublish(id: string) {
    return this.model.update({
      where: { id },
      data: { published: false },
    });
  }
}

export const postService = new PostService();` : ''}

/**
 * Utilitaires de transaction
 */
export const transactionUtils = {
  /**
   * Exécute une transaction avec retry automatique
   */
  async withRetry<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await db.$transaction(operation);
      } catch (error: any) {
        lastError = error;
        
        // Retry seulement pour certaines erreurs
        if (
          error.code === 'P2034' || // Transaction conflict
          error.code === 'P2028'    // Transaction timeout
        ) {
          if (attempt < maxRetries) {
            await new Promise(resolve => 
              setTimeout(resolve, Math.pow(2, attempt) * 100)
            );
            continue;
          }
        }
        
        throw error;
      }
    }

    throw lastError;
  },

  /**
   * Transaction avec timeout personnalisé
   */
  async withTimeout<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
    timeoutMs: number = 5000
  ): Promise<T> {
    return db.$transaction(operation, {
      timeout: timeoutMs,
    });
  },
};

/**
 * Utilitaires de cache (si activé)
 */
${config.performance.caching ? `export const cacheUtils = {
  /**
   * Cache simple en mémoire (pour développement)
   */
  cache: new Map<string, { data: any; expiry: number }>(),

  async get<T>(key: string): Promise<T | null> {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  },

  set(key: string, data: any, ttlMs: number = 300000) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  },

  delete(key: string) {
    this.cache.delete(key);
  },

  clear() {
    this.cache.clear();
  },
};` : '// Cache désactivé'}`,
  };
}
