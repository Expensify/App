import path from 'node:path';
import {fileURLToPath} from 'node:url';
import tseslint from 'typescript-eslint';

const here = path.dirname(fileURLToPath(import.meta.url));

// Typed ESLint scope: projectService resolves to fixtures/tsconfig.json via tsconfigRootDir, the
// same nearest-tsconfig rule tsgolint follows on the oxlint side.
export default [
    {
        files: ['**/typedSample.ts'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {projectService: true, tsconfigRootDir: path.join(here, '..', 'fixtures'), ecmaFeatures: {jsx: true}},
        },
        plugins: {'@typescript-eslint': tseslint.plugin},
        rules: {
            '@typescript-eslint/no-floating-promises': 'error',
        },
    },
];
