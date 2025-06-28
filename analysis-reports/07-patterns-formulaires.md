# Analyse des Patterns de Formulaires

## Vue d'ensemble

Cette analyse examine les patterns de formulaires avec React Hook Form, l'intégration avec Zod pour la validation, et les patterns d'intégration avec shadcn/ui.

## ANALYSE EN DEUX TEMPS

### Temps 1 : Patterns de base React Hook Form

- Configuration useForm et register
- Validation et gestion d'erreurs
- Patterns Controller pour composants contrôlés

### Temps 2 : Intégration avancée et validation

- Intégration Zod et resolvers
- Patterns shadcn/ui Form components
- Formulaires complexes et multi-étapes

## 1. Patterns de Base React Hook Form

### 1.1 Configuration useForm Standard

```typescript
import { useForm, SubmitHandler } from "react-hook-form";

type FormInputs = {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
};

export default function BasicForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm<FormInputs>({
    mode: "onChange", // onSubmit | onBlur | onChange | onTouched | all
    reValidateMode: "onChange", // onChange | onBlur | onSubmit
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      age: 0,
    },
  });

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      console.log(data);
      // API call here
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  // Watch specific fields
  const watchedEmail = watch("email");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("firstName", {
          required: "First name is required",
          minLength: {
            value: 2,
            message: "First name must be at least 2 characters",
          },
        })}
        placeholder="First Name"
      />
      {errors.firstName && <span role="alert">{errors.firstName.message}</span>}

      <input
        {...register("lastName", { required: true })}
        placeholder="Last Name"
      />
      {errors.lastName?.type === "required" && (
        <span role="alert">Last name is required</span>
      )}

      <input
        type="email"
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address",
          },
        })}
        placeholder="Email"
      />
      {errors.email && <span role="alert">{errors.email.message}</span>}

      <input
        type="number"
        {...register("age", {
          required: "Age is required",
          min: {
            value: 18,
            message: "Must be at least 18 years old",
          },
          max: {
            value: 99,
            message: "Must be less than 100 years old",
          },
        })}
        placeholder="Age"
      />
      {errors.age && <span role="alert">{errors.age.message}</span>}

      <button type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

**Caractéristiques identifiées :**

- `register` pour les champs non contrôlés
- `formState` pour l'état du formulaire
- Validation intégrée avec messages personnalisés
- Gestion des états de soumission

### 1.2 Patterns de Validation Avancée

```typescript
import { useForm } from "react-hook-form";

interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
  category: string;
  product: string;
}

