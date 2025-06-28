/**
 * Générateur de composants de table avec TanStack Table et shadcn/ui
 * Crée des tables complètes avec pagination, tri, filtrage et actions
 */

import { CRUDConfig, EntityField, TableAction } from './index';
import { FileTemplate } from '../types';

/**
 * Générateur de composants de table
 */
export class TableGenerator {
  constructor(private config: CRUDConfig) {}

  /**
   * Génère le composant de table principal
   */
  generate(): FileTemplate {
    return {
      path: `src/components/${this.config.entity.name.toLowerCase()}/${this.config.entity.name.toLowerCase()}-table.tsx`,
      content: this.generateTableComponent(),
    };
  }

  /**
   * Génère le contenu du composant de table
   */
  private generateTableComponent(): string {
    const imports = this.generateImports();
    const component = this.generateComponentContent();

    return `${imports}

${component}`;
  }

  /**
   * Génère les imports nécessaires
   */
  private generateImports(): string {
    const baseImports = [
      '"use client";',
      '',
      'import { useState, useMemo } from "react";',
      'import {',
      '  ColumnDef,',
      '  flexRender,',
      '  getCoreRowModel,',
      '  useReactTable,',
    ];

    // Imports conditionnels selon les fonctionnalités
    if (this.config.table.pagination.enabled) {
      baseImports.push('  getPaginationRowModel,');
    }

    if (this.config.table.sorting.enabled) {
      baseImports.push('  getSortedRowModel,');
      baseImports.push('  SortingState,');
    }

    if (this.config.table.filtering.enabled) {
      baseImports.push('  getFilteredRowModel,');
      baseImports.push('  ColumnFiltersState,');
      baseImports.push('  GlobalFilterState,');
    }

    if (this.config.table.selection.enabled) {
      baseImports.push('  RowSelectionState,');
    }

    baseImports.push('} from "@tanstack/react-table";');

    // Imports shadcn/ui
    const uiImports = [
      'import {',
      '  Table,',
      '  TableBody,',
      '  TableCell,',
      '  TableHead,',
      '  TableHeader,',
      '  TableRow,',
      '} from "@/components/ui/table";',
      'import { Button } from "@/components/ui/button";',
      'import { Input } from "@/components/ui/input";',
    ];

    if (this.config.table.selection.enabled) {
      uiImports.splice(-1, 0, 'import { Checkbox } from "@/components/ui/checkbox";');
    }

    // Imports pour les actions
    const actionImports = [
      'import {',
      '  DropdownMenu,',
      '  DropdownMenuContent,',
      '  DropdownMenuItem,',
      '  DropdownMenuTrigger,',
      '} from "@/components/ui/dropdown-menu";',
      'import { MoreHorizontal, Plus, Edit, Trash } from "lucide-react";',
    ];

    // Imports des types et actions
    const typeImports = [
      `import type { ${this.config.entity.name} } from "@/shared/types/${this.config.entity.name.toLowerCase()}";`,
      `import { delete${this.config.entity.name} } from "@/services/${this.config.entity.name.toLowerCase()}/actions";`,
    ];

    return [...baseImports, '', ...uiImports, '', ...actionImports, '', ...typeImports].join('\n');
  }

  /**
   * Génère le contenu du composant
   */
  private generateComponentContent(): string {
    const entityName = this.config.entity.name;
    const entityNameLower = entityName.toLowerCase();

    const propsInterface = this.generatePropsInterface();
    const stateManagement = this.generateStateManagement();
    const columns = this.generateColumns();
    const tableConfig = this.generateTableConfig();
    const render = this.generateRender();

    return `${propsInterface}

export function ${entityName}Table({
  data,
  loading = false,
  onEdit,
  onCreate,
  onDelete,
  className,
}: ${entityName}TableProps) {
${stateManagement}

${columns}

${tableConfig}

${render}
}`;
  }

  /**
   * Génère l'interface des props
   */
  private generatePropsInterface(): string {
    const entityName = this.config.entity.name;

    return `interface ${entityName}TableProps {
  data: ${entityName}[];
  loading?: boolean;
  onEdit?: (item: ${entityName}) => void;
  onCreate?: () => void;
  onDelete?: (id: string) => void;
  className?: string;
}`;
  }

  /**
   * Génère la gestion d'état
   */
  private generateStateManagement(): string {
    const states: string[] = [];

    if (this.config.table.sorting.enabled) {
      states.push('  const [sorting, setSorting] = useState<SortingState>([]);');
    }

    if (this.config.table.filtering.enabled) {
      states.push('  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);');
      if (this.config.table.filtering.globalSearch) {
        states.push('  const [globalFilter, setGlobalFilter] = useState<string>("");');
      }
    }

    if (this.config.table.selection.enabled) {
      states.push('  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});');
    }

    return states.join('\n');
  }

