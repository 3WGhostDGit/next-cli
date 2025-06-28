/**
 * Tests pour le template d'authentification
 * Valide la génération correcte de tous les fichiers et configurations Better Auth
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { testUtils } from '../setup';

// Import the template functions
import { 
  generateValidatedAuthProject, 
  validateAuthConfig 
} from '../../templates/authentication/generator';
import type { AuthConfig } from '../../templates/authentication/index';

describe('Authentication Template', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await testUtils.createTempDir('auth-');
  });

  describe('Configuration Validation', () => {
    it('should validate correct configuration', () => {
      const config: Partial<AuthConfig> = {
        projectName: 'my-auth-app',
        authProvider: 'better-auth',
        providers: ['email', 'github'],
        features: ['email-verification', 'password-reset'],
        database: 'postgresql',
      };

      const errors = validateAuthConfig(config);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid project names', () => {
      const config: Partial<AuthConfig> = {
        projectName: 'My Invalid Project Name!',
      };

      const errors = validateAuthConfig(config);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('lettres minuscules');
    });

    it('should require at least one provider', () => {
      const config: Partial<AuthConfig> = {
        providers: [],
      };

      const errors = validateAuthConfig(config);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Au moins un provider');
    });

    it('should validate password length constraints', () => {
      const config: Partial<AuthConfig> = {
        security: {
          minPasswordLength: 4, // Too short
          maxPasswordLength: 300, // Too long
          requireEmailVerification: true,
          rateLimit: true,
          csrf: true,
        },
      };

      const errors = validateAuthConfig(config);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('6 caractères'))).toBe(true);
      expect(errors.some(e => e.includes('256 caractères'))).toBe(true);
    });

    it('should validate feature dependencies', () => {
      const config: Partial<AuthConfig> = {
        providers: ['github'], // No email provider
        features: ['email-verification'], // Requires email
      };

      const errors = validateAuthConfig(config);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('provider email');
    });
  });

  describe('Project Generation', () => {
    it('should generate a complete authentication project', () => {
      const config: Partial<AuthConfig> = {
        projectName: 'test-auth-app',
        providers: ['email', 'github', 'google'],
        features: ['email-verification', 'password-reset', 'social-login'],
        database: 'postgresql',
      };

      const result = generateValidatedAuthProject(config);

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      expect(result.files.length).toBeGreaterThan(15);
      expect(result.instructions.length).toBeGreaterThan(10);
      expect(result.config.projectName).toBe('test-auth-app');
    });

    it('should include all essential authentication files', () => {
      const result = generateValidatedAuthProject();

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const essentialFiles = [
        'src/lib/auth.ts',
        'src/lib/auth-client.ts',
        'middleware.ts',
        'app/api/auth/[...all]/route.ts',
        'app/(auth)/login/page.tsx',
        'app/(auth)/signup/page.tsx',
        'app/dashboard/page.tsx',
        'src/components/auth/login-form.tsx',
        'src/components/auth/signup-form.tsx',
        'src/components/auth/social-login.tsx',
        'src/components/auth/auth-guard.tsx',
        'src/components/auth/user-menu.tsx',
        'src/hooks/use-auth.ts',
        'shared/types/auth.ts',
        'shared/validation/auth.ts',
        '.env.example',
      ];

      for (const file of essentialFiles) {
        const found = result.files.find(f => f.path === file);
        expect(found, `Essential file missing: ${file}`).toBeDefined();
      }
    });
  });

  describe('Better Auth Configuration', () => {
    it('should generate correct server configuration', () => {
      const config: Partial<AuthConfig> = {
        providers: ['email', 'github'],
        database: 'postgresql',
        features: ['email-verification'],
      };

      const result = generateValidatedAuthProject(config);

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const authConfig = result.files.find(f => f.path === 'src/lib/auth.ts');
      expect(authConfig).toBeDefined();
      
      const content = authConfig!.content;
      expect(content).toContain('betterAuth');
      expect(content).toContain('emailAndPassword');
      expect(content).toContain('github:');
      expect(content).toContain('requireEmailVerification: true');
      expect(content).toContain('Pool'); // PostgreSQL
    });

    it('should generate correct client configuration', () => {
      const result = generateValidatedAuthProject();

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const clientConfig = result.files.find(f => f.path === 'src/lib/auth-client.ts');
      expect(clientConfig).toBeDefined();
      
      const content = clientConfig!.content;
      expect(content).toContain('createAuthClient');
      expect(content).toContain('signIn');
      expect(content).toContain('signUp');
      expect(content).toContain('signOut');
      expect(content).toContain('useSession');
    });

    it('should configure middleware correctly', () => {
      const config: Partial<AuthConfig> = {
        ui: {
          redirectAfterLogin: '/dashboard',
          redirectAfterLogout: '/',
          theme: 'system',
          customPages: true,
        },
      };

      const result = generateValidatedAuthProject(config);

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const middleware = result.files.find(f => f.path === 'middleware.ts');
      expect(middleware).toBeDefined();
      
      const content = middleware!.content;
      expect(content).toContain('/dashboard');
      expect(content).toContain('getSession');
      expect(content).toContain('X-Frame-Options');
      expect(content).toContain('matcher');
    });
  });

  describe('Database Support', () => {
    const databases = ['postgresql', 'mysql', 'sqlite'] as const;

    databases.forEach(db => {
      it(`should generate correct configuration for ${db}`, () => {
        const result = generateValidatedAuthProject({ database: db });

        if ('errors' in result) {
          throw new Error(`Generation failed: ${result.errors.join(', ')}`);
        }

        const authConfig = result.files.find(f => f.path === 'src/lib/auth.ts');
        const content = authConfig!.content;

        switch (db) {
          case 'postgresql':
            expect(content).toContain('Pool');
            expect(content).toContain('pg');
            break;
          case 'mysql':
            expect(content).toContain('createConnection');
            expect(content).toContain('mysql2');
            break;
          case 'sqlite':
            expect(content).toContain('Database');
            expect(content).toContain('better-sqlite3');
            break;
        }
      });
    });
  });

  describe('Social Providers', () => {
    it('should generate social login component with providers', () => {
      const config: Partial<AuthConfig> = {
        providers: ['email', 'github', 'google', 'discord'],
      };

      const result = generateValidatedAuthProject(config);

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const socialLogin = result.files.find(f => f.path === 'src/components/auth/social-login.tsx');
      expect(socialLogin).toBeDefined();
      
      const content = socialLogin!.content;
      expect(content).toContain('GitHub');
      expect(content).toContain('Google');
      expect(content).toContain('Discord');
      expect(content).toContain('signIn.social');
    });

    it('should handle no social providers', () => {
      const config: Partial<AuthConfig> = {
        providers: ['email'],
      };

      const result = generateValidatedAuthProject(config);

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const socialLogin = result.files.find(f => f.path === 'src/components/auth/social-login.tsx');
      expect(socialLogin).toBeDefined();
      
      const content = socialLogin!.content;
      expect(content).toContain('return null');
    });
  });

  describe('Features Configuration', () => {
    it('should generate password reset pages when enabled', () => {
      const config: Partial<AuthConfig> = {
        providers: ['email'],
        features: ['password-reset'],
      };

      const result = generateValidatedAuthProject(config);

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const forgotPage = result.files.find(f => f.path === 'app/(auth)/forgot-password/page.tsx');
      expect(forgotPage).toBeDefined();
      expect(forgotPage!.content).toContain('forgetPassword');
    });

    it('should generate email verification page when enabled', () => {
      const config: Partial<AuthConfig> = {
        providers: ['email'],
        features: ['email-verification'],
      };

      const result = generateValidatedAuthProject(config);

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const verifyPage = result.files.find(f => f.path === 'app/(auth)/verify-email/page.tsx');
      expect(verifyPage).toBeDefined();
      expect(verifyPage!.content).toContain('verifyEmail');
    });

    it('should skip disabled features', () => {
      const config: Partial<AuthConfig> = {
        providers: ['email'],
        features: [], // No features enabled
      };

      const result = generateValidatedAuthProject(config);

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const forgotPage = result.files.find(f => f.path === 'app/(auth)/forgot-password/page.tsx');
      expect(forgotPage).toBeUndefined();

      const verifyPage = result.files.find(f => f.path === 'app/(auth)/verify-email/page.tsx');
      expect(verifyPage).toBeUndefined();
    });
  });

  describe('Environment Configuration', () => {
    it('should generate correct environment variables', () => {
      const config: Partial<AuthConfig> = {
        providers: ['email', 'github', 'google'],
        features: ['email-verification'],
      };

      const result = generateValidatedAuthProject(config);

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const envFile = result.files.find(f => f.path === '.env.example');
      expect(envFile).toBeDefined();
      
      const content = envFile!.content;
      expect(content).toContain('BETTER_AUTH_SECRET');
      expect(content).toContain('DATABASE_URL');
      expect(content).toContain('GITHUB_CLIENT_ID');
      expect(content).toContain('GOOGLE_CLIENT_ID');
      expect(content).toContain('SMTP_HOST'); // For email verification
    });
  });

  describe('TypeScript Integration', () => {
    it('should generate proper TypeScript types', () => {
      const result = generateValidatedAuthProject();

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const typesFile = result.files.find(f => f.path === 'shared/types/auth.ts');
      expect(typesFile).toBeDefined();
      
      const content = typesFile!.content;
      expect(content).toContain('interface AuthUser');
      expect(content).toContain('interface AuthSession');
      expect(content).toContain('interface LoginCredentials');
      expect(content).toContain('interface SignupCredentials');
    });

    it('should generate Zod validation schemas', () => {
      const result = generateValidatedAuthProject();

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const validationFile = result.files.find(f => f.path === 'shared/validation/auth.ts');
      expect(validationFile).toBeDefined();
      
      const content = validationFile!.content;
      expect(content).toContain('loginSchema');
      expect(content).toContain('signupSchema');
      expect(content).toContain('z.string()');
      expect(content).toContain('email("Format d\'email invalide")');
    });
  });

  describe('Instructions Generation', () => {
    it('should include comprehensive setup instructions', () => {
      const config: Partial<AuthConfig> = {
        providers: ['email', 'github'],
        features: ['email-verification'],
        database: 'postgresql',
      };

      const result = generateValidatedAuthProject(config);

      if ('errors' in result) {
        throw new Error(`Generation failed: ${result.errors.join(', ')}`);
      }

      const instructions = result.instructions.join(' ');
      expect(instructions).toContain('Better Auth');
      expect(instructions).toContain('PostgreSQL');
      expect(instructions).toContain('GitHub OAuth');
      expect(instructions).toContain('Vérification d\'email');
      expect(instructions).toContain('/login');
      expect(instructions).toContain('/dashboard');
    });
  });
});
