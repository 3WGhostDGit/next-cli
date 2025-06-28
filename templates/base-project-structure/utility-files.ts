/**
 * Templates des fichiers utilitaires pour la structure de base
 * Basé sur les patterns d'analyse et les meilleures pratiques
 */

import { FileTemplate } from "../types";

// Interface for the base project configuration
export interface BaseProjectConfig {
  projectName: string;
  useTypeScript: boolean;
  useSrcDirectory: boolean;
  useAppRouter: boolean;
  packageManager: "npm" | "yarn" | "pnpm" | "bun";
}

/**
 * Génère le fichier utils.ts avec les utilitaires de base
 */
export const generateUtils = (config: BaseProjectConfig): FileTemplate => {
  const basePath = config.useSrcDirectory ? "src/lib" : "lib";
  return {
    path: `${basePath}/utils.ts`,
    content: `import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine les classes CSS avec clsx et tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate une date en français
 */
export function formatDate(date: Date | string | number): string {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Formate une date avec l'heure
 */
export function formatDateTime(date: Date | string | number): string {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Génère un slug à partir d'un texte
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Tronque un texte à une longueur donnée
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Capitalise la première lettre d'un texte
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Formate un nombre en devise
 */
export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Génère un ID aléatoire
 */
export function generateId(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Vérifie si une valeur est vide
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Debounce une fonction
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Sleep/delay asynchrone
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}`,
  };
};

/**
 * Génère le fichier constants.ts
 */
export const generateConstants = (config: BaseProjectConfig): FileTemplate => {
  const basePath = config.useSrcDirectory ? "src/lib" : "lib";
  return {
    path: `${basePath}/constants.ts`,
    content: `/**
 * Constantes de l'application
 */

export const APP_CONFIG = {
  name: '${config.projectName}',
  description: 'Une application Next.js moderne avec App Router',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  version: '1.0.0',
  author: 'Your Name',
  email: 'contact@example.com',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  API: {
    AUTH: '/api/auth',
    USERS: '/api/users',
  },
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    SIGNUP: '/api/auth/signup',
    SESSION: '/api/auth/session',
  },
  USERS: {
    ME: '/api/users/me',
    UPDATE: '/api/users/update',
    DELETE: '/api/users/delete',
  },
} as const;

export const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_STATE: 'sidebar-state',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  EMAIL_MAX_LENGTH: 255,
} as const;

export const TIMEOUTS = {
  DEFAULT_REQUEST: 10000, // 10 secondes
  LONG_REQUEST: 30000, // 30 secondes
  DEBOUNCE_SEARCH: 300, // 300ms
} as const;

export const MESSAGES = {
  ERRORS: {
    GENERIC: 'Une erreur inattendue s\'est produite',
    NETWORK: 'Erreur de connexion réseau',
    UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action',
    NOT_FOUND: 'Ressource non trouvée',
    VALIDATION: 'Données invalides',
  },
  SUCCESS: {
    SAVED: 'Enregistré avec succès',
    DELETED: 'Supprimé avec succès',
    UPDATED: 'Mis à jour avec succès',
    CREATED: 'Créé avec succès',
  },
} as const;`,
  };
};

/**
 * Génère le fichier db.ts pour Prisma
 */
export const generateDbClient = (config: BaseProjectConfig): FileTemplate => {
  const basePath = config.useSrcDirectory ? "src/lib" : "lib";
  return {
    path: `${basePath}/db.ts`,
    content: `import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

/**
 * Utilitaires pour les requêtes Prisma
 */

/**
 * Pagination helper
 */
export function getPaginationParams(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  
  return { skip, take };
}

/**
 * Calcule les métadonnées de pagination
 */
export function getPaginationMeta(
  total: number,
  page: number,
  pageSize: number
) {
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  
  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
}

/**
 * Helper pour les requêtes de recherche
 */
export function getSearchFilter(query: string, fields: string[]) {
  if (!query.trim()) return {};
  
  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: query,
        mode: 'insensitive' as const,
      },
    })),
  };
}

/**
 * Helper pour les filtres de date
 */
export function getDateRangeFilter(
  field: string,
  startDate?: Date,
  endDate?: Date
) {
  const filter: any = {};
  
  if (startDate || endDate) {
    filter[field] = {};
    if (startDate) filter[field].gte = startDate;
    if (endDate) filter[field].lte = endDate;
  }
  
  return filter;
}`,
  };
};

/**
 * Génère le hook useLocalStorage
 */
export const generateUseLocalStorage = (
  config: BaseProjectConfig
): FileTemplate => {
  const basePath = config.useSrcDirectory ? "src/hooks" : "hooks";
  return {
    path: `${basePath}/use-local-storage.ts`,
    content: `'use client';

import { useState, useEffect } from 'react';

/**
 * Hook pour gérer le localStorage avec SSR
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // État pour stocker la valeur
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Récupérer la valeur du localStorage au montage
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(\`Erreur lors de la lecture du localStorage pour la clé "\${key}":\`, error);
    }
  }, [key]);

  // Fonction pour mettre à jour la valeur
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permettre à la valeur d'être une fonction pour la même API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Sauvegarder l'état
      setStoredValue(valueToStore);
      
      // Sauvegarder dans le localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(\`Erreur lors de l'écriture dans le localStorage pour la clé "\${key}":\`, error);
    }
  };

  return [storedValue, setValue];
}`,
  };
};

/**
 * Génère le hook useDebounce
 */
export const generateUseDebounce = (
  config: BaseProjectConfig
): FileTemplate => {
  const basePath = config.useSrcDirectory ? "src/hooks" : "hooks";
  return {
    path: `${basePath}/use-debounce.ts`,
    content: `'use client';

import { useState, useEffect } from 'react';

/**
 * Hook pour debouncer une valeur
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}`,
  };
};

/**
 * Génère les types de base
 */
export const generateBaseTypes = (): FileTemplate => {
  return {
    path: "shared/types/index.ts",
    content: `/**
 * Types de base de l'application
 */

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface SearchParams {
  query?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FormState {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

// Types utilitaires
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;`,
  };
};