export default function AdvancedValidationForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<FormData>({
    criteriaMode: "all", // Afficher toutes les erreurs
  });

  const password = watch("password");

  const onSubmit = async (data: FormData) => {
    try {
      // Validation côté serveur
      const response = await submitForm(data);
      if (!response.ok) {
        // Erreurs serveur
        setError("username", {
          type: "server",
          message: "Username already exists",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("username", {
          required: "Username is required",
          minLength: {
            value: 3,
            message: "Username must be at least 3 characters",
          },
          pattern: {
            value: /^[a-zA-Z0-9_]+$/,
            message:
              "Username can only contain letters, numbers, and underscores",
          },
          validate: {
            noSpaces: (value) =>
              !value.includes(" ") || "Username cannot contain spaces",
            notAdmin: (value) =>
              value !== "admin" || "Username cannot be 'admin'",
          },
        })}
      />
      {errors.username && (
        <div>
          {Object.entries(errors.username).map(([type, error]) => (
            <p key={type} role="alert">
              {error.message}
            </p>
          ))}
        </div>
      )}

      <input
        type="password"
        {...register("password", {
          required: "Password is required",
          minLength: {
            value: 8,
            message: "Password must be at least 8 characters",
          },
          validate: {
            hasUpperCase: (value) =>
              /[A-Z]/.test(value) ||
              "Password must contain at least one uppercase letter",
            hasLowerCase: (value) =>
              /[a-z]/.test(value) ||
              "Password must contain at least one lowercase letter",
            hasNumber: (value) =>
              /\d/.test(value) || "Password must contain at least one number",
            hasSpecialChar: (value) =>
              /[!@#$%^&*(),.?":{}|<>]/.test(value) ||
              "Password must contain at least one special character",
          },
        })}
      />

      <input
        type="password"
        {...register("confirmPassword", {
          required: "Please confirm your password",
          validate: (value) => value === password || "Passwords do not match",
        })}
      />

      {/* Validation asynchrone */}
      <select {...register("category", { required: "Category is required" })}>
        <option value="">Select Category</option>
        <option value="A">Category A</option>
        <option value="B">Category B</option>
      </select>

      <input
        {...register("product", {
          validate: {
            checkAvailability: async (product, { category }) => {
              if (!category) return "Choose a category first";
              if (!product) return "Specify your product";

              const isInStock = await checkProductAvailability(
                category,
                product
              );
              return isInStock || "Product is not available";
            },
          },
        })}
      />

      <button type="submit">Submit</button>
    </form>
  );
}
```

### 1.3 Patterns Controller pour Composants Contrôlés

```typescript
import { useForm, Controller } from "react-hook-form";
import { Select, MenuItem, TextField, Checkbox } from "@mui/material";
import DatePicker from "react-datepicker";

interface ControlledFormData {
  category: string;
  birthDate: Date;
  description: string;
  isActive: boolean;
  tags: string[];
}

export default function ControlledForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ControlledFormData>({
    defaultValues: {
      category: "",
      birthDate: new Date(),
      description: "",
      isActive: false,
      tags: [],
    },
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      {/* Select contrôlé */}
      <Controller
        name="category"
        control={control}
        rules={{ required: "Category is required" }}
        render={({ field, fieldState }) => (
          <div>
            <Select {...field} error={!!fieldState.error} displayEmpty>
              <MenuItem value="">Select Category</MenuItem>
              <MenuItem value="tech">Technology</MenuItem>
              <MenuItem value="design">Design</MenuItem>
              <MenuItem value="marketing">Marketing</MenuItem>
            </Select>
            {fieldState.error && <span>{fieldState.error.message}</span>}
          </div>
        )}
      />

      {/* Date Picker contrôlé */}
      <Controller
        name="birthDate"
        control={control}
        rules={{ required: "Birth date is required" }}
        render={({ field: { onChange, onBlur, value } }) => (
          <DatePicker
            onChange={onChange}
            onBlur={onBlur}
            selected={value}
            placeholderText="Select birth date"
          />
        )}
      />

      {/* Textarea contrôlé */}
      <Controller
        name="description"
        control={control}
        rules={{
          required: "Description is required",
          minLength: {
            value: 10,
            message: "Description must be at least 10 characters",
          },
        }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            multiline
            rows={4}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            placeholder="Enter description"
          />
        )}
      />

      {/* Checkbox contrôlé */}
      <Controller
        name="isActive"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Checkbox
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
          />
        )}
      />

      <button type="submit">Submit</button>
    </form>
  );
}
```

## 2. Patterns d'Intégration Zod

### 2.1 Configuration Zod Resolver

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Schéma Zod
const formSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters"),

    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name must be less than 50 characters"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),

    age: z
      .number({
        required_error: "Age is required",
        invalid_type_error: "Age must be a number",
      })
      .min(18, "Must be at least 18 years old")
      .max(99, "Must be less than 100 years old"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),

    confirmPassword: z.string(),

    terms: z
      .boolean()
      .refine(
        (val) => val === true,
        "You must accept the terms and conditions"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

export default function ZodForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Les données sont automatiquement validées et typées
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("firstName")} placeholder="First Name" />
      {errors.firstName && <span>{errors.firstName.message}</span>}

      <input {...register("lastName")} placeholder="Last Name" />
      {errors.lastName && <span>{errors.lastName.message}</span>}

      <input type="email" {...register("email")} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input
        type="number"
        {...register("age", { valueAsNumber: true })}
        placeholder="Age"
      />
      {errors.age && <span>{errors.age.message}</span>}

      <input type="password" {...register("password")} placeholder="Password" />
      {errors.password && <span>{errors.password.message}</span>}

      <input
        type="password"
        {...register("confirmPassword")}
        placeholder="Confirm Password"
      />
      {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}

      <label>
        <input type="checkbox" {...register("terms")} />I accept the terms and conditions
      </label>
      {errors.terms && <span>{errors.terms.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

### 2.2 Schémas Zod Complexes

```typescript
import { z } from "zod";

