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
 */

import babel from '@babel/core';

const WORKLET_REFERENCE = /react-native-reanimated|react-native-worklets|worklet/i;

export default function workletsLoader(source) {
    if (!WORKLET_REFERENCE.test(source)) {
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
