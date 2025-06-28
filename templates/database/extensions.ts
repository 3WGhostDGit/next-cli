/**
 * Générateur d'extensions Prisma
 * Soft delete, audit trail, pagination, etc.
 */

import { FileTemplate } from "../types";
import { DatabaseConfig } from "./index";

/**
 * Génère les fichiers d'extensions Prisma
 */
export function generateExtensionFiles(config: DatabaseConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  if (!config.features.includes('extensions')) {
    return files;
  }

  // Extension principale
  files.push(generateMainExtension(config));

  // Extensions spécifiques
  if (config.features.includes('soft-delete')) {
    files.push(generateSoftDeleteExtension(config));
  }

  if (config.features.includes('audit-trail')) {
    files.push(generateAuditTrailExtension(config));
  }

  // Extension de pagination
  files.push(generatePaginationExtension(config));

  return files;
}

/**
 * Génère l'extension principale qui combine toutes les extensions
 */
function generateMainExtension(config: DatabaseConfig): FileTemplate {
  const imports: string[] = [];
  const extensions: string[] = [];

  if (config.features.includes('soft-delete')) {
    imports.push("import { softDeleteExtension } from './soft-delete';");
    extensions.push("softDeleteExtension");
  }

  if (config.features.includes('audit-trail')) {
    imports.push("import { auditTrailExtension } from './audit-trail';");
    extensions.push("auditTrailExtension");
  }

  imports.push("import { paginationExtension } from './pagination';");
  extensions.push("paginationExtension");

  return {
    path: "prisma/extensions/index.ts",
    content: `import { Prisma } from '@prisma/client';
${imports.join('\n')}

/**
 * Combine toutes les extensions Prisma
 */
export function createPrismaExtensions() {
  return Prisma.defineExtension((client) => {
    let extendedClient = client;

    // Appliquer toutes les extensions
    ${extensions.map(ext => `extendedClient = extendedClient.$extends(${ext});`).join('\n    ')}

    return extendedClient;
  });
}

// Exporter toutes les extensions individuelles
${imports.map(imp => imp.replace('import', 'export')).join('\n')}
export { paginationExtension } from './pagination';`,
  };
}

/**
 * Génère l'extension de soft delete
 */
function generateSoftDeleteExtension(config: DatabaseConfig): FileTemplate {
  return {
    path: "prisma/extensions/soft-delete.ts",
    content: `import { Prisma } from '@prisma/client';

/**
 * Extension Prisma pour le soft delete
 * Ajoute automatiquement les filtres deletedAt aux requêtes
 */
export const softDeleteExtension = Prisma.defineExtension({
  name: 'softDelete',
  query: {
    $allModels: {
      async findMany({ model, operation, args, query }) {
        // Exclure les enregistrements supprimés par défaut
        if (!args.where) {
          args.where = {};
        }
        
        // Ne pas appliquer le filtre si includeDeleted est explicitement défini
        if (!args.includeDeleted) {
          args.where.deletedAt = null;
        }
        
        // Nettoyer le paramètre personnalisé
        delete args.includeDeleted;
        
        return query(args);
      },

      async findUnique({ model, operation, args, query }) {
        if (!args.where) {
          args.where = {};
        }
        
        if (!args.includeDeleted) {
          args.where.deletedAt = null;
        }
        
        delete args.includeDeleted;
        
        return query(args);
      },

      async findFirst({ model, operation, args, query }) {
        if (!args.where) {
          args.where = {};
        }
        
        if (!args.includeDeleted) {
          args.where.deletedAt = null;
        }
        
        delete args.includeDeleted;
        
        return query(args);
      },

      async count({ model, operation, args, query }) {
        if (!args.where) {
          args.where = {};
        }
        
        if (!args.includeDeleted) {
          args.where.deletedAt = null;
        }
        
        delete args.includeDeleted;
        
        return query(args);
      },

      async delete({ model, operation, args, query }) {
        // Transformer delete en update avec deletedAt
        return query({
          ...args,
          data: {
            deletedAt: new Date(),
          },
        } as any);
      },

      async deleteMany({ model, operation, args, query }) {
        // Transformer deleteMany en updateMany avec deletedAt
        return query({
          ...args,
          data: {
            deletedAt: new Date(),
          },
        } as any);
      },
    },
  },
  result: {
    $allModels: {
      isDeleted: {
        needs: { deletedAt: true },
        compute(model) {
          return model.deletedAt !== null;
        },
      },
    },
  },
  model: {
    $allModels: {
      // Méthode pour soft delete
      async softDelete<T>(this: T, where: any): Promise<any> {
        const context = Prisma.getExtensionContext(this);
        
        return (context as any).update({
          where,
          data: {
            deletedAt: new Date(),
          },
        });
      },

      // Méthode pour restaurer
      async restore<T>(this: T, where: any): Promise<any> {
        const context = Prisma.getExtensionContext(this);
        
        return (context as any).update({
          where,
          data: {
            deletedAt: null,
          },
        });
      },

      // Méthode pour hard delete
      async forceDelete<T>(this: T, where: any): Promise<any> {
        const context = Prisma.getExtensionContext(this);
        
        return (context as any).delete({
          where,
        });
      },

      // Méthode pour trouver les supprimés
      async findDeleted<T>(this: T, args?: any): Promise<any> {
        const context = Prisma.getExtensionContext(this);
        
        return (context as any).findMany({
          ...args,
          where: {
            ...args?.where,
            deletedAt: { not: null },
          },
        });
      },

      // Méthode pour trouver avec les supprimés
      async findWithDeleted<T>(this: T, args?: any): Promise<any> {
        const context = Prisma.getExtensionContext(this);
        
        return (context as any).findMany({
          ...args,
          includeDeleted: true,
        });
      },
    },
  },
});

// Types pour TypeScript
declare global {
  namespace PrismaJson {
    // Étendre les types Prisma si nécessaire
  }
}

// Types d'extension
export interface SoftDeleteOptions {
  includeDeleted?: boolean;
}

export interface SoftDeleteMethods {
  softDelete(where: any): Promise<any>;
  restore(where: any): Promise<any>;
  forceDelete(where: any): Promise<any>;
  findDeleted(args?: any): Promise<any>;
  findWithDeleted(args?: any): Promise<any>;
}`,
  };
}

