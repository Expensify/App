import {builtinRules} from 'eslint/use-at-your-own-risk';
// Feasibility probe: can oxlint's jsPlugins host the ESLint rules that oxlint
// itself does not implement (or implements differently)?
//
// Every rule below is re-exported from the exact package ESLint already uses, so
// a parity run against ESLint tests the hosting mechanism, not a hand-written port.
// All rules are aliased under 'pp/' because oxlint reserves the real plugin names
// (react, import, jsdoc, eslint, ...) for its native implementations.
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const load = (id) => require(path.resolve(repoRoot, 'node_modules', id));

const react = load('eslint-plugin-react');
const importPlugin = load('eslint-plugin-import');
const jsdoc = load('eslint-plugin-jsdoc');
const expensify = (name) => require(path.resolve(repoRoot, 'node_modules/eslint-config-expensify/eslint-plugin-expensify', `${name}.js`));

const unwrap = (mod) => mod?.rules ?? mod?.default?.rules ?? {};

const plugin = {
    meta: {name: 'pp', version: '0.0.1'},
    rules: {
        // ESLint core
        'no-unreachable-loop': builtinRules.get('no-unreachable-loop'),
        // eslint-plugin-react
        'jsx-no-bind': unwrap(react)['jsx-no-bind'],
        'function-component-definition': unwrap(react)['function-component-definition'],
        'jsx-no-constructed-context-values': unwrap(react)['jsx-no-constructed-context-values'],
        // eslint-plugin-import
        'prefer-default-export': unwrap(importPlugin)['prefer-default-export'],
        order: unwrap(importPlugin).order,
        // eslint-plugin-jsdoc
        'no-types': unwrap(jsdoc)['no-types'],
        // Expensify rulesdir (no type info needed, unlike prefer-at / boolean-conditional-rendering)
        'no-inline-useOnyx-selector': expensify('no-inline-useOnyx-selector'),
    },
};

export default plugin;
