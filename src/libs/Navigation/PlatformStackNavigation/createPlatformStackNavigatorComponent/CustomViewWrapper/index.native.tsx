import type {PropsWithChildren} from 'react';
import type {ViewStyle} from 'react-native';

import React from 'react';
import {NativeComponentRegistry, View} from 'react-native';
import ReactNativeStyleAttributes from 'react-native/Libraries/Components/View/ReactNativeStyleAttributes';

type DisplayContentsViewProps = PropsWithChildren<{style: ViewStyle}>;
type NativeComponentRegistryParams = Parameters<typeof NativeComponentRegistry.get<DisplayContentsViewProps>>;
type ViewConfigProvider = NativeComponentRegistryParams[1];

// The assertion is unavoidable here because the partial view config literal cannot be proven to match the
// full generated config type.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const VIEW_CONFIG = {
    uiViewClassName: 'RCTView',
    validAttributes: {
        style: {
            ...ReactNativeStyleAttributes,
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
const DisplayContentsView = NativeComponentRegistry.get<DisplayContentsViewProps>('CustomViewWrapper', () => VIEW_CONFIG);

/**
 * Wraps the painted content in the same pair of views react-navigation renders in its ActivityView: the outer one
 * neutralizes the hiding, the inner one carries the accessibility state. The accessibility props could have been
 * declared in the view config of the outer one instead, at the cost of one view per screen, but going through a
 * real View is what maps the single aria-hidden onto the right per-platform props.
 *
 * Content that stays painted also stays reachable for screen readers and for touches while its updates are
 * deferred, so the inner view takes that reachability away for as long as the screen is covered. A hidden Activity
 * runs no effects, so the flags have to be part of the rendered output rather than something an effect applies.
 * The pointer events come last, after the caller's style, because nothing passed in may weaken that guarantee.
 */
function CustomViewWrapper({style, inert, children}: PropsWithChildren<{style: ViewStyle; inert?: boolean}>) {
    return (
        <DisplayContentsView style={style}>
            <View
                aria-hidden={inert}
                style={[style, {pointerEvents: inert ? 'none' : 'box-none'}]}
                collapsable={false}
            >
                {children}
            </View>
        </DisplayContentsView>
    );
}

export default CustomViewWrapper;
