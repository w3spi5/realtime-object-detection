export default {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/mocks/styleMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/mocks/fileMock.js'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@tensorflow|@tensorflow-models)/)(?!canvas)'
  ],
  modulePathIgnorePatterns: ['node_modules/canvas'],
  moduleDirectories: ['node_modules', 'src'],
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  }
}