/**
 * Génère l'extension d'audit trail
 */
function generateAuditTrailExtension(config: DatabaseConfig): FileTemplate {
  return {
    path: "prisma/extensions/audit-trail.ts",
    content: `import { Prisma } from '@prisma/client';

/**
 * Extension Prisma pour l'audit trail
 * Ajoute automatiquement createdBy et updatedBy aux opérations
 */

// Context pour stocker l'utilisateur actuel
let currentUserId: string | null = null;

export const auditTrailExtension = Prisma.defineExtension({
  name: 'auditTrail',
  query: {
    $allModels: {
      async create({ model, operation, args, query }) {
        // Ajouter createdBy et updatedBy
        if (currentUserId) {
          args.data = {
            ...args.data,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          };
        }
        
        return query(args);
      },

      async createMany({ model, operation, args, query }) {
        // Ajouter createdBy et updatedBy à tous les enregistrements
        if (currentUserId && args.data) {
          if (Array.isArray(args.data)) {
            args.data = args.data.map(item => ({
              ...item,
              createdBy: currentUserId,
              updatedBy: currentUserId,
            }));
          } else {
            args.data = {
              ...args.data,
              createdBy: currentUserId,
              updatedBy: currentUserId,
            };
          }
        }
        
        return query(args);
      },

      async update({ model, operation, args, query }) {
        // Ajouter updatedBy
        if (currentUserId) {
          args.data = {
            ...args.data,
            updatedBy: currentUserId,
          };
        }
        
        return query(args);
      },

      async updateMany({ model, operation, args, query }) {
        // Ajouter updatedBy
        if (currentUserId) {
          args.data = {
            ...args.data,
            updatedBy: currentUserId,
          };
        }
        
        return query(args);
      },

      async upsert({ model, operation, args, query }) {
        // Ajouter aux données de création et mise à jour
        if (currentUserId) {
          args.create = {
            ...args.create,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          };
          
          args.update = {
            ...args.update,
            updatedBy: currentUserId,
          };
        }
        
        return query(args);
      },
    },
  },
  model: {
    $allModels: {
      // Méthode pour définir l'utilisateur actuel
      async withUser<T>(this: T, userId: string, operation: () => Promise<any>): Promise<any> {
        const previousUserId = currentUserId;
        currentUserId = userId;
        
        try {
          return await operation();
        } finally {
          currentUserId = previousUserId;
        }
      },

      // Méthode pour obtenir l'historique d'audit
      async getAuditHistory<T>(this: T, recordId: any): Promise<any[]> {
        // Cette méthode nécessiterait une table d'audit séparée
        // pour un vrai système d'audit trail
        return [];
      },
    },
  },
});

// Utilitaires pour l'audit trail
export const auditUtils = {
  /**
   * Définit l'utilisateur actuel pour les opérations suivantes
   */
  setCurrentUser(userId: string | null) {
    currentUserId = userId;
  },

  /**
   * Obtient l'utilisateur actuel
   */
  getCurrentUser(): string | null {
    return currentUserId;
  },

  /**
   * Exécute une opération avec un utilisateur spécifique
   */
  async withUser<T>(userId: string, operation: () => Promise<T>): Promise<T> {
    const previousUserId = currentUserId;
    currentUserId = userId;
    
    try {
      return await operation();
    } finally {
      currentUserId = previousUserId;
    }
  },

  /**
   * Middleware pour Express/Next.js pour définir l'utilisateur automatiquement
   */
  createMiddleware() {
    return (req: any, res: any, next: any) => {
      // Extraire l'ID utilisateur de la session/token
      const userId = req.user?.id || req.session?.userId;
      if (userId) {
        auditUtils.setCurrentUser(userId);
      }
      
      // Nettoyer après la requête
      const originalEnd = res.end;
      res.end = function(...args: any[]) {
        auditUtils.setCurrentUser(null);
        originalEnd.apply(this, args);
      };
      
      next();
    };
  },
};

// Types pour TypeScript
export interface AuditTrailMethods {
  withUser(userId: string, operation: () => Promise<any>): Promise<any>;
  getAuditHistory(recordId: any): Promise<any[]>;
}

export interface AuditFields {
  createdBy?: string | null;
  updatedBy?: string | null;
}`,
  };
}

