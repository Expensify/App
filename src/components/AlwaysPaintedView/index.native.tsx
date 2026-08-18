import useThemeStyles from '@hooks/useThemeStyles';

import type {PropsWithChildren} from 'react';
import type {ViewStyle} from 'react-native';

import {NativeComponentRegistry, View} from 'react-native';
import ReactNativeStyleAttributes from 'react-native/Libraries/Components/View/ReactNativeStyleAttributes';

import type AlwaysPaintedViewProps from './types';

type NativeAlwaysPaintedViewProps = PropsWithChildren<{style: ViewStyle}>;
type ViewConfigProvider = Parameters<typeof NativeComponentRegistry.get<NativeAlwaysPaintedViewProps>>[1];
type StyleAttribute = true | {readonly diff?: (a: unknown, b: unknown) => boolean; readonly process?: (value: unknown) => unknown};

// The style already carries the value React would set while hiding the view, so hiding it dirties no Yoga node.
const DISPLAY_CONTENTS: ViewStyle = {display: 'contents'};

function getAlwaysPaintedViewConfig(): ReturnType<ViewConfigProvider> {
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
const NativeAlwaysPaintedView = NativeComponentRegistry.get<NativeAlwaysPaintedViewProps>('AlwaysPaintedView', getAlwaysPaintedViewConfig);

/**
 * Native implementation that renders with `display: 'contents'` so wrapper nodes don't hide the navigation
 * underlay during swipe-back or Activity visibility toggles. Web pins the same value on a div (see index.tsx).
 *
 * A `display: contents` node has no box to hit test and nothing to expose to the accessibility tree, so `inert`
 * needs a node of its own. That node is the one that fills the screen, and it only exists for callers that pass
 * the prop. The flags have to be part of the rendered output, because a hidden Activity runs no effects.
 */
function AlwaysPaintedView({inert, children}: AlwaysPaintedViewProps) {
    const styles = useThemeStyles();

    return (
        <NativeAlwaysPaintedView style={DISPLAY_CONTENTS}>
            {inert === undefined ? (
                children
            ) : (
                <View
                    aria-hidden={inert}
                    style={[styles.flex1, {pointerEvents: inert ? 'none' : 'box-none'}]}
                    collapsable={false}
                >
                    {children}
                </View>
            )}
        </NativeAlwaysPaintedView>
    );
}

export {getAlwaysPaintedViewConfig};
export default AlwaysPaintedView;
