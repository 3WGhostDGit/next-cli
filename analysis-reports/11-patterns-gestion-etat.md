# Analyse des Patterns de Gestion d'État

## Vue d'ensemble

Cette analyse examine les patterns de gestion d'état dans les applications React modernes, couvrant l'état local (useState, useReducer), l'état global (Context, Zustand), l'état serveur (TanStack Query), et les patterns d'optimisation.

## ANALYSE EN DEUX TEMPS

### Temps 1 : État local et global

- useState, useReducer, useContext patterns
- Zustand pour l'état global simple
- Patterns de composition et performance

### Temps 2 : État serveur et patterns avancés

- TanStack Query pour l'état serveur
- Optimistic updates et cache management
- Patterns de synchronisation et persistence

## 1. Patterns d'État Local

### 1.1 useState Patterns Fondamentaux

```typescript
// État simple
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(false);

// État complexe avec objet
const [formData, setFormData] = useState({
  name: "",
  email: "",
  preferences: {
    theme: "light",
    notifications: true,
  },
});

// Mise à jour immutable
const updateFormData = (field: string, value: any) => {
  setFormData((prev) => ({
    ...prev,
    [field]: value,
  }));
};

// Mise à jour nested
const updatePreference = (key: string, value: any) => {
  setFormData((prev) => ({
    ...prev,
    preferences: {
      ...prev.preferences,
      [key]: value,
    },
  }));
};
```

### 1.2 useReducer pour État Complexe

```typescript
// Types pour le reducer
type State = {
  items: Item[];
  loading: boolean;
  error: string | null;
  filter: "all" | "active" | "completed";
};

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Item[] }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "ADD_ITEM"; payload: Item }
  | { type: "UPDATE_ITEM"; payload: { id: string; updates: Partial<Item> } }
  | { type: "DELETE_ITEM"; payload: string }
  | { type: "SET_FILTER"; payload: State["filter"] };

// Reducer function
const itemsReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };

    case "FETCH_SUCCESS":
      return { ...state, loading: false, items: action.payload };

    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };

    case "ADD_ITEM":
      return { ...state, items: [...state.items, action.payload] };

    case "UPDATE_ITEM":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        ),
      };

    case "DELETE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case "SET_FILTER":
      return { ...state, filter: action.payload };

    default:
      return state;
  }
};

// Usage dans le composant
const ItemsManager = () => {
  const [state, dispatch] = useReducer(itemsReducer, {
    items: [],
    loading: false,
    error: null,
    filter: "all",
  });

  const addItem = (item: Omit<Item, "id">) => {
    const newItem = { ...item, id: generateId() };
    dispatch({ type: "ADD_ITEM", payload: newItem });
  };

  const updateItem = (id: string, updates: Partial<Item>) => {
    dispatch({ type: "UPDATE_ITEM", payload: { id, updates } });
  };

  const deleteItem = (id: string) => {
    dispatch({ type: "DELETE_ITEM", payload: id });
  };

  const filteredItems = useMemo(() => {
    switch (state.filter) {
      case "active":
        return state.items.filter((item) => !item.completed);
      case "completed":
        return state.items.filter((item) => item.completed);
      default:
        return state.items;
    }
  }, [state.items, state.filter]);

  return (
    <div>
      <ItemForm onSubmit={addItem} />
      <FilterButtons
        current={state.filter}
        onChange={(filter) => dispatch({ type: "SET_FILTER", payload: filter })}
      />
      <ItemList
        items={filteredItems}
        onUpdate={updateItem}
        onDelete={deleteItem}
      />
    </div>
  );
};
```

### 1.3 Custom Hooks pour Logique Réutilisable

```typescript
// Hook pour gestion de formulaire
const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: z.ZodSchema<T>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = (field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const setFieldTouched = (field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const validate = () => {
    if (!validationSchema) return true;

    try {
      validationSchema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        setErrors(fieldErrors as any);
      }
      return false;
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
};

// Hook pour gestion de liste avec filtrage
const useFilteredList = <T>(
  items: T[],
  filterFn: (item: T, query: string) => boolean
) => {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredItems = useMemo(() => {
    let result = items.filter((item) => filterFn(item, query));

    if (sortBy) {
      result.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];

        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [items, query, sortBy, sortOrder, filterFn]);

  return {
    query,
    setQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredItems,
    totalCount: items.length,
    filteredCount: filteredItems.length,
  };
};
```

