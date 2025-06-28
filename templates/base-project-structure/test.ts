/**
 * Tests pour le template de base - Structure de projet
 * Valide la génération correcte de tous les fichiers et configurations
 */

import {
  generateValidatedBaseProject,
  validateProjectConfig,
} from "./generator";
import { BaseProjectConfig } from "./index";

/**
 * Test de validation de configuration
 */
function testConfigValidation() {
  console.log("🧪 Test de validation de configuration...");

  // Configuration valide
  const validConfig: Partial<BaseProjectConfig> = {
    projectName: "my-nextjs-app",
    packageManager: "npm",
    useTypeScript: true,
  };

  const validErrors = validateProjectConfig(validConfig);
  console.assert(
    validErrors.length === 0,
    "Configuration valide devrait passer la validation"
  );

  // Configuration invalide - nom de projet
  const invalidNameConfig: Partial<BaseProjectConfig> = {
    projectName: "My Invalid Project Name!",
  };

  const nameErrors = validateProjectConfig(invalidNameConfig);
  console.assert(
    nameErrors.length > 0,
    "Nom de projet invalide devrait échouer"
  );

  // Configuration invalide - gestionnaire de packages
  const invalidPmConfig: Partial<BaseProjectConfig> = {
    packageManager: "invalid" as any,
  };

  const pmErrors = validateProjectConfig(invalidPmConfig);
  console.assert(
    pmErrors.length > 0,
    "Gestionnaire de packages invalide devrait échouer"
  );

  console.log("✅ Tests de validation réussis");
}

/**
 * Test de génération de projet
 */
function testProjectGeneration() {
  console.log("🧪 Test de génération de projet...");

  const config: Partial<BaseProjectConfig> = {
    projectName: "test-app",
    useTypeScript: true,
    useSrcDirectory: true,
    useAppRouter: true,
    packageManager: "npm",
  };

  const result = generateValidatedBaseProject(config);

  if ("errors" in result) {
    console.error("❌ Erreurs de génération:", result.errors);
    return;
  }

  // Vérifier que tous les fichiers essentiels sont générés
  const essentialFiles = [
    "package.json",
    "tsconfig.json",
    "next.config.ts",
    "tailwind.config.ts",
    "components.json",
    "app/layout.tsx",
    "app/page.tsx",
    "app/globals.css",
    "src/lib/utils.ts",
    "src/lib/constants.ts",
    "shared/types/index.ts",
    "prisma/schema.prisma",
    ".env.example",
    ".gitignore",
    "README.md",
  ];

  for (const file of essentialFiles) {
    const found = result.files.find((f) => f.path === file);
    console.assert(found, `Fichier essentiel manquant: ${file}`);
  }

  // Vérifier le contenu du package.json
  const packageJson = result.files.find((f) => f.path === "package.json");
  if (packageJson) {
    const pkg = JSON.parse(packageJson.content);
    console.assert(
      pkg.name === "test-app",
      "Nom du projet incorrect dans package.json"
    );
    console.assert(pkg.scripts.dev === "next dev", "Script dev manquant");
    console.assert(pkg.dependencies.next, "Dépendance Next.js manquante");
  }

  // Vérifier la configuration TypeScript
  const tsConfig = result.files.find((f) => f.path === "tsconfig.json");
  if (tsConfig) {
    const ts = JSON.parse(tsConfig.content);
    console.assert(ts.compilerOptions.baseUrl === ".", "baseUrl incorrect");
    console.assert(ts.compilerOptions.paths["@/*"], "Path alias @/* manquant");
  }

  console.log("✅ Tests de génération réussis");
  console.log(`📁 ${result.files.length} fichiers générés`);
}

/**
 * Test de structure de répertoires
 */
function testDirectoryStructure() {
  console.log("🧪 Test de structure de répertoires...");

  const result = generateValidatedBaseProject();

  if ("errors" in result) {
    console.error("❌ Erreurs de génération:", result.errors);
    return;
  }

  // Vérifier la structure
  const structure = result.structure;

  console.assert(structure["app/"], "Dossier app/ manquant");
  console.assert(structure["src/"], "Dossier src/ manquant");
  console.assert(structure["shared/"], "Dossier shared/ manquant");
  console.assert(structure["prisma/"], "Dossier prisma/ manquant");

  // Vérifier les sous-dossiers
  console.assert(
    structure["app/"]?.children?.["(auth)/"],
    "Dossier (auth) manquant"
  );
  console.assert(
    structure["src/"]?.children?.["components/"],
    "Dossier components manquant"
  );
  console.assert(
    structure["shared/"]?.children?.["types/"],
    "Dossier types manquant"
  );

  console.log("✅ Tests de structure réussis");
}

/**
 * Test de configuration avec src/ désactivé
 */
