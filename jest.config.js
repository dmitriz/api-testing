// jest.config.js
module.exports = {
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', __dirname],
  // This ensures that Jest can find modules relative to the root directory
  rootDir: '.',
  // This is important for finding modules correctly
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
};
