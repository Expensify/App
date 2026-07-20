import type {PropsWithChildren} from 'react';
import type {ViewStyle} from 'react-native';

import {NativeComponentRegistry} from 'react-native';
// @ts-expect-error No declaration file for this internal React Native module
import ReactNativeStyleAttributes from 'react-native/Libraries/Components/View/ReactNativeStyleAttributes';

type NativeComponentRegistryParams = Parameters<typeof NativeComponentRegistry.get<PropsWithChildren<{style: ViewStyle}>>>;
type ViewConfigProvider = NativeComponentRegistryParams[1];

const VIEW_CONFIG = {
    uiViewClassName: 'RCTView',
    validAttributes: {
        style: {
            ...(ReactNativeStyleAttributes as Record<string, unknown>),
            display: {
                process: () => 'contents',
            },
        },
    },
} as ReturnType<ViewConfigProvider>;

/**
 * Keeps the underlay visible during swipe-back gestures on mobile, preventing a blank screen flash
 * while navigating between screens. Uses internal RN APIs (NativeComponentRegistry,
 * ReactNativeStyleAttributes) — validated with RN 0.83.1. Re-verify after upgrades.
 */
const CustomViewWrapper = NativeComponentRegistry.get<PropsWithChildren<{style: ViewStyle}>>('CustomViewWrapper', () => VIEW_CONFIG);

type CustomViewWrapperProps = PropsWithChildren<{
    style?: ViewStyle;
}>;

function CustomViewWrapperComponent({children, style}: CustomViewWrapperProps) {
    return <CustomViewWrapper style={style ?? {}}>{children}</CustomViewWrapper>;
}

export default CustomViewWrapperComponent;
