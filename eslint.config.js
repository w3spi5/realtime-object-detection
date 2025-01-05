import globals from 'globals';
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    ignores: ['dist/**', 'node_modules/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        AudioWorkletGlobalScope: 'readonly',
        tf: 'readonly',
        cocoSsd: 'readonly',
        CONFIG: 'readonly'
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always']
    }
  }
];