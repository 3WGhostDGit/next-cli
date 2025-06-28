/**
 * Générateur principal du template CRUD
 * Orchestre la génération de tous les fichiers CRUD
 */

import { FileTemplate } from "../types";
import { CRUDConfig } from "./index";
import { generateCRUDTypes } from "./types";
import { generateCRUDSchemas } from "./schemas";
import { generateCRUDUtilities } from "./utilities";

/**
 * Interface pour les options de génération CRUD
 */
export interface CRUDGenerationOptions {
  includeExamples?: boolean;
  includeTests?: boolean;
  includeAPI?: boolean;
  includeBulkActions?: boolean;
  includeExportImport?: boolean;
}

/**
 * Générateur principal CRUD
 */
export class CRUDGenerator {
  constructor(private config: CRUDConfig) {}

  /**
   * Génère le template CRUD complet
   */
  generate(options: CRUDGenerationOptions = {}): {
    files: FileTemplate[];
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    instructions: string[];
  } {
    const files: FileTemplate[] = [];

    // 1. Types TypeScript
    files.push(...generateCRUDTypes(this.config));

    // 2. Schémas de validation Zod
    files.push(...generateCRUDSchemas(this.config));

    // 3. Server Actions principales
    files.push(...this.generateServerActions());

    // 4. Composant de table TanStack
    files.push(this.generateTableComponent());

    // 5. Composants de formulaires
    if (this.config.forms.createForm || this.config.forms.editForm) {
      files.push(...this.generateFormComponents());
    }

    // 6. Actions en lot (optionnel)
    if (options.includeBulkActions && this.config.features.includes('bulk-actions')) {
      files.push(...this.generateBulkActions());
    }

    // 7. Export/Import (optionnel)
    if (options.includeExportImport && (this.config.features.includes('export') || this.config.features.includes('import'))) {
      files.push(...this.generateDataActions());
    }

    // 8. API Routes (optionnel)
    if (options.includeAPI && this.config.api.generateRoutes) {
      files.push(...this.generateAPIRoutes());
    }

    // 9. Hooks personnalisés
    files.push(...this.generateCustomHooks());

    // 10. Composants utilitaires
    files.push(...this.generateUtilityComponents());

    // 11. Utilitaires
    files.push(...generateCRUDUtilities(this.config));

    return {
      files,
      dependencies: this.getDependencies(),
      devDependencies: this.getDevDependencies(),
      instructions: this.getInstructions(),
    };
  }

  /**
   * Génère les Server Actions CRUD
   */
  private generateServerActions(): FileTemplate[] {
    const entityName = this.config.entity.name;
    const entityNameLower = entityName.toLowerCase();

    return [
      {
        path: `src/services/${entityNameLower}/actions.ts`,
        content: this.generateMainActionsContent(),
      },
    ];
  }

