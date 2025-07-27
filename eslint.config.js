import lwcConfig from '@salesforce/eslint-config-lwc/base.js';
import babelParser from '@babel/eslint-parser';

export default [
  ...lwcConfig,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          parserOpts: {
            plugins: ['classProperties', ['decorators', { decoratorsBeforeExport: false }]],
          },
        },
      },
    },
    rules: {
      // Custom overrides for project-specific needs
      'no-console': 'warn',
      '@lwc/lwc/no-leading-uppercase-api-name': 'off',
    },
  },
  {
    ignores: ['dist/', 'node_modules/'],
  },
];
