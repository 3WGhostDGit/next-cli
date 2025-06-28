/**
 * Test du template de base de données
 * Valide la génération et la cohérence des fichiers
 */

import { generateCompleteDatabase } from "./generator";
import { examples } from "./example";

/**
 * Test de génération basique
 */
function testBasicGeneration() {
  console.log("🧪 Test de génération basique...");

  const config = examples.postgresql();
  const result = generateCompleteDatabase(config, {
    includeExamples: true,
    includeMigrations: true,
    includeTests: true,
  });

  // Vérifications de base
  console.assert(result.files.length > 0, "❌ Aucun fichier généré");
  console.assert(Object.keys(result.packageScripts).length > 0, "❌ Aucun script généré");
  console.assert(Object.keys(result.dependencies).length > 0, "❌ Aucune dépendance générée");
  console.assert(result.instructions.length > 0, "❌ Aucune instruction générée");

  console.log(`✅ ${result.files.length} fichiers générés`);
  console.log(`✅ ${Object.keys(result.packageScripts).length} scripts générés`);
  console.log(`✅ ${Object.keys(result.dependencies).length} dépendances générées`);
}

/**
 * Test de validation des fichiers générés
 */
function testFileValidation() {
  console.log("\n🔍 Test de validation des fichiers...");

  const config = examples.postgresql();
  const result = generateCompleteDatabase(config);

  // Fichiers obligatoires
  const requiredFiles = [
    "prisma/schema.prisma",
    "src/lib/db.ts",
    "shared/types/database.ts",
    "shared/validation/database.ts",
  ];

  requiredFiles.forEach(filePath => {
    const file = result.files.find(f => f.path === filePath);
    console.assert(file, `❌ Fichier manquant: ${filePath}`);
    console.assert(file?.content.length > 0, `❌ Fichier vide: ${filePath}`);
  });

  console.log("✅ Tous les fichiers obligatoires sont présents");
}

/**
 * Test de cohérence du schéma Prisma
 */
function testPrismaSchemaConsistency() {
  console.log("\n📊 Test de cohérence du schéma Prisma...");

  const config = examples.postgresql();
  const result = generateCompleteDatabase(config);

  const schemaFile = result.files.find(f => f.path === "prisma/schema.prisma");
  console.assert(schemaFile, "❌ Schema Prisma manquant");

  const schemaContent = schemaFile!.content;

  // Vérifications du contenu
  console.assert(schemaContent.includes("generator client"), "❌ Generator client manquant");
  console.assert(schemaContent.includes("datasource db"), "❌ Datasource manquant");
  console.assert(schemaContent.includes("provider = \"postgresql\""), "❌ Provider incorrect");

  if (config.models.user) {
    console.assert(schemaContent.includes("model User"), "❌ Modèle User manquant");
  }

  if (config.validation.useZodPrismaTypes) {
    console.assert(schemaContent.includes("generator zod"), "❌ Generator Zod manquant");
  }

  console.log("✅ Schéma Prisma cohérent");
}

/**
 * Test de validation Zod
 */
function testZodValidation() {
  console.log("\n🛡️ Test de validation Zod...");

  const config = examples.postgresql();
  config.validation.useZodPrismaTypes = true;
  
  const result = generateCompleteDatabase(config);

  const validationFile = result.files.find(f => f.path === "shared/validation/database.ts");
  console.assert(validationFile, "❌ Fichier de validation manquant");

  const validationContent = validationFile!.content;
  console.assert(validationContent.includes("import { z }"), "❌ Import Zod manquant");
  console.assert(validationContent.includes("emailSchema"), "❌ Schema email manquant");
  console.assert(validationContent.includes("idSchema"), "❌ Schema ID manquant");

  console.log("✅ Validation Zod configurée");
}

/**
 * Test des extensions Prisma
 */
