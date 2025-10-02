import {FlatCompat} from '@eslint/eslintrc';
import tsParser from '@typescript-eslint/parser';
import expensifyConfig from 'eslint-config-expensify';
import lodash from 'eslint-plugin-lodash';
import reactCompiler from 'eslint-plugin-react-compiler';
import reactNativeA11Y from 'eslint-plugin-react-native-a11y';
import testingLibrary from 'eslint-plugin-testing-library';
import youDontNeedLodashUnderscore from 'eslint-plugin-you-dont-need-lodash-underscore';
import {defineConfig, globalIgnores} from 'eslint/config';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import typescriptEslint from 'typescript-eslint';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const config = defineConfig([
    {
        extends: new FlatCompat({baseDirectory: dirname}).extends('plugin:@dword-design/import-alias/recommended'),

        plugins: Object.assign(
            {
                '@typescript-eslint': typescriptEslint.plugin,
                'you-dont-need-lodash-underscore': youDontNeedLodashUnderscore,
                'react-native-a11y': reactNativeA11Y,
                'testing-library': testingLibrary,
                'react-compiler': reactCompiler,
                lodash,
            },
            ...expensifyConfig.map((item) => item.plugins),
        ),

        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: path.resolve(dirname, './tsconfig.json'),
            },
        },

        linterOptions: {
            reportUnusedDisableDirectives: 'off',
        },

        files: ['**/*.ts', '**/*.tsx'],
        rules: {
            '@dword-design/import-alias/prefer-alias': 'off',
            '@typescript-eslint/no-deprecated': 'error',
            'rulesdir/no-default-id-values': 'error',
            'rulesdir/provide-canBeMissing-in-useOnyx': 'error',
            'rulesdir/no-unstable-hook-defaults': 'error',
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'ImportNamespaceSpecifier[parent.source.value=/^@libs/]',
                    message: 'Namespace imports from @libs are not allowed. Use named imports instead. Example: import { method } from "@libs/module"',
                },
                {
                    selector: 'ImportNamespaceSpecifier[parent.source.value=/^@userActions/]',
                    message: 'Namespace imports from @userActions are not allowed. Use named imports instead. Example: import { action } from "@userActions/module"',
                },
            ],
        },
    },

    {
        files: ['**/libs/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'ImportNamespaceSpecifier[parent.source.value=/^\\.\\./]',
                    message: 'Namespace imports are not allowed. Use named imports instead. Example: import { method } from "../libs/module"',
                },
                {
                    selector: 'ImportNamespaceSpecifier[parent.source.value=/^\\./]',
                    message: 'Namespace imports are not allowed. Use named imports instead. Example: import { method } from "./libs/module"',
                },
            ],
        },
    },

    globalIgnores([
        '!**/.storybook',
        '!**/.github',
        '.github/actions/**/index.js',
        '**/*.config.js',
        '**/*.config.mjs',
        '**/node_modules/**/*',
        '**/dist/**/*',
        'android/**/build/**/*',
        'docs/vendor/**/*',
        'docs/assets/**/*',
        'web/gtm.js',
        '**/.expo/**/*',
        'src/libs/SearchParser/searchParser.js',
        'src/libs/SearchParser/autocompleteParser.js',
        'help/_scripts/**/*',
        'modules/ExpensifyNitroUtils/nitrogen/**/*',
        'Mobile-Expensify/**/*',
        '**/vendor',
        'modules/group-ib-fp/**/*',
        'web/snippets/gib.js',
    ]),
]);

export default config;
