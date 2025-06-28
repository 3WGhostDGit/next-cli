# Analyse des Patterns de Gestion d'Erreurs

## Vue d'ensemble

Cette analyse examine les patterns de gestion d'erreurs Next.js, les error boundaries, les pages d'erreur personnalisées, le logging, le monitoring, et les stratégies de récupération d'erreurs.

## ANALYSE EN DEUX TEMPS

### Temps 1 : Error boundaries et pages d'erreur
- Error boundaries Next.js (error.tsx, global-error.tsx)
- Pages d'erreur personnalisées (not-found.tsx, 404, 500)
- Gestion d'erreurs dans les Server Components et Client Components

### Temps 2 : Logging et monitoring avancé
- Logging centralisé et monitoring d'erreurs
- Intégration avec des services externes (Sentry, DataDog)
- Patterns de récupération et retry automatique

## 1. Error Boundaries Next.js

### 1.1 Error Boundary Local (error.tsx)
```typescript
// app/dashboard/error.tsx
'use client' // Error boundaries doivent être des Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log l'erreur vers un service de monitoring
    console.error('Dashboard error:', error)
    
    // Envoyer vers un service externe
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          digest: error.digest,
          timestamp: new Date().toISOString(),
          page: '/dashboard'
        })
      }).catch(console.error)
    }
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-center space-y-4">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
        <h2 className="text-2xl font-bold">Quelque chose s'est mal passé</h2>
        <p className="text-muted-foreground max-w-md">
          Une erreur inattendue s'est produite dans le tableau de bord. 
          Nos équipes ont été notifiées.
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left bg-muted p-4 rounded-md">
            <summary className="cursor-pointer font-medium">
              Détails de l'erreur (dev)
            </summary>
            <pre className="mt-2 text-sm overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
        
        <div className="flex gap-2 justify-center">
          <Button onClick={reset} variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### 1.2 Error Boundary Global (global-error.tsx)
```typescript
// app/global-error.tsx
'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log critique - erreur au niveau de l'application
    console.error('Global application error:', error)
    
    // Notification immédiate pour les erreurs critiques
    fetch('/api/errors/critical', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        timestamp: new Date().toISOString(),
        level: 'critical',
        userAgent: navigator.userAgent
      })
    }).catch(() => {
      // Fallback si même l'API d'erreur échoue
      console.error('Failed to report critical error')
    })
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#dc2626' }}>
              Erreur Critique
            </h1>
            <p style={{ marginBottom: '2rem', color: '#6b7280' }}>
              Une erreur critique s'est produite. L'application ne peut pas continuer.
              Nos équipes ont été automatiquement notifiées.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={reset}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Redémarrer l'application
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Recharger la page
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
```

### 1.3 Error Boundary Personnalisé avec Context
```typescript
// components/error-boundary.tsx
'use client'

import React, { Component, ErrorInfo, ReactNode, createContext, useContext } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

interface ErrorBoundaryContextType {
  reportError: (error: Error, errorInfo?: ErrorInfo) => void
}

const ErrorBoundaryContext = createContext<ErrorBoundaryContextType | null>(null)

export function useErrorBoundary() {
  const context = useContext(ErrorBoundaryContext)
  if (!context) {
    throw new Error('useErrorBoundary must be used within ErrorBoundaryProvider')
  }
  return context
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    
    // Log l'erreur
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Callback personnalisé
    this.props.onError?.(error, errorInfo)
    
    // Envoyer vers le monitoring
    this.reportError(error, errorInfo)
  }

  reportError = async (error: Error, errorInfo?: ErrorInfo) => {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo?.componentStack,
          timestamp: new Date().toISOString(),
          url: window.location.href
        })
      })
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }

      return (
        <div className="error-boundary">
          <h2>Quelque chose s'est mal passé</h2>
          <button onClick={this.reset}>Réessayer</button>
        </div>
      )
    }

    return (
      <ErrorBoundaryContext.Provider value={{ reportError: this.reportError }}>
        {this.props.children}
      </ErrorBoundaryContext.Provider>
    )
  }
}
```

## 2. Pages d'Erreur Personnalisées

### 2.1 Page Not Found (not-found.tsx)
```typescript
// app/not-found.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
          <h2 className="text-2xl font-semibold">Page non trouvée</h2>
          <p className="text-muted-foreground">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/search">
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Link>
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Besoin d'aide ? <Link href="/contact" className="underline">Contactez-nous</Link></p>
        </div>
      </div>
    </div>
  )
}
```

### 2.2 Page Not Found Dynamique
```typescript
// app/posts/[slug]/not-found.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PostNotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Article non trouvé</h1>
        <p className="text-xl text-muted-foreground">
          L'article que vous recherchez n'existe pas ou a été supprimé.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/posts">
              Voir tous les articles
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/">
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

