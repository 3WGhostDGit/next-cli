# Analyse des Patterns Server Actions

## Vue d'ensemble

Cette analyse examine les patterns récurrents dans l'utilisation des Server Actions Next.js, leur intégration avec les formulaires, la validation Zod, et la gestion d'état avec useActionState.

## 1. Patterns Fondamentaux des Server Actions

### 1.1 Définition de Server Action
```typescript
// app/actions.ts
'use server'

export async function createUser(formData: FormData) {
  const rawFormData = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  }
  
  // Mutation des données
  // Revalidation du cache
}
```

**Caractéristiques identifiées :**
- Directive `'use server'` obligatoire
- Accès automatique à FormData
- Exécution côté serveur uniquement
- Endpoints HTTP sécurisés automatiques

### 1.2 Server Action Inline
```typescript
// app/page.tsx
export default function Page() {
  async function createInvoice(formData: FormData) {
    'use server'
    
    const rawFormData = {
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    }
    
    // Logique métier
  }

  return <form action={createInvoice}>...</form>
}
```

## 2. Patterns de Validation avec Zod

### 2.1 Validation Server-Side Basique
```typescript
'use server'

import { z } from 'zod'

const schema = z.object({
  email: z.string().email({ message: 'Invalid Email' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
})

export async function createUser(formData: FormData) {
  const validatedFields = schema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Mutation des données
}
```

### 2.2 Schema Zod Complexe
```typescript
import { z } from 'zod'

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .trim(),
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password: z
    .string()
    .min(8, { message: 'Be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Contain at least one special character.',
    })
    .trim(),
})

export type FormState = {
  errors?: {
    name?: string[]
    email?: string[]
    password?: string[]
  }
  message?: string
} | undefined
```

## 3. Patterns useActionState

### 3.1 Gestion d'État de Formulaire
```typescript
'use client'

import { useActionState } from 'react'
import { createUser } from '@/app/actions'

const initialState = {
  message: '',
}

export function SignupForm() {
  const [state, formAction, pending] = useActionState(createUser, initialState)

  return (
    <form action={formAction}>
      <input type="email" name="email" required />
      <input type="password" name="password" required />
      
      {state?.errors?.email && <p>{state.errors.email}</p>}
      {state?.errors?.password && <p>{state.errors.password}</p>}
      {state?.message && <p aria-live="polite">{state.message}</p>}
      
      <button disabled={pending} type="submit">
        {pending ? 'Creating...' : 'Sign Up'}
      </button>
    </form>
  )
}
```

### 3.2 Server Action avec useActionState
```typescript
'use server'

export async function createUser(initialState: any, formData: FormData) {
  const validatedFields = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    // Création utilisateur
    const user = await db.user.create({
      data: validatedFields.data
    })
    
    return { message: 'User created successfully' }
  } catch (error) {
    return { message: 'Failed to create user' }
  }
}
```

## 4. Patterns de Gestion d'État Pending

### 4.1 useFormStatus pour Loading States
```typescript
'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  )
}
```

### 4.2 Intégration dans Formulaire
```typescript
// Server Component
import { SubmitButton } from '@/app/submit-button'
import { createItem } from '@/app/actions'

export default function Form() {
  return (
    <form action={createItem}>
      <input type="text" name="title" />
      <SubmitButton />
    </form>
  )
}
```

## 5. Patterns d'Optimistic Updates

### 5.1 useOptimistic pour UI Réactive
```typescript
'use client'

import { useOptimistic } from 'react'
import { send } from './actions'

type Message = {
  message: string
}

export function Thread({ messages }: { messages: Message[] }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic<
    Message[],
    string
  >(messages, (state, newMessage) => [...state, { message: newMessage }])

  return (
    <div>
      {optimisticMessages.map((m, i) => (
        <div key={i}>{m.message}</div>
      ))}
      <form
        action={async (formData: FormData) => {
          const message = formData.get('message') as string
          addOptimisticMessage(message)
          await send(message)
        }}
      >
        <input type="text" name="message" />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}
```

## 6. Patterns de Revalidation et Cache

### 6.1 Revalidation par Path
```typescript
'use server'

import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  // Création du post
  await db.post.create({
    data: {
      title: formData.get('title'),
      content: formData.get('content'),
    }
  })
  
  revalidatePath('/posts')
}
```

### 6.2 Revalidation par Tag
```typescript
'use server'

import { revalidateTag } from 'next/cache'

export async function updateUser(formData: FormData) {
  // Mise à jour utilisateur
  await db.user.update({
    where: { id: formData.get('id') },
    data: { name: formData.get('name') }
  })
  
  revalidateTag('users')
}
```

## 7. Patterns de Redirection

