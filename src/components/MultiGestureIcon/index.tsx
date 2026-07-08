import type {CommonIconProps, ContentSizedIcon} from '@components/Icon/primitives/types';
import ImageSVG from '@components/ImageSVG';
import MultiGestureCanvas, {DEFAULT_ZOOM_RANGE} from '@components/MultiGestureCanvas';

import React from 'react';
import {StyleSheet, View} from 'react-native';

import useCanvasSize from './useCanvasSize';
import useIconCarouselPager from './useIconCarouselPager';

/** Renders an icon inside a multi-gesture canvas for pinch, pan, and swipe interactions. */
function MultiGestureIcon({additionalStyles, src, contentSize, fill}: CommonIconProps & ContentSizedIcon) {
    const {canvasSize, updateCanvasSize} = useCanvasSize();
    const {pagerRef, isScrollEnabled, onTap, onSwipeDown} = useIconCarouselPager();

    if (!src) {
        return null;
    }

    return (
        <View
            style={StyleSheet.absoluteFill}
            onLayout={updateCanvasSize}
        >
            {!!canvasSize && (
                <MultiGestureCanvas
                    isActive
                    canvasSize={canvasSize}
                    contentSize={contentSize}
                    zoomRange={DEFAULT_ZOOM_RANGE}
                    pagerRef={pagerRef}
                    isUsedInCarousel={false}
                    isPagerScrollEnabled={isScrollEnabled}
                    onTap={onTap}
                    onSwipeDown={onSwipeDown}
                >
                    <View style={additionalStyles}>
                        <ImageSVG
                            src={src}
                            width={contentSize.width}
                            height={contentSize.height}
                            fill={fill}
                            contentFit="cover"
                        />
                    </View>
                </MultiGestureCanvas>
            )}
        </View>
    );
}

export default MultiGestureIcon;
