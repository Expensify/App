/**
 * Thin wrapper around the upstream @fullstory/babel-plugin-annotate-react plugin, invoked directly via @babel/core rather than
 * going through babel-loader.
 *
 * It is an optimization. Two filters skip Babel entirely when a file cannot possibly contain JSX:
 *  - `.ts` files: TypeScript's grammar disallows JSX syntax outside `.tsx`
 *  - All other extensions (.tsx, .jsx, .js): fall back to a `source.includes('<')`, a quick check for JSX
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
            plugins: [['@fullstory/babel-plugin-annotate-react', {native: true, reactCompiler: true}]],
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
