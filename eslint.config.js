import globals from 'globals';
import js from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

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
        importScripts: 'readonly',
        tf: 'readonly',
        cocoSsd: 'readonly',
        CONFIG: 'readonly'
      },
    },
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      ...prettierConfig.rules,  // Désactive toutes les règles conflictuelles de formatage d'ESLint
      'prettier/prettier': 'error',  // Utilise Prettier comme règle ESLint
      'no-unused-vars': 'warn',
      'no-console': ['warn', { allow: ['error', 'warn'] }],
    }
  }
];
