/**
 * Thin wrapper around the upstream @fullstory/babel-plugin-annotate-react plugin, invoked directly via @babel/core rather than
 * going through babel-loader.
 *
 * With the `native` option it also runs @fullstory/babel-plugin-react-native, as the native babel config does for packages. Among
 * other things it adds a `nativeID` to every `<View fsClass>`, which keeps React Native from flattening the view away and dropping
 * its FullStory class.
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

    const isNative = !!this.getOptions().native;
    const callback = this.async();
    babel.transform(
        source,
        {
            babelrc: false,
            configFile: false,
            filename: this.resourcePath,
            plugins: [...(isNative ? ['@fullstory/babel-plugin-react-native'] : []), ['@fullstory/babel-plugin-annotate-react', {native: true, reactCompiler: true}]],
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
