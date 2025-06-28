/**
 * Intégration Zod avec Prisma
 * Génération de schémas de validation automatiques
 */

import { FileTemplate } from "../types";
import { DatabaseConfig } from "./index";

/**
 * Génère les fichiers de validation Zod
 */
export function generateValidationFiles(config: DatabaseConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  if (!config.validation.useZodPrismaTypes) {
    return files;
  }

  // Fichier principal de validation
  files.push(generateMainValidationFile(config));

  // Validation par modèle
  if (config.models.user) {
    files.push(generateUserValidation(config));
  }

  if (config.models.post) {
    files.push(generatePostValidation(config));
  }

  // Index des validations
  files.push(generateValidationIndex(config));

  return files;
}

/**
 * Génère le fichier principal de validation
 */
function generateMainValidationFile(config: DatabaseConfig): FileTemplate {
  return {
    path: "shared/validation/database.ts",
    content: `import { z } from 'zod';

/**
 * Schémas de validation de base pour la base de données
 */

// Validation des IDs selon le type de base de données
${getIdValidation(config)}

// Validation des emails
export const emailSchema = z
  .string({ required_error: "L'email est requis" })
  .email({ message: "Format d'email invalide" })
  .min(1, { message: "L'email ne peut pas être vide" })
  .max(255, { message: "L'email ne peut pas dépasser 255 caractères" });

// Validation des mots de passe
export const passwordSchema = z
  .string({ required_error: "Le mot de passe est requis" })
  .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
  .max(100, { message: "Le mot de passe ne peut pas dépasser 100 caractères" })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre",
  });

// Validation des noms
export const nameSchema = z
  .string({ required_error: "Le nom est requis" })
  .min(2, { message: "Le nom doit contenir au moins 2 caractères" })
  .max(50, { message: "Le nom ne peut pas dépasser 50 caractères" })
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: "Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets",
  });

// Validation des URLs
export const urlSchema = z
  .string()
  .url({ message: "Format d'URL invalide" })
  .optional()
  .or(z.literal(""));

// Validation des images
export const imageUrlSchema = z
  .string()
  .url({ message: "URL d'image invalide" })
  .refine(
    (url) => {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      return imageExtensions.some(ext => url.toLowerCase().includes(ext));
    },
    { message: "L'URL doit pointer vers une image valide" }
  )
  .optional();

// Validation des dates
export const dateSchema = z
  .date({ invalid_type_error: "Date invalide" })
  .or(z.string().pipe(z.coerce.date()));

export const futureDateSchema = dateSchema.refine(
  (date) => date > new Date(),
  { message: "La date doit être dans le futur" }
);

export const pastDateSchema = dateSchema.refine(
  (date) => date < new Date(),
  { message: "La date doit être dans le passé" }
);

// Validation de pagination
export const paginationSchema = z.object({
  page: z
    .number({ invalid_type_error: "Le numéro de page doit être un nombre" })
    .int({ message: "Le numéro de page doit être un entier" })
    .min(1, { message: "Le numéro de page doit être supérieur à 0" })
    .default(1),
  pageSize: z
    .number({ invalid_type_error: "La taille de page doit être un nombre" })
    .int({ message: "La taille de page doit être un entier" })
    .min(1, { message: "La taille de page doit être supérieure à 0" })
    .max(100, { message: "La taille de page ne peut pas dépasser 100" })
    .default(10),
});

// Validation de recherche
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, { message: "La requête de recherche ne peut pas être vide" })
    .max(255, { message: "La requête de recherche ne peut pas dépasser 255 caractères" })
    .optional(),
  filters: z.record(z.any()).optional(),
  sort: z
    .object({
      field: z.string(),
      direction: z.enum(['asc', 'desc']).default('desc'),
    })
    .optional(),
});

// Validation des énumérations
export const roleSchema = z.enum(['USER', 'ADMIN', 'MODERATOR'], {
  errorMap: () => ({ message: "Rôle invalide" }),
});

export const statusSchema = z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'], {
  errorMap: () => ({ message: "Statut invalide" }),
});

// Utilitaires de validation
export const validationUtils = {
  /**
   * Valide un objet avec gestion d'erreurs
   */
  async validateWithErrors<T>(
    schema: z.ZodSchema<T>,
    data: unknown
  ): Promise<{ success: true; data: T } | { success: false; errors: z.ZodError }> {
    try {
      const validData = await schema.parseAsync(data);
      return { success: true, data: validData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, errors: error };
      }
      throw error;
    }
  },

  /**
   * Formate les erreurs Zod pour l'affichage
   */
  formatErrors(errors: z.ZodError): Record<string, string> {
    const formatted: Record<string, string> = {};
    
    errors.errors.forEach((error) => {
      const path = error.path.join('.');
      formatted[path] = error.message;
    });
    
    return formatted;
  },

  /**
   * Valide partiellement un objet (pour les mises à jour)
   */
  partial<T>(schema: z.ZodSchema<T>) {
    return schema.partial();
  },
};

// Types utilitaires
export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; errors: z.ZodError };

export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;`,
  };
}

