import path from 'node:path';
import {fileURLToPath} from 'node:url';
import tseslint from 'typescript-eslint';

const here = path.dirname(fileURLToPath(import.meta.url));

// Consumer file only: the component file references the deprecated declaration, which both tools
// report and no manifest entry claims.
export default [
    {
        files: ['**/deprecatedSelfClosingJsx.tsx'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {projectService: true, tsconfigRootDir: path.join(here, '..', 'fixtures'), ecmaFeatures: {jsx: true}},
        },
        plugins: {'@typescript-eslint': tseslint.plugin},
        rules: {
            '@typescript-eslint/no-deprecated': 'error',
        },
    },
];
