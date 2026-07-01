import React from 'react';
import {StyleSheet, View} from 'react-native';
import ImageSVG from '@components/ImageSVG';
import MultiGestureCanvas, {DEFAULT_ZOOM_RANGE} from '@components/MultiGestureCanvas';
import type {ContentSizedIconProps} from './types';
import useCanvasSize from './useCanvasSize';
import useIconCarouselPager from './useIconCarouselPager';

/** Renders an icon inside a multi-gesture canvas for pinch, pan, and swipe interactions. */
function MultiGestureIcon({testID, additionalStyles, src, contentSize, iconWidth, iconHeight, fill, isHovered, isPressed, contentFit}: ContentSizedIconProps) {
    const {canvasSize, isCanvasLoading, updateCanvasSize} = useCanvasSize();
    const {pagerRef, isScrollEnabled, onTap, onSwipeDown} = useIconCarouselPager();

    return (
        <View
            style={StyleSheet.absoluteFill}
            onLayout={updateCanvasSize}
        >
            {!isCanvasLoading && !!canvasSize && (
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
                    <View
                        testID={testID}
                        style={[additionalStyles]}
                    >
                        <ImageSVG
                            src={src}
                            width={iconWidth}
                            height={iconHeight}
                            fill={fill}
                            hovered={isHovered}
                            pressed={isPressed}
                            contentFit={contentFit}
                        />
                    </View>
                </MultiGestureCanvas>
            )}
        </View>
    );
}

export default MultiGestureIcon;
