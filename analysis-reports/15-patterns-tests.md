# Analyse des Patterns de Tests

## Vue d'ensemble

Cette analyse examine les patterns de tests dans les applications Next.js modernes, couvrant les tests unitaires, d'intégration et end-to-end avec Jest, React Testing Library, Playwright, et Cypress.

## ANALYSE EN DEUX TEMPS

### Temps 1 : Tests unitaires et d'intégration
- Jest et React Testing Library pour les composants
- Tests des Server Actions et API Routes
- Mocking et test utilities

### Temps 2 : Tests end-to-end et patterns avancés
- Playwright et Cypress pour les tests E2E
- Tests de performance et accessibilité
- CI/CD et automatisation des tests

## 1. Patterns de Tests Unitaires

### 1.1 Configuration Jest pour Next.js
```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/shared/(.*)$': '<rootDir>/shared/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
```

### 1.2 Setup Jest avec Testing Library
```javascript
// jest.setup.js
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
```

### 1.3 Tests de Composants React
```typescript
// __tests__/components/post-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { PostCard } from '@/components/post-card'

const mockPost = {
  id: '1',
  title: 'Test Post',
  excerpt: 'This is a test post excerpt',
  author: {
    name: 'John Doe',
    avatar: '/avatar.jpg'
  },
  publishedAt: '2024-01-01',
  tags: ['react', 'testing']
}

describe('PostCard', () => {
  it('renders post information correctly', () => {
    render(<PostCard post={mockPost} />)
    
    expect(screen.getByText('Test Post')).toBeInTheDocument()
    expect(screen.getByText('This is a test post excerpt')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('testing')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const onClickMock = jest.fn()
    render(<PostCard post={mockPost} onClick={onClickMock} />)
    
    fireEvent.click(screen.getByRole('article'))
    expect(onClickMock).toHaveBeenCalledWith(mockPost)
  })

  it('displays formatted date', () => {
    render(<PostCard post={mockPost} />)
    
    // Assuming date is formatted as "Jan 1, 2024"
    expect(screen.getByText(/Jan 1, 2024/)).toBeInTheDocument()
  })

  it('handles missing optional props', () => {
    const minimalPost = {
      id: '1',
      title: 'Minimal Post',
      excerpt: 'Minimal excerpt'
    }
    
    render(<PostCard post={minimalPost} />)
    expect(screen.getByText('Minimal Post')).toBeInTheDocument()
  })
})
```

### 1.4 Tests de Formulaires avec shadcn/ui
```typescript
// __tests__/components/contact-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm } from '@/components/contact-form'

// Mock Server Action
const mockSubmitContact = jest.fn()
jest.mock('@/app/actions/contact', () => ({
  submitContact: mockSubmitContact
}))

describe('ContactForm', () => {
  beforeEach(() => {
    mockSubmitContact.mockClear()
  })

  it('renders all form fields', () => {
    render(<ContactForm />)
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    const submitButton = screen.getByRole('button', { name: /send/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/message is required/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /send/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    mockSubmitContact.mockResolvedValue({ success: true })
    
    render(<ContactForm />)
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/message/i), 'Hello, this is a test message')
    
    const submitButton = screen.getByRole('button', { name: /send/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockSubmitContact).toHaveBeenCalledWith(
        expect.any(Object), // prevState
        expect.any(FormData)
      )
    })
  })

  it('displays success message after submission', async () => {
    const user = userEvent.setup()
    mockSubmitContact.mockResolvedValue({ 
      success: true, 
      message: 'Message sent successfully!' 
    })
    
    render(<ContactForm />)
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/message/i), 'Test message')
    
    await user.click(screen.getByRole('button', { name: /send/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument()
    })
  })

  it('displays error message on submission failure', async () => {
    const user = userEvent.setup()
    mockSubmitContact.mockResolvedValue({ 
      success: false, 
      error: 'Failed to send message' 
    })
    
    render(<ContactForm />)
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/message/i), 'Test message')
    
    await user.click(screen.getByRole('button', { name: /send/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/failed to send message/i)).toBeInTheDocument()
    })
  })
})
```

