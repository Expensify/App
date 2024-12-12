module.exports = {
    plugins: ['@typescript-eslint', 'deprecation'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
    },
    rules: {
        'deprecation/deprecation': 'error',
        'no-restricted-syntax': [
            'error',
            {
                selector: "ImportNamespaceSpecifier[parent.source.value=/^@libs/]",
                message: 'Namespace imports are not allowed. Use named imports instead. Example: import { method } from "@libs/module"'
            },
            {
                selector: "ImportNamespaceSpecifier[parent.source.value=/^@userActions/]",
                message: 'Namespace imports from @userActions are not allowed. Use named imports instead. Example: import { action } from "@useractions/module"'
            }
        ]
    },
    overrides: [
        {
            files: ['**/libs/**/*.{ts,tsx,js,jsx}'],
            rules: {
                'no-restricted-syntax': [
                    'error',
                    {
                        selector: "ImportNamespaceSpecifier[parent.source.value=/^\\.\\./]",
                        message: 'Namespace imports are not allowed. Use named imports instead. Example: import { method } from "../libs/module"'
                    },
                    {
                        selector: "ImportNamespaceSpecifier[parent.source.value=/^\\./]", 
                        message: 'Namespace imports are not allowed. Use named imports instead. Example: import { method } from "./libs/module"'
                    },

                ]
            }
        }
    ]
};