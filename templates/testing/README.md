# Testing Template

A comprehensive Next.js testing template supporting multiple frameworks, test types, and automation strategies.

## Features

### 🧪 Test Frameworks
- **Jest**: Traditional testing with extensive ecosystem
- **Vitest**: Modern, fast testing with native ESM support
- **Testing Library**: Component testing with best practices
- **User Event**: Realistic user interaction simulation

### 🎯 Test Types
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API routes and database integration
- **E2E Tests**: Full application workflow testing
- **Visual Tests**: Screenshot comparison and regression
- **Performance Tests**: Lighthouse and Core Web Vitals
- **Accessibility Tests**: axe-core and WCAG compliance

### 🚀 E2E Frameworks
- **Playwright**: Cross-browser testing with modern APIs
- **Cypress**: Developer-friendly E2E testing
- **Visual Regression**: Automated screenshot comparison
- **Performance Monitoring**: Real-time metrics tracking

### 📊 Coverage & Reporting
- **Configurable Thresholds**: Set coverage requirements per project
- **Multiple Formats**: Text, HTML, LCOV, JSON reports
- **CI Integration**: Automated coverage reporting
- **Trend Analysis**: Coverage history tracking

### 🤖 Automation
- **GitHub Actions**: Automated CI/CD workflows
- **Pre-commit Hooks**: Quality gates before commits
- **Lint-staged**: Run tests on changed files only
- **Test Generation**: Automated test scaffolding

## Configuration Options

### Complete Setup
Perfect for production applications requiring comprehensive testing.

```typescript
{
  framework: "jest",
  testTypes: {
    unit: true,
    integration: true,
    e2e: true,
    visual: true,
    performance: true,
    accessibility: true
  },
  e2eFramework: "playwright",
  coverage: { threshold: 90 }
}
```

### Modern Vitest
Ideal for new projects wanting cutting-edge testing tools.

```typescript
{
  framework: "vitest",
  testTypes: {
    unit: true,
    integration: true,
    e2e: true,
    accessibility: true
  },
  e2eFramework: "playwright",
  coverage: { threshold: 85 }
}
```

### Basic Testing
Lightweight setup for quick prototyping and development.

```typescript
{
  framework: "jest",
  testTypes: {
    unit: true
  },
  e2eFramework: "none",
  coverage: { threshold: 70 }
}
```

## Usage

### Basic Setup

```typescript
import { generateCompleteTesting } from './generator';
import { exampleBasicTesting } from './example';

// Generate template with basic configuration
const config = exampleBasicTesting();
const template = generateCompleteTesting(config);
```

### Custom Configuration

```typescript
import { TestingConfig } from './index';

const customConfig: TestingConfig = {
  projectName: "my-app",
  framework: "vitest",
  testTypes: {
    unit: true,
    integration: true,
    e2e: true,
    accessibility: true,
  },
  e2eFramework: "playwright",
  coverage: {
    enabled: true,
    threshold: 85,
    reports: ["text", "html", "lcov"],
  },
  // ... other options
};

const template = generateCompleteTesting(customConfig, {
  includeE2E: true,
  includeAccessibilityTests: true,
  includeAutomation: true,
});
```

## Generated Files

### Test Configuration
- `jest.config.js` / `vitest.config.ts` - Main test framework configuration
- `jest.setup.js` / `vitest.setup.ts` - Test environment setup
- `playwright.config.ts` / `cypress.config.ts` - E2E framework configuration

### Test Utilities
- `tests/utils/test-utils.tsx` - Custom render functions and providers
- `tests/utils/custom-matchers.ts` - Extended Jest/Vitest matchers
- `tests/utils/test-helpers.ts` - Common testing utilities

### Mock Implementations
- `tests/mocks/next-mocks.ts` - Next.js router, Image, Link mocks
- `tests/mocks/api-mocks.ts` - API and fetch mocking utilities
- `tests/mocks/database-mocks.ts` - Database and ORM mocks

### Example Tests
- `__tests__/components/example.test.tsx` - Component testing examples
- `__tests__/utils/example.test.ts` - Utility function testing
- `e2e/example.spec.ts` - End-to-end testing examples

### Automation
- `.github/workflows/test.yml` - CI/CD workflow
- `.husky/pre-commit` - Pre-commit hooks
- `.lintstagedrc.js` - Lint-staged configuration

## Testing Strategies

### Unit Testing

```typescript
import { render, screen, userEvent } from '@/tests/utils/test-utils';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('should handle click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Testing

```typescript
import { render, screen, waitFor } from '@/tests/utils/test-utils';
import { server } from '@/tests/mocks/api-mocks';
import { UserProfile } from '@/components/user-profile';

describe('User Profile Integration', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should load and display user data', async () => {
    render(<UserProfile userId="123" />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

### E2E Testing

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should allow user to sign in', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email"]', 'user@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});
```

### Accessibility Testing

```typescript
import { test, expect } from '@playwright/test';
import { AccessibilityTester } from '@/tests/accessibility/axe-utils';

test.describe('Homepage Accessibility', () => {
  test('should have no accessibility violations', async ({ page }) => {
    const a11yTester = new AccessibilityTester(page);
    
    await page.goto('/');
    
    const results = await a11yTester.runAxeAudit();
    expect(results.violations).toHaveLength(0);
  });
});
```

## Best Practices

1. **Choose the Right Framework**: Use Jest for stability, Vitest for modern features
2. **Test User Behavior**: Focus on what users do, not implementation details
3. **Mock External Dependencies**: Isolate units under test
4. **Use Data Attributes**: Prefer `data-testid` over CSS selectors
5. **Test Accessibility**: Include a11y tests from the start
6. **Monitor Performance**: Set up performance budgets
7. **Automate Everything**: Use CI/CD for consistent testing

## Scripts

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:ci": "jest --ci --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:coverage": "jest --coverage",
  "test:accessibility": "jest --testPathPattern=accessibility"
}
```

## Environment Variables

```env
# Test database
DATABASE_URL=file:./test.db

# API endpoints
API_BASE_URL=http://localhost:3001

# E2E testing
PLAYWRIGHT_BASE_URL=http://localhost:3000
CYPRESS_BASE_URL=http://localhost:3000

# Coverage
COVERAGE_THRESHOLD=80
```

## CI/CD Integration

The template includes GitHub Actions workflows that:

- Run tests on multiple Node.js versions
- Generate and upload coverage reports
- Execute E2E tests with browser matrix
- Perform accessibility audits
- Cache dependencies for faster builds

## Contributing

When adding new test types:

1. Update the configuration interface in `index.ts`
2. Add generation logic in `utilities.ts`
3. Include examples in `example.ts`
4. Add tests in `test.ts`
5. Update this README

## License

MIT License - see LICENSE file for details.
