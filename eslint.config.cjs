const {
  defineConfig,
} = require('eslint/config');

const globals = require('globals');
const tsParser = require('@typescript-eslint/parser');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const js = require('@eslint/js');

const {
  FlatCompat,
} = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

module.exports = defineConfig([{
  languageOptions: {
    globals: {
      ...globals.node,
    },

    parser: tsParser,
    sourceType: 'module',
    ecmaVersion: 2021,
    parserOptions: {},
  },

  plugins: {
    '@typescript-eslint': typescriptEslint,
  },

  extends: compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended'),

  rules: {
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-console': 'off',
  },
}]);