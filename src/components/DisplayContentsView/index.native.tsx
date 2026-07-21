/**
 * On native, renders with display: 'contents' so wrapper nodes don't hide the navigation underlay during
 * swipe-back or Activity visibility toggles. Web uses a plain View.
 */
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
 * Uses internal RN APIs (NativeComponentRegistry, ReactNativeStyleAttributes) — validated with RN 0.83.1.
 * Re-verify after upgrades.
 */
const NativeDisplayContentsView = NativeComponentRegistry.get<PropsWithChildren<{style: ViewStyle}>>('DisplayContentsView', () => VIEW_CONFIG);

type DisplayContentsViewProps = PropsWithChildren<{
    style?: ViewStyle;
}>;

function DisplayContentsView({children, style}: DisplayContentsViewProps) {
    return <NativeDisplayContentsView style={style ?? {}}>{children}</NativeDisplayContentsView>;
}

export default DisplayContentsView;
