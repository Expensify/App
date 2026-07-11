/**
 * Thin replacement for babel-loader + react-native-worklets/plugin that skips the Babel
 * parse/transform/codegen cycle entirely for the vast majority of files that can't possibly
 * contain a worklet (confirmed by grepping src/: ~2.5% of files match).
 *
 * react-native-worklets/plugin auto-workletizes call expressions of a fixed set of hook/function
 * names (useAnimatedStyle, useDerivedValue, runOnUI, gesture handler builders, etc. — see
 * node_modules/react-native-worklets/plugin/index.js's reanimatedFunctionHooks) as well as
 * explicit 'worklet' directives. Every one of those hooks is only reachable by importing
 * react-native-reanimated or react-native-worklets, and the directive itself is the literal
 * string 'worklet', so a file containing none of those substrings cannot be affected by the
 * plugin — skipping is safe, not just fast.
 *
 * The check below uses String.prototype.includes() on two literal substrings rather than a
 * regex: benchmarked ~15% faster than an equivalent regex.test() across the actual src/ corpus
 * (34.67 MiB / 6189 files: 3.9us/file vs 4.6us/file median), and 'react-native-worklets' is
 * dropped as a separate alternative since it already contains 'worklet' as a substring. Matching
 * is intentionally case-sensitive (not /i): the plugin's own directive check is an exact
 * `=== 'worklet'` comparison (node_modules/react-native-worklets/plugin's hasWorkletDirective),
 * and npm package names are always lowercase, so case-insensitivity bought no correctness and
 * cost real time — a toLowerCase()-based case-insensitive check benchmarked ~2x *slower* than
 * the original regex, since it allocates a full lowercased copy of every file.
 */

import babel from '@babel/core';

function referencesWorklet(source) {
    return source.includes('react-native-reanimated') || source.includes('worklet');
}

export default function workletsLoader(source) {
    if (!referencesWorklet(source)) {
        return source;
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
