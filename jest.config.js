export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testPathIgnorePatterns: ['<rootDir>/tests/e2e'],
  transform: {
    '^.+\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
  },
  testMatch: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts'],
  collectCoverageFrom: [
    'src/server/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^marked$': '<rootDir>/tests/mocks/marked.cjs',
  },
  resolver: '<rootDir>/tests/resolver.cjs',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.cjs'],
  projects: [
    {
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/unit/**/*.test.ts', '<rootDir>/tests/integration/**/*.test.ts'],
      transform: {
        '^.+\.tsx?$': ['ts-jest', {
          tsconfig: 'tsconfig.test.json',
        }],
      },
      resolver: '<rootDir>/tests/resolver.cjs',
      setupFilesAfterEnv: ['<rootDir>/tests/setup.cjs'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^marked$': '<rootDir>/tests/mocks/marked.cjs',
      },
      collectCoverageFrom: [
        'src/server/**/*.ts',
        '!src/**/*.d.ts',
      ],
    },
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/tests/unit/components/**/*.test.tsx'],
      transform: {
        '^.+\.tsx?$': ['ts-jest', {
          tsconfig: 'tsconfig.test.json',
        }],
      },
      resolver: '<rootDir>/tests/resolver.cjs',
      setupFilesAfterEnv: ['<rootDir>/tests/setup.cjs'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
    },
  ],
};