## 2. Patterns d'État Global avec Context

### 2.1 Context Pattern Basique

```typescript
// Types pour le contexte
interface AppState {
  user: User | null;
  theme: "light" | "dark";
  sidebarOpen: boolean;
  notifications: Notification[];
}

interface AppContextType {
  state: AppState;
  actions: {
    setUser: (user: User | null) => void;
    toggleTheme: () => void;
    toggleSidebar: () => void;
    addNotification: (notification: Omit<Notification, "id">) => void;
    removeNotification: (id: string) => void;
  };
}

// Context creation
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>({
    user: null,
    theme: "light",
    sidebarOpen: true,
    notifications: [],
  });

  const actions = useMemo(
    () => ({
      setUser: (user: User | null) => {
        setState((prev) => ({ ...prev, user }));
      },

      toggleTheme: () => {
        setState((prev) => ({
          ...prev,
          theme: prev.theme === "light" ? "dark" : "light",
        }));
      },

      toggleSidebar: () => {
        setState((prev) => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
      },

      addNotification: (notification: Omit<Notification, "id">) => {
        const newNotification = { ...notification, id: generateId() };
        setState((prev) => ({
          ...prev,
          notifications: [...prev.notifications, newNotification],
        }));
      },

      removeNotification: (id: string) => {
        setState((prev) => ({
          ...prev,
          notifications: prev.notifications.filter((n) => n.id !== id),
        }));
      },
    }),
    []
  );

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook pour utiliser le contexte
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

// Hooks spécialisés pour éviter les re-renders
export const useUser = () => {
  const { state } = useApp();
  return state.user;
};

export const useTheme = () => {
  const { state, actions } = useApp();
  return {
    theme: state.theme,
    toggleTheme: actions.toggleTheme,
  };
};
```

### 2.2 Context avec useReducer pour État Complexe

```typescript
// Actions pour le reducer
type AppAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "TOGGLE_THEME" }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "ADD_NOTIFICATION"; payload: Omit<Notification, "id"> }
  | { type: "REMOVE_NOTIFICATION"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };

    case "TOGGLE_THEME":
      return {
        ...state,
        theme: state.theme === "light" ? "dark" : "light",
      };

    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [
          ...state.notifications,
          { ...action.payload, id: generateId() },
        ],
      };

    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload
        ),
      };

    default:
      return state;
  }
};

// Provider avec useReducer
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = useMemo(
    () => ({
      setUser: (user: User | null) =>
        dispatch({ type: "SET_USER", payload: user }),
      toggleTheme: () => dispatch({ type: "TOGGLE_THEME" }),
      toggleSidebar: () => dispatch({ type: "TOGGLE_SIDEBAR" }),
      addNotification: (notification: Omit<Notification, "id">) =>
        dispatch({ type: "ADD_NOTIFICATION", payload: notification }),
      removeNotification: (id: string) =>
        dispatch({ type: "REMOVE_NOTIFICATION", payload: id }),
    }),
    []
  );

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};
```

## 3. Patterns Zustand pour État Global Simple

### 3.1 Store Zustand Basique

```typescript
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,

        setUser: (user) =>
          set({
            user,
            isAuthenticated: !!user,
          }),

        logout: () =>
          set({
            user: null,
            isAuthenticated: false,
          }),
      }),
      {
        name: "user-storage",
        partialize: (state) => ({ user: state.user }),
      }
    ),
    { name: "user-store" }
  )
);
```

### 3.2 Store Zustand avec Slices Pattern

