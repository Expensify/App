// Minimal `react-native-reanimated` stub for the headless Bun renderer.
//
// `victory-native`'s `CartesianChart` calls `useSharedValue` while rendering,
// and `@shopify/react-native-skia`'s `ReanimatedProxy` reads arbitrary
// properties off the module at load (`Rea.createWorkletRuntime`,
// `Rea.runOnRuntime`, etc.). Both must keep working without a real Reanimated
// runtime mounted.
//
// To handle both shapes uniformly, the module exports a Proxy. ES-style named
// imports (`import { useSharedValue } from ...`) read the proxy's own
// properties; default imports (`import Rea from ...`) get the same proxy,
// which falls back to a no-op function for any unknown property.
//
// This file is CommonJS so that Bun returns the proxy directly from
// `require("react-native-reanimated")`.
'use strict';

const noopFn = () => undefined;

const noopComponent = () => null;

const sharedValue = (initialValue) => ({value: initialValue});

const exports_ = {
    __esModule: true,
    default: undefined,
    useSharedValue: sharedValue,
    useDerivedValue: (updater) => ({value: updater()}),
    useAnimatedStyle: (factory) => factory(),
    useAnimatedReaction: noopFn,
    makeMutable: sharedValue,
    isSharedValue: (value) => typeof value === 'object' && value !== null && 'value' in value,
    runOnJS: (fn) => fn,
    runOnUI: (fn) => fn,
    withTiming: (value) => value,
    withSpring: (value) => value,
    withDecay: noopFn,
    withDelay: (_delay, animation) => animation,
    withRepeat: (animation) => animation,
    cancelAnimation: noopFn,
    Easing: {
        linear: () => 0,
        ease: () => 0,
        bezier: () => () => 0,
        inOut: (fn) => fn,
    },
    View: noopComponent,
    Image: noopComponent,
    Text: noopComponent,
    ScrollView: noopComponent,
};

const proxy = new Proxy(exports_, {
    get(target, prop) {
        if (prop in target) {
            return target[prop];
        }
        return noopFn;
    },
});

// Match Reanimated's runtime shape: `import Rea from "react-native-reanimated"`
// returns the same proxy as `import * as Rea`.
exports_.default = proxy;

module.exports = proxy;