function testWithoutSrcDirectory() {
  console.log("🧪 Test sans dossier src/...");

  const config: Partial<BaseProjectConfig> = {
    useSrcDirectory: false,
  };

  const result = generateValidatedBaseProject(config);

  if ("errors" in result) {
    console.error("❌ Erreurs de génération:", result.errors);
    return;
  }

  // Vérifier que les chemins sont ajustés
  const tsConfig = result.files.find((f) => f.path === "tsconfig.json");
  if (tsConfig) {
    const ts = JSON.parse(tsConfig.content);
    console.assert(
      ts.compilerOptions.paths["@/*"][0] === "./*",
      "Path alias incorrect sans src/"
    );
  }

  // Vérifier que les fichiers sont dans les bons dossiers
  const utilsFile = result.files.find((f) => f.path === "lib/utils.ts");
  console.assert(
    utilsFile,
    "Fichier utils.ts devrait être dans lib/ sans src/"
  );

  console.log("✅ Test sans src/ réussi");
}

/**
 * Test de différents gestionnaires de packages
 */
function testPackageManagers() {
  console.log("🧪 Test des gestionnaires de packages...");

  const managers: Array<"npm" | "yarn" | "pnpm" | "bun"> = [
    "npm",
    "yarn",
    "pnpm",
    "bun",
  ];

  for (const pm of managers) {
    const result = generateValidatedBaseProject({ packageManager: pm });

    if ("errors" in result) {
      console.error(`❌ Erreur avec ${pm}:`, result.errors);
      continue;
    }

    // Vérifier que les instructions utilisent le bon gestionnaire
    const hasCorrectInstructions = result.instructions.some((instruction) =>
      instruction.includes(`${pm} install`)
    );
    console.assert(
      hasCorrectInstructions,
      `Instructions incorrectes pour ${pm}`
    );
  }

  console.log("✅ Tests des gestionnaires de packages réussis");
}

/**
 * Test de génération de contenu de fichiers
 */
function testFileContents() {
  console.log("🧪 Test du contenu des fichiers...");

  const result = generateValidatedBaseProject({
    projectName: "test-content-app",
  });

  if ("errors" in result) {
    console.error("❌ Erreurs de génération:", result.errors);
    return;
  }

  // Vérifier le contenu du layout
  const layout = result.files.find((f) => f.path === "app/layout.tsx");
  if (layout) {
    console.assert(
      layout.content.includes("test-content-app"),
      "Nom du projet manquant dans layout"
    );
    console.assert(
      layout.content.includes("export default function RootLayout"),
      "RootLayout manquant"
    );
  }

  // Vérifier le contenu de la page d'accueil
  const homePage = result.files.find((f) => f.path === "app/page.tsx");
  if (homePage) {
    console.assert(
      homePage.content.includes("test-content-app"),
      "Nom du projet manquant dans page"
    );
    console.assert(
      homePage.content.includes("shadcn/ui"),
      "Référence shadcn/ui manquante"
    );
  }

  // Vérifier le schéma Prisma
  const prismaSchema = result.files.find(
    (f) => f.path === "prisma/schema.prisma"
  );
  if (prismaSchema) {
    console.assert(
      prismaSchema.content.includes("model User"),
      "Modèle User manquant"
    );
    console.assert(
      prismaSchema.content.includes("model Session"),
      "Modèle Session manquant"
    );
  }

  console.log("✅ Tests de contenu réussis");
}

/**
 * Exécute tous les tests
 */
function runAllTests() {
  console.log("🚀 Démarrage des tests du template de base...\n");

  try {
    testConfigValidation();
    testProjectGeneration();
    testDirectoryStructure();
    testWithoutSrcDirectory();
    testPackageManagers();
    testFileContents();

    console.log("\n🎉 Tous les tests sont passés avec succès!");
  } catch (error) {
    console.error("\n❌ Échec des tests:", error);
    process.exit(1);
  }
}

/**
 * Exemple d'utilisation du template
 */
function exampleUsage() {
  console.log("\n📖 Exemple d'utilisation du template:\n");

  const config: Partial<BaseProjectConfig> = {
    projectName: "mon-super-projet",
    useTypeScript: true,
    useSrcDirectory: true,
    useAppRouter: true,
    packageManager: "pnpm",
  };

  const result = generateValidatedBaseProject(config);

  if ("errors" in result) {
    console.error("Erreurs:", result.errors);
    return;
  }

  console.log(`✨ Projet généré avec succès!`);
  console.log(`📁 ${result.files.length} fichiers créés`);
  console.log(`📋 ${result.instructions.length} instructions fournies`);

  console.log("\n📝 Premiers fichiers générés:");
  result.files.slice(0, 5).forEach((file) => {
    console.log(`   - ${file.path}`);
  });

  console.log("\n📋 Premières instructions:");
  result.instructions.slice(0, 5).forEach((instruction) => {
    console.log(`   ${instruction}`);
  });
}

// Exécuter les tests si ce fichier est exécuté directement
if (require.main === module) {
  runAllTests();
  exampleUsage();
}

export {
  exampleUsage,
  runAllTests,
  testConfigValidation,
  testDirectoryStructure,
  testFileContents,
  testPackageManagers,
  testProjectGeneration,
  testWithoutSrcDirectory,
};
