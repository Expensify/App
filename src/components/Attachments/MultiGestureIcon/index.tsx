import ImageSVG from '@components/ImageSVG';
import MultiGestureCanvas, {DEFAULT_ZOOM_RANGE} from '@components/MultiGestureCanvas';

import useCanvasSize from '@hooks/useCanvasSize';

import type IconAsset from '@src/types/utils/IconAsset';
import type {Dimensions} from '@src/types/utils/Layout';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {StyleSheet, View} from 'react-native';

import useIconCarouselPager from './useIconCarouselPager';

type MultiGestureIconProps = {
    /** Additional styles applied to the icon wrapper. */
    additionalStyles: StyleProp<ViewStyle>;

    /** Icon asset to render. */
    src: IconAsset;

    /** Fill color passed to the SVG. */
    fill?: string;

    /** Intrinsic content size for gesture canvases. */
    contentSize: Dimensions;
};

/** Renders an icon inside a multi-gesture canvas for pinch, pan, and swipe interactions. */
function MultiGestureIcon({additionalStyles, src, contentSize, fill}: MultiGestureIconProps) {
    const {canvasSize, updateCanvasSize, isCanvasLoading} = useCanvasSize();
    const {pagerRef, isScrollEnabled, onTap, onSwipeDown} = useIconCarouselPager();

    return (
        <View
            style={StyleSheet.absoluteFill}
            onLayout={updateCanvasSize}
        >
            {!isCanvasLoading && (
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
                        />
                    </View>
                </MultiGestureCanvas>
            )}
        </View>
    );
}

export default MultiGestureIcon;
