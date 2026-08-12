import useRunAfterTransitions from '@hooks/useRunAfterTransitions';
import useThemeStyles from '@hooks/useThemeStyles';

import React, {useContext} from 'react';
import {View} from 'react-native';

import type {ImageWithSizeLoadingProps} from './ImageWithLoading';

import ImageWithLoading from './ImageWithLoading';
import ScreenWrapperStatusContext from './ScreenWrapper/ScreenWrapperStatusContext';

/**
 * Wrapper around ImageWithLoading that keeps the image out of the render passes happening during a screen's entry
 * transition: fetching, decoding and laying out an image competes with the animation, so the screen slides in with an
 * empty placeholder of the same size and the image mounts once the transition is over.
 *
 * The gate is the enclosing ScreenWrapper's `didScreenTransitionEnd`, not `useRunAfterTransitions(true)` alone: an
 * incoming screen's subtree mounts (and runs its effects) *before* React Navigation emits `transitionStart`, so at that
 * point TransitionTracker has no active transition and would let the image through immediately.
 *
 * On a screen that has already settled - a receipt arriving in an open chat - `didScreenTransitionEnd` is already true,
 * so the image mounts on the very next render with no perceptible delay.
 */
function DeferredImageWithLoading({containerStyles, onLayout, ...rest}: ImageWithSizeLoadingProps) {
    const styles = useThemeStyles();

    // Read the context directly rather than through `useScreenWrapperTransitionStatus`, which throws outside a
    // ScreenWrapper. There is no screen entry transition to wait for in that case, so don't hold the image back.
    const screenWrapperStatus = useContext(ScreenWrapperStatusContext);
    const didScreenTransitionEnd = screenWrapperStatus?.didScreenTransitionEnd ?? true;

    // Also wait out any transition still tracked once the screen has settled, e.g. an overlapping modal or keyboard one.
    const shouldRenderImage = useRunAfterTransitions(didScreenTransitionEnd);

    if (!shouldRenderImage) {
        return (
            <View
                style={[styles.w100, styles.h100, containerStyles]}
                onLayout={onLayout}
            />
        );
    }

    return (
        <ImageWithLoading
            containerStyles={containerStyles}
            onLayout={onLayout}
            {...rest}
        />
    );
}

export default DeferredImageWithLoading;
