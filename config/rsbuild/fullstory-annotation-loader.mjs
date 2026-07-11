/**
 * Thin wrapper around the upstream @fullstory/babel-plugin-annotate-react plugin, invoked directly via @babel/core rather than
 * going through babel-loader.
 *
 * The pre-filter below (skip if the file contains no `<` at all, so it cannot possibly contain
 * JSX) is a cheap optimization to skip the ~28% of src/ files with no JSX.
 */

import babel from '@babel/core';

export default function fullstoryAnnotationLoader(source) {
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
