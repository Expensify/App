import tseslint from 'typescript-eslint';

// Scoped to this batch's fixture. Production enables all twelve bare "error", so no options here.
// No `plugins` block: the base config already registers `react-native-a11y`, loaded through
// createRequire on an absolute node_modules path, for every **/*.tsx -- and ESLint 9 rejects a
// second declaration of the same plugin name ("Cannot redefine plugin") even when it is the same
// instance. This shard therefore only turns rules on, which is also the single-instance guarantee.
export default [
    {
        files: ['**/a11yNpmBatch.tsx'],
        languageOptions: {parser: tseslint.parser, parserOptions: {ecmaFeatures: {jsx: true}}},
        rules: {
            'react-native-a11y/has-accessibility-props': 'error',
            'react-native-a11y/has-valid-accessibility-actions': 'error',
            'react-native-a11y/has-valid-accessibility-component-type': 'error',
            'react-native-a11y/has-valid-accessibility-ignores-invert-colors': 'error',
            'react-native-a11y/has-valid-accessibility-live-region': 'error',
            'react-native-a11y/has-valid-accessibility-role': 'error',
            'react-native-a11y/has-valid-accessibility-state': 'error',
            'react-native-a11y/has-valid-accessibility-states': 'error',
            'react-native-a11y/has-valid-accessibility-traits': 'error',
            'react-native-a11y/has-valid-accessibility-value': 'error',
            'react-native-a11y/has-valid-important-for-accessibility': 'error',
            'react-native-a11y/no-nested-touchables': 'error',
        },
    },
];
