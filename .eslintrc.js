const path = require('path');

const restrictedImportPaths = [
    {
        name: 'react-native',
        importNames: ['useWindowDimensions', 'StatusBar', 'TouchableOpacity', 'TouchableWithoutFeedback', 'TouchableNativeFeedback', 'TouchableHighlight', 'Pressable', 'Text', 'ScrollView'],
        message: [
            '',
            "For 'useWindowDimensions', please use '@src/hooks/useWindowDimensions' instead.",
            "For 'TouchableOpacity', 'TouchableWithoutFeedback', 'TouchableNativeFeedback', 'TouchableHighlight', 'Pressable', please use 'PressableWithFeedback' and/or 'PressableWithoutFeedback' from '@components/Pressable' instead.",
            "For 'StatusBar', please use '@libs/StatusBar' instead.",
            "For 'Text', please use '@components/Text' instead.",
            "For 'ScrollView', please use '@components/ScrollView' instead.",
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
];

const restrictedImportPatterns = [
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

module.exports = {
    extends: [
        'expensify',
        'airbnb-typescript',
        'plugin:storybook/recommended',
        'plugin:react-native-a11y/basic',
        'plugin:@dword-design/import-alias/recommended',
        'plugin:@typescript-eslint/recommended-type-checked',
        'plugin:@typescript-eslint/stylistic-type-checked',
        'plugin:you-dont-need-lodash-underscore/all',
        'plugin:prettier/recommended',
    ],
    plugins: ['@typescript-eslint', 'jsdoc', 'you-dont-need-lodash-underscore', 'react-native-a11y', 'react', 'testing-library', 'eslint-plugin-react-compiler', 'lodash'],
    ignorePatterns: ['lib/**'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: path.resolve(__dirname, './tsconfig.json'),
    },
    env: {
        jest: true,
    },
    globals: {
        __DEV__: 'readonly',
    },
    rules: {
        // TypeScript specific rules
        '@typescript-eslint/prefer-enum-initializers': 'error',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-import-type-side-effects': 'error',
        '@typescript-eslint/array-type': ['error', {default: 'array-simple'}],
        '@typescript-eslint/naming-convention': [
            'error',
            {
                selector: ['variable', 'property'],
                format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
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
        '@typescript-eslint/ban-types': [
            'error',
            {
                types: {
                    object: "Use 'Record<string, T>' instead.",
                },
                extendDefaults: true,
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

        // Import specific rules
        'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
        'import/no-extraneous-dependencies': 'off',

        // Rulesdir specific rules
        'rulesdir/no-default-props': 'error',
        'rulesdir/prefer-type-fest': 'error',
        'rulesdir/no-multiple-onyx-in-file': 'off',
        'rulesdir/prefer-underscore-method': 'off',
        'rulesdir/prefer-import-module-contents': 'off',

        // React and React Native specific rules
        'react-native-a11y/has-accessibility-hint': ['off'],
        'react/require-default-props': 'off',
        'react/prop-types': 'off',
        'react/jsx-no-constructed-context-values': 'error',
        'react-native-a11y/has-valid-accessibility-descriptors': [
            'error',
            {
                touchables: ['PressableWithoutFeedback', 'PressableWithFeedback'],
            },
        ],
        'react-compiler/react-compiler': 'error',

        // Disallow usage of certain functions and imports
        'no-restricted-syntax': [
            'error',
            {
                selector: 'TSEnumDeclaration',
                message: "Please don't declare enums, use union types instead.",
            },
        ],
        'no-restricted-properties': [
            'error',
            {
                object: 'Image',
                property: 'getSize',
                message: 'Usage of Image.getImage is restricted. Please use the `react-native-image-size`.',
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
        'you-dont-need-lodash-underscore/throttle': 'off',
        // The suggested alternative (structuredClone) is not supported in Hermes:https://github.com/facebook/hermes/issues/684
        'you-dont-need-lodash-underscore/clone-deep': 'off',
        'lodash/import-scope': ['error', 'method'],
        'prefer-regex-literals': 'off',
        'valid-jsdoc': 'off',
        'jsdoc/no-types': 'error',
        '@dword-design/import-alias/prefer-alias': [
            'warn',
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
                    '@styles': './src/styles',
                    // This path is provide alias for files like `ONYXKEYS` and `CONST`.
                    '@src': './src',
                    '@desktop': './desktop',
                    '@github': './.github',
                },
            },
        ],
    },

    overrides: [
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

        // Remove once no JS files are left
        {
            files: ['*.js', '*.jsx'],
            extends: ['plugin:@typescript-eslint/disable-type-checked'],
            rules: {
                '@typescript-eslint/prefer-nullish-coalescing': 'off',
                '@typescript-eslint/no-unsafe-return': 'off',
                '@typescript-eslint/unbound-method': 'off',
                'jsdoc/no-types': 'off',
                'react/jsx-filename-extension': 'off',
                'rulesdir/no-default-props': 'off',
            },
        },
        {
            files: ['en.ts', 'es.ts'],
            rules: {
                'rulesdir/use-periods-for-error-messages': 'error',
            },
        },
    ],
};
