const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

// next/jest merges transformIgnorePatterns in a way that can override custom settings.
// We post-process the generated config to add the ESM package exceptions for @turf/turf v7.
async function jestConfig() {
  const nextJestConfig = await createJestConfig(customJestConfig)();
  return {
    ...nextJestConfig,
    // @turf/turf v7 and its deps (kdbush, robust-predicates, etc.) are ESM-only.
    // Tell Jest to transpile them via babel/SWC, overriding the default ignore list.
    transformIgnorePatterns: [
      '/node_modules/(?!(kdbush|quickselect|robust-predicates|geokdbush|tinyqueue|@turf)/).*/',
    ],
  };
}

module.exports = jestConfig;

