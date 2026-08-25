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
 */
function DeferredImageWithLoading({containerStyles, onLayout, ...rest}: ImageWithSizeLoadingProps) {
    const styles = useThemeStyles();
    const screenStatus = useContext(ScreenWrapperStatusContext);
    const didScreenTransitionEnd = screenStatus?.didScreenTransitionEnd ?? true;

    if (!didScreenTransitionEnd) {
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
