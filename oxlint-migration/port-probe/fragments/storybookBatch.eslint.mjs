import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const packageJsonLocation = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../package.json');
// By bare specifier, not by absolute path: a directory require ignores the package's `exports` map
// and this package ships no `main`, so only the specifier resolves. Same reason
// config/oxlint/plugins/hosted-rules.mjs falls back to one.
const storybook = require('eslint-plugin-storybook');

const plugin = (mod) => ({rules: (mod?.rules ?? mod?.default?.rules) || {}});

// One block per fixture rather than one for the batch: several of these rules fire on the *absence*
// of something (no default export, no story export), so a fixture that proves one of them would
// trip the others as a side effect.
export default [
    {
        // Registered once, for every fixture in the batch: ESLint 9 rejects a second config object
        // that defines a plugin name already taken.
        files: ['**/sb*.stories.tsx', '**/sbMain.ts'],
        plugins: {storybook: plugin(storybook)},
    },
    {
        files: ['**/sbTitleBatch.stories.tsx'],
        rules: {
            'storybook/hierarchy-separator': 'error',
            'storybook/no-redundant-story-name': 'error',
            'storybook/prefer-pascal-case': 'error',
        },
    },
    {
        files: ['**/sbNoDefault.stories.tsx'],
        rules: {'storybook/default-exports': 'error'},
    },
    {
        files: ['**/sbNoStories.stories.tsx'],
        rules: {'storybook/story-exports': 'error'},
    },
    {
        files: ['**/sbRenderer.stories.tsx'],
        rules: {'storybook/no-renderer-packages': 'error'},
    },
    {
        files: ['**/sbPlay.stories.tsx'],
        rules: {
            'storybook/context-in-play-function': 'error',
            'storybook/use-storybook-expect': 'error',
            'storybook/use-storybook-testing-library': 'error',
        },
    },
    {
        files: ['**/sbAwait.stories.tsx'],
        rules: {'storybook/await-interactions': 'error'},
    },
    {
        files: ['**/sbMain.ts'],
        // The rule reads package.json off disk rather than the AST, and the harness runs from
        // port-probe/, which has none. Both tools have to be pointed at the same one.
        rules: {'storybook/no-uninstalled-addons': ['error', {packageJsonLocation}]},
    },
    {
        files: ['**/sbRequireJsdoc.ts'],
        rules: {'jsdoc/require-jsdoc': ['error', {contexts: ['TSInterfaceDeclaration', 'TSTypeAliasDeclaration']}]},
    },
];
