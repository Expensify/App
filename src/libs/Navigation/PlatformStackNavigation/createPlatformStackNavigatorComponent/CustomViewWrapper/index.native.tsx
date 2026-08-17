import DisplayContentsView from '@components/DisplayContentsView';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import type CustomViewWrapperProps from './types';

/**
 * Keeps hidden Activity content painted and takes it out of accessibility and touch handling while it is covered.
 *
 * The outer DisplayContentsView is the node React writes `display: none` to when it hides the Activity, and its view
 * config rewrites every such write to `display: contents`. That node is layout-transparent, so the inner View is the
 * one that fills the screen and carries the flags. A `display: contents` node has no box to hit test and nothing to
 * expose to the accessibility tree. The flags have to be part of the rendered output, because a hidden Activity runs
 * no effects.
 */
function CustomViewWrapper({inert, children}: CustomViewWrapperProps) {
    const styles = useThemeStyles();

    return (
        <DisplayContentsView>
            <View
                aria-hidden={inert}
                style={[styles.flex1, {pointerEvents: inert ? 'none' : 'box-none'}]}
                collapsable={false}
            >
                {children}
            </View>
        </DisplayContentsView>
    );
}

export default CustomViewWrapper;