  /**
   * Génère le contenu des actions principales
   */
  private generateMainActionsContent(): string {
    const entityName = this.config.entity.name;
    const entityNameLower = entityName.toLowerCase();

    return `"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ${entityNameLower}Schema, ${entityNameLower}UpdateSchema } from "@/shared/validation/${entityNameLower}";
import type { ${entityName}, ${entityName}Create, ${entityName}Update } from "@/shared/types/${entityNameLower}";
import type { ActionResult, PaginatedResult } from "@/shared/types/actions";
${this.config.permissions.enabled ? `import { checkPermission } from "@/lib/permissions";` : ''}

/**
 * Récupère une liste paginée de ${entityName}
 */
export async function get${entityName}List(
  page: number = 1,
  limit: number = 10,
  search?: string,
  filters?: Record<string, any>,
  sort?: { field: string; direction: 'asc' | 'desc' }[]
): Promise<PaginatedResult<${entityName}>> {
  try {
    ${this.config.permissions.enabled ? `await checkPermission('${entityNameLower}', 'read');` : ''}

    // TODO: Implémenter la récupération depuis la base de données
    const items: ${entityName}[] = [];
    const total = 0;

    return {
      success: true,
      data: {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };

  } catch (error) {
    console.error("Erreur lors de la récupération:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des données",
    };
  }
}

/**
 * Crée un nouveau ${entityName}
 */
export async function create${entityName}(
  prevState: ActionResult<${entityName}>,
  formData: FormData
): Promise<ActionResult<${entityName}>> {
  try {
    ${this.config.permissions.enabled ? `await checkPermission('${entityNameLower}', 'create');` : ''}

    const rawData = Object.fromEntries(formData.entries());
    const processedData = processFormData(rawData);

    const validationResult = ${entityNameLower}Schema.safeParse(processedData);

    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
        message: "Données invalides",
      };
    }

    const validatedData = validationResult.data;

    // TODO: Implémenter la création en base de données
    console.log("Données validées pour création:", validatedData);

    revalidatePath("/${entityNameLower}");

    return {
      success: true,
      data: validatedData as ${entityName},
      message: "${entityName} créé avec succès",
    };

  } catch (error) {
    console.error("Erreur lors de la création:", error);
    return {
      success: false,
      error: "Erreur lors de la création",
    };
  }
}

/**
 * Met à jour un ${entityName} existant
 */
export async function update${entityName}(
  id: string,
  prevState: ActionResult<${entityName}>,
  formData: FormData
): Promise<ActionResult<${entityName}>> {
  try {
    ${this.config.permissions.enabled ? `await checkPermission('${entityNameLower}', 'update');` : ''}

    const rawData = Object.fromEntries(formData.entries());
    const processedData = processFormData(rawData);

    const validationResult = ${entityNameLower}UpdateSchema.safeParse(processedData);

    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
        message: "Données invalides",
      };
    }

    const validatedData = validationResult.data;

    // TODO: Implémenter la mise à jour
    console.log("Données validées pour mise à jour:", validatedData);

    revalidatePath("/${entityNameLower}");
    revalidatePath(\`/${entityNameLower}/\${id}\`);

    return {
      success: true,
      data: validatedData as ${entityName},
      message: "${entityName} mis à jour avec succès",
    };

  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour",
    };
  }
}

/**
 * Supprime un ${entityName}
 */
export async function delete${entityName}(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    ${this.config.permissions.enabled ? `await checkPermission('${entityNameLower}', 'delete');` : ''}

    // TODO: Implémenter la suppression
    console.log("Suppression de l'élément:", id);

    revalidatePath("/${entityNameLower}");

    return {
      success: true,
      data: { id },
      message: "${entityName} supprimé avec succès",
    };

  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression",
    };
  }
}

/**
 * Traite les données du formulaire pour les convertir aux bons types
 */
function processFormData(rawData: Record<string, any>): Record<string, any> {
  const processed = { ...rawData };

  ${this.generateDataProcessing()}

  return processed;
}`;
  }

  /**
   * Génère le composant de table TanStack
   */
  private generateTableComponent(): FileTemplate {
    const entityName = this.config.entity.name;
    const entityNameLower = entityName.toLowerCase();

    return {
      path: `src/components/${entityNameLower}/${entityNameLower}-table.tsx`,
      content: this.generateTableContent(),
    };
  }

  /**
   * Génère le contenu du composant de table
   */
  private generateTableContent(): string {
    const entityName = this.config.entity.name;
    const entityNameLower = entityName.toLowerCase();

    return `"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Edit, Trash } from "lucide-react";

import type { ${entityName} } from "@/shared/types/${entityNameLower}";
import { delete${entityName} } from "@/services/${entityNameLower}/actions";

interface ${entityName}TableProps {
  data: ${entityName}[];
  loading?: boolean;
  onEdit?: (item: ${entityName}) => void;
  onCreate?: () => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function ${entityName}Table({
  data,
  loading = false,
  onEdit,
  onCreate,
  onDelete,
  className,
}: ${entityName}TableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns: ColumnDef<${entityName}>[] = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Sélectionner tout"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Sélectionner la ligne"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    ${this.generateTableColumns()}
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete?.(row.original.id)}>
              <Trash className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ], [onEdit, onDelete]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
  });

  return (
    <div className="space-y-4">
      {/* Barre d'outils */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Rechercher..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Créer
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {loading ? "Chargement..." : "Aucun résultat."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} sur{" "}
          {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}`;
  }

