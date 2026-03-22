module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
  },
  // No need to map zod as it's in node_modules
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**/*',
    '!src/lib/**/*',
  ],
};