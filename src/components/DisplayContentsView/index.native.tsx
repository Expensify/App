import type {PropsWithChildren} from 'react';
import type {ViewStyle} from 'react-native';

import {NativeComponentRegistry} from 'react-native';
import ReactNativeStyleAttributes from 'react-native/Libraries/Components/View/ReactNativeStyleAttributes';

import type DisplayContentsViewProps from './types';

type NativeDisplayContentsViewProps = PropsWithChildren<{style: ViewStyle}>;
type ViewConfigProvider = Parameters<typeof NativeComponentRegistry.get<NativeDisplayContentsViewProps>>[1];
type StyleAttribute = true | {readonly diff?: (a: unknown, b: unknown) => boolean; readonly process?: (value: unknown) => unknown};

// The style already carries the value React would set while hiding the view, so hiding it dirties no Yoga node.
const DISPLAY_CONTENTS: ViewStyle = {display: 'contents'};

function getDisplayContentsViewConfig(): ReturnType<ViewConfigProvider> {
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
    };
}

/**
 * Native view registered with `display: 'contents'`.
 *
 * Uses internal RN APIs (NativeComponentRegistry, ReactNativeStyleAttributes) — validated with RN 0.85.3.
 * Re-verify after upgrades.
 */
const NativeDisplayContentsView = NativeComponentRegistry.get<NativeDisplayContentsViewProps>('DisplayContentsView', getDisplayContentsViewConfig);

/**
 * Native implementation that renders with `display: 'contents'` so wrapper nodes don't hide the navigation
 * underlay during swipe-back or Activity visibility toggles. Web pins the same value on a div (see index.tsx).
 *
 * The `inert` prop has no native counterpart, so callers that need it take the content out of accessibility and
 * touch handling on a node of their own.
 */
function DisplayContentsView({children}: DisplayContentsViewProps) {
    return <NativeDisplayContentsView style={DISPLAY_CONTENTS}>{children}</NativeDisplayContentsView>;
}

export {getDisplayContentsViewConfig};
export default DisplayContentsView;