/**
 * Génère la validation pour le modèle User
 */
function generateUserValidation(config: DatabaseConfig): FileTemplate {
  return {
    path: "shared/validation/models/user.ts",
    content: `import { z } from 'zod';
import { 
  idSchema, 
  emailSchema, 
  nameSchema, 
  imageUrlSchema,
  roleSchema,
  statusSchema,
  dateSchema 
} from '../database';

/**
 * Schémas de validation pour le modèle User
 */

// Schéma de base User
export const userSchema = z.object({
  id: idSchema,
  email: emailSchema,
  name: nameSchema.nullable(),
  image: imageUrlSchema.nullable(),
  role: roleSchema,
  status: statusSchema,
  createdAt: dateSchema,
  updatedAt: dateSchema,${config.features.includes('soft-delete') ? `
  deletedAt: dateSchema.nullable(),` : ''}${config.features.includes('audit-trail') ? `
  createdBy: idSchema.nullable(),
  updatedBy: idSchema.nullable(),` : ''}
});

// Schéma pour la création d'utilisateur
export const createUserSchema = z.object({
  email: emailSchema,
  name: nameSchema.optional(),
  image: imageUrlSchema.optional(),
  role: roleSchema.optional(),
  status: statusSchema.optional(),
});

// Schéma pour la mise à jour d'utilisateur
export const updateUserSchema = createUserSchema.partial();

// Schéma pour la mise à jour du profil utilisateur
export const updateUserProfileSchema = z.object({
  name: nameSchema.optional(),
  image: imageUrlSchema.optional(),
});

// Schéma pour la recherche d'utilisateurs
export const searchUsersSchema = z.object({
  query: z.string().optional(),
  role: roleSchema.optional(),
  status: statusSchema.optional(),
  createdAfter: dateSchema.optional(),
  createdBefore: dateSchema.optional(),
});

// Schéma pour l'authentification
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Le mot de passe est requis" }),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  password: z
    .string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre",
    }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

// Schéma pour le changement de mot de passe
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Le mot de passe actuel est requis" }),
  newPassword: z
    .string()
    .min(8, { message: "Le nouveau mot de passe doit contenir au moins 8 caractères" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre",
    }),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Les nouveaux mots de passe ne correspondent pas",
  path: ["confirmNewPassword"],
});

// Types TypeScript
export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Utilitaires de validation spécifiques aux utilisateurs
export const userValidationUtils = {
  /**
   * Valide un email et vérifie s'il est disponible
   */
  validateEmailAvailability: (email: string, excludeId?: string) => {
    return emailSchema.refine(
      async (email) => {
        // Ici, vous pourriez ajouter une vérification en base de données
        // pour s'assurer que l'email n'est pas déjà utilisé
        return true;
      },
      { message: "Cet email est déjà utilisé" }
    );
  },

  /**
   * Valide les permissions d'un utilisateur
   */
  validateUserPermissions: (userRole: string, requiredRole: string) => {
    const roleHierarchy = { USER: 0, MODERATOR: 1, ADMIN: 2 };
    return roleHierarchy[userRole as keyof typeof roleHierarchy] >= 
           roleHierarchy[requiredRole as keyof typeof roleHierarchy];
  },
};`,
  };
}