  /**
   * Génère la définition des colonnes
   */
  private generateColumns(): string {
    const entityName = this.config.entity.name;
    const columns: string[] = [];

    // Colonne de sélection
    if (this.config.table.selection.enabled) {
      columns.push(`    {
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
    },`);
    }

    // Colonnes des champs
    const tableFields = this.config.entity.fields.filter(field => field.display.showInTable);
    tableFields.forEach(field => {
      columns.push(this.generateFieldColumn(field));
    });

    // Colonne d'actions
    const rowActions = this.config.table.actions.filter(action => action.type === 'row');
    if (rowActions.length > 0) {
      columns.push(this.generateActionsColumn(rowActions));
    }

    return `  const columns: ColumnDef<${entityName}>[] = useMemo(() => [
${columns.join('\n')}
  ], [onEdit, onDelete]);`;
  }

  /**
   * Génère une colonne pour un champ
   */
  private generateFieldColumn(field: EntityField): string {
    const accessor = field.name;
    const header = field.displayName;
    const sortable = field.sortable && this.config.table.sorting.enabled;

    let cellContent = `row.getValue("${accessor}")`;

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
      case 'url':
        cellContent = `<a href={${cellContent}} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{${cellContent}}</a>`;
        break;
    }

    return `    {
      accessorKey: "${accessor}",
      header: ${sortable ? `({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ${header}
          {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
        </Button>
      )` : `"${header}"`},
      cell: ({ row }) => ${cellContent},${field.display.tableWidth ? `
      size: ${field.display.tableWidth},` : ''}
    },`;
  }

  /**
   * Génère la colonne d'actions
   */
  private generateActionsColumn(actions: TableAction[]): string {
    const actionItems = actions.map(action => {
      const onClick = action.name === 'edit' ? 'onEdit?.(row.original)' : 
                     action.name === 'delete' ? 'onDelete?.(row.original.id)' : 
                     `console.log('${action.name}', row.original)`;

      return `            <DropdownMenuItem onClick={() => ${onClick}}>
              ${action.icon ? `<${action.icon} className="mr-2 h-4 w-4" />` : ''}
              ${action.label}
            </DropdownMenuItem>`;
    }).join('\n');

    return `    {
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
${actionItems}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      enableHiding: false,
    },`;
  }

  /**
   * Génère la configuration de la table
   */
  private generateTableConfig(): string {
    const config: string[] = [
      '  const table = useReactTable({',
      '    data,',
      '    columns,',
      '    getCoreRowModel: getCoreRowModel(),',
    ];

    if (this.config.table.pagination.enabled) {
      config.push('    getPaginationRowModel: getPaginationRowModel(),');
    }

    if (this.config.table.sorting.enabled) {
      config.push('    getSortedRowModel: getSortedRowModel(),');
      config.push('    onSortingChange: setSorting,');
    }

    if (this.config.table.filtering.enabled) {
      config.push('    getFilteredRowModel: getFilteredRowModel(),');
      config.push('    onColumnFiltersChange: setColumnFilters,');
      if (this.config.table.filtering.globalSearch) {
        config.push('    onGlobalFilterChange: setGlobalFilter,');
      }
    }

    if (this.config.table.selection.enabled) {
      config.push('    enableRowSelection: true,');
      config.push('    onRowSelectionChange: setRowSelection,');
    }

    config.push('    state: {');
    const stateProps: string[] = [];
    
    if (this.config.table.sorting.enabled) stateProps.push('      sorting');
    if (this.config.table.filtering.enabled) {
      stateProps.push('      columnFilters');
      if (this.config.table.filtering.globalSearch) stateProps.push('      globalFilter');
    }
    if (this.config.table.selection.enabled) stateProps.push('      rowSelection');

    config.push(stateProps.join(',\n') + ',');
    config.push('    },');
    config.push('  });');

    return config.join('\n');
  }

  /**
   * Génère le rendu du composant
   */
  private generateRender(): string {
    const globalActions = this.config.table.actions.filter(action => action.type === 'global');
    const hasGlobalSearch = this.config.table.filtering.enabled && this.config.table.filtering.globalSearch;
    const hasPagination = this.config.table.pagination.enabled;

    return `  return (
    <div className="space-y-4">
      {/* Barre d'outils */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          ${hasGlobalSearch ? `<Input
            placeholder="Rechercher..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="max-w-sm"
          />` : ''}
        </div>
        <div className="flex items-center space-x-2">
          ${globalActions.map(action => `<Button onClick={onCreate} variant="${action.variant || 'default'}">
            ${action.icon ? `<${action.icon} className="mr-2 h-4 w-4" />` : ''}
            ${action.label}
          </Button>`).join('\n          ')}
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

      ${hasPagination ? this.generatePaginationControls() : ''}
    </div>
  );`;
  }

  /**
   * Génère les contrôles de pagination
   */
  private generatePaginationControls(): string {
    return `{/* Pagination */}
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
      </div>`;
  }
}
