module.exports = {
  testEnvironment: 'jest-environment-jsdom', // or 'node' depending on your needs
  roots: ['<rootDir>/app'], // Adjust if your tests are elsewhere
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // Handle module aliases
    // Add any other module name mappers if needed
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest', // Use babel-jest for JS/JSX files
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Optional: for global setup
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json', // Ensure ts-jest uses the correct tsconfig
    },
  },
};
