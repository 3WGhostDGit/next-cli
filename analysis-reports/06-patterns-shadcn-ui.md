# Analyse des Patterns shadcn/ui

## Vue d'ensemble

Cette analyse examine les patterns d'utilisation de shadcn/ui, la personnalisation des composants, l'intégration avec les formulaires, et les stratégies de theming.

## ANALYSE EN DEUX TEMPS

### Temps 1 : Configuration et composants de base

- Installation et configuration initiale
- Patterns de composants fondamentaux
- Système de theming avec CSS variables

### Temps 2 : Composition avancée et personnalisation

- Patterns de composition de composants
- Intégration avec React Hook Form
- Personnalisation et extensions

## 1. Patterns de Configuration de Base

### 1.1 Configuration components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

**Caractéristiques identifiées :**

- `style` : "default" ou "new-york" (permanent après init)
- `cssVariables` : true/false pour theming (permanent)
- `baseColor` : palette de couleurs (permanent)
- `aliases` : chemins d'import personnalisés

### 1.2 Installation via CLI

```bash
# Installation initiale
npx shadcn@latest init

# Ajout de composants individuels
npx shadcn@latest add button
npx shadcn@latest add form
npx shadcn@latest add dialog

# Ajout de tous les composants
npx shadcn@latest add --all

# Installation avec options
npx shadcn@latest add button --overwrite --path ./custom-path
```

### 1.3 Installation Manuelle

```bash
# Dépendances de base
npm install class-variance-authority clsx tailwind-merge lucide-react

# Dépendances spécifiques par composant
npm install @radix-ui/react-dialog        # Dialog, Sheet
npm install @radix-ui/react-popover       # Popover, Combobox
npm install @radix-ui/react-select        # Select
npm install react-hook-form @hookform/resolvers zod  # Form
```

## 2. Patterns de Theming

### 2.1 CSS Variables (Recommandé)

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}
```

### 2.2 Utilisation des Variables CSS

```tsx
// Utilisation directe des classes Tailwind
<div className="bg-background text-foreground" />
<div className="bg-primary text-primary-foreground" />
<div className="border-border" />

// Variables CSS personnalisées
<div style={{ backgroundColor: 'hsl(var(--primary))' }} />
```

### 2.3 Theme Provider Pattern

```tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// Utilisation
function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
```

## 3. Patterns de Composants de Base

### 3.1 Button Patterns

```tsx
import { Button } from "@/components/ui/button"

// Variants de base
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Tailles
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔥</Button>

// États
<Button disabled>Disabled</Button>
<Button loading>Loading</Button>
```

### 3.2 Card Patterns

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>;
```

### 3.3 Dialog Patterns

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Edit Profile</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here. Click save when you're done.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">{/* Contenu du dialog */}</div>
    <DialogFooter>
      <Button type="submit">Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

## 4. Patterns de Formulaires

### 4.1 Intégration React Hook Form

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### 4.2 Patterns de Validation

```tsx
// Validation avec Zod
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18 or older"),
  role: z.enum(["admin", "user", "moderator"]),
});

// Validation conditionnelle
const conditionalSchema = z
  .object({
    type: z.enum(["personal", "business"]),
    name: z.string().min(1),
    businessName: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "business" && !data.businessName) {
        return false;
      }
      return true;
    },
    {
      message: "Business name is required for business accounts",
      path: ["businessName"],
    }
  );
```

## 5. Patterns de Composition Avancée

### 5.1 Combobox Pattern

```tsx
"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const frameworks = [
  { value: "next.js", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt.js", label: "Nuxt.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
];

export function ComboboxDemo() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : "Select framework..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            {frameworks.map((framework) => (
              <CommandItem
                key={framework.value}
                value={framework.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === framework.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {framework.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

### 5.2 Data Table Pattern

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

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  // ... more data
];

export function DataTableDemo() {
  return (
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
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## 6. Patterns de Personnalisation

### 6.1 Variants Personnalisées

```tsx
// Utilisation de class-variance-authority
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
        // Variants personnalisées
        gradient: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
        neon: "bg-black text-green-400 border border-green-400 hover:bg-green-400 hover:text-black",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
        // Tailles personnalisées
        xl: "h-12 px-10 text-lg",
        xs: "h-8 px-2 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### 6.2 Composants Composés