/**
 * Génère l'extension de pagination
 */
function generatePaginationExtension(config: DatabaseConfig): FileTemplate {
  return {
    path: "prisma/extensions/pagination.ts",
    content: `import { Prisma } from '@prisma/client';

/**
 * Extension Prisma pour la pagination
 * Ajoute des méthodes de pagination à tous les modèles
 */

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const paginationExtension = Prisma.defineExtension({
  name: 'pagination',
  model: {
    $allModels: {
      async findManyPaginated<T>(
        this: T,
        params: PaginationParams & { where?: any; orderBy?: any; include?: any; select?: any }
      ): Promise<PaginationResult<any>> {
        const context = Prisma.getExtensionContext(this);
        
        const page = params.page || 1;
        const pageSize = Math.min(params.pageSize || 10, 100); // Limite à 100
        const skip = (page - 1) * pageSize;
        
        const { page: _, pageSize: __, ...queryParams } = params;
        
        // Exécuter les requêtes en parallèle
        const [data, total] = await Promise.all([
          (context as any).findMany({
            ...queryParams,
            skip,
            take: pageSize,
          }),
          (context as any).count({
            where: queryParams.where,
          }),
        ]);
        
        const totalPages = Math.ceil(total / pageSize);
        
        return {
          data,
          pagination: {
            page,
            pageSize,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        };
      },

      async findManyWithCursor<T>(
        this: T,
        params: {
          cursor?: any;
          take?: number;
          where?: any;
          orderBy?: any;
          include?: any;
          select?: any;
        }
      ): Promise<{ data: any[]; nextCursor?: any; hasMore: boolean }> {
        const context = Prisma.getExtensionContext(this);
        
        const take = Math.min(params.take || 10, 100);
        const actualTake = take + 1; // Prendre un de plus pour vérifier s'il y en a d'autres
        
        const data = await (context as any).findMany({
          ...params,
          take: actualTake,
        });
        
        const hasMore = data.length > take;
        if (hasMore) {
          data.pop(); // Retirer l'élément supplémentaire
        }
        
        const nextCursor = hasMore && data.length > 0 
          ? data[data.length - 1].id 
          : undefined;
        
        return {
          data,
          nextCursor,
          hasMore,
        };
      },

      async searchPaginated<T>(
        this: T,
        params: {
          query?: string;
          searchFields?: string[];
          page?: number;
          pageSize?: number;
          where?: any;
          orderBy?: any;
          include?: any;
          select?: any;
        }
      ): Promise<PaginationResult<any> & { query?: string }> {
        const context = Prisma.getExtensionContext(this);
        
        let searchWhere = params.where || {};
        
        // Ajouter la recherche full-text si une requête est fournie
        if (params.query && params.searchFields && params.searchFields.length > 0) {
          const searchConditions = params.searchFields.map(field => ({
            [field]: {
              contains: params.query,
              mode: 'insensitive' as const,
            },
          }));
          
          searchWhere = {
            ...searchWhere,
            OR: searchConditions,
          };
        }
        
        const result = await (context as any).findManyPaginated({
          ...params,
          where: searchWhere,
        });
        
        return {
          ...result,
          query: params.query,
        };
      },
    },
  },
});

// Utilitaires de pagination
export const paginationUtils = {
  /**
   * Valide les paramètres de pagination
   */
  validateParams(params: PaginationParams): { page: number; pageSize: number } {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(Math.max(1, params.pageSize || 10), 100);
    
    return { page, pageSize };
  },

  /**
   * Calcule les métadonnées de pagination
   */
  calculateMeta(page: number, pageSize: number, total: number) {
    const totalPages = Math.ceil(total / pageSize);
    
    return {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      startIndex: (page - 1) * pageSize + 1,
      endIndex: Math.min(page * pageSize, total),
    };
  },

  /**
   * Génère les liens de pagination
   */
  generateLinks(baseUrl: string, page: number, totalPages: number) {
    const links: Record<string, string> = {};
    
    if (page > 1) {
      links.first = \`\${baseUrl}?page=1\`;
      links.prev = \`\${baseUrl}?page=\${page - 1}\`;
    }
    
    if (page < totalPages) {
      links.next = \`\${baseUrl}?page=\${page + 1}\`;
      links.last = \`\${baseUrl}?page=\${totalPages}\`;
    }
    
    return links;
  },
};

// Types pour TypeScript
export interface PaginationMethods {
  findManyPaginated(params: PaginationParams & any): Promise<PaginationResult<any>>;
  findManyWithCursor(params: any): Promise<{ data: any[]; nextCursor?: any; hasMore: boolean }>;
  searchPaginated(params: any): Promise<PaginationResult<any> & { query?: string }>;
}`,
  };
}
