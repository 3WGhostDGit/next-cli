/**
 * Générateur de schémas Prisma avec modèles de base
 * Basé sur les patterns d'analyse et les meilleures pratiques
 */

import { FileTemplate } from "../types";
import { DatabaseConfig } from "./index";

/**
 * Génère les fichiers Prisma (schema.prisma, seed.ts, etc.)
 */
export function generatePrismaFiles(config: DatabaseConfig): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Schema principal
  files.push(generatePrismaSchema(config));

  // Script de seeding
  if (config.features.includes("seeding")) {
    files.push(generateSeedFile(config));
  }

  return files;
}

/**
 * Génère le fichier schema.prisma principal
 */
function generatePrismaSchema(config: DatabaseConfig): FileTemplate {
  const generators = generateGenerators(config);
  const datasource = generateDatasource(config);
  const models = generateModels(config);
  const enums = generateEnums(config);

  return {
    path: "prisma/schema.prisma",
    content: `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

${generators}

${datasource}

${enums}

${models}`,
  };
}

/**
 * Génère la section generators du schema
 */
function generateGenerators(config: DatabaseConfig): string {
  let generators = `generator client {
  provider = "prisma-client-js"
}`;

  if (config.validation.useZodPrismaTypes) {
    generators += `

generator zod {
  provider                         = "zod-prisma-types"
  output                          = "../shared/validation/generated"
  createInputTypes                = ${config.validation.generateInputTypes}
  createModelTypes                = ${config.validation.generateModelTypes}
  createPartialTypes              = ${config.validation.generatePartialTypes}
  addInputTypeValidation          = ${config.validation.customValidators}
  createRelationValuesTypes       = true
  useDefaultValidators            = true
  validateWhereUniqueInput        = true
}`;
  }

  return generators;
}

/**
 * Génère la section datasource du schema
 */
function generateDatasource(config: DatabaseConfig): string {
  return `datasource db {
  provider = "${config.database}"
  url      = env("DATABASE_URL")${
    config.features.includes("multi-schema")
      ? `
  schemas  = ["public", "auth", "analytics"]`
      : ""
  }
}`;
}

/**
 * Génère les énumérations
 */
function generateEnums(config: DatabaseConfig): string {
  let enums = "";

  if (config.models.user) {
    enums += `
enum Role {
  USER
  ADMIN
  MODERATOR

  @@map("roles")
}

enum Status {
  ACTIVE
  INACTIVE
  PENDING
  SUSPENDED

  @@map("statuses")
}`;
  }

  return enums;
}

/**
 * Génère les modèles selon la configuration
 */
function generateModels(config: DatabaseConfig): string {
  let models = "";

  if (config.models.user) {
    models += generateUserModel(config);
  }

  if (config.models.session) {
    models += generateSessionModel(config);
  }

  if (config.models.post) {
    models += generatePostModel(config);
  }

  if (config.models.profile) {
    models += generateProfileModel(config);
  }

  // Modèles personnalisés
  config.models.custom.forEach((modelName) => {
    models += generateCustomModel(modelName, config);
  });

  return models;
}

/**
 * Génère le modèle User avec validation Zod
 */
function generateUserModel(config: DatabaseConfig): string {
  const softDelete = config.features.includes("soft-delete");
  const auditTrail = config.features.includes("audit-trail");
  const zodValidation = config.validation.useZodPrismaTypes;

  return `

model User {
  ${getIdField(config)}
  ${zodValidation ? '/// @zod.string.email({ message: "Email invalide" })' : ""}
  email     String   @unique
  ${
    zodValidation
      ? '/// @zod.string.min(2, { message: "Le nom doit contenir au moins 2 caractères" }).max(50, { message: "Le nom ne peut pas dépasser 50 caractères" })'
      : ""
  }
  name      String?
  ${
    zodValidation
      ? '/// @zod.string.url({ message: "URL d\'image invalide" }).optional()'
      : ""
  }
  image     String?
  role      Role     @default(USER)
  status    Status   @default(ACTIVE)
  ${
    zodValidation
      ? '/// @zod.date({ invalid_type_error: "Date invalide" })'
      : ""
  }
  createdAt DateTime @default(now())
  ${
    zodValidation
      ? '/// @zod.date({ invalid_type_error: "Date invalide" })'
      : ""
  }
  updatedAt DateTime @updatedAt${
    softDelete
      ? `
  deletedAt DateTime?`
      : ""
  }${
    auditTrail
      ? `
  createdBy String?
  updatedBy String?`
      : ""
  }

  // Relations
  sessions  Session[]${
    config.models.post
      ? `
  posts     Post[]`
      : ""
  }${
    config.models.profile
      ? `
  profile   Profile?`
      : ""
  }

  @@map("users")
}`;
}

/**
 * Génère le modèle Session pour l'authentification
 */
function generateSessionModel(config: DatabaseConfig): string {
  const zodValidation = config.validation.useZodPrismaTypes;

  return `

model Session {
  ${getIdField(config)}
  ${
    zodValidation
      ? '/// @zod.string.cuid({ message: "ID utilisateur invalide" })'
      : ""
  }
  userId    String
  ${
    zodValidation
      ? '/// @zod.date.min(new Date(), { message: "La session ne peut pas expirer dans le passé" })'
      : ""
  }
  expiresAt DateTime
  ${
    zodValidation
      ? '/// @zod.date({ invalid_type_error: "Date invalide" })'
      : ""
  }
  createdAt DateTime @default(now())

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}`;
}

/**
 * Génère le modèle Post
 */
