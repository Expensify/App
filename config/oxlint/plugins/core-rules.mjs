// no-invalid-this is left out although ESLint enables it: it calls sourceCode.getJSDocComment, which
// oxlint's bridge throws on as unsupported.
import {builtinRules} from 'eslint/use-at-your-own-risk';

import {withEslintDirectiveIdsFor} from '../eslintDirectives.mjs';

const NAMES = [
    'no-restricted-syntax',
    'no-unreachable-loop',
    'lines-between-class-members',
    'no-octal',
    'no-octal-escape',
    'no-undef-init',
    'strict',
    'dot-notation',
    'no-dupe-args',
    'no-return-await',
];

const plugin = {
    meta: {
        name: 'core',
        version: '0.0.1',
    },
    rules: withEslintDirectiveIdsFor(Object.fromEntries(NAMES.map((name) => [name, builtinRules.get(name)])), (name) => name),
};

export default plugin;
