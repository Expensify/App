import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import rulesdir from 'eslint-plugin-rulesdir';
import {defineConfig} from 'eslint/config';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

rulesdir.RULES_DIR = path.resolve(dirname, 'node_modules/eslint-config-expensify/eslint-plugin-expensify');

const config = defineConfig([
    {
        plugins: {
            '@typescript-eslint': typescriptEslintPlugin,
            rulesdir,
        },

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
]);

export default config;
