export default {
  preset: '@lwc/jest-preset',
  moduleNameMapper: {
    '^my/(.+)$': '<rootDir>/src/modules/my/$1/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/src/assets/',
    '<rootDir>/src/index.js',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  collectCoverageFrom: [
    'src/modules/**/*.js',
    '!src/modules/**/__tests__/**',
    '!src/modules/**/cartStore.js', // Skip store files for now
  ],
};