```typescript
// Slice pour l'authentification
interface AuthSlice {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const createAuthSlice: StateCreator<
  AuthSlice & UISlice & NotificationSlice,
  [],
  [],
  AuthSlice
> = (set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
});

// Slice pour l'UI
interface UISlice {
  theme: "light" | "dark";
  sidebarOpen: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

const createUISlice: StateCreator<
  AuthSlice & UISlice & NotificationSlice,
  [],
  [],
  UISlice
> = (set) => ({
  theme: "light",
  sidebarOpen: true,

  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    })),

  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),
});

// Slice pour les notifications
interface NotificationSlice {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
}

const createNotificationSlice: StateCreator<
  AuthSlice & UISlice & NotificationSlice,
  [],
  [],
  NotificationSlice
> = (set) => ({
  notifications: [],

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: generateId() },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
});

// Store combiné
export const useAppStore = create<AuthSlice & UISlice & NotificationSlice>()(
  devtools(
    persist(
      (...a) => ({
        ...createAuthSlice(...a),
        ...createUISlice(...a),
        ...createNotificationSlice(...a),
      }),
      {
        name: "app-storage",
        partialize: (state) => ({
          user: state.user,
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    { name: "app-store" }
  )
);

// Hooks spécialisés pour éviter les re-renders
export const useAuth = () =>
  useAppStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    setUser: state.setUser,
    logout: state.logout,
  }));

export const useUI = () =>
  useAppStore((state) => ({
    theme: state.theme,
    sidebarOpen: state.sidebarOpen,
    toggleTheme: state.toggleTheme,
    toggleSidebar: state.toggleSidebar,
  }));
```

## 4. Patterns d'État Serveur avec TanStack Query

### 4.1 Configuration QueryClient

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Configuration globale du QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Ne pas retry sur les erreurs 4xx
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      gcTime: 5 * 60 * 1000,
    },
  },
});

// Provider principal
export const QueryProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
```

### 4.2 Hooks de Requêtes Typées

```typescript
// Types pour les API
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

// Hooks pour les utilisateurs
export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<User[]> => {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    },
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async (): Promise<User> => {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      return response.json();
    },
    enabled: !!id,
  });
};

// Hooks pour les posts avec pagination
export const usePosts = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["posts", { page, limit }],
    queryFn: async (): Promise<{
      posts: Post[];
      total: number;
      pages: number;
    }> => {
      const response = await fetch(`/api/posts?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      return response.json();
    },
    keepPreviousData: true,
  });
};

export const usePost = (id: string) => {
  return useQuery({
    queryKey: ["posts", id],
    queryFn: async (): Promise<Post> => {
      const response = await fetch(`/api/posts/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch post");
      }
      return response.json();
    },
    enabled: !!id,
  });
};
```

### 4.3 Mutations avec Optimistic Updates

```typescript
// Hook pour créer un post
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newPost: Omit<Post, "id" | "createdAt" | "updatedAt">
    ): Promise<Post> => {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      return response.json();
    },

    onMutate: async (newPost) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Snapshot previous value
      const previousPosts = queryClient.getQueryData(["posts"]);

      // Optimistically update
      const optimisticPost: Post = {
        ...newPost,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(["posts"], (old: any) => {
        if (!old) return { posts: [optimisticPost], total: 1, pages: 1 };
        return {
          ...old,
          posts: [optimisticPost, ...old.posts],
          total: old.total + 1,
        };
      });

      return { previousPosts };
    },

    onError: (err, newPost, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
    },

    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// Hook pour mettre à jour un post
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Post>;
    }): Promise<Post> => {
      const response = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update post");
      }

      return response.json();
    },

    onSuccess: (updatedPost) => {
      // Update specific post in cache
      queryClient.setQueryData(["posts", updatedPost.id], updatedPost);

      // Update post in lists
      queryClient.setQueriesData(
        { queryKey: ["posts"], type: "active" },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            posts: old.posts.map((post: Post) =>
              post.id === updatedPost.id ? updatedPost : post
            ),
          };
        }
      );
    },
  });
};

// Hook pour supprimer un post
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPosts = queryClient.getQueryData(["posts"]);

      // Optimistically remove
      queryClient.setQueryData(["posts"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          posts: old.posts.filter((post: Post) => post.id !== id),
          total: old.total - 1,
        };
      });

      return { previousPosts };
    },

    onError: (err, id, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
    },

    onSuccess: (_, id) => {
      // Remove from individual cache
      queryClient.removeQueries({ queryKey: ["posts", id] });
    },
  });
};
```

### 4.4 Patterns de Cache et Synchronisation

```typescript
// Hook pour prefetch des données
export const usePrefetchPost = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (id: string) => {
      queryClient.prefetchQuery({
        queryKey: ["posts", id],
        queryFn: async () => {
          const response = await fetch(`/api/posts/${id}`);
          return response.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    },
    [queryClient]
  );
};

// Hook pour invalidation sélective
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  return {
    invalidatePosts: () =>
      queryClient.invalidateQueries({ queryKey: ["posts"] }),
    invalidateUsers: () =>
      queryClient.invalidateQueries({ queryKey: ["users"] }),
    invalidateAll: () => queryClient.invalidateQueries(),
  };
};

