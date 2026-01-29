import {defineConfig} from 'eslint/config';
import mainConfig from './eslint.config.mjs';

const restrictedIconImportPaths = [
    {
        name: '@components/Icon/Illustrations',
        message:
            'Direct imports from @components/Icon/Illustrations are deprecated. Please use lazy loading hooks instead. Use `useMemoizedLazyIllustrations` from @hooks/useLazyAsset. See docs/LAZY_ICONS_AND_ILLUSTRATIONS.md for details.',
    },
    {
        name: '@components/Icon/Expensicons',
        message:
            'Direct imports from @components/Icon/Expensicons are deprecated. Please use lazy loading hooks instead. Use `useMemoizedLazyExpensifyIcons` from @hooks/useLazyAsset. See docs/LAZY_ICONS_AND_ILLUSTRATIONS.md for details.',
    },
];

const restrictedIconImportPatterns = [
    {
        group: ['**/Icon/Illustrations', '**/components/Icon/Illustrations'],
        message:
            'Direct imports from Icon/Illustrations are deprecated. Please use lazy loading hooks instead. Use `useMemoizedLazyIllustrations` from @hooks/useLazyAsset. See docs/LAZY_ICONS_AND_ILLUSTRATIONS.md for details.',
    },
    {
        group: ['**/Icon/Expensicons', '**/components/Icon/Expensicons'],
        message:
            'Direct imports from Icon/Expensicons are deprecated. Please use lazy loading hooks instead. Use `useMemoizedLazyExpensifyIcons` from @hooks/useLazyAsset. See docs/LAZY_ICONS_AND_ILLUSTRATIONS.md for details.',
    },
];

const config = defineConfig([
    ...mainConfig,

    {
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
                {
                    selector: 'JSXElement[openingElement.name.name="PressableWithoutFeedback"]:not(:has(JSXAttribute[name.name="sentryLabel"]))',
                    message: 'PressableWithoutFeedback must include sentryLabel prop for Sentry tracking. Example: <PressableWithoutFeedback sentryLabel="componentName.action" />',
                },
            ],
        },
    },

    {
        files: ['**/*.ts', '**/*.tsx'],
        ignores: ['**/libs/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-imports': [
                'warn',
                {
                    paths: restrictedIconImportPaths,
                    patterns: restrictedIconImportPatterns,
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