## 2. Tests des Server Actions

### 2.1 Tests de Server Actions
```typescript
// __tests__/actions/posts.test.ts
import { createPost, updatePost, deletePost } from '@/app/actions/posts'
import { db } from '@/lib/db'

// Mock Prisma
jest.mock('@/lib/db', () => ({
  db: {
    post: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    }
  }
}))

// Mock Next.js functions
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

const mockDb = db as jest.Mocked<typeof db>

describe('Post Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createPost', () => {
    it('creates a post with valid data', async () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        slug: 'test-post'
      }

      mockDb.post.create.mockResolvedValue(mockPost)

      const formData = new FormData()
      formData.append('title', 'Test Post')
      formData.append('content', 'Test content')

      const result = await createPost(null, formData)

      expect(mockDb.post.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Post',
          content: 'Test content',
          slug: expect.any(String),
          authorId: expect.any(String)
        }
      })

      expect(result.success).toBe(true)
    })

    it('returns validation errors for invalid data', async () => {
      const formData = new FormData()
      formData.append('title', '') // Empty title
      formData.append('content', 'Short') // Too short content

      const result = await createPost(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors).toEqual({
        title: ['Title is required'],
        content: ['Content must be at least 10 characters']
      })
    })

    it('handles database errors', async () => {
      mockDb.post.create.mockRejectedValue(new Error('Database error'))

      const formData = new FormData()
      formData.append('title', 'Test Post')
      formData.append('content', 'Test content with enough characters')

      const result = await createPost(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create post')
    })
  })

  describe('updatePost', () => {
    it('updates a post successfully', async () => {
      const mockPost = {
        id: '1',
        title: 'Updated Post',
        content: 'Updated content'
      }

      mockDb.post.findUnique.mockResolvedValue(mockPost)
      mockDb.post.update.mockResolvedValue(mockPost)

      const formData = new FormData()
      formData.append('title', 'Updated Post')
      formData.append('content', 'Updated content')

      const result = await updatePost('1', null, formData)

      expect(result.success).toBe(true)
    })

    it('returns error for non-existent post', async () => {
      mockDb.post.findUnique.mockResolvedValue(null)

      const formData = new FormData()
      formData.append('title', 'Updated Post')
      formData.append('content', 'Updated content')

      const result = await updatePost('999', null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Post not found')
    })
  })
})
```

### 2.2 Tests d'API Routes
```typescript
// __tests__/api/posts.test.ts
import { GET, POST } from '@/app/api/posts/route'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

jest.mock('@/lib/db')
jest.mock('@/lib/auth', () => ({
  getSession: jest.fn()
}))

const mockDb = db as jest.Mocked<typeof db>

describe('/api/posts', () => {
  describe('GET', () => {
    it('returns posts successfully', async () => {
      const mockPosts = [
        { id: '1', title: 'Post 1', content: 'Content 1' },
        { id: '2', title: 'Post 2', content: 'Content 2' }
      ]

      mockDb.post.findMany.mockResolvedValue(mockPosts)

      const request = new NextRequest('http://localhost:3000/api/posts')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.posts).toEqual(mockPosts)
    })

    it('handles database errors', async () => {
      mockDb.post.findMany.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/posts')
      const response = await GET(request)

      expect(response.status).toBe(500)
    })

    it('supports pagination', async () => {
      const mockPosts = [
        { id: '1', title: 'Post 1', content: 'Content 1' }
      ]

      mockDb.post.findMany.mockResolvedValue(mockPosts)

      const request = new NextRequest('http://localhost:3000/api/posts?page=2&limit=10')
      await GET(request)

      expect(mockDb.post.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        orderBy: { createdAt: 'desc' }
      })
    })
  })

  describe('POST', () => {
    it('creates a post when authenticated', async () => {
      const { getSession } = require('@/lib/auth')
      getSession.mockResolvedValue({ user: { id: 'user1' } })

      const mockPost = {
        id: '1',
        title: 'New Post',
        content: 'New content'
      }

      mockDb.post.create.mockResolvedValue(mockPost)

      const request = new NextRequest('http://localhost:3000/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Post',
          content: 'New content'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.post).toEqual(mockPost)
    })

    it('returns 401 when not authenticated', async () => {
      const { getSession } = require('@/lib/auth')
      getSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Post',
          content: 'New content'
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
    })
  })
})
```

