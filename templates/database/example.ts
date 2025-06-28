/**
 * Exemple d'utilisation du template de base de données
 * Démontre comment configurer et utiliser le template
 */

import { generateCompleteDatabase, DatabaseGenerationOptions } from "./generator";
import { DatabaseConfig } from "./index";

/**
 * Exemple 1: Configuration PostgreSQL complète avec toutes les fonctionnalités
 */
export function examplePostgreSQLComplete(): DatabaseConfig {
  return {
    projectName: "my-fullstack-app",
    database: "postgresql",
    orm: "prisma",
    features: [
      "migrations",
      "seeding",
      "relations",
      "soft-delete",
      "audit-trail",
      "zod-validation",
      "extensions",
    ],
    models: {
      user: true,
      session: true,
      post: true,
      profile: true,
      custom: ["Category", "Tag", "Comment"],
    },
    validation: {
      useZodPrismaTypes: true,
      generateInputTypes: true,
      generateModelTypes: true,
      generatePartialTypes: true,
      customValidators: true,
    },
    performance: {
      connectionPooling: true,
      queryOptimization: true,
      indexing: true,
      caching: true,
    },
    security: {
      rowLevelSecurity: true,
      dataEncryption: false,
      auditLogging: true,
    },
  };
}

/**
 * Exemple 2: Configuration SQLite simple pour prototypage
 */
export function exampleSQLiteSimple(): DatabaseConfig {
  return {
    projectName: "prototype-app",
    database: "sqlite",
    orm: "prisma",
    features: [
      "migrations",
      "seeding",
      "relations",
      "zod-validation",
    ],
    models: {
      user: true,
      session: false,
      post: true,
      profile: false,
      custom: [],
    },
    validation: {
      useZodPrismaTypes: true,
      generateInputTypes: true,
      generateModelTypes: true,
      generatePartialTypes: false,
      customValidators: false,
    },
    performance: {
      connectionPooling: false,
      queryOptimization: false,
      indexing: true,
      caching: false,
    },
    security: {
      rowLevelSecurity: false,
      dataEncryption: false,
      auditLogging: false,
    },
  };
}

/**
 * Exemple 3: Configuration MySQL pour e-commerce
 */
export function exampleMySQLEcommerce(): DatabaseConfig {
  return {
    projectName: "ecommerce-platform",
    database: "mysql",
    orm: "prisma",
    features: [
      "migrations",
      "seeding",
      "relations",
      "soft-delete",
      "zod-validation",
      "extensions",
    ],
    models: {
      user: true,
      session: true,
      post: false,
      profile: true,
      custom: [
        "Product",
        "Category",
        "Order",
        "OrderItem",
        "Cart",
        "CartItem",
        "Payment",
        "Address",
      ],
    },
    validation: {
      useZodPrismaTypes: true,
      generateInputTypes: true,
      generateModelTypes: true,
      generatePartialTypes: true,
      customValidators: true,
    },
    performance: {
      connectionPooling: true,
      queryOptimization: true,
      indexing: true,
      caching: true,
    },
    security: {
      rowLevelSecurity: false,
      dataEncryption: true,
      auditLogging: true,
    },
  };
}

/**
 * Exemple 4: Configuration MongoDB pour CMS
 */
export function exampleMongoDBCMS(): DatabaseConfig {
  return {
    projectName: "headless-cms",
    database: "mongodb",
    orm: "prisma",
    features: [
      "seeding",
      "relations",
      "zod-validation",
    ],
    models: {
      user: true,
      session: true,
      post: true,
      profile: true,
      custom: [
        "Page",
        "Media",
        "Menu",
        "Setting",
        "Template",
      ],
    },
    validation: {
      useZodPrismaTypes: true,
      generateInputTypes: true,
      generateModelTypes: true,
      generatePartialTypes: false,
      customValidators: true,
    },
    performance: {
      connectionPooling: true,
      queryOptimization: false,
      indexing: true,
      caching: false,
    },
    security: {
      rowLevelSecurity: false,
      dataEncryption: false,
      auditLogging: false,
    },
  };
}

/**
 * Fonction de démonstration complète
 */