// Énumérations
const UserRole = z.enum(["admin", "user", "moderator"]);
const Status = z.enum(["active", "inactive", "pending"]);

// Schémas imbriqués
const AddressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid zip code"),
  country: z.string().min(1, "Country is required"),
});

const ContactSchema = z
  .object({
    phone: z
      .string()
      .regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number")
      .optional(),

    email: z.string().email("Invalid email address").optional(),
  })
  .refine((data) => data.phone || data.email, {
    message: "Either phone or email is required",
    path: ["phone"],
  });

// Schéma principal avec validation conditionnelle
const ComplexFormSchema = z
  .object({
    // Informations de base
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    role: UserRole,
    status: Status,

    // Informations conditionnelles
    companyName: z.string().optional(),

    // Objets imbriqués
    address: AddressSchema,
    contact: ContactSchema,

    // Arrays
    skills: z
      .array(z.string())
      .min(1, "At least one skill is required")
      .max(10, "Maximum 10 skills allowed"),

    // Dates
    birthDate: z
      .date({
        required_error: "Birth date is required",
        invalid_type_error: "Invalid date",
      })
      .refine((date) => {
        const age = new Date().getFullYear() - date.getFullYear();
        return age >= 18;
      }, "Must be at least 18 years old"),

    // Fichiers
    avatar: z
      .instanceof(FileList)
      .optional()
      .refine((files) => {
        if (!files || files.length === 0) return true;
        return files[0]?.size <= 5000000; // 5MB
      }, "File size must be less than 5MB")
      .refine((files) => {
        if (!files || files.length === 0) return true;
        return ["image/jpeg", "image/png", "image/gif"].includes(
          files[0]?.type
        );
      }, "Only JPEG, PNG, and GIF files are allowed"),
  })
  .refine(
    (data) => {
      // Validation conditionnelle : si le rôle est admin, le nom de l'entreprise est requis
      if (data.role === "admin" && !data.companyName) {
        return false;
      }
      return true;
    },
    {
      message: "Company name is required for admin users",
      path: ["companyName"],
    }
  );

type ComplexFormData = z.infer<typeof ComplexFormSchema>;
```

## 3. Implications pour le CLI

### 3.1 Génération Automatique de Formulaires

Le CLI devra détecter et générer automatiquement :

**Patterns de base :**

- Configuration `useForm` avec options appropriées
- Validation Zod intégrée avec `zodResolver`
- Gestion d'erreurs standardisée
- Types TypeScript générés automatiquement

**Patterns avancés :**

- Formulaires multi-étapes avec état partagé
- Validation conditionnelle et dépendante
- Intégration avec shadcn/ui Form components
- Gestion des fichiers et uploads

### 3.2 Templates de Génération

```typescript
// Template de formulaire généré automatiquement
export const generateForm = (fields: FormField[]) => {
  const zodSchema = generateZodSchema(fields);
  const formFields = generateFormFields(fields);

  return `
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"

${zodSchema}

type FormData = z.infer<typeof formSchema>

export function ${pascalCase(formName)}Form() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: ${JSON.stringify(getDefaultValues(fields), null, 2)},
  })

  async function onSubmit(values: FormData) {
    try {
      console.log(values)
      // TODO: Implement form submission
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        ${formFields}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
`;
};

