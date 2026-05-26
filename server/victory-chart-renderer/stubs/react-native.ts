// Minimal `react-native` stub for the headless Bun renderer.
//
// `react-native`'s real entry pulls in Flow-typed sources, native module
// bindings, and Metro-resolved platform extensions that Bun cannot parse.
// Our headless `CartesianChart` path never mounts a real RN view tree, so we
// only need enough surface area for `victory-native` and `@shopify/react-native-skia`
// modules to load without throwing while we walk the headless branch.
//
// Anything that escapes into the render tree (e.g. `<View>`) renders to `null`
// so it cannot affect the Skia output.

import type {FunctionComponent, PropsWithChildren} from 'react';

const noopComponent: FunctionComponent<PropsWithChildren<unknown>> = () => null;

export type LayoutChangeEvent = {nativeEvent: {layout: {x: number; y: number; width: number; height: number}}};
export type ViewStyle = Record<string, unknown>;
export type ImageStyle = Record<string, unknown>;
export type TextStyle = Record<string, unknown>;
export type StyleProp<T> = T | T[] | null | undefined | false;
export type TransformsStyle = Record<string, unknown>;

export const View = noopComponent;
export const Image = Object.assign(noopComponent, {
    resolveAssetSource: (source: unknown) => {
        if (source && typeof source === 'object' && 'uri' in (source as Record<string, unknown>)) {
            return source as {uri: string};
        }
        return {uri: String(source)};
    },
});
export const Text = noopComponent;

export const Platform = {
    OS: 'web' as const,
    Version: 0,
    select: <T,>(specifics: {default?: T; web?: T}) => specifics.web ?? specifics.default,
};

export const PixelRatio = {
    get: () => 1,
    getFontScale: () => 1,
    getPixelSizeForLayoutSize: (size: number) => size,
    roundToNearestPixel: (size: number) => size,
};

export const StyleSheet = {
    create: <T,>(styles: T): T => styles,
    flatten: <T,>(style: T): T => style,
    compose: <T,>(a: T, _b: T): T => a,
    hairlineWidth: 1,
    absoluteFill: {},
    absoluteFillObject: {},
};

export const findNodeHandle = () => null;

// `@shopify/react-native-skia/lib/module/specs/NativeSkiaModule` does
// `TurboModuleRegistry.getEnforcing("RNSkiaModule")` at module load. The
// `Platform.OS === "web"` short-circuit in NativeSetup then ignores the
// missing module, but we still need the named export to exist.
export const TurboModuleRegistry = {
    get: (_name: string): null => null,
    getEnforcing: (_name: string): null => null,
};
