# Analyse de l'Architecture Next.js Moderne

## Vue d'ensemble

Cette analyse examine les patterns d'architecture Next.js 14+ avec App Router, en se concentrant sur la distinction entre Server Components et Client Components, et les bonnes pratiques de structuration de projet.

## 1. Patterns Fondamentaux Server vs Client Components

### 1.1 Server Components (Par défaut)
```typescript
// app/page.tsx - Server Component par défaut
export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  const posts = await data.json()
  
  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  )
}
```

**Caractéristiques identifiées :**
- Rendu côté serveur par défaut
- Accès direct aux APIs et bases de données
- Pas d'interactivité côté client
- Bundle JavaScript réduit

### 1.2 Client Components (avec "use client")
```typescript
// components/interactive-form.tsx
'use client'

import { useState } from 'react'

export default function InteractiveForm() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

**Caractéristiques identifiées :**
- Directive `'use client'` obligatoire en haut du fichier
- Accès aux hooks React (useState, useEffect, etc.)
- Interactivité côté client
- Accès aux APIs du navigateur

## 2. Patterns de Composition

### 2.1 Pattern Supporté : Server Component comme enfant
```typescript
// app/page.tsx (Server Component)
import ClientComponent from './client-component'
import ServerComponent from './server-component'

export default function Page() {
  return (
    <ClientComponent>
      <ServerComponent />
    </ClientComponent>
  )
}
```

### 2.2 Pattern Non-Supporté : Import direct
```typescript
// ❌ INCORRECT
'use client'
import ServerComponent from './server-component' // Erreur !

export default function ClientComponent() {
  return <ServerComponent />
}
```

## 3. Patterns de Layout

### 3.1 Migration du pattern getLayout
**Avant (Pages Router) :**
```javascript
// pages/dashboard/index.js
Page.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>
}
```

**Après (App Router) :**
```javascript
// app/dashboard/layout.tsx (Server Component)
import DashboardLayout from './DashboardLayout'

export default function Layout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>
}

// app/dashboard/DashboardLayout.tsx (Client Component)
'use client'
export default function DashboardLayout({ children }) {
  return (
    <div>
      <h2>My Dashboard</h2>
      {children}
    </div>
  )
}
```

### 3.2 Root Layout Obligatoire
```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

## 4. Patterns de Data Fetching

### 4.1 Server-Side Data Fetching
```typescript
// Server Component avec fetch
async function getProjects() {
  const res = await fetch('https://...', { cache: 'no-store' })
  return res.json()
}

export default async function Dashboard() {
  const projects = await getProjects()
  return (
    <ul>
      {projects.map(project => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  )
}
```

### 4.2 Client-Side Data Fetching avec SWR
```javascript
// Client Component
'use client'
import useSWR from 'swr'

export default function Layout({ children }) {
  const { data, error } = useSWR('/api/navigation', fetcher)
  
  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>
  
  return <>{children}</>
}
```

## 5. Patterns de Navigation et Routing

### 5.1 Hooks de Navigation (Client Components uniquement)
```typescript
'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export default function NavigationComponent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Logique de navigation
}
```

### 5.2 Navigation Active avec useSelectedLayoutSegment
```typescript
'use client'
import { useSelectedLayoutSegment } from 'next/navigation'

export default function NavLink({ slug, children }) {
  const segment = useSelectedLayoutSegment()
  const isActive = slug === segment
  
  return (
    <Link 
      href={`/blog/${slug}`}
      style={{ fontWeight: isActive ? 'bold' : 'normal' }}
    >
      {children}
    </Link>
  )
}
```

## 6. Patterns de Context et Providers

### 6.1 Wrapper Client pour Context
```typescript
// theme-provider.tsx
'use client'
import { createContext } from 'react'

export const ThemeContext = createContext({})

export default function ThemeProvider({ children }) {
  return (
    <ThemeContext.Provider value="dark">
      {children}
    </ThemeContext.Provider>
  )
}
```

### 6.2 Utilisation dans Root Layout
```typescript
// app/layout.tsx (Server Component)
import ThemeProvider from './theme-provider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

## 7. Patterns de Loading et Error Handling

### 7.1 Loading UI
```typescript
// app/loading.tsx
export default function Loading() {
  return <p>Loading...</p>
}
```

### 7.2 Error Boundaries
```typescript
// app/error.tsx
'use client'
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

## 8. Implications pour le CLI

### 8.1 Templates à Générer
1. **Server Component Page** : Template par défaut avec data fetching
2. **Client Component** : Template avec 'use client' et hooks
3. **Layout Server** : Template de layout avec composition
4. **Layout Client** : Template de layout interactif
5. **Loading/Error** : Templates de gestion d'état

### 8.2 Règles de Génération
- **Pages** : Server Component par défaut
- **Formulaires** : Client Component avec 'use client'
- **Navigation** : Client Component avec hooks de routing
- **Layouts avec état** : Client Component
- **Layouts statiques** : Server Component

### 8.3 Détection Automatique
Le CLI devra détecter automatiquement :
- Besoin d'interactivité → Client Component
- Data fetching → Server Component
- Hooks React → Client Component
- Navigation active → Client Component avec useSelectedLayoutSegment

## 9. Bonnes Pratiques Identifiées

1. **Placement de 'use client'** : Le plus bas possible dans l'arbre
2. **Composition** : Passer Server Components comme children
3. **Data Fetching** : Préférer Server Components pour les données
4. **Bundle Size** : Minimiser les Client Components
5. **Sécurité** : Éviter d'exposer des données sensibles aux Client Components

## Conclusion

L'architecture Next.js moderne avec App Router nécessite une approche réfléchie pour la distinction Server/Client Components. Le CLI devra implémenter des templates intelligents qui respectent ces patterns et génèrent automatiquement le bon type de composant selon le contexte d'utilisation.