// Générateur de schéma Zod
export const generateZodSchema = (fields: FormField[]) => {
  const schemaFields = fields
    .map((field) => {
      switch (field.type) {
        case "string":
          return `${field.name}: z.string()${
            field.required ? '.min(1, "Required")' : ".optional()"
          }`;
        case "email":
          return `${field.name}: z.string().email("Invalid email")${
            field.required ? '.min(1, "Required")' : ".optional()"
          }`;
        case "number":
          return `${field.name}: z.number()${
            field.required ? "" : ".optional()"
          }`;
        case "boolean":
          return `${field.name}: z.boolean()`;
        default:
          return `${field.name}: z.string()${
            field.required ? '.min(1, "Required")' : ".optional()"
          }`;
      }
    })
    .join(",\n  ");

  return `const formSchema = z.object({
  ${schemaFields}
})`;
};
```

### 3.3 Détection de Patterns

Le CLI devra identifier :

- **Types de champs** → Validation Zod appropriée
- **Relations entre champs** → Validation conditionnelle
- **Besoins d'upload** → Gestion de fichiers
- **Formulaires complexes** → Multi-étapes ou sections
- **Intégration UI** → shadcn/ui vs composants personnalisés

## 4. Patterns shadcn/ui Form Integration

### 4.1 Configuration shadcn/ui Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters.")
    .max(30, "Username must not be longer than 30 characters."),

  email: z
    .string({
      required_error: "Please select an email to display.",
    })
    .email(),

  bio: z.string().max(160).min(4),

  urls: z
    .array(
      z.object({
        value: z.string().url({ message: "Please enter a valid URL." }),
      })
    )
    .optional(),

  marketing_emails: z.boolean().default(false).optional(),

  security_emails: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      bio: "",
      urls: [{ value: "" }],
      marketing_emails: false,
      security_emails: true,
    },
    mode: "onChange",
  });

  function onSubmit(data: ProfileFormValues) {
    console.log(data);
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
                This is your public display name. It can be your real name or a
                pseudonym.
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a verified email to display" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="m@example.com">m@example.com</SelectItem>
                  <SelectItem value="m@google.com">m@google.com</SelectItem>
                  <SelectItem value="m@support.com">m@support.com</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                You can manage verified email addresses in your email settings.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                You can <span>@mention</span> other users and organizations.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="marketing_emails"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Marketing emails</FormLabel>
                <FormDescription>
                  Receive emails about new products, features, and more.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  );
}
```

### 4.2 Patterns de Formulaires Multi-Étapes

```typescript
import { useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Schémas pour chaque étape
const step1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
});

const step2Schema = z.object({
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  experience: z.enum(["junior", "mid", "senior", "lead"]),
});

const step3Schema = z.object({
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  portfolio: z.string().url("Invalid URL").optional(),
  availability: z.date(),
});

// Schéma complet
const multiStepSchema = step1Schema.merge(step2Schema).merge(step3Schema);

type MultiStepFormData = z.infer<typeof multiStepSchema>;

const steps = [
  { title: "Personal Info", schema: step1Schema },
  { title: "Professional Info", schema: step2Schema },
  { title: "Skills & Availability", schema: step3Schema },
];

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<MultiStepFormData>>({});

  const form = useForm<MultiStepFormData>({
    resolver: zodResolver(steps[currentStep].schema),
    defaultValues: formData,
    mode: "onChange",
  });

  const nextStep = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const stepData = form.getValues();
      setFormData((prev) => ({ ...prev, ...stepData }));

      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
        form.reset({ ...formData, ...stepData });
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const stepData = form.getValues();
      setFormData((prev) => ({ ...prev, ...stepData }));
      setCurrentStep((prev) => prev - 1);
      form.reset({ ...formData, ...stepData });
    }
  };

  const onSubmit = async (data: MultiStepFormData) => {
    const finalData = { ...formData, ...data };
    console.log("Final form data:", finalData);
    // Submit to API
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{steps[currentStep].title}</CardTitle>
        <CardDescription>
          Step {currentStep + 1} of {steps.length}
        </CardDescription>
        <Progress value={progress} className="w-full" />
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              currentStep === steps.length - 1 ? onSubmit : nextStep
            )}
          >
            {currentStep === 0 && <Step1Form />}
            {currentStep === 1 && <Step2Form />}
            {currentStep === 2 && <Step3Form />}

            <div className="flex justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                Previous
              </Button>

              <Button type="submit">
                {currentStep === steps.length - 1 ? "Submit" : "Next"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function Step1Form() {
  const { control } = useFormContext<MultiStepFormData>();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>First Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Last Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
```

### 4.3 Patterns de Formulaires Dynamiques

