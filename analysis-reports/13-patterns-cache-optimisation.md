# Analyse des Patterns de Cache et Optimisation

## Vue d'ensemble

Cette analyse examine les patterns de cache Next.js, les stratégies de revalidation, l'optimisation des performances, ISR, SSG, SSR, streaming, et les techniques d'optimisation avancées.

## ANALYSE EN DEUX TEMPS

### Temps 1 : Cache et revalidation de base
- Cache Next.js fondamental (Data Cache, Router Cache)
- Patterns de revalidation (revalidatePath, revalidateTag)
- ISR et stratégies de rendu

### Temps 2 : Optimisation avancée et performance
- Streaming et optimisation des performances
- Cache personnalisé et stratégies avancées
- Monitoring et métriques de performance

## 1. Patterns de Cache Next.js

### 1.1 Data Cache avec fetch
```typescript
// app/posts/page.tsx
export default async function PostsPage() {
  // Cache avec revalidation automatique
  const posts = await fetch('https://api.example.com/posts', {
    next: { 
      revalidate: 3600, // 1 heure
      tags: ['posts'] 
    }
  })
  
  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

// Cache sans revalidation (statique)
const staticData = await fetch('https://api.example.com/config', {
  next: { revalidate: false }
})

// Pas de cache (dynamique)
const dynamicData = await fetch('https://api.example.com/user', {
  next: { revalidate: 0 }
})
```

### 1.2 unstable_cache pour les Bases de Données
```typescript
// lib/cache.ts
import { unstable_cache } from 'next/cache'
import { db } from '@/lib/db'

export const getCachedPosts = unstable_cache(
  async (userId?: string) => {
    const where = userId ? { authorId: userId } : {}
    
    return await db.post.findMany({
      where,
      include: {
        author: { select: { name: true, avatar: true } },
        tags: true,
        _count: { select: { comments: true, likes: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
  },
  ['posts'], // Cache key base
  {
    tags: ['posts'],
    revalidate: 3600 // 1 heure
  }
)

export const getCachedUser = unstable_cache(
  async (id: string) => {
    return await db.user.findUnique({
      where: { id },
      include: {
        profile: true,
        posts: { take: 5, orderBy: { createdAt: 'desc' } }
      }
    })
  },
  ['user'], // Le paramètre id sera ajouté automatiquement à la clé
  {
    tags: ['users'],
    revalidate: 1800 // 30 minutes
  }
)

// Utilisation dans un composant
export default async function PostsList({ userId }: { userId?: string }) {
  const posts = await getCachedPosts(userId)
  
  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
```

### 1.3 Configuration de Cache par Route
```typescript
// app/posts/layout.tsx
export const revalidate = 3600 // 1 heure pour toute la section posts

// app/dashboard/page.tsx
export const revalidate = 0 // Toujours dynamique

// app/static/page.tsx
export const revalidate = false // Cache indéfini

// app/api/posts/route.ts
export const revalidate = 60 // 1 minute pour l'API
```

## 2. Patterns de Revalidation

### 2.1 Revalidation par Path
```typescript
// app/actions/posts.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const post = await db.post.create({
    data: {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      authorId: formData.get('authorId') as string
    }
  })

  // Revalider les pages affectées
  revalidatePath('/posts') // Liste des posts
  revalidatePath('/dashboard') // Dashboard utilisateur
  revalidatePath('/', 'layout') // Toute l'application
  
  redirect(`/posts/${post.id}`)
}

export async function updatePost(id: string, formData: FormData) {
  await db.post.update({
    where: { id },
    data: {
      title: formData.get('title') as string,
      content: formData.get('content') as string
    }
  })

  // Revalider spécifiquement ce post et les listes
  revalidatePath(`/posts/${id}`)
  revalidatePath('/posts')
  revalidatePath('/dashboard/posts')
}

export async function deletePost(id: string) {
  await db.post.delete({ where: { id } })

  // Revalider les listes mais pas le post supprimé
  revalidatePath('/posts')
  revalidatePath('/dashboard/posts')
  revalidatePath('/', 'layout')
}
```

### 2.2 Revalidation par Tag
```typescript
// app/actions/content.ts
'use server'

import { revalidateTag } from 'next/cache'

export async function updateUserProfile(userId: string, data: any) {
  await db.user.update({
    where: { id: userId },
    data
  })

  // Revalider tous les caches tagués 'users'
  revalidateTag('users')
}

export async function createComment(postId: string, content: string) {
  await db.comment.create({
    data: { postId, content, authorId: 'current-user' }
  })

  // Revalider les posts (car le nombre de commentaires change)
  revalidateTag('posts')
  // Revalider spécifiquement ce post
  revalidateTag(`post-${postId}`)
}

export async function moderateContent(contentId: string, action: 'approve' | 'reject') {
  await db.content.update({
    where: { id: contentId },
    data: { status: action === 'approve' ? 'published' : 'rejected' }
  })

  // Revalider plusieurs tags selon l'action
  revalidateTag('posts')
  revalidateTag('moderation')
  
  if (action === 'approve') {
    revalidateTag('published-content')
  }
}
```

