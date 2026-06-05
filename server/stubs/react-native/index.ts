// Minimal `react-native` stub for the headless Bun renderer.
//
// `react-native`'s real entry pulls in Flow-typed sources, native module
// bindings, and Metro-resolved platform extensions that Bun cannot parse.
// Our headless `CartesianChart` path never mounts a real RN view tree, so we
// only need enough surface area for `victory-native` and `@shopify/react-native-skia`
// modules to load without throwing while we walk the headless branch.
//
// UI primitives are transparent pass-throughs so layout wrappers and label
// containers preserve the Skia subtree without mounting native views. Styles
// and layout callbacks are ignored.
import type {FunctionComponent, PropsWithChildren} from 'react';

const passThroughComponent: FunctionComponent<PropsWithChildren<unknown>> = ({children}) => children;

type LayoutChangeEvent = {nativeEvent: {layout: {x: number; y: number; width: number; height: number}}};
type ViewStyle = Record<string, unknown>;
type ImageStyle = Record<string, unknown>;
type TextStyle = Record<string, unknown>;
type StyleProp<T> = T | T[] | null | undefined | false;
type TransformsStyle = Record<string, unknown>;

type ImageResolvedAssetSource = {uri: string};

const View = passThroughComponent;

const Image = Object.assign(passThroughComponent, {
    resolveAssetSource: (source: unknown): ImageResolvedAssetSource => {
        if (source && typeof source === 'object' && 'uri' in source) {
            const {uri} = source as {uri: unknown};
            return {uri: String(uri)};
        }
        return {uri: String(source)};
    },
});

const Text = passThroughComponent;

const Platform = {
    OS: 'web' as const,
    Version: 0,
    select: <T>(specifics: {default?: T; web?: T}): T | undefined => specifics.web ?? specifics.default,
};

const PixelRatio = {
    get: () => 1,
    getFontScale: () => 1,
    getPixelSizeForLayoutSize: (size: number) => size,
    roundToNearestPixel: (size: number) => size,
};

const StyleSheet = {
    create: <T>(styles: T): T => styles,
    flatten: <T>(style: T): T => style,
    compose: <T>(a: T): T => a,
    hairlineWidth: 1,
    absoluteFill: {},
    absoluteFillObject: {},
};

const findNodeHandle = () => null;

// `@shopify/react-native-skia/lib/module/specs/NativeSkiaModule` does
// `TurboModuleRegistry.getEnforcing("RNSkiaModule")` at module load. The
// `Platform.OS === "web"` short-circuit in NativeSetup then ignores the
// missing module, but we still need the named export to exist.
const TurboModuleRegistry = {
    get: (): null => null,
    getEnforcing: (): null => null,
};

const AppRegistry = {
    registerComponent: () => {},
    runApplication: () => {},
};

const AppState = {
    addEventListener: () => ({remove: () => {}}),
    currentState: 'active',
};

const NativeModules = {};

const Dimensions = {
    get: () => ({width: 680, height: 530, scale: 1, fontScale: 1}),
};

export type {LayoutChangeEvent, ViewStyle, ImageStyle, TextStyle, StyleProp, TransformsStyle};
export {AppRegistry, AppState, Dimensions, NativeModules, View, Image, Text, Platform, PixelRatio, StyleSheet, findNodeHandle, TurboModuleRegistry};
