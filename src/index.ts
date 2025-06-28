import { generateValidatedBaseProject } from "@/templates/base-project-structure/generator";
import { access, mkdir, writeFile } from "fs/promises";
import { join } from "path";

async function main() {
  const tempDir =
    process.env.OUTPUT_DIR ||
    "C:\\Users\\Administrator\\project\\next-cli\\output";

  try {
    // Generate project with default configuration
    const config = {
      projectName: "free",
      useTypeScript: true,
      useSrcDirectory: true,
      useAppRouter: true,
      packageManager: "pnpm" as const,
    };

    const result = generateValidatedBaseProject(config);

    if ("errors" in result) {
      console.error("Project generation failed:", result.errors.join(", "));
      process.exit(1);
    }

    // Create project directory
    const projectDir = join(tempDir, config.projectName);
    await mkdir(projectDir, { recursive: true });

    // Write all generated files
    for (const file of result.files) {
      const filePath = join(projectDir, file.path);
      const fileDir = join(filePath, "..");

      await mkdir(fileDir, { recursive: true });
      await writeFile(filePath, file.content, "utf-8");
    }

    // Verify essential files
    const essentialFiles = [
      "package.json",
      "tsconfig.json",
      "next.config.ts",
      "postcss.config.ts",
      "app/globals.css",
      "app/layout.tsx",
      "app/page.tsx",
    ];

    for (const file of essentialFiles) {
      const filePath = join(projectDir, file);
      try {
        await access(filePath);
        console.log(`✓ Generated ${file}`);
      } catch {
        console.error(`✗ Failed to generate ${file}`);
        process.exit(1);
      }
    }

    // Print success message and next steps
    console.log("\nProject generated successfully! 🎉");
    console.log("\nNext steps:");
    result.instructions.forEach((instruction, i) => {
      console.log(`${i + 1}. ${instruction}`);
    });
  } catch (error) {
    console.error("Failed to generate project:", error);
    process.exit(1);
  }
}

main();
