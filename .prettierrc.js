module.exports = {
    tabWidth: 4,
    singleQuote: true,
    trailingComma: 'all',
    bracketSpacing: false,
    arrowParens: 'always',
    printWidth: 190,
    singleAttributePerLine: true,
    plugins: [require.resolve('@trivago/prettier-plugin-sort-imports')],
    // Parser plugins to support TypeScript and JSX
    importOrderParserPlugins: ['typescript', 'jsx'],
    // Use modern 'with' syntax for import assertions
    importOrderImportAttributesKeyword: 'with',
    /** `importOrder` should be defined in an alphabetical order. */
    importOrder: [
        '@assets/(.*)$',
        '@components/(.*)$',
        '@github/(.*)$',
        '@hooks/(.*)$',
        '@libs/(.*)$',
        '@navigation/(.*)$',
        '@pages/(.*)$',
        '@prompts/(.*)$',
        '@scripts/(.*)$',
        '@styles/(.*)$',
        '@userActions/(.*)$',
        '@src/(.*)$',
        '^[./]',
    ],
    importOrderSortSpecifiers: true,
    importOrderCaseInsensitive: true,
};
