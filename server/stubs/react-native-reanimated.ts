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
// `export =` keeps CommonJS semantics so `require("react-native-reanimated")`
// returns the proxy directly from Bun.
import type {FunctionComponent, PropsWithChildren} from 'react';

type SharedValue<T> = {value: T};
type NoopFn = () => void;

const noopFn: NoopFn = () => undefined;

const passThroughComponent: FunctionComponent<PropsWithChildren<unknown>> = ({children}) => children;

const sharedValue = <T>(initialValue: T): SharedValue<T> => ({value: initialValue});

const namedExports = {
    __esModule: true as const,
    default: undefined as unknown,
    useSharedValue: sharedValue,
    useDerivedValue: <T>(updater: () => T): SharedValue<T> => ({value: updater()}),
    useAnimatedStyle: <T>(factory: () => T): T => factory(),
    useAnimatedReaction: noopFn,
    makeMutable: sharedValue,
    isSharedValue: (value: unknown): value is SharedValue<unknown> => typeof value === 'object' && value !== null && 'value' in value,
    runOnJS: <T extends NoopFn>(fn: T): T => fn,
    runOnUI: <T extends NoopFn>(fn: T): T => fn,
    withTiming: <T>(value: T): T => value,
    withSpring: <T>(value: T): T => value,
    withDecay: noopFn,
    withDelay: <T>(_delay: number, animation: T): T => animation,
    withRepeat: <T>(animation: T): T => animation,
    cancelAnimation: noopFn,
    Easing: {
        linear: () => 0,
        ease: () => 0,
        bezier: () => () => 0,
        inOut: (fn: () => number) => fn,
    },
    View: passThroughComponent,
    Image: passThroughComponent,
    Text: passThroughComponent,
    ScrollView: passThroughComponent,
};

type NamedExports = typeof namedExports;

const proxy = new Proxy(namedExports, {
    get(target, prop: string | symbol) {
        if (typeof prop === 'string' && prop in target) {
            return target[prop as keyof NamedExports];
        }
        return noopFn;
    },
}) as NamedExports & Record<string, NoopFn>;

namedExports.default = proxy;

export = proxy;
