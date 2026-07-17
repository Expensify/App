import type {PropsWithChildren} from 'react';
import type {ViewStyle} from 'react-native';

import {NativeComponentRegistry} from 'react-native';
// @ts-expect-error No declaration file for this internal React Native module
import ReactNativeStyleAttributes from 'react-native/Libraries/Components/View/ReactNativeStyleAttributes';

type NativeComponentRegistryParams = Parameters<typeof NativeComponentRegistry.get<PropsWithChildren<{style: ViewStyle}>>>;
type ViewConfigProvider = NativeComponentRegistryParams[1];

// Assertions are unavoidable here because ReactNativeStyleAttributes is an internal RN module without type
// declarations and the partial view config literal cannot be proven to match the full generated config type.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const VIEW_CONFIG = {
    uiViewClassName: 'RCTView',
    validAttributes: {
        style: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            ...(ReactNativeStyleAttributes as Record<string, unknown>),
            display: {
                process: () => 'contents',
            },
        },
    },
} as ReturnType<ViewConfigProvider>;

// Keeps children painted while React hides the surrounding subtree. Both a suspended tree (react-freeze) and a
// hidden <Activity> hide their nearest host views by committing display 'none' through the view config
// (cloneHiddenInstance on Fabric). Processing the display attribute to always resolve to 'contents' neutralizes
// that hiding, which keeps the underlay screen visible during swipe-back gestures and prevents a blank screen
// flash while navigating between screens. This module is native only and must be imported from .native files.
// Uses internal RN APIs (NativeComponentRegistry, ReactNativeStyleAttributes) - validated with RN 0.83.1. Re-verify after upgrades.
const CustomViewWrapper = NativeComponentRegistry.get<PropsWithChildren<{style: ViewStyle}>>('CustomViewWrapper', () => VIEW_CONFIG);

export default CustomViewWrapper;