// Utilisation dans la page
// app/posts/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getPostBySlug } from '@/lib/posts'

export default async function PostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound() // Déclenche le rendu de not-found.tsx
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}
```

## 3. Gestion d'Erreurs dans les Server Actions

### 3.1 Server Actions avec Gestion d'Erreurs
```typescript
// app/actions/posts.ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

const CreatePostSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(100),
  content: z.string().min(10, 'Le contenu doit contenir au moins 10 caractères'),
  published: z.boolean().default(false)
})

export type ActionResult<T = any> = {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function createPost(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Vérification de l'authentification
    const session = await auth.api.getSession()
    if (!session) {
      return {
        success: false,
        error: 'Vous devez être connecté pour créer un article'
      }
    }

    // Validation des données
    const validatedFields = CreatePostSchema.safeParse({
      title: formData.get('title'),
      content: formData.get('content'),
      published: formData.get('published') === 'on'
    })

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Données invalides',
        fieldErrors: validatedFields.error.flatten().fieldErrors
      }
    }

    const { title, content, published } = validatedFields.data

    // Création du post
    const post = await db.post.create({
      data: {
        title,
        content,
        published,
        authorId: session.user.id
      }
    })

    // Revalidation du cache
    revalidatePath('/posts')
    revalidatePath('/dashboard/posts')

    // Redirection vers le post créé
    redirect(`/posts/${post.id}`)

  } catch (error) {
    console.error('Error creating post:', error)

    // Gestion des erreurs spécifiques
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Données invalides',
        fieldErrors: error.flatten().fieldErrors
      }
    }

    // Erreurs de base de données
    if (error.code === 'P2002') {
      return {
        success: false,
        error: 'Un article avec ce titre existe déjà'
      }
    }

    // Erreur générique
    return {
      success: false,
      error: 'Une erreur inattendue s\'est produite. Veuillez réessayer.'
    }
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession()
    if (!session) {
      return {
        success: false,
        error: 'Authentification requise'
      }
    }

    // Vérifier que l'utilisateur est propriétaire du post
    const post = await db.post.findUnique({
      where: { id },
      select: { authorId: true }
    })

    if (!post) {
      return {
        success: false,
        error: 'Article non trouvé'
      }
    }

    if (post.authorId !== session.user.id) {
      return {
        success: false,
        error: 'Vous n\'êtes pas autorisé à supprimer cet article'
      }
    }

    await db.post.delete({ where: { id } })

    revalidatePath('/posts')
    revalidatePath('/dashboard/posts')

    return {
      success: true,
      data: { message: 'Article supprimé avec succès' }
    }

  } catch (error) {
    console.error('Error deleting post:', error)
    return {
      success: false,
      error: 'Erreur lors de la suppression'
    }
  }
}
```

### 3.2 Hook pour Gestion d'État des Actions
```typescript
// hooks/use-action-state.ts
'use client'

import { useActionState } from 'react'
import { useEffect } from 'react'
import { toast } from 'sonner'
import type { ActionResult } from '@/app/actions/posts'

export function useActionWithToast<T extends any[]>(
  action: (...args: T) => Promise<ActionResult>,
  initialState: ActionResult = { success: false }
) {
  const [state, formAction, isPending] = useActionState(action, initialState)

  useEffect(() => {
    if (state.success && state.data?.message) {
      toast.success(state.data.message)
    } else if (!state.success && state.error) {
      toast.error(state.error)
    }
  }, [state])

  return [state, formAction, isPending] as const
}