function testPrismaExtensions() {
  console.log("\n🔧 Test des extensions Prisma...");

  const config = examples.postgresql();
  config.features = ["extensions", "soft-delete", "audit-trail"];
  
  const result = generateCompleteDatabase(config);

  const extensionFiles = result.files.filter(f => f.path.startsWith("prisma/extensions/"));
  console.assert(extensionFiles.length > 0, "❌ Aucune extension générée");

  const mainExtension = result.files.find(f => f.path === "prisma/extensions/index.ts");
  console.assert(mainExtension, "❌ Extension principale manquante");

  if (config.features.includes("soft-delete")) {
    const softDeleteExt = result.files.find(f => f.path === "prisma/extensions/soft-delete.ts");
    console.assert(softDeleteExt, "❌ Extension soft-delete manquante");
  }

  console.log("✅ Extensions Prisma générées");
}

/**
 * Test des différentes bases de données
 */
function testDatabaseSupport() {
  console.log("\n🗄️ Test du support multi-base de données...");

  const databases = ["postgresql", "mysql", "sqlite", "mongodb"] as const;

  databases.forEach(db => {
    const config = examples.postgresql();
    config.database = db;
    
    const result = generateCompleteDatabase(config);
    
    const schemaFile = result.files.find(f => f.path === "prisma/schema.prisma");
    console.assert(schemaFile, `❌ Schema manquant pour ${db}`);
    console.assert(
      schemaFile!.content.includes(`provider = "${db}"`),
      `❌ Provider incorrect pour ${db}`
    );
  });

  console.log("✅ Support multi-base de données validé");
}

/**
 * Test des scripts package.json
 */
function testPackageScripts() {
  console.log("\n📦 Test des scripts package.json...");

  const config = examples.postgresql();
  const result = generateCompleteDatabase(config);

  const requiredScripts = [
    "db:generate",
    "db:migrate",
    "db:push",
    "db:studio",
    "db:seed",
  ];

  requiredScripts.forEach(script => {
    console.assert(
      result.packageScripts[script],
      `❌ Script manquant: ${script}`
    );
  });

  console.log("✅ Scripts package.json générés");
}

/**
 * Test de performance et optimisation
 */
function testPerformanceGeneration() {
  console.log("\n⚡ Test de performance de génération...");

  const startTime = Date.now();
  
  // Générer plusieurs configurations
  const configs = [
    examples.postgresql(),
    examples.sqlite(),
    examples.mysql(),
    examples.mongodb(),
  ];

  configs.forEach((config, index) => {
    const result = generateCompleteDatabase(config, {
      includeExamples: true,
      includeMigrations: true,
      includeTests: true,
    });
    
    console.assert(result.files.length > 0, `❌ Échec génération ${index}`);
  });

  const endTime = Date.now();
  const duration = endTime - startTime;

  console.log(`✅ Génération de ${configs.length} configurations en ${duration}ms`);
  console.assert(duration < 5000, "❌ Génération trop lente (>5s)");
}

/**
 * Exécute tous les tests
 */
function runAllTests() {
  console.log("🚀 Démarrage des tests du template de base de données\n");

  try {
    testBasicGeneration();
    testFileValidation();
    testPrismaSchemaConsistency();
    testZodValidation();
    testPrismaExtensions();
    testDatabaseSupport();
    testPackageScripts();
    testPerformanceGeneration();

    console.log("\n🎉 Tous les tests sont passés avec succès!");
    return true;
  } catch (error) {
    console.error("\n💥 Échec des tests:", error);
    return false;
  }
}

/**
 * Test de démonstration
 */
function demonstrateTemplate() {
  console.log("\n📋 Démonstration du template...");
  
  const demo = examples.demonstrate();
  
  console.log("Configurations générées:");
  Object.entries(demo).forEach(([name, { config, template }]) => {
    console.log(`- ${name}: ${template.files.length} fichiers, ${Object.keys(template.dependencies).length} dépendances`);
  });
}

// Exporter les fonctions de test
export {
  runAllTests,
  demonstrateTemplate,
  testBasicGeneration,
  testFileValidation,
  testPrismaSchemaConsistency,
  testZodValidation,
  testPrismaExtensions,
  testDatabaseSupport,
  testPackageScripts,
  testPerformanceGeneration,
};

// Exécuter les tests si ce fichier est exécuté directement
if (require.main === module) {
  const success = runAllTests();
  demonstrateTemplate();
  process.exit(success ? 0 : 1);
}