/**
 * Génère la validation pour le modèle Post
 */
function generatePostValidation(config: DatabaseConfig): FileTemplate {
  return {
    path: "shared/validation/models/post.ts",
    content: `import { z } from 'zod';
import { idSchema, imageUrlSchema, dateSchema } from '../database';

/**
 * Schémas de validation pour le modèle Post
 */

// Schéma de base Post
export const postSchema = z.object({
  id: idSchema,
  title: z
    .string({ required_error: "Le titre est requis" })
    .min(1, { message: "Le titre ne peut pas être vide" })
    .max(255, { message: "Le titre ne peut pas dépasser 255 caractères" }),
  content: z
    .string()
    .max(10000, { message: "Le contenu ne peut pas dépasser 10000 caractères" })
    .optional(),
  image: imageUrlSchema,
  published: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,${config.features.includes('soft-delete') ? `
  deletedAt: dateSchema.nullable(),` : ''}
  authorId: idSchema,
});

// Schéma pour la création de post
export const createPostSchema = z.object({
  title: z
    .string({ required_error: "Le titre est requis" })
    .min(1, { message: "Le titre ne peut pas être vide" })
    .max(255, { message: "Le titre ne peut pas dépasser 255 caractères" }),
  content: z
    .string()
    .max(10000, { message: "Le contenu ne peut pas dépasser 10000 caractères" })
    .optional(),
  image: imageUrlSchema.optional(),
  published: z.boolean().default(false),
  authorId: idSchema,
});

// Schéma pour la mise à jour de post
export const updatePostSchema = createPostSchema.partial().omit({ authorId: true });

// Schéma pour la publication/dépublication
export const publishPostSchema = z.object({
  published: z.boolean(),
});

// Schéma pour la recherche de posts
export const searchPostsSchema = z.object({
  query: z.string().optional(),
  authorId: idSchema.optional(),
  published: z.boolean().optional(),
  createdAfter: dateSchema.optional(),
  createdBefore: dateSchema.optional(),
  tags: z.array(z.string()).optional(),
});

// Types TypeScript
export type Post = z.infer<typeof postSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PublishPostInput = z.infer<typeof publishPostSchema>;
export type SearchPostsInput = z.infer<typeof searchPostsSchema>;`,
  };
}

/**
 * Génère l'index des validations
 */
function generateValidationIndex(config: DatabaseConfig): FileTemplate {
  const exports: string[] = [];

  exports.push("export * from './database';");

  if (config.models.user) {
    exports.push("export * from './models/user';");
  }

  if (config.models.post) {
    exports.push("export * from './models/post';");
  }

  return {
    path: "shared/validation/models/index.ts",
    content: exports.join('\n'),
  };
}

/**
 * Génère la validation des IDs selon le type de base de données
 */
function getIdValidation(config: DatabaseConfig): string {
  switch (config.database) {
    case "mongodb":
      return `export const idSchema = z
  .string({ required_error: "L'ID est requis" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Format d'ID MongoDB invalide" });`;
    
    case "mysql":
    case "sqlite":
      return `export const idSchema = z
  .number({ invalid_type_error: "L'ID doit être un nombre" })
  .int({ message: "L'ID doit être un entier" })
  .positive({ message: "L'ID doit être positif" });`;
    
    case "postgresql":
    default:
      return `export const idSchema = z
  .string({ required_error: "L'ID est requis" })
  .cuid({ message: "Format d'ID invalide" });`;
  }
}