// Utilisation dans un composant
export function CreatePostForm() {
  const [state, formAction, isPending] = useActionWithToast(createPost)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="title">Titre</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className={state.fieldErrors?.title ? 'border-red-500' : ''}
        />
        {state.fieldErrors?.title && (
          <p className="text-red-500 text-sm">{state.fieldErrors.title[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="content">Contenu</label>
        <textarea
          id="content"
          name="content"
          required
          className={state.fieldErrors?.content ? 'border-red-500' : ''}
        />
        {state.fieldErrors?.content && (
          <p className="text-red-500 text-sm">{state.fieldErrors.content[0]}</p>
        )}
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? 'Création...' : 'Créer l\'article'}
      </button>

      {state.error && !state.fieldErrors && (
        <p className="text-red-500">{state.error}</p>
      )}
    </form>
  )
}
```

## 4. Logging et Monitoring Centralisé

### 4.1 Service de Logging
```typescript
// lib/logger.ts
interface LogLevel {
  ERROR: 'error'
  WARN: 'warn'
  INFO: 'info'
  DEBUG: 'debug'
}

interface LogEntry {
  level: keyof LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: {
    message: string
    stack?: string
    name: string
  }
  user?: {
    id: string
    email: string
  }
  request?: {
    url: string
    method: string
    userAgent: string
    ip: string
  }
}

class Logger {
  private static instance: Logger
  private isDevelopment = process.env.NODE_ENV === 'development'

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private async sendToExternal(entry: LogEntry) {
    if (this.isDevelopment) return

    try {
      // Envoyer vers Sentry, DataDog, ou autre service
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      })
    } catch (error) {
      console.error('Failed to send log to external service:', error)
    }
  }

  private createEntry(
    level: keyof LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    }
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    const entry = this.createEntry('ERROR', message, context, error)
    console.error(message, error, context)
    this.sendToExternal(entry)
  }

  warn(message: string, context?: Record<string, any>) {
    const entry = this.createEntry('WARN', message, context)
    console.warn(message, context)
    this.sendToExternal(entry)
  }

  info(message: string, context?: Record<string, any>) {
    const entry = this.createEntry('INFO', message, context)
    console.info(message, context)
    this.sendToExternal(entry)
  }

  debug(message: string, context?: Record<string, any>) {
    if (this.isDevelopment) {
      const entry = this.createEntry('DEBUG', message, context)
      console.debug(message, context)
    }
  }
}

export const logger = Logger.getInstance()
```

### 4.2 API Route pour Logging
```typescript
// app/api/logs/route.ts
import { NextRequest } from 'next/server'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const logEntry = await request.json()
    
    // Validation basique
    if (!logEntry.level || !logEntry.message) {
      return Response.json({ error: 'Invalid log entry' }, { status: 400 })
    }

    // Ajouter des informations de contexte
    const enrichedEntry = {
      ...logEntry,
      request: {
        url: request.url,
        method: request.method,
        userAgent: request.headers.get('user-agent') || 'unknown',
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }
    }

    // Envoyer vers le service de monitoring externe
    await sendToMonitoringService(enrichedEntry)

    return Response.json({ success: true })

  } catch (error) {
    console.error('Error processing log entry:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function sendToMonitoringService(logEntry: any) {
  // Intégration avec Sentry
  if (process.env.SENTRY_DSN) {
    // Sentry.captureException ou Sentry.captureMessage
  }

  // Intégration avec DataDog
  if (process.env.DATADOG_API_KEY) {
    await fetch('https://http-intake.logs.datadoghq.com/v1/input/' + process.env.DATADOG_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    })
  }

  // Intégration avec LogRocket, Mixpanel, etc.
}
```

## 5. Implications pour le CLI

### 5.1 Génération Automatique d'Error Handling

Le CLI devra détecter et générer automatiquement :

**Error boundaries :**
- error.tsx pour chaque route segment
- global-error.tsx au niveau racine
- Error boundaries personnalisés pour les composants critiques

**Pages d'erreur :**
- not-found.tsx personnalisées par section
- Pages 404 et 500 avec design cohérent
- Gestion des erreurs de validation dans les formulaires

**Logging et monitoring :**
- Service de logging centralisé
- Intégration avec des services externes
- API routes pour la collecte d'erreurs

### 5.2 Détection de Patterns

Le CLI devra identifier :
- **Composants critiques** → Error boundaries dédiés
- **Formulaires** → Gestion d'erreurs de validation
- **API calls** → Retry automatique et fallbacks
- **Server Actions** → Gestion d'erreurs typées
- **Pages dynamiques** → not-found.tsx appropriés

## Conclusion

Les patterns de gestion d'erreurs Next.js offrent un système robuste pour créer des applications résilientes. Le CLI devra implémenter des templates qui couvrent tous les types d'erreurs, du niveau composant au niveau application, avec un logging centralisé et des mécanismes de récupération automatique.

L'intégration de ces patterns permet de créer des applications qui dégradent gracieusement, informent les utilisateurs de manière appropriée, et fournissent aux développeurs les outils nécessaires pour diagnostiquer et résoudre les problèmes rapidement.
