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
// - lines-between-class-members, no-undef-init, strict: no native port; oxlint's schema has
//                         no rule of any name that covers them
// - no-octal, no-octal-escape: no native port either, but oxc's parser already rejects both
//                         in ESM ("'0'-prefixed octal literals and octal escape sequences are
//                         deprecated"). They only add coverage in sloppy-mode script files,
//                         where the parser accepts the legacy syntax and nothing else looks.
//
// no-invalid-this is deliberately NOT here, even though ESLint enables it: its
// implementation reaches sourceCode.getJSDocComment (via astUtils.hasJSDocThisTag), which
// oxlint's bridge answers with `throw Error("...not supported at present (and deprecated)")`
// at node_modules/oxlint/dist/lint.js:5765. Measured: 36 files error out, plus 2 more from
// the code-path analyzer this rule needs. See obstacle #8 in the investigation.
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
    // plain-JS only, because ESLint switches these off for TS. No native oxlint rule of any name:
    // `dot-notation` exists natively only as `typescript/dot-notation` and `no-return-await` only
    // as `typescript/return-await`, both of which the plain-JS override turns off with the rest of
    // the typed rules.
    'dot-notation',
    'no-dupe-args',
    'no-return-await',
];

const plugin = {
    meta: {
        name: 'core',
        version: '0.0.1',
    },
    // A core rule's ESLint id is its bare name, so an existing `// eslint-disable-next-line
    // no-restricted-syntax` suppresses this copy too and needs no `core/` twin.
    rules: withEslintDirectiveIdsFor(Object.fromEntries(NAMES.map((name) => [name, builtinRules.get(name)])), (name) => name),
};

export default plugin;
