# Analyse des Patterns de Tableaux

## Vue d'ensemble

Cette analyse examine les patterns de tableaux avec shadcn/ui Table, TanStack Table, Material React Table, et les patterns d'intégration pour la pagination, le tri, le filtrage et les actions.

## ANALYSE EN DEUX TEMPS

### Temps 1 : Patterns de base et shadcn/ui

- Composants Table de base shadcn/ui
- Patterns TanStack Table fondamentaux
- Configuration et structure de base

### Temps 2 : Patterns avancés et fonctionnalités

- Pagination, tri, filtrage avancés
- Actions sur les lignes et sélection
- Intégration avec les données serveur

## 1. Patterns de Base shadcn/ui Table

### 1.1 Structure Table Basique

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Invoice {
  id: string;
  invoice: string;
  paymentStatus: "pending" | "processing" | "success" | "failed";
  totalAmount: string;
  paymentMethod: string;
}

const invoices: Invoice[] = [
  {
    id: "1",
    invoice: "INV001",
    paymentStatus: "pending",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    id: "2",
    invoice: "INV002",
    paymentStatus: "success",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  // ... more data
];

export function InvoiceTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.invoice}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(invoice.paymentStatus)}>
                  {invoice.paymentStatus}
                </Badge>
              </TableCell>
              <TableCell>{invoice.paymentMethod}</TableCell>
              <TableCell className="text-right">
                {invoice.totalAmount}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function getStatusVariant(status: Invoice["paymentStatus"]) {
  switch (status) {
    case "pending":
      return "secondary";
    case "processing":
      return "default";
    case "success":
      return "default";
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
}
```

**Caractéristiques identifiées :**

- Structure sémantique avec composants dédiés
- Styling cohérent avec Tailwind CSS
- Types TypeScript intégrés
- Patterns de Badge pour les statuts

### 1.2 Table avec Actions

```tsx
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";

export function TableWithActions() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(user.id)}
                  >
                    Copy user ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleView(user.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEdit(user.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit user
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete user
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## 2. Patterns TanStack Table avec shadcn/ui

### 2.1 Configuration de Base TanStack Table

```tsx
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  createdAt: Date;
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <Badge variant="outline">{row.getValue("role")}</Badge>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View user</DropdownMenuItem>
            <DropdownMenuItem>Edit user</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function DataTable({ data }: { data: User[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter users..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(String(event.target.value))}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 2.2 Patterns de Tri Avancé

```tsx
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// Colonne avec tri personnalisé
const sortableColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Name
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return <div>{format(date, "PPP")}</div>;
    },
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = rowA.getValue(columnId) as Date;
      const dateB = rowB.getValue(columnId) as Date;
      return dateA.getTime() - dateB.getTime();
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
    sortingFn: "alphanumeric",
  },
];
```

## 3. Patterns de Filtrage

### 3.1 Filtrage par Colonne

```tsx
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Filtres personnalisés par colonne
const columnsWithFilters: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
    filterFn: (row, id, value) => {
      return row.getValue(id).toLowerCase().includes(value.toLowerCase());
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <Badge variant="outline">{row.getValue("role")}</Badge>,
    filterFn: (row, id, value) => {
      if (!value || value === "all") return true;
      return row.getValue(id) === value;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      if (!value || value === "all") return true;
      return row.getValue(id) === value;
    },
  },
];

