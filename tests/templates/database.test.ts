/**
 * Tests pour le template de base de données
 * Valide la génération correcte de tous les fichiers et configurations Prisma
 */

import { beforeEach, describe, expect, it } from "vitest";
import { testUtils } from "../setup";

// Import the actual template functions
import { examples } from "../../templates/database/example";
import { generateCompleteDatabase } from "../../templates/database/generator";
import {
  defaultDatabaseConfig,
  generateDatabaseTemplate,
} from "../../templates/database/index";

describe("Database Template", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await testUtils.createTempDir("database-");
  });

  describe("Configuration Validation", () => {
    it("should use default configuration correctly", () => {
      const config = defaultDatabaseConfig;

      expect(config.database).toBe("postgresql");
      expect(config.orm).toBe("prisma");
      expect(config.models.user).toBe(true);
      expect(config.validation.useZodPrismaTypes).toBe(true);
    });

    it("should generate template with valid configuration", () => {
      const config = examples.postgresql();
      const template = generateDatabaseTemplate(config);

      expect(template.files.length).toBeGreaterThan(0);
      expect(template.packageScripts).toBeDefined();
      expect(template.instructions).toBeDefined();
      expect(template.structure).toBeDefined();
    });
  });

  describe("Project Generation", () => {
    it("should generate a complete database project", () => {
      const config = examples.postgresql();
      const result = generateCompleteDatabase(config, {
        includeExamples: true,
        includeMigrations: true,
        includeTests: true,
      });

      expect(result.files.length).toBeGreaterThan(0);
      expect(Object.keys(result.packageScripts).length).toBeGreaterThan(0);
      expect(result.instructions.length).toBeGreaterThan(0);
      expect(result.instructions.length).toBeGreaterThan(0);
    });

    it("should include all essential database files", () => {
      const config = examples.postgresql();
      const result = generateCompleteDatabase(config);

      const essentialFiles = [
        "prisma/schema.prisma",
        "src/lib/db.ts",
        "shared/types/database.ts",
        "shared/validation/database.ts",
      ];

      for (const file of essentialFiles) {
        const found = result.files.find((f) => f.path === file);
        expect(found, `Essential file missing: ${file}`).toBeDefined();
        expect(found?.content.length, `File is empty: ${file}`).toBeGreaterThan(
          0
        );
      }
    });
  });

  describe("Prisma Schema Generation", () => {
    it("should generate correct PostgreSQL schema", () => {
      const config = examples.postgresql();
      const result = generateCompleteDatabase(config);

      const schemaFile = result.files.find(
        (f) => f.path === "prisma/schema.prisma"
      );
      expect(schemaFile).toBeDefined();

      const content = schemaFile!.content;
      expect(content).toContain("generator client");
      expect(content).toContain("datasource db");
      expect(content).toContain('provider = "postgresql"');
      expect(content).toContain("model User");
    });

    it("should include Zod generator when enabled", () => {
      const config = examples.postgresql();
      config.validation.useZodPrismaTypes = true;

      const result = generateCompleteDatabase(config);
      const schemaFile = result.files.find(
        (f) => f.path === "prisma/schema.prisma"
      );

      expect(schemaFile).toBeDefined();
      const content = schemaFile!.content;
      if (config.validation.useZodPrismaTypes) {
        expect(content).toContain("generator zod");
      }
    });

    it("should handle different database providers", () => {
      const databases = ["postgresql", "mysql", "sqlite", "mongodb"] as const;

      databases.forEach((db) => {
        const config = examples[db]();
        const result = generateCompleteDatabase(config);

        const schemaFile = result.files.find(
          (f) => f.path === "prisma/schema.prisma"
        );
        expect(schemaFile, `Schema missing for ${db}`).toBeDefined();
        expect(schemaFile!.content).toContain(`provider = "${db}"`);
      });
    });
  });

  describe("Database Client Generation", () => {
    it("should generate correct database client", () => {
      const config = examples.postgresql();
      const result = generateCompleteDatabase(config);

      const dbFile = result.files.find((f) => f.path === "src/lib/db.ts");
      expect(dbFile).toBeDefined();

      const content = dbFile!.content;
      expect(content).toContain("PrismaClient");
      expect(content).toContain("export const db");
    });
  });

  describe("Type Generation", () => {
    it("should generate TypeScript types", () => {
      const config = examples.postgresql();
      const result = generateCompleteDatabase(config);

      const typesFile = result.files.find(
        (f) => f.path === "shared/types/database.ts"
      );
      expect(typesFile).toBeDefined();

      const content = typesFile!.content;
      expect(content).toContain("export");
      expect(content.length).toBeGreaterThan(0);
    });
  });

  describe("Validation Generation", () => {
    it("should generate Zod validation schemas", () => {
      const config = examples.postgresql();
      config.validation.useZodPrismaTypes = true;

      const result = generateCompleteDatabase(config);

      const validationFile = result.files.find(
        (f) => f.path === "shared/validation/database.ts"
      );
      expect(validationFile).toBeDefined();

      const content = validationFile!.content;
      expect(content).toContain("import { z }");
    });
  });

  describe("Package Scripts Generation", () => {
    it("should generate all required database scripts", () => {
      const config = examples.postgresql();
      const result = generateCompleteDatabase(config);

      const requiredScripts = [
        "db:generate",
        "db:migrate",
        "db:push",
        "db:studio",
        "db:seed",
      ];

      requiredScripts.forEach((script) => {
        expect(
          result.packageScripts[script],
          `Missing script: ${script}`
        ).toBeDefined();
      });
    });
  });

  describe("Dependencies Generation", () => {
    it("should include required Prisma scripts", () => {
      const config = examples.postgresql();
      const result = generateCompleteDatabase(config);

      expect(result.packageScripts["db:generate"]).toBeDefined();
      expect(result.packageScripts["db:push"]).toBeDefined();
    });
  });

  describe("Features Support", () => {
    it("should handle migrations feature", () => {
      const config = examples.postgresql();
      config.features = ["migrations"];

      const result = generateCompleteDatabase(config, {
        includeMigrations: true,
      });

      expect(result.files.length).toBeGreaterThan(0);
      expect(result.packageScripts["db:migrate"]).toBeDefined();
    });

    it("should handle seeding feature", () => {
      const config = examples.postgresql();
      config.features = ["seeding"];

      const result = generateCompleteDatabase(config);

      expect(result.files.length).toBeGreaterThan(0);
      expect(result.packageScripts["db:seed"]).toBeDefined();
    });
  });

  describe("Performance Tests", () => {
    it("should generate multiple configurations quickly", () => {
      const startTime = Date.now();

      const configs = [
        examples.postgresql(),
        examples.mysql(),
        examples.sqlite(),
        examples.mongodb(),
      ];

      configs.forEach((config, index) => {
        const result = generateCompleteDatabase(config, {
          includeExamples: true,
          includeMigrations: true,
          includeTests: true,
        });

        expect(
          result.files.length,
          `Generation failed for config ${index}`
        ).toBeGreaterThan(0);
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration, "Generation too slow (>5s)").toBeLessThan(5000);
    });
  });

  describe("Instructions Generation", () => {
    it("should include comprehensive setup instructions", () => {
      const config = examples.postgresql();
      const result = generateCompleteDatabase(config);

      expect(result.instructions.length).toBeGreaterThan(0);

      const instructions = result.instructions.join(" ");
      expect(instructions.length).toBeGreaterThan(0);
    });
  });

  describe("Examples Integration", () => {
    it("should provide working examples for all database types", () => {
      const exampleConfigs = {
        postgresql: examples.postgresql(),
        mysql: examples.mysql(),
        sqlite: examples.sqlite(),
        mongodb: examples.mongodb(),
      };

      Object.entries(exampleConfigs).forEach(([dbType, config]) => {
        expect(config.database).toBe(dbType);
        expect(config.projectName).toBeDefined();
        expect(config.models).toBeDefined();

        const result = generateCompleteDatabase(config);
        expect(
          result.files.length,
          `No files generated for ${dbType}`
        ).toBeGreaterThan(0);
      });
    });
  });
});
