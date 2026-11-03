import useThemeStyles from '@hooks/useThemeStyles';

import type {ViewProps, ViewStyle} from 'react-native';

import {NativeComponentRegistry, View} from 'react-native';
import ReactNativeStyleAttributes from 'react-native/Libraries/Components/View/ReactNativeStyleAttributes';

import type AlwaysPaintedViewProps from './types';

// RN declares the view config types but does not export them, so they are read back off the registry signature.
type ViewConfigProvider = Parameters<typeof NativeComponentRegistry.get>[1];
type AlwaysPaintedViewConfig = ReturnType<ViewConfigProvider>;
type StyleAttributes = NonNullable<NonNullable<AlwaysPaintedViewConfig['validAttributes']>['style']>;

// The style already carries the value React would set while hiding the view, so hiding it dirties no Yoga node.
const DISPLAY_CONTENTS: ViewStyle = {display: 'contents'};

function getAlwaysPaintedViewConfig() {
    const styleAttributes: StyleAttributes = {
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
    } satisfies AlwaysPaintedViewConfig;
}

/**
 * Native view registered with `display: 'contents'`.
 *
 * Uses internal RN APIs (NativeComponentRegistry, ReactNativeStyleAttributes) - validated with RN 0.85.3.
 * Re-verify after upgrades.
 */
const NativeAlwaysPaintedView = NativeComponentRegistry.get<ViewProps>('AlwaysPaintedView', getAlwaysPaintedViewConfig);

/**
 * Native implementation that renders with `display: 'contents'` so wrapper nodes don't hide the navigation
 * underlay during swipe-back or Activity visibility toggles. Web pins the same value on a div (see index.tsx).
 *
 * A `display: contents` node has no box to hit test and nothing to expose to the accessibility tree, so `inert`
 * needs a node of its own. That node always renders, so toggling the prop never changes the tree shape and the
 * children keep their state. The flags have to be part of the rendered output, because a hidden Activity runs
 * no effects.
 */
function AlwaysPaintedView({inert = false, children}: AlwaysPaintedViewProps) {
    const styles = useThemeStyles();

    return (
        <NativeAlwaysPaintedView style={DISPLAY_CONTENTS}>
            <View
                aria-hidden={inert}
                // The shared `pointerEventsBoxNone` style is an empty object on native, so the value is set as a prop.
                pointerEvents={inert ? 'none' : 'box-none'}
                style={styles.flex1}
                collapsable={false}
            >
                {children}
            </View>
        </NativeAlwaysPaintedView>
    );
}

export {getAlwaysPaintedViewConfig};
export default AlwaysPaintedView;
