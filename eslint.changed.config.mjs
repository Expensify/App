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

const restrictedReportNameImportPatterns = [
    {
        group: ['**/ReportNameUtils', '**/libs/ReportNameUtils'],
        importNames: ['computeReportName'],
        message: 'Do not import computeReportName. Use getReportName instead, which properly uses derived report attributes.',
    },
];

const config = defineConfig([
    ...mainConfig,

    {
        files: ['**/*.ts', '**/*.tsx'],
        rules: {
            '@typescript-eslint/no-deprecated': 'error',
            'rulesdir/no-default-id-values': 'error',
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
                    selector:
                        'JSXElement[openingElement.name.name=/^Pressable(WithoutFeedback|WithFeedback|WithDelayToggle|WithoutFocus)$/]:not(:has(JSXAttribute[name.name="sentryLabel"]))',
                    message: 'All Pressable components must include sentryLabel prop for Sentry tracking. Example: <PressableWithoutFeedback sentryLabel="MoreMenu-ExportFile" />',
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
        files: ['**/*.ts', '**/*.tsx'],
        ignores: ['src/libs/actions/OnyxDerived/configs/reportAttributes.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: restrictedReportNameImportPatterns,
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

    {
        files: ['src/libs/ReportNameUtils.ts'],
        rules: {
            'no-restricted-syntax': [
                'error',
                // All selectors from parent blocks must be repeated since file-scoped rules override them
                // From mainConfig's global block
                {
                    selector: 'TSEnumDeclaration',
                    message: "Please don't declare enums, use union types instead.",
                },
                {
                    selector: 'CallExpression[callee.object.name="React"][callee.property.name="forwardRef"]',
                    message: 'forwardRef is deprecated. Please use ref as a prop instead. See: contributingGuides/STYLE.md#forwarding-refs',
                },
                {
                    selector: 'CallExpression[callee.name="getUrlWithBackToParam"]',
                    message:
                        'Usage of getUrlWithBackToParam function is prohibited. This is legacy code and no new occurrences should be added. Please look into the `How to remove backTo from URL` section in contributingGuides/NAVIGATION.md. and use alternative routing methods instead.',
                },
                {
                    selector: 'LabeledStatement',
                    message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
                },
                {
                    selector: 'WithStatement',
                    message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize. It is also deprecated.',
                },
                // From the **/*.ts, **/*.tsx block above
                {
                    selector: 'ImportNamespaceSpecifier[parent.source.value=/^@libs/]',
                    message: 'Namespace imports from @libs are not allowed. Use named imports instead. Example: import { method } from "@libs/module"',
                },
                {
                    selector: 'ImportNamespaceSpecifier[parent.source.value=/^@userActions/]',
                    message: 'Namespace imports from @userActions are not allowed. Use named imports instead. Example: import { action } from "@userActions/module"',
                },
                {
                    selector:
                        'JSXElement[openingElement.name.name=/^Pressable(WithoutFeedback|WithFeedback|WithDelayToggle|WithoutFocus)$/]:not(:has(JSXAttribute[name.name="sentryLabel"]))',
                    message: 'All Pressable components must include sentryLabel prop for Sentry tracking. Example: <PressableWithoutFeedback sentryLabel="MoreMenu-ExportFile" />',
                },
                // From the **/libs/**/*.{ts,tsx} block above
                {
                    selector: 'ImportNamespaceSpecifier[parent.source.value=/^\\.\\./]',
                    message: 'Namespace imports are not allowed. Use named imports instead. Example: import { method } from "../libs/module"',
                },
                {
                    selector: 'ImportNamespaceSpecifier[parent.source.value=/^\\./]',
                    message: 'Namespace imports are not allowed. Use named imports instead. Example: import { method } from "./libs/module"',
                },
                // File-specific: getReportName must only read from reportAttributesDerivedValue — no function calls allowed.
                {
                    selector: 'FunctionDeclaration[id.name="getReportName"] CallExpression',
                    message: 'getReportName must be a pure read-only function. Move any computation to computeReportName instead.',
                },
            ],
        },
    },
]);

export default config;