```tsx
// Pattern de composition pour des composants complexes
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  title: string;
  description: string;
  price: number;
  category: string;
  onAddToCart: () => void;
}

export function ProductCard({
  title,
  description,
  price,
  category,
  onAddToCart,
}: ProductCardProps) {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant="secondary">{category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">${price}</span>
          <Button onClick={onAddToCart}>Add to Cart</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

## 7. Implications pour le CLI

### 7.1 Détection Automatique de Configuration

Le CLI devra détecter :

- **Style préféré** → "default" ou "new-york"
- **Framework** → Next.js, Vite, Remix, etc.
- **Theming** → CSS variables vs utility classes
- **Structure de projet** → src/ vs app/, chemins d'alias

### 7.2 Génération de Templates

```typescript
// Template de configuration automatique
export const generateComponentsJson = (options: ProjectOptions) => ({
  $schema: "https://ui.shadcn.com/schema.json",
  style: options.style || "new-york",
  rsc: options.framework === "nextjs",
  tsx: options.typescript,
  tailwind: {
    config: options.tailwindConfig || "tailwind.config.js",
    css: options.cssPath || "app/globals.css",
    baseColor: options.baseColor || "zinc",
    cssVariables: options.cssVariables ?? true,
  },
  aliases: {
    components: options.componentsAlias || "@/components",
    utils: options.utilsAlias || "@/lib/utils",
    ui: options.uiAlias || "@/components/ui",
  },
  iconLibrary: "lucide",
});

// Template de composant personnalisé
export const generateCustomComponent = (name: string, variants: string[]) => `
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const ${name}Variants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        ${variants.map((v) => `${v}: "${v}-classes"`).join(",\n        ")}
      },
    },
    defaultVariants: {
      variant: "${variants[0]}",
    },
  }
)

export interface ${name}Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof ${name}Variants> {}

const ${name} = React.forwardRef<HTMLDivElement, ${name}Props>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        className={cn(${name}Variants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

export { ${name} }
`;
```

### 7.3 Patterns de Génération Automatique

Le CLI devra générer automatiquement :

- **Configuration initiale** → components.json adapté au projet
- **Composants de base** → Button, Input, Card selon le style
- **Formulaires** → Intégration React Hook Form + Zod
- **Theming** → CSS variables et dark mode
- **Types TypeScript** → Interfaces pour les props des composants

## 8. Patterns Avancés - Sidebar et Navigation

### 8.1 Sidebar Provider Pattern

```tsx
import { createContext, useContext, useState } from "react";

interface SidebarContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const [openMobile, setOpenMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
```

### 8.2 Sidebar Composition Pattern

```tsx
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Command className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Acme Inc</span>
                <span className="truncate text-xs">Enterprise</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <Home />
                    <span>Home</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <Inbox />
                    <span>Inbox</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> Username
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
```

### 8.3 Collapsible Menu Pattern

```tsx
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

<SidebarMenu>
  <Collapsible defaultOpen className="group/collapsible">
    <SidebarMenuItem>
      <CollapsibleTrigger asChild>
        <SidebarMenuButton tooltip="Projects">
          <Folder />
          <span>Projects</span>
          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
        </SidebarMenuButton>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton asChild>
              <a href="#">
                <span>Design Engineering</span>
              </a>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton asChild>
              <a href="#">
                <span>Sales & Marketing</span>
              </a>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      </CollapsibleContent>
    </SidebarMenuItem>
  </Collapsible>
</SidebarMenu>;
```

## 9. Patterns de Charts et Visualisation

### 9.1 Chart Container Pattern

```tsx
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
};

export function ChartDemo() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px]">
      <BarChart accessibilityLayer data={chartData}>
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis hide />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
```

### 9.2 Chart CSS Variables

```css
@layer base {
  :root {
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }

  .dark {
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}
```

## 10. Patterns de Registry et Extensions

### 10.1 Custom Registry Pattern

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "my-custom-registry",
  "homepage": "https://my-registry.com",
  "items": [
    {
      "name": "custom-button",
      "type": "registry:component",
      "title": "Custom Button",
      "description": "A custom button with enhanced features",
      "files": [
        {
          "path": "registry/components/custom-button.tsx",
          "type": "registry:component"
        }
      ],
      "dependencies": ["class-variance-authority"],
      "registryDependencies": ["button"],
      "cssVars": {
        "light": {
          "custom-primary": "210 40% 50%"
        },
        "dark": {
          "custom-primary": "210 40% 60%"
        }
      }
    }
  ]
}
```

### 10.2 Component Extension Pattern

```tsx
// Extension d'un composant existant
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export function LoadingButton({
  children,
  loading = false,
  loadingText = "Loading...",
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      className={cn("relative", className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? loadingText : children}
    </Button>
  );
}
```

### 10.3 Theme Extension Pattern

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "custom-theme",
  "type": "registry:theme",
  "cssVars": {
    "theme": {
      "font-heading": "Inter, sans-serif",
      "shadow-card": "0 0 0 1px rgba(0, 0, 0, 0.1)"
    },
    "light": {
      "brand": "210 40% 50%",
      "brand-foreground": "0 0% 100%",
      "success": "142 76% 36%",
      "success-foreground": "0 0% 100%",
      "warning": "38 92% 50%",
      "warning-foreground": "0 0% 100%",
      "info": "199 89% 48%",
      "info-foreground": "0 0% 100%"
    },
    "dark": {
      "brand": "210 40% 60%",
      "brand-foreground": "0 0% 100%",
      "success": "142 76% 46%",
      "success-foreground": "0 0% 100%",
      "warning": "38 92% 60%",
      "warning-foreground": "0 0% 100%",
      "info": "199 89% 58%",
      "info-foreground": "0 0% 100%"
    }
  }
}
```

## 11. Patterns d'Animation et Transitions

### 11.1 Custom Animations

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "animated-component",
  "type": "registry:component",
  "cssVars": {
    "theme": {
      "--animate-fade-in": "fade-in 0.5s ease-in-out",
      "--animate-slide-up": "slide-up 0.3s ease-out",
      "--animate-bounce": "bounce 1s infinite"
    }
  },
  "css": {
    "@keyframes fade-in": {
      "0%": { "opacity": "0" },
      "100%": { "opacity": "1" }
    },
    "@keyframes slide-up": {
      "0%": { "transform": "translateY(10px)", "opacity": "0" },
      "100%": { "transform": "translateY(0)", "opacity": "1" }
    },
    "@keyframes bounce": {
      "0%, 20%, 53%, 80%, 100%": { "transform": "translate3d(0,0,0)" },
      "40%, 43%": { "transform": "translate3d(0, -30px, 0)" },
      "70%": { "transform": "translate3d(0, -15px, 0)" },
      "90%": { "transform": "translate3d(0, -4px, 0)" }
    }
  }
}
```