### 2.3 API de Revalidation Externe
```typescript
// app/api/revalidate/route.ts
import { NextRequest } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  // Vérification du secret pour la sécurité
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ message: 'Invalid secret' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { type, target } = body

    switch (type) {
      case 'tag':
        revalidateTag(target)
        break
      
      case 'path':
        revalidatePath(target)
        break
      
      case 'layout':
        revalidatePath(target, 'layout')
        break
      
      default:
        return Response.json({ message: 'Invalid type' }, { status: 400 })
    }

    return Response.json({ 
      revalidated: true, 
      type,
      target,
      timestamp: Date.now() 
    })

  } catch (error) {
    return Response.json({ 
      message: 'Error revalidating',
      error: error.message 
    }, { status: 500 })
  }
}

// Utilisation depuis un webhook externe
// POST /api/revalidate?secret=xxx
// { "type": "tag", "target": "posts" }
```

## 3. Patterns d'Optimisation des Performances

### 3.1 Streaming et Suspense
```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1>Dashboard</h1>
      
      {/* Contenu rapide affiché immédiatement */}
      <QuickStats />
      
      {/* Contenu lent avec streaming */}
      <Suspense fallback={<ChartsSkeleton />}>
        <Charts />
      </Suspense>
      
      <Suspense fallback={<RecentActivitySkeleton />}>
        <RecentActivity />
      </Suspense>
    </div>
  )
}

// Composant avec données lentes
async function Charts() {
  // Simulation d'une requête lente
  const data = await fetch('https://api.example.com/analytics', {
    next: { revalidate: 300 } // 5 minutes
  })
  
  return <ChartsComponent data={data} />
}

async function RecentActivity() {
  const activities = await getCachedRecentActivity()
  
  return (
    <div>
      {activities.map(activity => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  )
}
```

### 3.2 Optimisation des Images
```typescript
// components/optimized-image.tsx
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
}

export function OptimizedImage({ 
  src, 
  alt, 
  width = 800, 
  height = 600,
  priority = false,
  className 
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      style={{
        objectFit: 'cover',
      }}
    />
  )
}

// Configuration next.config.js pour les images
const nextConfig = {
  images: {
    domains: ['example.com', 'cdn.example.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 an
  }
}
```

### 3.3 Préchargement et Prefetch
```typescript
// hooks/use-prefetch.ts
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function usePrefetch() {
  const router = useRouter()

  const prefetchPage = useCallback((href: string) => {
    router.prefetch(href)
  }, [router])

  return { prefetchPage }
}

// components/post-card.tsx
'use client'

import Link from 'next/link'
import { usePrefetch } from '@/hooks/use-prefetch'

export function PostCard({ post }: { post: Post }) {
  const { prefetchPage } = usePrefetch()

  return (
    <div 
      className="post-card"
      onMouseEnter={() => prefetchPage(`/posts/${post.id}`)}
    >
      <Link href={`/posts/${post.id}`}>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
      </Link>
    </div>
  )
}

// Prefetch programmatique
export function usePostPrefetch() {
  const { prefetchPage } = usePrefetch()

  const prefetchRelatedPosts = useCallback(async (postId: string) => {
    const related = await fetch(`/api/posts/${postId}/related`)
    const posts = await related.json()
    
    posts.forEach((post: Post) => {
      prefetchPage(`/posts/${post.id}`)
    })
  }, [prefetchPage])

  return { prefetchRelatedPosts }
}
```

## 4. Cache Personnalisé et Stratégies Avancées