```typescript
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";

const dynamicFormSchema = z.object({
  name: z.string().min(1, "Name is required"),

  contacts: z
    .array(
      z.object({
        type: z.enum(["email", "phone", "website"]),
        value: z.string().min(1, "Value is required"),
        isPrimary: z.boolean().default(false),
      })
    )
    .min(1, "At least one contact is required"),

  skills: z
    .array(
      z.object({
        name: z.string().min(1, "Skill name is required"),
        level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
        yearsOfExperience: z.number().min(0).max(50),
      })
    )
    .optional(),

  projects: z
    .array(
      z.object({
        title: z.string().min(1, "Project title is required"),
        description: z
          .string()
          .min(10, "Description must be at least 10 characters"),
        technologies: z
          .array(z.string())
          .min(1, "At least one technology is required"),
        url: z.string().url("Invalid URL").optional(),
      })
    )
    .optional(),
});

type DynamicFormData = z.infer<typeof dynamicFormSchema>;

export function DynamicForm() {
  const form = useForm<DynamicFormData>({
    resolver: zodResolver(dynamicFormSchema),
    defaultValues: {
      name: "",
      contacts: [{ type: "email", value: "", isPrimary: true }],
      skills: [],
      projects: [],
    },
  });

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject,
  } = useFieldArray({
    control: form.control,
    name: "projects",
  });

  const onSubmit = (data: DynamicFormData) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contacts dynamiques */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Contacts</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendContact({ type: "email", value: "", isPrimary: false })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>

          {contactFields.map((field, index) => (
            <div key={field.id} className="flex items-end space-x-2">
              <FormField
                control={form.control}
                name={`contacts.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`contacts.${index}.value`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`contacts.${index}.isPrimary`}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Primary</FormLabel>
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeContact(index)}
                disabled={contactFields.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Skills dynamiques */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Skills</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendSkill({
                  name: "",
                  level: "beginner",
                  yearsOfExperience: 0,
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </div>

          {skillFields.map((field, index) => (
            <div key={field.id} className="flex items-end space-x-2">
              <FormField
                control={form.control}
                name={`skills.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Skill Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`skills.${index}.level`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`skills.${index}.yearsOfExperience`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        className="w-20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeSkill(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

## 5. Patterns de Gestion d'État Avancée

### 5.1 FormProvider et useFormContext

```typescript
import { createContext, useContext, ReactNode } from "react";
import {
  useForm,
  FormProvider as RHFFormProvider,
  useFormContext,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  user: z.object({
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    email: z.string().email("Invalid email"),
  }),
  preferences: z.object({
    theme: z.enum(["light", "dark", "system"]),
    notifications: z.boolean(),
    language: z.string(),
  }),
  billing: z.object({
    plan: z.enum(["free", "pro", "enterprise"]),
    paymentMethod: z.string().optional(),
  }),
});

type FormData = z.infer<typeof formSchema>;

// Context pour l'état du formulaire
interface FormContextType {
  currentSection: string;
  setCurrentSection: (section: string) => void;
  isValid: boolean;
  isDirty: boolean;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function useFormState() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormState must be used within FormProvider");
  }
  return context;
}

export function ComplexFormProvider({ children }: { children: ReactNode }) {
  const [currentSection, setCurrentSection] = useState("user");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user: { firstName: "", lastName: "", email: "" },
      preferences: { theme: "system", notifications: true, language: "en" },
      billing: { plan: "free" },
    },
    mode: "onChange",
  });

  const {
    formState: { isValid, isDirty },
  } = form;

  return (
    <FormContext.Provider
      value={{
        currentSection,
        setCurrentSection,
        isValid,
        isDirty,
      }}
    >
      <RHFFormProvider {...form}>{children}</RHFFormProvider>
    </FormContext.Provider>
  );
}

// Composants de section utilisant le contexte
function UserSection() {
  const { control } = useFormContext<FormData>();
  const { currentSection } = useFormState();

  if (currentSection !== "user") return null;

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="user.firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>First Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="user.lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Last Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="user.email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function PreferencesSection() {
  const { control } = useFormContext<FormData>();
  const { currentSection } = useFormState();

  if (currentSection !== "preferences") return null;

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="preferences.theme"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Theme</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="preferences.notifications"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Enable notifications</FormLabel>
              <FormDescription>
                Receive email notifications about updates and changes.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}

// Navigation entre sections
function FormNavigation() {
  const { currentSection, setCurrentSection, isValid } = useFormState();
  const { trigger } = useFormContext<FormData>();

  const sections = [
    { id: "user", label: "User Info" },
    { id: "preferences", label: "Preferences" },
    { id: "billing", label: "Billing" },
  ];

  const handleSectionChange = async (sectionId: string) => {
    // Valider la section actuelle avant de changer
    const isCurrentSectionValid = await trigger(currentSection as any);
    if (isCurrentSectionValid) {
      setCurrentSection(sectionId);
    }
  };

  return (
    <nav className="flex space-x-2">
      {sections.map((section) => (
        <Button
          key={section.id}
          type="button"
          variant={currentSection === section.id ? "default" : "outline"}
          onClick={() => handleSectionChange(section.id)}
        >
          {section.label}
        </Button>
      ))}
    </nav>
  );
}

// Formulaire principal
export function ComplexForm() {
  const { handleSubmit } = useFormContext<FormData>();
  const { isValid, isDirty } = useFormState();

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
  };

  return (
    <ComplexFormProvider>
      <div className="max-w-2xl mx-auto space-y-6">
        <FormNavigation />

        <Form>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <UserSection />
            <PreferencesSection />
            <BillingSection />

            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={!isValid || !isDirty}>
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </ComplexFormProvider>
  );
}
```

## 6. Implications Avancées pour le CLI

### 6.1 Génération de Formulaires Complexes

Le CLI devra détecter et générer automatiquement :

**Patterns avancés :**

- Formulaires multi-étapes avec navigation
- Champs dynamiques avec useFieldArray
- Validation conditionnelle et dépendante
- Intégration complète shadcn/ui
- Gestion d'état avec Context API

**Templates de génération :**

```typescript
// Générateur de formulaire multi-étapes
export const generateMultiStepForm = (steps: FormStep[]) => {
  const schemas = steps.map((step) => generateStepSchema(step));
  const components = steps.map((step) => generateStepComponent(step));

  return `
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

${schemas.join("\n\n")}

const fullSchema = ${steps.map((s) => s.schemaName).join(".merge(")}

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})

  const form = useForm({
    resolver: zodResolver(steps[currentStep].schema),
    defaultValues: formData,
  })

  // Navigation logic...

  return (
    <Form {...form}>
      {currentStep === 0 && <Step1 />}
      {currentStep === 1 && <Step2 />}
      {/* ... */}
    </Form>
  )
}

${components.join("\n\n")}
`;
};

// Générateur de champs dynamiques
export const generateDynamicFields = (arrayFields: ArrayField[]) => {
  return arrayFields
    .map(
      (field) => `
const {
  fields: ${field.name}Fields,
  append: append${pascalCase(field.name)},
  remove: remove${pascalCase(field.name)},
} = useFieldArray({
  control: form.control,
  name: "${field.name}",
})
`
    )
    .join("\n");
};
```

### 6.2 Détection de Patterns Complexes

Le CLI devra identifier :

- **Formulaires multi-sections** → Navigation et état partagé
- **Champs répétables** → useFieldArray et gestion dynamique
- **Validation croisée** → Dépendances entre champs
- **Upload de fichiers** → Gestion spécialisée
- **Formulaires conditionnels** → Affichage conditionnel

## Conclusion

Les patterns de formulaires avec React Hook Form et Zod offrent une base très structurée pour la génération automatique. Le CLI devra implémenter des templates qui couvrent la validation, la gestion d'erreurs, et l'intégration avec les composants UI, tout en générant automatiquement les schémas Zod et les types TypeScript correspondants.

Les patterns avancés comme les formulaires multi-étapes, les champs dynamiques et l'intégration shadcn/ui nécessitent une détection intelligente des besoins pour générer automatiquement des formulaires complexes et maintenables. L'intégration avec shadcn/ui Form components permet une génération de formulaires cohérente et accessible, tandis que les patterns de validation Zod assurent une validation robuste côté client et serveur.
