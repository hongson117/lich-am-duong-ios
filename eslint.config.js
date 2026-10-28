const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/**', 'ios-export/**', 'ios/**', 'android/**', 'node_modules/**', 'test-results/**', 'playwright-report/**', 'docs/**', 'art-originals/**'] },
]);
