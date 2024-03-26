const restrictedImportPaths = [
    {
        name: 'react-native',
        importNames: ['useWindowDimensions', 'StatusBar', 'TouchableOpacity', 'TouchableWithoutFeedback', 'TouchableNativeFeedback', 'TouchableHighlight', 'Pressable', 'Text', 'ScrollView'],
        message: [
            '',
            "For 'useWindowDimensions', please use 'src/hooks/useWindowDimensions' instead.",
            "For 'TouchableOpacity', 'TouchableWithoutFeedback', 'TouchableNativeFeedback', 'TouchableHighlight', 'Pressable', please use 'PressableWithFeedback' and/or 'PressableWithoutFeedback' from 'src/components/Pressable' instead.",
            "For 'StatusBar', please use 'src/libs/StatusBar' instead.",
            "For 'Text', please use '@components/Text' instead.",
            "For 'ScrollView', please use '@components/ScrollView' instead.",
        ].join('\n'),
    },
    {
        name: 'react-native-gesture-handler',
        importNames: ['TouchableOpacity', 'TouchableWithoutFeedback', 'TouchableNativeFeedback', 'TouchableHighlight'],
        message: "Please use 'PressableWithFeedback' and/or 'PressableWithoutFeedback' from 'src/components/Pressable' instead.",
    },
    {
        name: 'awesome-phonenumber',
        importNames: ['parsePhoneNumber'],
        message: "Please use '@libs/PhoneNumber' instead.",
    },
    {
        name: 'react-native-safe-area-context',
        importNames: ['useSafeAreaInsets', 'SafeAreaConsumer', 'SafeAreaInsetsContext'],
        message: "Please use 'useSafeAreaInsets' from 'src/hooks/useSafeAreaInset' and/or 'SafeAreaConsumer' from 'src/components/SafeAreaConsumer' instead.",
    },
    {
        name: 'react',
        importNames: ['CSSProperties'],
        message: "Please use 'ViewStyle', 'TextStyle', 'ImageStyle' from 'react-native' instead.",
    },
    {
        name: '@styles/index',
        importNames: ['default', 'defaultStyles'],
        message: 'Do not import styles directly. Please use the `useThemeStyles` hook or `withThemeStyles` HOC instead.',
    },
    {
        name: '@styles/utils',
        importNames: ['default', 'DefaultStyleUtils'],
        message: 'Do not import StyleUtils directly. Please use the `useStyleUtils` hook or `withStyleUtils` HOC instead.',
    },
    {
        name: '@styles/theme',
        importNames: ['default', 'defaultTheme'],

        message: 'Do not import themes directly. Please use the `useTheme` hook or `withTheme` HOC instead.',
    },
    {
        name: '@styles/theme/illustrations',
        message: 'Do not import theme illustrations directly. Please use the `useThemeIllustrations` hook instead.',
    },
    {
        name: 'date-fns/locale',
        message: "Do not import 'date-fns/locale' directly. Please use the submodule import instead, like 'date-fns/locale/en-GB'.",
    },
];

const restrictedImportPatterns = [
    {
        group: ['**/assets/animations/**/*.json'],
        message: "Do not import animations directly. Please use the 'src/components/LottieAnimations' import instead.",
    },
    {
        group: ['@styles/theme/themes/**'],
        message: 'Do not import themes directly. Please use the `useTheme` hook or `withTheme` HOC instead.',
    },
    {
        group: ['@styles/utils/**', '!@styles/utils/FontUtils', '!@styles/utils/types'],
        message: 'Do not import style util functions directly. Please use the `useStyleUtils` hook or `withStyleUtils` HOC instead.',
    },
    {
        group: ['@styles/theme/illustrations/themes/**'],
        message: 'Do not import theme illustrations directly. Please use the `useThemeIllustrations` hook instead.',
    },
];

