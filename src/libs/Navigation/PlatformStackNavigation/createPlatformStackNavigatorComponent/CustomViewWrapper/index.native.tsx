import type {PropsWithChildren} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {NativeComponentRegistry, View} from 'react-native';
import ReactNativeStyleAttributes from 'react-native/Libraries/Components/View/ReactNativeStyleAttributes';

type DisplayContentsViewProps = PropsWithChildren<{style: StyleProp<ViewStyle>}>;
type NativeComponentRegistryParams = Parameters<typeof NativeComponentRegistry.get<DisplayContentsViewProps>>;
type ViewConfigProvider = NativeComponentRegistryParams[1];

// The assertion is unavoidable, because a partial view config literal cannot be proven to match the full
// generated config type.
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

// Keeps children painted while React hides the surrounding subtree. A suspended tree (react-freeze) and a hidden
// <Activity> hide their nearest host views by committing display 'none' through the view config
// (cloneHiddenInstance on Fabric), so processing that attribute to always resolve to 'contents' neutralizes the
// hiding and keeps the underlay of a swipe-back gesture visible. This uses internal RN APIs and was validated with
// RN 0.83.1 on Fabric, where the component resolves by its registered name rather than by uiViewClassName, so it
// needs re-verifying after upgrades.
const DisplayContentsView = NativeComponentRegistry.get<DisplayContentsViewProps>('CustomViewWrapper', () => VIEW_CONFIG);

// The style already carries the value the hiding would set, so a hide changes nothing. Yoga dirties a node only
// when its style really changed (YogaLayoutableShadowNode::updateYogaProps), and 'contents' is also what flattens
// the view away, so every hide and reveal is spared a layout pass over the subtree and a native view being
// destroyed and created again.
const DISPLAY_CONTENTS: ViewStyle = {display: 'contents'};

/**
 * Wraps the painted content in the same pair of views react-navigation renders in its ActivityView. The outer one
 * neutralizes the hiding, the inner one carries the accessibility state, which could have been declared in the
 * outer view config instead, but going through a real View is what maps the single aria-hidden onto the right
 * per-platform props.
 *
 * Painted content stays reachable for screen readers and for touches, so the inner view takes that reachability
 * away while the screen is covered. A hidden Activity runs no effects, so the flags have to be part of the
 * rendered output. The pointer events come after the caller's style, because nothing passed in may weaken that
 * guarantee.
 */
function CustomViewWrapper({style, inert, children}: PropsWithChildren<{style: ViewStyle; inert?: boolean}>) {
    return (
        <DisplayContentsView style={[style, DISPLAY_CONTENTS]}>
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