// Composant de filtres
export function TableFilters({ table }: { table: Table<User> }) {
  return (
    <div className="flex items-center space-x-2">
      <Input
        placeholder="Filter names..."
        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("name")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />

      <Select
        value={(table.getColumn("role")?.getFilterValue() as string) ?? "all"}
        onValueChange={(value) =>
          table.getColumn("role")?.setFilterValue(value === "all" ? "" : value)
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="moderator">Moderator</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
        onValueChange={(value) =>
          table
            .getColumn("status")
            ?.setFilterValue(value === "all" ? "" : value)
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {(table.getColumn("name")?.getFilterValue() ||
        table.getColumn("role")?.getFilterValue() ||
        table.getColumn("status")?.getFilterValue()) && (
        <Button
          variant="ghost"
          onClick={() => {
            table.getColumn("name")?.setFilterValue("");
            table.getColumn("role")?.setFilterValue("");
            table.getColumn("status")?.setFilterValue("");
          }}
          className="h-8 px-2 lg:px-3"
        >
          Reset
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
```

### 3.2 Filtrage Global Avancé

```tsx
import { Search, X } from "lucide-react";

export function GlobalFilter({ table }: { table: Table<User> }) {
  const [value, setValue] = useState(table.getState().globalFilter ?? "");

  // Debounce pour optimiser les performances
  useEffect(() => {
    const timeout = setTimeout(() => {
      table.setGlobalFilter(value);
    }, 300);

    return () => clearTimeout(timeout);
  }, [value, table]);

  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search all columns..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-8 max-w-sm"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 h-6 w-6 p-0"
          onClick={() => setValue("")}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// Fonction de filtrage global personnalisée
const globalFilterFn = (row: Row<User>, columnId: string, value: string) => {
  const search = value.toLowerCase();

  // Recherche dans toutes les colonnes visibles
  return Object.values(row.original).some((cellValue) => {
    if (cellValue == null) return false;
    return String(cellValue).toLowerCase().includes(search);
  });
};
```

## 4. Patterns de Pagination

### 4.1 Pagination Basique

```tsx
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DataTablePagination({ table }: { table: Table<User> }) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## 5. Implications pour le CLI

### 5.1 Génération Automatique de Tables

Le CLI devra détecter et générer automatiquement :

**Patterns de base :**

- Configuration TanStack Table avec shadcn/ui
- Colonnes typées avec TypeScript
- Tri, filtrage et pagination intégrés
- Actions sur les lignes standardisées

**Patterns avancés :**

- Filtrage multi-colonnes avec composants UI
- Pagination serveur avec état géré
- Sélection multiple et actions en lot
- Export de données et impression

### 5.2 Templates de Génération

```typescript
// Template de table généré automatiquement
export const generateDataTable = (entity: EntityConfig) => {
  const columns = generateColumns(entity.fields);
  const filters = generateFilters(entity.fields);

  return `
import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ${entity.name} {
  ${entity.fields.map((field) => `${field.name}: ${field.type}`).join("\n  ")}
}

const columns: ColumnDef<${entity.name}>[] = [
  ${columns}
]

export function ${entity.name}Table({ data }: { data: ${entity.name}[] }) {
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState("")

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, columnFilters, globalFilter },
  })

  return (
    <div className="space-y-4">
      ${filters}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
`;
};
```

### 5.3 Détection de Patterns

Le CLI devra identifier :

- **Types de données** → Colonnes et formatage appropriés
- **Relations** → Colonnes avec liens et navigation
- **Actions nécessaires** → CRUD, export, impression
- **Filtrage requis** → Types de filtres par colonne
- **Pagination** → Client-side vs server-side

## 6. Patterns de Sélection et Actions en Lot

### 6.1 Sélection Multiple

```tsx
import { Checkbox } from "@/components/ui/checkbox";

// Colonne de sélection
const selectionColumn: ColumnDef<User> = {
  id: "select",
  header: ({ table }) => (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && "indeterminate")
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
    />
  ),
  enableSorting: false,
  enableHiding: false,
};

// Configuration avec sélection
export function SelectableDataTable({ data }: { data: User[] }) {
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns: [selectionColumn, ...columns],
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    // Sélection conditionnelle
    enableRowSelection: (row) => row.original.status === "active",
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  return (
    <div className="space-y-4">
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex-1 text-sm text-muted-foreground">
            {selectedRows.length} of {table.getFilteredRowModel().rows.length}{" "}
            row(s) selected.
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkDelete(selectedRows)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkExport(selectedRows)}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkEdit(selectedRows)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Selected
            </Button>
          </div>
        </div>
      )}

      {/* Table content */}
      <div className="rounded-md border">
        <Table>{/* Table implementation */}</Table>
      </div>
    </div>
  );
}
```

### 6.2 Actions en Lot Avancées

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function BulkActionsToolbar({
  selectedRows,
  onClearSelection,
}: {
  selectedRows: Row<User>[];
  onClearSelection: () => void;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBulkDelete = async () => {
    setIsLoading(true);
    try {
      const ids = selectedRows.map((row) => row.original.id);
      await deleteUsers(ids);
      onClearSelection();
      toast.success(`${ids.length} users deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete users");
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleBulkStatusChange = async (status: "active" | "inactive") => {
    setIsLoading(true);
    try {
      const ids = selectedRows.map((row) => row.original.id);
      await updateUsersStatus(ids, status);
      onClearSelection();
      toast.success(`${ids.length} users updated successfully`);
    } catch (error) {
      toast.error("Failed to update users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkExport = () => {
    const data = selectedRows.map((row) => row.original);
    const csv = convertToCSV(data);
    downloadCSV(csv, `users-${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            {selectedRows.length} selected
          </span>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Clear selection
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Change Status
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => handleBulkStatusChange("active")}
              >
                Mark as Active
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleBulkStatusChange("inactive")}
              >
                Mark as Inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={handleBulkExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isLoading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {selectedRows.length} user{selectedRows.length > 1 ? "s" : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

## 7. Patterns de Données Serveur

### 7.1 Pagination Serveur

```tsx
interface ServerSideTableProps {
  endpoint: string;
  pageSize?: number;
}

export function ServerSideTable({
  endpoint,
  pageSize = 10,
}: ServerSideTableProps) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Query avec React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["users", pagination, sorting, columnFilters, globalFilter],
    queryFn: () =>
      fetchUsers({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        sort: sorting.map((s) => `${s.desc ? "-" : ""}${s.id}`).join(","),
        filters: columnFilters.reduce((acc, filter) => {
          acc[filter.id] = filter.value;
          return acc;
        }, {} as Record<string, any>),
        search: globalFilter,
      }),
    keepPreviousData: true,
  });

  const table = useReactTable({
    data: data?.users ?? [],
    columns,
    pageCount: data?.totalPages ?? -1,
    state: {
      pagination,
      sorting,
      columnFilters,
      globalFilter,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-destructive">Error loading data</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TableFilters table={table} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
```

### 7.2 Optimistic Updates

```tsx
export function OptimisticTable() {
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onMutate: async (newUser) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["users"] });

      // Snapshot previous value
      const previousUsers = queryClient.getQueryData(["users"]);

      // Optimistically update
      queryClient.setQueryData(["users"], (old: any) => ({
        ...old,
        users: old.users.map((user: User) =>
          user.id === newUser.id ? { ...user, ...newUser } : user
        ),
      }));

      return { previousUsers };
    },
    onError: (err, newUser, context) => {
      // Rollback on error
      queryClient.setQueryData(["users"], context?.previousUsers);
      toast.error("Failed to update user");
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handleQuickEdit = (userId: string, field: string, value: any) => {
    updateUserMutation.mutate({ id: userId, [field]: value });
  };

  // Colonnes avec édition inline
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [value, setValue] = useState(row.getValue("name"));

        if (isEditing) {
          return (
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={() => {
                setIsEditing(false);
                if (value !== row.getValue("name")) {
                  handleQuickEdit(row.original.id, "name", value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditing(false);
                  if (value !== row.getValue("name")) {
                    handleQuickEdit(row.original.id, "name", value);
                  }
                }
                if (e.key === "Escape") {
                  setValue(row.getValue("name"));
                  setIsEditing(false);
                }
              }}
              autoFocus
            />
          );
        }

        return (
          <div
            className="cursor-pointer hover:bg-muted p-1 rounded"
            onClick={() => setIsEditing(true)}
          >
            {row.getValue("name")}
          </div>
        );
      },
    },
    // ... autres colonnes
  ];

  return <DataTable columns={columns} data={data?.users ?? []} />;
}
```

## 8. Patterns d'Export et Impression

### 8.1 Export de Données

```tsx
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export function ExportToolbar({ table }: { table: Table<User> }) {
  const exportToCSV = () => {
    const rows = table.getFilteredRowModel().rows;
    const csvData = rows.map((row) => {
      const rowData: Record<string, any> = {};
      row.getVisibleCells().forEach((cell) => {
        const columnId = cell.column.id;
        const header = cell.column.columnDef.header;
        const key = typeof header === "string" ? header : columnId;
        rowData[key] = cell.getValue();
      });
      return rowData;
    });

    const csv = convertToCSV(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `export-${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  const exportToExcel = () => {
    const rows = table.getFilteredRowModel().rows;
    const data = rows.map((row) => {
      const rowData: Record<string, any> = {};
      row.getVisibleCells().forEach((cell) => {
        const columnId = cell.column.id;
        const header = cell.column.columnDef.header;
        const key = typeof header === "string" ? header : columnId;
        rowData[key] = cell.getValue();
      });
      return rowData;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `export-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  const exportToPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    const rows = table.getFilteredRowModel().rows;

    const headers = table.getVisibleFlatColumns().map((column) => {
      const header = column.columnDef.header;
      return typeof header === "string" ? header : column.id;
    });

    const data = rows.map((row) =>
      row.getVisibleCells().map((cell) => String(cell.getValue() ?? ""))
    );

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 20,
    });

    doc.save(`export-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportToCSV}>
          <FileText className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 8.2 Impression Optimisée

```tsx
export function PrintableTable({ table }: { table: Table<User> }) {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rows = table.getFilteredRowModel().rows;
    const headers = table.getVisibleFlatColumns().map((column) => {
      const header = column.columnDef.header;
      return typeof header === "string" ? header : column.id;
    });

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Data Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .header { margin-bottom: 20px; }
            .date { color: #666; font-size: 14px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Data Export</h1>
            <p class="date">Generated on ${format(new Date(), "PPP")}</p>
            <p>Total records: ${rows.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                ${headers.map((header) => `<th>${header}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (row) => `
                <tr>
                  ${row
                    .getVisibleCells()
                    .map((cell) => `<td>${String(cell.getValue() ?? "")}</td>`)
                    .join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Button variant="outline" size="sm" onClick={handlePrint}>
      <Printer className="mr-2 h-4 w-4" />
      Print
    </Button>
  );
}
```

## 9. Implications Avancées pour le CLI

### 9.1 Génération de Tables Complexes

Le CLI devra détecter et générer automatiquement :

**Patterns avancés :**

- Sélection multiple avec actions en lot
- Pagination serveur avec React Query
- Édition inline avec optimistic updates
- Export multi-format (CSV, Excel, PDF)
- Filtrage avancé avec composants UI

**Templates de génération :**

```typescript
// Générateur de table avec toutes les fonctionnalités
export const generateAdvancedTable = (entity: EntityConfig) => {
  const hasServerPagination = entity.dataSource === "server";
  const hasSelection = entity.features.includes("selection");
  const hasExport = entity.features.includes("export");
  const hasInlineEdit = entity.features.includes("inlineEdit");

  return `
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ${hasServerPagination ? "manualPagination: true," : "getPaginationRowModel,"}
} from "@tanstack/react-table"

interface ${entity.name} {
  ${entity.fields.map((field) => `${field.name}: ${field.type}`).join("\n  ")}
}

export function ${entity.name}Table() {
  ${hasSelection ? "const [rowSelection, setRowSelection] = useState({})" : ""}
  ${
    hasServerPagination
      ? generateServerPaginationState()
      : generateClientPaginationState()
  }

  ${
    hasServerPagination
      ? generateServerQuery(entity)
      : generateClientData(entity)
  }

  const columns: ColumnDef<${entity.name}>[] = [
    ${hasSelection ? generateSelectionColumn() : ""}
    ${generateColumns(entity.fields, hasInlineEdit)}
    ${generateActionsColumn(entity)}
  ]

  const table = useReactTable({
    data: ${hasServerPagination ? "data?.items ?? []" : "data"},
    columns,
    ${hasSelection ? "enableRowSelection: true," : ""}
    ${hasSelection ? "onRowSelectionChange: setRowSelection," : ""}
    ${
      hasServerPagination
        ? "manualPagination: true,"
        : "getPaginationRowModel: getPaginationRowModel(),"
    }
    getCoreRowModel: getCoreRowModel(),
    state: {
      ${hasSelection ? "rowSelection," : ""}
      pagination,
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      ${
        hasSelection
          ? "<BulkActionsToolbar selectedRows={table.getSelectedRowModel().rows} />"
          : ""
      }
      <TableFilters table={table} />
      ${hasExport ? "<ExportToolbar table={table} />" : ""}

      <div className="rounded-md border">
        <Table>
          {/* Table implementation */}
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
`;
};
```

### 9.2 Détection de Patterns Complexes

Le CLI devra identifier :

- **Volume de données** → Client-side vs server-side pagination
- **Actions nécessaires** → CRUD, export, impression, sélection
- **Types de colonnes** → Éditable, triable, filtrable
- **Relations** → Colonnes avec navigation
- **Performance** → Virtualisation pour grandes listes

## Conclusion

Les patterns de tableaux avec shadcn/ui et TanStack Table offrent une base très structurée pour la génération automatique. Le CLI devra implémenter des templates qui couvrent le tri, le filtrage, la pagination et les actions, tout en générant automatiquement les types TypeScript et les composants UI cohérents.

Les patterns avancés comme la sélection multiple, les actions en lot, la pagination serveur et l'export de données nécessitent une détection intelligente des besoins pour générer automatiquement des tables performantes et complètes. L'intégration avec shadcn/ui permet une génération de tableaux accessibles et responsive, tandis que TanStack Table fournit les fonctionnalités avancées nécessaires pour des applications professionnelles.