module.exports = {
    extends: ['expensify', 'plugin:storybook/recommended', 'plugin:react-native-a11y/basic', 'plugin:@dword-design/import-alias/recommended', 'prettier'],
    plugins: ['react-native-a11y'],
    parser: 'babel-eslint',
    ignorePatterns: ['!.*', 'src/vendor', '.github/actions/**/index.js', 'desktop/dist/*.js', 'dist/*.js', 'node_modules/.bin/**', 'node_modules/.cache/**', '.git/**'],
    env: {
        jest: true,
    },
    globals: {
        __DEV__: 'readonly',
    },
    overrides: [
        {
            files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
            plugins: ['react'],
            rules: {
                'prefer-regex-literals': 'off',
                'rulesdir/no-multiple-onyx-in-file': 'off',
                'rulesdir/onyx-props-must-have-default': 'off',
                'react-native-a11y/has-accessibility-hint': ['off'],
                'react/jsx-no-constructed-context-values': 'error',
                'react-native-a11y/has-valid-accessibility-descriptors': [
                    'error',
                    {
                        touchables: ['PressableWithoutFeedback', 'PressableWithFeedback'],
                    },
                ],
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
        },
        // This helps disable the `prefer-alias` rule to be enabled for specific directories
        {
            files: ['tests/**/*.js', 'tests/**/*.ts', 'tests/**/*.jsx', 'assets/**/*.js', '.storybook/**/*.js'],
            rules: {'@dword-design/import-alias/prefer-alias': ['off']},
        },
        {
            files: ['*.js', '*.jsx'],
            settings: {
                'import/resolver': {
                    node: {
                        extensions: ['.js', '.website.js', '.desktop.js', '.native.js', '.ios.js', '.android.js', '.config.js', '.ts', '.tsx'],
                    },
                },
            },
            rules: {
                'import/extensions': [
                    'error',
                    'ignorePackages',
                    {
                        js: 'never',
                        jsx: 'never',
                        ts: 'never',
                        tsx: 'never',
                    },
                ],
                'no-restricted-imports': [
                    'error',
                    {
                        paths: restrictedImportPaths,
                        patterns: restrictedImportPatterns,
                    },
                ],
                curly: 'error',
                'react/display-name': 'error',
            },
        },
        {
            files: ['*.ts', '*.tsx'],
            extends: [
                'airbnb-typescript',
                'plugin:@typescript-eslint/recommended-type-checked',
                'plugin:@typescript-eslint/stylistic-type-checked',
                'plugin:you-dont-need-lodash-underscore/all',
                'prettier',
            ],
            plugins: ['@typescript-eslint', 'jsdoc', 'you-dont-need-lodash-underscore'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: './tsconfig.json',
            },
            rules: {
                // TODO: Remove the following rules after TypeScript migration is complete.
                '@typescript-eslint/no-unsafe-argument': 'off',
                '@typescript-eslint/no-unsafe-call': 'off',
                '@typescript-eslint/no-unsafe-member-access': 'off',
                '@typescript-eslint/no-unsafe-assignment': 'off',

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
                '@typescript-eslint/array-type': ['error', {default: 'array-simple'}],
                '@typescript-eslint/prefer-enum-initializers': 'error',
                '@typescript-eslint/no-var-requires': 'off',
                '@typescript-eslint/no-non-null-assertion': 'error',
                '@typescript-eslint/switch-exhaustiveness-check': 'error',
                '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
                '@typescript-eslint/no-floating-promises': 'off',
                '@typescript-eslint/consistent-type-imports': [
                    'error',
                    {
                        prefer: 'type-imports',
                        fixStyle: 'separate-type-imports',
                    },
                ],
                '@typescript-eslint/no-import-type-side-effects': 'error',
                '@typescript-eslint/consistent-type-exports': [
                    'error',
                    {
                        fixMixedExportsWithInlineTypeSpecifier: false,
                    },
                ],
                'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
                'es/no-nullish-coalescing-operators': 'off',
                'es/no-optional-chaining': 'off',
                'valid-jsdoc': 'off',
                'jsdoc/no-types': 'error',
                'rulesdir/no-default-props': 'error',
                'import/no-extraneous-dependencies': 'off',
                'rulesdir/prefer-underscore-method': 'off',
                'rulesdir/prefer-import-module-contents': 'off',
                'react/require-default-props': 'off',
                'react/prop-types': 'off',
                'no-restricted-syntax': [
                    'error',
                    {
                        selector: 'TSEnumDeclaration',
                        message: "Please don't declare enums, use union types instead.",
                    },
                ],
                'no-restricted-imports': [
                    'error',
                    {
                        paths: [
                            ...restrictedImportPaths,
                            {
                                name: 'underscore',
                                message: 'Please use the corresponding method from lodash instead',
                            },
                        ],
                        patterns: restrictedImportPatterns,
                    },
                ],
                curly: 'error',
                'you-dont-need-lodash-underscore/throttle': 'off',
            },
        },
        {
            files: ['workflow_tests/**/*.{js,jsx,ts,tsx}', 'tests/**/*.{js,jsx,ts,tsx}', '.github/**/*.{js,jsx,ts,tsx}'],
            rules: {
                '@lwc/lwc/no-async-await': 'off',
                'no-await-in-loop': 'off',
                'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
            },
        },
    ],
};