### 4.1 Cache Redis Personnalisé
```typescript
// lib/redis-cache.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

interface CacheOptions {
  ttl?: number
  tags?: string[]
  namespace?: string
}

export class RedisCache {
  private static instance: RedisCache
  
  static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache()
    }
    return RedisCache.instance
  }

  private getKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key
  }

  async get<T>(key: string, namespace?: string): Promise<T | null> {
    try {
      const fullKey = this.getKey(key, namespace)
      const data = await redis.get(fullKey)
      return data as T
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set<T>(
    key: string, 
    value: T, 
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const { ttl = 3600, tags = [], namespace } = options
      const fullKey = this.getKey(key, namespace)
      
      // Stocker la valeur
      if (ttl > 0) {
        await redis.setex(fullKey, ttl, JSON.stringify(value))
      } else {
        await redis.set(fullKey, JSON.stringify(value))
      }

      // Gérer les tags pour la revalidation
      if (tags.length > 0) {
        for (const tag of tags) {
          await redis.sadd(`tag:${tag}`, fullKey)
          if (ttl > 0) {
            await redis.expire(`tag:${tag}`, ttl)
          }
        }
      }
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  async invalidateTag(tag: string): Promise<void> {
    try {
      const keys = await redis.smembers(`tag:${tag}`)
      
      if (keys.length > 0) {
        await redis.del(...keys)
        await redis.del(`tag:${tag}`)
      }
    } catch (error) {
      console.error('Cache invalidate error:', error)
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Cache invalidate pattern error:', error)
    }
  }
}

// Wrapper pour faciliter l'utilisation
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const cache = RedisCache.getInstance()
  const { namespace } = options

  // Essayer de récupérer depuis le cache
  const cached = await cache.get<T>(key, namespace)
  if (cached !== null) {
    return cached
  }

  // Récupérer les données fraîches
  const data = await fetcher()

  // Mettre en cache
  await cache.set(key, data, options)

  return data
}
```

### 4.2 Cache Multi-Niveaux
```typescript
// lib/multi-level-cache.ts
interface CacheLevel {
  name: string
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
}

class MemoryCache implements CacheLevel {
  name = 'memory'
  private cache = new Map<string, { value: any; expires: number }>()

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  async set<T>(key: string, value: T, ttl = 300): Promise<void> {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl * 1000
    })
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }
}

class RedisCache implements CacheLevel {
  name = 'redis'
  private redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!
  })

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key)
      return data as T
    } catch {
      return null
    }
  }

  async set<T>(key: string, value: T, ttl = 3600): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error('Redis cache error:', error)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key)
    } catch (error) {
      console.error('Redis delete error:', error)
    }
  }
}

export class MultiLevelCache {
  private levels: CacheLevel[]

  constructor() {
    this.levels = [
      new MemoryCache(),
      new RedisCache()
    ]
  }

  async get<T>(key: string): Promise<T | null> {
    for (let i = 0; i < this.levels.length; i++) {
      const level = this.levels[i]
      const data = await level.get<T>(key)
      
      if (data !== null) {
        // Remplir les niveaux supérieurs
        for (let j = 0; j < i; j++) {
          await this.levels[j].set(key, data)
        }
        return data
      }
    }
    
    return null
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // Écrire dans tous les niveaux
    await Promise.all(
      this.levels.map(level => level.set(key, value, ttl))
    )
  }

  async delete(key: string): Promise<void> {
    // Supprimer de tous les niveaux
    await Promise.all(
      this.levels.map(level => level.delete(key))
    )
  }
}

// Utilisation
const cache = new MultiLevelCache()

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 3600
): Promise<T> {
  // Essayer le cache
  const cached = await cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Récupérer les données
  const data = await fetcher()
  
  // Mettre en cache
  await cache.set(key, data, ttl)
  
  return data
}
```

## 5. Implications pour le CLI

### 5.1 Génération Automatique de Cache

Le CLI devra détecter et générer automatiquement :

**Stratégies de cache :**
- Cache statique pour les données peu changeantes
- Cache avec revalidation pour les données fréquemment mises à jour
- Cache dynamique pour les données utilisateur-spécifiques
- Streaming pour les composants lents

**Patterns de revalidation :**
- revalidatePath pour les mutations CRUD
- revalidateTag pour les mises à jour granulaires
- API de revalidation externe pour les webhooks
- Cache multi-niveaux pour les applications haute performance

### 5.2 Détection de Patterns

Le CLI devra identifier :
- **Données statiques** → Cache indéfini avec ISR
- **Données fréquentes** → Cache avec revalidation courte
- **Données utilisateur** → Cache dynamique ou pas de cache
- **Composants lents** → Streaming avec Suspense
- **Images** → Optimisation automatique
- **APIs externes** → Cache avec fallback

## Conclusion

Les patterns de cache et optimisation Next.js offrent des possibilités très avancées pour créer des applications performantes. Le CLI devra implémenter des templates intelligents qui détectent automatiquement les besoins de cache selon le type de données et génèrent les stratégies appropriées.

L'intégration de ces patterns permet d'optimiser les performances dès la génération, avec des mécanismes de cache adaptatifs, du streaming intelligent, et des stratégies de revalidation granulaires pour maintenir la fraîcheur des données.
