import {FlatCompat} from '@eslint/eslintrc';
import tsParser from '@typescript-eslint/parser';
import expensifyConfig from 'eslint-config-expensify';
import fileProgress from 'eslint-plugin-file-progress';
import jsdoc from 'eslint-plugin-jsdoc';
import lodash from 'eslint-plugin-lodash';
import react from 'eslint-plugin-react';
import reactNativeA11Y from 'eslint-plugin-react-native-a11y';
import rulesdir from 'eslint-plugin-rulesdir';
import testingLibrary from 'eslint-plugin-testing-library';
import youDontNeedLodashUnderscore from 'eslint-plugin-you-dont-need-lodash-underscore';
import seatbelt from 'eslint-seatbelt';
import {defineConfig, globalIgnores} from 'eslint/config';
import globals from 'globals';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import typescriptEslint from 'typescript-eslint';
import reportNameUtilsPlugin from './plugins/eslint-plugin-report-name-utils.mjs';
import expensifyProcessor from './processors/eslint-processor-expensify.mjs';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// The App root, two levels up from this file (config/eslint/eslint.config.mjs).
// Used as `basePath` on every config object so that `files`/`ignores` patterns
// continue to resolve relative to the App root (their original location),
// rather than relative to this config file's directory (which is the default).
const projectRoot = path.resolve(dirname, '../..');

// `eslint-plugin-rulesdir` lets us load rules from arbitrary local directories.
// We point it at `eslint-config-expensify`'s shipped rules (so configs that
// rely on `rulesdir/<rule>` resolve them) and at our own `eslint-plugin-local-rules/`
// at the repo root.
const require = createRequire(import.meta.url);
const expensifyConfigDirectory = path.dirname(require.resolve('eslint-config-expensify/package.json'));
const expensifyRulesDir = path.resolve(expensifyConfigDirectory, 'eslint-plugin-expensify');
const localRulesDir = path.resolve(projectRoot, 'eslint-plugin-local-rules');

rulesdir.RULES_DIR = [expensifyRulesDir, localRulesDir];