### 7.1 Redirection après Action
```typescript
'use server'

import { redirect } from 'next/navigation'
import { revalidateTag } from 'next/cache'

export async function createPost(formData: FormData) {
  const post = await db.post.create({
    data: {
      title: formData.get('title'),
      content: formData.get('content'),
    }
  })
  
  revalidateTag('posts')
  redirect(`/posts/${post.id}`)
}
```

### 7.2 Redirection Conditionnelle
```typescript
'use server'

export async function processForm(formData: FormData) {
  const result = await processData(formData)
  
  if (result.success) {
    redirect('/success')
  } else {
    return { error: result.message }
  }
}
```

## 8. Patterns de Gestion des Arguments

### 8.1 Binding d'Arguments
```typescript
'use client'

import { updateUser } from './actions'

export function UserProfile({ userId }: { userId: string }) {
  const updateUserWithId = updateUser.bind(null, userId)

  return (
    <form action={updateUserWithId}>
      <input type="text" name="name" />
      <button type="submit">Update</button>
    </form>
  )
}
```

### 8.2 Server Action avec Arguments Liés
```typescript
'use server'

export async function updateUser(userId: string, formData: FormData) {
  await db.user.update({
    where: { id: userId },
    data: {
      name: formData.get('name'),
    }
  })
}
```

## 9. Patterns de Sécurité et Autorisation

### 9.1 Vérification d'Autorisation
```typescript
'use server'

import { auth } from '@/lib/auth'

export async function deletePost(formData: FormData) {
  const { user } = auth()
  
  if (!user) {
    throw new Error('You must be signed in to perform this action')
  }
  
  if (user.role !== 'admin') {
    return { error: 'Unauthorized' }
  }
  
  // Suppression du post
}
```

### 9.2 Validation de Session
```typescript
'use server'

import { verifySession } from '@/app/lib/dal'

export async function serverAction(formData: FormData) {
  const session = await verifySession()
  const userRole = session?.user?.role

  if (userRole !== 'admin') {
    return null
  }

  // Action autorisée
}
```

## 10. Patterns de Gestion des Cookies

### 10.1 Manipulation de Cookies
```typescript
'use server'

import { cookies } from 'next/headers'

export async function handleAuth(formData: FormData) {
  // Lecture
  const authToken = cookies().get('auth')?.value
  
  // Écriture
  cookies().set('sessionId', 'new-session-id')
  
  // Suppression
  cookies().delete('oldToken')
}
```

## 11. Patterns d'Invocation

### 11.1 Invocation depuis useEffect
```typescript
'use client'

import { incrementViews } from './actions'
import { useEffect, useState } from 'react'

export default function ViewCounter({ initialViews }: { initialViews: number }) {
  const [views, setViews] = useState(initialViews)

  useEffect(() => {
    const updateViews = async () => {
      const updatedViews = await incrementViews()
      setViews(updatedViews)
    }

    updateViews()
  }, [])

  return <p>Views: {views}</p>
}
```

### 11.2 Invocation sur onChange
```typescript
'use client'

import { saveDraft } from './actions'

export default function Editor() {
  return (
    <form>
      <textarea
        name="content"
        onChange={async (e) => {
          await saveDraft(e.target.value)
        }}
      />
    </form>
  )
}
```

## 12. Implications pour le CLI

### 12.1 Templates à Générer

1. **Server Action CRUD** : Templates avec validation Zod complète
2. **Form avec useActionState** : Client Component avec gestion d'erreurs
3. **Submit Button** : Composant réutilisable avec useFormStatus
4. **Optimistic UI** : Template avec useOptimistic
5. **Auth Action** : Template avec vérification de permissions

### 12.2 Patterns de Génération Automatique

**Pour un modèle User :**
```typescript
// Génération automatique de :
// 1. Schema Zod
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})

// 2. Server Actions
export async function createUser(formData: FormData) { /* ... */ }
export async function updateUser(id: string, formData: FormData) { /* ... */ }
export async function deleteUser(id: string) { /* ... */ }

// 3. Form Component
export function UserForm() {
  const [state, formAction, pending] = useActionState(createUser, initialState)
  // ...
}
```

### 12.3 Détection de Patterns

Le CLI devra détecter :
- **Formulaires** → Génération avec useActionState
- **CRUD Operations** → Server Actions + validation Zod
- **Real-time Updates** → useOptimistic
- **Authentication** → Vérification de permissions
- **File Upload** → Gestion multipart/form-data

## Conclusion

Les Server Actions Next.js suivent des patterns très structurés qui se prêtent parfaitement à la génération automatique. Le CLI devra implémenter des templates qui intègrent validation Zod, gestion d'état avec useActionState, et bonnes pratiques de sécurité.