### 11.2 Framer Motion Integration

```tsx
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MotionCard = motion(Card);

export function AnimatedCard({ children, ...props }) {
  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </MotionCard>
  );
}
```

## 12. Patterns de Responsive Design

### 12.1 Responsive Variants

```tsx
import { cva } from "class-variance-authority";

const responsiveVariants = cva("base-classes", {
  variants: {
    size: {
      sm: "text-sm p-2 sm:text-base sm:p-4",
      md: "text-base p-4 md:text-lg md:p-6",
      lg: "text-lg p-6 lg:text-xl lg:p-8",
    },
    layout: {
      stack: "flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4",
      grid: "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
    },
  },
});
```

### 12.2 Breakpoint Utilities

```tsx
import { useMediaQuery } from "@/hooks/use-media-query";

export function ResponsiveComponent() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  const isDesktop = useMediaQuery("(min-width: 1025px)");

  if (isMobile) {
    return <MobileLayout />;
  }

  if (isTablet) {
    return <TabletLayout />;
  }

  return <DesktopLayout />;
}
```

## 13. Implications Avancées pour le CLI

### 13.1 Génération de Layouts Complexes

```typescript
// Template de layout avec sidebar
export const generateSidebarLayout = (options: LayoutOptions) => `
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Building Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
`;

// Template de dashboard
export const generateDashboard = (widgets: string[]) => `
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Dashboard() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            ${widgets
              .map((widget) => `<${widget}Widget />`)
              .join("\n            ")}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
`;
```

### 13.2 Détection de Patterns Complexes

Le CLI devra identifier et générer automatiquement :

- **Layouts** → Sidebar, Dashboard, Auth layouts
- **Navigation** → Breadcrumbs, Tabs, Menus
- **Data Display** → Tables, Charts, Cards
- **Forms** → Multi-step, Validation, File upload
- **Modals** → Dialogs, Sheets, Popovers
- **Theming** → Dark mode, Custom colors, Animations

### 13.3 Templates de Génération Avancée

```typescript
// Générateur de formulaire complexe
export const generateComplexForm = (fields: FormField[]) => {
  const zodSchema = generateZodSchema(fields);
  const formFields = generateFormFields(fields);

  return `
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

${zodSchema}

export function ${pascalCase(formName)}Form() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: ${JSON.stringify(getDefaultValues(fields), null, 2)},
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // TODO: Implement form submission
      console.log(values)
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>${formName}</CardTitle>
        <CardDescription>
          Fill out the form below to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            ${formFields}
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
`;
};
```

## Conclusion

shadcn/ui offre des patterns très cohérents et modulaires qui se prêtent parfaitement à la génération automatique. Le CLI devra implémenter une détection intelligente de la configuration projet et générer des templates adaptés au style choisi, au framework utilisé, et aux besoins spécifiques de l'application.

Les patterns avancés comme les sidebars, charts, registries personnalisés et animations nécessitent une compréhension approfondie pour générer automatiquement des layouts complexes, des dashboards interactifs et des composants personnalisés. Le CLI devra également détecter les besoins spécifiques (navigation, visualisation, theming) pour générer les composants appropriés avec leurs dépendances et configurations.
