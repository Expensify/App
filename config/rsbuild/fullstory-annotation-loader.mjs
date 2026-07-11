/**
 * Thin wrapper around the upstream @fullstory/babel-plugin-annotate-react plugin, invoked directly via @babel/core rather than
 * going through babel-loader.
 *
 * Two pre-filters skip Babel entirely when a file cannot possibly contain JSX:
 *  - `.ts` files: TypeScript's grammar disallows JSX syntax outside `.tsx`, so this is a
 *    guaranteed-safe skip, not a heuristic. Measured across src/: 1722 of 3481 `.ts` files
 *    (49.5%) contain a literal `<` from generics/comparisons (e.g. `Record<K, V>`) and would
 *    otherwise be false positives for the check below — including all of src/languages/ and
 *    most of src/CONST/, some of the largest files in the repo.
 *  - All other extensions (.tsx, .jsx, .js): fall back to a `source.includes('<')` check, since
 *    JSX is legal in plain `.js` files too (verified: only 2 non-.jsx `.js` files exist in src/,
 *    both generated parsers with no JSX — but nothing enforces that going forward).
 */

import babel from '@babel/core';
import path from 'node:path';

export default function fullstoryAnnotationLoader(source) {
    const ext = path.extname(this.resourcePath);
    if (ext === '.ts') {
        return source;
    }
    if (!source.includes('<')) {
        return source;
    }

    const callback = this.async();
    babel.transform(
        source,
        {
            babelrc: false,
            configFile: false,
            filename: this.resourcePath,
            plugins: [['@fullstory/babel-plugin-annotate-react', {native: true}]],
            parserOpts: {plugins: ['jsx', 'typescript']},
            sourceMaps: !!this.sourceMap,
        },
        (error, result) => {
            if (error) {
                callback(error);
                return;
            }
            callback(null, result.code, result.map ?? undefined);
        },
    );
    return undefined;
}