function generatePostModel(config: DatabaseConfig): string {
  const softDelete = config.features.includes("soft-delete");
  const zodValidation = config.validation.useZodPrismaTypes;

  return `

model Post {
  ${getIdField(config)}
  ${
    zodValidation
      ? '/// @zod.string.min(1, { message: "Le titre est requis" }).max(255, { message: "Le titre ne peut pas dépasser 255 caractères" })'
      : ""
  }
  title     String   @db.VarChar(255)
  ${zodValidation ? "/// @zod.string.optional()" : ""}
  content   String?
  ${
    zodValidation
      ? '/// @zod.string.url({ message: "URL d\'image invalide" }).optional()'
      : ""
  }
  image     String?
  published Boolean  @default(false)
  ${
    zodValidation
      ? '/// @zod.date({ invalid_type_error: "Date invalide" })'
      : ""
  }
  createdAt DateTime @default(now())
  ${
    zodValidation
      ? '/// @zod.date({ invalid_type_error: "Date invalide" })'
      : ""
  }
  updatedAt DateTime @updatedAt${
    softDelete
      ? `
  deletedAt DateTime?`
      : ""
  }
  ${
    zodValidation
      ? '/// @zod.string.cuid({ message: "ID auteur invalide" })'
      : ""
  }
  authorId  String

  // Relations
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@map("posts")
}`;
}

/**
 * Génère le modèle Profile
 */
function generateProfileModel(config: DatabaseConfig): string {
  const zodValidation = config.validation.useZodPrismaTypes;

  return `

model Profile {
  ${getIdField(config)}
  ${
    zodValidation
      ? '/// @zod.string.max(500, { message: "La bio ne peut pas dépasser 500 caractères" }).optional()'
      : ""
  }
  bio       String?
  ${
    zodValidation
      ? '/// @zod.string.url({ message: "URL de site web invalide" }).optional()'
      : ""
  }
  website   String?
  ${
    zodValidation
      ? '/// @zod.string.max(100, { message: "La localisation ne peut pas dépasser 100 caractères" }).optional()'
      : ""
  }
  location  String?
  ${
    zodValidation
      ? '/// @zod.date({ invalid_type_error: "Date invalide" })'
      : ""
  }
  createdAt DateTime @default(now())
  ${
    zodValidation
      ? '/// @zod.date({ invalid_type_error: "Date invalide" })'
      : ""
  }
  updatedAt DateTime @updatedAt
  ${
    zodValidation
      ? '/// @zod.string.cuid({ message: "ID utilisateur invalide" })'
      : ""
  }
  userId    String   @unique

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}`;
}

/**
 * Génère un modèle personnalisé
 */
function generateCustomModel(
  modelName: string,
  config: DatabaseConfig
): string {
  const zodValidation = config.validation.useZodPrismaTypes;

  return `

model ${modelName} {
  ${getIdField(config)}
  ${
    zodValidation
      ? '/// @zod.string.min(1, { message: "Le nom est requis" })'
      : ""
  }
  name      String
  ${zodValidation ? "/// @zod.string.optional()" : ""}
  description String?
  ${
    zodValidation
      ? '/// @zod.date({ invalid_type_error: "Date invalide" })'
      : ""
  }
  createdAt DateTime @default(now())
  ${
    zodValidation
      ? '/// @zod.date({ invalid_type_error: "Date invalide" })'
      : ""
  }
  updatedAt DateTime @updatedAt

  @@map("${modelName.toLowerCase()}s")
}`;
}

/**
 * Génère le champ ID selon la base de données
 */
function getIdField(config: DatabaseConfig): string {
  switch (config.database) {
    case "mongodb":
      return 'id String @id @default(auto()) @map("_id") @db.ObjectId';
    case "mysql":
    case "sqlite":
      return "id Int @id @default(autoincrement())";
    case "postgresql":
    default:
      return "id String @id @default(cuid())";
  }
}

/**
 * Génère le fichier de seeding
 */
function generateSeedFile(config: DatabaseConfig): FileTemplate {
  return {
    path: "prisma/seed.ts",
    content: `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  ${config.models.user ? generateUserSeeds(config) : ""}
  ${config.models.post ? generatePostSeeds(config) : ""}

  console.log('✅ Database seeded successfully!');
}

${config.models.user ? generateUserSeedsFunction(config) : ""}
${config.models.post ? generatePostSeedsFunction(config) : ""}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });`,
  };
}

function generateUserSeeds(config: DatabaseConfig): string {
  return `  // Créer des utilisateurs de test
  await createUsers();`;
}

function generatePostSeeds(config: DatabaseConfig): string {
  return `  // Créer des posts de test
  await createPosts();`;
}

function generateUserSeedsFunction(config: DatabaseConfig): string {
  return `
async function createUsers() {
  const users = [
    {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
    {
      email: 'user@example.com',
      name: 'Regular User',
      role: 'USER',
    },
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
  }

  console.log('👥 Users created');
}`;
}

function generatePostSeedsFunction(config: DatabaseConfig): string {
  return `
async function createPosts() {
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (!adminUser) return;

  const posts = [
    {
      title: 'Premier article',
      content: 'Contenu du premier article...',
      published: true,
      authorId: adminUser.id,
    },
    {
      title: 'Article en brouillon',
      content: 'Contenu du brouillon...',
      published: false,
      authorId: adminUser.id,
    },
  ];

  for (const postData of posts) {
    await prisma.post.upsert({
      where: { title: postData.title },
      update: {},
      create: postData,
    });
  }

  console.log('📝 Posts created');
}`;
}
