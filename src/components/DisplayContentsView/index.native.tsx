import {NativeComponentRegistry} from 'react-native';
import ReactNativeStyleAttributes from 'react-native/Libraries/Components/View/ReactNativeStyleAttributes';

import type DisplayContentsViewProps from './types';

type ViewConfigProvider = Parameters<typeof NativeComponentRegistry.get<DisplayContentsViewProps>>[1];
type StyleAttribute = true | {readonly diff?: (a: unknown, b: unknown) => boolean; readonly process?: (value: unknown) => unknown};

/**
 * Native view registered with `display: 'contents'`.
 *
 * Uses internal RN APIs (NativeComponentRegistry, ReactNativeStyleAttributes) — validated with RN 0.83.1.
 * Re-verify after upgrades.
 */
const NativeDisplayContentsView = NativeComponentRegistry.get<DisplayContentsViewProps>('DisplayContentsView', () => {
    const styleAttributes: Record<string, StyleAttribute> = {
        ...ReactNativeStyleAttributes,
        display: {
            process: () => 'contents',
        },
    };

    return {
        uiViewClassName: 'RCTView',
        validAttributes: {
            style: styleAttributes,
        },
    } satisfies ReturnType<ViewConfigProvider>;
});

/**
 * Native implementation that renders with `display: 'contents'` so wrapper nodes don't hide the navigation
 * underlay during swipe-back or Activity visibility toggles. Web uses a plain View (see index.tsx).
 */
function DisplayContentsView({children, style}: DisplayContentsViewProps) {
    return <NativeDisplayContentsView style={style ?? {}}>{children}</NativeDisplayContentsView>;
}

export default DisplayContentsView;