// Hook pour gestion du cache offline
export const useOfflineSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = () => {
      queryClient.resumePausedMutations();
      queryClient.invalidateQueries();
    };

    const handleOffline = () => {
      // Optionally pause mutations
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [queryClient]);
};
```

## 5. Patterns d'Optimisation et Performance

### 5.1 Sélecteurs et Mémoisation

```typescript
// Sélecteurs optimisés pour Zustand
export const useUserName = () => useAppStore((state) => state.user?.name);
export const useIsAuthenticated = () =>
  useAppStore((state) => state.isAuthenticated);
export const useTheme = () => useAppStore((state) => state.theme);

// Sélecteurs avec égalité shallow
import { shallow } from "zustand/vanilla/shallow";

export const useUIState = () =>
  useAppStore(
    (state) => ({
      theme: state.theme,
      sidebarOpen: state.sidebarOpen,
    }),
    shallow
  );

// Mémoisation avec React Query
export const usePostsWithAuthors = () => {
  const { data: posts } = usePosts();
  const { data: users } = useUsers();

  return useMemo(() => {
    if (!posts || !users) return [];

    return posts.posts.map((post) => ({
      ...post,
      author: users.find((user) => user.id === post.authorId),
    }));
  }, [posts, users]);
};
```

### 5.2 Patterns de Composition

```typescript
// Hook composé pour gestion complète d'entité
export const usePostManagement = (postId?: string) => {
  const post = usePost(postId!);
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();
  const prefetchPost = usePrefetchPost();

  const handleCreate = useCallback(
    (data: Omit<Post, "id" | "createdAt" | "updatedAt">) => {
      return createPost.mutateAsync(data);
    },
    [createPost]
  );

  const handleUpdate = useCallback(
    (updates: Partial<Post>) => {
      if (!postId) return;
      return updatePost.mutateAsync({ id: postId, updates });
    },
    [postId, updatePost]
  );

  const handleDelete = useCallback(() => {
    if (!postId) return;
    return deletePost.mutateAsync(postId);
  }, [postId, deletePost]);

  return {
    // Data
    post: post.data,
    isLoading: post.isLoading,
    error: post.error,

    // Actions
    create: handleCreate,
    update: handleUpdate,
    delete: handleDelete,
    prefetch: prefetchPost,

    // States
    isCreating: createPost.isPending,
    isUpdating: updatePost.isPending,
    isDeleting: deletePost.isPending,

    // Errors
    createError: createPost.error,
    updateError: updatePost.error,
    deleteError: deletePost.error,
  };
};
```

## 6. Implications pour le CLI

### 6.1 Génération Automatique de Patterns d'État

Le CLI devra détecter et générer automatiquement :

**État local :**

- Custom hooks pour formulaires avec validation Zod
- useReducer pour état complexe avec actions typées
- Patterns d'optimisation avec useMemo/useCallback

**État global :**

- Context providers avec hooks spécialisés
- Stores Zustand avec persistence et devtools
- Patterns de composition pour éviter les re-renders

**État serveur :**

- Configuration TanStack Query avec cache
- Patterns d'optimistic updates
- Synchronisation et invalidation automatique

### 6.2 Templates de Génération

```typescript
// Générateur de store Zustand
export const generateZustandStore = (entity: EntityConfig) => {
  const hasAuth = entity.requiresAuth;
  const hasPersistence = entity.persistent;

  return `
import { create } from 'zustand'
${hasPersistence ? "import { persist } from 'zustand/middleware'" : ""}
import { devtools } from 'zustand/middleware'

interface ${entity.name}State {
  ${entity.fields.map((field) => `${field.name}: ${field.type}`).join("\n  ")}

  // Actions
  set${entity.name}: (${entity.name.toLowerCase()}: ${entity.name}) => void
  update${entity.name}: (updates: Partial<${entity.name}>) => void
  reset${entity.name}: () => void
}

export const use${entity.name}Store = create<${entity.name}State>()(
  devtools(
    ${hasPersistence ? "persist(" : ""}
      (set) => ({
        ${entity.fields
          .map((field) => `${field.name}: ${field.defaultValue || "null"}`)
          .join(",\n        ")},

        set${
          entity.name
        }: (${entity.name.toLowerCase()}) => set({ ${entity.name.toLowerCase()} }),

        update${entity.name}: (updates) => set((state) => ({
          ${entity.name.toLowerCase()}: { ...state.${entity.name.toLowerCase()}, ...updates }
        })),

        reset${entity.name}: () => set({
          ${entity.fields
            .map((field) => `${field.name}: ${field.defaultValue || "null"}`)
            .join(",\n          ")}
        })
      })${
        hasPersistence
          ? `,
      {
        name: '${entity.name.toLowerCase()}-storage',
        partialize: (state) => ({ ${entity.name.toLowerCase()}: state.${entity.name.toLowerCase()} })
      }
    )`
          : ""
      }
  )
)
`;
};