const restrictedImportPaths = [
    {
        name: 'react-native',
        importNames: [
            'useWindowDimensions',
            'StatusBar',
            'TouchableOpacity',
            'TouchableWithoutFeedback',
            'TouchableNativeFeedback',
            'TouchableHighlight',
            'Pressable',
            'Text',
            'ScrollView',
            'ActivityIndicator',
            'Animated',
            'findNodeHandle',
            'InteractionManager',
        ],
        message: [
            '',
            "For 'useWindowDimensions', please use '@src/hooks/useWindowDimensions' instead.",
            "For 'TouchableOpacity', 'TouchableWithoutFeedback', 'TouchableNativeFeedback', 'TouchableHighlight', 'Pressable', please use 'PressableWithFeedback' and/or 'PressableWithoutFeedback' from '@components/Pressable' instead.",
            "For 'StatusBar', please use '@libs/StatusBar' instead.",
            "For 'Text', please use '@components/Text' instead.",
            "For 'ScrollView', please use '@components/ScrollView' instead.",
            "For 'ActivityIndicator', please use '@components/ActivityIndicator' instead.",
            "For 'Animated', please use 'Animated' from 'react-native-reanimated' instead.",
            "For 'InteractionManager', please use afterTransition callbacks on Navigation/KeyboardUtils or other alternatives. See contributingGuides/INTERACTION_MANAGER.md.",
        ].join('\n'),
    },
    {
        name: 'react-native-gesture-handler',
        importNames: ['TouchableOpacity', 'TouchableWithoutFeedback', 'TouchableNativeFeedback', 'TouchableHighlight'],
        message: "Please use 'PressableWithFeedback' and/or 'PressableWithoutFeedback' from '@components/Pressable' instead.",
    },
    {
        name: 'awesome-phonenumber',
        importNames: ['parsePhoneNumber'],
        message: "Please use '@libs/PhoneNumber' instead.",
    },
    {
        name: 'react-native-safe-area-context',
        importNames: ['useSafeAreaInsets', 'SafeAreaConsumer', 'SafeAreaInsetsContext'],
        message: "Please use 'useSafeAreaInsets' from '@src/hooks/useSafeAreaInset' and/or 'SafeAreaConsumer' from '@components/SafeAreaConsumer' instead.",
    },
    {
        name: 'react',
        importNames: ['CSSProperties'],
        message: "Please use 'ViewStyle', 'TextStyle', 'ImageStyle' from 'react-native' instead.",
    },
    {
        name: 'react',
        importNames: ['forwardRef'],
        message: 'forwardRef is deprecated. Please use ref as a prop instead. See: contributingGuides/STYLE.md#forwarding-refs',
    },
    {
        name: '@styles/index',
        importNames: ['default', 'defaultStyles'],
        message: 'Do not import styles directly. Please use the `useThemeStyles` hook instead.',
    },
    {
        name: '@styles/utils',
        importNames: ['default', 'DefaultStyleUtils'],
        message: 'Do not import StyleUtils directly. Please use the `useStyleUtils` hook instead.',
    },
    {
        name: '@styles/theme',
        importNames: ['default', 'defaultTheme'],

        message: 'Do not import themes directly. Please use the `useTheme` hook instead.',
    },
    {
        name: '@styles/theme/illustrations',
        message: 'Do not import theme illustrations directly. Please use the `useThemeIllustrations` hook instead.',
    },
    {
        name: 'date-fns/locale',
        message: "Do not import 'date-fns/locale' directly. Please use the submodule import instead, like 'date-fns/locale/en-GB'.",
    },
    {
        name: 'expensify-common',
        importNames: ['Device', 'ExpensiMark'],
        message: [
            '',
            "For 'Device', do not import it directly, it's known to make VSCode's IntelliSense crash. Please import the desired module from `expensify-common/dist/Device` instead.",
            "For 'ExpensiMark', please use '@libs/Parser' instead.",
        ].join('\n'),
    },
    {
        name: 'lodash/memoize',
        message: "Please use '@src/libs/memoize' instead.",
    },
    {
        name: 'lodash',
        importNames: ['memoize'],
        message: "Please use '@src/libs/memoize' instead.",
    },
    {
        name: 'lodash/isEqual',
        message: "Please use 'deepEqual' from 'fast-equals' instead.",
    },
    {
        name: 'lodash',
        importNames: ['isEqual'],
        message: "Please use 'deepEqual' from 'fast-equals' instead.",
    },
    {
        name: 'react-native-onyx',
        importNames: ['useOnyx'],
        message: "Please use '@hooks/useOnyx' instead.",
    },
    {
        name: '@src/utils/findNodeHandle',
        message: "Do not use 'findNodeHandle' as it is no longer supported on web.",
    },
];

