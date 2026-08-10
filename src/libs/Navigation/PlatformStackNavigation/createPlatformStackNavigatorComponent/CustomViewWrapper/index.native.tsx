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

// Keeps children painted while React hides the surrounding subtree. A hidden <Activity> and a suspended tree
// (react-freeze) hide their nearest host views by committing display 'none' through the view config, so processing
// that attribute to always resolve to 'contents' neutralizes the hiding. This uses internal RN APIs and was
// validated with RN 0.83.1 on Fabric, so it needs re-verifying after upgrades.
const DisplayContentsView = NativeComponentRegistry.get<DisplayContentsViewProps>('CustomViewWrapper', () => VIEW_CONFIG);

// The style already carries the value the hiding would set, so a hide dirties no Yoga node and no native view is
// destroyed and created again.
const DISPLAY_CONTENTS: ViewStyle = {display: 'contents'};

/**
 * Renders the same pair of views react-navigation uses in its ActivityView. The outer one neutralizes the hiding,
 * the inner one takes the painted content out of accessibility and touch handling while the screen is covered. A
 * hidden Activity runs no effects, so these flags have to be part of the rendered output. The pointer events come
 * after the caller's style, so nothing passed in can weaken them.
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