// Générateur de hooks TanStack Query
export const generateQueryHooks = (entity: EntityConfig) => {
  return `
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Hook pour récupérer tous les ${entity.name.toLowerCase()}s
export const use${entity.name}s = () => {
  return useQuery({
    queryKey: ['${entity.name.toLowerCase()}s'],
    queryFn: async (): Promise<${entity.name}[]> => {
      const response = await fetch('/api/${entity.name.toLowerCase()}s')
      if (!response.ok) throw new Error('Failed to fetch ${entity.name.toLowerCase()}s')
      return response.json()
    }
  })
}

// Hook pour récupérer un ${entity.name.toLowerCase()} spécifique
export const use${entity.name} = (id: string) => {
  return useQuery({
    queryKey: ['${entity.name.toLowerCase()}s', id],
    queryFn: async (): Promise<${entity.name}> => {
      const response = await fetch(\`/api/${entity.name.toLowerCase()}s/\${id}\`)
      if (!response.ok) throw new Error('Failed to fetch ${entity.name.toLowerCase()}')
      return response.json()
    },
    enabled: !!id
  })
}

// Hook pour créer un ${entity.name.toLowerCase()}
export const useCreate${entity.name} = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (new${entity.name}: Omit<${
    entity.name
  }, 'id'>): Promise<${entity.name}> => {
      const response = await fetch('/api/${entity.name.toLowerCase()}s', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(new${entity.name})
      })

      if (!response.ok) throw new Error('Failed to create ${entity.name.toLowerCase()}')
      return response.json()
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${entity.name.toLowerCase()}s'] })
    }
  })
}

// Hook pour mettre à jour un ${entity.name.toLowerCase()}
export const useUpdate${entity.name} = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<${
      entity.name
    }> }): Promise<${entity.name}> => {
      const response = await fetch(\`/api/${entity.name.toLowerCase()}s/\${id}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) throw new Error('Failed to update ${entity.name.toLowerCase()}')
      return response.json()
    },

    onSuccess: (updated${entity.name}) => {
      queryClient.setQueryData(['${entity.name.toLowerCase()}s', updated${
    entity.name
  }.id], updated${entity.name})
      queryClient.invalidateQueries({ queryKey: ['${entity.name.toLowerCase()}s'] })
    }
  })
}
`;
};
```

### 6.3 Détection de Patterns

Le CLI devra identifier :

- **Formulaires complexes** → Custom hooks avec validation
- **État partagé** → Context ou Zustand selon la complexité
- **Données serveur** → TanStack Query avec cache management
- **Besoins de persistence** → Zustand persist ou localStorage hooks
- **Optimistic updates** → Mutations avec rollback automatique

## Conclusion

Les patterns de gestion d'état modernes offrent une base solide pour la génération automatique. Le CLI devra implémenter des templates qui couvrent l'état local avec custom hooks, l'état global avec Context/Zustand, et l'état serveur avec TanStack Query.

L'intégration de ces patterns permet une architecture scalable et maintenable, avec une séparation claire des responsabilités entre état local, global et serveur. Les patterns d'optimisation garantissent des performances optimales même avec des applications complexes.