  /**
   * Génère les colonnes de la table
   */
  private generateTableColumns(): string {
    const tableFields = this.config.entity.fields.filter(field => field.display.showInTable);
    
    return tableFields.map(field => {
      const sortable = field.sortable && this.config.table.sorting.enabled;
      let cellContent = `row.getValue("${field.name}")`;

      // Formatage selon le type
      switch (field.type) {
        case 'date':
        case 'datetime':
          cellContent = `new Date(${cellContent}).toLocaleDateString()`;
          break;
        case 'boolean':
          cellContent = `${cellContent} ? "Oui" : "Non"`;
          break;
        case 'email':
          cellContent = `<a href={\`mailto:\${${cellContent}}\`} className="text-blue-600 hover:underline">{${cellContent}}</a>`;
          break;
      }

      return `    {
      accessorKey: "${field.name}",
      header: ${sortable ? `({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ${field.displayName}
          {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
        </Button>
      )` : `"${field.displayName}"`},
      cell: ({ row }) => ${cellContent},${field.display.tableWidth ? `
      size: ${field.display.tableWidth},` : ''}
    },`;
    }).join('\n');
  }

  /**
   * Génère les composants de formulaires
   */
  private generateFormComponents(): FileTemplate[] {
    // Utilise le générateur de formulaires existant
    return [];
  }

  /**
   * Génère les actions en lot
   */
  private generateBulkActions(): FileTemplate[] {
    return [];
  }

  /**
   * Génère les actions d'export/import
   */
  private generateDataActions(): FileTemplate[] {
    return [];
  }

  /**
   * Génère les API Routes
   */
  private generateAPIRoutes(): FileTemplate[] {
    return [];
  }

  /**
   * Génère les hooks personnalisés
   */
  private generateCustomHooks(): FileTemplate[] {
    return [];
  }

  /**
   * Génère les composants utilitaires
   */
  private generateUtilityComponents(): FileTemplate[] {
    return [];
  }

  /**
   * Génère le traitement des données selon les types de champs
   */
  private generateDataProcessing(): string {
    const processing: string[] = [];

    this.config.entity.fields.forEach(field => {
      switch (field.type) {
        case 'number':
          processing.push(`  if (processed.${field.name}) {
    processed.${field.name} = Number(processed.${field.name});
  }`);
          break;

        case 'boolean':
          processing.push(`  processed.${field.name} = processed.${field.name} === 'on' || processed.${field.name} === 'true';`);
          break;

        case 'date':
        case 'datetime':
          processing.push(`  if (processed.${field.name}) {
    processed.${field.name} = new Date(processed.${field.name});
  }`);
          break;
      }
    });

    return processing.join('\n\n');
  }

  /**
   * Retourne les dépendances nécessaires
   */
  private getDependencies(): Record<string, string> {
    return {
      "@tanstack/react-table": "^8.10.7",
      "lucide-react": "^0.294.0",
    };
  }

  /**
   * Retourne les dépendances de développement
   */
  private getDevDependencies(): Record<string, string> {
    return {};
  }

  /**
   * Retourne les instructions d'installation
   */
  private getInstructions(): string[] {
    return [
      "1. Installer les dépendances: pnpm add @tanstack/react-table lucide-react",
      "2. Installer les composants shadcn/ui: npx shadcn@latest add table checkbox button input select dropdown-menu",
      "3. Configurer les types dans shared/types/",
      "4. Implémenter les Server Actions dans src/services/",
      "5. Utiliser les composants générés dans vos pages",
    ];
  }
}
