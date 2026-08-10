// Runs ESLint's own core rules inside oxlint, for the cases where oxlint either has no
// native implementation or ports one that behaves differently. The rule objects come
// straight from ESLint, so behaviour is identical by construction.
//
// 'eslint' is a reserved plugin name in oxlint, so these are aliased as 'core/<name>' —
// suppression comments need that id, e.g. the repo's same-line combo:
//     /* oxlint-disable-next-line core/no-restricted-syntax */ // eslint-disable-next-line no-restricted-syntax
//
// - no-restricted-syntax: oxlint has no native port (esquery selectors)
// - no-unreachable-loop:  oxlint's native port false-positives on multi-exit loops
//                         (src/libs/NavigationFocusReturn/index.ts), ESLint's does not
import {builtinRules} from 'eslint/use-at-your-own-risk';

const plugin = {
    meta: {
        name: 'core',
        version: '0.0.1',
    },
    rules: {
        'no-restricted-syntax': builtinRules.get('no-restricted-syntax'),
        'no-unreachable-loop': builtinRules.get('no-unreachable-loop'),
    },
};

export default plugin;