export function demonstrateTemplateUsage() {
  console.log("🗄️ Démonstration du template de base de données\n");

  // Exemple 1: PostgreSQL complet
  console.log("📊 Exemple 1: PostgreSQL avec toutes les fonctionnalités");
  const postgresConfig = examplePostgreSQLComplete();
  const postgresOptions: DatabaseGenerationOptions = {
    includeExamples: true,
    includeMigrations: true,
    includeTests: true,
  };

  const postgresTemplate = generateCompleteDatabase(postgresConfig, postgresOptions);
  console.log(`- Fichiers générés: ${postgresTemplate.files.length}`);
  console.log(`- Scripts package.json: ${Object.keys(postgresTemplate.packageScripts).length}`);
  console.log(`- Dépendances: ${Object.keys(postgresTemplate.dependencies).length}`);
  console.log(`- Instructions: ${postgresTemplate.instructions.length} étapes\n`);

  // Exemple 2: SQLite simple
  console.log("🪶 Exemple 2: SQLite pour prototypage");
  const sqliteConfig = exampleSQLiteSimple();
  const sqliteOptions: DatabaseGenerationOptions = {
    includeExamples: false,
    includeMigrations: false,
    includeTests: false,
  };

  const sqliteTemplate = generateCompleteDatabase(sqliteConfig, sqliteOptions);
  console.log(`- Fichiers générés: ${sqliteTemplate.files.length}`);
  console.log(`- Configuration minimale pour démarrage rapide\n`);

  // Exemple 3: MySQL e-commerce
  console.log("🛒 Exemple 3: MySQL pour e-commerce");
  const mysqlConfig = exampleMySQLEcommerce();
  const mysqlOptions: DatabaseGenerationOptions = {
    includeExamples: true,
    includeMigrations: true,
    includeTests: true,
    customModels: mysqlConfig.models.custom,
  };

  const mysqlTemplate = generateCompleteDatabase(mysqlConfig, mysqlOptions);
  console.log(`- Modèles personnalisés: ${mysqlConfig.models.custom.length}`);
  console.log(`- Sécurité renforcée avec chiffrement\n`);

  // Exemple 4: MongoDB CMS
  console.log("📝 Exemple 4: MongoDB pour CMS");
  const mongoConfig = exampleMongoDBCMS();
  const mongoOptions: DatabaseGenerationOptions = {
    includeExamples: true,
    includeMigrations: false, // MongoDB n'utilise pas les migrations traditionnelles
    includeTests: true,
  };

  const mongoTemplate = generateCompleteDatabase(mongoConfig, mongoOptions);
  console.log(`- Optimisé pour le contenu flexible\n`);

  return {
    postgres: { config: postgresConfig, template: postgresTemplate },
    sqlite: { config: sqliteConfig, template: sqliteTemplate },
    mysql: { config: mysqlConfig, template: mysqlTemplate },
    mongodb: { config: mongoConfig, template: mongoTemplate },
  };
}

/**
 * Exemple d'utilisation avec CLI
 */
export function generateForCLI(
  database: "postgresql" | "mysql" | "sqlite" | "mongodb",
  features: string[] = [],
  models: string[] = []
) {
  const baseConfig: DatabaseConfig = {
    projectName: "cli-generated-app",
    database,
    orm: "prisma",
    features: features.includes("all") 
      ? ["migrations", "seeding", "relations", "soft-delete", "audit-trail", "zod-validation", "extensions"]
      : features as any,
    models: {
      user: true,
      session: true,
      post: models.includes("post") || models.length === 0,
      profile: models.includes("profile") || models.length === 0,
      custom: models.filter(m => !["user", "session", "post", "profile"].includes(m)),
    },
    validation: {
      useZodPrismaTypes: true,
      generateInputTypes: true,
      generateModelTypes: true,
      generatePartialTypes: features.includes("partial-types"),
      customValidators: true,
    },
    performance: {
      connectionPooling: database !== "sqlite",
      queryOptimization: features.includes("optimization"),
      indexing: true,
      caching: features.includes("caching"),
    },
    security: {
      rowLevelSecurity: features.includes("rls"),
      dataEncryption: features.includes("encryption"),
      auditLogging: features.includes("audit"),
    },
  };

  const options: DatabaseGenerationOptions = {
    includeExamples: features.includes("examples"),
    includeMigrations: database !== "mongodb",
    includeTests: features.includes("tests"),
    customModels: baseConfig.models.custom,
  };

  return generateCompleteDatabase(baseConfig, options);
}

// Exporter les exemples pour utilisation
export const examples = {
  postgresql: examplePostgreSQLComplete,
  sqlite: exampleSQLiteSimple,
  mysql: exampleMySQLEcommerce,
  mongodb: exampleMongoDBCMS,
  demonstrate: demonstrateTemplateUsage,
  generateForCLI,
};