## 3. Test Utilities et Helpers

### 3.1 Custom Render avec Providers
```typescript
// __tests__/utils/test-utils.tsx
import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

### 3.2 Mock Factories
```typescript
// __tests__/utils/mock-factories.ts
import { faker } from '@faker-js/faker'

export const createMockUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  avatar: faker.image.avatar(),
  createdAt: faker.date.past(),
  ...overrides
})

export const createMockPost = (overrides = {}) => ({
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  content: faker.lorem.paragraphs(3),
  excerpt: faker.lorem.paragraph(),
  slug: faker.lorem.slug(),
  published: faker.datatype.boolean(),
  author: createMockUser(),
  tags: faker.lorem.words(3).split(' '),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides
})

export const createMockComment = (overrides = {}) => ({
  id: faker.string.uuid(),
  content: faker.lorem.paragraph(),
  author: createMockUser(),
  postId: faker.string.uuid(),
  createdAt: faker.date.past(),
  ...overrides
})
```

### 3.3 Database Test Helpers
```typescript
// __tests__/utils/db-helpers.ts
import { db } from '@/lib/db'

export const cleanDatabase = async () => {
  // Clean up in reverse order of dependencies
  await db.comment.deleteMany()
  await db.post.deleteMany()
  await db.user.deleteMany()
}

export const seedTestData = async () => {
  const user = await db.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
    }
  })

  const post = await db.post.create({
    data: {
      title: 'Test Post',
      content: 'Test content',
      slug: 'test-post',
      authorId: user.id,
    }
  })

  return { user, post }
}

// Use in tests
beforeEach(async () => {
  await cleanDatabase()
})

afterAll(async () => {
  await cleanDatabase()
  await db.$disconnect()
})
```

## 4. Implications pour le CLI

### 4.1 Génération Automatique de Tests

Le CLI devra détecter et générer automatiquement :

**Tests de composants :**
- Tests unitaires pour chaque composant React
- Tests d'intégration pour les formulaires
- Tests de navigation et routing
- Tests d'accessibilité de base

**Tests de logique métier :**
- Tests des Server Actions avec mocking
- Tests des API Routes avec différents scénarios
- Tests des hooks personnalisés
- Tests des utilitaires et helpers

**Configuration et setup :**
- Configuration Jest optimisée pour Next.js
- Setup Testing Library avec mocks Next.js
- Test utilities et factories
- Scripts de test et coverage

### 4.2 Détection de Patterns

Le CLI devra identifier :
- **Composants React** → Tests unitaires automatiques
- **Formulaires** → Tests de validation et soumission
- **Server Actions** → Tests avec mocking de base de données
- **API Routes** → Tests d'endpoints avec authentification
- **Hooks personnalisés** → Tests isolés avec renderHook
- **Pages** → Tests d'intégration avec navigation

## Conclusion

Les patterns de tests Next.js offrent une base solide pour la génération automatique de suites de tests complètes. Le CLI devra implémenter des templates qui couvrent tous les aspects de l'application, des composants UI aux Server Actions, avec des configurations optimisées et des utilitaires de test réutilisables.

L'intégration de ces patterns permet de créer des applications robustes avec une couverture de tests élevée dès la génération, facilitant la maintenance et l'évolution du code.
