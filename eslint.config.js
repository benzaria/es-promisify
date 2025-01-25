import globals from 'globals';
import jsPlugin from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Base settings for all JavaScript and TypeScript files
  {
    files: ['**/*.{js,mjs,cjs,ts}'], // Target file extensions
    languageOptions: {
      globals: globals['shared-node-browser'], // Shared global variables for both Node.js and browsers
      ecmaVersion: 'latest', // Latest ECMAScript version
      sourceType: 'module', // ES Modules
      parser: tsParser, // Use TypeScript parser for linting TS files
    },
    rules: {
      'no-unused-vars': 'warn', // Warn for unused variables
      'no-console': 'warn', // Allow console statements
      //'semi': ['error', 'always'], // Enforce semicolons
      //"quotes": ["error", "double"], // Enforce double quotes
    },
  },

  // Add JavaScript-specific rules
  {
    files: ['**/*.js'],
    ...jsPlugin.configs.recommended, // Recommended rules for JavaScript
    rules: {
      ...jsPlugin.configs.recommended.rules,
      'strict': ['error', 'never'], // Disable strict mode in JS files
    },
  },

  // Add TypeScript-specific rules
  {
    files: ['**/*.ts'],
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules, // Recommended rules for TypeScript
      '@typescript-eslint/no-explicit-any': 'off', // Allow the use of 'any' type
      '@typescript-eslint/explicit-module-boundary-types': 'warn', // Don't require return types for functions
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Ignore unused variables starting with '_'
    },
  },
];