const restrictedImportPatterns = [
    {
        group: ['**/TransitionTracker', './TransitionTracker', '../TransitionTracker'],
        message:
            "TransitionTracker is an internal primitive. Please use higher-level APIs (Navigation with 'afterTransition'/'waitForTransition', KeyboardUtils, useConfirmModal). See contributingGuides/INTERACTION_MANAGER.md.",
    },
    {
        group: ['**/assets/animations/**/*.json'],
        message: "Do not import animations directly. Please use the '@components/LottieAnimations' import instead.",
    },
    {
        group: ['@styles/theme/themes/**'],
        message: 'Do not import themes directly. Please use the `useTheme` hook instead.',
    },
    {
        group: ['@styles/utils/**', '!@styles/utils/FontUtils', '!@styles/utils/types'],
        message: 'Do not import style util functions directly. Please use the `useStyleUtils` hook instead.',
    },
    {
        group: ['@styles/theme/illustrations/themes/**'],
        message: 'Do not import theme illustrations directly. Please use the `useThemeIllustrations` hook instead.',
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
    expensifyConfig,
    typescriptEslint.configs.recommendedTypeChecked,
    typescriptEslint.configs.stylisticTypeChecked,
    fileProgress.configs['recommended-ci'],

    // Suppress lint rules that are unnecessary for files successfully compiled by React Compiler.
    // The processor runs React Compiler on each file and filters out redundant lint messages.
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
        processor: expensifyProcessor,
    },

    // eslint-seatbelt config. The processor is stitched into `expensifyProcessor`
    // above, so we only wire up the plugin, settings, and `configure` rule here.
    {
        settings: {
            seatbelt: {
                seatbeltFile: path.join(dirname, 'eslint.seatbelt.tsv'),
                threadsafe: true,
                // Never persist TSV updates unless we're in CI. In CI, the ephemeral
                // write is harmless on PR runs and essential on `push: main`, where
                // OSBotify commits the tightened baseline back to main
                // (see .github/workflows/lint.yml). SEATBELT_INCREASE overrides this.
                readOnly: !process.env.CI,
            },
        },
        plugins: {
            'eslint-seatbelt': seatbelt,
        },
        rules: {
            'eslint-seatbelt/configure': 'error',
        },
    },

    {
        extends: new FlatCompat({baseDirectory: projectRoot}).extends(
            'airbnb-typescript',
            'plugin:storybook/recommended',
            'plugin:react-native-a11y/all',
            'plugin:@dword-design/import-alias/recommended',
            'prettier',
        ),

        plugins: {
            jsdoc,
            'react-native-a11y': reactNativeA11Y,
            react,
            'testing-library': testingLibrary,
            lodash,
        },

        languageOptions: {
            parser: tsParser,

            parserOptions: {
                project: path.resolve(projectRoot, 'tsconfig.json'),
            },

            globals: {
                ...globals.jest,
                __DEV__: 'readonly',
            },
        },

        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
        rules: {
            '@lwc/lwc/no-async-await': 'off',

            // TypeScript specific rules
            '@typescript-eslint/prefer-enum-initializers': 'error',
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/switch-exhaustiveness-check': ['error', {considerDefaultExhaustiveForUnions: true}],
            '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/no-import-type-side-effects': 'error',
            '@typescript-eslint/array-type': ['error', {default: 'array-simple'}],
            '@typescript-eslint/max-params': ['error', {max: 10}],
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: ['variable', 'property'],
                    format: null,
                    // Allow __esModule because it is a well-known interop property injected by bundlers
                    // (e.g. Babel/Webpack) and sometimes required by library internals (e.g. react-native-skia).
                    filter: {
                        regex: '^__esModule$',
                        match: true,
                    },
                },
                {
                    selector: ['variable', 'property'],
                    format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
                    // This filter excludes variables and properties that start with "private_" to make them valid.
                    //
                    // Examples:
                    // - "private_a" → valid
                    // - "private_test" → valid
                    // - "private_" → not valid
                    filter: {
                        regex: '^private_[a-z][a-zA-Z0-9]*$',
                        match: false,
                    },
                },
                {
                    selector: 'function',
                    format: ['camelCase', 'PascalCase'],
                },
                {
                    selector: ['typeLike', 'enumMember'],
                    format: ['PascalCase'],
                },
                {
                    selector: ['parameter', 'method'],
                    format: ['camelCase', 'PascalCase'],
                    leadingUnderscore: 'allow',
                },
            ],
            '@typescript-eslint/no-restricted-types': [
                'error',
                {
                    types: {
                        object: "Use 'Record<string, T>' instead.",
                    },
                },
            ],
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    fixStyle: 'separate-type-imports',
                },
            ],
            '@typescript-eslint/consistent-type-exports': [
                'error',
                {
                    fixMixedExportsWithInlineTypeSpecifier: false,
                },
            ],
            '@typescript-eslint/no-use-before-define': ['error', {functions: false}],

            // ESLint core rules
            'es/no-nullish-coalescing-operators': 'off',
            'es/no-optional-chaining': 'off',
            '@typescript-eslint/no-deprecated': ['error', {allow: ['translateFn']}],
            'arrow-body-style': 'off',
            'no-continue': 'off',
            'no-empty': ['error', {allowEmptyCatch: true}],

            // Import specific rules
            'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
            'import/no-extraneous-dependencies': 'off',

            // Rulesdir specific rules
            'rulesdir/no-default-props': 'error',
            'rulesdir/prefer-type-fest': 'error',
            'rulesdir/prefer-underscore-method': 'off',
            'rulesdir/prefer-import-module-contents': 'off',
            'rulesdir/no-beta-handler': 'error',
            'rulesdir/require-live-region-for-status-updates': 'error',
            'rulesdir/require-a11y-disable-justification': 'error',
            'rulesdir/prefer-narrow-hook-dependencies': [
                'error',
                {
                    stableObjectPatterns: [
                        // cSpell:ignore tyles
                        '[Ss]tyles?$', // Excludes 'style', 'styles', 'themeStyles', etc.
                        '^theme', // Excludes 'theme', 'themeStyles', 'themeIllustrations', etc.
                        '[Ii]cons?$', // Excludes 'icon', 'icons', 'expensifyIcons', etc.
                    ],
                },
            ],
            'rulesdir/no-default-id-values': 'error',
            'rulesdir/no-unstable-hook-defaults': 'error',

            // React and React Native specific rules
            'react-native-a11y/has-accessibility-hint': 'off',
            'react-native-a11y/has-valid-accessibility-ignores-invert-colors': 'error',
            'react/require-default-props': 'off',
            'react/prop-types': 'off',
            'react/jsx-key': 'error',
            'react/jsx-no-constructed-context-values': 'error',
            'react/forbid-component-props': [
                'error',
                {
                    forbid: [
                        {
                            propName: 'fsClass',
                            allowedFor: ['View', 'Animated.View', 'Text', 'Pressable'],
                            message:
                                "The 'fsClass' prop doesn't work for custom components, only RN's View, Text and Pressable.\nPlease use the 'ForwardedFSClassProps' or 'MultipleFSClassProps' types to pass down the desired 'fsClass' value to the allowed components.",
                        },
                    ],
                },
            ],
            'react-native-a11y/has-valid-accessibility-descriptors': [
                'error',
                {
                    touchables: ['PressableWithoutFeedback', 'PressableWithFeedback'],
                },
            ],

            // Disallow usage of certain functions and imports
            'no-restricted-syntax': [
                'error',
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
                    selector: 'ImportNamespaceSpecifier[parent.source.value=/^@libs/]',
                    message: 'Namespace imports from @libs are not allowed. Use named imports instead. Example: import { method } from "@libs/module"',
                },
                {
                    selector: 'ImportNamespaceSpecifier[parent.source.value=/^@userActions/]',
                    message: 'Namespace imports from @userActions are not allowed. Use named imports instead. Example: import { action } from "@userActions/module"',
                },
                {
                    selector: 'ImportNamespaceSpecifier[parent.source.value=/^\\.\\./]',
                    message: 'Namespace imports from parent directories are not allowed. Use named imports instead. Example: import { method } from "../libs/module"',
                },
                {
                    selector: 'ImportNamespaceSpecifier[parent.source.value=/^\\./]',
                    message: 'Namespace imports from sibling modules are not allowed. Use named imports instead. Example: import { method } from "./libs/module"',
                },
                {
                    selector:
                        'JSXElement[openingElement.name.name=/^Pressable(WithoutFeedback|WithFeedback|WithDelayToggle|WithoutFocus)$/]:not(:has(JSXAttribute[name.name="sentryLabel"]))',
                    message: 'All Pressable components must include sentryLabel prop for Sentry tracking. Example: <PressableWithoutFeedback sentryLabel="MoreMenu-ExportFile" />',
                },

                // These are the original rules from AirBnB's style guide, modified to allow for...of loops and for...in loops
                {
                    selector: 'LabeledStatement',
                    message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
                },
                {
                    selector: 'WithStatement',
                    message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize. It is also deprecated.',
                },
            ],
            'no-restricted-properties': [
                'error',
                {
                    object: 'Image',
                    property: 'getSize',
                    message: 'Usage of Image.getSize is restricted. Please use the `react-native-image-size`.',
                },
                // Disallow direct HybridAppModule.isHybridApp() usage, because it requires a native call
                // Use CONFIG.IS_HYBRID_APP, which keeps cached value instead
                {
                    object: 'HybridAppModule',
                    property: 'isHybridApp',
                    message: 'Use CONFIG.IS_HYBRID_APP instead.',
                },
                // Prevent direct use of HybridAppModule.closeReactNativeApp().
                // Instead, use the `closeReactNativeApp` action from `@userActions/HybridApp`,
                // which correctly updates `hybridApp.closingReactNativeApp` when closing NewDot
                {
                    object: 'HybridAppModule',
                    property: 'closeReactNativeApp',
                    message: 'Use `closeReactNativeApp` from `@userActions/HybridApp` instead.',
                },
            ],
            'no-restricted-imports': [
                'error',
                {
                    paths: restrictedImportPaths,
                    patterns: restrictedImportPatterns,
                },
            ],

            // Other rules
            curly: 'error',
            'lodash/import-scope': ['error', 'method'],
            'prefer-regex-literals': 'off',
            'jsdoc/require-param': 'off',
            'jsdoc/require-param-type': 'off',
            'jsdoc/check-param-names': 'off',
            'jsdoc/check-tag-names': 'off',
            'jsdoc/check-types': 'off',
            'jsdoc/no-types': 'error',
            '@dword-design/import-alias/prefer-alias': [
                'error',
                {
                    alias: {
                        '@assets': './assets',
                        '@components': './src/components',
                        '@hooks': './src/hooks',
                        // This is needed up here, if not @libs/actions would take the priority
                        '@userActions': './src/libs/actions',
                        '@libs': './src/libs',
                        '@navigation': './src/libs/Navigation',
                        '@pages': './src/pages',
                        '@prompts': './prompts',
                        '@styles': './src/styles',
                        // This path is provide alias for files like `ONYXKEYS` and `CONST`.
                        '@src': './src',
                        '@github': './.github',
                    },
                },
            ],
        },
    },

    // Some rules became stricter or stopped working after upgrading to ESLint 9, so these configs adjust the rules to match the old behavior.
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
        rules: {
            // @typescript-eslint/lines-between-class-members was moved to @stylistic/eslint-plugin, so replaced with lines-between-class-members.
            'lines-between-class-members': 'error',
            '@typescript-eslint/lines-between-class-members': 'off',

            // Sometimes it's useful to include duplicate types for documentation purposes.
            '@typescript-eslint/no-duplicate-type-constituents': ['error', {ignoreUnions: true}],

            '@typescript-eslint/no-require-imports': 'off',

            // @typescript-eslint/no-throw-literal was removed, so replaced with no-throw-literal.
            'no-throw-literal': 'error',
            '@typescript-eslint/no-throw-literal': 'off',

            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    args: 'after-used',
                    caughtErrors: 'none',
                    ignoreRestSiblings: true,
                },
            ],
            '@typescript-eslint/prefer-find': 'off',
            '@typescript-eslint/prefer-includes': 'off',
            '@typescript-eslint/prefer-optional-chain': 'off',
            '@typescript-eslint/prefer-nullish-coalescing': [
                'error',
                {
                    ignoreIfStatements: true,
                    ignorePrimitives: {
                        // string: true,
                    },
                    ignoreTernaryTests: true,
                },
            ],

            // @typescript-eslint/prefer-promise-reject-errors enforces Promises are only rejected with Error objects, so replaced with prefer-promise-reject-errors.
            'prefer-promise-reject-errors': 'error',
            '@typescript-eslint/prefer-promise-reject-errors': 'off',

            '@typescript-eslint/prefer-regexp-exec': 'off',
        },
    },

    // Enforces every Onyx type and its properties to have a comment explaining its purpose.
    {
        files: ['src/types/onyx/**/*.ts'],
        rules: {
            'jsdoc/require-jsdoc': [
                'error',
                {
                    contexts: ['TSInterfaceDeclaration', 'TSTypeAliasDeclaration', 'TSPropertySignature'],
                },
            ],
        },
    },

    {
        files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
        ...typescriptEslint.configs.disableTypeChecked,
    },
    {
        files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
        rules: {
            'arrow-parens': 'off',
            'jsdoc/no-types': 'off',
            'react/jsx-filename-extension': 'off',
            'rulesdir/no-default-props': 'off',
            'prefer-arrow-callback': 'off',

            // Prefer Lodash helpers (and `import _ from 'lodash'`) in non-TS
            // files — they defensively handle nullish/non-array inputs that
            // TypeScript would otherwise catch at compile time.
            'lodash/import-scope': 'off',
        },
    },

    // Node.js ESM requires relative imports to include a file extension (unlike
    // bundled `.js`/`.ts`, which are resolved by webpack/metro). Relax the
    // airbnb-inherited `import/extensions` rule for `.mjs`/`.cjs` so it stops
    // flagging legitimate ESM imports like `import x from './foo.mjs'`.
    {
        files: ['**/*.mjs', '**/*.cjs'],
        rules: {
            'import/extensions': 'off',
        },
    },

    {
        files: ['**/en.ts', '**/es.ts'],
        rules: {
            'rulesdir/use-periods-for-error-messages': 'error',
        },
    },

    {
        files: ['**/*.ts', '**/*.tsx'],
        rules: {
            'rulesdir/prefer-at': 'error',
            'rulesdir/boolean-conditional-rendering': 'error',
        },
    },

    // `eslint-plugin-you-dont-need-lodash-underscore` steers code toward native
    // JS equivalents of Lodash helpers. In TypeScript we want that guidance
    // because TS catches the nullish/non-array edge cases Lodash papers over;
    // in plain JS we prefer the Lodash helpers, so this plugin is TS/TSX-only.
    {
        files: ['**/*.ts', '**/*.tsx'],
        extends: new FlatCompat({baseDirectory: projectRoot}).extends('plugin:you-dont-need-lodash-underscore/all'),
        plugins: {
            'you-dont-need-lodash-underscore': youDontNeedLodashUnderscore,
        },
        rules: {
            'you-dont-need-lodash-underscore/throttle': 'off',
            // The suggested alternative (structuredClone) is not supported in Hermes:https://github.com/facebook/hermes/issues/684
            'you-dont-need-lodash-underscore/clone-deep': 'off',
        },
    },

    {
        files: ['src/**/*.ts', 'src/**/*.tsx'],
        rules: {
            'rulesdir/prefer-locale-compare-from-context': 'error',
            'rulesdir/no-object-keys-includes': 'error',
        },
    },

    {
        files: ['.github/**/*', 'scripts/**/*'],
        rules: {
            // For all these Node.js scripts, we do not want to disable `console` statements
            'no-console': 'off',
        },
    },

    {
        files: ['.github/**/*', 'scripts/**/*', 'tests/**/*'],
        rules: {
            'no-await-in-loop': 'off',
            'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
        },
    },

    {
        files: ['.github/**/*'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['@src/**'],
                            message: 'Do not import files from src/ directory as they can break the GH Actions build script.',
                        },
                    ],
                },
            ],
        },
    },

    {
        files: ['tests/**/*'],
        rules: {
            'no-import-assign': 'off',

            // This helps disable the `prefer-alias` rule for tests
            '@dword-design/import-alias/prefer-alias': ['off'],

            'testing-library/await-async-queries': 'error',
            'testing-library/await-async-utils': 'error',
            'testing-library/no-debugging-utils': 'error',
            'testing-library/no-manual-cleanup': 'error',
            'testing-library/no-unnecessary-act': 'error',
            'testing-library/prefer-find-by': 'error',
            'testing-library/prefer-presence-queries': 'error',
            'testing-library/prefer-screen-queries': 'error',
        },
    },

    {
        files: ['src/libs/Navigation/types.ts'],
        rules: {
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'TSPropertySignature[key.name="backTo"]',
                    message:
                        'The `backTo` route param is deprecated. Do not add new `backTo` properties to screen param lists. Please look into the `How to remove backTo from URL` section in contributingGuides/NAVIGATION.md. and use alternative routing methods instead.',
                },
            ],
        },
    },

    {
        files: ['src/libs/ReportNameUtils.ts'],
        plugins: {'report-name-utils': reportNameUtilsPlugin},
        rules: {'report-name-utils/no-function-call-in-get-report-name': 'error'},
    },

    // Restrict `computeReportName` imports everywhere except the one file that
    // legitimately consumes it. This block overrides the main `no-restricted-imports`
    // for ts/tsx files, so we re-apply the main `restrictedImportPaths`/`restrictedImportPatterns`
    // here too (flat config is last-wins per rule, not additive).
    {
        files: ['**/*.ts', '**/*.tsx'],
        ignores: ['src/libs/actions/OnyxDerived/configs/reportAttributes.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    paths: restrictedImportPaths,
                    patterns: [...restrictedImportPatterns, ...restrictedReportNameImportPatterns],
                },
            ],
        },
    },

    {
        files: ['src/**/*'],
        ignores: ['src/languages/**', 'src/CONST/index.ts', 'src/NAICS.ts'],
        rules: {
            'max-lines': ['error', 4000],
        },
    },

    {
        files: ['modules/ExpensifyNitroUtils/src/**/*'],
        rules: {
            '@typescript-eslint/consistent-type-definitions': 'off',
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
        '.eslint-reports/**/*',
        'android/**/build/**/*',
        'docs/vendor/**/*',
        'docs/assets/**/*',
        'web/gtm.js',
        '**/.expo/**/*',
        '**/.rock/**/*',
        '**/.yalc/**/*',
        'src/libs/SearchParser/searchParser.js',
        'src/libs/SearchParser/autocompleteParser.js',
        'help/_scripts/**/*',
        'modules/ExpensifyNitroUtils/nitrogen/**/*',
        'Mobile-Expensify/**/*',
        '**/vendor',
        'modules/group-ib-fp/**/*',
        'web/snippets/gib.js',
        // Generated language files - excluded from ESLint but still type-checked
        'src/languages/de.ts',
        'src/languages/fr.ts',
        'src/languages/it.ts',
        'src/languages/ja.ts',
        'src/languages/nl.ts',
        'src/languages/pl.ts',
        'src/languages/pt-BR.ts',
        'src/languages/zh-hans.ts',
    ]),
]);

// Attach the App root as `basePath` to every config object. ESLint resolves
// `files`/`ignores` patterns relative to each config object's `basePath` (which
// defaults to the directory containing the config file). Since this config
// lives in `config/eslint/` rather than the App root, we override `basePath`
// so existing relative patterns (e.g. `src/**/*.ts`) keep matching the intended
// files. The spread preserves any `basePath` that a config already specifies.
export default config.map((cfg) => ({basePath: projectRoot, ...cfg}));
