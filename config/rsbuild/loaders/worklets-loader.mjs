/**
 * Thin wrapper around react-native-worklets/plugin that skips babel entirely for the ~97.5% of files that don't contain worklets.
 */

import babel from '@babel/core';

function referencesWorklet(source) {
    return source.includes('react-native-reanimated') || source.includes('worklet');
}

export default function workletsLoader(source, inputSourceMap) {
    if (!referencesWorklet(source)) {
        this.callback(null, source, inputSourceMap);
        return undefined;
    }

    const callback = this.async();
    babel.transform(
        source,
        {
            babelrc: false,
            configFile: false,
            filename: this.resourcePath,
            plugins: ['react-native-worklets/plugin'],
            sourceMaps: !!this.sourceMap,
            inputSourceMap: inputSourceMap ?? undefined,
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
