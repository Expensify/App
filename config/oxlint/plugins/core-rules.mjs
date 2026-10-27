/**
 * ESLint core rules that oxlint has no native version of. They run inside oxlint as a JS
 * plugin under the `core/` prefix, using ESLint's own rule code, so each one behaves as it does
 * under ESLint.
 *
 * This file only exposes the rules. Which files each one runs on is set in oxlint.config.mts, and
 * the scopes there copy ESLint:
 *
 * - dot-notation, no-return-await, no-dupe-args: JS files only. On TS files ESLint turns these off
 *   and runs the typed @typescript-eslint versions instead, which oxlint has natively.
 * - lines-between-class-members: TS files only, as in ESLint.
 * - no-restricted-syntax, no-octal, no-octal-escape, no-undef-init, strict: all files, as in ESLint.
 *
 * no-invalid-this is left out even though ESLint enables it. It calls sourceCode.getJSDocComment,
 * which oxlint's plugin bridge does not support.
 */
import {builtinRules} from 'eslint/use-at-your-own-risk';

import {withEslintDirectiveIDsFor} from '../eslintDirectives.mjs';

const NAMES = ['no-restricted-syntax', 'lines-between-class-members', 'no-octal', 'no-octal-escape', 'no-undef-init', 'strict', 'dot-notation', 'no-dupe-args', 'no-return-await'];

const plugin = {
    meta: {
        name: 'core',
        version: '0.0.1',
    },
    rules: withEslintDirectiveIDsFor(Object.fromEntries(NAMES.map((name) => [name, builtinRules.get(name)])), (name) => name),
};

export default plugin;
