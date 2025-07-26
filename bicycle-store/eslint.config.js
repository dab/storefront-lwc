import eslintPluginLwc from '@lwc/eslint-plugin-lwc';
import babelParser from '@babel/eslint-parser';

export default [
    {
        files: ['src/**/*.js'],
        languageOptions: {
            parser: babelParser,
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                requireConfigFile: false,
                babelOptions: {
                    parserOpts: {
                        plugins: [
                            'classProperties',
                            ['decorators', { decoratorsBeforeExport: false }],
                        ],
                    },
                },
            },
            globals: {
                console: 'readonly',
                fetch: 'readonly',
                CustomEvent: 'readonly',
                Intl: 'readonly',
                Date: 'readonly',
                parseInt: 'readonly',
                document: 'readonly',
                window: 'readonly',
                localStorage: 'readonly',
                setTimeout: 'readonly'
            }
        },
        plugins: {
            '@lwc/lwc': eslintPluginLwc,
        },
        rules: {
            'no-console': 'warn',
            'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
            '@lwc/lwc/no-deprecated': 'error',
            '@lwc/lwc/valid-api': 'error',
            '@lwc/lwc/no-document-query': 'error',
            '@lwc/lwc/no-leading-uppercase-api-name': 'off'
        }
    },
    {
        ignores: ['dist/', 'node_modules/']
    }
];